import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

const GC_BASE_URL =
  Deno.env.get("GOCARDLESS_BASE_URL") ?? "https://api.gocardless.com";

function getAdminClient() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  const key = secretKeys
    ? JSON.parse(secretKeys)["default"]
    : Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function verifyHmac(rawBody: string, signature: string): Promise<boolean> {
  const secret = Deno.env.get("GOCARDLESS_WEBHOOK_SECRET")!;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sigBytes = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
  const computed = Array.from(new Uint8Array(sigBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const a = enc.encode(computed);
  const b = enc.encode(signature.toLowerCase());
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

async function gcGet(path: string) {
  const res = await fetch(`${GC_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${Deno.env.get("GOCARDLESS_ACCESS_TOKEN")!}`,
      "GoCardless-Version": "2015-07-06",
    },
  });
  if (!res.ok) throw new Error(`GC GET ${path} → ${res.status}`);
  return res.json();
}

// POST to GoCardless with an Idempotency-Key. GoCardless guarantees that two
// requests carrying the same key create at most one resource: a duplicate key
// returns 409 with the id of the resource the first request created. This makes
// resource creation safe under webhook redelivery AND concurrent delivery.
async function gcPostIdempotent(
  path: string,
  body: unknown,
  idempotencyKey: string,
): Promise<{ conflictId: string | null; data: unknown }> {
  const res = await fetch(`${GC_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("GOCARDLESS_ACCESS_TOKEN")!}`,
      "Content-Type": "application/json",
      "GoCardless-Version": "2015-07-06",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 409) {
    const errJson = await res.json().catch(() => null);
    const conflictId: string | null =
      errJson?.error?.errors?.[0]?.links?.conflicting_resource_id ?? null;
    if (!conflictId) {
      throw new Error(`GC POST ${path} → 409 without conflicting_resource_id`);
    }
    return { conflictId, data: null };
  }

  if (!res.ok) throw new Error(`GC POST ${path} → ${res.status}: ${await res.text()}`);
  return { conflictId: null, data: await res.json() };
}

// Best-effort email. Never throws: a notification failure must not fail (and thus
// trigger a retry of) the financial event that sent it. Always awaited at call sites
// so the Edge isolate isn't frozen before the request is actually sent.
async function sendEmail(to: string, subject: string, html: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "hello@contact.treat-code.com", to, subject, html }),
    });
    if (!res.ok) console.error("Resend error:", await res.text());
  } catch (err) {
    console.error("Resend send failed:", err instanceof Error ? err.message : err);
  }
}

function subscriptionStartDate(): string {
  // Spec §2.4: date_trunc('month', current_date + interval '35 days') — the 1st of
  // the month CONTAINING today+35 days. The previous version took the 1st of the
  // month AFTER that, pushing every subscription a month late and out of sync with
  // the "Monthly from [date]" the user is shown on the setup screen.
  const now = new Date();
  const plus35 = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 35,
  ));
  const first = new Date(Date.UTC(plus35.getUTCFullYear(), plus35.getUTCMonth(), 1));
  return first.toISOString().split("T")[0];
}

function poundsDisplay(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

// Resolve which user a payment belongs to, and which of OUR mandates (if any) it
// should be stored against — deterministically, from the payment object alone, in
// any event order.
//
// The returned `mandateId` is only ever our mirrored recurring (BACS) mandate, so
// it is always safe to persist. The throwaway "instant" mandate GoCardless mints
// for a Faster-Payments IBP is used to FIND the owner (step 4) but never stored.
//
// Resolution order (first hit wins):
//   1. metadata.app_user_id stamped on the resource at creation (self-describing).
//   2. payment.links.mandate IS one of our mirrored mandates (BACS / subscription).
//   3. the billing request that recorded this payment as its ibp_payment_id.
//   4. payment → mandate → customer → gc_customers.  gc_customers is written
//      synchronously in setup-payment BEFORE any webhook, so this resolves the
//      owner the instant ANY payment event arrives — with no dependency on event
//      ordering or on billing_requests.fulfilled having run. This is the anchor
//      that makes the IBP "confirmed-before-fulfilled" race a non-issue.
async function resolvePaymentOwner(
  admin: SupabaseClient,
  paymentId: string,
  // deno-lint-ignore no-explicit-any
  gcPayment: any,
): Promise<{ userId: string | null; mandateId: string | null; subscriptionId: string | null }> {
  const rawMandateId: string | null = gcPayment?.links?.mandate ?? null;
  const subscriptionId: string | null = gcPayment?.links?.subscription ?? null;
  let userId: string | null = gcPayment?.metadata?.app_user_id ?? null;
  let mandateId: string | null = null; // only our mirrored mandate is safe to store

  // 2. Is the payment's mandate one we mirror (the recurring BACS mandate)?
  if (rawMandateId) {
    const { data: m } = await admin.from("gc_mandates")
      .select("user_id").eq("id", rawMandateId).maybeSingle();
    if (m) {
      mandateId = rawMandateId;
      userId = userId ?? m.user_id;
    }
  }

  // 3. IBP payment recorded against its billing request (once fulfilled mirrored it).
  if (!userId) {
    const { data: brq } = await admin.from("gc_billing_requests")
      .select("user_id").eq("ibp_payment_id", paymentId).maybeSingle();
    userId = brq?.user_id ?? null;
  }

  // 4. Universal anchor: resolve via the payment's (possibly instant) mandate's customer.
  if (!userId && rawMandateId) {
    try {
      const gcMandate = (await gcGet(`/mandates/${rawMandateId}`)).mandates;
      const customerId: string | null = gcMandate?.links?.customer ?? null;
      if (customerId) {
        const { data: c } = await admin.from("gc_customers")
          .select("user_id").eq("id", customerId).maybeSingle();
        userId = c?.user_id ?? null;
      }
    } catch (_) { /* mandate not readable yet — fall through; 503 retry is last resort */ }
  }

  return { userId, mandateId, subscriptionId };
}

// deno-lint-ignore no-explicit-any
async function handleEvent(admin: SupabaseClient, event: any): Promise<void> {
  const { resource_type, action, links, details } = event;
  const cause: string = details?.cause ?? "";
  const now = new Date().toISOString();

  // --- BILLING REQUESTS ---
  if (resource_type === "billing_requests") {
    const brqId: string = links.billing_request;

    if (action === "fulfilled") {
      const gcData = await gcGet(`/billing_requests/${brqId}`);
      const br = gcData.billing_requests;
      const mandateId: string | null = br.mandate_request?.links?.mandate ?? null;
      const ibpPaymentId: string | null = br.payment_request?.links?.payment ?? null;
      const customerId: string | null = br.links?.customer ?? null;

      const { data: brqRow } = await admin
        .from("gc_billing_requests")
        .select("user_id")
        .eq("id", brqId)
        .maybeSingle();
      if (!brqRow) return;
      const userId: string = brqRow.user_id;

      if (mandateId) {
        // deno-lint-ignore no-explicit-any
        let mandateRaw: any = {};
        try { mandateRaw = (await gcGet(`/mandates/${mandateId}`)).mandates; } catch (_) {}
        await admin.from("gc_mandates").upsert(
          { id: mandateId, user_id: userId, customer_id: customerId ?? "", scheme: "bacs",
            status: "pending_submission",
            next_possible_charge_date: mandateRaw?.next_possible_charge_date ?? null,
            raw: mandateRaw, updated_at: now },
          { onConflict: "id" }
        );
      }

      await admin.from("gc_billing_requests").upsert(
        { id: brqId, user_id: userId, status: "fulfilled",
          mandate_id: mandateId, ibp_payment_id: ibpPaymentId, raw: br, updated_at: now },
        { onConflict: "id" }
      );

      // Authoritative, event-driven onboarding completion. The moment GoCardless
      // fulfils the billing request the mandate + first payment exist, so the user
      // is set up. This is the reliable completion path: it no longer depends on the
      // frontend confirm callback (which can race ahead of fulfilment and 400), nor
      // on mandates.active (days away for BACS). Guarded on pledge_set so we never
      // move a user backwards.
      await admin.from("profiles")
        .update({ onboarding_status: "setup_complete", updated_at: now })
        .eq("id", userId).eq("onboarding_status", "pledge_set");

      // Ensure IBP payment row exists with user_id + mandate_id link. Read the real
      // scheme from the payment — with fallback_enabled the "IBP" payment can actually
      // be BACS, and hardcoding faster_payments would mislabel the fallback path (the
      // UI keys "a few minutes" vs "3–5 working days" off this).
      if (ibpPaymentId) {
        let ibpScheme = "faster_payments";
        let ibpAmount = br.payment_request?.amount ?? 0;
        try {
          const pmt = (await gcGet(`/payments/${ibpPaymentId}`)).payments;
          ibpScheme = pmt.scheme ?? ibpScheme;
          ibpAmount = pmt.amount ?? ibpAmount;
        } catch (_) { /* payment not readable yet — defaults are fine, created/confirmed will refresh */ }

        const { error: insertErr } = await admin.from("gc_payments").insert({
          id: ibpPaymentId, user_id: userId, mandate_id: mandateId,
          scheme: ibpScheme,
          amount_pence: ibpAmount, currency: "GBP",
          status: "pending_submission", raw: {},
        });
        if (insertErr?.code === "23505") {
          // payments.created already created the row — just backfill mandate_id
          await admin.from("gc_payments")
            .update({ mandate_id: mandateId, updated_at: now })
            .eq("id", ibpPaymentId).is("mandate_id", null);
        }
      }
    } else if (["cancelled", "failed"].includes(action)) {
      await admin.from("gc_billing_requests")
        .update({ status: action, updated_at: now }).eq("id", brqId);
    }
    // flow_exited / bank_authorisation_denied → no-op (logged via gc_webhook_events)
    return;
  }

  // --- PAYMENTS ---
  if (resource_type === "payments") {
    const paymentId: string = links.payment;

    if (action === "created") {
      // Fetch the payment and resolve the owner deterministically (customer anchor),
      // so the row is created with the right user the instant this event arrives —
      // no waiting on billing_requests.fulfilled, no dependence on event ordering.
      // deno-lint-ignore no-explicit-any
      let gcPayment: any = {};
      try { gcPayment = (await gcGet(`/payments/${paymentId}`)).payments; } catch (_) {}
      const { userId, mandateId, subscriptionId } =
        await resolvePaymentOwner(admin, paymentId, gcPayment);

      if (!userId) {
        // Should be unreachable now that the customer mapping exists from setup-payment;
        // if it ever isn't, throw so the 503 safety net redelivers rather than dropping.
        throw new Error(`payments.created: owner not resolvable for ${paymentId} yet — will retry`);
      }

      // deno-lint-ignore no-explicit-any
      const raw = gcPayment as any;
      const scheme = raw.scheme ?? (mandateId ? "bacs" : "faster_payments");
      // Insert the row; if it already exists it may already be at a more advanced
      // status (submitted/confirmed) because those events arrived first. Only refresh
      // descriptive fields while still pending_submission — never knock a confirmed
      // payment back to pending (which would re-show "processing" and break paid_out).
      const { error: insErr } = await admin.from("gc_payments").insert({
        id: paymentId, user_id: userId, mandate_id: mandateId,
        subscription_id: subscriptionId, scheme,
        amount_pence: raw.amount ?? 0, currency: raw.currency ?? "GBP",
        charge_date: raw.charge_date ?? null,
        status: "pending_submission", raw, updated_at: now,
      });
      if (insErr?.code === "23505") {
        // deno-lint-ignore no-explicit-any
        const patch: Record<string, any> = {
          subscription_id: subscriptionId, scheme,
          amount_pence: raw.amount ?? 0, currency: raw.currency ?? "GBP",
          charge_date: raw.charge_date ?? null, raw, updated_at: now,
        };
        // Never null out a mandate_id that billing_requests.fulfilled backfilled:
        // IBP payments.created carries no links.mandate, so only set it when present.
        if (mandateId) patch.mandate_id = mandateId;
        await admin.from("gc_payments").update(patch)
          .eq("id", paymentId).eq("status", "pending_submission");
      } else if (insErr) {
        throw new Error(`payments.created insert failed: ${insErr.message}`);
      }
      return;
    }

    if (action === "submitted") {
      await admin.from("gc_payments")
        .update({ status: "submitted", raw: event, updated_at: now })
        .eq("id", paymentId).eq("status", "pending_submission");
      return;
    }

    if (action === "confirmed") {
      // Normal path: the payment row already exists (created by payments.created
      // or billing_requests.fulfilled). Update it and read it back.
      let { data: payment } = await admin.from("gc_payments")
        .update({ status: "confirmed", raw: event, updated_at: now })
        .eq("id", paymentId)
        .select("user_id, amount_pence, subscription_id")
        .maybeSingle();

      if (!payment) {
        // The IBP runs its whole created→submitted→confirmed lifecycle BEFORE
        // GoCardless fulfils the billing request (observed ~13s gap), and events can
        // arrive out of order, so the row may not exist yet. Rebuild it from GoCardless
        // rather than dropping the credit — resolvePaymentOwner attributes it via the
        // customer mapping, which exists from setup-payment, so this no longer waits on
        // billing_requests.fulfilled. The throw is now a pure safety net.
        const gcPayment = (await gcGet(`/payments/${paymentId}`)).payments;
        const { userId, mandateId, subscriptionId } =
          await resolvePaymentOwner(admin, paymentId, gcPayment);

        if (!userId) {
          throw new Error(
            `payments.confirmed: owner not resolvable for ${paymentId} yet — will retry`,
          );
        }

        const { data: rebuilt } = await admin.from("gc_payments").upsert(
          {
            id: paymentId, user_id: userId, mandate_id: mandateId,
            subscription_id: subscriptionId,
            scheme: gcPayment.scheme ?? (mandateId ? "bacs" : "faster_payments"),
            amount_pence: gcPayment.amount ?? 0, currency: gcPayment.currency ?? "GBP",
            charge_date: gcPayment.charge_date ?? null,
            status: "confirmed", raw: gcPayment, updated_at: now,
          },
          { onConflict: "id" },
        ).select("user_id, amount_pence, subscription_id").single();
        payment = rebuilt;
      }

      if (!payment) {
        throw new Error(`payments.confirmed: row still missing for ${paymentId} after rebuild`);
      }

      const entryType = payment.subscription_id ? "deposit_bacs" : "deposit_ibp";
      const desc = payment.subscription_id
        ? `Monthly deposit — ${poundsDisplay(payment.amount_pence)}`
        : `First deposit — ${poundsDisplay(payment.amount_pence)}`;

      const { error: ledgerErr } = await admin.from("ledger_entries").insert({
        user_id: payment.user_id, entry_type: entryType,
        amount_pence: payment.amount_pence, source_type: "gc_payment",
        source_id: paymentId, idempotency_key: `credit:${paymentId}`, description: desc,
      });

      if (ledgerErr && ledgerErr.code !== "23505") {
        throw new Error(`Ledger insert failed: ${ledgerErr.message}`);
      }

      // Email only when this credit was newly applied. On an idempotent replay
      // (ledger 23505) we skip it so a redelivered confirmation can't send a second
      // "deposit landed" email.
      if (!ledgerErr) {
        const { data: profile } = await admin.from("profiles").select("email").eq("id", payment.user_id).single();
        if (profile) {
          const subj = payment.subscription_id ? "Your monthly deposit is in" : "Your first deposit just landed 🎉";
          const body = `<p>Hi,</p><p>${payment.subscription_id ? "Your monthly" : "Your first"} Treatcode deposit of <strong>${poundsDisplay(payment.amount_pence)}</strong> has landed. Your wallet balance has been updated.</p><p>— The Treatcode team</p>`;
          await sendEmail(profile.email, subj, body);
        }
      }
      return;
    }

    if (action === "paid_out") {
      await admin.from("gc_payments")
        .update({ status: "paid_out", payout_id: links.payout ?? null, updated_at: now })
        .eq("id", paymentId).in("status", ["confirmed", "submitted"]);
      return;
    }

    if (action === "failed") {
      await admin.from("gc_payments")
        .update({ status: "failed", raw: event, updated_at: now })
        .eq("id", paymentId).in("status", ["pending_submission", "submitted"]);

      const { data: payment } = await admin.from("gc_payments")
        .select("user_id, amount_pence").eq("id", paymentId).single();
      if (payment) {
        const { data: p } = await admin.from("profiles").select("email").eq("id", payment.user_id).single();
        if (p) await sendEmail(p.email, "We couldn't collect your deposit", `<p>Hi,</p><p>We were unable to collect your Treatcode deposit of <strong>${poundsDisplay(payment.amount_pence)}</strong>. Please check your bank details or contact us if you have questions.</p><p>— The Treatcode team</p>`);
      }
      return;
    }

    if (action === "charged_back") {
      const { data: payment } = await admin.from("gc_payments")
        .update({ status: "charged_back", raw: event, updated_at: now })
        .eq("id", paymentId).select("user_id, amount_pence").maybeSingle();

      // A chargeback always follows a confirmed payment, so the row should exist.
      // If it doesn't yet, throw to retry rather than silently dropping the reversal
      // (the debit must land — a user keeping reversed funds is worse than a delay).
      if (!payment) {
        throw new Error(`payments.charged_back: no gc_payments row for ${paymentId} — will retry`);
      }

      const { error: ledgerErr } = await admin.from("ledger_entries").insert({
        user_id: payment.user_id, entry_type: "chargeback_reversal",
        amount_pence: payment.amount_pence, source_type: "gc_payment",
        source_id: paymentId, idempotency_key: `chargeback:${paymentId}`,
        description: `Balance adjustment — chargeback ${poundsDisplay(payment.amount_pence)}`,
      });

      if (ledgerErr && ledgerErr.code !== "23505") {
        throw new Error(`Chargeback ledger insert failed: ${ledgerErr.message}`);
      }

      // MANDATORY email when the reversal is newly applied — a silently shrinking
      // balance is a guaranteed support escalation. Gated on a new insert so a
      // redelivered chargeback doesn't alarm the user twice.
      if (!ledgerErr) {
        const { data: p } = await admin.from("profiles").select("email").eq("id", payment.user_id).single();
        if (p) {
          await sendEmail(p.email, "Important: your balance has been adjusted",
            `<p>Hi,</p><p>Your bank has reversed a payment of <strong>${poundsDisplay(payment.amount_pence)}</strong>, which has been deducted from your Treatcode balance. If you believe this is an error, please contact your bank. We're here to help if you have any questions.</p><p>— The Treatcode team</p>`);
        }
      }
      return;
    }

    if (action === "cancelled") {
      await admin.from("gc_payments")
        .update({ status: "cancelled", raw: event, updated_at: now }).eq("id", paymentId);
      return;
    }
  }

  // --- MANDATES ---
  if (resource_type === "mandates") {
    const mandateId: string = links.mandate;

    // Early-lifecycle transitions are guarded so an out-of-order delivery can't
    // move a mandate backwards. GoCardless can deliver `submitted` AFTER `active`
    // (e.g. scenario simulators fire the lifecycle near-simultaneously); without
    // the WHERE guard that late `submitted` clobbers `active` back to `submitted`.
    if (action === "created") {
      // `created` may only (re)assert pending_submission; never downgrade.
      await admin.from("gc_mandates")
        .update({ status: "pending_submission", updated_at: now })
        .eq("id", mandateId).eq("status", "pending_submission");
      return;
    }

    if (action === "submitted") {
      // Promote only from pending_submission; a later `submitted` after `active`
      // matches zero rows and is correctly ignored.
      await admin.from("gc_mandates")
        .update({ status: "submitted", updated_at: now })
        .eq("id", mandateId).eq("status", "pending_submission");
      return;
    }

    if (action === "active") {
      // Fetch the GC mandate once: it carries next_possible_charge_date (which we
      // persist) AND lets us tell the recurring BACS mandate apart from the throwaway
      // instant one (case (b) below).
      // deno-lint-ignore no-explicit-any
      let gcMandate: any = null;
      try { gcMandate = (await gcGet(`/mandates/${mandateId}`)).mandates; } catch (_) {}

      // Promote to active only from a pre-active (or already-active) state, so a
      // stray `active` can't resurrect a cancelled/failed/expired/consumed mandate.
      // deno-lint-ignore no-explicit-any
      const activePatch: Record<string, any> = { status: "active", updated_at: now };
      if (gcMandate?.next_possible_charge_date) {
        activePatch.next_possible_charge_date = gcMandate.next_possible_charge_date;
      }
      await admin.from("gc_mandates")
        .update(activePatch)
        .eq("id", mandateId)
        .in("status", ["pending_submission", "submitted", "active"]);

      const { data: mandate } = await admin.from("gc_mandates")
        .select("user_id, customer_id").eq("id", mandateId).maybeSingle();
      // If the mandate row isn't mirrored, there are two very different reasons:
      //  (a) it's our BACS recurring mandate and billing_requests.fulfilled simply
      //      hasn't landed yet — a genuine ordering race; throw so it's retried,
      //      otherwise the subscription is never created and onboarding never
      //      completes with no signal that it happened.
      //  (b) it's the short-lived instant-payment mandate GoCardless mints for the
      //      Faster-Payments IBP and consumes immediately. We never mirror or manage
      //      it, and must NOT create a subscription against it. Retrying it forever
      //      would be pure noise (now that failures actually retry). No-op instead.
      if (!mandate) {
        const isBacs = gcMandate?.scheme === "bacs";
        const isConsumed = gcMandate?.status === "consumed";
        if (gcMandate && isBacs && !isConsumed) {
          throw new Error(`mandates.active: bacs mandate ${mandateId} not yet mirrored — will retry`);
        }
        return; // instant-payment / non-bacs / unreadable mandate — nothing to manage.
      }

      // Guard #1 (fast path): a subscription is already mirrored for this mandate.
      // The work is done — never POST a second subscription (that would double-charge
      // the user every month). Just make sure onboarding is marked complete.
      const { data: existingSub } = await admin.from("gc_subscriptions")
        .select("id").eq("mandate_id", mandateId).maybeSingle();
      if (existingSub) {
        await admin.from("profiles")
          .update({ onboarding_status: "setup_complete", updated_at: now })
          .eq("id", mandate.user_id);
        return;
      }

      const { data: profile } = await admin.from("profiles")
        .select("pledge_amount_pence").eq("id", mandate.user_id).single();
      if (!profile?.pledge_amount_pence) return;

      const startDate = subscriptionStartDate();

      // Guard #2 (race / partial-failure safe): a deterministic Idempotency-Key
      // keyed on the mandate means GoCardless collapses duplicate POSTs to a single
      // subscription — covering concurrent webhook delivery and a retry that lands
      // after we created the subscription but before we mirrored it (guard #1 would
      // miss that case because the mirror row isn't there yet).
      const created = await gcPostIdempotent(
        "/subscriptions",
        {
          subscriptions: {
            amount: profile.pledge_amount_pence, currency: "GBP",
            interval_unit: "monthly", day_of_month: 1, start_date: startDate,
            name: "Treatcode Monthly Deposit",
            links: { mandate: mandateId },
          },
        },
        `treatcode-sub-${mandateId}`,
      );

      // deno-lint-ignore no-explicit-any
      let sub: any;
      if (created.conflictId) {
        sub = (await gcGet(`/subscriptions/${created.conflictId}`)).subscriptions;
      } else {
        // deno-lint-ignore no-explicit-any
        sub = (created.data as any).subscriptions;
      }

      await admin.from("gc_subscriptions").upsert(
        {
          id: sub.id, user_id: mandate.user_id, mandate_id: mandateId,
          amount_pence: profile.pledge_amount_pence, currency: "GBP",
          interval_unit: "monthly", day_of_month: 1,
          start_date: sub.start_date ?? startDate,
          status: sub.status ?? "active", raw: sub,
        },
        { onConflict: "id" }
      );

      await admin.from("profiles")
        .update({ onboarding_status: "setup_complete", updated_at: now })
        .eq("id", mandate.user_id);
      return;
    }

    if (["cancelled", "failed", "expired"].includes(action)) {
      await admin.from("gc_mandates")
        .update({ status: action, updated_at: now }).eq("id", mandateId);

      const { data: mandate } = await admin.from("gc_mandates").select("user_id").eq("id", mandateId).single();
      if (mandate) {
        const { data: p } = await admin.from("profiles").select("email").eq("id", mandate.user_id).single();
        if (p) {
          const reason = cause || action;
          await sendEmail(p.email, "Action needed: renew your Direct Debit",
            `<p>Hi,</p><p>Your Direct Debit mandate has been ${reason}. To continue saving with Treatcode, please renew your Direct Debit by visiting your wallet settings.</p><p>— The Treatcode team</p>`);
        }
      }
      return;
    }

    if (action === "replaced") {
      const newMandateId: string | null = links.new_mandate ?? null;
      await admin.from("gc_mandates")
        .update({ replaced_by_mandate_id: newMandateId, status: "cancelled", updated_at: now })
        .eq("id", mandateId);
      if (newMandateId) {
        await admin.from("gc_subscriptions")
          .update({ mandate_id: newMandateId, updated_at: now })
          .eq("mandate_id", mandateId).eq("status", "active");
      }
      return;
    }

    if (action === "reinstated") {
      await admin.from("gc_mandates").update({ status: "active", updated_at: now }).eq("id", mandateId);
      return;
    }
  }

  // --- SUBSCRIPTIONS ---
  if (resource_type === "subscriptions") {
    const subId: string = links.subscription;

    if (action === "created") {
      // mandates.active is the authoritative creator (it alone has user/mandate/amount).
      // Here we only refresh the raw snapshot if the row already exists; if it doesn't,
      // mandates.active will create it. The previous code updated only when the row was
      // MISSING — a guaranteed no-op, since you can't UPDATE a row that isn't there.
      await admin.from("gc_subscriptions")
        .update({ raw: event, updated_at: now }).eq("id", subId);
      return;
    }

    if (action === "payment_created") {
      const paymentId: string = links.payment;
      const mandateId: string | null = links.mandate ?? null;
      const { data: sub } = await admin.from("gc_subscriptions")
        .select("user_id, amount_pence").eq("id", subId).single();
      if (!sub) return;

      // Same clobber guard as payments.created: insert, and if the row already
      // exists only refresh it while still pending_submission so a payment that
      // already confirmed isn't knocked back to pending.
      const { error: insErr } = await admin.from("gc_payments").insert({
        id: paymentId, user_id: sub.user_id, subscription_id: subId,
        mandate_id: mandateId, scheme: "bacs",
        amount_pence: sub.amount_pence, currency: "GBP",
        status: "pending_submission", raw: event,
      });
      if (insErr?.code === "23505") {
        // deno-lint-ignore no-explicit-any
        const patch: Record<string, any> = {
          subscription_id: subId,
          amount_pence: sub.amount_pence, raw: event, updated_at: now,
        };
        if (mandateId) patch.mandate_id = mandateId;
        await admin.from("gc_payments").update(patch)
          .eq("id", paymentId).eq("status", "pending_submission");
      } else if (insErr) {
        throw new Error(`subscriptions.payment_created insert failed: ${insErr.message}`);
      }
      return;
    }

    if (["paused", "resumed", "cancelled", "finished"].includes(action)) {
      const statusMap: Record<string, string> = {
        paused: "paused", resumed: "active", cancelled: "cancelled", finished: "finished",
      };
      await admin.from("gc_subscriptions")
        .update({ status: statusMap[action] ?? action, updated_at: now }).eq("id", subId);
      return;
    }
  }

  // --- PAYOUTS ---
  if (resource_type === "payouts") {
    const payoutId: string = links.payout;
    if (action === "paid") {
      let payoutRaw = {};
      try { payoutRaw = (await gcGet(`/payouts/${payoutId}`)).payouts; } catch (_) {}
      // deno-lint-ignore no-explicit-any
      const raw = payoutRaw as any;
      await admin.from("gc_payouts").upsert(
        {
          id: payoutId, amount_pence: raw.amount ?? 0, currency: raw.currency ?? "GBP",
          status: raw.status ?? "paid", arrival_date: raw.arrival_date ?? null, raw,
        },
        { onConflict: "id" }
      );
    }
    return;
  }
}

Deno.serve(async (req: Request) => {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("Webhook-Signature") ?? "";

    if (!(await verifyHmac(rawBody, signature))) {
      return new Response("Invalid signature", { status: 498 });
    }

    const payload = JSON.parse(rawBody);
    const events: unknown[] = payload.events ?? [];
    const admin = getAdminClient();

    // Track whether ANY event in this batch failed. GoCardless only retries a
    // webhook delivery when it receives a non-2xx response. The previous version
    // recorded per-event failures but always returned 204, so GoCardless never
    // re-delivered — a single ordering race (e.g. payments.confirmed arriving
    // before billing_requests.fulfilled mirrored the IBP payment) permanently lost
    // the deposit credit. We now return 5xx if anything failed so GC re-delivers
    // the whole batch; already-processed events are skipped via the processed_at
    // guard and every handler is idempotent, so redelivery is safe.
    let anyFailed = false;

    for (const event of events) {
      // deno-lint-ignore no-explicit-any
      const e = event as any;

      // Record the event exactly once. ON CONFLICT DO NOTHING preserves the
      // originally-stored payload; redeliveries never overwrite it.
      await admin.from("gc_webhook_events").upsert(
        {
          id: e.id, resource_type: e.resource_type, action: e.action,
          cause: e.details?.cause ?? null,
          resource_id: e.links?.[e.resource_type.replace(/s$/, "")] ?? null,
          payload: e,
        },
        { onConflict: "id", ignoreDuplicates: true },
      );

      // Run side effects unless this event was already processed *successfully*.
      // A row that exists but never completed (processed_at IS NULL) is a prior
      // failure being redelivered — it must be retried, not skipped. (The old code
      // skipped any event whose row already existed, which silently dropped every
      // retry of a failed event.)
      const { data: existing } = await admin.from("gc_webhook_events")
        .select("processed_at, retry_count")
        .eq("id", e.id)
        .single();

      if (existing?.processed_at) continue;

      try {
        await handleEvent(admin, e);
        await admin.from("gc_webhook_events")
          .update({ processed_at: new Date().toISOString(), processing_error: null })
          .eq("id", e.id);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Event ${e.id} handler error:`, msg);
        await admin.from("gc_webhook_events")
          .update({ processing_error: msg, retry_count: (existing?.retry_count ?? 0) + 1 })
          .eq("id", e.id);
        anyFailed = true;
      }
    }

    // 204 when everything in the batch is done; 503 to ask GoCardless to redeliver
    // when at least one event still needs to be retried.
    return new Response(null, { status: anyFailed ? 503 : 204 });
  } catch (err) {
    console.error("gocardless-webhook top-level error:", err);
    return new Response("Internal error", { status: 500 });
  }
});

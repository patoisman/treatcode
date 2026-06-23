import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const GC_BASE_URL =
  Deno.env.get("GOCARDLESS_BASE_URL") ?? "https://api.gocardless.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

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

function getUserClient(authHeader: string) {
  const url = Deno.env.get("SUPABASE_URL")!;
  const publishableKeys = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  const key = publishableKeys
    ? JSON.parse(publishableKeys)["default"]
    : Deno.env.get("SUPABASE_ANON_KEY")!;
  return createClient(url, key, {
    global: { headers: { Authorization: authHeader } },
  });
}

async function gcGet(path: string) {
  const res = await fetch(`${GC_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${Deno.env.get("GOCARDLESS_ACCESS_TOKEN")!}`,
      "GoCardless-Version": "2015-07-06",
    },
  });
  if (!res.ok) {
    throw new Error(`GC GET ${path} → ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

// Billing-request statuses that mean "still in progress" — the customer has been
// redirected back but GoCardless hasn't finished authorising/fulfilling yet. The
// hosted flow routinely redirects the payer back ~15-20s BEFORE the billing request
// reaches `fulfilled`, so the callback MUST treat these as "keep polling", never as
// failure. (The previous version 400'd on anything that wasn't fulfilled/fulfilling,
// so a normal early return showed the user an error even though setup then succeeded.)
const IN_PROGRESS = ["pending", "ready_to_fulfil", "fulfilling"];

// profiles has no UPDATE RLS policy, so onboarding promotion runs with the admin
// client. This is a fast-path accelerator; the gocardless-webhook also completes
// onboarding authoritatively on billing_requests.fulfilled. Guarded on pledge_set.
async function markSetupComplete(
  // deno-lint-ignore no-explicit-any
  admin: any,
  userId: string,
  now: string,
) {
  await admin
    .from("profiles")
    .update({ onboarding_status: "setup_complete", updated_at: now })
    .eq("id", userId)
    .eq("onboarding_status", "pledge_set");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const userClient = getUserClient(authHeader);
    const {
      data: { user },
      error: authErr,
    } = await userClient.auth.getUser();
    if (authErr || !user) return json({ error: "Unauthorized" }, 401);

    const url = new URL(req.url);
    let billingRequestId: string | null =
      url.searchParams.get("billing_request_id") ??
      url.searchParams.get("billing_request") ??
      null;

    if (!billingRequestId && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      billingRequestId =
        body.billing_request_id ?? body.billing_request ?? null;
    }

    const admin = getAdminClient();

    if (!billingRequestId) {
      const { data: row } = await admin
        .from("gc_billing_requests")
        .select("id")
        .eq("user_id", user.id)
        .not("status", "in", '("cancelled","failed")')
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!row) {
        return json({ error: "No billing request found for this user" }, 404);
      }
      billingRequestId = row.id;
    }

    const gcData = await gcGet(`/billing_requests/${billingRequestId}`);
    const br = gcData.billing_requests;
    const now = new Date().toISOString();

    if (br.status === "fulfilled") {
      const mandateId: string | null =
        br.mandate_request?.links?.mandate ?? null;
      const ibpPaymentId: string | null =
        br.payment_request?.links?.payment ?? null;

      if (mandateId) {
        let mandateRaw: Record<string, unknown> = {};
        try {
          const m = await gcGet(`/mandates/${mandateId}`);
          mandateRaw = m.mandates;
        } catch (_e) {
          // non-fatal — store what we have
        }
        await admin.from("gc_mandates").upsert(
          {
            id: mandateId,
            user_id: user.id,
            customer_id: br.links?.customer ?? "",
            scheme: "bacs",
            status: "pending_submission",
            next_possible_charge_date:
              (mandateRaw as { next_possible_charge_date?: string }).next_possible_charge_date ?? null,
            raw: mandateRaw,
            updated_at: now,
          },
          { onConflict: "id" }
        );
      }

      await admin.from("gc_billing_requests").upsert(
        {
          id: billingRequestId,
          user_id: user.id,
          status: "fulfilled",
          mandate_id: mandateId,
          ibp_payment_id: ibpPaymentId,
          raw: br,
          updated_at: now,
        },
        { onConflict: "id" }
      );

      await markSetupComplete(admin, user.id, now);

      return json({ status: "fulfilled", mandate_id: mandateId, ibp_payment_id: ibpPaymentId });
    }

    // Still in progress — tell the client to keep polling. NOT an error: the payer
    // is routinely redirected back before GoCardless finishes fulfilling.
    if (IN_PROGRESS.includes(br.status)) {
      return json({ status: "fulfilling" });
    }

    // Terminal failure (cancelled | failed) — record and report.
    await admin
      .from("gc_billing_requests")
      .update({ status: br.status, raw: br, updated_at: now })
      .eq("id", billingRequestId);

    return json({ status: br.status }, 400);
  } catch (err) {
    console.error("confirm-billing-request:", err);
    return json(
      { error: err instanceof Error ? err.message : "Internal error" },
      500
    );
  }
});

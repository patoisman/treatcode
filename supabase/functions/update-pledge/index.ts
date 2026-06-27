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

async function gcPut(path: string, body: unknown) {
  const res = await fetch(`${GC_BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${Deno.env.get("GOCARDLESS_ACCESS_TOKEN")!}`,
      "Content-Type": "application/json",
      "GoCardless-Version": "2015-07-06",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // deno-lint-ignore no-explicit-any
    const reason = (data as any)?.error?.errors?.[0]?.reason ?? null;
    const err = Object.assign(
      new Error(`GC PUT ${path} -> ${res.status}`),
      { gcReason: reason },
    );
    throw err;
  }
  return data;
}

async function gcPost(path: string, body: unknown) {
  const res = await fetch(`${GC_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("GOCARDLESS_ACCESS_TOKEN")!}`,
      "Content-Type": "application/json",
      "GoCardless-Version": "2015-07-06",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`GC POST ${path} -> ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

// Map a GoCardless subscription-update rejection reason to a calm, user-facing
// message. These mostly only surface on LIVE (sandbox doesn't enforce them), so
// before they'd fall through to an opaque 500. `null` => not a reason we translate,
// so the caller should treat it as an unexpected error.
function friendlyPledgeError(reason: string | null | undefined): string | null {
  switch (reason) {
    case "mandate_payments_require_approval":
      return "This change needs approval from your bank before it can take effect. Please try again later, or contact support if it persists.";
    case "subscription_not_active":
    case "subscription_already_ended":
      return "Your monthly deposit isn't active right now, so the amount can't be changed. Please contact support and we'll sort it out.";
    case "validation_failed":
      return "That amount couldn't be applied. Please choose an amount between £25 and £500.";
    case "forbidden":
      return "We couldn't update your deposit amount right now. Please try again, or contact support if it continues.";
    default:
      return null;
  }
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

    const body = await req.json();
    const newAmountPence: unknown = body.amount_pence;

    if (
      typeof newAmountPence !== "number" ||
      !Number.isInteger(newAmountPence)
    ) {
      return json({ error: "amount_pence must be an integer" }, 400);
    }
    if (newAmountPence < 2500) {
      return json({ error: "Minimum deposit is 25" }, 400);
    }
    if (newAmountPence > 50000) {
      return json({ error: "Maximum deposit is 500" }, 400);
    }

    const admin = getAdminClient();
    const now = new Date().toISOString();

    const { data: sub } = await admin
      .from("gc_subscriptions")
      .select("id, mandate_id, status, amendment_count, day_of_month")
      .eq("user_id", user.id)
      .in("status", ["active", "paused"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let finalAmendmentCount = sub?.amendment_count ?? 0;

    if (sub) {
      try {
        const updated = await gcPut(`/subscriptions/${sub.id}`, {
          subscriptions: { amount: newAmountPence },
        });
        finalAmendmentCount = (sub.amendment_count ?? 0) + 1;
        await admin
          .from("gc_subscriptions")
          .update({
            amount_pence: newAmountPence,
            amendment_count: finalAmendmentCount,
            raw: updated.subscriptions,
            updated_at: now,
          })
          .eq("id", sub.id);
      } catch (err) {
        // deno-lint-ignore no-explicit-any
        const reason = (err as any)?.gcReason;

        if (reason === "number_of_subscription_amendments_exceeded") {
          await gcPost(`/subscriptions/${sub.id}/actions/cancel`, {
            subscriptions: {},
          });

          // Preserve the customer's established collection day so the re-created
          // subscription keeps the same monthly cadence. Omit start_date —
          // GoCardless resumes on the next occurrence of that day on or after the
          // mandate's next chargeable date (always the next anniversary), so the
          // re-create can't pull a collection forward into a short gap.
          const dayOfMonth = sub.day_of_month ?? 1;
          const newSubData = await gcPost("/subscriptions", {
            subscriptions: {
              amount: newAmountPence,
              currency: "GBP",
              interval_unit: "monthly",
              day_of_month: dayOfMonth,
              name: "Treatcode Monthly Deposit",
              metadata: { app_user_id: user.id },
              links: { mandate: sub.mandate_id },
            },
          });
          const newSub = newSubData.subscriptions;

          await admin
            .from("gc_subscriptions")
            .update({ status: "cancelled", updated_at: now })
            .eq("id", sub.id);

          await admin.from("gc_subscriptions").upsert(
            {
              id: newSub.id,
              user_id: user.id,
              mandate_id: sub.mandate_id,
              amount_pence: newAmountPence,
              amendment_count: 0,
              currency: "GBP",
              interval_unit: "monthly",
              day_of_month: newSub.day_of_month ?? dayOfMonth,
              start_date: newSub.start_date ?? null,
              status: newSub.status ?? "active",
              raw: newSub,
            },
            { onConflict: "id" },
          );
          finalAmendmentCount = 0;
        } else {
          // A known live-only rejection → return a specific, friendly message (not a 500).
          const friendly = friendlyPledgeError(reason);
          if (friendly) {
            console.error("update-pledge GC rejection:", reason);
            return json({ error: friendly, code: reason }, 422);
          }
          throw err;
        }
      }
    }

    const { error: pledgeErr } = await userClient.rpc("update_my_pledge", {
      p_amount_pence: newAmountPence,
    });
    if (pledgeErr) throw new Error(`Pledge update failed: ${pledgeErr.message}`);

    return json({ success: true, amendment_count: finalAmendmentCount });
  } catch (err) {
    // Log the technical cause; show the user a calm, generic message.
    console.error("update-pledge:", err);
    return json(
      { error: "We couldn't update your deposit amount. Please try again, or contact support if it continues." },
      500,
    );
  }
});

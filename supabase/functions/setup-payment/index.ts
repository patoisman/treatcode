import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const GC_BASE_URL =
  Deno.env.get("GOCARDLESS_BASE_URL") ?? "https://api.gocardless.com";

function getSiteUrl(): string {
  const raw = Deno.env.get("SITE_URL") ?? "http://localhost:5173";
  return raw.trim().replace(/\/$/, "");
}

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
    ? JSON.parse(publishableKeys)!["default"]
    : Deno.env.get("SUPABASE_ANON_KEY")!;
  return createClient(url, key, {
    global: { headers: { Authorization: authHeader } },
  });
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
    throw new Error(`GC POST ${path} → ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

// profiles has no UPDATE RLS policy, so onboarding promotion runs with the admin
// client. Guarded on the current status so a stray call can never move a user
// backwards or sideways. Mirrors confirm-billing-request's completion path: if a
// mandate / fulfilled billing request already exists, the setup already happened
// and the user must be sent on — NOT charged a second time.
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

    const admin = getAdminClient();
    const now = new Date().toISOString();

    const { data: profile } = await admin
      .from("profiles")
      .select("pledge_amount_pence, full_name, email")
      .eq("id", user.id)
      .single();

    if (!profile?.pledge_amount_pence) {
      return json({ error: "Pledge amount not set" }, 400);
    }

    const nameParts = (profile.full_name ?? "").trim().split(/\s+/);
    const givenName = nameParts[0] ?? "";
    const familyName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : givenName;

    const siteUrl = getSiteUrl();
    const createFlow = async (brqId: string) => {
      const flowData = await gcPost("/billing_request_flows", {
        billing_request_flows: {
          links: { billing_request: brqId },
          auto_fulfil: true,
          redirect_uri: `${siteUrl}/wallet/setup/callback`,
          exit_uri: `${siteUrl}/wallet/setup`,
          prefilled_customer: { given_name: givenName, family_name: familyName, email: profile.email },
          // lock_customer_details omitted: requires explicit GC account enablement
        },
      });
      return flowData.billing_request_flows;
    };

    // --- Re-entry guards: prevent duplicate mandates / double first-payment ---
    // A user bounced back into this flow (e.g. by refreshing /onboarding) must
    // never mint a second billing request once setup has already produced a
    // mandate or a fulfilled billing request. Each new billing request collects
    // its OWN first-deposit Instant Bank Payment — a duplicate here double-charges.

    // Guard (a): a mandate already exists in a live state. active = fully set up;
    // pending_submission/submitted = created and awaiting bank confirmation. In
    // every case the setup already happened — complete onboarding and send the
    // user on. (failed/cancelled/expired/consumed/blocked deliberately fall
    // through so the user CAN re-set-up.)
    const { data: liveMandate } = await admin
      .from("gc_mandates")
      .select("id")
      .eq("user_id", user.id)
      .in("status", ["active", "pending_submission", "submitted"])
      .limit(1)
      .maybeSingle();

    if (liveMandate) {
      await markSetupComplete(admin, user.id, now);
      return json({ already_complete: true });
    }

    // Guard (b): a billing request already fulfilled (mandate row may not have
    // mirrored yet) — the setup succeeded; complete and move on, never re-charge.
    const { data: fulfilledBrq } = await admin
      .from("gc_billing_requests")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "fulfilled")
      .limit(1)
      .maybeSingle();

    if (fulfilledBrq) {
      await markSetupComplete(admin, user.id, now);
      return json({ already_complete: true });
    }

    // Guard (c): a still-open billing request exists (created but not yet
    // fulfilled/cancelled). Resume it with a FRESH flow rather than creating a
    // brand-new billing request — same mandate+payment, new authorisation link
    // (the previous link may have expired or been abandoned).
    const { data: openBrq } = await admin
      .from("gc_billing_requests")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (openBrq) {
      const flow = await createFlow(openBrq.id);
      await admin
        .from("gc_billing_requests")
        .update({ flow_id: flow.id, updated_at: now })
        .eq("id", openBrq.id);
      return json({ authorisation_url: flow.authorisation_url });
    }

    // --- No existing setup: create customer (if needed) + billing request + flow ---
    let gcCustomerId: string;
    const { data: existingCustomer } = await admin
      .from("gc_customers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingCustomer) {
      gcCustomerId = existingCustomer.id;
    } else {
      const gcCustomer = await gcPost("/customers", {
        customers: { email: profile.email, given_name: givenName, family_name: familyName },
      });
      gcCustomerId = gcCustomer.customers.id;
      await admin.from("gc_customers").insert({
        id: gcCustomerId,
        user_id: user.id,
        email: profile.email,
      });
    }

    const brqData = await gcPost("/billing_requests", {
      billing_requests: {
        payment_request: {
          amount: profile.pledge_amount_pence,
          currency: "GBP",
          description: "Treatcode — first month deposit",
        },
        mandate_request: {
          scheme: "bacs",
          currency: "GBP",
          description: "Treatcode Monthly Deposit",
        },
        fallback_enabled: true,
        links: { customer: gcCustomerId },
      },
    });
    const brq = brqData.billing_requests;

    const flow = await createFlow(brq.id);

    await admin.from("gc_billing_requests").insert({
      id: brq.id,
      user_id: user.id,
      status: "pending",
      flow_id: flow.id,
      raw: brq,
    });

    return json({ authorisation_url: flow.authorisation_url });
  } catch (err) {
    console.error("setup-payment:", err);
    return json(
      { error: err instanceof Error ? err.message : "Internal error" },
      500
    );
  }
});

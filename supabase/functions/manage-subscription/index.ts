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

async function gcAction(path: string, body: unknown = {}) {
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
  return res.json().catch(() => ({}));
}

type SubscriptionAction = "pause" | "resume" | "cancel";

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
    const action = body.action as SubscriptionAction;

    if (!["pause", "resume", "cancel"].includes(action)) {
      return json({ error: "action must be pause | resume | cancel" }, 400);
    }

    const admin = getAdminClient();
    const now = new Date().toISOString();

    if (action === "pause" || action === "resume") {
      const { data: sub } = await admin
        .from("gc_subscriptions")
        .select("id, status")
        .eq("user_id", user.id)
        .in("status", action === "pause" ? ["active"] : ["paused"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!sub) {
        return json(
          {
            error:
              action === "pause"
                ? "No active subscription to pause"
                : "No paused subscription to resume",
          },
          404,
        );
      }

      await gcAction(`/subscriptions/${sub.id}/actions/${action}`, {
        subscriptions: {},
      });

      const newStatus = action === "pause" ? "paused" : "active";
      await admin
        .from("gc_subscriptions")
        .update({ status: newStatus, updated_at: now })
        .eq("id", sub.id);

      return json({ success: true, status: newStatus });
    }

    // cancel — cancels the mandate which cascades to subscription.
    // The webhook will confirm the status changes; we also write them
    // immediately so the UI reflects the change without waiting for the webhook.
    const { data: mandate } = await admin
      .from("gc_mandates")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (!mandate) {
      return json({ error: "No active mandate to cancel" }, 404);
    }

    await gcAction(`/mandates/${mandate.id}/actions/cancel`, { mandates: {} });

    // Optimistic DB updates — webhook will overwrite with confirmed data
    await admin
      .from("gc_mandates")
      .update({ status: "cancelled", updated_at: now })
      .eq("id", mandate.id);

    await admin
      .from("gc_subscriptions")
      .update({ status: "cancelled", updated_at: now })
      .eq("mandate_id", mandate.id)
      .in("status", ["active", "paused"]);

    return json({ success: true, status: "cancelled" });
  } catch (err) {
    console.error("manage-subscription:", err);
    return json(
      { error: err instanceof Error ? err.message : "Internal error" },
      500,
    );
  }
});

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// This function is now also invoked from the browser (client-side, best-effort)
// in addition to server-to-server calls, so every response must carry CORS
// headers — otherwise the preflight has no Access-Control-Allow-Origin and the
// browser blocks the actual POST (only the OPTIONS ever reaches the function).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

async function sendEmail(to: string, subject: string, html: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "hello@contact.treat-code.com", to, subject, html }),
  });
  if (!res.ok) console.error("Resend error:", await res.text());
}

type Payload = {
  event: "new_request" | "request_failed";
  requestId: string;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const { event, requestId } = await req.json() as Payload;
    if (!event || !requestId) {
      return new Response("bad request", { status: 400, headers: corsHeaders });
    }

    const admin = getAdminClient();

    const { data: redemption } = await admin
      .from("redemption_requests")
      .select("id, status, amount_pence, brand_id, user_id")
      .eq("id", requestId)
      .single();

    if (!redemption) return new Response("not found", { status: 200, headers: corsHeaders });

    const [brandRes, profileRes] = await Promise.all([
      admin.from("brands").select("name").eq("id", redemption.brand_id).single(),
      admin.from("profiles").select("email, full_name").eq("id", redemption.user_id).single(),
    ]);

    const brand = brandRes.data;
    const userProfile = profileRes.data;
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://treat-code.com";
    const amountDisplay = `£${(redemption.amount_pence / 100).toFixed(2)}`;

    if (event === "new_request") {
      const adminEmail = Deno.env.get("ADMIN_EMAIL");
      if (!adminEmail || !brand) return new Response("ok", { status: 200, headers: corsHeaders });

      await sendEmail(
        adminEmail,
        `New voucher request — ${brand.name} ${amountDisplay}`,
        `<p>A new voucher redemption request is waiting to be fulfilled.</p>
<table style="border-collapse:collapse;margin:16px 0;">
  <tr><td style="padding:4px 16px 4px 0;color:#666;">Brand</td><td><strong>${brand.name}</strong></td></tr>
  <tr><td style="padding:4px 16px 4px 0;color:#666;">Amount</td><td><strong>${amountDisplay}</strong></td></tr>
  <tr><td style="padding:4px 16px 4px 0;color:#666;">User</td><td>${userProfile?.email ?? redemption.user_id}</td></tr>
</table>
<p><a href="${siteUrl}/admin/redemptions" style="display:inline-block;padding:10px 20px;background:#18181b;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Open queue &rarr;</a></p>
<p style="color:#999;font-size:12px;">— Treatcode</p>`
      );
    }

    if (event === "request_failed") {
      if (!userProfile || !brand) return new Response("ok", { status: 200, headers: corsHeaders });

      const reason = redemption.status === "expired"
        ? "expired before it could be fulfilled"
        : "could not be fulfilled";

      await sendEmail(
        userProfile.email,
        `Your voucher request failed — balance refunded`,
        `<p>Hi ${userProfile.full_name || "there"},</p>
<p>Unfortunately your <strong>${brand.name}</strong> voucher request for <strong>${amountDisplay}</strong> ${reason}. Your balance has been fully refunded and is available in your wallet immediately.</p>
<p>You can make a new request at any time from the <a href="${siteUrl}/retailers">Brands page</a>.</p>
<p>If you have any questions, just reply to this email.</p>
<p>— The Treatcode team</p>`
      );
    }

    return new Response("ok", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("redemption-notifications:", err);
    return new Response("error", { status: 500, headers: corsHeaders });
  }
});

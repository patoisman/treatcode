import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { emailHtml, s, ctaButton } from "../_shared/emailTemplate.ts";

// This function is invoked from the browser (client-side, best-effort) as well as
// server-to-server via pg_net, so every response must carry CORS headers.
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
  const from = Deno.env.get("FROM_EMAIL") ?? "Treatcode <hello@mail.treat-code.com>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html }),
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
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://treat-code.com";

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
    const amountDisplay = `£${(redemption.amount_pence / 100).toFixed(2)}`;

    if (event === "new_request") {
      const adminEmail = Deno.env.get("ADMIN_EMAIL");
      if (!adminEmail || !brand) return new Response("ok", { status: 200, headers: corsHeaders });

      const html = emailHtml(`
<p style="${s.p}">A new voucher redemption request is waiting to be fulfilled.</p>
<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="margin:0 0 4px;border-top:1px solid #e2e8f0;">
  <tr><td style="${s.label}">Brand</td><td style="${s.value}">${brand.name}</td></tr>
  <tr style="border-top:1px solid #f0f4f8;"><td style="${s.label}">Amount</td><td style="${s.value}">${amountDisplay}</td></tr>
  <tr style="border-top:1px solid #f0f4f8;"><td style="${s.label}">Requested by</td><td style="${s.value}">${userProfile?.full_name ?? userProfile?.email ?? redemption.user_id}</td></tr>
</table>
${ctaButton("Open queue &rarr;", `${siteUrl}/admin`)}
`, siteUrl);

      await sendEmail(adminEmail, `New voucher request — ${brand.name} ${amountDisplay}`, html);
    }

    if (event === "request_failed") {
      if (!userProfile || !brand) return new Response("ok", { status: 200, headers: corsHeaders });

      const reason = redemption.status === "expired"
        ? "expired before it could be fulfilled"
        : "could not be fulfilled";
      const name = userProfile.full_name || "there";

      const html = emailHtml(`
<p style="${s.p}">Hi ${name},</p>
<p style="${s.p}">Unfortunately your <strong style="color:#1e293b;">${brand.name}</strong> voucher request for <strong style="color:#1e293b;">${amountDisplay}</strong> ${reason}. Your balance has been fully refunded and is available in your wallet immediately.</p>
<p style="${s.pLast}">You can place a new request at any time from the Brands page.</p>
${ctaButton("Browse brands &rarr;", `${siteUrl}/dashboard/redemptions`)}
`, siteUrl);

      await sendEmail(
        userProfile.email,
        `Your ${brand.name} request has been refunded`,
        html,
      );
    }

    return new Response("ok", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("redemption-notifications:", err);
    return new Response("error", { status: 500, headers: corsHeaders });
  }
});

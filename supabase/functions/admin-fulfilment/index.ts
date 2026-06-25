import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { emailHtml, s } from "../_shared/emailTemplate.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const userClient = getUserClient(authHeader);
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) return json({ error: "Unauthorized" }, 401);

    const admin = getAdminClient();

    // Admin guard
    const { data: callerProfile } = await admin
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    if (!callerProfile?.is_admin) return json({ error: "Forbidden" }, 403);

    const body = await req.json();
    const { requestId, voucherCode, voucherPin, instructions, adminNotes } = body as {
      requestId: string;
      voucherCode: string;
      voucherPin?: string;
      instructions?: string;
      adminNotes?: string;
    };

    if (!requestId || !voucherCode?.trim()) {
      return json({ error: "requestId and voucherCode are required" }, 400);
    }

    // Fetch the redemption request
    const { data: redemption, error: reqErr } = await admin
      .from("redemption_requests")
      .select("id, user_id, brand_id, amount_pence, status")
      .eq("id", requestId)
      .single();

    if (reqErr || !redemption) return json({ error: "Request not found" }, 404);

    if (!["requested", "fulfilling"].includes(redemption.status)) {
      return json(
        { error: `Cannot fulfil a request with status '${redemption.status}'` },
        400
      );
    }

    // If not yet claimed, transition to fulfilling first
    if (redemption.status === "requested") {
      const { error: claimErr } = await admin.rpc("transition_redemption", {
        p_request_id: requestId,
        p_new_status: "fulfilling",
        p_failure_reason: null,
        p_actor: user.id,
      });
      if (claimErr) throw new Error(`Claim failed: ${claimErr.message}`);
    }

    // Insert the fulfilment record (unique on request_id — idempotent on retry)
    const { error: insertErr } = await admin.from("redemption_fulfillments").insert({
      request_id: requestId,
      voucher_code: voucherCode.trim(),
      voucher_pin: voucherPin?.trim() ?? null,
      instructions: instructions?.trim() ?? null,
      admin_notes: adminNotes?.trim() ?? null,
      created_by: user.id,
    });
    if (insertErr && insertErr.code !== "23505") {
      throw new Error(`Insert fulfillment failed: ${insertErr.message}`);
    }

    // Transition to fulfilled
    const { error: fulfillErr } = await admin.rpc("transition_redemption", {
      p_request_id: requestId,
      p_new_status: "fulfilled",
      p_failure_reason: null,
      p_actor: user.id,
    });
    // Ignore invalid_transition — means it was already fulfilled (idempotent)
    if (fulfillErr && !fulfillErr.message?.includes("invalid_transition")) {
      throw new Error(`Fulfil transition failed: ${fulfillErr.message}`);
    }

    // Send "Your voucher is ready" email
    const [profileRes, brandRes] = await Promise.all([
      admin.from("profiles").select("email, full_name").eq("id", redemption.user_id).single(),
      admin.from("brands").select("name").eq("id", redemption.brand_id).single(),
    ]);

    const userProfile = profileRes.data;
    const brand = brandRes.data;
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://treat-code.com";

    if (userProfile && brand) {
      const amountDisplay = `£${(redemption.amount_pence / 100).toFixed(2)}`;
      const name = userProfile.full_name || "there";

      const pinBlock = voucherPin?.trim()
        ? `<p style="${s.p}"><strong style="color:#1e293b;">PIN:</strong> <span style="${s.code}">${voucherPin.trim()}</span></p>`
        : "";

      const instructionsBlock = instructions?.trim()
        ? `<p style="${s.p}"><strong style="color:#1e293b;">How to use:</strong> ${instructions.trim()}</p>`
        : "";

      const html = emailHtml(`
<p style="${s.p}">Hi ${name},</p>
<p style="${s.p}">Great news — your <strong style="color:#1e293b;">${brand.name}</strong> voucher is ready to use.</p>
<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="margin:0 0 24px;border-top:1px solid #e2e8f0;">
  <tr><td style="${s.label}">Brand</td><td style="${s.value}">${brand.name}</td></tr>
  <tr style="border-top:1px solid #f0f4f8;"><td style="${s.label}">Value</td><td style="${s.value}">${amountDisplay}</td></tr>
</table>
<p style="margin:0 0 8px;font-size:13px;color:#64748b;font-family:Consolas,'Courier New',monospace;text-transform:uppercase;letter-spacing:0.5px;">Voucher code</p>
<p style="margin:0 0 24px;"><span style="${s.code}">${voucherCode.trim()}</span></p>
${pinBlock}${instructionsBlock}
<p style="${s.pLast}">Enjoy your treat!</p>
`, siteUrl);

      await sendEmail(userProfile.email, `Your ${brand.name} voucher is ready`, html);
    }

    return json({ success: true });
  } catch (err) {
    console.error("admin-fulfilment:", err);
    return json({ error: err instanceof Error ? err.message : "Internal error" }, 500);
  }
});

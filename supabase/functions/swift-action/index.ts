// DEPRECATED / DISABLED — DO NOT RESTORE.
//
// This function previously echoed back environment secrets (the live GoCardless
// access token + webhook secret, the Resend API key, etc.) as JSON to ANY
// authenticated caller — a credential-disclosure bug. It is a development leftover
// and is NOT used anywhere in the app.
//
// It has been neutralised to return 410 Gone. Delete the function entirely when
// convenient via the Supabase dashboard (Edge Functions → swift-action → Delete)
// or `supabase functions delete swift-action`.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(() =>
  new Response(JSON.stringify({ error: "Gone" }), {
    status: 410,
    headers: { "Content-Type": "application/json" },
  })
);

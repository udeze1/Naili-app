// supabase/functions/create-paystack/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";
  // Replace these with your actual dev origins and production domain(s)
  const allowedOrigins = [
    "http://localhost:8081",   // Metro dev
    "http://127.0.0.1:8081",
    "http://192.168.0.101:8081", // replace with your LAN IP if needed
    "https://your-production-domain.com" // replace with your domain
  ];
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[allowedOrigins.length - 1];

  const corsHeadersBase = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
    // Uncomment if you send credentials from frontend
    // "Access-Control-Allow-Credentials": "true",
  };

  // --- Preflight handler ---
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeadersBase });
  }

  // Only allow POST for the actual call
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeadersBase },
    });
  }

  try {
    const body = await req.json();
    const { email, amount } = body ?? {};
    if (!email || !amount) {
      return new Response(JSON.stringify({ error: "Missing email or amount" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeadersBase },
      });
    }

    // Choose key (adjust to your secrets names)
    const mode = Deno.env.get("PAYSTACK_MODE") || "live";
    const paystackKey = mode === "live"
      ? Deno.env.get("PAYSTACK_LIVE_KEY") || Deno.env.get("PAYSTACK_SECRET_KEY")
      : Deno.env.get("PAYSTACK_TEST_KEY");

    if (!paystackKey) {
      return new Response(JSON.stringify({ error: "Paystack key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeadersBase },
      });
    }

    const resp = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Paystack expects kobo
        // callback_url: "https://your-production-domain.com/payment/callback"
      }),
    });

    const data = await resp.json();

    // return Paystack response (status forwarded)
    return new Response(JSON.stringify(data), {
      status: resp.status,
      headers: { "Content-Type": "application/json", ...corsHeadersBase },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err?.message || String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeadersBase },
    });
  }
});
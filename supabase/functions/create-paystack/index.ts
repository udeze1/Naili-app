// supabase/functions/create-paystack/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";

  const allowedOrigins = [
    "http://localhost:8081",      // Expo Metro bundler
    "http://127.0.0.1:8081",
    "http://192.168.0.101:8081",  // replace with your LAN IP if testing on phone
    "https://naili.com.ng"        // your production domain
  ];

  const allowedOrigin = allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0];

  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, x-client-info, apikey",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const body = await req.json();
    const { email, amount } = body ?? {};
    if (!email || !amount) {
      return new Response(JSON.stringify({ error: "Missing email or amount" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const mode = Deno.env.get("PAYSTACK_MODE") || "live";
    const paystackKey =
      mode === "live"
        ? Deno.env.get("PAYSTACK_LIVE_KEY") ||
          Deno.env.get("PAYSTACK_SECRET_KEY")
        : Deno.env.get("PAYSTACK_TEST_KEY");

    if (!paystackKey) {
      return new Response(
        JSON.stringify({ error: "Paystack key not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const resp = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Paystack wants kobo
      }),
    });

    const data = await resp.json();

    if (!data?.data?.authorization_url) {
      return new Response(JSON.stringify({ error: "Failed to get checkout URL" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // ✅ Return only the checkout URL
    return new Response(JSON.stringify({ checkoutUrl: data.data.authorization_url }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err?.message || String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
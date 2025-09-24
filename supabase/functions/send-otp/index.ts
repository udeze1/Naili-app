// supabase/functions/send-otp/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigins = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:19006",
    "https://naili.com.ng" // add your prod domain(s) here
  ];
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { target, email, phone, user_id } = body ?? {};

    if (!target || (target === "email" && !email) || (target === "phone" && !phone)) {
      return new Response(JSON.stringify({ error: "Missing required fields (target/email/phone)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // server-side Supabase client (service role) — safe in Edge Function
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // insert OTP into otp_codes
    const { error: insertError } = await supabase.from("otp_codes").insert({
      user_id: user_id ?? null,
      otp_code: otp,
      type: target,
      expires_at,
    });

    if (insertError) {
      console.error("DB insert error:", insertError);
      throw insertError;
    }

    // If email — send via Mailgun
    if (target === "email") {
      const MAILGUN_API_KEY = Deno.env.get("MAILGUN_API_KEY")!;
      const MAILGUN_DOMAIN = Deno.env.get("MAILGUN_DOMAIN")!;
      const params = new URLSearchParams();
      params.append("from", `NAILI <no-reply@${MAILGUN_DOMAIN}>`);
      params.append("to", email);
      params.append("subject", "Your NAILI verification code");
      params.append("text", `Your verification code is ${otp}. It expires in 5 minutes.`);

      const resp = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa("api:" + MAILGUN_API_KEY)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error("Mailgun send error:", resp.status, text);
        return new Response(JSON.stringify({ error: "Mailgun send failed", details: text }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // If phone — placeholder for Termii (we'll add actual API call later)
    if (target === "phone") {
      // TODO: call Termii API here using Deno.fetch
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-otp error:", err);
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
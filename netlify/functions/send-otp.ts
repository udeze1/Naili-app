import { Handler } from "@netlify/functions";
import fetch from "node-fetch";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL!;

export const handler: Handler = async (event) => {
  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  try {
    const { target, email, phone, user_id } = JSON.parse(event.body || "{}");

    if (!target || (target === "email" && !email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Missing target or email",
        }),
      };
    }

    // Generate OTP and expiration
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 1000).toISOString();

    // Save OTP in Supabase
    await fetch(`${SUPABASE_URL}/rest/v1/otp_codes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        email,
        phone,
        user_id,
        otp,
        expires_at: expiresAt,
        target,
      }),
    });

    // Send via Brevo (email)
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { email: SMTP_FROM_EMAIL, name: "Naili" },
        to: [{ email }],
        subject: "Your Naili Verification Code",
        htmlContent: `<p>Your verification code is <strong>${otp}</strong>. It expires in 1 minute.</p>`,
      }),
    });

    // ✅ Success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "OTP sent successfully",
        otp, // Return OTP for testing purposes; remove in production
      }),
    };
  } catch (error) {
    console.error("Send OTP Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Internal Server Error",
      }),
    };
  }
};
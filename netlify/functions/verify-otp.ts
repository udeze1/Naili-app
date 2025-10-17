import { Handler } from "@netlify/functions";
import fetch from "node-fetch";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

export const handler: Handler = async (event) => {
  // ✅ Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  try {
    const { email, otp } = JSON.parse(event.body || "{}");

    if (!email || !otp) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing email or OTP" }) };
    }

    // 🔍 Verify OTP in Supabase
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/otp_codes?email=eq.${email}&otp=eq.${otp}&select=*`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    const data = await response.json();
    if (data.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid OTP" }) };
    }

    const otpRecord = data[0];
    const now = new Date();
    if (new Date(otpRecord.expires_at) < now) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "OTP expired" }) };
    }

    // ✅ Success
    return {
  statusCode: 200,
  headers,
  body: JSON.stringify({
    success: true,
    message: "OTP verified successfully",
  }),
};
  } catch (error) {
  console.error("Verify OTP Error:", error);
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
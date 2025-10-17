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
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  try {
    const { name, email, message, user_id } = JSON.parse(event.body || "{}");

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Missing required fields (name, email, message)",
        }),
      };
    }

    // 1️⃣ Save feedback in Supabase
    await fetch(`${SUPABASE_URL}/rest/v1/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        name,
        email,
        message,
        user_id: user_id || null,
        created_at: new Date().toISOString(),
      }),
    });

    // 2️⃣ Send full message email via Brevo
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { email: SMTP_FROM_EMAIL, name: "Naili Feedback" },
        to: [{ email: SMTP_FROM_EMAIL }], // 👈 send to you
        subject: "📩 New Customer Feedback Received",
        htmlContent: `
          <h3>New Feedback from ${name}</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          ${
            user_id
              ? `<p><small>User ID: ${user_id}</small></p>`
              : `<p><small>Anonymous User</small></p>`
          }
          <p>Received at: ${new Date().toLocaleString()}</p>
        `,
      }),
    });

    // ✅ Return success
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Feedback sent successfully",
      }),
    };
  } catch (error) {
    console.error("Send Feedback Error:", error);
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
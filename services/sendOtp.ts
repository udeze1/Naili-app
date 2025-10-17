const NETLIFY_BASE_URL = "https://naili.com.ng";

interface SendOtpParams {
  target: 'email' | 'phone';
  email?: string;
  phone?: string;
  user_id?: string;
}

type SendOtpResponse = {
  success: boolean;
  message: string;
  otp?: string; // 👈 Optional — included only for debugging or testing
};

export const sendOtp = async ({ target, email, phone, user_id }: SendOtpParams): Promise<SendOtpResponse> => {
  try {
    const response = await fetch(`${NETLIFY_BASE_URL}/.netlify/functions/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target, email, phone, user_id }),
    });

    const data: SendOtpResponse = await response.json();

    if (!response.ok) throw new Error(data.message || "Failed to send OTP");

    return data;
  } catch (error) {
    console.error("sendOtp error:", error);
    throw error;
  }
};
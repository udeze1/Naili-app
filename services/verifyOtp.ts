const NETLIFY_BASE_URL = "https://naili.com.ng";

type VerifyOtpParams = {
  otp: string;
  email?: string;
  phone?: string;
};

type VerifyOtpResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export const verifyOtp = async ({ otp, email, phone }: VerifyOtpParams): Promise<VerifyOtpResponse> => {
  try {
    if (!email && !phone) {
      return { success: false, error: "Either email or phone must be provided" };
    }

    const response = await fetch(`${NETLIFY_BASE_URL}/.netlify/functions/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp, email, phone }),
    });

    const data: VerifyOtpResponse = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "OTP verification failed" };
    }

    return { success: true, message: data.message || "OTP verified successfully" };
  } catch (error) {
    console.error("verifyOtp error:", error);
    return { success: false, error: "Network or server error while verifying OTP" };
  }
};
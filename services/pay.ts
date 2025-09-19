import { supabaseClient } from "../lib/supabase"; // ✅ adjust path if needed

type PaymentArgs = {
  email: string ;
  full_name: string;
  amountNaira: number; // in Naira
  metadata: {
    user_id: string;
    cart_id: string;
    address?: string;
    phone?: string;
  };
};

export default async function initiatePaystackPayment({
  email,
  full_name,
  amountNaira,
  metadata,
}: PaymentArgs) {
  try {
    // Call your Supabase function
    const { data, error } = await supabaseClient.functions.invoke("paystack", {
      body: {
        email,
        full_name,
        amountNaira,
        metadata,
      },
    });

    if (error) throw error;

    return data; // should contain { checkoutUrl }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Payment error:", err.message);
      throw err;
    }
    throw new Error("Unknown error occurred while initiating payment");
  }
}
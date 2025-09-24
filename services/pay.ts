import { supabaseClient } from "../lib/supabase";
import * as Linking from "expo-linking"; // Expo linking to open browser

type PaymentArgs = {
  email: string;
  full_name: string;
  amountNaira: number;
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
    const { data, error } = await supabaseClient.functions.invoke("create-paystack", {
      body: {
        email,
        full_name,
        amount: amountNaira,
        metadata,
      },
    });

    if (error) throw error;

    // Paystack returns checkout URL as data.data.authorization_url
    const checkoutUrl = data?.data?.authorization_url;

    if (checkoutUrl) {
      await Linking.openURL(checkoutUrl); // open Paystack checkout
    } else {
      throw new Error("No checkout URL returned from Paystack");
    }

    return checkoutUrl;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Payment error:", err.message);
      throw err;
    }
    throw new Error("Unknown error occurred while initiating payment");
  }
}
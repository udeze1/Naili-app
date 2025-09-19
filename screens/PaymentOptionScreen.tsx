import React from 'react';
import { View, Text, TouchableOpacity, Linking, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext'; // ✅ real user data
import initiatePaystackPayment from '../services/pay'; // our supabase fn

const PaymentOptionScreen = () => {
  const navigation = useNavigation();
  const { user } = useUser(); // ✅ real user context
  const [loading, setLoading] = React.useState(false);

  // 👇 replace with your real cart total fetch if you have one
  const amountNaira = 5000; // Example ₦5,000, replace with dynamic total

  const handlePayNow = async () => {
    if (!user) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    setLoading(true);
    try {
      const { email, full_name, id, current_cart_id, address, phone_number } = user;

      // ✅ call backend function with metadata
      const { checkoutUrl } = await initiatePaystackPayment({
        email: email!,
        full_name: full_name!,
        amountNaira: amountNaira,
        metadata: {
          user_id: id!, 
          cart_id: current_cart_id!,
          address: address ?? "",
          phone: phone_number,
        },
      });

      if (checkoutUrl) {
        Linking.openURL(checkoutUrl);
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      Alert.alert("Payment Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Select a payment method:</Text>

      <TouchableOpacity
        onPress={handlePayNow}
        style={{
          marginTop: 20,
          padding: 16,
          backgroundColor: '#2ecc71',
          borderRadius: 8,
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Pay with Paystack</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default PaymentOptionScreen;
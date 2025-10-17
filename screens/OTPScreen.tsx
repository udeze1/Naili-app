// OTPScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { sendOtp } from '../services/sendOtp'; // Updated to handle email & phone
// import verifyOtp from the correct location or implement it if missing
import { verifyOtp } from '../services/verifyOtp'; // Update the path if needed

type RouteParams = {
  email?: string;
  phoneNumber?: string;
};

const OTPScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { setUser, setAddress } = useUser();
  const { email, phoneNumber } = route.params as RouteParams;

  const [otp, setOtp] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(30);

  // ⏳ Countdown effect for resend
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // ✅ Verify OTP
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOtp({
        otp,
        email,
        phone: phoneNumber,
      });

      if (!response.success) {
        Alert.alert('OTP Error', response.error || 'Invalid or expired OTP');
        setLoading(false);
        return;
      }

      Alert.alert('Success', response.message || 'OTP verified successfully');

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' as never }],
      });
    } catch (err) {
      console.error('OTP verification failed:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  // ✅ Resend OTP
  const handleResendOTP = async () => {
    if (timer > 0) return;

    setResending(true);
    try {
      const response = await sendOtp({
        target: email ? 'email' : 'phone',
        email,
        phone: phoneNumber,
      });

      if (!response.success) {
        Alert.alert('Error', response.message || 'Could not resend OTP.');
      } else {
        Alert.alert('Success', 'A new OTP has been sent.');
        setTimer(30);
      }
    } catch (err) {
      console.error('Resend OTP failed:', err);
      Alert.alert('Error', 'Something went wrong while resending OTP.');
    }
    setResending(false);
  };

  const handleGoBackToLogin = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' as never }],
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to {email || phoneNumber}
      </Text>

      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="Enter 6-digit OTP"
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity style={styles.button} onPress={handleVerifyOTP} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResendOTP} disabled={resending || timer > 0}>
        <Text style={styles.resendText}>
          {timer > 0
            ? `Resend in ${timer}s`
            : resending
            ? 'Resending...'
            : 'Resend OTP'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleGoBackToLogin}>
        <Text style={styles.backText}>← Go back to Login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default OTPScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '600', color: '#006400', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 24, textAlign: 'center' },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 18,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 8,
  },
  button: { backgroundColor: '#FFD700', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  buttonText: { color: '#006400', fontWeight: '600', fontSize: 16 },
  resendText: { color: '#006400', textAlign: 'center', fontSize: 15, marginBottom: 15 },
  backText: { color: '#888', textAlign: 'center', fontSize: 15 },
});
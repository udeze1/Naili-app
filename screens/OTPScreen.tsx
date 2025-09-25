// OTPScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabaseClient } from '../lib/supabase';
import { useUser } from '../context/UserContext';

type RouteParams = {
  email?: string;
  phone_number?: string;
};

const OTPScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { setUser, setAddress } = useUser();
  const { email, phone_number } = route.params as RouteParams;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      // Fetch OTP record by email or phone
      const query = supabaseClient
        .from('otps')
        .select('*')
        .eq('code', otp)
        .eq('is_used', false)
        .order('created_at', { ascending: false })
        .limit(1);

      if (email) query.eq('email', email);
      else if (phone_number) query.eq('phone_number', phone_number);

      const { data: otpRecord, error: otpError } = await query.single();

      if (otpError || !otpRecord) {
        setLoading(false);
        Alert.alert('OTP Error', 'Invalid or expired OTP. Please try again.');
        return;
      }

      // Mark OTP as used
      await supabaseClient
        .from('otps')
        .update({ is_used: true })
        .eq('id', otpRecord.id);

      // Fetch user profile
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('email', email || '')
        .eq('phone_number', phone_number || '')
        .single();

      if (profileError || !profile) {
        setLoading(false);
        Alert.alert('Login Error', 'User not found');
        return;
      }

      // Update UserContext
      setUser({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || '',
        address: profile.address || '',
        current_cart_id: profile.current_cart_id || '',
      });
      setAddress(profile.address || '');

      setLoading(false);

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' as never }],
      });
    } catch (err) {
      console.error('OTP verification failed:', err);
      setLoading(false);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to {email || phone_number}
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

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Go back</Text>
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
  backText: { color: '#888', textAlign: 'center', fontSize: 15 },
});
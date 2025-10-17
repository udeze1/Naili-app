import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../appTypes/Navigation';
import { supabaseClient } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import { sendOtp, sendPasswordReset } from '../services/sendOtp';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { setUser, setAddress } = useUser(); 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // -----------------------------
  // LOGIN WITH PASSWORD (EMAIL ONLY)
  // -----------------------------
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Info', 'Please enter your email and password.');
      return;
    }

    setLoginLoading(true);
    try {
      const { data: signInData, error: signInError } =
        await supabaseClient.auth.signInWithPassword({ email, password });

      if (signInError || !signInData.user) {
        Alert.alert('Login Failed', signInError?.message || 'Invalid credentials');
        return;
      }

      const userId = signInData.user.id;

      // Fetch profile
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('id, full_name, email, phone_number, address')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        Alert.alert('Login Error', 'Could not fetch user profile.');
        return;
      }

      setUser(profile);
      setAddress(profile.address);

      // Send OTP (email verification)
      const otpResponse = await sendOtp({
        target: 'email',
        email,
        user_id: userId,
      });

      if (!otpResponse.success) {
        Alert.alert('OTP Failed', otpResponse.message || 'Could not send verification code.');
        return;
      }

      // Navigate to OTP screen
      navigation.replace('OTP', { email, phoneNumber: profile.phone_number });
    } catch (err: any) {
      console.error('Login Error:', err);
      Alert.alert('Unexpected Error', 'Please try again later.');
    } finally {
      setLoginLoading(false);
    }
  };

  // -----------------------------
  // FORGOT PASSWORD (EMAIL OR PHONE)
  // -----------------------------
  const handleForgotPassword = async () => {
    if (!email && !password) {
      Alert.alert('Enter Email', 'Please enter your email to reset your password.');
      return;
    }

    setResetLoading(true);
    try {
      const response = await sendPasswordReset({ email });
      if (response.success) {
        Alert.alert('Email Sent', 'Check your inbox to reset your password.');
      } else {
        Alert.alert('Failed', response.error || 'Could not send reset email.');
      }
    } catch (err) {
      console.error('Reset Password Error:', err);
      Alert.alert('Unexpected Error', 'Please try again later.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Forgot Password */}
        <TouchableOpacity onPress={handleForgotPassword} disabled={resetLoading}>
          <Text style={styles.forgotLink}>
            {resetLoading ? 'Sending reset...' : 'Forgot Password?'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loginLoading}>
          <Text style={styles.buttonText}>
            {loginLoading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}>Don’t have an account? Register</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 24, color: '#006400', textAlign: 'center' },
  input: { height: 48, borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 8, paddingHorizontal: 12, marginBottom: 16 },
  forgotLink: { color: '#006400', textAlign: 'right', marginBottom: 16, fontWeight: '500' },
  button: { backgroundColor: '#FFD700', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#006400', fontSize: 16, fontWeight: 'bold' },
  registerLink: { marginTop: 20, color: '#006400', textAlign: 'center', fontWeight: '500' },
});
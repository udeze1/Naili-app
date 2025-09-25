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
import { useUser } from '../context/UserContext';
import { supabaseClient } from '../lib/supabase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const RegisterScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { setUser, setAddress } = useUser();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [address, updateAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    // ✅ Require either email or phone number
    if (!fullName || !password || !address || (!email && !phoneNumber)) {
      Alert.alert('Missing Info', 'Please fill all required fields (Full name, Password, Address, Email or Phone)');
      return;
    }

    try {
      // Check if email exists (only if email provided)
      if (email) {
        const { data: existingUser } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();

        if (existingUser) {
          Alert.alert('Email Exists', 'This email is already registered. Please log in.');
          return;
        }
      }

      // Sign up with Supabase (email required for auth)
      if (!email) {
        Alert.alert('Email Required', 'You must provide an email to create an account.');
        return;
      }

      const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        Alert.alert('Signup Failed', signUpError.message);
        return;
      }

      // Sign in immediately
      const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError || !signInData.user) {
        Alert.alert('Login Failed', signInError?.message || 'No session returned');
        return;
      }

      const userId = signInData.user.id;

      // Insert profile
      const { error: insertProfileError } = await supabaseClient
        .from('profiles')
        .insert([
          {
            id: userId,
            email,
            full_name: fullName,
            phone_number: phoneNumber,
            address,
          },
        ]);
      if (insertProfileError) {
        Alert.alert('Profile Error', insertProfileError.message);
        return;
      }

      // Insert default address
      const { error: addressInsertError } = await supabaseClient
        .from('addresses')
        .insert([
          {
            user_id: userId,
            label: 'Home',
            street: address,
            city: '',
            state: '',
            is_default: true,
          },
        ]);
      if (addressInsertError) {
        Alert.alert('Address Error', addressInsertError.message);
        return;
      }

      // ✅ Generate OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Save OTP in Supabase table
      await supabaseClient.from('otps').insert([
        {
          email,
          phone_number: phoneNumber,
          code: otpCode,
          expires_at: new Date(Date.now() + 5 * 60000), // 5 min expiry
          is_used: false,
        },
      ]);

      // Send OTP via Supabase Edge Function
      await fetch('https://swqcxwhcxddivtacyyff.functions.supabase.co/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phoneNumber, code: otpCode }),
      });

      // Navigate to OTP screen
      navigation.replace('OTP', { email, phoneNumber });

    } catch (err) {
      console.error(err);
      Alert.alert('Unexpected Error', 'Please try again later');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={styles.guestButton}
        onPress={() => navigation.replace('MainTabs', { isGuest: true })}
      >
        <Text style={styles.guestText}>Continue as Guest</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Create an Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email (optional if phone provided)"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number (optional if email provided)"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.toggle}>{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={address}
          onChangeText={updateAddress}
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default RegisterScreen;

// ✅ Styles remain the same
const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 24, color: '#006400', textAlign: 'center' },
  input: { height: 48, borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 8, paddingHorizontal: 12, marginBottom: 16 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 8, paddingHorizontal: 12, marginBottom: 16 },
  passwordInput: { flex: 1, height: 48 },
  toggle: { color: '#006400', fontWeight: '600' },
  button: { backgroundColor: '#FFD700', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#006400', fontSize: 16, fontWeight: 'bold' },
  loginLink: { marginTop: 20, color: '#006400', textAlign: 'center', fontWeight: '500' },
  guestButton: { position: 'absolute', top: 10, left: 10, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1.5, borderColor: '#006400', backgroundColor: '#fff', zIndex: 10 },
  guestText: { color: '#006400', fontSize: 14, fontWeight: '600' },
});
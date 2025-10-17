import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../appTypes/Navigation';
import { useUser } from '../context/UserContext';
import { supabaseClient } from '../lib/supabase';
import { sendOtp } from '../services/sendOtp';

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
  const [loading, setLoading] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !password || !address || (!email && !phoneNumber)) {
      Alert.alert('Missing Info', 'Please fill all required fields (Full name, Password, Address, Email or Phone)');
      return;
    }

    if (!termsAgreed) {
      Alert.alert('Terms Required', 'You must agree to the Terms & Conditions and Privacy Policy to continue.');
      return;
    }

    setLoading(true);

    try {
      // ✅ Check if user already exists
      if (email) {
        const { data: existingUser } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();

        if (existingUser) {
          Alert.alert('Email Exists', 'This email is already registered. Please log in.');
          setLoading(false);
          return;
        }
      }

      // 🚀 Send OTP via Netlify + Brevo
      const otpResponse = await sendOtp({
        target: email ? 'email' : 'phone',
        email,
        phone: phoneNumber,
      });

      if (!otpResponse.success) {
        Alert.alert('OTP Failed', otpResponse.message || 'Could not send verification code.');
        setLoading(false);
        return;
      }

      const otpCode = otpResponse.otp;

      // ✅ Save OTP & user info in Supabase
      const { error: otpInsertError } = await supabaseClient.from('otp').insert([
        {
          user_id: null,
          full_name: fullName,
          email,
          phone: phoneNumber,
          password,
          address,
          otp_code: otpCode,
          type: email ? 'email' : 'phone',
          created_at: new Date().toISOString(),
          expired_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          is_used: false,
          target: email ? 'email' : 'phone',
          attempt: 0,
          terms_agreed: true,
          terms_agreed_at: new Date().toISOString(),
        },
      ]);

      if (otpInsertError) console.warn('OTP insert error:', otpInsertError);

      navigation.replace('OTP', { email, phoneNumber });
    } catch (err) {
      console.error('Register error:', err);
      Alert.alert('Unexpected Error', 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <TouchableOpacity
        style={styles.guestButton}
        onPress={() => navigation.replace('OTP', { email, phoneNumber })}
      >
        <Text style={styles.guestText}>Guest Mode</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Create an Account</Text>

        <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
        <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} />

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

        <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={updateAddress} />

        {/* ✅ Terms & Conditions Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setTermsAgreed(!termsAgreed)}
        >
          <View style={[styles.checkbox, termsAgreed && styles.checkboxChecked]} />
          <Text style={styles.checkboxText}>
            I agree to the{' '}
            <Text style={styles.link} onPress={() => Linking.openURL('https://naili.com.ng/terms.html')}>
              Terms & Conditions
            </Text>{' '}
            and{' '}
            <Text style={styles.link} onPress={() => Linking.openURL('https://naili.com.ng/privacy.html')}>
              Privacy Policy
            </Text>.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Register'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 24, color: '#006400', textAlign: 'center' },
  input: { height: 48, borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 8, paddingHorizontal: 12, marginBottom: 16 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 8, paddingHorizontal: 12, marginBottom: 16 },
  passwordInput: { flex: 1, height: 48 },
  toggle: { color: '#006400', fontWeight: '600' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 12 },
  checkbox: { width: 20, height: 20, borderWidth: 1.5, borderColor: '#006400', borderRadius: 4, marginRight: 8 },
  checkboxChecked: { backgroundColor: '#006400' },
  checkboxText: { flex: 1, color: '#333' },
  link: { color: '#006400', textDecorationLine: 'underline', fontWeight: '600' },
  button: { backgroundColor: '#FFD700', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#006400', fontSize: 16, fontWeight: 'bold' },
  loginLink: { marginTop: 20, color: '#006400', textAlign: 'center', fontWeight: '500' },
  guestButton: { position: 'absolute', top: 10, left: 10, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1.5, borderColor: '#006400', backgroundColor: '#fff', zIndex: 10 },
  guestText: { color: '#006400', fontSize: 14, fontWeight: '600' },
});
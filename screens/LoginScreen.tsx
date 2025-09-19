import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../appTypes/Navigation';
import { supabaseClient } from '../lib/supabase';
import { useUser } from '../context/UserContext';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<NavProp>();
  const { setUser, setAddress } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

 const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Missing Info', 'Please enter both email and password');
    return;
  }

  setLoading(true);

  const { data: loginData, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !loginData.user) {
    setLoading(false);
    Alert.alert('Login Failed', error?.message || 'Something went wrong');
    return;
  }

  const userId = loginData.user.id;

  // ✅ Fetch user profile info
  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    setLoading(false);
    Alert.alert('Error', 'Could not fetch user profile');
    return;
  }

  // ✅ Fetch default address
  const { data: addressData, error: addressError } = await supabaseClient
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .limit(1)
    .single();

  if (addressError) {
    console.warn('Address fetch error:', addressError.message);
  }

  // ✅ Set global user and address
  setUser({
    id: userId,
    email: loginData.user.email!,
    full_name: profile.full_name,
    phone_number: profile.phone_number,
    address: profile.address,
  });

  setAddress(addressData?.street || profile.address || '');

  setLoading(false);
  navigation.replace('MainTabs');
};

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Missing Email', 'Enter your email first to receive reset link');
      return;
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Check Your Email', 'A password reset link has been sent.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome Back</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.passwordRow}>
        <TextInput
          style={styles.inputFlex}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword((v) => !v)}
          style={styles.eyeIcon}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#006400" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.primaryButton, loading && { opacity: 0.5 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.primaryText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#006400',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotText: {
    color: '#006400',
    textAlign: 'right',
    marginBottom: 30,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryText: {
    color: '#006400',
    fontSize: 18,
    fontWeight: '600',
  },
});
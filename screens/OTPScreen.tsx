import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const OTPScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [otp, setOtp] = useState('');

  const handleVerifyOTP = () => {
    if (otp.length === 6) {
      navigation.navigate('MainTabs' as never);
    } else {
      alert('Please enter a valid 6-digit OTP');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      

      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="Enter 6-digit OTP"
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity style={styles.button} onPress={handleVerifyOTP}>
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Go back</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default OTPScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#006400', // deep green
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 18,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#006400',
    fontWeight: '600',
    fontSize: 16,
  },
  backText: {
    color: '#888',
    textAlign: 'center',
    fontSize: 15,
  },
});
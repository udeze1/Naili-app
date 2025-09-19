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
  const { setUser, setAddress } = useUser(); // Make sure your UserContext has setUser

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [address, updateAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !fullName || !phoneNumber || !address) {
      Alert.alert('Missing Info', 'Please fill all fields');
      return;
    }

    try {
      const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        Alert.alert('Signup Failed', signUpError.message);
        return;
      }

      const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !signInData.session || !signInData.user) {
        Alert.alert('Login Failed', signInError?.message || 'No session returned');
        return;
      }

      const userId = signInData.user.id;

      const { error: insertError } = await supabaseClient
        .from('profiles')
        .insert([
          {
            id: userId,
            full_name: fullName,
            phone_number: phoneNumber,
            address: address,
          },
        ]);

      if (insertError) {
        Alert.alert('Profile Error', insertError.message);
        return;
      }
   
// 📌 NEW BLOCK: Save into addresses table
    const { error: addressInsertError } = await supabaseClient
      .from('addresses')
      .insert([
        {
          user_id: userId,
          label: 'Home',
          street: address,
          city: '',     // Optional: split address later
          state: '',
          is_default: true,
        },
      ]);

    if (addressInsertError) {
      Alert.alert('Address Error', addressInsertError.message);
      return;
    }

    

      // ✅ Save to global user context
      setUser({
        id: userId,
        email,
        full_name: fullName,
        phone_number: phoneNumber,
        address,
      });
      setAddress(address);

      navigation.replace('MainTabs');
    } catch (err) {
      console.error(err);
      Alert.alert('Unexpected Error', 'Please try again later');
    }
  };

  return (
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
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
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
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#006400', // green
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    height: 48,
  },
  toggle: {
    color: '#006400', // green
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#FFD700', // yellow
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#006400',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    color: '#006400',
    textAlign: 'center',
    fontWeight: '500',
  },
});
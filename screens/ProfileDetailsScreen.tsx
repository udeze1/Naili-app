import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { supabaseClient } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import AddressForm from '../components/AddressForm'; // Adjust the import path as necessary

export default function ProfileDetailsScreen() {
  const navigation = useNavigation();
  const { user, setUser, setAddress } = useUser();

  const [phone, setPhone] = useState(user?.phone_number || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddressInput] = useState(user?.address || '');

  const handleSave = async () => {
    try {
      const { data: userData, error: userError } = await supabaseClient.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        Alert.alert('Error', 'User not logged in');
        return;
      }

      const { error } = await supabaseClient
        .from('profiles')
        .update({ phone_number: phone, email, address: address })
        .eq('id', userId);

      if (error) {
        Alert.alert('Update Failed', error.message);
        return;
      }

     setUser((prev) => {
  if (!prev) return prev;

  return {
    ...prev,
    phone_number: phone,
    email,
    address,
  };
});
      setAddress(address); // update global address for HomeTab

      Alert.alert('✅ Profile Updated', 'Your changes have been saved.');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Unexpected Error', 'Try again later');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Profile Details</Text>

      <Text style={styles.label}>📞 Phone Number</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        placeholder="Enter your phone number"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>📧 Email</Text>
      <TextInput
        style={styles.input}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        placeholderTextColor="#999"
      />

<AddressForm address={address} onChangeAddress={setAddress} />
      
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Feather name="check-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#006400',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    marginTop: 14,
    marginBottom: 4,
    color: '#444',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fdfde1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#222',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: '#006400',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
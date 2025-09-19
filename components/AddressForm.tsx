// components/AddressForm.tsx

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';

type AddressFormProps = {
  address: string;
  onChangeAddress: (text: string) => void;
};

const AddressForm: React.FC<AddressFormProps> = ({ address, onChangeAddress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>🏠 Address</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        numberOfLines={3}
        value={address}
        onChangeText={onChangeAddress}
        placeholder="Enter your address"
        placeholderTextColor="#999"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === 'ios' ? 0 : 10,
  },
  label: {
    fontSize: 14,
    marginTop: 14,
    marginBottom: 4,
    color: '#444',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fdfde1', // light yellow tone
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#222',
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default AddressForm;
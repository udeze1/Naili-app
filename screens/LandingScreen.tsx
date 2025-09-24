import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../appTypes/Navigation';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Landing'>;

export default function LandingScreen() {
  const navigation = useNavigation<NavProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Naili</Text>
      <Text style={styles.subtitle}>
     We bring you Naili: Food, Groceries, and More-delivered in one app.</Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Register')}>
        <Text style={styles.primaryText}>Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#006400', // deep green
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#555',
  },
  primaryButton: {
    backgroundColor: '#FFD700', // bright yellow
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  primaryText: {
    color: '#006400', // deep green
    fontSize: 18,
    fontWeight: '600',
  },
  link: {
    color: '#006400', // deep green
    marginTop: 16,
    fontSize: 16,
  },
});
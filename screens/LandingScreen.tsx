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
      {/* Guest button at top-left */}
      <TouchableOpacity
        style={styles.guestButton}
        onPress={() => navigation.navigate('MainTabs', { isGuest: true })}
      >
        <Text style={styles.guestText}>Continue as Guest</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Naili</Text>
        <Text style={styles.subtitle}>
          We bring you Naili: Food, Groceries, and More-delivered in one app.
        </Text>

        {/* Existing buttons */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.primaryText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  guestButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#006400',
  },
  guestText: {
    color: '#006400',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#006400',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#555',
  },
  primaryButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryText: {
    color: '#006400',
    fontSize: 18,
    fontWeight: '600',
  },
  link: {
    color: '#006400',
    marginBottom: 16,
    fontSize: 16,
  },
});
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../appTypes/Navigation';
//import Background from '../components/Background';
import { Image } from 'react-native'; 

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Landing'>;

export default function LandingScreen() {
  const navigation = useNavigation<NavProp>();

  return (
    <View style={{ flex: 1 }}>
      {/* Continue as Guest button */}
      <TouchableOpacity
        style={styles.guestButton}
        onPress={() => navigation.navigate('MainTabs', { isGuest: true })}
      >
        <Text style={styles.guestText}> Guest Mode </Text>
      </TouchableOpacity>

      {/* Top emojis */}
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>🧋 🌯</Text>
        <Text style={styles.emoji}>🍔</Text>
      </View>

      {/* Main vertical layout */}
      <View style={styles.mainContent}>
        {/* Top section */}
        <View style={styles.topContent}>
          <Text style={styles.title}>Welcome to Naili</Text>
          <Text style={styles.subtitle}>
            Food, Groceries, and More-delivered in one app.{'\n'}
            Fast, Reliable, and Convenient.
          </Text>
        </View> 

        <View style={styles.heroContainer}>
  <Image
    source={require('../assets/delivery.png')}
    style={styles.heroImage}
    resizeMode="contain"
  />
</View>

        {/* Middle empty space for image */}
        <View style={{ flex: 1 }} />

        {/* Bottom section */}
        <View style={styles.bottomContent}>
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
    </View>);
}

const styles = StyleSheet.create({
  guestButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#006400',
    backgroundColor: 'rgba(238, 229, 229, 0.7)',
    zIndex: 10,
  },
  guestText: {
    color: '#006400',
    fontSize: 14,
    fontWeight: '600',
  },
  emojiContainer: {
    position: 'absolute',
    top: 80,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 20,
  },
  emoji: {
    fontSize: 50,
  },
  mainContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    marginTop: 150,
  },
  topContent: {
    alignItems: 'center',
  },
  bottomContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#006400',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
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
    fontSize: 16,
  },
heroImage: {
  width: 550,
  height: 300,
  marginBottom: 0, // adds space before buttons
  marginTop: 0.,
  backgroundColor: '',
},
heroContainer: {
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
},

});
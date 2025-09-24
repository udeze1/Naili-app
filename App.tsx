import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { StyleSheet, Platform, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* Expo StatusBar for simple dark/light text */}
        <ExpoStatusBar style="dark" />

        {/* SafeAreaView ensures all screens are below the status bar */}
        <SafeAreaView style={styles.safeArea}>
          <UserProvider>
            <CartProvider>
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </CartProvider>
          </UserProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    // Optional: add extra padding on Android for translucent status bar
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // ✅ Import this

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}> {/* ✅ Must wrap the whole app */}
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <UserProvider>
          <CartProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </CartProvider>
        </UserProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
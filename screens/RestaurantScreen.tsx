import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeTabStackParamList } from './tabs/HomeTabStack'; // Adjust path as needed
import { useUser } from '../context/UserContext'; // Make sure this path is correct

type NavigationProp = NativeStackNavigationProp<HomeTabStackParamList, 'RestaurantScreen'>;

const RestaurantScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { address } = useUser();

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backText}> ← Restaurant</Text>
        </Pressable>
        <Text style={styles.address}>{address}</Text>
      </View>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>Vendors</Text>

      {/* Vendor Card: Noni Foods (Clickable) */}
      <Pressable
        style={styles.vendorCard}
        onPress={() => navigation.navigate('NoniFoodsScreen')}
      >
        <Text style={styles.vendorName}>Noni Foods</Text>
        <Text style={styles.vendorStatus}>Delivering now</Text>
      </Pressable>

      {/* Vendor Card: Ada Kitchen (Not Delivering) */}
      <View style={[styles.vendorCard, styles.lockedCard]}>
        <Text style={styles.vendorName}>Ada Kitchen</Text>
        <Text style={styles.vendorStatus}>Not delivering 🔒</Text>
      </View>
    </View>
  );
};

export default RestaurantScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  address: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  vendorCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  vendorStatus: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  lockedCard: {
    backgroundColor: '#e0e0e0',
    opacity: 0.5,
  },
});
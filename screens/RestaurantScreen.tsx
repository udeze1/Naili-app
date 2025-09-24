import React from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeTabStackParamList } from './tabs/HomeTabStack';
import { Ionicons } from '@expo/vector-icons'; // Tick icon

type NavigationProp = NativeStackNavigationProp<HomeTabStackParamList, 'RestaurantScreen'>;

const restaurantData = [
  { id: '1', name: 'Noni Foods', screen: 'NoniFoodsScreen', status: 'Delivering now' },
];

const RestaurantScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const renderCard = ({ item }: { item: typeof restaurantData[0] }) => (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate('NoniFoodsScreen')}
    >
      <Text style={styles.vendorName}>{item.name}</Text>
      <Text style={styles.vendorStatus}>{item.status}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.tickButton}>
          <View style={styles.tickCircle}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </View>
        </Pressable>
      </View>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>Restaurants</Text>

      {/* Restaurant List */}
      <FlatList
        data={restaurantData}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default RestaurantScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fff5',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  tickButton: {
    padding: 4,
  },
  tickCircle: {
    backgroundColor: '#1A4D2E', // dark green circle
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A4D2E',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#D9F99D',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2F3E46',
  },
  vendorStatus: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
});
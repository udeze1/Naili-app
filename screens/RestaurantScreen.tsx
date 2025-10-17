import React from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeTabStackParamList } from './tabs/HomeTabStack';
import { Ionicons } from '@expo/vector-icons'; // Tick icon

type NavigationProp = NativeStackNavigationProp<HomeTabStackParamList, 'RestaurantScreen'>;

// Define allowed screens to remove TS red lines
type NonifoodsScreens =
  | 'NoniFoodsScreen'
  | 'NoniBurgerScreen'
  | 'NoniRiceScreen'
  | 'NoniCafeScreen'
  | 'NoniSoupScreen'
  | 'NoniMamaPutScreen'
  | 'NoniBBQScreen';

const restaurantData = [
  { id: '1', name: 'Noni Foods⭐', screen: 'NoniFoodsScreen', status: 'Delivering now' },
];

const RestaurantScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const renderCard = ({ item }: { item: typeof restaurantData[0] }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        navigation.navigate(item.screen as NonifoodsScreens) // TS-friendly
      }
    >
      <Text style={styles.vendorName}>{item.name}</Text>
      <Text style={styles.vendorStatus}>{item.status}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Big Bike Illusion */}
      <View
        style={styles.bikeContainer}
        pointerEvents="none" // touches pass through
      >
        <Image
          source={require('../assets/bike-man.png')}
          style={styles.bikeImage}
          resizeMode="contain"
        />
      </View>

      {/* Top Bar */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.tickButton}>
          <View style={styles.tickCircle}>
            <Ionicons name="arrow-back" size={20} color="#014416ff" />
          </View>
        </Pressable>
        <Text style={styles.headerTitle}>Restaurants</Text>
      </View>

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
    backgroundColor: 'white', // white background
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  bikeContainer: {
    position: 'absolute',
    top: '65%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -150 }],
    width: 300,
    height: 300,
    opacity: 10, // subtle illusion
    zIndex: 0, // behind other content
  },
  bikeImage: {
    width: '100%',
    height: '100%',
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
    //backgroundColor: '#1A4D2E', // dark green circle
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A4D2E',
    marginLeft: 12,
  },
  card: {
    backgroundColor: '#ffffff', // green card text
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#949c93ff',
    shadowOpacity: 80,
    shadowRadius: 6,
    elevation: 4,

  },
  vendorName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#293527ff',
    fontStyle: 'italic',
  },
  vendorStatus: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
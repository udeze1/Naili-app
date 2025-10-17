import React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeTabStackParamList } from './tabs/HomeTabStack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<HomeTabStackParamList, 'NoniFoodsScreen'>;

const brandData = [
  { id: '1', title: 'Noni Burger & Co.', screen: 'NoniBurgerScreen' as const, emoji: '🍔' },
  { id: '2', title: 'Noni Rice & Burrito', screen: 'NoniRiceScreen' as const, emoji: '🍚' },
  { id: '3', title: 'Noni Café', screen: 'NoniCafeScreen' as const, emoji: '🧋' },
  { id: '4', title: 'Noni Soup', screen: 'NoniSoupScreen' as const, emoji: '🍲' },
  { id: '5', title: 'Noni Mama Put Deluxe', screen: 'NoniMamaPutScreen' as const, emoji: '🍛' },
  { id: '6', title: 'Noni BBQ & Grill', screen: 'NoniBBQScreen' as const, emoji: '🔥' },
] as const;

export default function NonifoodsScreen() {
  const navigation = useNavigation<NavigationProp>();

  const renderCard = ({ item }: { item: typeof brandData[number] }) => (
    <Pressable
      onPress={() => navigation.navigate(item.screen)}
      style={({ pressed }) => [
        styles.card,
        { opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={styles.title}>{item.title}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Header with Back Arrow */}
      <View style={styles.headerContainer}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#145320" />
        </Pressable>
        <Text style={styles.header}>Nonifoods Virtual Brands</Text>
      </View>

      {/* Brand List */}
      <FlatList
        data={brandData}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // fully white background
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
    padding: 4,
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    color: '#145320', // dark green for title
    flexShrink: 1, // so long titles wrap
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#ffffff', // fully white card
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  emoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#145320',
    textAlign: 'center',
  },
});
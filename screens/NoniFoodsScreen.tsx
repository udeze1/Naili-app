import React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeTabStackParamList } from './tabs/HomeTabStack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<HomeTabStackParamList, 'NoniFoodsScreen'>;

const brandData = [
  { id: '1', title: 'Noni Burger & Co.', screen: 'NoniBurgerScreen', emoji: '🍔' },
  { id: '2', title: 'Noni Rice & Burrito', screen: 'NoniRiceScreen', emoji: '🍚' },
  { id: '3', title: 'Noni Café', screen: 'NoniCafeScreen', emoji: '🧋' },
  { id: '4', title: 'Noni Soup', screen: 'NoniSoupScreen', emoji: '🍲' },
  { id: '5', title: 'Noni Mama Put Deluxe', screen: 'NoniMamaPutScreen', emoji: '🍛' },
  { id: '6', title: 'Noni BBQ & Grill', screen: 'NoniBBQScreen', emoji: '🔥' },
];

export default function NonifoodsScreen() {
  const navigation = useNavigation<NavigationProp>();

  const renderCard = ({ item }: { item: typeof brandData[0] }) => (
    <Pressable
      onPress={() => navigation.navigate(item.screen as keyof HomeTabStackParamList)}
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
      <Text style={styles.header}>Nonifoods Virtual Brands</Text>
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
    backgroundColor: '#f0fff5', // soft spiritual green background
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A4D2E', // dark green
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#D9F99D', // soft yellow-green
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  emoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2F3E46',
    textAlign: 'center',
  },
});
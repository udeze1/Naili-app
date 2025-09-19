// screens/SearchTab.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseClient } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import { useCart } from '../../context/CartContext';

export default function SearchTab() {
  const navigation = useNavigation<any>();
  const { user } = useUser();
  const { localCart, updateItem } = useCart();

  const [search, setSearch] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Restaurants' | 'NailiSupermarket'>('All');
  const [hasSearched, setHasSearched] = useState(false); // NEW: track when user has searched

  const HISTORY_KEY = 'naili_search_history_v1';

  // Load history once
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(HISTORY_KEY);
        if (raw) setHistory(JSON.parse(raw));
      } catch (err) {
        console.log('Load history error', err);
      }
    })();
  }, []);

  // Debounced auto-search
  useEffect(() => {
    const t = setTimeout(() => {
      if (search.trim()) handleSearch(search);
      else {
        setResults([]);
        setHasSearched(false); // reset so recent shows again when cleared
      }
    }, 350);
    return () => clearTimeout(t);
  }, [search, activeFilter]);

  // Query products
  const queryProducts = async (queryText: string) => {
    try {
      let qb = supabaseClient.from('products').select('*').ilike('name', `%${queryText}%`);

      if (activeFilter === 'Restaurants') {
        qb = qb.or(`brand.ilike.Noni%`); // all Noni brands
      }

      if (activeFilter === 'NailiSupermarket') {
        qb = qb.eq('brand', 'Naili Supermarket'); // strict match, no merging
      }

      const { data, error } = await qb;
      if (error) {
        console.log('Supabase search error:', error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.log('Query failed:', err);
      return [];
    }
  };

  // Handle search
  const handleSearch = async (text?: string) => {
    const queryText = (text ?? search).trim();
    if (!queryText) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setHasSearched(true); // mark searched

    // Save history
    const updatedHistory = [queryText, ...history.filter(h => h !== queryText)].slice(0, 10);
    setHistory(updatedHistory);
    AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory)).catch(() => {});

    const data = await queryProducts(queryText);
    setResults(data);
  };

  const clearHistory = () => {
    setHistory([]);
    AsyncStorage.removeItem(HISTORY_KEY).catch(() => {});
  };

  // Add to cart unified
  const addToCartUnified = async (item: any) => {
    try {
      if (user?.current_cart_id) {
        const { error } = await supabaseClient
          .from('cart_items')
          .upsert([{ cart_id: user.current_cart_id, product_id: item.id, quantity: 1, added_by: user.id }])
          .select();
        if (error) console.log('Server cart insert error:', error);
      }

      // Always update local cart too (fix!)
      const currentQty = localCart?.[item.id] || 0;
      updateItem(item.id, currentQty + 1);

    } catch (err) {
      console.log('Add to cart unified error:', err);
    }
  };

  // Map brand -> screen
  const mapBrandToScreen = (brand: string) => {
    switch (brand) {
      case 'Noni Burger & Co': return 'NoniBurgerScreen';
      case 'Noni Rice & Burrito': return 'NoniRiceScreen';
      case 'Noni Café': return 'NoniCafeScreen';
      case 'Noni Soup': return 'NoniSoupScreen';
      case 'Noni BBQ & Grill': return 'NoniBBQScreen';
      case 'Noni Mama Put Deluxe': return 'NoniMamaPutScreen';
      case 'Noni Foods': return 'NoniFoodsScreen';
      default: return null;
    }
  };

  // Handle product click
  const handleResultPress = async (item: any) => {
    if (!item) return;

    await addToCartUnified(item);

    const targetScreen = mapBrandToScreen(item.brand);
    if (!targetScreen) {
      Alert.alert('Navigation', `No screen mapped for brand "${item.brand}"`);
      return;
    }

    try {
      navigation.navigate('Home', { screen: targetScreen });
    } catch {
      try {
        navigation.navigate(targetScreen);
      } catch {
        Alert.alert('Navigation failed', 'Could not navigate to the selected screen.');
      }
    }
  };

  // Tap on recent search
  const handleHistoryPress = async (queryText: string) => {
    setSearch(queryText);
    await handleSearch(queryText);
    setHasSearched(true);
  };

  // Render results
  const renderResult = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleResultPress(item)} style={styles.resultCard}>
      <Image
        source={{ uri: item.image_url || item.image || 'https://via.placeholder.com/100x100.png?text=No+Image' }}
        style={styles.foodImage}
        resizeMode="cover"
      />
      <View style={styles.resultTextContainer}>
        <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.foodBrand} numberOfLines={1}>{item.brand}</Text>
        <Text style={styles.foodPrice}>₦{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render history
  const renderHistory = ({ item }: { item: string }) => (
    <TouchableOpacity onPress={() => handleHistoryPress(item)} style={styles.historyItem}>
      <Feather name="clock" size={16} color="#999" style={{ marginRight: 10 }} />
      <Text style={{ fontSize: 16, color: '#444' }}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBar}>
        <Feather name="search" size={20} color="#666" />
        <TextInput
          placeholder="Search food, stores..."
          value={search}
          onChangeText={setSearch}
          style={styles.input}
          placeholderTextColor="#999"
        />
      </View>

      {/* Filters */}
<View style={styles.filters}>
  {(['All', 'Restaurants', 'NailiSupermarket'] as const).map(f => (
    <TouchableOpacity
      key={f}
      style={[styles.filterButton, activeFilter === f && styles.activeFilter]}
      onPress={() => { setActiveFilter(f); handleSearch(search); }}
    >
      <Text style={[styles.filterText, activeFilter === f && styles.activeFilterText]}>
        {f === 'NailiSupermarket' ? 'Naili Supermarket' : f}
      </Text>
    </TouchableOpacity>
  ))}
</View>

      {/* Recent searches - only show if not searched */}
      {!hasSearched && history.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontWeight: '600', fontSize: 16 }}>Recent Searches</Text>
            <TouchableOpacity onPress={clearHistory}><Text style={{ color: '#0A9D4C' }}>Clear</Text></TouchableOpacity>
          </View>
          <FlatList data={history} renderItem={renderHistory} keyExtractor={(h, i) => h + i} />
        </View>
      )}

      {/* Results */}
      {results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={(item) => String(item.id ?? item.name)}
          contentContainerStyle={{ paddingTop: 12 }}
        />
      ) : hasSearched && search.length > 0 ? (
        <View style={{ marginTop: 30 }}>
          <Text style={{ textAlign: 'center', color: '#999' }}>No results found for "{search}"</Text>
        </View>
      ) : (
        <View style={styles.emptyPrompt}>
          <Text style={styles.emptyText}>🛒 Search for an item...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 40 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  input: { flex: 1, fontSize: 16, marginLeft: 10, paddingVertical: 6, color: '#333' },
  filters: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
  filterButton: { flexGrow: 1, flexShrink: 1, paddingVertical: 8, marginHorizontal: 4, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff', alignItems: 'center' },
  activeFilter: { backgroundColor: '#0A9D4C', borderColor: '#0A9D4C' },
  filterText: { fontSize: 14, color: '#333' },
  activeFilterText: { color: '#fff', fontWeight: 'bold' },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  resultCard: { flexDirection: 'row', padding: 12, backgroundColor: '#f9f9f9', borderRadius: 10, marginBottom: 12, alignItems: 'center' },
  foodImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
  resultTextContainer: { flex: 1, marginLeft: 12, flexShrink: 1 },
  foodName: { fontSize: 16, fontWeight: '600', color: '#333' },
  foodBrand: { fontSize: 14, color: '#888', marginTop: 2 },
  foodPrice: { fontSize: 14, color: '#0A9D4C', marginTop: 4 },
  emptyPrompt: { marginTop: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999', fontStyle: 'italic' },
});
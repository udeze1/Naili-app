// screens/NoniBurgerScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeTabStackParamList } from './tabs/HomeTabStack';
import { useCart } from '../context/CartContext';
import { supabaseClient } from '../lib/supabase';

type MenuItem = {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  image_url?: string;
};

export default function NoniBurgerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeTabStackParamList>>();
  const { localCart, updateItem } = useCart();

  const [totalPrice, setTotalPrice] = useState(0);
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const totalCount = Object.values(localCart).reduce((sum, qty) => sum + qty, 0);

  // Calculate total price whenever cart changes
  useEffect(() => {
    const calculateTotal = async () => {
      const productIds = Object.keys(localCart);
      if (!productIds.length) {
        setTotalPrice(0);
        return;
      }

      const { data, error } = await supabaseClient
        .from('products')
        .select('id, price')
        .in('id', productIds);

      if (error) {
        console.error('Error calculating total price:', error.message);
        return;
      }

      const total = data.reduce((sum, item) => {
        const qty = localCart[item.id] || 0;
        return sum + qty * item.price;
      }, 0);

      setTotalPrice(total);
    };

    calculateTotal();
  }, [localCart]);

  // Load products for Noni Burger
  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('brand', 'Noni Burger & Co');

      if (error) console.error('Error fetching products:', error.message);
      else setProducts(data || []);

      setLoading(false);
    };

    loadProducts();
  }, []);

  const increaseQty = (item: MenuItem) => {
    const currentQty = localCart[item.id] || 0;
    updateItem(String(item.id), currentQty + 1);
  };

  const decreaseQty = (item: MenuItem) => {
    const currentQty = localCart[item.id] || 0;
    if (currentQty > 0) updateItem(String(item.id), currentQty - 1);
  };

  const renderItem = ({ item }: { item: MenuItem }) => {
    const qty = localCart[item.id] || 0;

    return (
      <View style={styles.item} key={item.id}>
        {/* Left: Product info */}
        <View style={styles.itemLeft}>
          <Text style={styles.name}>{item.name}</Text>
          {item.description && <Text style={styles.desc}>{item.description}</Text>}
          <Text style={styles.price}>₦{item.price}</Text>
        </View>

        {/* Right: Image + controls unified */}
        <View style={styles.itemRight}>
          <View style={styles.imageBox}>
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.image} />
            )}

            <View style={styles.controls}>
              <TouchableOpacity onPress={() => decreaseQty(item)} style={styles.btn}>
                <Text style={styles.btnText}>−</Text>
              </TouchableOpacity>

              <Text style={styles.qty}>{qty}</Text>

              <TouchableOpacity onPress={() => increaseQty(item)} style={styles.btn}>
                <Text style={styles.btnText}>＋</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
        <Ionicons name="arrow-back" size={24} color="#14532D" />
        <Text style={styles.title}>Noni Burger</Text>
      </TouchableOpacity>

      <Text style={styles.energyHeader}>🔥 Nri oma, ike n’uzo</Text>
      <Text style={styles.quote}>“A ga-esi nri mara mma, si eze maa eze.”</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#14532D" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {products.map((item) => renderItem({ item }))}
        </ScrollView>
      )}

      {totalCount > 0 && (
        <View style={styles.checkoutBar}>
          <Text style={styles.cartSummary}>🍔 {totalCount} · ₦{totalPrice}</Text>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => navigation.navigate('CartScreen')}
          >
            <Text style={styles.checkoutText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  backRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 12, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: '#14532D', marginLeft: 8 },
  energyHeader: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
    color: '#14532D',
    marginBottom: 4,
  },
  quote: { textAlign: 'center', fontSize: 13, fontStyle: 'italic', marginBottom: 10, color: '#444' },
  list: { paddingBottom: 140, paddingHorizontal: 12 },

  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F6FFF6',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  itemLeft: { flex: 1, justifyContent: 'center' },
  name: { fontWeight: '600', fontSize: 16, color: '#111' },
  desc: { fontSize: 13, color: '#444', marginVertical: 2 },
  price: { color: '#14532D', fontSize: 14, marginTop: 4 },

  itemRight: { alignItems: 'center' },
  imageBox: { alignItems: 'center', backgroundColor: '#DCFCE7', padding: 6, borderRadius: 10 },
  image: { width: 70, height: 70, borderRadius: 8, backgroundColor: '#eee' },
  controls: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  btn: {
    backgroundColor: '#14532D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  btnText: { fontSize: 18, color: '#fff' },
  qty: { marginHorizontal: 10, fontSize: 16 },

  checkoutBar: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cartSummary: { fontSize: 14, fontWeight: '600', color: '#14532D' },
  checkoutButton: {
    backgroundColor: '#FACC15',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  checkoutText: { fontWeight: '700', fontSize: 14, color: '#111' },
});
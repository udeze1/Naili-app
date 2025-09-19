import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { confirmOrder } from '../services/cart';
import { supabaseClient } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeTabStackParamList } from './tabs/HomeTabStack';
import { Swipeable } from 'react-native-gesture-handler';

type CartScreenNavProp = NativeStackNavigationProp<HomeTabStackParamList, 'CartScreen'>;

export default function CartScreen() {
  const { user } = useUser();
  const { localCart, cartItems, removeFromCart, clearCart } = useCart();
  const navigation = useNavigation<CartScreenNavProp>();

  const [productsInCart, setProductsInCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'delivery'>('orders');

  const deliveryFee = 1500;

  useEffect(() => {
    const fetchProducts = async () => {
      const productIds = Object.keys(localCart);
      if (productIds.length === 0) {
        setProductsInCart([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .in('id', productIds);

      if (error) {
        console.error('Failed to fetch cart products:', error.message);
      } else {
        setProductsInCart(data || []);
      }

      setLoading(false);
    };

    fetchProducts();
  }, [localCart]);

  useEffect(() => {
    if (user?.address) setDeliveryAddress(user.address);
    if (user?.phone_number) setDeliveryPhone(user.phone_number);
  }, [user]);

  const totalCount = Object.values(localCart).reduce((sum, q) => sum + q, 0);

  const itemTotal = productsInCart.reduce((sum, item) => {
    const qty = localCart[item.id] || 0;
    return sum + qty * item.price;
  }, 0);

  const totalPayable = itemTotal + deliveryFee;

  const handleConfirmOrder = async () => {
    if (!deliveryAddress || !deliveryPhone) {
      alert('Please enter address and phone number');
      return;
    }

    if (!user) {
      alert('User not logged in');
      return;
    }

    if (productsInCart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    const isMockUser = __DEV__ || user.id === '00000000-0000-0000-0000-000000000001';

    const result = await confirmOrder({
      userId: user.id,
      items: cartItems,
      delivery_address: deliveryAddress,
      delivery_phone: deliveryPhone,
      delivery_note: deliveryNote,
    });

    if (result?.orderId || isMockUser) {
      navigation.navigate('PaymentOptionScreen', {
        amount: Number(totalPayable),
        orderId: String(result?.orderId || 'mock-order-id'),
      });
    } else {
      alert('Failed to place order. Try again.');
    }
  };

  const renderRightActions = (itemId: string) => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => removeFromCart(itemId)}
    >
      <Ionicons name="trash-outline" size={24} color="#fff" />
    </TouchableOpacity>
  );

  const renderOrderItem = (item: any) => (
    <Swipeable
      key={item.id}
      renderRightActions={() => renderRightActions(item.id)}
    >
      <View style={styles.item}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={{ width: 48, height: 48, borderRadius: 6 }}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={20} color="#9ca3af" />
            </View>
          )}
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.itemText}>
              {item.name} x {localCart[item.id]}
            </Text>
            {item.brand && (
              <Text style={styles.brandText}>
                From: {item.brand}
              </Text>
            )}
          </View>
        </View>
        <Text style={styles.itemPrice}>
          ₦{item.price * (localCart[item.id] || 0)}
        </Text>
      </View>
    </Swipeable>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 8 }}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.heading}>Your Cart</Text>
          </View>

          {activeTab === 'orders' && productsInCart.length > 0 && (
            <TouchableOpacity onPress={clearCart}>
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'orders' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('orders')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'orders' && styles.activeTabText,
              ]}
            >
              Your Orders
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'delivery' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('delivery')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'delivery' && styles.activeTabText,
              ]}
            >
              Delivery Info
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === 'orders' ? (
            loading ? (
              <ActivityIndicator size="large" color="#14532D" style={{ marginTop: 40 }} />
            ) : productsInCart.length === 0 ? (
              <Text style={{ marginTop: 40, textAlign: 'center', color: '#666' }}>
                Your cart is empty.
              </Text>
            ) : (
              <>
                {productsInCart.map(renderOrderItem)}

                <View style={{ marginTop: 16 }}>
                  <Text style={{ fontWeight: '600', fontSize: 16, color: '#065f46' }}>
                    Order Summary
                  </Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryText}>Items Total:</Text>
                    <Text style={styles.summaryText}>₦{itemTotal}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryText}>Delivery Fee:</Text>
                    <Text style={styles.summaryText}>₦{deliveryFee}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryText, { fontWeight: 'bold' }]}>Total:</Text>
                    <Text style={[styles.summaryText, { fontWeight: 'bold' }]}>₦{totalPayable}</Text>
                  </View>
                </View>
              </>
            )
          ) : (
            <>
              <Text style={styles.deliveryLabel}>Delivery Address</Text>
              <TextInput
                style={styles.input}
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                placeholder="Enter delivery address"
                placeholderTextColor="#999"
                multiline
              />

              <Text style={styles.deliveryLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={deliveryPhone}
                onChangeText={setDeliveryPhone}
                placeholder="Enter phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />

              <Text style={styles.deliveryLabel}>Delivery Note</Text>
              <TextInput
                style={styles.input}
                value={deliveryNote}
                onChangeText={setDeliveryNote}
                placeholder="Optional note (e.g., drop at gate)"
                placeholderTextColor="#999"
              />
            </>
          )}
        </ScrollView>

        {/* Confirm Button */}
        <TouchableOpacity
          onPress={handleConfirmOrder}
          style={[styles.button, { opacity: totalCount > 0 ? 1 : 0.5 }]}
          disabled={totalCount === 0}
        >
          <Text style={styles.buttonText}>Confirm Order · ₦{totalPayable}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 44 : 20, // ✅ push below status bar
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heading: { fontSize: 22, fontWeight: 'bold' },
  tabContainer: { flexDirection: 'row', marginBottom: 10 },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  activeTab: { borderColor: '#065f46' },
  tabText: { fontSize: 15, color: '#666' },
  activeTabText: { fontWeight: 'bold', color: '#065f46' },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flexShrink: 1,
    flexWrap: 'wrap', // ✅ wrap long text
  },
  itemPrice: { fontWeight: 'bold', fontSize: 16, color: '#065f46', marginLeft: 8 },
  brandText: {
    fontStyle: 'italic',
    color: '#888',
    fontSize: 13,
    marginTop: 2,
    flexWrap: 'wrap', // ✅ wrap brand
  },
  placeholderImage: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 10,
    color: '#065f46',
  },
  input: {
    backgroundColor: '#fdfde1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  summaryText: { fontSize: 15, color: '#111827' },
  button: {
    marginTop: 12,
    backgroundColor: '#facc15',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { fontWeight: 'bold', fontSize: 16, color: '#065f46' },
  deleteAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    borderRadius: 6,
    marginVertical: 4,
  },
});
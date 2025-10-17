import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabaseClient } from '../lib/supabase';
import * as Linking from 'expo-linking';
import { v4 as uuidv4 } from 'uuid';
import { HomeTabStackParamList } from './tabs/HomeTabStack';

type Props = NativeStackScreenProps<HomeTabStackParamList, 'GroupOrderScreen'>;

type Participant = {
  id: string;
  user_id?: string;
  guest_id?: string;
  qty: number;
  status: 'pending' | 'paid';
};

type GroupOrder = {
  id: string;
  invite_token: string; // token guests use
  product_id: string;
  target_qty: number;
  current_qty: number;
  status: 'open' | 'locked' | 'completed';
};

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string;
};

export default function GroupOrderScreen({ route, navigation }: Props) {
  const [groupOrderId, setGroupOrderId] = useState<string | undefined>(
    route.params?.groupOrderId
  );

  // Guest ID for users not logged in
  const [userId] = useState<string>(
    route.params?.userId || `guest-${uuidv4()}`
  );

  const [groupOrder, setGroupOrder] = useState<GroupOrder | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [qty, setQty] = useState<number>(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [groupCart, setGroupCart] = useState<{ product: Product; qty: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // -----------------------
  // Deep link handling
  // -----------------------
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const parsed = Linking.parse(event.url);
      const segments = parsed.path?.split('/').filter(Boolean) || [];
      
      // ✅ Only accept links like: https://naili.com.ng/group/<invite_token>
      if (segments[0] === 'group' && segments[1]) {
        console.log('Deep link token:', segments[1]);
        setGroupOrderId(segments[1]); // treat as invite_token
      } else {
        console.warn('Invalid group link:', event.url);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!groupOrderId) return;
    loadGroupOrder();
    loadParticipants();
  }, [groupOrderId]);

  // -----------------------
  // Fetch group order by invite_token (works for guests)
  // -----------------------
  const loadGroupOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!groupOrderId || groupOrderId.length < 5) {
        throw new Error('Invalid Group Order Link.');
      }

      const { data: groupData, error: groupError } = await supabaseClient
        .from('group_orders')
        .select('*')
        .eq('invite_token', groupOrderId)
        .maybeSingle();

      if (groupError) throw groupError;
      if (!groupData) throw new Error('Group order not found. Invite token may be expired.');

      setGroupOrder(groupData);

      // Load product info
      const { data: productData, error: productError } = await supabaseClient
        .from('products')
        .select('*')
        .eq('id', groupData.product_id)
        .maybeSingle();

      if (productError) throw productError;
      if (!productData) throw new Error('Product not found');

      setProduct(productData);
      setGroupCart([{ product: productData, qty }]);
    } catch (err: any) {
      console.error('Fetch group order failed:', err);
      setError(err.message || 'Failed to load group order');
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async () => {
    try {
      if (!groupOrder) return;
      const { data, error } = await supabaseClient
        .from('group_order_participants')
        .select('*')
        .eq('group_order_id', groupOrder.id);

      if (error) throw error;
      setParticipants(data || []);
    } catch (err) {
      console.error('Fetch participants failed:', err);
    }
  };

  // -----------------------
  // Join group order
  // -----------------------
  const joinGroupOrder = async () => {
    if (!product || !groupOrder) return;

    if (userId.startsWith('guest-')) {
      Alert.alert('Guest mode', 'Guests cannot join. Please create an account.');
      return;
    }

    try {
      await supabaseClient.from('group_order_participants').insert({
        group_order_id: groupOrder.id,
        user_id: userId,
        qty,
      });

      const newQty = groupOrder.current_qty + qty;
      await supabaseClient
        .from('group_orders')
        .update({ current_qty: newQty })
        .eq('id', groupOrder.id);

      setGroupCart([{ product, qty }]);
      loadGroupOrder();
      loadParticipants();
    } catch (err) {
      console.error('Join group order failed:', err);
    }
  };

  // -----------------------
  // Share invite link
  // -----------------------
  const shareLink = () => {
    if (!groupOrder) return;
    const link = `https://naili.com.ng/group/${groupOrder.invite_token}`; 
    Linking.openURL(`whatsapp://send?text=Join our group buy! ${link}`);
  };

  const totalPrice = groupCart.reduce((sum, item) => sum + item.qty * item.product.price, 0);

  if (loading)
    return (
      <View style={styles.container}>
        <Text>Loading group order...</Text>
      </View>
    );

  if (error || !groupOrder || !product)
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red' }}>Error: {error || 'Group order not found'}</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image_url }} style={styles.productImage} />
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>₦{product.price}</Text>

      <Text style={styles.progressText}>
        Progress: {groupOrder.current_qty} / {groupOrder.target_qty}
      </Text>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${(groupOrder.current_qty / groupOrder.target_qty) * 100}%` },
          ]}
        />
      </View>

      <Text style={styles.sectionTitle}>Join this order:</Text>
      <View style={styles.qtyContainer}>
        <Button title="-" onPress={() => setQty(Math.max(1, qty - 1))} />
        <Text style={styles.qtyText}>{qty}</Text>
        <Button title="+" onPress={() => setQty(qty + 1)} />
      </View>

      <Button
        title="Join Group Order"
        onPress={joinGroupOrder}
        disabled={userId.startsWith('guest-')}
      />

      <Text style={styles.sectionTitle}>Participants:</Text>
      <FlatList
        data={participants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text>{item.user_id || item.guest_id || 'Guest'} - {item.qty} - {item.status}</Text>
        )}
      />

      <View style={styles.groupCart}>
        <Text style={styles.sectionTitle}>Group Cart:</Text>
        {groupCart.map((item) => (
          <Text key={item.product.id}>
            {item.product.name} x {item.qty} = ₦{item.qty * item.product.price}
          </Text>
        ))}
        <Text style={styles.totalPrice}>Total: ₦{totalPrice}</Text>
      </View>

      {groupOrder.status === 'locked' && (
        <Button
          title="Checkout"
          onPress={() => {
            if (userId.startsWith('guest-')) {
              Alert.alert('Guest mode', 'Please create an account to checkout');
            } else {
              // redirect to Paystack
            }
          }}
        />
      )}

      <Button title="Share Invite" onPress={shareLink} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  productImage: { width: '100%', height: 200, borderRadius: 10 },
  productName: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  productPrice: { fontSize: 16, color: '#555' },
  progressText: { marginTop: 20 },
  progressBar: { height: 20, backgroundColor: '#eee', marginVertical: 10, borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: 'green' },
  sectionTitle: { marginTop: 15, fontWeight: 'bold', fontSize: 16 },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  qtyText: { marginHorizontal: 10, fontSize: 16 },
  groupCart: { marginTop: 20, paddingVertical: 10, borderTopWidth: 1, borderColor: '#ccc' },
  totalPrice: { marginTop: 5, fontWeight: 'bold' },
});
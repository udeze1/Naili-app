import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { supabaseClient } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';

const OrdersScreen = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user?.id) fetchOrders();
  }, [user?.id]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error.message);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const renderOrder = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderTitle}>Order #{item.id}</Text>
      <Text style={styles.orderStatus}>Status: {item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Order History</Text>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : orders.length === 0 ? (
        <View style={styles.emptyView}>
          <Text style={styles.emptyText}>No orders yet</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrder}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 30,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#F4F4F4',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderStatus: {
    marginTop: 4,
    color: '#777',
  },
  emptyView: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#555',
  },
});
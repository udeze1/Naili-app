import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { supabaseClient } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../appTypes/Navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const OtherTab = () => {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<'Ongoing' | 'Delivered'>('Ongoing');
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

  const filteredOrders = orders.filter(order =>
    activeTab === 'Ongoing'
      ? order.status !== 'delivered'
      : order.status === 'delivered'
  );

  const renderOrder = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderTitle}>Order #{item.id}</Text>
      <Text style={styles.orderStatus}>Status: {item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Orders</Text>
      </View>

      {/* Tab selector */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Ongoing' && styles.tabActive]}
          onPress={() => setActiveTab('Ongoing')}
        >
          <Text style={styles.tabText}>Ongoing</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Delivered' && styles.tabActive]}
          onPress={() => setActiveTab('Delivered')}
        >
          <Text style={styles.tabText}>Delivered</Text>
        </TouchableOpacity>
      </View>

      {/* Orders or fallback */}
      {loading ? (
        <Text style={{ marginTop: 30, textAlign: 'center' }}>Loading...</Text>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyView}>
          <Text style={styles.emptyText}>No orders yet</Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.startButtonText}>Start Ordering</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrder}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
};

export default OtherTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  tabActive: {
    borderColor: '#00B686',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
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
    color: '#55AE63',
    marginBottom: 12,
  },
  startButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#008000',
  },
});
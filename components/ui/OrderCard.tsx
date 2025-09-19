import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type Props = {
  vendor: string;
  status: string;
  items: string[];
  date: Date;
  orderId: string;
  price: string;
  eta?: number | null;
  onReorder: () => void;
};

const OrderCard = ({
  vendor,
  status,
  items,
  date,
  orderId,
  price,
  eta,
  onReorder,
}: Props) => {
  const [countdown, setCountdown] = useState<number | null>(eta ?? null);

  useEffect(() => {
    if (status === 'Ongoing' && eta) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev !== null) {
            return prev > 0 ? prev - 1 : 0;
          }
          return null;
        });
      }, 60000); // Decrease every minute
      return () => clearInterval(interval);
    }
  }, [eta]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.vendor}>{vendor}</Text>
        <Text style={styles.status}>{status}</Text>
      </View>

      <Text style={styles.itemText}>{items.join(', ')}</Text>

      <View style={styles.meta}>
        <Text style={styles.metaText}>Order ID: {orderId}</Text>
        <Text style={styles.metaText}>Price: {price}</Text>
        {status === 'Ongoing' && countdown !== null && (
          <Text style={styles.metaText}>ETA: {countdown} min</Text>
        )}
      </View>

      <TouchableOpacity onPress={onReorder}>
        <Text style={styles.reorder}>↻ Reorder</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OrderCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  vendor: {
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontSize: 14,
    color: '#007AFF',
  },
  itemText: {
    fontSize: 14,
    marginBottom: 4,
  },
  meta: {
    marginTop: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#555',
  },
  reorder: {
    marginTop: 10,
    color: '#007AFF',
    fontWeight: '500',
    fontSize: 14,
  },
});
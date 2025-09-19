import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeTabStackParamList } from './HomeTabStack';
import { useUser } from '../../context/UserContext';
import { supabaseClient } from '../../lib/supabase';

type HomeTabNavigationProp = NativeStackNavigationProp<HomeTabStackParamList, 'HomeTab'>;

type Product = {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  brand: string;
};

const HomeTab = () => {
  const navigation = useNavigation<HomeTabNavigationProp>();
  const { address } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const quickActions = [
    { label: 'Restaurants', key: 'Restaurants', emoji: '🍽️' },
    { label: 'Naili Supermarket', key: 'Supermarkets', emoji: '🏪' },
    { label: 'Pharmacies', key: 'Pharmacy', emoji: '💊' },
    { label: 'More', key: 'More', emoji: '➕' },
  ];

  const allowedBrands = [
    'Noni Burger & Co',
    'Noni Rice & Burrito',
    'Noni Café',
    'Noni Soup',
    'Noni BBQ & Grill',
  ];

  const brandToScreenMap: Record<string, keyof HomeTabStackParamList> = {
    'Noni Burger & Co': 'NoniBurgerScreen',
    'Noni Rice & Burrito': 'NoniRiceScreen',
    'Noni Café': 'NoniCafeScreen',
    'Noni Soup': 'NoniSoupScreen',
    'Noni BBQ & Grill': 'NoniBBQScreen',
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabaseClient
      .from('products')
      .select('id, name, price, image_url, brand')
      .eq('is_available', true);

    if (error) {
      console.error('Error fetching products:', error.message);
      setLoading(false);
      return;
    }

    const filtered: Product[] = [];
    const seenPerBrand: Record<string, number> = {};

    for (const item of data || []) {
      if (allowedBrands.includes(item.brand)) {
        if (!seenPerBrand[item.brand]) seenPerBrand[item.brand] = 0;
        if (seenPerBrand[item.brand] < 4) {
          filtered.push(item);
          seenPerBrand[item.brand]++;
        }
      }
    }

    setProducts(filtered);
    setLoading(false);
  };

  const handleQuickAction = (key: string) => {
    switch (key) {
      case 'Restaurants':
        navigation.navigate('RestaurantScreen');
        break;
      case 'Supermarkets':
        navigation.navigate('NailiSupermarketScreen');
        break;
      case 'Pharmacy':
        navigation.navigate('PharmacyScreen');
        break;
      case 'More':
        navigation.navigate('MoreScreen');
        break;
    }
  };

  const handleProductPress = (brand: string) => {
    const screen = brandToScreenMap[brand];
    if (screen) {
      navigation.navigate(screen);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Address Section */}
        <TouchableOpacity
          style={styles.addressContainer}
          onPress={() => navigation.navigate('DeliveryAddressScreen')}
        >
          <Text style={styles.addressLabel}>Deliver to</Text>
          <Text style={styles.addressValue}>{address || 'Select address'}</Text>
        </TouchableOpacity>

        {/* Promo Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Experience Naili first-hand</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          {quickActions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickActionBox}
              onPress={() => handleQuickAction(item.key)}
            >
              <Text style={styles.quickActionText}>
                {item.emoji} {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Explore */}
        <Text style={styles.sectionTitle}>Explore</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0f0" />
        ) : (
          products.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.productCard}
              onPress={() => handleProductPress(item.brand)}
            >
              <Image
                source={{
                  uri:
                    item.image_url ||
                    'https://via.placeholder.com/300x200.png?text=No+Image',
                }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>₦{item.price}</Text>
                <Text style={styles.productBrand}>{item.brand}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default HomeTab;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 12,
    color: '#888',
  },
  addressValue: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 4,
    color: '#111',
  },
  banner: {
    backgroundColor: '#fdfde1',
    padding: 28,
    borderRadius: 12,
    marginBottom: 28,
    alignItems: 'center',
    borderColor: '#c6e700',
    borderWidth: 1.2,
  },
  bannerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 28,
  },
  quickActionBox: {
    width: '48%',
    backgroundColor: '#d1f5c2',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderColor: '#a2e300',
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#114400',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111',
  },
  productCard: {
    backgroundColor: '#fffbe7',
    borderRadius: 10,
    marginBottom: 14,
    overflow: 'hidden',
    borderColor: '#dcd200',
    borderWidth: 1,
  },
  productImage: {
    width: '100%',
    height: 140,
  },
  productInfo: {
    padding: 6,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    color: '#555',
  },
  productBrand: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});
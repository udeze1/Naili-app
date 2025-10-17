import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Animated,
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
  is_available: boolean;
};

const slogans = [
  "Fresh & Fast 🌱",
  "Delivered with ❤️",
  "Taste the Magic ✨",
  "Your Chi, Your Choice 🌟",
  "Good Food, Good Vibes 🍽️",
  "Experience Naili First-Hand 🚀",
  "Bringing Joy to Your Table 🥗",
];

const bannerColors = [
  '#d1f5c2',
  '#fdfde1',
  '#ffe5d4',
  '#e0f7fa',
  '#fce4ec',
  '#fff9c4',
  '#e1bee7',
];

const HomeTab = () => {
  const navigation = useNavigation<HomeTabNavigationProp>();
  const { address } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerTextIndex, setBannerTextIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const quickActions = [
    { label: 'Restaurants', key: 'Restaurants', emoji: '🍽️' },
    { label: 'Naili Supermarket', key: 'Supermarkets', emoji: '🏪' },
    { label: 'Pharmacies', key: 'Pharmacy', emoji: '💊' },
    { label: 'GroupOrder', key: 'GroupOrder', emoji: '➕' },
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

  // Animate header text + color
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      setBannerTextIndex((prev) => (prev + 1) % slogans.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabaseClient
      .from('products')
      .select('id, name, price, image_url, brand, is_available');

    if (error) {
      console.error('Error fetching products:', error.message);
      setLoading(false);
      return;
    }

    // Shuffle products for Explore section
    const shuffled = (data || []).sort(() => Math.random() - 0.5);

    const filtered: Product[] = [];
    const seenPerBrand: Record<string, number> = {};

    for (const item of shuffled) {
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
      case 'GroupOrder':
        navigation.navigate('GroupOrderScreen', { groupOrderId: 'someGroupOrderIdFromDB', userId: 'currentUser?.id' });
        break;
    }
  };

  const handleProductPress = (brand: string) => {
    const screen = brandToScreenMap[brand];
    if (screen) navigation.navigate(screen);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Address Section */}
        <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}></Text>
          <TouchableOpacity onPress={() => navigation.navigate('DeliveryAddressScreen')}>
            <Text style={styles.addressValue}>{address || 'Select address'}</Text>
          </TouchableOpacity>
        </View>

        {/* Animated Header */}
        <View style={[styles.banner, { backgroundColor: bannerColors[bannerTextIndex] }]}>
          <Animated.Text style={[styles.bannerText, { opacity: fadeAnim }]}>
            {slogans[bannerTextIndex]}
          </Animated.Text>
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

        {/* Explore / Food Cards */}
        <Text style={styles.sectionTitle}>Explore</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0f0" />
        ) : (
          products.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.productCard, { backgroundColor: '#fff' }]}
              onPress={() => handleProductPress(item.brand)}
              disabled={!item.is_available}
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
              {!item.is_available && (
                <View style={styles.notAvailableOverlay}>
                  <Text style={styles.notAvailableText}>Not Available</Text>
                </View>
              )}
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 12,
    color: '#888',
    marginRight: 6,
  },
  addressValue: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 4,
    color: '#111',
  },
  banner: {
    height: 140,
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#114400',
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
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
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
    borderRadius: 10,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#fff',
    position: 'relative',
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
  notAvailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notAvailableText: {
    color: '#b91c1c',
    fontWeight: '700',
    fontSize: 16,
  },
});
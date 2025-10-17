import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeTab from './HomeTab';

import RestaurantScreen from '../../screens/RestaurantScreen';
import NailiSupermarketScreen from '../NailiSupermarketScreen';
import PharmacyScreen from '../PharmacyScreen';

import NoniFoodsScreen from '../NoniFoodsScreen';
import NoniBBQScreen from '../NoniBBQScreen';
import NoniCafeScreen from '../NoniCafeScreen';
import NoniMamaPutScreen from '../NoniMamaPutScreen';
import NoniRiceScreen from '../NoniRiceScreen';
import NoniSoupScreen from '../NoniSoupScreen';
import NoniBurgerScreen from '../NoniBurgerScreen';

import CartScreen from '../CartScreen';
import DeliveryAddressScreen from '../DeliveryAddressScreen';
import GroupOrderScreen from '../GroupOrderScreen';
import PaymentOptionScreen from '../PaymentOptionScreen';

export type HomeTabStackParamList = {
  HomeTab: undefined;
  RestaurantScreen: undefined;
  NailiSupermarketScreen: undefined;
  PharmacyScreen: undefined;
  ProfileDetailsScreen: undefined;
  ProfileScreen: undefined;

  NoniFoodsScreen: undefined;
  NoniBBQScreen: undefined;
  NoniCafeScreen: undefined;
  NoniMamaPutScreen: undefined;
  NoniRiceScreen: undefined;
  NoniSoupScreen: undefined;
  NoniBurgerScreen: undefined;

  CartScreen: undefined;
  DeliveryAddressScreen: undefined;
  PaymentOptionScreen: { 
    amount: number;
    orderId: string;
  }

CustomerFeedbackScreen: undefined;
  GroupOrderScreen: { groupOrderId: string; userId: string};
};

const Stack = createNativeStackNavigator<HomeTabStackParamList>();

const HomeTabStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false, // ✅ keep UI clean
      }}
    >
      <Stack.Screen name="HomeTab" component={HomeTab} />
      <Stack.Screen name="RestaurantScreen" component={RestaurantScreen} />
      <Stack.Screen name="NailiSupermarketScreen" component={NailiSupermarketScreen} />
      <Stack.Screen name="PharmacyScreen" component={PharmacyScreen} />

      {/* 🍽️ Noni Virtual Brands */}

      {/* 🍔 Noni Virtual Brands */}
      <Stack.Screen name="NoniFoodsScreen" component={NoniFoodsScreen} />
      <Stack.Screen name="NoniBBQScreen" component={NoniBBQScreen} />
      <Stack.Screen name="NoniCafeScreen" component={NoniCafeScreen} />
      <Stack.Screen name="NoniMamaPutScreen" component={NoniMamaPutScreen} />
      <Stack.Screen name="NoniRiceScreen" component={NoniRiceScreen} />
      <Stack.Screen name="NoniSoupScreen" component={NoniSoupScreen} />
      <Stack.Screen name="NoniBurgerScreen" component={NoniBurgerScreen} />

      {/* 🛒 Order Flow */}
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="DeliveryAddressScreen" component={DeliveryAddressScreen} />
      <Stack.Screen name="PaymentOptionScreen" component={PaymentOptionScreen} />

      {/* 👤 Profile */}


      {/* 🎯 Feedback / More */}
      <Stack.Screen name="GroupOrderScreen" component={GroupOrderScreen} />
    </Stack.Navigator>
  );
};

export default HomeTabStack;
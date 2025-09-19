import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { supabaseClient } from '../lib/supabase'; // adjust path if needed

import HomeTabStack from './tabs/HomeTabStack';
import SearchTab from './tabs/SearchTab';
import OrdersTab from './tabs/OrdersTab'; 
import SupportTab from './tabs/SupportTab';
import ProfileStack from './tabs/ProfileStack';


const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const [hasWelcomed, setHasWelcomed] = useState(false);

  useEffect(() => {
    const showWelcome = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabaseClient.auth.getSession();

      if (!session || sessionError) return;

      const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('full_name, created_at')
        .eq('user_id', session.user.id)
        .single();

      if (error || !profile || hasWelcomed) return;

      const firstName = profile.full_name?.split(' ')[0] || 'Nwanne';

      const createdAt = new Date(profile.created_at);
      const isNewUser = Date.now() - createdAt.getTime() < 5 * 60 * 1000;

      Alert.alert(isNewUser ? `Welcome, ${firstName}!` : `Welcome back, ${firstName}!`);

      setHasWelcomed(true);
    };

    showWelcome();
  }, [hasWelcomed]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline'; 
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Orders') {
            iconName = focused ? 'clipboard-list' : 'clipboard-list';
            return <MaterialIcons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Support') {
            iconName = focused ? 'headphones' : 'headphones';
            return <Feather name={iconName} size={size} color={color} />;
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeTabStack} />
      <Tab.Screen name="Search" component={SearchTab} />
      <Tab.Screen name="Orders" component={OrdersTab} />
      <Tab.Screen name="Support" component={SupportTab} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default MainTabs;
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeTab from '../../screens/tabs/HomeTab';
import SearchTab from '../../screens/tabs/SearchTab';
import OrdersTab from '../../screens/tabs/OrdersTab';
import SupportTab from '../../screens/tabs/SupportTab';
import ProfileTab from '../../screens/tabs/ProfileTab';

  const Tab = createBottomTabNavigator();


const TabsNavigator = () => {

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home-outline';
              break;
            case 'Search':
              iconName = 'search-outline';
              break;
            case 'Orders':
              iconName = 'cart-outline';
              break;
            case 'Support':
              iconName = 'chatbox-ellipses-outline';
              break;
            case 'Profile':
              iconName = 'person-outline'; 
              break;
            default:
              iconName = 'ellipse-outline';
          }

            return  <Ionicons name="home-outline" size={24} color="black"/>;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeTab} />
      <Tab.Screen name="Search" component={SearchTab} />
      <Tab.Screen name="Orders" component={OrdersTab} />
      <Tab.Screen name="Support" component={SupportTab} />
      <Tab.Screen name="Profile" component={ProfileTab} />
    </Tab.Navigator>
  );
};

export default TabsNavigator;
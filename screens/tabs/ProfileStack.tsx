import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProfileTab from '../tabs/ProfileTab'; // or rename to ProfileScreen if you’ve changed it
import ProfileDetailsScreen from '../ProfileDetailsScreen';
import CustomerFeedbackScreen from '../CustomerFeedbackScreen';

export type ProfileStackParamList = {
  ProfileTab: undefined;
  ProfileDetailsScreen: undefined;
  CustomerFeedbackScreen: undefined;

};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProfileTab"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="ProfileTab" component={ProfileTab} />
      <Stack.Screen name="ProfileDetailsScreen" component={ProfileDetailsScreen} />
      <Stack.Screen name="CustomerFeedbackScreen" component={CustomerFeedbackScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStack;
import React from 'react';
import { Pressable, Text, Platform, Linking, GestureResponderEvent } from 'react-native';
import { openBrowserAsync } from 'expo-web-browser';

type Props = {
  href: string;
  label?: string;
};

export function ExternalLink({ href, label = 'Open Link' }: Props) {
  const handlePress = async (event: GestureResponderEvent) => {
    if (Platform.OS !== 'web') {
      event.preventDefault();
      await openBrowserAsync(href);
    } else {
      Linking.openURL(href);
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>
        {label}
      </Text>
    </Pressable>
  );
}
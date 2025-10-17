import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

type Props = {
  children: React.ReactNode; // any content you put inside
};

export default function Background({ children }: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/illusion-naili 1.png')} // your illusion image
        style={StyleSheet.absoluteFillObject} // fills the whole screen
        resizeMode="cover"
      />
      {children} {/* This will render screen content on top */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
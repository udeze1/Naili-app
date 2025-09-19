import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NailiSupermarketsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Naili Supermarkets Page</Text>
    </View>
  );
};

export default NailiSupermarketsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});
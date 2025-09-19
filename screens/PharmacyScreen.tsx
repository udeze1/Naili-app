import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SendPackagesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Send Packages Page</Text>
    </View>
  );
};

export default SendPackagesScreen;

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
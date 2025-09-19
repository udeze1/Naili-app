import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Linking } from 'react-native';

const SupportScreen = () => {
  const handlePress = (topic: string) => {
    const baseUrl = 'https://wa.me/2349034446969';
    const message = encodeURIComponent(`Hi, I need help with: ${topic}`);
    const whatsappUrl = `${baseUrl}?text=${message}`;

    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Error', 'WhatsApp not installed or unable to open link.');
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Support</Text>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Hi 👋, how can we help you today?</Text>

        <TouchableOpacity style={styles.card} onPress={() => handlePress('Where is my order?')}>
          <Text style={styles.cardText}>Where is my order?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => handlePress('Payment issues')}>
          <Text style={styles.cardText}>Payment issues</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => handlePress('Change my delivery address')}>
          <Text style={styles.cardText}>Change my delivery address</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => handlePress('Technical issues or bug')}>
          <Text style={styles.cardText}>Technical issues or bug</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => handlePress('Chat with support')}>
          <Text style={styles.cardText}>Chat with support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => handlePress('Other')}>
          <Text style={styles.cardText}>Other</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default SupportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 50,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#008000', // green
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  greeting: {
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff7e6', // light yellow
    borderColor: '#ffcc00', // Noniq yellow
    borderWidth: 1.2,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  cardText: {
    fontSize: 16,
    color: '#008000', // Noniq green
    fontWeight: '500',
  },
});
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabaseClient } from '../lib/supabase';

export default function CustomerFeedbackScreen() {
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      setUserEmail(user?.email ?? 'anonymous@user.com');
    };
    fetchUser();
  }, []);

  const handleSend = async () => {
    if (!message.trim()) {
      Alert.alert('Missing message', 'Please enter a message before sending.');
      return;
    }

    setSending(true);

    try {
      // ✅ 1. Send email via Netlify + Brevo
      const response = await fetch(
        'https://naili.com.ng/.netlify/functions/sendFeedbackEmail',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            message,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email.');
      }

      // ✅ 2. Save feedback in Supabase
      await supabaseClient.from('customer_feedback').insert([
        {
          message,
          email: userEmail,
          sent_at: new Date().toISOString(),
        },
      ]);

      Alert.alert('✅ Feedback Sent', 'Thanks for your feedback!');
      setMessage('');
    } catch (error) {
      console.error('Feedback error:', error);
      Alert.alert('❌ Error', 'Unable to send feedback. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* 🔙 Back Arrow */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🗣️ Customer Feedback</Text>

      <Text style={styles.description}>
        Have an idea, complaint, or suggestion? Send it to us directly.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Type your message here..."
        multiline
        value={message}
        onChangeText={setMessage}
      />

      <TouchableOpacity style={styles.button} onPress={handleSend} disabled={sending}>
        {sending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>📨 Send Feedback</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  backArrow: { fontSize: 26, color: '#008000', fontWeight: '700' },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginTop: 70,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 150,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: '#222',
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#facc15',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#006400',
    fontSize: 16,
    fontWeight: '600',
  },
});
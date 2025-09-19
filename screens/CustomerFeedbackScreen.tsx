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
import { supabaseClient } from '../lib/supabase'; // adjust path if needed

export default function CustomerFeedbackScreen() {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Get current user from Supabase Auth
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabaseClient.auth.getUser();

      if (user) {
        setUserEmail(user.email ?? '');
      } else {
        setUserEmail('anonymous@user.com'); // fallback
      }

      if (error) {
        console.log('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;

    setSending(true);

    const { error } = await supabaseClient.from('customer_feedback').insert([
      {
        message,
        email: userEmail,
        sent_at: new Date().toISOString(),
      },
    ]);

    setSending(false);

    if (error) {
      Alert.alert('❌ Failed to send', 'Please try again later.');
      console.error('Supabase error:', error);
      return;
    }

    setMessage('');
    Alert.alert('✅ Feedback Sent', 'Thanks for your feedback!');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}> 🗣️Customer Feedback</Text>

      <Text style={styles.description}>
        Have an idea, complaint, or suggestion? Send it to us directly. Your feedback helps us
        improve.
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
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
    backgroundColor: '#facc15', // Naili green
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#008000',
    fontSize: 16,
    fontWeight: '600',
  },
});
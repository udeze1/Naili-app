// src/screens/profile/ProfileTab.tsx
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileStack';
import { useUser } from '../../context/UserContext';
import { supabaseClient } from '../../lib/supabase';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

export default function ProfileTab() {
  const navigation = useNavigation<NavigationProp>();
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);

  // Refresh user info when screen is focused
  useFocusEffect(
    useCallback(() => {
      async function refreshUser() {
        if (user?.id) {
          const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (data) setUser(data);
        }
      }
      refreshUser();
    }, [user?.id])
  );

  const fullName = user?.full_name || 'Naili User';
  const avatarUri = `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(
    fullName
  )}`;

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    } else {
      Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: onConfirm },
      ]);
    }
  };

  const handleLogout = async () => {
    showConfirm('Sign Out', 'Are you sure you want to log out?', async () => {
      try {
        setLoading(true);
        await supabaseClient.from('user_logouts').insert({ user_id: user?.id });
        await supabaseClient.auth.signOut();
        setUser(null);
      } catch (error) {
        console.error('Logout failed', error);
        Alert.alert('Error', 'Unable to logout. Please try again.');
      } finally {
        setLoading(false);
      }
    });
  };

  const handleDeleteAccount = async () => {
    showConfirm(
      'Delete Account',
      'This action is permanent. Are you sure?',
      async () => {
        try {
          setLoading(true);
          await supabaseClient.from('user_deletes').insert({ user_id: user?.id });
          await supabaseClient.from('profiles').delete().eq('id', user?.id);
          if (user?.id) await supabaseClient.auth.admin.deleteUser(user.id);
          setUser(null);
        } catch (error) {
          console.error('Delete failed', error);
          Alert.alert('Error', 'Unable to delete account. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const openExternal = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Cannot open link', url);
        return;
      }
      await Linking.openURL(url);
    } catch (err: any) {
      console.error('Failed to open URL', err);
      Alert.alert('Error', 'Unable to open link.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header - full width */}
      <View style={styles.header}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
        <Text style={styles.name}>{fullName}</Text>
      </View>

      {/* Sections with padding */}
      <View style={styles.sectionsContainer}>
        {/* Personal Section */}
        <Text style={styles.sectionTitle}>Personal</Text>
        <Option
          label="Edit Profile"
          icon="user"
          onPress={() => navigation.navigate('ProfileDetailsScreen')}
        />
        <Option
          label="Customer Feedback"
          icon="message-circle"
          onPress={() => navigation.navigate('CustomerFeedbackScreen')}
        />

        {/* App Section */}
        <Text style={styles.sectionTitle}>App</Text>
        <Option label="Refer & Earn" icon="gift" />

        {/* Legal Section */}
        <Text style={styles.sectionTitle}>Legal</Text>
        <Option
          label="Terms & Conditions"
          icon="file-text"
          onPress={() => openExternal('https://naili.com.ng/terms.html')}
        />
        <Option
          label="Privacy Policy"
          icon="shield"
          onPress={() => openExternal('https://naili.com.ng/privacy.html')}
        />
        <Option
          label="Contact Us"
          icon="phone"
          onPress={() => openExternal('https://naili.com.ng/contact.html')}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Manage your account with ease.</Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#FFD700' }]}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#006400" />
          ) : (
            <Text style={styles.buttonText}>🚪 Sign Out</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#fee2e2' }]}
          onPress={handleDeleteAccount}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#b91c1c" />
          ) : (
            <Text style={[styles.buttonText, { color: '#b91c1c' }]}>🗑️ Delete Account</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.version}>App Version 1.0.0 · ⚡ 369V</Text>
      </View>
    </ScrollView>
  );
}

function Option({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.option} onPress={onPress}>
      <Feather name={icon as any} size={18} color="#006400" />
      <Text style={styles.optionLabel}>{label}</Text>
      <Feather
        name="chevron-right"
        size={20}
        color="#aaa"
        style={{ marginLeft: 'auto' }}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  sectionsContainer: { paddingHorizontal: 16 },
  header: {
    alignItems: 'center',
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
    backgroundColor: '#D6EAD3', // Petal green
    width: '100%', // full width
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#D6EAD3',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  name: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  sectionTitle: {
    fontSize: 14,
    color: '#006400',
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  optionLabel: {
    fontSize: 16,
    marginLeft: 12,
    color: '#222',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
  },
  buttonText: {
    fontSize: 14,
    color: '#006400',
    fontWeight: '600',
  },
  version: {
    fontSize: 12,
    color: '#999',
    marginTop: 12,
  },
});
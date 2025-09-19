import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileStack';
import { useUser } from '../../context/UserContext';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

export default function ProfileTab() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useUser();

  const fullName = user?.full_name || 'Naili User';
  const avatarUri = `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(fullName)}`;

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

  const handleLogout = () => {
    showConfirm('Sign Out', 'Are you sure you want to log out?', () => {
      console.log('User logged out');
      // TODO: Add real logout logic
    });
  };

  const handleDeleteAccount = () => {
    showConfirm('Delete Account', 'This action is permanent. Proceed?', () => {
      console.log('Account deleted');
      // TODO: Add real delete logic
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
        <Text style={styles.name}>{fullName}</Text>
      </View>

      {/* Personal */}
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

      {/* Community */}
      <Text style={styles.sectionTitle}>Community</Text>
      <Option label="Village Circle" icon="users" />
      <Option label="Refer & Earn" icon="gift" />

      {/* App */}
      <Text style={styles.sectionTitle}>App</Text>
      <Option label="FAQ" icon="help-circle" />
      <Option label="Contact Us" icon="phone" />

      {/* Legal */}
      <Text style={styles.sectionTitle}>Legal</Text>
      <Option
        label="Terms & Conditions"
        icon="file-text"
        onPress={() => navigation.navigate('TermsScreen')}
      />
      <Option
        label="Privacy Policy"
        icon="shield"
        onPress={() => navigation.navigate('PrivacyScreen')}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.quote}>🌀 “Align with Your Chi”</Text>
        <Text style={styles.motto}>“He who knows his Chi, walks with the gods.”</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#fee2e2' }]}
          onPress={handleDeleteAccount}
        >
          <Text style={[styles.logoutText, { color: '#b91c1c' }]}>🗑️ Delete Account</Text>
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
      <Feather name="chevron-right" size={20} color="#aaa" style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  header: {
    alignItems: 'center',
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#eee',
    marginBottom: 8,
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
    marginBottom: 32,
  },
  quote: { fontSize: 14, fontWeight: '600', color: '#333' },
  motto: { fontSize: 12, color: '#777', marginVertical: 6 },
  logoutButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
  },
  logoutText: {
    fontSize: 14,
    color: '#006400',
    fontWeight: '600',
  },
  version: { fontSize: 12, color: '#999', marginTop: 12 },
});
// screens/DeliveryAddressScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  Keyboard,
} from "react-native";
import Constants from "expo-constants";
import { supabaseClient } from "../lib/supabase";
import { useUser } from "../context/UserContext";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location"; // ✅ GPS

const GEOAPIFY_KEY =
  Constants.expoConfig?.extra?.GEOAPIFY_API_KEY ||
  process.env.EXPO_PUBLIC_GEOAPIFY_KEY ||
  "";

 export type Suggestion = {
  id: string;
  formatted: string;
  city?: string;
  state?: string;
  lon?: number;
  lat?: number;
};

type AddressItem = {
  id: string;
  user_id: string;
  label: string;
  street?: string;
  city: string;
  state: string;
  lat: number | null;
  lon: number | null;
  is_default: boolean;
  created_at: string;
};

// ✅ Unified type for rendering
type DisplayAddress = {
  id: string;
  formatted: string;
  city?: string;
  state?: string;
  lat?: number | null;
  lon?: number | null;
};

export default function DeliveryAddressScreen() {
  const { user } = useUser();
  const navigation = useNavigation();

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<DisplayAddress[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<AddressItem[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const debounceRef = useRef<number | null>(null);

  // Load saved addresses
  useEffect(() => {
    const fetchSaved = async () => {
      if (!user?.id) return;
      const { data, error } = await supabaseClient
        .from("addresses")
        .select("id, user_id, label, city, state, lat, lon, is_default, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) setSavedAddresses(data);
    };
    fetchSaved();
  }, [user]);

  // Autocomplete fetch when typing
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = (setTimeout(() => {
      fetchSuggestions(query.trim());
    }, 400) as unknown) as number;
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const fetchSuggestions = async (text: string) => {
    if (!GEOAPIFY_KEY) {
      setLoadingSuggestions(false);
      Alert.alert("Missing API key", "Geoapify API key is not set.");
      return;
    }
    try {
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
        text
      )}&limit=8&lang=en&apiKey=${GEOAPIFY_KEY}`;
      const resp = await fetch(url);
      const json = await resp.json();

      const features = json.features ?? [];
      const mapped: DisplayAddress[] = features.map((f: any) => {
        const coords = f.geometry?.coordinates || [null, null];
        return {
          id: String(
            f.properties.place_id ??
              f.properties.osm_id ??
              f.properties.formatted
          ),
          formatted:
            f.properties.formatted || f.properties.display_name || "",
          city:
            f.properties.city || f.properties.town || f.properties.village || "",
          state: f.properties.state || "",
          lon: coords[0],
          lat: coords[1],
        };
      });

      setSuggestions(mapped);
    } catch (err) {
      console.error("Autocomplete error", err);
      Alert.alert("Error", "Failed to fetch address suggestions.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const saveAddress = async (s: DisplayAddress) => {
    if (!user?.id) {
      Alert.alert("Not signed in", "Please sign in to save an address.");
      return;
    }
    try {
      const { error } = await supabaseClient.from("addresses").insert([
        {
          user_id: user.id,
          label: s.formatted,
          street: s.formatted, // ✅ store formatted as street too
          city: s.city ?? "",
          state: s.state ?? "",
          lat: s.lat ?? null,
          lon: s.lon ?? null,
          is_default: true,
        },
      ]);
      if (error) {
        console.error("Save address error", error);
        Alert.alert("Error", "Failed to save address.");
      } else {
        Keyboard.dismiss();
        navigation.navigate("HomeTab" as never);
      }
    } catch (err) {
      console.error("Save address exception", err);
      Alert.alert("Error", "Failed to save address.");
    }
  };

  // ✅ Handle current location
  const handleUseCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoadingLocation(false);
        Alert.alert("Permission denied", "Location access is required.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;

      if (!GEOAPIFY_KEY) {
        setLoadingLocation(false);
        Alert.alert("Error", "Geoapify API key missing.");
        return;
      }

      // Reverse geocode
      const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_KEY}`;
      const resp = await fetch(url);
      const json = await resp.json();
      const props = json.features?.[0]?.properties;

      const formatted = props?.formatted || "Current Location";
      const city =
        props?.city || props?.town || props?.village || props?.suburb || "";
      const state = props?.state || "";

      await saveAddress({
        id: "current-location",
        formatted,
        city,
        state,
        lat: latitude,
        lon: longitude,
      });
    } catch (err) {
      console.error("Location error", err);
      Alert.alert("Error", "Unable to fetch current location.");
    } finally {
      setLoadingLocation(false);
    }
  };

  // ✅ Build list data for FlatList
  const buildSavedList = (): DisplayAddress[] => {
    return [
      { id: "use-location", formatted: "📍 Use your current location" },
      ...savedAddresses.map((a) => ({
        id: a.id,
        formatted: a.label,
        city: a.city,
        state: a.state,
        lat: a.lat,
        lon: a.lon,
      })),
    ];
  };

  const buildSuggestionList = (): DisplayAddress[] => {
    return [
      { id: "use-location", formatted: "📍 Use your current location" },
      ...suggestions,
    ];
  };

  return (
    <View style={styles.root}>
      {/* Header with X cancel */}
      <View style={styles.header}>
        <Text style={styles.title}>Delivery Address</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#d32f2f" />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <TextInput
          placeholder="Search address (street, area, city)..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          returnKeyType="search"
          onFocus={() => setFocused(true)}
          onSubmitEditing={() => fetchSuggestions(query.trim())}
        />
        {loadingSuggestions && <ActivityIndicator style={{ marginLeft: 8 }} />}
      </View>

      {/* When focused but not typing → show saved + use location */}
      {focused && !query && (
        <FlatList
          data={buildSavedList()}
          keyExtractor={(i) => i.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => {
                if (item.id === "use-location") {
                  handleUseCurrentLocation();
                } else {
                  saveAddress(item);
                }
              }}
            >
              <Text style={styles.suggestionTextPrimary}>{item.formatted}</Text>
              {item.city ? (
                <Text style={styles.suggestionTextSecondary}>
                  {item.city}
                  {item.state ? `, ${item.state}` : ""}
                </Text>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}

      {/* When typing → show Geoapify results + use location */}
      {query.length > 0 && (
        <FlatList
          data={buildSuggestionList()}
          keyExtractor={(i) => i.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => {
                if (item.id === "use-location") {
                  handleUseCurrentLocation();
                } else {
                  saveAddress(item);
                }
              }}
            >
              <Text style={styles.suggestionTextPrimary}>{item.formatted}</Text>
              {item.city && (
                <Text style={styles.suggestionTextSecondary}>
                  {item.city}
                  {item.state ? `, ${item.state}` : ""}
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}

      {loadingLocation && <ActivityIndicator style={{ marginTop: 20 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#2e7d32" },
  searchWrap: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  searchInput: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  suggestionItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  suggestionTextPrimary: { fontSize: 15, color: "#111" },
  suggestionTextSecondary: { fontSize: 13, color: "#777", marginTop: 2 },
});
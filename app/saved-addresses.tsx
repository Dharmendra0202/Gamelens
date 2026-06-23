import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SavedAddressesScreen() {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [addressLabel, setAddressLabel] = useState("");
  const [addressText, setAddressText] = useState("");

  const handleSaveAddress = () => {
    if (!addressLabel.trim() || !addressText.trim()) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }
    // TODO: Save to backend
    Alert.alert("Saved", "Address saved successfully.");
    setAddressLabel("");
    setAddressText("");
    setShowAddForm(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#00A66A", "#0F766E", "#064E3B"]}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => setShowAddForm(!showAddForm)}>
          <Ionicons name={showAddForm ? "close" : "add"} size={22} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add Address Form */}
        {showAddForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add New Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Label (e.g. Home, Office)"
              placeholderTextColor="#94A3B8"
              value={addressLabel}
              onChangeText={setAddressLabel}
            />
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              placeholder="Full address"
              placeholderTextColor="#94A3B8"
              value={addressText}
              onChangeText={setAddressText}
              multiline
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAddress}>
              <Text style={styles.saveBtnText}>Save Address</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!showAddForm && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="location-outline" size={56} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>No saved addresses</Text>
            <Text style={styles.emptyDesc}>
              Tap + to add your home, office, or favourite locations
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#FFF" },
  content: { flex: 1, padding: 16 },
  formCard: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 16 },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0F172A",
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: "#0F766E",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnText: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  emptyState: { alignItems: "center", paddingTop: 80 },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#334155", marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: "#94A3B8", textAlign: "center", lineHeight: 22, paddingHorizontal: 32 },
});

import { HEADER_PADDING_BOTTOM, HEADER_PADDING_TOP } from "@/constants/app-theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function SpecialOffersScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#DC2626", "#B91C1C", "#7F1D1D"]}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Special Offers</Text>
        <View style={{ width: 38 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Empty State */}
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="gift-outline" size={56} color="#CBD5E1" />
          </View>
          <Text style={styles.emptyTitle}>No offers available</Text>
          <Text style={styles.emptyDesc}>
            Check back soon for exclusive deals on turf bookings and cricket
            gear
          </Text>
        </View>
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
    paddingTop: HEADER_PADDING_TOP,
    paddingBottom: HEADER_PADDING_BOTTOM,
    paddingHorizontal: 16,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#FFF" },
  content: { flex: 1, padding: 16 },
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
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 32,
  },
});

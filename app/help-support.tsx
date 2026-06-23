import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function HelpSupportScreen() {
  const router = useRouter();

  const options = [
    {
      icon: "mail-outline",
      label: "Email Support",
      desc: "support@gamelens.app",
      action: () => Linking.openURL("mailto:support@gamelens.app"),
    },
    {
      icon: "call-outline",
      label: "Call Us",
      desc: "Available 9 AM - 6 PM",
      action: () => Linking.openURL("tel:+919999999999"),
    },
    {
      icon: "chatbubble-outline",
      label: "Live Chat",
      desc: "Chat with our team",
      action: () => {},
    },
    {
      icon: "document-text-outline",
      label: "FAQs",
      desc: "Common questions answered",
      action: () => {},
    },
    {
      icon: "bug-outline",
      label: "Report a Bug",
      desc: "Help us improve",
      action: () =>
        Linking.openURL("mailto:bugs@gamelens.app?subject=Bug Report"),
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#DC2626", "#B91C1C", "#7F1D1D"]}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 38 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {options.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                index === options.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={styles.optionIcon}>
                <Ionicons name={item.icon as any} size={22} color="#B91C1C" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>{item.label}</Text>
                <Text style={styles.optionDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
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
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#FFF" },
  content: { flex: 1, padding: 16 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 15, fontWeight: "600", color: "#0F172A" },
  optionDesc: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
});

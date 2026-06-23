import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ComingSoonScreenProps {
  sportName: string;
  onBack: () => void;
}

export function ComingSoonScreen({ sportName, onBack }: ComingSoonScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Text style={styles.emoji}>🚀</Text>
        </View>

        <Text style={styles.title}>Coming Soon!</Text>
        <Text style={styles.subtitle}>
          Support for <Text style={styles.sportHighlight}>{sportName}</Text> is
          coming soon.
        </Text>
        <Text style={styles.description}>
          We're working hard to bring you the best experience. Stay tuned for
          updates!
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#D32F2F", "#B71C1C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.backGradient}
          >
            <Ionicons name="arrow-back" size={18} color="#FFF" />
            <Text style={styles.backText}>Back to Sports Selection</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FBE9E7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#FFCDD2",
  },
  emoji: {
    fontSize: 44,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#212121",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#616161",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 8,
  },
  sportHighlight: {
    color: "#B71C1C",
    fontWeight: "800",
  },
  description: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  backButton: {
    borderRadius: 16,
    overflow: "hidden",
    width: "100%",
  },
  backGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  backText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});

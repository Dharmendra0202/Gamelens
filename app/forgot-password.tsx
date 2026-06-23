import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/hooks/use-auth";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async () => {
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    const { error: resetErr } = await resetPassword(email.trim());
    setIsSubmitting(false);

    if (resetErr) {
      setError(resetErr);
      return;
    }

    Alert.alert(
      "Email Sent",
      "If an account exists with that email, you'll receive a password reset link. Check your inbox.",
      [{ text: "OK", onPress: () => router.back() }],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color="#212121" />
          </TouchableOpacity>

          <View style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name="lock-open-outline" size={32} color="#B71C1C" />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter the email associated with your account and we'll send a
              reset link.
            </Text>

            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#D32F2F" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputWrap}>
              <Ionicons
                name="mail-outline"
                size={18}
                color="#9E9E9E"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#9E9E9E"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleReset}
              disabled={isSubmitting}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={["#D32F2F", "#B71C1C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGrad}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backLink}
            >
              <Ionicons name="arrow-back" size={14} color="#B71C1C" />
              <Text style={styles.backLinkText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  backBtn: {
    position: "absolute",
    top: 16,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 32,
    paddingBottom: 28,
    shadowColor: "#8B0000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(183,28,28,0.1)",
    alignItems: "center",
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FBE9E7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#212121",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#616161",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 22,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FBE9E7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    width: "100%",
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#D32F2F",
    lineHeight: 18,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    marginBottom: 18,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 15,
    color: "#212121",
    fontWeight: "500",
  },
  button: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    gap: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backLinkText: {
    color: "#B71C1C",
    fontSize: 14,
    fontWeight: "700",
  },
});

import type {
    AuthChangeEvent,
    Session,
    User as SupabaseUser,
} from "@supabase/supabase-js";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { supabase } from "@/lib/supabase";
import type { Profile } from "@/services/profile";
import { ProfileService } from "@/services/profile";

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface AuthState {
  session: Session | null;
  user: SupabaseUser | null;
  profile: Profile | null;
  isLoading: boolean;
  hasProfile: boolean;
}

export interface AuthActions {
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: string | null }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  refreshSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export type AuthContextValue = AuthState & AuthActions;

// ─── Context ────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  // Load profile from Supabase for a given user ID.
  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await ProfileService.get(userId);
    setProfile(data);
    setHasProfile(!!data && !!data.full_name);
  }, []);

  // ── Session restoration on mount ──
  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const {
          data: { session: restoredSession },
        } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(restoredSession);
        setUser(restoredSession?.user ?? null);

        if (restoredSession?.user) {
          await loadProfile(restoredSession.user.id);
        }
      } catch (err) {
        console.error("[Auth] Failed to restore session:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [loadProfile]);

  // ── Auth state listener ──
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === "SIGNED_OUT") {
          setProfile(null);
          setHasProfile(false);
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (newSession?.user) {
            await loadProfile(newSession.user.id);
          }
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  // ── Actions ───────────────────────────────────────────────────────────────────

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
    ): Promise<{ error: string | null }> => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: { full_name: fullName.trim() },
          },
        });

        if (error) {
          return { error: mapAuthError(error.message) };
        }

        // If email confirmation is disabled, user is immediately signed in.
        // The trigger auto-creates the profile row, so load it.
        if (data.user && data.session) {
          await loadProfile(data.user.id);
        }

        return { error: null };
      } catch (err) {
        return {
          error: "Network error. Please check your connection and try again.",
        };
      }
    },
    [loadProfile],
  );

  const signIn = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ error: string | null }> => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          return { error: mapAuthError(error.message) };
        }

        if (data.user) {
          await loadProfile(data.user.id);
        }

        return { error: null };
      } catch (err) {
        return {
          error: "Network error. Please check your connection and try again.",
        };
      }
    },
    [loadProfile],
  );

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setHasProfile(false);
    } catch (err) {
      console.error("[Auth] Sign out error:", err);
    }
  }, []);

  const resetPassword = useCallback(
    async (email: string): Promise<{ error: string | null }> => {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim().toLowerCase(),
        );
        if (error) return { error: mapAuthError(error.message) };
        return { error: null };
      } catch (err) {
        return {
          error: "Network error. Please check your connection and try again.",
        };
      }
    },
    [],
  );

  const refreshSession = useCallback(async () => {
    try {
      const {
        data: { session: refreshed },
      } = await supabase.auth.refreshSession();
      setSession(refreshed);
      setUser(refreshed?.user ?? null);
    } catch (err) {
      console.error("[Auth] Refresh session error:", err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user.id);
    }
  }, [user, loadProfile]);

  // ── Context value ─────────────────────────────────────────────────────────────

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      isLoading,
      hasProfile,
      signUp,
      signIn,
      signOut,
      resetPassword,
      refreshSession,
      refreshProfile,
    }),
    [
      session,
      user,
      profile,
      isLoading,
      hasProfile,
      signUp,
      signIn,
      signOut,
      resetPassword,
      refreshSession,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid_credentials")
  ) {
    return "Incorrect email or password. Please try again.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please verify your email before logging in. Check your inbox.";
  }
  if (
    lower.includes("user already registered") ||
    lower.includes("already been registered")
  ) {
    return "An account with this email already exists. Try logging in instead.";
  }
  if (lower.includes("password") && lower.includes("characters")) {
    return "Password must be at least 6 characters long.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (
    lower.includes("email") &&
    (lower.includes("invalid") || lower.includes("format"))
  ) {
    return "Please enter a valid email address.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "Network error. Please check your connection.";
  }

  return message;
}

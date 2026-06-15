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
import { LocalStorage } from "@/services/storage";

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface AuthState {
  /** Supabase session — null when logged out or still loading. */
  session: Session | null;
  /** The authenticated Supabase user. */
  user: SupabaseUser | null;
  /** True while we're restoring the session on app start. */
  isLoading: boolean;
  /** Whether the user has completed their cricket profile. */
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
}

export type AuthContextValue = AuthState & AuthActions;

// ─── Context ────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  // Check if local profile exists (pre-backend).
  const checkProfile = useCallback(async () => {
    const profile = await LocalStorage.getProfile();
    setHasProfile(!!profile);
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
        await checkProfile();
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
  }, [checkProfile]);

  // ── Auth state listener ──
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === "SIGNED_OUT") {
          setHasProfile(false);
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          await checkProfile();
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [checkProfile]);

  // ── Actions ───────────────────────────────────────────────────────────────────

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
    ): Promise<{ error: string | null }> => {
      try {
        const { error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: { full_name: fullName.trim() },
          },
        });

        if (error) {
          return { error: mapAuthError(error.message) };
        }

        return { error: null };
      } catch (err) {
        return {
          error: "Network error. Please check your connection and try again.",
        };
      }
    },
    [],
  );

  const signIn = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ error: string | null }> => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          return { error: mapAuthError(error.message) };
        }

        return { error: null };
      } catch (err) {
        return {
          error: "Network error. Please check your connection and try again.",
        };
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
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

        if (error) {
          return { error: mapAuthError(error.message) };
        }

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

  // ── Context value ─────────────────────────────────────────────────────────────

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      isLoading,
      hasProfile,
      signUp,
      signIn,
      signOut,
      resetPassword,
      refreshSession,
    }),
    [
      session,
      user,
      isLoading,
      hasProfile,
      signUp,
      signIn,
      signOut,
      resetPassword,
      refreshSession,
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

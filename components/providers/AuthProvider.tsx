"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase, signOut as doSignOut } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  avatarUrl: string | null;
  displayName: string;
  initials: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  avatarUrl: null,
  displayName: "",
  initials: "",
});

export function useAuth() {
  return useContext(AuthContext);
}

function getInitials(user: User | null): string {
  if (!user) return "?";
  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email || "";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name[0] || "U").toUpperCase();
}

function getDisplayName(user: User | null): string {
  if (!user) return "";
  return user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User";
}

function getAvatarUrl(user: User | null): string | null {
  if (!user) return null;
  return user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await doSignOut();
    setUser(null);
    setSession(null);
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut,
    avatarUrl: getAvatarUrl(user),
    displayName: getDisplayName(user),
    initials: getInitials(user),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

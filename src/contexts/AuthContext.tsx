import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { createSupabaseClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export type AppRole = "client" | "employee";

export interface User {
  id: string;
  email: string;
  name: string;
  role: AppRole;
}

interface AuthContextType {
  currentUser: User | null;
  userRole: AppRole | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUser(sbUser: SupabaseUser | null, accessToken?: string): User | null {
  if (!sbUser) return null;
  let role: AppRole = "client";
  if (accessToken) {
    try {
      const decoded = jwtDecode<{ user_role?: string }>(accessToken);
      if (decoded?.user_role === "employee" || decoded?.user_role === "client") {
        role = decoded.user_role;
      }
    } catch {
      // ignore decode errors
    }
  }
  return {
    id: sbUser.id,
    email: sbUser.email ?? "",
    name: sbUser.user_metadata?.name ?? sbUser.email?.split("@")[0] ?? "User",
    role,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase] = useState(() => createSupabaseClient());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(mapUser(session?.user ?? null, session?.access_token));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(mapUser(session?.user ?? null, session?.access_token));
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    // Mark loading complete after first session check
    const t = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(t);
  }, [currentUser]);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    setCurrentUser(mapUser(data.user, data.session?.access_token));
    return { success: true };
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return { success: false, error: error.message };
    if (data.user) {
      setCurrentUser(mapUser(data.user, data.session?.access_token));
    }
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const value: AuthContextType = {
    currentUser,
    userRole: currentUser?.role ?? null,
    isLoading,
    login,
    signUp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

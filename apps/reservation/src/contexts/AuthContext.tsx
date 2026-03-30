import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { createSupabaseJsClient } from "@repo/supabase";
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
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
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
  const [supabase] = useState(() => createSupabaseJsClient());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(mapUser(session?.user ?? null, session?.access_token));
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(mapUser(session?.user ?? null, session?.access_token));
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) return { success: false, error: error.message };
    // State is automatically updated via onAuthStateChange listener after OAuth redirect
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
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

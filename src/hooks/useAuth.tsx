import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: string = 'parent') => {
    const redirectUrl = `${window.location.origin}/`;

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role, // Pass role to trigger
        },
      },
    });

    if (signUpError) return { error: signUpError };

    // Fallback manual profile creation if trigger fails or is delayed
    if (signUpData.user) {
      try {
        const userId = signUpData.user.id;

        // Prepare therapist code if needed
        let therapistCode = null;
        if (role === 'therapist') {
          therapistCode = 'DR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        }

        // 1. Ensure profile exists - using upsert to be safe
        await supabase.from('profiles').upsert({
          user_id: userId,
          full_name: fullName,
          role: role,
          therapist_code: therapistCode
        }, { onConflict: 'user_id' });

        // 2. Ensure user_role exists
        await supabase.from('user_roles').upsert({
          user_id: userId,
          role: role as any
        }, { onConflict: 'user_id, role' });

        console.log(`[signUp] Manual profile/role created for ${role}`);
      } catch (err) {
        console.error("[signUp] Manual fallback error:", err);
      }
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

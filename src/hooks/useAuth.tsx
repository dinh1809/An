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
    // Helper to ensure profile exists
    const ensureProfile = async (session: Session | null) => {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const user = session.user;

      try {
        // 1. Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.warn("[useAuth] Profile fetch warning:", profileError);
        }

        // 2. If no profile, lazy create it
        if (!profile) {
          console.log("[useAuth] Profile missing, lazy creating...");
          const role = user.user_metadata?.role || user.app_metadata?.role || 'parent';
          const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

          let therapistCode = null;
          if (role === 'therapist') {
            therapistCode = 'DR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
          }

          // Insert profile
          const { error: insertError } = await supabase.from('profiles').insert({
            user_id: user.id,
            full_name: fullName,
            role: role,
            email: user.email?.toLowerCase().trim(),
            therapist_code: therapistCode
          });

          if (insertError) {
            console.error("[useAuth] Lazy create failed:", insertError);
          } else {
            // Also ensure role table is synced
            await supabase.from('user_roles').upsert({
              user_id: user.id,
              role: role as any
            }, { onConflict: 'user_id, role' });

            console.log("[useAuth] Lazy create success");
          }
        }
      } catch (err) {
        console.error("[useAuth] Critical identity error:", err);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN' || (event === 'INITIAL_SESSION' && session)) {
          ensureProfile(session);
        } else if (event === 'SIGNED_OUT') {
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        ensureProfile(session);
      } else {
        setLoading(false);
      }
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
          email: email.toLowerCase().trim(),
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

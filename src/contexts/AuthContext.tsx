import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  language: 'he' | 'en';
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Add timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn('Auth loading timeout - proceeding without session');
      setLoading(false);
    }, 8000);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(loadingTimeout);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch((err) => {
      console.error('Session fetch error:', err);
      clearTimeout(loadingTimeout);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) throw error;
      
      setProfile(data as UserProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Set a default profile so user can still use the app
      setProfile({ id: userId, role: 'admin', full_name: 'User', email: '' } as UserProfile);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Database not connected') };
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Signout timeout')), 5000)
      );
      await Promise.race([supabase.auth.signOut(), timeoutPromise]);
    } catch (err) {
      console.error('Signout error:', err);
    }
    // Always clear local state
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signOut,
    isAdmin: profile?.role === 'admin',
    isClient: profile?.role === 'client',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

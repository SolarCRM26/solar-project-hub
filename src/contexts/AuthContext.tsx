import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

type AppRole = 'admin' | 'engineer' | 'customer';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  profile: { full_name: string | null; email: string | null; avatar_url: string | null } | null;
  loading: boolean;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [profile, setProfile] = useState<AuthContextType['profile']>(null);
  const [loading, setLoading] = useState(true);

  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T | null> => {
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.error(`${label} timed out after ${timeoutMs}ms`);
        resolve(null);
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  };

  const fetchUserData = async (userId: string) => {
    try {
      const loadRoles = async () => {
        const rolesRes = await withTimeout(
          supabase.from('user_roles').select('role').eq('user_id', userId),
          8000,
          'Roles fetch',
        );

        if (rolesRes && 'error' in rolesRes && rolesRes.error) {
          console.error('Failed to load roles:', rolesRes.error);
          return [] as AppRole[];
        }

        if (rolesRes && 'data' in rolesRes && rolesRes.data) {
          return rolesRes.data.map(r => r.role as AppRole);
        }

        return [] as AppRole[];
      };

      let nextRoles = await loadRoles();

      if (nextRoles.length === 0) {
        const { error: assignError, status } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'customer' });

        if (assignError && assignError.code !== '23505' && status !== 409) {
          console.error('Failed to auto-assign customer role:', assignError);
        } else {
          nextRoles = await loadRoles();
        }
      }

      setRoles(nextRoles);

      const resolvedProfile = await withTimeout(
        supabase
          .from('profiles')
          .select('full_name, email, avatar_url')
          .eq('user_id', userId)
          .maybeSingle(),
        8000,
        'Profile fetch',
      );

      if (resolvedProfile && 'error' in resolvedProfile && resolvedProfile.error) {
        console.error('Failed to load profile:', resolvedProfile.error);
      } else if (resolvedProfile && 'data' in resolvedProfile) {
        setProfile(resolvedProfile.data ?? null);
      }
    } catch (e) {
      console.error('Failed to load user data:', e);
    } finally {
      // Always clear loading after data fetch, success or failure
      setLoading(false);
    }
  };

  useEffect(() => {
    // onAuthStateChange fires immediately with the current session on mount,
    // then again on every subsequent change (sign in, sign out, token refresh).
    // Keep this callback plain (non-async) — Supabase doesn't await it.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Show spinner while roles load — prevents "Pending Approval" flash on sign-in
        setLoading(true);
        fetchUserData(session.user.id);
      } else {
        setRoles([]);
        setProfile(null);
        setLoading(false);
      }
    });

    // Safety net: if onAuthStateChange doesn't fire for a logged-out user,
    // getSession ensures loading is never stuck at true.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRoles([]);
    setProfile(null);
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  const refreshUserData = async () => {
    if (!user) return;
    await fetchUserData(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, session, roles, profile, loading, signOut, hasRole, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};


import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { supabase } from '../config/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (currentUser) => {
    if (!currentUser?.id) {
      console.log('[AUTH] User ID tidak ditemukan');
      return 'user';
    }

    console.log('[AUTH] Mengambil role untuk:', currentUser.id);

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (error) {
        console.error('[AUTH] Fetch Role Error:', error);
        return 'user';
      }

      console.log('[AUTH] Role Data:', data);

      const currentRole = data?.role === 'admin' ? 'admin' : 'user';

      console.log('[AUTH] Role Terbaca:', currentRole);

      return currentRole;
    } catch (error) {
      console.error('[AUTH] Fetch Role Exception:', error);
      return 'user';
    }
  };

  useEffect(() => {
    let mounted = true;
    let roleTimer = null;

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[AUTH] Get Session Error:', error);
        }

        const currentSession = data?.session ?? null;
        const currentUser = currentSession?.user ?? null;

        if (!mounted) return;

        setSession(currentSession);
        setUser(currentUser);

        console.log('[AUTH] Session User:', currentUser?.email);

        if (currentUser) {
          const currentRole = await fetchUserRole(currentUser);

          if (mounted) {
            setRole(currentRole);
          }
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error('[AUTH] Initialize Error:', error);

        if (mounted) {
          setRole(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mounted) return;

        console.log('[AUTH] Event:', event);

        const currentUser = currentSession?.user ?? null;

        setSession(currentSession);
        setUser(currentUser);

        if (roleTimer) {
          clearTimeout(roleTimer);
        }

        if (!currentUser) {
          setRole(null);
          setLoading(false);
          return;
        }

        setRole(null);
        setLoading(true);

        roleTimer = setTimeout(async () => {
          const currentRole = await fetchUserRole(currentUser);

          if (mounted) {
            setRole(currentRole);
            setLoading(false);
          }
        }, 0);
      }
    );

    return () => {
      mounted = false;

      if (roleTimer) {
        clearTimeout(roleTimer);
      }

      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setSession(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        role,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth harus digunakan di dalam AuthProvider'
    );
  }

  return context;
}

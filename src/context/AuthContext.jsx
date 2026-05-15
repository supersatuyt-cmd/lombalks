import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [juriData, setJuriData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchJuriData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchJuriData(session.user.id);
        } else {
          setJuriData(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchJuriData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('juri')
        .select(`*, bidang_lomba (nama, kode)`)
        .eq('user_id', userId)
        .single();
        
      if (!error && data) {
        setJuriData(data);
      }
    } catch (err) {
      console.error("Error fetching juri data:", err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = () => {
    return supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, juriData, signIn, signOut, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // juriData sekarang array — satu user bisa jadi juri di beberapa bidang
  const [juriList, setJuriList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchJuriData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchJuriData(session.user.id);
        } else {
          setJuriList([]);
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
        .select(`*, bidang_lomba (id, nama, kode)`)
        .eq('user_id', userId)
        .order('nama');

      if (!error && data && data.length > 0) {
        setJuriList(data);
      } else {
        setJuriList([]);
      }
    } catch (err) {
      console.error('Error fetching juri data:', err);
      setJuriList([]);
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

  // juriData: row pertama (untuk backward compat), atau null kalau bukan juri
  const juriData = juriList.length > 0 ? juriList[0] : null;
  // isJuri: user terdaftar sebagai juri di minimal 1 bidang
  const isJuri = juriList.length > 0;
  // isAdmin: sudah login tapi tidak terdaftar sebagai juri sama sekali
  const isAdmin = !!user && !loading && juriList.length === 0;

  return (
    <AuthContext.Provider value={{ user, juriData, juriList, isJuri, isAdmin, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { FoodFixMain } from './components/FoodFixMain';
import { supabase, refreshSupabaseClient } from './supabaseClient';
import { User } from '@supabase/supabase-js';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const activeClient = supabase || refreshSupabaseClient();

    const checkSession = async () => {
      try {
        if (activeClient) {
          const { data: { session } } = await activeClient.auth.getSession();
          if (active) {
            setUser(session?.user ?? null);
          }
        }
      } catch (err) {
        console.error('Error fetching Supabase session on mount:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    checkSession();

    if (!activeClient) {
      setLoading(false);
      return;
    }

    const { data: { subscription } } = activeClient.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLoginSuccess = async () => {
    // Re-verify the supabase client dynamically post local config
    const currentClient = supabase || refreshSupabaseClient();
    if (currentClient) {
      const { data: { session } } = await currentClient.auth.getSession();
      setUser(session?.user ?? null);
    }
  };

  const handleLogout = async () => {
    const currentClient = supabase || refreshSupabaseClient();
    if (currentClient) {
      await currentClient.auth.signOut();
    }
    setUser(null);
  };

  if (loading) {
    return (
      <div id="loading-screen" className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
        <p className="text-xs text-slate-500 mt-4 font-bold tracking-tight">Verifying active session...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return <FoodFixMain user={user} onLogout={handleLogout} />;
}


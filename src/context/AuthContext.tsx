'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'facilitator' | 'admin';
  cohort_id: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  redeemCode: (code: string, name: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Session timeout modal states
  const [sessionWarningOpen, setSessionWarningOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  const router = useRouter();

  // Helper to load profile
  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        setProfile(null);
      } else {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error('Unexpected error loading profile:', err);
      setProfile(null);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setSessionWarningOpen(false);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
    router.push('/');
  };

  const extendSession = async () => {
    try {
      setLoading(true);
      // Refresh current token using refresh token
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error || !session) {
        console.error('Could not refresh Supabase session:', error?.message);
        await signOut();
      } else {
        setSessionWarningOpen(false);
      }
    } catch (err) {
      console.error('Error extending session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check active session immediately
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Error during initial session check:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth state updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
        
        // Redirect based on role if on landing page
        if (event === 'SIGNED_IN') {
          const isRootPath = typeof window !== 'undefined' && window.location.pathname === '/';
          if (isRootPath) {
            const { data: prof } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            
            if (prof) {
              if (prof.role === 'admin') router.push('/admin');
              else if (prof.role === 'facilitator') router.push('/facilitator');
              else router.push('/student');
            }
          }
        }
      } else {
        setUser(null);
        setProfile(null);
        if (event === 'SIGNED_OUT') {
          router.push('/');
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Session warning checker interval
  useEffect(() => {
    if (!user) {
      setSessionWarningOpen(false);
      return;
    }

    const checkTimeout = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const expiresAt = session.expires_at; // Unix timestamp
      if (!expiresAt) return;
      const now = Math.floor(Date.now() / 1000);
      const secondsLeft = expiresAt - now;

      // Warn 60 seconds before expiration
      if (secondsLeft > 0 && secondsLeft <= 60) {
        setSecondsRemaining(secondsLeft);
        setSessionWarningOpen(true);
      } else if (secondsLeft <= 0) {
        setSessionWarningOpen(false);
        await signOut();
      } else {
        // If session was extended somehow, hide the warning
        setSessionWarningOpen(false);
      }
    };

    // Check session timeout status every 15 seconds
    const interval = setInterval(checkTimeout, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  // Handle countdown timer once modal warning is active
  useEffect(() => {
    let countdown: NodeJS.Timeout;
    if (sessionWarningOpen && secondsRemaining > 0) {
      countdown = setTimeout(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setSessionWarningOpen(false);
            signOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearTimeout(countdown);
  }, [sessionWarningOpen, secondsRemaining]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error };
      if (data?.user) {
        await loadProfile(data.user.id);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const redeemCode = async (code: string, name: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      // 1. Verify access code
      const { data: verifyData, error: verifyError } = await supabase.rpc('verify_access_code', {
        input_code: code,
      });

      if (verifyError) {
        return { success: false, error: verifyError.message };
      }

      const verification = verifyData as { valid: boolean; reason?: string; email?: string; cohort_id?: string; role?: string };
      if (!verification.valid) {
        return { success: false, error: verification.reason || 'Invalid access code.' };
      }

      const targetEmail = verification.email!;
      const targetCohortId = verification.cohort_id!;
      const targetRole = verification.role!;

      // 2. Sign up user via standard auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: targetEmail,
        password,
        options: {
          data: {
            full_name: name,
            role: targetRole,
            cohort_id: targetCohortId,
          },
        },
      });

      if (signUpError) {
        return { success: false, error: signUpError.message };
      }

      if (!signUpData.user) {
        return { success: false, error: 'Sign up failed.' };
      }

      // 3. Redeem the code and link in DB (updates profiles cohort_id & access_codes status)
      const { data: redeemSuccess, error: redeemError } = await supabase.rpc('redeem_access_code', {
        input_code: code,
        user_id: signUpData.user.id,
      });

      if (redeemError || !redeemSuccess) {
        return { success: false, error: redeemError?.message || 'Access code redemption failed.' };
      }

      // 4. Force state update & fetch profile
      setUser(signUpData.user);
      await loadProfile(signUpData.user.id);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'An unexpected error occurred.' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, redeemCode }}>
      {children}
      
      {/* Session Timeout Warning Modal */}
      {sessionWarningOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel max-w-sm w-full p-6 rounded-xl border border-zinc-800 text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Session Expiring</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your security session will expire in <span className="text-primary-blue font-mono font-bold">{secondsRemaining}</span> seconds due to inactivity.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setSessionWarningOpen(false);
                  signOut();
                }}
                className="flex-1 px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                Log Out
              </button>
              <button
                onClick={extendSession}
                className="flex-1 px-4 py-2 text-xs font-semibold rounded-lg bg-primary-blue hover:bg-blue-650 text-white shadow-[0_0_12px_rgba(37,99,235,0.2)] cursor-pointer"
              >
                Stay Signed In
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

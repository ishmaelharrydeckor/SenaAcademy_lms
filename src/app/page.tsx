'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { Button, Input, Card } from '@/components/UI';
import { Mail, Lock, Sparkles, KeyRound, User, ChevronRight, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { signIn, redeemCode, user, profile, loading } = useAuth();
  const { showToast } = useNotifications();
  const router = useRouter();

  // Navigation redirect if already logged in
  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin') router.push('/admin');
      else if (profile.role === 'facilitator') router.push('/facilitator');
      else router.push('/student');
    }
  }, [user, profile, router]);

  // Auth Modes: 'login' | 'redeem_code' | 'redeem_register'
  const [authMode, setAuthMode] = useState<'login' | 'redeem_code' | 'redeem_register'>('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Access Code Fields
  const [accessCode, setAccessCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [validatedCodeData, setValidatedCodeData] = useState<{ email?: string; cohort_id?: string } | null>(null);

  // Loading indicator for actions
  const [submitting, setSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Login Failed', 'Please enter both email and password.', 'warning');
      return;
    }
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);

    if (error) {
      showToast('Authentication Error', error.message || 'Invalid credentials.', 'error');
    } else {
      showToast('Welcome back', 'Successfully logged in to Sena Academy.', 'success');
    }
  };

  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode) {
      showToast('Validation Error', 'Please enter an access code.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: accessCode.trim().toUpperCase() }),
      });

      const response = await res.json();

      if (!res.ok) {
        showToast('Verification Failed', response.error || 'Code verification failed.', 'error');
      } else {
        if (response.valid) {
          setValidatedCodeData({ email: response.email, cohort_id: response.cohort_id });
          showToast('Code Validated', 'Access code belongs to email: ' + response.email, 'success');
          setAuthMode('redeem_register');
        } else {
          showToast('Invalid Code', response.reason || 'Code verification failed.', 'error');
        }
      }
    } catch (err: any) {
      showToast('Error', 'An unexpected error occurred.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRedeemRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentPassword) {
      showToast('Field Error', 'Please fill in all details.', 'warning');
      return;
    }

    setSubmitting(true);
    const { success, error } = await redeemCode(accessCode, studentName, studentPassword);
    setSubmitting(false);

    if (success) {
      showToast('Account Created', 'Successfully redeemed your access code.', 'success');
    } else {
      showToast('Redemption Failed', error || 'Could not redeem access code.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10 border-2 border-zinc-800 rounded-full">
            <div className="absolute w-10 h-10 border-2 border-t-primary-blue border-r-supporting-purple rounded-full animate-spin"></div>
          </div>
          <p className="text-xs text-zinc-500 font-medium tracking-widest uppercase">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 relative bg-zinc-950 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-blue/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-supporting-purple/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Left Pane - Branding & Value Proposition */}
      <div className="hidden md:flex flex-col justify-between p-12 lg:p-16 border-r border-zinc-900 bg-zinc-950 relative">
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-primary-blue to-supporting-purple flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-md font-bold tracking-tight text-white">SENA ACADEMY</span>
        </div>

        {/* Abstract Glowing Core Illustration */}
        <div className="my-auto py-12 relative flex items-center justify-center">
          <div className="absolute w-72 h-72 bg-gradient-to-tr from-primary-blue/20 to-supporting-purple/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-xl p-8 rounded-2xl w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">Sena Core Sandbox</span>
                <span className="h-2 w-2 rounded-full bg-success-green animate-ping"></span>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full bg-zinc-800/60 rounded"></div>
                <div className="h-2 w-4/5 bg-zinc-800/60 rounded"></div>
                <div className="h-2 w-5/6 bg-gradient-to-r from-primary-blue to-supporting-purple rounded"></div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-3 border-t border-zinc-800">
                <div className="flex gap-2">
                  <div className="h-5 w-5 rounded bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 font-mono">1</div>
                  <div className="h-5 w-5 rounded bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 font-mono">2</div>
                  <div className="h-5 w-5 rounded bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 font-mono">3</div>
                </div>
                <span className="text-[11px] font-medium text-primary-blue">Unlocked</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Forge the skills of tomorrow.</h2>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
            Enter the central hub for Sena Academy builders. Access your cohort schedule, collaborate on code, and push projects from design to deploy.
          </p>
        </div>
      </div>

      {/* Right Pane - Forms */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo visible only on mobile */}
          <div className="flex md:hidden items-center gap-3 mb-8">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-primary-blue to-supporting-purple flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-md font-bold tracking-tight text-white">SENA ACADEMY</span>
          </div>

          {/* Render Login Mode */}
          {authMode === 'login' && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Sign in to your account</h3>
                <p className="text-xs text-zinc-500 mt-1">Welcome back. Enter your credentials to access your portal.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-[38px] h-4 w-4 text-zinc-500" />
                  <Input
                    label="Email Address"
                    id="login-email"
                    type="email"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-7"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-[38px] h-4 w-4 text-zinc-500" />
                  <Input
                    label="Password"
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-7"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-zinc-900 border-zinc-800 text-primary-blue focus:ring-primary-blue"
                    />
                    Remember Me
                  </label>
                  <a href="#" className="text-xs font-medium text-primary-blue hover:underline">
                    Forgot Password?
                  </a>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Authenticating...' : 'Sign In'}
                </Button>
              </form>

              <div className="border-t border-zinc-900 pt-6 text-center space-y-4">
                <Button 
                  onClick={() => router.push('/enroll')}
                  className="w-full text-xs font-semibold bg-primary-blue hover:bg-blue-650 text-white"
                >
                  Enroll Now
                </Button>

                <p className="text-xs text-zinc-500">
                  Already have an access code?{' '}
                  <button
                    onClick={() => setAuthMode('redeem_code')}
                    className="text-primary-blue hover:underline font-semibold cursor-pointer"
                  >
                    Redeem Code
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Render Redeem Code: Verification step */}
          {authMode === 'redeem_code' && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary-blue" />
                  Redeem Access Code
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Enter the unique access code received in your registration email.
                </p>
              </div>

              <form onSubmit={handleVerifyCodeSubmit} className="space-y-4">
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-[38px] h-4 w-4 text-zinc-500" />
                  <Input
                    label="Access Code"
                    id="access-code"
                    type="text"
                    placeholder="SENA-XXXX-XXXX"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    required
                    className="pl-7 uppercase"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Verifying Code...' : 'Verify Access Code'}
                </Button>
              </form>

              <div className="border-t border-zinc-900 pt-6 text-center">
                <button
                  onClick={() => setAuthMode('login')}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  ← Return to Login
                </button>
              </div>
            </div>
          )}

          {/* Render Redeem Code: Register / Setup Profile step */}
          {authMode === 'redeem_register' && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Complete your profile</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Set up your full name and password to claim your student account for{' '}
                  <span className="text-zinc-300 font-mono font-medium">{validatedCodeData?.email}</span>.
                </p>
              </div>

              <form onSubmit={handleRedeemRegisterSubmit} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3.5 top-[38px] h-4 w-4 text-zinc-500" />
                  <Input
                    label="Full Name"
                    id="student-name"
                    type="text"
                    placeholder="Jane Doe"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                    className="pl-7"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-[38px] h-4 w-4 text-zinc-500" />
                  <Input
                    label="Choose Password"
                    id="student-password"
                    type="password"
                    placeholder="••••••••"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    required
                    className="pl-7"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Creating Account...' : 'Redeem & Login'}
                </Button>
              </form>

              <div className="border-t border-zinc-900 pt-6 text-center">
                <button
                  onClick={() => {
                    setValidatedCodeData(null);
                    setAuthMode('redeem_code');
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  ← Go back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

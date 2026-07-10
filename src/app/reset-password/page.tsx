'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { Button, Input, Card, LoadingScreen } from '@/components/UI';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const { user, loading } = useAuth();
  const { showToast } = useNotifications();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);

  // Redirect if they finish reset successfully
  useEffect(() => {
    if (resetCompleted && user) {
      const redirectUser = async () => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profile?.role === 'admin') {
            router.push('/admin');
          } else if (profile?.role === 'facilitator') {
            router.push('/facilitator');
          } else {
            router.push('/student');
          }
        } catch (err) {
          router.push('/');
        }
      };
      
      const timer = setTimeout(redirectUser, 2000);
      return () => clearTimeout(timer);
    }
  }, [resetCompleted, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      showToast('Password Updated', 'Your new password has been saved successfully.', 'success');
      setResetCompleted(true);
    } catch (err: any) {
      console.error('Password reset failed:', err);
      setValidationError(err.message || 'Failed to update password.');
      showToast('Update Failed', err.message || 'Error updating password', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Verifying security session..." />;
  }

  // If no user is authenticated (meaning no active session, or link expired)
  if (!user && !resetCompleted) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center bg-bg-canvas px-4 py-12">
        <Card className="max-w-md w-full text-center space-y-6 border border-zinc-800 p-8">
          <div className="flex justify-center">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-full animate-pulse">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-text-primary">Invalid or Expired Link</h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Your password recovery session is invalid, expired, or has already been used. Please request a new link from the home page login modal.
            </p>
          </div>
          <Button onClick={() => router.push('/')} variant="secondary" className="w-full">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-bg-canvas px-4 py-12">
      <Card className="max-w-md w-full border border-zinc-800 p-8 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-accent-primary/50 to-transparent pointer-events-none"></div>

        {resetCompleted ? (
          <div className="text-center space-y-6 py-4 animate-fade-in">
            <div className="flex justify-center">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-full animate-bounce">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-text-primary">Password Changed!</h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                Your password has been reset successfully. Redirecting you to your learning workspace...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <div className="space-y-2 text-center">
              <div className="flex justify-center mb-1">
                <div className="p-2.5 bg-accent-primary/10 border border-accent-primary/20 rounded-lg">
                  <KeyRound className="h-6 w-6 text-accent-primary" />
                </div>
              </div>
              <h2 className="text-xl font-extrabold text-text-primary">Set New Password</h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                Enter your new secure password below to regain access to your account.
              </p>
            </div>

            {validationError && (
              <div className="flex items-center gap-2 p-3 text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3.5 top-[38px] h-4 w-4 text-text-secondary/60 z-10" />
                <Input
                  label="New Password"
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-7"
                  disabled={submitting}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-[38px] h-4 w-4 text-text-secondary/60 z-10" />
                <Input
                  label="Confirm New Password"
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-7"
                  disabled={submitting}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full font-bold py-3 text-xs mt-2"
              disabled={submitting}
            >
              {submitting ? 'Updating Password...' : 'Reset Password'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

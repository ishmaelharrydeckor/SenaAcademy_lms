'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, Button, Input, LoadingScreen } from '@/components/UI';
import { CreditCard, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface Cohort {
  id: string;
  name: string;
  status: string;
  price?: number;
}

function EnrollForm() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [cohortId, setCohortId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const reference = searchParams.get('reference');

  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const { data, error } = await supabase
          .from('cohorts')
          .select('id, name, status, price')
          .eq('status', 'active');
        
        if (error) throw error;
        if (data) {
          setCohorts(data as Cohort[]);
          if (data.length > 0) {
            setCohortId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load cohorts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCohorts();
  }, []);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !confirmEmail || !cohortId) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (email.toLowerCase().trim() !== confirmEmail.toLowerCase().trim()) {
      setErrorMsg('Email addresses do not match.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/init-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, cohortId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Initialization failed.');
      }

      // Redirect student to Paystack hosted checkout page
      window.location.href = data.authorization_url;
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment system offline. Please try again later.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading checkout info..." />;
  }

  const { theme } = useTheme();

  // Success Landing State (Returned from Paystack)
  if (reference) {
    return (
      <main className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-250 bg-bg-canvas text-text-primary">
        {/* Glow ambient background */}
        {theme === 'dark' && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-blue/10 blur-[100px] rounded-full pointer-events-none"></div>
        )}

        <Card className="max-w-md w-full text-center p-8 space-y-6 relative overflow-hidden border-border-brand">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-success-green/20 to-transparent"></div>
          
          <div className="mx-auto w-12 h-12 rounded-full bg-success-green/10 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-success-green animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-text-primary">Payment Received!</h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Your transaction reference is <code className="text-text-primary font-mono text-[11px]">{reference}</code>.
            </p>
          </div>

          <div className="bg-bg-surface-hover/30 border border-border-brand rounded-lg p-4 text-left text-xs text-text-secondary space-y-2">
            <p className="font-semibold text-text-primary">What happens next?</p>
            <ul className="list-disc pl-4 space-y-1 text-text-secondary opacity-90">
              <li>Paystack verifies the transaction.</li>
              <li>An access code (SENA-XXXX-XXXX) is generated.</li>
              <li>The code will be sent to your email inbox (and spam folder) within 5 minutes.</li>
            </ul>
          </div>

          <div className="pt-2">
            <Button onClick={() => router.push('/?redeem=true')} className="w-full text-xs font-semibold">
              Go to Code Redemption Page
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  const selectedCohort = cohorts.find((c) => c.id === cohortId);
  const cohortPrice = selectedCohort?.price ?? 100;

  // Payment Form Screen
  return (
    <main className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-250 bg-bg-canvas text-text-primary">
      {theme === 'dark' && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-blue/10 blur-[100px] rounded-full pointer-events-none"></div>
      )}

      <div className="max-w-md w-full space-y-4 relative">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-3 w-3" /> Back
        </button>

        <Card className="p-6 sm:p-8 space-y-5 border-border-brand">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-accent-primary font-semibold">Cohort Admissions</span>
            <h2 className="text-xl font-bold tracking-tight text-text-primary">Sena Academy Signup</h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Complete payment to secure your seat. Admissions cost is <strong className="text-text-primary">GHS {cohortPrice}</strong>.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-lg text-center font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCheckoutSubmit} className="space-y-4">
            <Input
              label="Full Legal Name"
              id="enroll-name"
              placeholder="e.g. John Kojo Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={submitting}
            />

            <Input
              label="Student Email Address"
              id="enroll-email"
              type="email"
              placeholder="student@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={submitting}
            />

            <Input
              label="Confirm Student Email Address"
              id="enroll-confirm-email"
              type="email"
              placeholder="student@domain.com"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              required
              disabled={submitting}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">Select Cohort</label>
              {cohorts.length === 0 ? (
                <p className="text-xs text-text-secondary italic">No active cohorts open for enrollment.</p>
              ) : (
                <select
                  value={cohortId}
                  onChange={(e) => setCohortId(e.target.value)}
                  className="glass-input text-xs text-text-primary rounded-lg p-2.5 w-full bg-transparent"
                  required
                  disabled={submitting}
                >
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id} className="text-text-secondary">
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <Button
              type="submit"
              className="w-full text-xs font-semibold flex items-center justify-center gap-2 pt-2.5 pb-2.5"
              disabled={submitting || cohorts.length === 0}
            >
              <CreditCard className="h-4 w-4" />
              {submitting ? 'Redirecting to checkout...' : `Pay GHS ${cohortPrice} via Paystack`}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}

export default function EnrollPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading checkout info..." />}>
      <EnrollForm />
    </Suspense>
  );
}

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
  const [cohortId, setCohortId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const reference = searchParams.get('reference');

  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const { data, error } = await supabase
          .from('cohorts')
          .select('id, name, status')
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
    if (!fullName || !email || !cohortId) {
      setErrorMsg('Please fill in all fields.');
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
      <main className={`min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-250 ${
        theme === 'dark' ? 'bg-[#021736] text-zinc-100' : 'bg-[#F8FAFC] text-zinc-800'
      }`}>
        {/* Glow ambient background */}
        {theme === 'dark' && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-blue/10 blur-[100px] rounded-full pointer-events-none"></div>
        )}

        <Card className={`max-w-md w-full text-center p-8 space-y-6 relative overflow-hidden ${
          theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-success-green/20 to-transparent"></div>
          
          <div className="mx-auto w-12 h-12 rounded-full bg-success-green/10 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-success-green animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#021736]'}`}>Payment Received!</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your transaction reference is <code className="text-zinc-300 font-mono text-[11px]">{reference}</code>.
            </p>
          </div>

          <div className={`${theme === 'dark' ? 'bg-zinc-950/60 border border-zinc-900' : 'bg-zinc-100/50 border border-zinc-200'} rounded-lg p-4 text-left text-xs text-zinc-405 space-y-2`}>
            <p className={`font-semibold ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}`}>What happens next?</p>
            <ul className="list-disc pl-4 space-y-1 text-zinc-550">
              <li>Paystack verifies the transaction.</li>
              <li>An access code (SENA-XXXX-XXXX) is generated.</li>
              <li>The code will be sent to your email inbox (and spam folder) within 5 minutes.</li>
            </ul>
          </div>

          <div className="pt-2">
            <Button onClick={() => router.push('/')} className="w-full text-xs font-semibold">
              Go to Code Redemption Page
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  // Payment Form Screen
  return (
    <main className={`min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-250 ${
      theme === 'dark' ? 'bg-[#021736] text-zinc-100' : 'bg-[#F8FAFC] text-zinc-800'
    }`}>
      {theme === 'dark' && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-blue/10 blur-[100px] rounded-full pointer-events-none"></div>
      )}

      <div className="max-w-md w-full space-y-4 relative">
        <button
          onClick={() => router.push('/')}
          className={`flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
            theme === 'dark' ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-700'
          }`}
        >
          <ArrowLeft className="h-3 w-3" /> Back
        </button>

        <Card className={`p-6 sm:p-8 space-y-5 ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary-blue font-semibold">Cohort Admissions</span>
            <h2 className="text-xl font-bold tracking-tight text-white">Sena Academy Signup</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Complete payment to secure your seat. Admissions cost is <strong className="text-zinc-300">GHS 100</strong>.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-danger-red/10 border border-danger-red/20 text-danger-red text-xs p-3 rounded-lg text-center">
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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400">Select Cohort</label>
              {cohorts.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No active cohorts open for enrollment.</p>
              ) : (
                <select
                  value={cohortId}
                  onChange={(e) => setCohortId(e.target.value)}
                  className="glass-input text-xs text-zinc-100 rounded-lg p-2.5 w-full bg-zinc-950"
                  required
                  disabled={submitting}
                >
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <Button
              type="submit"
              className="w-full text-xs font-semibold flex items-center justify-center gap-2 pt-2.5 pb-2.5 bg-primary-blue hover:bg-blue-650"
              disabled={submitting || cohorts.length === 0}
            >
              <CreditCard className="h-4 w-4" />
              {submitting ? 'Redirecting to checkout...' : 'Pay GHS 100 via Paystack'}
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

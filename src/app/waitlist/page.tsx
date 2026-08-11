'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, BookOpen, MessageCircle, Check } from 'lucide-react';
import Link from 'next/link';

function WaitlistPageContent() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventId, setEventId] = useState('91458b94-24c7-43f7-a734-b90f1b65c78a');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const searchParams = useSearchParams();
  const eventSlug = searchParams.get('event');

  // Auto-fetch active published event
  useEffect(() => {
    async function fetchEvent() {
      try {
        const { supabase } = await import('@/lib/supabase');
        let query = supabase
          .from('events')
          .select('id')
          .eq('status', 'published');
        
        if (eventSlug) {
          query = query.eq('slug', eventSlug.trim());
        }

        const { data } = await query.limit(1).maybeSingle();
        if (data?.id) {
          setEventId(data.id);
        }
      } catch (err) {
        console.warn('Using fallback event ID.', err);
      }
    }
    fetchEvent();
  }, [eventSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      setErrorMsg('Please enter your name and email.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const source = searchParams.get('src') || searchParams.get('utm_source') || 'direct';
      
      const res = await fetch('/api/events/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: (phone || 'N/A').trim(),
          source,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to join waitlist.');
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased selection:bg-slate-900 selection:text-white">
      
      {/* Clean Minimalist Header */}
      <header className="w-full border-b border-slate-100 bg-white/80 backdrop-blur-md py-4 px-6 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-sm group-hover:opacity-90 transition-opacity">
              <img src="/logo_full.png" alt="Sena Academy" className="h-5 sm:h-6 object-contain" />
            </div>
          </Link>
          <span className="text-[11px] font-mono tracking-wider uppercase text-slate-500 font-medium">
            September 2026 Live Cohort
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-xl">
          
          {/* Header Typography (Uniform Solid Slate Color) */}
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 font-archivo leading-[1.15] mb-4">
              Stop learning to code. <br />
              Start learning to build.
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
              Join our free live online workshop this September. We open our laptops and build a real, working web platform from scratch using plain English.
            </p>
          </div>

          {success ? (
            /* Success State */
            <div className="p-8 rounded-2xl border border-emerald-200 bg-emerald-50/40 text-center shadow-xl animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold font-archivo text-slate-900 mb-2">
                You're on the list.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Your spot is confirmed for the September live workshop. We’ve also unlocked your free copy of <strong>The Non-Coder Guide to AI</strong>.
              </p>

              {/* Direct Guide Access Button */}
              <div className="mb-4">
                <Link
                  href="/guide"
                  className="w-full py-3.5 px-5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.99]"
                >
                  <BookOpen className="w-4 h-4" />
                  Read & Download Free AI Guide Now
                </Link>
              </div>

              {/* WhatsApp Community Button */}
              <div>
                <a
                  href="https://chat.whatsapp.com/LtAPH7IPPTg160oJj0REpS?s=cl&p=a&ilr=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.99]"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  Join Private WhatsApp Group
                </a>
                <span className="block text-[11px] text-slate-500 mt-2">
                  Live workshop links, room keys, and templates are shared in WhatsApp.
                </span>
              </div>
            </div>
          ) : (
            /* Clean White Form Card */
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white shadow-xl">
              
              {/* Value Bullet Points */}
              <div className="space-y-2 pb-6 mb-6 border-b border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>100% Free • Live interactive build session on Google Meet</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Build real web tools without memorizing coding syntax</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Includes instant access to <strong>The Non-Coder Guide to AI</strong></span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="Kwame Mensah"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="kwame@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    WhatsApp Number <span className="text-slate-400 font-normal">(Optional, for workshop link)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="024 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-600 text-center py-1 font-medium">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {loading ? 'Reserving...' : (
                    <>
                      Reserve My Free Spot
                      <ArrowRight className="w-4 h-4 text-white" />
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-slate-500 pt-1">
                  🔒 Free workshop • Instant guide access unlocked on submission
                </p>
              </form>
            </div>
          )}

          {/* Footer Signature */}
          <div className="mt-8 text-center text-xs text-slate-500 font-medium">
            <p>Hosted by <strong>Sena Academy</strong></p>
          </div>

        </div>
      </main>

    </div>
  );
}

export default function WaitlistPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white text-slate-500 flex items-center justify-center font-mono text-xs uppercase tracking-wider">
        Loading...
      </div>
    }>
      <WaitlistPageContent />
    </Suspense>
  );
}

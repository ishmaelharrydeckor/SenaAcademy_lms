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
    <div className="min-h-screen bg-[#080B11] text-gray-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Clean Minimalist Header */}
      <header className="w-full border-b border-white/5 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-white px-2 py-1 rounded-lg shadow-sm group-hover:opacity-90 transition-opacity">
              <img src="/logo_full.png" alt="Sena Academy" className="h-5 sm:h-6 object-contain" />
            </div>
          </Link>
          <span className="text-[11px] font-mono tracking-wider uppercase text-gray-400">
            September 2026 Live Cohort
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-xl">
          
          {/* Header Typography */}
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white font-archivo leading-[1.15] mb-4">
              Stop learning to code. <br />
              <span className="text-indigo-400">Start learning to build.</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-300 max-w-lg mx-auto leading-relaxed">
              Join our free live online workshop this September. We open our laptops and build a real, working web platform from scratch using plain English.
            </p>
          </div>

          {success ? (
            /* Success State */
            <div className="p-8 rounded-2xl border border-emerald-500/30 bg-[#0F1420] text-center shadow-xl animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold font-archivo text-white mb-2">
                You're on the list.
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                Your spot is confirmed for the September live workshop. We’ve also unlocked your free copy of <strong>The Non-Coder Guide to AI</strong>.
              </p>

              {/* Direct Guide Access Button */}
              <div className="mb-4">
                <Link
                  href="/guide"
                  className="w-full py-3.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-[0.99]"
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
                  className="w-full py-3.5 px-5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.99]"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  Join Private WhatsApp Group
                </a>
                <span className="block text-[11px] text-gray-400 mt-2">
                  Live workshop links, room keys, and templates are shared in WhatsApp.
                </span>
              </div>
            </div>
          ) : (
            /* Clean Form Card */
            <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0F1420] shadow-2xl">
              
              {/* Value Bullet Points */}
              <div className="space-y-2 pb-6 mb-6 border-b border-white/5 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>100% Free • Live interactive build session on Google Meet</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Build real web tools without memorizing coding syntax</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Includes instant access to <strong>The Non-Coder Guide to AI</strong></span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="Kwame Mensah"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="kwame@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    WhatsApp Number <span className="text-gray-400 font-normal">(Optional, for workshop link)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="024 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-400 text-center py-1">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-5 rounded-xl bg-white hover:bg-gray-100 text-slate-950 font-bold text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {loading ? 'Reserving...' : (
                    <>
                      Reserve My Free Spot
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-gray-400 pt-1">
                  🔒 Free workshop • Instant guide access unlocked on submission
                </p>
              </form>
            </div>
          )}

          {/* Founder Signature Note */}
          <div className="mt-8 text-center text-xs text-gray-400">
            <p>Hosted by <strong>Ishmael Harry-Deckor</strong> • Founder, Sena Academy</p>
          </div>

        </div>
      </main>

    </div>
  );
}

export default function WaitlistPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080B11] text-gray-400 flex items-center justify-center font-mono text-xs uppercase tracking-wider">
        Loading...
      </div>
    }>
      <WaitlistPageContent />
    </Suspense>
  );
}

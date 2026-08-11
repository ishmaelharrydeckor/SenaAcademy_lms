'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Sparkles, BookOpen, MessageCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col justify-center items-center px-4 sm:px-6 py-10 transition-colors duration-150 relative overflow-hidden font-sans">
      
      {/* Ambient Glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-xl z-10">
        
        {/* Top Eyebrow Badge */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold tracking-wide uppercase bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Free Live Online Build Workshop • September 2026
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-archivo text-white leading-tight mb-3">
            Build Real Web Apps with AI <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">
              Without Writing Code
            </span>
          </h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-md mx-auto leading-relaxed">
            Join Ishmael live online as we open our laptops and build a functional web application from scratch in plain English.
          </p>
        </div>

        {/* Free Gift Card Banner */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-emerald-950/30 border border-indigo-500/30 backdrop-blur-md flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-indigo-600/20 text-indigo-400 shrink-0 mt-0.5">
            <BookOpen className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-0.5">
              🎁 Free Welcome Gift Included
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Get immediate access to <strong>The Non-Coder’s Guide to AI: How to Prompt Like a Pro</strong> (60s Idea-to-App prompt blueprints) the instant you sign up!
            </p>
          </div>
        </div>

        {success ? (
          /* Success Animation State */
          <div className="text-center p-8 rounded-2xl border border-emerald-500/30 bg-[#0F172A]/80 backdrop-blur-xl shadow-2xl animate-fade-in">
            <div className="inline-flex items-center justify-center p-3.5 rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold font-archivo mb-2 text-white">
              🎉 You're on the list!
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              We have reserved your spot and sent your Free AI Prompt Guide to <strong className="text-emerald-400">{email}</strong>.
            </p>

            {/* Direct Guide Access Button */}
            <div className="mb-4">
              <a
                href="/guide"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-[0.99]"
              >
                <BookOpen className="w-4 h-4" />
                Read & Download Free AI Guide Now
              </a>
            </div>

            {/* WhatsApp Community Join Button */}
            <div className="mb-6">
              <a
                href="https://chat.whatsapp.com/LtAPH7IPPTg160oJj0REpS?s=cl&p=a&ilr=1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm transition-all shadow-lg hover:shadow-green-500/20 active:scale-[0.99]"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                Step 2: Join WhatsApp Community
              </a>
              <span className="block text-[11px] text-gray-400 mt-2">
                We drop the direct live online room link and starter templates inside WhatsApp.
              </span>
            </div>
          </div>
        ) : (
          /* High-Converting Streamlined Form */
          <div className="border border-white/10 shadow-2xl p-6 sm:p-8 rounded-2xl bg-[#0F172A]/70 backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Your Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kwame Mensah"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address (For Free Guide Delivery)</label>
                <input
                  type="email"
                  placeholder="e.g. kwame@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Optional WhatsApp Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  WhatsApp Phone Number <span className="text-gray-500 font-normal">(For workshop room link)</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 024 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-red-400 text-center font-medium py-1">{errorMsg}</p>
              )}

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm sm:text-base transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  'Reserving Your Spot...'
                ) : (
                  <>
                    👉 Reserve Free Spot & Get AI Guide
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-gray-400 pt-1">
                🔒 100% Free • No spam • Instant AI Guide download
              </p>
            </form>
          </div>
        )}

        {/* Footer Brand Tag */}
        <div className="text-center mt-8 text-xs text-gray-400">
          <p>© 2026 Sena Academy. <em>“Stop learning to code. Start learning to build.”</em></p>
        </div>

      </div>
    </div>
  );
}

export default function WaitlistPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-canvas text-text-secondary flex items-center justify-center font-mono text-xs uppercase tracking-wider">
        Loading Waitlist Portal...
      </div>
    }>
      <WaitlistPageContent />
    </Suspense>
  );
}

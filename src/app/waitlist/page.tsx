'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Button, Input } from '@/components/UI';
import { CheckCircle2, ArrowRight, Sparkles, BookOpen, MessageCircle, User, Mail, Phone, ExternalLink } from 'lucide-react';
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
    <div className="min-h-screen bg-bg-canvas text-text-primary flex flex-col font-sans transition-colors duration-200 relative overflow-x-hidden antialiased">
      
      {/* 1. TOP BRAND NAVIGATION */}
      <nav className="sticky top-0 bg-bg-canvas/80 backdrop-blur-md border-b border-border-brand z-40 transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
          <Link 
            href="/"
            className="bg-white px-2.5 py-1 rounded-xl border border-border-brand/20 shadow-sm flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <img src="/logo_full.png" alt="Sena Academy Logo" className="h-6 sm:h-7 object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <Link 
              href="/guide" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-all shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Free AI Guide</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Decorative Ambient Radial Glows */}
      <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-accent-primary/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 z-10">
        <div className="w-full max-w-lg animate-slide-up">
          
          {/* Header & Eyebrow Badge */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-accent-primary/10 text-accent-primary border border-accent-primary/20 mb-3.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Free Live Online Workshop • Sept 2026</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-archivo text-text-primary leading-tight mb-3">
              Build Real Web Apps with AI <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary via-indigo-400 to-purple-400">
                Without Writing Code
              </span>
            </h1>
          </div>

          {/* Free Gift Lead Magnet Banner */}
          <div className="mb-6 p-4 rounded-xl border border-accent-primary/25 bg-gradient-to-r from-accent-primary/10 via-indigo-500/5 to-transparent backdrop-blur-md flex items-start gap-3.5 shadow-sm">
            <div className="p-2.5 rounded-lg bg-accent-primary/15 text-accent-primary shrink-0 mt-0.5">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded">
                  🎁 Free Welcome Gift Included
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Get instant access to <strong>The Non-Coder’s Guide to AI: How to Prompt Like a Pro</strong> (60s prompt blueprints) upon signing up.
              </p>
            </div>
          </div>

          {success ? (
            /* Success State Card */
            <Card className="text-center p-6 sm:p-8 border border-success-brand/30 bg-success-brand/5 shadow-2xl animate-fade-in">
              <div className="inline-flex items-center justify-center p-3.5 rounded-full bg-success-brand/10 text-success-brand mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold font-archivo mb-2 text-text-primary">
                🎉 You're on the list!
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed mb-6">
                We have reserved your spot and sent your Free AI Prompt Guide to <strong className="text-text-primary">{email}</strong>.
              </p>

              {/* Direct Guide Access Button */}
              <div className="mb-4">
                <Link
                  href="/guide"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-full bg-accent-primary hover:opacity-90 text-white font-bold text-sm transition-all shadow-lg shadow-accent-primary/20 active:scale-[0.99]"
                >
                  <BookOpen className="w-4 h-4" />
                  Read & Download Free AI Guide Now
                </Link>
              </div>

              {/* WhatsApp Community Join Button */}
              <div className="mb-6">
                <a
                  href="https://chat.whatsapp.com/LtAPH7IPPTg160oJj0REpS?s=cl&p=a&ilr=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 w-full py-3.5 px-4 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm transition-all shadow-lg hover:shadow-green-500/20 active:scale-[0.99]"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  Step 2: Join WhatsApp Community
                </a>
                <span className="block text-[11px] text-text-muted mt-2">
                  We drop the direct live workshop room link and code templates inside WhatsApp.
                </span>
              </div>
            </Card>
          ) : (
            /* Streamlined Form Card */
            <Card className="border border-border-brand shadow-2xl p-6 sm:p-8 bg-bg-surface/60 backdrop-blur-xl">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Full Name */}
                <Input
                  id="waitlist-name"
                  label="Your Full Name"
                  type="text"
                  placeholder="e.g. Kwame Mensah"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  icon={<User className="w-4 h-4 text-text-secondary" />}
                  required
                />

                {/* Email Address */}
                <Input
                  id="waitlist-email"
                  label="Email Address (For Free Guide Delivery)"
                  type="email"
                  placeholder="e.g. kwame@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4 text-text-secondary" />}
                  required
                />

                {/* Optional WhatsApp Number */}
                <Input
                  id="waitlist-phone"
                  label="WhatsApp Phone Number (Optional)"
                  type="tel"
                  placeholder="024 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={<Phone className="w-4 h-4 text-text-secondary" />}
                />

                {errorMsg && (
                  <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-center font-medium">
                    {errorMsg}
                  </div>
                )}

                {/* Submit CTA Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  className="w-full py-3.5 sm:py-4 text-sm sm:text-base font-bold shadow-lg shadow-accent-primary/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {loading ? (
                    'Reserving Your Spot...'
                  ) : (
                    <>
                      👉 Reserve Free Spot & Get AI Guide
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-text-muted pt-1">
                  <Sparkles className="w-3 h-3 text-accent-primary" />
                  <span>100% Free • Instant AI Guide download on submission</span>
                </div>
              </form>
            </Card>
          )}

          {/* Footer Brand Tag */}
          <div className="text-center mt-8 text-xs text-text-muted">
            <p>© 2026 Sena Academy. <em>“Stop learning to code. Start learning to build.”</em></p>
          </div>

        </div>
      </main>

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

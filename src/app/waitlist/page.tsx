'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Button, Input } from '@/components/UI';
import { CheckCircle2, ArrowRight, Sparkles, BookOpen, MessageCircle, User, Mail, Phone } from 'lucide-react';
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
    <div className="min-h-screen bg-bg-canvas text-text-primary flex flex-col justify-start sm:justify-center items-center px-4 sm:px-6 pt-8 pb-16 transition-colors duration-150 relative overflow-x-hidden overflow-y-auto">
      
      {/* Decorative Brand Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent-primary/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg z-10 animate-slide-up my-auto">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-accent-primary/10 text-accent-primary border border-accent-primary/20 mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Free Live Online Workshop • Sept 2026
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-archivo text-text-primary leading-tight mb-3">
            Build Real Web Apps with AI <br className="hidden sm:inline" />
            <span className="text-accent-primary">
              Without Writing Code
            </span>
          </h1>
          <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
            Join Ishmael live online as we open our laptops and build a functional web application from scratch in plain English.
          </p>
        </div>

        {/* Free Gift Card */}
        <Card className="mb-6 border border-accent-primary/30 bg-accent-primary/5 p-4 flex items-start gap-3.5 shadow-sm">
          <div className="p-2.5 rounded-lg bg-accent-primary/10 text-accent-primary shrink-0 mt-0.5">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-accent-primary mb-0.5">
              🎁 Free Welcome Gift Included
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Get immediate access to <strong>The Non-Coder’s Guide to AI: How to Prompt Like a Pro</strong> (60s Idea-to-App prompt blueprints) the instant you sign up!
            </p>
          </div>
        </Card>

        {success ? (
          /* Success State */
          <Card className="text-center p-8 border border-success-brand/30 bg-success-brand/5 shadow-2xl animate-fade-in">
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
                We drop the direct live online room link and starter templates inside WhatsApp.
              </span>
            </div>
          </Card>
        ) : (
          /* Streamlined Waitlist Form */
          <Card className="border border-border-brand shadow-2xl p-8 bg-bg-surface/50 backdrop-blur-md">
            <form onSubmit={handleSubmit} className="space-y-5">
              
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
                <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-center">
                  {errorMsg}
                </div>
              )}

              {/* Submit CTA Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="w-full py-4 text-sm sm:text-base font-bold shadow-lg shadow-accent-primary/20 flex items-center justify-center gap-2 cursor-pointer mt-3"
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

              <p className="text-center text-[11px] text-text-muted pt-1">
                🔒 100% Free • No spam • Instant AI Guide download
              </p>
            </form>
          </Card>
        )}

        {/* Footer Brand Tag */}
        <div className="text-center mt-8 text-xs text-text-muted">
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

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Button, Input } from '@/components/UI';
import { CheckCircle2, ArrowRight, Sparkles, BookOpen, Laptop, Phone, MessageCircle } from 'lucide-react';

function WaitlistPageContent() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventId, setEventId] = useState('91458b94-24c7-43f7-a734-b90f1b65c78a'); // Fallback default published event
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const searchParams = useSearchParams();
  const eventSlug = searchParams.get('event');

  // Auto-fetch the active published event (or specific event by slug)
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

        const { data, error } = await query.limit(1).maybeSingle();
        
        if (data?.id) {
          setEventId(data.id);
        }
      } catch (err) {
        console.warn('Could not fetch active published event. Using fallback event ID.', err);
      }
    }
    fetchEvent();
  }, [eventSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const source = searchParams.get('src') || searchParams.get('utm_source') || 'direct';
      
      const res = await fetch('/api/events/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          fullName,
          email,
          phone,
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
    <div className="min-h-screen bg-bg-canvas text-text-primary flex flex-col justify-center items-center px-6 py-12 transition-colors duration-150 relative overflow-hidden">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg z-10 animate-slide-up">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight font-archivo text-text-primary mb-3">
            Join the Waitlist
          </h1>
          <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
            Get 100% free access to our upcoming live build-in-public workshops, starter code templates, and first-in-line access to enrollment.
          </p>
        </div>

        {success ? (
          /* Success Animation State */
          <Card className="text-center p-8 border border-success-brand/20 bg-success-brand/5 shadow-2xl">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-success-brand/10 text-success-brand mb-4">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold font-archivo mb-3 text-text-primary">
              You're in!
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              Congratulations! You have secured your waitlist spot. We have sent a confirmation email with free workshop details to <strong className="text-text-primary">{email}</strong>.
            </p>

            {/* WhatsApp Community Join Button */}
            <div className="mb-6">
              <a
                href="https://chat.whatsapp.com/LtAPH7IPPTg160oJj0REpS?s=cl&p=a&ilr=1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm transition-all shadow-lg hover:shadow-green-500/20 active:scale-[0.99]"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                Join WhatsApp Community
              </a>
              <span className="block text-[11px] text-text-muted mt-2">
                Join our community to get instant Google Meet invites and free templates.
              </span>
            </div>

            <div className="space-y-3 text-left bg-bg-canvas/50 p-4 rounded-lg border border-border-brand">
              <div className="flex items-start gap-3">
                <Laptop className="w-4 h-4 mt-0.5 text-accent-primary" />
                <span className="text-xs text-text-secondary">
                  <strong>Free Livestreams:</strong> Look out for our upcoming build session invites.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <BookOpen className="w-4 h-4 mt-0.5 text-accent-primary" />
                <span className="text-xs text-text-secondary">
                  <strong>Starter Kit:</strong> Free code templates will be emailed to you.
                </span>
              </div>
            </div>
          </Card>
        ) : (
          /* Waitlist Form State */
          <Card className="border border-border-brand shadow-2xl p-8 bg-bg-surface/50 backdrop-blur-md">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Split Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="waitlist-firstname"
                  label="First Name"
                  type="text"
                  placeholder="Ishmael"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  id="waitlist-lastname"
                  label="Last Name"
                  type="text"
                  placeholder="Harry"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              {/* Email Address */}
              <Input
                id="waitlist-email"
                label="Email Address"
                type="email"
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label htmlFor="waitlist-phone" className="text-xs font-semibold text-text-secondary block">
                  Phone Number
                </label>
                <div className="relative">
                  <Input
                    id="waitlist-phone"
                    type="tel"
                    placeholder="054XXXXXXX or +233"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    icon={<Phone className="w-4 h-4 text-text-secondary" />}
                  />
                </div>
                <span className="text-[10px] text-text-secondary mt-1 block">
                  Make sure to include your active WhatsApp number for event notifications.
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg">
                  {errorMsg}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full justify-center gap-2 animate-pulse hover:animate-none"
                size="lg"
              >
                {loading ? 'Securing Spot...' : 'Secure Free Spot'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </Button>

              <div className="text-center text-[10px] text-text-secondary pt-2">
                🔒 No credit card required. Free live sessions access only.
              </div>
            </form>
          </Card>
        )}
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

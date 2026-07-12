'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, Button, Input, LoadingScreen } from '@/components/UI';
import { 
  Calendar, 
  MapPin, 
  Video, 
  ArrowLeft, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  Copy, 
  Loader2, 
  ExternalLink 
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string | null;
  event_type: 'online' | 'in_person';
  location: string | null;
  meeting_link: string | null;
  start_time: string;
  end_time: string;
  is_paid: boolean;
  price: number | null;
  currency: string;
  capacity: number | null;
  status: 'draft' | 'published' | 'cancelled';
}

function EventDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendeeCount, setAttendeeCount] = useState<number>(0);
  
  // Registration Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Post-Registration States
  const [registered, setRegistered] = useState(false);
  const [registrationDetails, setRegistrationDetails] = useState<any>(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  // Sharing states
  const [copied, setCopied] = useState(false);

  const reference = searchParams.get('reference');
  const successParam = searchParams.get('success');

  // 1. Fetch Event and Capacity Details
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (eventError || !eventData) {
          throw new Error('Event not found');
        }

        setEvent(eventData as Event);

        // Fetch attendee count securely
        const { data: countData, error: countError } = await supabase.rpc(
          'get_event_attendee_count',
          { p_event_id: eventData.id }
        );

        if (!countError && countData !== null) {
          setAttendeeCount(Number(countData));
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Could not load event details.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchEventData();
    }
  }, [slug]);

  // 2. Poll for payment reference status if redirected from Paystack
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const pollPaymentStatus = async () => {
      if (!reference) return;
      setVerifyingPayment(true);

      try {
        const { data, error } = await supabase.rpc('check_registration_status', {
          p_reference: reference
        });

        if (error) throw error;

        if (data && data.registered) {
          setRegistrationDetails(data);
          setRegistered(true);
          setVerifyingPayment(false);
          clearInterval(intervalId);
        } else {
          // If not registered yet, increment attempts
          setVerificationAttempts((prev) => prev + 1);
          if (verificationAttempts >= 6) {
            // Stop checking after 12 seconds
            setVerifyingPayment(false);
            clearInterval(intervalId);
            setErrorMsg('Payment verification is taking longer than expected. Please check your email inbox for confirmation, or contact support with your payment reference.');
          }
        }
      } catch (err) {
        console.error('Error verifying payment status:', err);
      }
    };

    if (reference) {
      pollPaymentStatus(); // check immediately
      intervalId = setInterval(pollPaymentStatus, 2000); // then check every 2s
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [reference, verificationAttempts]);

  if (loading) {
    return <LoadingScreen message="Loading event details..." />;
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-bg-canvas text-text-primary flex flex-col justify-center items-center p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-text-primary">Event Not Found</h2>
        <p className="text-xs text-text-secondary mt-1">This event may have been cancelled, set to draft, or does not exist.</p>
        <Button onClick={() => router.push('/events')} className="mt-6 text-xs font-semibold">
          Back to Events
        </Button>
      </main>
    );
  }

  const formatEventDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatEventTime = (startTimeStr: string, endTimeStr: string) => {
    const start = new Date(startTimeStr);
    const end = new Date(endTimeStr);
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return `${start.toLocaleTimeString('en-US', options)} - ${end.toLocaleTimeString('en-US', options)}`;
  };

  // 3. Handle Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/events/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId: event.id, fullName, email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      if (event.is_paid && data.authorization_url) {
        // Redirect to Paystack Checkout page
        window.location.href = data.authorization_url;
      } else {
        // Free registration complete!
        setRegistered(true);
        setRegistrationDetails({
          full_name: fullName,
          email: email,
          event_title: event.title,
          event_type: event.event_type,
          meeting_link: event.meeting_link,
          location: event.location
        });
        setAttendeeCount((prev) => prev + 1);
        setSubmitting(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration system offline. Please try again later.');
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    const siteUrl = window.location.href.split('?')[0];
    navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const siteUrl = window.location.href.split('?')[0];
    const text = encodeURIComponent(`Hey! Check out this event: "${event.title}" on Sena Academy. Register here: ${siteUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const isFull = event.capacity !== null && attendeeCount >= event.capacity;
  const isOnline = event.event_type === 'online';

  return (
    <main className="min-h-screen bg-bg-canvas text-text-primary relative overflow-hidden flex flex-col">
      {/* Navigation Header */}
      <nav className="sticky top-0 border-b border-border-brand py-4 px-6 md:px-12 flex justify-between items-center z-40 bg-bg-canvas">
        <div 
          onClick={() => router.push('/')}
          className="bg-white px-3 py-1 rounded-xl border border-border-brand/20 shadow-sm h-11 flex items-center justify-center cursor-pointer select-none hover:opacity-90 transition-opacity"
        >
          <img src="/logo_full.png" alt="Sena Academy Logo" className="h-9 object-contain" />
        </div>
        <button
          onClick={() => router.push('/events')}
          className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Events
        </button>
      </nav>

      {/* Main content grid */}
      <div className="max-w-6xl w-full mx-auto px-6 md:px-12 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10 z-10 flex-1">
        {/* Left Side: Event Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`w-full rounded-2xl overflow-hidden relative border border-border-brand bg-bg-canvas/40 flex items-center justify-center ${event.cover_image_url ? 'py-4' : 'h-64 sm:h-96'}`}>
            {event.cover_image_url ? (
              <img
                src={event.cover_image_url}
                alt={event.title}
                className="w-full h-auto max-h-[550px] object-contain block"
              />
            ) : (
              <div className="w-full h-full bg-bg-surface flex items-center justify-center relative">
                <Calendar className="h-16 w-16 text-accent-primary/20" />
              </div>
            )}
            
            {/* Event Format Badge */}
            <span className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-bg-canvas/90 text-xs font-semibold text-text-primary border border-border-brand flex items-center gap-1.5">
              {isOnline ? (
                <>
                  <Video className="h-3.5 w-3.5 text-accent-primary" /> Online
                </>
              ) : (
                <>
                  <MapPin className="h-3.5 w-3.5 text-success-brand" /> In-Person
                </>
              )}
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              {event.title}
            </h1>

            {/* Quick stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-surface/30 border border-border-brand/40">
                <Calendar className="h-5 w-5 text-accent-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-text-secondary">Date</p>
                  <p className="text-xs font-bold text-text-primary">{formatEventDate(event.start_time)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-surface/30 border border-border-brand/40">
                <Clock className="h-5 w-5 text-accent-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-text-secondary">Time</p>
                  <p className="text-xs font-bold text-text-primary">{formatEventTime(event.start_time, event.end_time)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-surface/30 border border-border-brand/40">
                {isOnline ? (
                  <Video className="h-5 w-5 text-accent-primary mt-0.5 shrink-0" />
                ) : (
                  <MapPin className="h-5 w-5 text-accent-primary mt-0.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-mono tracking-wider text-text-secondary">Location</p>
                  <p className="text-xs font-bold text-text-primary truncate">
                    {isOnline ? 'Online via Meeting Link' : (event.location || 'Accra, Ghana')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-surface/30 border border-border-brand/40">
                <Users className="h-5 w-5 text-accent-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-text-secondary">Availability</p>
                  <p className="text-xs font-bold text-text-primary">
                    {event.capacity === null 
                      ? 'Unlimited spots available' 
                      : `${attendeeCount} / ${event.capacity} spots filled`}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="prose prose-invert max-w-none pt-4">
              <h3 className="text-lg font-bold text-text-primary mb-2">About this event</h3>
              <p className="text-xs leading-relaxed text-text-secondary whitespace-pre-line font-normal">
                {event.description}
              </p>
            </div>

            {/* Mobile Scroll Guide: Guide user to RSVP below on mobile/tablet screens */}
            <div className="lg:hidden mt-6 p-4 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-center space-y-1.5 animate-pulse">
              <p className="text-xs font-bold text-text-primary">Ready to attend?</p>
              <p className="text-[11px] text-text-secondary leading-relaxed">Scroll down to fill out the RSVP Registration form below to reserve your seat!</p>
              <div className="text-accent-primary text-xs font-bold font-mono">↓↓↓</div>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Card */}
        <div className="space-y-6">
          {/* 1. Verifying Payment Spinner State */}
          {verifyingPayment && (
            <Card className="border-border-brand text-center p-8 space-y-6">
              <div className="mx-auto w-12 h-12 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-accent-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-text-primary">Verifying payment...</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  We are checking your transaction status. This will take just a few seconds...
                </p>
              </div>
              <div className="bg-bg-canvas/50 border border-border-brand rounded-lg p-3 text-[10px] text-text-secondary font-mono">
                Ref: {reference}
              </div>
            </Card>
          )}

          {/* 2. Success State Card */}
          {!verifyingPayment && registered && (
            <Card className="border-border-brand p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-success-brand/20 to-transparent"></div>
              
              <div className="mx-auto w-12 h-12 rounded-full bg-success-brand/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success-brand" />
              </div>

              <div className="space-y-2 text-center">
                <h2 className="text-lg font-bold text-text-primary">Registration Confirmed!</h2>
                <p className="text-xs text-text-secondary">
                  Hi {registrationDetails?.full_name || fullName}, you are locked in for the event.
                </p>
              </div>

              {/* Event information summary */}
              <div className="bg-bg-surface-hover/30 border border-border-brand rounded-lg p-4 space-y-3">
                <div className="text-xs">
                  <p className="font-semibold text-text-primary">{event.title}</p>
                  <p className="text-text-secondary mt-0.5">{formatEventDate(event.start_time)}</p>
                  <p className="text-text-secondary">{formatEventTime(event.start_time, event.end_time)}</p>
                </div>

                {registrationDetails?.meeting_link && (
                  <div className="pt-2 border-t border-border-brand/40 space-y-2">
                    <p className="text-[11px] font-semibold text-accent-primary">Online Join Details:</p>
                    <a 
                      href={registrationDetails.meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-accent-primary hover:bg-accent-primary-hover px-3 py-1.5 rounded transition-colors"
                    >
                      Join Meeting <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {event.event_type === 'in_person' && (
                  <div className="pt-2 border-t border-border-brand/40 text-[11px]">
                    <p className="font-semibold text-success-brand">Venue Address:</p>
                    <p className="text-text-secondary mt-0.5">{event.location || 'Accra, Ghana'}</p>
                  </div>
                )}
              </div>

              <div className="text-center text-xs text-text-secondary leading-relaxed bg-bg-surface/20 border border-border-brand/40 p-3 rounded-lg">
                We've sent a confirmation email containing these details (and your link/venue instructions) to your registered email address.
              </div>

              <div>
                <Button onClick={() => router.push('/events')} className="w-full text-xs font-semibold">
                  Browse Other Events
                </Button>
              </div>
            </Card>
          )}

          {/* 3. RSVP Form Card (Default State) */}
          {!verifyingPayment && !registered && (
            <Card className="border-border-brand p-6 space-y-5">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-accent-primary font-semibold">
                  Secure Your Spot
                </span>
                <h2 className="text-lg font-bold text-text-primary">RSVP Registration</h2>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {event.is_paid 
                    ? `Paid workshop. Seat admission is GHS ${event.price}.` 
                    : 'Free community meetup. RSVP below to receive details.'}
                </p>
              </div>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-lg text-center font-semibold flex items-center justify-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {isFull ? (
                <div className="space-y-4">
                  <div className="bg-bg-surface-hover border border-border-brand text-text-secondary text-xs p-4 rounded-lg text-center font-semibold">
                    Event is Full
                  </div>
                  <p className="text-[11px] text-text-secondary text-center">
                    All seats are currently taken. Follow our events page to join future cohorts and workshops!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <Input
                    label="Full Name"
                    id="rsvp-name"
                    placeholder="e.g. Ama Osei"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={submitting}
                  />

                  <Input
                    label="Email Address"
                    id="rsvp-email"
                    type="email"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={submitting}
                  />

                  <Button
                    type="submit"
                    className="w-full text-xs font-semibold py-2.5 flex items-center justify-center gap-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {event.is_paid ? 'Redirecting to checkout...' : 'Processing RSVP...'}
                      </>
                    ) : (
                      event.is_paid ? `Pay GHS ${event.price} via Paystack` : 'Confirm Free RSVP'
                    )}
                  </Button>
                </form>
              )}
            </Card>
          )}

          {/* Social Share section */}
          <Card className="border-border-brand p-5 space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
              <Share2 className="h-4 w-4 text-accent-primary" /> Share Event
            </span>
            <div className="flex gap-2.5">
              <Button 
                onClick={handleCopyLink} 
                variant="secondary" 
                size="sm" 
                className="flex-1 text-[11px] font-semibold py-2 flex items-center justify-center gap-1.5 bg-bg-surface-hover border border-border-brand"
              >
                <Copy className="h-3.5 w-3.5" /> {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              <Button 
                onClick={handleShareWhatsApp} 
                variant="secondary" 
                size="sm" 
                className="flex-1 text-[11px] font-semibold py-2 flex items-center justify-center gap-1.5 bg-bg-surface-hover border border-border-brand hover:bg-green-600/10 hover:border-green-500/30 hover:text-green-400"
              >
                WhatsApp
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default function EventDetailPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading event details..." />}>
      <EventDetailContent />
    </Suspense>
  );
}

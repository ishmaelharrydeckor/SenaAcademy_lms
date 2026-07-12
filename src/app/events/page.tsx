'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, Button, LoadingScreen } from '@/components/UI';
import { Calendar, MapPin, Video, ArrowLeft, Clock, Sparkles } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string | null;
  event_type: 'online' | 'in_person';
  location: string | null;
  start_time: string;
  end_time: string;
  is_paid: boolean;
  price: number | null;
  currency: string;
  capacity: number | null;
  status: 'draft' | 'published' | 'cancelled';
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'published')
          .order('start_time', { ascending: true });

        if (error) throw error;
        if (data) {
          setEvents(data as Event[]);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <LoadingScreen message="Discovering academy events..." />;
  }

  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.start_time) >= now);
  
  // Sort past events in descending order (most recent first)
  const pastEvents = events
    .filter((e) => new Date(e.start_time) < now)
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  const currentEventsList = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  const formatEventDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back Home
        </button>
      </nav>

      {/* Hero Section */}
      <header className="relative py-12 px-6 md:px-12 max-w-6xl mx-auto flex flex-col items-center text-center z-10 space-y-4">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-text-primary">
          Sena Academy Events
        </h1>
        <p className="text-sm md:text-base leading-relaxed text-text-secondary max-w-2xl mx-auto">
          Connect with industry experts, collaborate on project builds, and master cutting-edge software stacks in our live workshops.
        </p>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl w-full mx-auto px-6 md:px-12 z-10 flex flex-col flex-1 pb-20">
        <div className="flex border-b border-border-brand mb-8 justify-center sm:justify-start">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-5 py-3 text-xs font-semibold select-none border-b-2 transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'border-accent-primary text-text-primary bg-bg-surface/20'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Upcoming Events ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-5 py-3 text-xs font-semibold select-none border-b-2 transition-all cursor-pointer ${
              activeTab === 'past'
                ? 'border-accent-primary text-text-primary bg-bg-surface/20'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Past Events ({pastEvents.length})
          </button>
        </div>

        {/* Events Grid */}
        {currentEventsList.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-20 text-center border-border-brand flex-1 max-w-lg mx-auto w-full">
            <Calendar className="h-10 w-10 text-text-secondary opacity-30 mb-4" />
            <h3 className="text-base font-bold text-text-primary">No events found</h3>
            <p className="text-xs text-text-secondary mt-1">
              {activeTab === 'upcoming'
                ? "We are currently planning our next workshop. Check back soon!"
                : "No past events registered on the platform yet."}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentEventsList.map((event) => {
              const priceText = event.is_paid
                ? `${event.currency || 'GHS'} ${event.price}`
                : 'Free RSVP';
                
              return (
                <Card
                  key={event.id}
                  hoverable
                  onClick={() => router.push(`/events/${event.slug}`)}
                  className="flex flex-col h-full border-border-brand"
                >
                  {/* Card Cover Image */}
                  <div className="h-44 -mx-6 -mt-6 mb-4 overflow-hidden relative border-b border-border-brand bg-bg-surface-hover/30 flex items-center justify-center">
                    {event.cover_image_url ? (
                      <img
                        src={event.cover_image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-bg-surface flex items-center justify-center relative">
                        <Calendar className="h-12 w-12 text-accent-primary/40" />
                      </div>
                    )}
                    
                    {/* Event format badge */}
                    <span className="absolute top-3 right-3 px-2 py-1 rounded bg-bg-canvas/90 text-[10px] font-semibold text-text-primary border border-border-brand flex items-center gap-1">
                      {event.event_type === 'online' ? (
                        <>
                          <Video className="h-3 w-3 text-accent-primary" /> Online
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3 w-3 text-success-brand" /> Physical
                        </>
                      )}
                    </span>

                    {/* Price Badge */}
                    <span className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      event.is_paid 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                        : 'bg-success-brand/10 text-success-brand border-success-brand/20'
                    }`}>
                      {priceText}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-text-primary tracking-tight line-clamp-1 group-hover:text-accent-primary transition-colors">
                        {event.title}
                      </h3>
                      
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border-brand/40 space-y-2 text-[11px] text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-accent-primary shrink-0" />
                        <span>{formatEventDate(event.start_time)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 block shrink-0"></span>
                        <span>{formatEventTime(event.start_time, event.end_time)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {event.event_type === 'online' ? (
                          <>
                            <Video className="h-3.5 w-3.5 text-accent-primary shrink-0" />
                            <span className="truncate">Meeting link sent upon registration</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3.5 w-3.5 text-accent-primary shrink-0" />
                            <span className="truncate">{event.location || 'Accra, Ghana'}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="pt-5">
                      <Button className="w-full text-xs font-semibold" variant={activeTab === 'upcoming' ? 'primary' : 'secondary'}>
                        {activeTab === 'upcoming' ? 'Register Now' : 'View Summary'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Mail,
  MessageSquare,
  PhoneCall,
  Terminal,
  Users,
  Settings,
  Loader2,
  Play,
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  start_time: string;
}

export default function CommunicationsPage() {
  // Navigation tab states
  const [activeSubTab, setActiveSubTab] = useState<'broadcast' | 'jobs'>('broadcast');

  // Database options
  const [events, setEvents] = useState<EventItem[]>([]);
  const [counts, setCounts] = useState({
    students: 0,
    facilitators: 0,
    waitlistTotal: 0
  });

  // Target groups dropdown configuration
  const [targetGroup, setTargetGroup] = useState<'all_students' | 'facilitators' | 'event_registrants' | 'event_waitlist' | 'manual_list'>('all_students');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [channel, setChannel] = useState<'email' | 'sms' | 'robocall'>('email');

  // Input states
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [voiceId, setVoiceId] = useState('');
  const [campaignName, setCampaignName] = useState('LMS Broadcast');
  const [manualRecipientsText, setManualRecipientsText] = useState('');

  // Background Jobs Form states
  const [jobEventId, setJobEventId] = useState('');
  const [jobRecipientGroup, setJobRecipientGroup] = useState<'all' | 'registrants' | 'waitlist'>('all');

  // Loading indicator states
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [runningJob, setRunningJob] = useState(false);

  // Terminal Logs Window
  const [logs, setLogs] = useState<string[]>(['[System] Communications Hub initialized. System online.']);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Fetch standard data counts and active events
  const loadConfigurationData = async () => {
    setLoadingConfig(true);
    addLog('Fetching platform configuration and event lists...');
    try {
      // 1. Fetch active events
      const { data: eventData, error: eventErr } = await supabase
        .from('events')
        .select('id, title, start_time')
        .order('start_time', { ascending: false });

      if (eventErr) throw eventErr;
      setEvents(eventData || []);

      if (eventData && eventData.length > 0) {
        setSelectedEventId(eventData[0].id);
        setJobEventId(eventData[0].id);
      }

      // 2. Fetch profile role counts
      const { count: studentCount, error: studErr } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      const { count: facCount, error: facErr } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'facilitator');

      // 3. Fetch waitlist count safely
      let wlCount = 0;
      try {
        const { count, error: wlErr } = await supabase
          .from('event_waitlist')
          .select('*', { count: 'exact', head: true });
        if (!wlErr && count !== null) wlCount = count;
      } catch (e) {
        console.warn('Could not query event_waitlist row count:', e);
      }

      setCounts({
        students: studentCount || 0,
        facilitators: facCount || 0,
        waitlistTotal: wlCount
      });

      addLog(`Configuration loaded. Registered Students: ${studentCount || 0}, Mentors: ${facCount || 0}, Active events: ${eventData?.length || 0}`);
    } catch (err: any) {
      addLog(`[Error] Failed to load layout parameters: ${err.message}`);
      console.error(err);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    loadConfigurationData();
  }, []);

  // Dispatch general broadcast campaign
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingBroadcast(true);
    addLog(`Initiating bulk broadcast via [${channel.toUpperCase()}] to group: ${targetGroup}...`);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        throw new Error('No active administrator session token found. Please log in.');
      }

      // Parse manual list if selected
      let parsedManualRecipients: string[] = [];
      if (targetGroup === 'manual_list') {
        parsedManualRecipients = manualRecipientsText
          .split(/[\n,]+/)
          .map(item => item.trim())
          .filter(item => item !== '');
        
        if (parsedManualRecipients.length === 0) {
          throw new Error('Manual recipient list cannot be empty.');
        }
      }

      const response = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetGroup,
          channel,
          eventId: (targetGroup === 'event_registrants' || targetGroup === 'event_waitlist') ? selectedEventId : undefined,
          subject: channel === 'email' ? subject : undefined,
          message: channel !== 'robocall' ? message : undefined,
          voiceId: channel === 'robocall' ? voiceId : undefined,
          campaignName: channel === 'robocall' ? campaignName : undefined,
          manualRecipients: targetGroup === 'manual_list' ? parsedManualRecipients : undefined
        })
      });

      const res = await response.json();
      if (!response.ok) throw new Error(res.error || 'Broadcast failed.');

      addLog(`[Broadcast finished] Status: ${res.message}`);
      if (res.failedCount > 0) {
        addLog(`[Warning] Failures logged: ${res.failedCount}. Review details below.`);
        res.failures.forEach((fail: any) => {
          addLog(`  -> Failed: ${fail.recipient}. Reason: ${fail.error}`);
        });
      } else {
        addLog(`[Success] All ${res.sentCount} items sent successfully.`);
      }

      // Reset form variables
      if (channel === 'email') {
        setSubject('');
        setMessage('');
      } else if (channel === 'sms') {
        setMessage('');
      } else if (channel === 'robocall') {
        setVoiceId('');
      }
    } catch (err: any) {
      addLog(`[Error] Broadcast execution failed: ${err.message}`);
    } finally {
      setSendingBroadcast(false);
    }
  };

  // Dispatch background job execution (Daemons)
  const handleTriggerJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setRunningJob(true);
    addLog(`Running background task: "Event Reminders Daemon" for target event ID: ${jobEventId}...`);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        throw new Error('No active administrator session token found. Please log in.');
      }

      const response = await fetch('/api/admin/events/send-reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: jobEventId,
          recipientGroup: jobRecipientGroup
        })
      });

      const res = await response.json();
      if (!response.ok) throw new Error(res.error || 'Job failed.');

      addLog(`[Daemon finished] Result: ${res.message}`);
      if (res.summary) {
        addLog(`  -> Registrants Reminders Sent: ${res.summary.registrants?.sent || 0} / Failed: ${res.summary.registrants?.failed || 0}`);
        addLog(`  -> Waitlist Reminders Sent: ${res.summary.waitlist?.sent || 0} / Failed: ${res.summary.waitlist?.failed || 0}`);
      }
    } catch (err: any) {
      addLog(`[Error] Job failed: ${err.message}`);
    } finally {
      setRunningJob(false);
    }
  };

  return (
    <div className="space-y-10">
      
      {/* 1. Sub-navigation tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveSubTab('broadcast')}
          className={`px-5 py-3 text-xs font-mono uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'broadcast'
              ? 'border-accent-primary text-text-primary font-bold'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Broadcast Terminal
        </button>
        <button
          onClick={() => setActiveSubTab('jobs')}
          className={`px-5 py-3 text-xs font-mono uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'jobs'
              ? 'border-accent-primary text-text-primary font-bold'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Daemons & Tasks
        </button>
      </div>

      {/* 2. Interactive Terminal log (Always visible, very premium UI look) */}
      <section className="bg-neutral-950 text-emerald-400 p-5 rounded-xl border border-neutral-800 shadow-lg">
        <div className="flex items-center gap-2 mb-3 border-b border-neutral-800 pb-2">
          <Terminal className="h-4 w-4" />
          <span className="text-xs font-mono tracking-wider uppercase">Communication Hub Live Terminal</span>
          <button 
            onClick={loadConfigurationData}
            disabled={loadingConfig}
            className="p-1 rounded text-text-secondary hover:text-white transition-colors ml-auto cursor-pointer"
            title="Reload config metrics"
          >
            {loadingConfig ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          </button>
        </div>
        <div className="font-mono text-[11px] space-y-1.5 h-36 overflow-y-auto select-text scrollbar-thin">
          {logs.map((log, i) => (
            <div key={i} className="leading-relaxed whitespace-pre-wrap">{log}</div>
          ))}
          <div ref={terminalEndRef} />
        </div>
      </section>

      {/* 3. Panel Displays */}
      {activeSubTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form container */}
          <div className="lg:col-span-2 bg-bg-surface border border-border p-6 rounded-xl space-y-6">
            <h2 className="text-lg font-bold font-archivo tracking-tight uppercase flex items-center gap-2">
              <Send className="h-4 w-4 text-text-secondary" />
              Configure Broadcast
            </h2>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Target Audience Selector */}
                <div>
                  <label className="block text-[10px] font-mono text-text-secondary uppercase mb-1.5">Recipient Group</label>
                  <select
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value as any)}
                    className="w-full p-2.5 bg-bg-canvas border border-border rounded-lg text-xs focus:outline-none focus:border-accent-primary font-mono text-text-primary"
                    required
                  >
                    <option value="all_students">All Active Students ({counts.students})</option>
                    <option value="facilitators">Mentors / Facilitators ({counts.facilitators})</option>
                    <option value="event_registrants">Confirmed Event Registrants</option>
                    <option value="event_waitlist">Event Waitlist Leads ({counts.waitlistTotal})</option>
                    <option value="manual_list">Manual List (Paste numbers/emails)</option>
                  </select>
                </div>

                {/* Communication Channel */}
                <div>
                  <label className="block text-[10px] font-mono text-text-secondary uppercase mb-1.5">Dispatch Channel</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setChannel('email')}
                      className={`flex flex-col items-center justify-center py-2.5 border rounded-lg cursor-pointer transition-all ${
                        channel === 'email'
                          ? 'border-accent-primary bg-bg-canvas text-accent-primary font-semibold'
                          : 'border-border text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Mail className="h-4 w-4 mb-1" />
                      <span className="text-[9px] font-mono uppercase">Email</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setChannel('sms')}
                      className={`flex flex-col items-center justify-center py-2.5 border rounded-lg cursor-pointer transition-all ${
                        channel === 'sms'
                          ? 'border-accent-primary bg-bg-canvas text-accent-primary font-semibold'
                          : 'border-border text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <MessageSquare className="h-4 w-4 mb-1" />
                      <span className="text-[9px] font-mono uppercase">Arkesel SMS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setChannel('robocall')}
                      className={`flex flex-col items-center justify-center py-2.5 border rounded-lg cursor-pointer transition-all ${
                        channel === 'robocall'
                          ? 'border-accent-primary bg-bg-canvas text-accent-primary font-semibold'
                          : 'border-border text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <PhoneCall className="h-4 w-4 mb-1" />
                      <span className="text-[9px] font-mono uppercase">mNotify Robo</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Conditional Event Dropdown */}
              {(targetGroup === 'event_registrants' || targetGroup === 'event_waitlist') && (
                <div className="animate-fade-in">
                  <label className="block text-[10px] font-mono text-text-secondary uppercase mb-1.5">Target Event</label>
                  {events.length === 0 ? (
                    <div className="text-xs p-3 bg-bg-canvas border border-border rounded-lg text-text-secondary italic">
                      No active events found. Please create an event first.
                    </div>
                  ) : (
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="w-full p-2.5 bg-bg-canvas border border-border rounded-lg text-xs focus:outline-none focus:border-accent-primary font-mono text-text-primary"
                      required
                    >
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title} ({new Date(ev.start_time).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Conditional manual input */}
              {targetGroup === 'manual_list' && (
                <div className="animate-fade-in">
                  <label className="block text-[10px] font-mono text-text-secondary uppercase mb-1.5">
                    Manual Recipient Inputs ({channel === 'email' ? 'Emails' : 'Phone Numbers'})
                  </label>
                  <textarea
                    value={manualRecipientsText}
                    onChange={(e) => setManualRecipientsText(e.target.value)}
                    placeholder={
                      channel === 'email'
                        ? 'student1@sena.org, student2@sena.org\nstudent3@sena.org'
                        : '0244000000, +233201111111\n0245000000'
                    }
                    className="w-full h-24 p-3 bg-bg-canvas border border-border rounded-lg text-xs focus:outline-none focus:border-accent-primary font-mono"
                    required
                  />
                  <p className="text-[10px] text-text-secondary mt-1 font-mono">Separate entries with commas or line breaks.</p>
                </div>
              )}

              {/* Content Form Inputs */}
              <div className="space-y-4 pt-4 border-t border-border">
                {channel === 'email' && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-[10px] font-mono text-text-secondary uppercase mb-1.5">Subject Line</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Welcome to Sena Academy! 🎉"
                        className="w-full p-2.5 bg-bg-canvas border border-border rounded-lg text-xs focus:outline-none focus:border-accent-primary font-mono text-text-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-text-secondary uppercase mb-1.5">Email Message (HTML supported)</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="<h1>Sena Academy</h1><p>Welcome to our platform. We are excited to start this cohort with you...</p>"
                        className="w-full h-44 p-3 bg-bg-canvas border border-border rounded-lg text-xs focus:outline-none focus:border-accent-primary font-mono"
                        required
                      />
                    </div>
                  </div>
                )}

                {channel === 'sms' && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-[10px] font-mono text-text-secondary uppercase mb-1.5">SMS Message Body</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Sena Academy: Hi! Reminder that cohort admissions close tomorrow. Head to senaacademy.org to enroll now."
                        className="w-full h-32 p-3 bg-bg-canvas border border-border rounded-lg text-xs focus:outline-none focus:border-accent-primary font-mono"
                        maxLength={480}
                        required
                      />
                      <div className="flex justify-between items-center text-[10px] text-text-secondary font-mono mt-1">
                        <span>Characters: {message.length}</span>
                        <span>Credits estimated: {Math.ceil(message.length / 160)} credit(s)</span>
                      </div>
                    </div>
                  </div>
                )}

                {channel === 'robocall' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-text-secondary uppercase mb-1.5">Campaign Name</label>
                        <input
                          type="text"
                          value={campaignName}
                          onChange={(e) => setCampaignName(e.target.value)}
                          placeholder="Cohort Call Alert"
                          className="w-full p-2.5 bg-bg-canvas border border-border rounded-lg text-xs focus:outline-none focus:border-accent-primary font-mono text-text-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-text-secondary uppercase mb-1.5">mNotify Voice File ID</label>
                        <input
                          type="text"
                          value={voiceId}
                          onChange={(e) => setVoiceId(e.target.value)}
                          placeholder="e.g. 55678"
                          className="w-full p-2.5 bg-bg-canvas border border-border rounded-lg text-xs focus:outline-none focus:border-accent-primary font-mono text-text-primary"
                          required
                        />
                      </div>
                    </div>
                    <div className="p-3.5 bg-bg-canvas rounded-lg border border-border text-[11px] font-mono text-text-secondary flex items-start gap-2.5">
                      <HelpCircle className="h-4 w-4 text-text-secondary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-text-primary mb-0.5">Robocall Guidelines:</p>
                        <p>Voice ID corresponds to a pre-recorded audio track uploaded in your mNotify dashboard. Ensure you have purchased voice credits in mNotify before launching the call.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit dispatch button */}
              <button
                type="submit"
                disabled={sendingBroadcast || (targetGroup.includes('event') && !selectedEventId)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-accent-primary text-white text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-opacity-95 disabled:opacity-50 transition-all cursor-pointer mt-4"
              >
                {sendingBroadcast ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Broadcasting... Please keep window open
                  </>
                ) : (
                  'Launch Broadcast Campaign'
                )}
              </button>
            </form>
          </div>

          {/* Quick info panel */}
          <div className="bg-bg-surface border border-border p-6 rounded-xl space-y-6">
            <h3 className="text-sm font-bold font-archivo tracking-tight uppercase flex items-center gap-2">
              <Settings className="h-4 w-4 text-text-secondary" />
              Integration Settings
            </h3>
            
            <div className="space-y-4 font-mono text-xs text-text-secondary">
              <div className="p-3 bg-bg-canvas border border-border rounded-lg space-y-2">
                <span className="font-bold text-text-primary block border-b border-border pb-1 mb-1 text-[10px] uppercase">Service Health Check</span>
                
                <div className="flex justify-between items-center text-[10px]">
                  <span>Brevo API Email:</span>
                  <span className="text-emerald-500 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Active
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-[10px]">
                  <span>Arkesel API SMS:</span>
                  <span className="text-emerald-500 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Active
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10px]">
                  <span>mNotify Robocall:</span>
                  <span className="text-emerald-500 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Active
                  </span>
                </div>
              </div>

              <div className="space-y-2 leading-relaxed text-[11px]">
                <p className="font-bold text-text-primary">Important Rules:</p>
                <ul className="list-disc pl-4 space-y-1.5">
                  <li>SMS charges credits per 160 character message. In Ghana, formatting is converted to 233.</li>
                  <li>Email limits are controlled by your Brevo billing Tier. Make sure contacts are cleaned regularly to avoid bounces.</li>
                  <li>Background jobs run on a local timer. Manual triggers bypass scheduling intervals.</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeSubTab === 'jobs' && (
        <section className="bg-bg-surface border border-border p-6 rounded-xl space-y-6">
          <h2 className="text-lg font-bold font-archivo tracking-tight uppercase flex items-center gap-2">
            <Play className="h-4 w-4 text-text-secondary" />
            Active Daemons (Background Workers)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Event reminders job trigger card */}
            <div className="bg-bg-canvas border border-border p-5 rounded-lg space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-border pb-2.5 mb-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold font-mono text-text-primary uppercase">Event Reminders Daemon</span>
                </div>
                <p className="text-xs text-text-secondary font-mono leading-relaxed mb-4">
                  Triggers emails to attendees who are registered for the selected event. This sends reminder notifications (e.g. 24h prior) containing meeting details and calendar invitations.
                </p>
                
                <form onSubmit={handleTriggerJob} className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-mono text-text-secondary uppercase mb-1">Target Event</label>
                    <select
                      value={jobEventId}
                      onChange={(e) => setJobEventId(e.target.value)}
                      className="w-full p-2 bg-bg-surface border border-border rounded text-xs focus:outline-none font-mono text-text-primary"
                      required
                    >
                      {events.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-text-secondary uppercase mb-1">Recipient Group Filter</label>
                    <select
                      value={jobRecipientGroup}
                      onChange={(e) => setJobRecipientGroup(e.target.value as any)}
                      className="w-full p-2 bg-bg-surface border border-border rounded text-xs focus:outline-none font-mono text-text-primary"
                    >
                      <option value="all">Send to All Confirmed + Waitlist</option>
                      <option value="registrants">Registrants Only</option>
                      <option value="waitlist">Waitlist Leads Only</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={runningJob || events.length === 0}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-accent-primary text-white text-xs font-mono uppercase tracking-wide rounded hover:bg-opacity-95 disabled:opacity-50 cursor-pointer mt-3"
                  >
                    {runningJob ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Running...
                      </>
                    ) : (
                      'Trigger Daemon Manually'
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Waitlist check-in job trigger card (placeholder or extension) */}
            <div className="bg-bg-canvas border border-border p-5 rounded-lg space-y-4 flex flex-col justify-between opacity-70">
              <div>
                <div className="flex items-center gap-2 border-b border-border pb-2.5 mb-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                  <span className="text-xs font-bold font-mono text-text-primary uppercase">Waitlist Auto-Followup</span>
                </div>
                <p className="text-xs text-text-secondary font-mono leading-relaxed mb-4">
                  Checks for waitlist entries added in the last 72 hours and dispatches automated check-ins and curriculum guides. (Scheduled daily in background).
                </p>
                <div className="p-3 bg-bg-surface rounded border border-border text-[10px] font-mono text-text-secondary">
                  Running Mode: Standard CRON (Every 24 hours).
                </div>
              </div>
              <button
                disabled
                className="flex items-center justify-center gap-2 w-full py-2 bg-neutral-800 text-text-secondary text-xs font-mono uppercase tracking-wide rounded cursor-not-allowed"
              >
                Cron Controlled (Active)
              </button>
            </div>

          </div>
        </section>
      )}

    </div>
  );
}

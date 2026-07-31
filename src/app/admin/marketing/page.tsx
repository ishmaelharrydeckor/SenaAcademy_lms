'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Send, 
  Calendar, 
  Copy, 
  Plus, 
  Check, 
  Loader2, 
  Video, 
  AlertCircle, 
  Terminal,
  MessageSquare,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface Objection {
  id: string;
  objection_text: string;
  category: string;
  frequency_count: number;
  resolved: boolean;
  created_at: string;
}

interface Research {
  id: string;
  url: string;
  title: string;
  transcript: string;
  analysis: {
    hook: string;
    pattern_interrupts: string;
    story_structure: string;
    psychological_triggers: string;
    cta: string;
    retention_mechanisms: string;
    sena_adaptation: string;
  };
  status: string;
}

interface Script {
  id: string;
  title: string;
  hook: string;
  script_body: string;
  framework_used: string;
  repurposed_email: string;
  repurposed_linkedin: string;
  objection_id: string;
  research_id: string | null;
}

interface ContentPlanItem {
  id: string;
  publish_date: string;
  status: string;
  script: Script | null;
}

export default function MarketingOSPage() {
  // Database states
  const [objections, setObjections] = useState<Objection[]>([]);
  const [researchList, setResearchList] = useState<Research[]>([]);
  const [contentPlan, setContentPlan] = useState<ContentPlanItem[]>([]);
  
  // Input form states
  const [chatLog, setChatLog] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoTranscript, setVideoTranscript] = useState('');
  
  // Selection states for script writer
  const [selectedObjectionId, setSelectedObjectionId] = useState('');
  const [selectedResearchId, setSelectedResearchId] = useState('');
  const [publishDate, setPublishDate] = useState('');

  // Loading states
  const [objectionsLoading, setObjectionsLoading] = useState(false);
  const [researchLoading, setResearchLoading] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Copy success indicator states
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live Console Logs
  const [logs, setLogs] = useState<string[]>(['[System] Sena Academy Marketing OS initialized. Ready.']);
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

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setInitialLoading(true);
    addLog('Fetching active dataset from Supabase...');
    try {
      // 1. Fetch Objections
      const { data: objData, error: objErr } = await supabase
        .from('marketing_objections')
        .select('*')
        .order('frequency_count', { ascending: false });
      if (objErr) throw objErr;
      setObjections(objData || []);

      // 2. Fetch Creative Research
      const { data: resData, error: resErr } = await supabase
        .from('marketing_tiktok_research')
        .select('*')
        .order('created_at', { ascending: false });
      if (resErr) throw resErr;
      setResearchList(resData || []);

      // 3. Fetch Content Plan & join scripts
      const { data: planData, error: planErr } = await supabase
        .from('marketing_content_plan')
        .select(`
          id,
          publish_date,
          status,
          script: marketing_scripts (
            id,
            title,
            hook,
            script_body,
            framework_used,
            repurposed_email,
            repurposed_linkedin,
            objection_id,
            research_id
          )
        `)
        .order('publish_date', { ascending: true });

      if (planErr) throw planErr;
      
      // Cast the join correctly
      const formattedPlan = (planData || []).map((item: any) => ({
        id: item.id,
        publish_date: item.publish_date,
        status: item.status,
        script: Array.isArray(item.script) ? item.script[0] : item.script
      }));

      setContentPlan(formattedPlan);
      addLog(`Dataset updated. Loaded ${objData?.length || 0} objections, ${resData?.length || 0} videos, and ${formattedPlan.length} scheduled posts.`);
    } catch (err: any) {
      addLog(`[Error] Database fetch failed: ${err.message}`);
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  // 1. Submit WhatsApp log to Community Agent
  const handleExtractObjections = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatLog.trim()) return;

    setObjectionsLoading(true);
    addLog('Triggering [Community Agent] to parse WhatsApp logs...');
    try {
      const response = await fetch('/api/marketing/objections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatLog })
      });

      const res = await response.json();
      if (!response.ok) throw new Error(res.error || 'Server error');

      addLog(`[Community Agent] Finished. Extracted ${res.new_objections?.length || 0} new objections, processed ${res.processed_actions} actions.`);
      setChatLog('');
      await fetchData();
    } catch (err: any) {
      addLog(`[Error] Objection extraction failed: ${err.message}`);
    } finally {
      setObjectionsLoading(false);
    }
  };

  // 2. Submit Viral Video to Creative Research Agent
  const handleAnalyzeVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim() || !videoTranscript.trim()) return;

    setResearchLoading(true);
    addLog('Triggering [Creative Research Agent] to analyze viral video...');
    try {
      const response = await fetch('/api/marketing/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: videoUrl,
          title: videoTitle,
          transcript: videoTranscript
        })
      });

      const res = await response.json();
      if (!response.ok) throw new Error(res.error || 'Server error');

      addLog(`[Creative Research Agent] Finished. Successfully deconstructed: "${res.data.title}"`);
      setVideoUrl('');
      setVideoTitle('');
      setVideoTranscript('');
      await fetchData();
    } catch (err: any) {
      addLog(`[Error] Video analysis failed: ${err.message}`);
    } finally {
      setResearchLoading(false);
    }
  };

  // 3. Generate Script and schedule it
  const handleWriteScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObjectionId || !publishDate) {
      addLog('[Warning] Missing parameters. Selecting an objection and publish date is required.');
      return;
    }

    setScriptLoading(true);
    addLog('Triggering [Script Writer Agent] & repurposing pipeline...');
    try {
      const response = await fetch('/api/marketing/write-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectionId: selectedObjectionId,
          researchId: selectedResearchId || null,
          publishDate
        })
      });

      const res = await response.json();
      if (!response.ok) throw new Error(res.error || 'Server error');

      addLog(`[Script Writer Agent] Complete. Wrote TikTok script "${res.script.title}"`);
      addLog('[Email Agent] Completed markdown newsletter translation.');
      addLog('[LinkedIn Agent] Translated script to professional build-in-public format.');
      addLog(`[Content Planner] Scheduled post for ${publishDate}.`);

      // Reset selection
      setSelectedObjectionId('');
      setSelectedResearchId('');
      setPublishDate('');
      await fetchData();
    } catch (err: any) {
      addLog(`[Error] Script generation failed: ${err.message}`);
    } finally {
      setScriptLoading(false);
    }
  };

  // Copy helper
  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addLog(`Copied content to clipboard.`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
        <span className="text-sm font-mono text-text-secondary">Reading Sena database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* 1. Terminal / Live Logs Header */}
      <section className="bg-neutral-950 text-emerald-400 p-5 rounded-xl border border-neutral-800 shadow-lg">
        <div className="flex items-center gap-2 mb-3 border-b border-neutral-800 pb-2">
          <Terminal className="h-4 w-4" />
          <span className="text-xs font-mono tracking-wider uppercase">Marketing OS Agent Log</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse ml-auto" />
        </div>
        <div className="font-mono text-xs space-y-1.5 h-36 overflow-y-auto select-text scrollbar-thin">
          {logs.map((log, i) => (
            <div key={i} className="leading-relaxed whitespace-pre-wrap">{log}</div>
          ))}
          <div ref={terminalEndRef} />
        </div>
      </section>

      {/* 2. Grid for Objections and Creative Research inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Objection Parser Card */}
        <div className="bg-bg-surface border border-border bg-opacity-40 p-6 rounded-xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-archivo tracking-tight uppercase">1. Capture Student Objections</h2>
            <MessageSquare className="h-5 w-5 text-text-secondary" />
          </div>
          
          <form onSubmit={handleExtractObjections} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-text-secondary uppercase mb-1.5">WhatsApp / Email Transcript Logs</label>
              <textarea
                value={chatLog}
                onChange={(e) => setChatLog(e.target.value)}
                placeholder="Paste WhatsApp messages showing coding fears, pricing friction, or questions about laptops..."
                className="w-full h-32 p-3 bg-bg-canvas border border-border rounded-lg text-sm focus:outline-none focus:border-accent-primary font-mono text-xs"
                required
              />
            </div>
            <button
              type="submit"
              disabled={objectionsLoading || !chatLog.trim()}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-ink text-bg-canvas text-xs font-mono uppercase tracking-wide rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-all cursor-pointer"
            >
              {objectionsLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Extract Objections'
              )}
            </button>
          </form>

          {/* List of current objections */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="text-xs font-mono text-text-secondary uppercase">Active Objection Index ({objections.length})</h3>
            {objections.length === 0 ? (
              <p className="text-xs text-text-secondary italic">No objections logged yet.</p>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {objections.map((obj) => (
                  <div key={obj.id} className="flex justify-between items-start gap-4 p-3 bg-bg-canvas rounded-lg border border-border text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono px-1.5 py-0.5 rounded bg-bg-surface text-[10px] text-text-secondary uppercase border border-border">
                          {obj.category}
                        </span>
                        <span className="font-mono text-text-secondary text-[10px]">
                          Freq: {obj.frequency_count}
                        </span>
                      </div>
                      <p className="text-text-primary font-medium">{obj.objection_text}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedObjectionId(obj.id);
                        addLog(`Objection selected for scripting: "${obj.objection_text.substring(0, 30)}..."`);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-mono uppercase border transition-colors cursor-pointer ${
                        selectedObjectionId === obj.id
                          ? 'bg-accent-primary text-white border-accent-primary'
                          : 'bg-bg-surface hover:bg-bg-surface-hover border-border text-text-primary'
                      }`}
                    >
                      {selectedObjectionId === obj.id ? 'Selected' : 'Select'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Creative Research Card */}
        <div className="bg-bg-surface border border-border bg-opacity-40 p-6 rounded-xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-archivo tracking-tight uppercase">2. Deconstruct Viral Videos</h2>
            <Video className="h-5 w-5 text-text-secondary" />
          </div>

          <form onSubmit={handleAnalyzeVideo} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-text-secondary uppercase mb-1.5">TikTok / Video URL</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://tiktok.com/..."
                  className="w-full p-2.5 bg-bg-canvas border border-border rounded-lg text-sm focus:outline-none focus:border-accent-primary font-mono text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-text-secondary uppercase mb-1.5">Video Title (Optional)</label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g., Coding Day 1 Loop"
                  className="w-full p-2.5 bg-bg-canvas border border-border rounded-lg text-sm focus:outline-none focus:border-accent-primary text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-mono text-text-secondary uppercase mb-1.5">Full Video Transcript</label>
              <textarea
                value={videoTranscript}
                onChange={(e) => setVideoTranscript(e.target.value)}
                placeholder="Paste the raw text transcript of the viral short-form video..."
                className="w-full h-24 p-3 bg-bg-canvas border border-border rounded-lg text-sm focus:outline-none focus:border-accent-primary font-mono text-xs"
                required
              />
            </div>
            <button
              type="submit"
              disabled={researchLoading || !videoUrl.trim() || !videoTranscript.trim()}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-ink text-bg-canvas text-xs font-mono uppercase tracking-wide rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-all cursor-pointer"
            >
              {researchLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing Pacing & Structure...
                </>
              ) : (
                'Deconstruct Video'
              )}
            </button>
          </form>

          {/* List of deconstructed video frameworks */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="text-xs font-mono text-text-secondary uppercase">Analyzed Frameworks ({researchList.length})</h3>
            {researchList.length === 0 ? (
              <p className="text-xs text-text-secondary italic">No videos deconstructed yet.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {researchList.map((res) => (
                  <div key={res.id} className="flex justify-between items-start gap-4 p-3 bg-bg-canvas rounded-lg border border-border text-xs">
                    <div className="space-y-1 min-w-0">
                      <p className="font-semibold text-text-primary truncate">{res.title}</p>
                      <p className="text-[10px] text-text-secondary truncate font-mono">{res.url}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedResearchId(res.id);
                        addLog(`Model style selected for scripting: "${res.title}"`);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-mono uppercase border transition-colors shrink-0 cursor-pointer ${
                        selectedResearchId === res.id
                          ? 'bg-accent-primary text-white border-accent-primary'
                          : 'bg-bg-surface hover:bg-bg-surface-hover border-border text-text-primary'
                      }`}
                    >
                      {selectedResearchId === res.id ? 'Selected' : 'Model Style'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 3. Scriptwriter & Content Planner Setup */}
      <section className="bg-bg-surface border border-border bg-opacity-40 p-6 rounded-xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-archivo tracking-tight uppercase">3. Scriptwriter & Content Scheduler</h2>
          <Sparkles className="h-5 w-5 text-text-secondary" />
        </div>

        <form onSubmit={handleWriteScript} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-mono text-text-secondary uppercase mb-1.5">Target Objection (Required)</label>
            <select
              value={selectedObjectionId}
              onChange={(e) => setSelectedObjectionId(e.target.value)}
              className="w-full p-2.5 bg-bg-canvas border border-border rounded-lg text-xs focus:outline-none focus:border-accent-primary font-mono text-text-primary"
              required
            >
              <option value="">-- Choose Objection to Resolve --</option>
              {objections.map((o) => (
                <option key={o.id} value={o.id}>
                  [{o.category}] {o.objection_text.substring(0, 50)}... (Freq: {o.frequency_count})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-text-secondary uppercase mb-1.5">Video Style Model (Optional)</label>
            <select
              value={selectedResearchId}
              onChange={(e) => setSelectedResearchId(e.target.value)}
              className="w-full p-2.5 bg-bg-canvas border border-border rounded-lg text-xs focus:outline-none focus:border-accent-primary font-mono text-text-primary"
            >
              <option value="">-- Modeled Viral Style --</option>
              {researchList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-text-secondary uppercase mb-1.5">Publish Date (Required)</label>
            <input
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className="w-full p-2.5 bg-bg-canvas border border-border rounded-lg text-xs focus:outline-none focus:border-accent-primary font-mono text-text-primary"
              required
            />
          </div>

          <div className="md:col-span-4 pt-2">
            <button
              type="submit"
              disabled={scriptLoading || !selectedObjectionId || !publishDate}
              className="flex items-center justify-center gap-2 w-full py-3 bg-accent-primary text-white text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-opacity-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {scriptLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating script, email, and post assets...
                </>
              ) : (
                'Generate Script & Calendar Schedule'
              )}
            </button>
          </div>
        </form>
      </section>

      {/* 4. Scheduled Content & Script Library */}
      <section className="bg-bg-surface border border-border bg-opacity-40 p-6 rounded-xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-archivo tracking-tight uppercase">4. Editorial Calendar & Repurposing Desk</h2>
          <button 
            onClick={fetchData}
            className="p-1 rounded hover:bg-bg-surface-hover text-text-secondary transition-colors"
            title="Reload Calendar"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {contentPlan.length === 0 ? (
          <p className="text-xs text-text-secondary italic text-center py-6">No marketing posts scheduled yet.</p>
        ) : (
          <div className="overflow-x-auto border border-border rounded-lg bg-bg-canvas">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-bg-surface border-b border-border text-[10px] font-mono text-text-secondary uppercase tracking-wider">
                  <th className="p-3.5 font-semibold">Publish Date</th>
                  <th className="p-3.5 font-semibold">Asset Title / Hook</th>
                  <th className="p-3.5 font-semibold">Framework</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 font-semibold text-right">Repurposed Content (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {contentPlan.map((item) => {
                  const script = item.script;
                  if (!script) return null;
                  
                  return (
                    <tr key={item.id} className="hover:bg-bg-surface-hover/30 transition-colors">
                      <td className="p-3.5 whitespace-nowrap text-text-primary font-medium">{item.publish_date}</td>
                      <td className="p-3.5">
                        <div className="space-y-0.5 max-w-sm">
                          <p className="font-semibold text-text-primary text-xs">{script.title}</p>
                          <p className="text-[10px] text-text-secondary italic">"{script.hook}"</p>
                        </div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-text-secondary">{script.framework_used}</td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide font-bold border ${
                          item.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleCopyToClipboard(script.script_body, `${script.id}-script`)}
                            className="flex items-center gap-1.5 px-2 py-1 rounded bg-bg-surface border border-border hover:bg-bg-surface-hover text-text-primary transition-all cursor-pointer text-[10px]"
                          >
                            {copiedId === `${script.id}-script` ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 text-text-secondary" />
                                TikTok Script
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleCopyToClipboard(script.repurposed_email, `${script.id}-email`)}
                            className="flex items-center gap-1.5 px-2 py-1 rounded bg-bg-surface border border-border hover:bg-bg-surface-hover text-text-primary transition-all cursor-pointer text-[10px]"
                          >
                            {copiedId === `${script.id}-email` ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 text-text-secondary" />
                                Email Copy
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleCopyToClipboard(script.repurposed_linkedin, `${script.id}-linkedin`)}
                            className="flex items-center gap-1.5 px-2 py-1 rounded bg-bg-surface border border-border hover:bg-bg-surface-hover text-text-primary transition-all cursor-pointer text-[10px]"
                          >
                            {copiedId === `${script.id}-linkedin` ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 text-text-secondary" />
                                LinkedIn Post
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}

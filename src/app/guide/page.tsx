'use client';

import React, { useState } from 'react';
import { Card, Button } from '@/components/UI';
import { Download, Check, Copy, Sparkles, MessageCircle, ExternalLink, ArrowRight, BookOpen } from 'lucide-react';

export default function GuidePage() {
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(id);
    setTimeout(() => setCopiedPrompt(null), 2500);
  };

  const prompt1 = `[Context]: You are an experienced digital business consultant in Ghana helping a local car rental company in Accra.

[Goal]: Write a 3-part WhatsApp message sequence to follow up with clients who inquired about renting a car for a weekend event but haven't paid their deposit yet.

[Constraints]: Keep each message under 50 words. The tone must be polite, warm, and professional. Mention Mobile Money payment options. Avoid corporate American jargon.`;

  const prompt2 = `I want to create a [INSERT YOUR PROJECT: e.g. digital registration portal for an event / client booking system for a hair salon in Kumasi].

Before you give me any answers or write anything, I want you to act as an expert project consultant and ask me 5 clarifying questions one by one to understand my target audience, budget, timeline, and goals.

Wait for my answer after each question before asking the next.`;

  const prompt3 = `I have a business idea: I want to build a simple web application for [INSERT BUSINESS TYPE — e.g. a car rental in Accra / a bakery in Kumasi / a church event / a hair salon].

The main problem it solves is: [INSERT PROBLEM — e.g. customers currently have to call or DM manually on WhatsApp to book and pay].

Act as an expert software architect in Google AI Studio and break this down into 3 clear sections:

1. The Customer Journey: Exactly what the customer sees, clicks, and experiences from the homepage to confirmation.
2. The Required Form Fields: The exact information we need to collect (e.g. [INSERT REQUIRED DETAILS — e.g. Full Name, WhatsApp Number, Service Type, Date/Time, Mobile Money Option]).
3. The Visual Layout & Live Mockup: Generate the clean, modern visual layout code so I can see what this application looks like right inside my browser.

Keep the design clean, lightweight, and 100% mobile-friendly for Ghanaian users.`;

  return (
    <div className="min-h-screen bg-bg-canvas text-text-primary py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-150">
      <div className="max-w-3xl mx-auto space-y-8 animate-slide-up">
        
        {/* Top Header Card */}
        <div className="border-b border-border-brand pb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
              Free Master Guide
            </span>
            <a
              href="/api/guide"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold text-xs transition-all shadow-md active:scale-95"
            >
              <Download className="w-4 h-4" />
              Download PDF Version
            </a>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-archivo text-text-primary mb-3">
            The Non-Coder’s Guide to AI: How to Prompt Like a Pro
          </h1>
          <p className="text-base text-text-secondary leading-relaxed mb-4 italic">
            A Practical Blueprint to Turn Plain English into High-Quality Work & Web Software
          </p>
          <div className="text-xs text-text-muted">
            By <strong className="text-text-primary">Ishmael Harry-Deckor</strong> • Founder, Sena Academy • <em>“Stop learning to code. Start learning to build.”</em>
          </div>
        </div>

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold font-archivo text-text-primary flex items-center gap-2">
            🛑 1. Why 90% of People Get Bad Results from AI
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Most people open AI tools like ChatGPT, Claude, or Google AI Studio and type something generic:
          </p>
          <div className="bg-bg-surface/50 p-4 rounded-lg border border-border-brand space-y-2 text-sm text-text-muted">
            <p>❌ <em>"Write me a business plan for my project."</em></p>
            <p>❌ <em>"Build me a website for my business."</em></p>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            And what does the AI give them? A long, boring, generic response filled with corporate buzzwords that is completely useless in the real world.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            The secret to mastering AI in 2026 isn’t learning to write complex computer code—it’s <strong>learning how to think and prompt with clarity</strong>.
          </p>
        </section>

        {/* Section 2: CGC */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold font-archivo text-text-primary flex items-center gap-2">
            🏛️ 2. Framework 1: The C.G.C. Formula
          </h2>
          <div className="bg-bg-surface p-5 rounded-xl border-l-4 border-accent-primary border border-border-brand space-y-2 text-sm">
            <p><strong className="text-accent-primary">[ CONTEXT ]</strong> ➔ Who is the AI, and what is the exact situation?</p>
            <p><strong className="text-accent-primary">[ GOAL ]</strong> ➔ What is the exact, specific output you want?</p>
            <p><strong className="text-accent-primary">[ CONSTRAINTS ]</strong> ➔ What rules MUST the AI follow (tone, length, what to avoid)?</p>
          </div>

          <div className="relative bg-[#0F172A] text-white p-5 rounded-xl border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                📋 Real-World Example Prompt
              </span>
              <button
                onClick={() => copyToClipboard(prompt1, 'prompt1')}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all active:scale-95"
              >
                {copiedPrompt === 'prompt1' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
              {prompt1}
            </pre>
          </div>
        </section>

        {/* Section 3: Reverse Interview */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold font-archivo text-text-primary flex items-center gap-2">
            🔄 3. Framework 2: The "Reverse Interview" Method
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            When you have a project in mind but don’t know all the technical details, <strong>never try to write a long prompt from scratch</strong>. Instead, make the AI interview you.
          </p>

          <div className="relative bg-[#0F172A] text-white p-5 rounded-xl border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                📋 Copy-Paste Prompt
              </span>
              <button
                onClick={() => copyToClipboard(prompt2, 'prompt2')}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all active:scale-95"
              >
                {copiedPrompt === 'prompt2' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
              {prompt2}
            </pre>
          </div>
          <p className="text-xs text-text-muted italic">
            Why this works: It forces the AI to extract your exact business needs step-by-step, resulting in a 100% custom solution instead of a generic guess.
          </p>
        </section>

        {/* Section 4: Idea to App */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold font-archivo text-text-primary flex items-center gap-2">
            📱 4. Framework 3: The "Idea-to-App Blueprint" (Using Google AI Studio)
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            You don't need any coding software to turn a business idea into a visual prototype. You can do it completely free inside <strong>Google AI Studio</strong> (<code>aistudio.google.com</code>).
          </p>
          
          <ul className="text-sm text-text-secondary space-y-1.5 list-disc pl-5">
            <li><strong>100% Free:</strong> Sign in directly with your regular Google/Gmail account at <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-accent-primary underline">aistudio.google.com</a>.</li>
            <li><strong>Zero Software to Install:</strong> Runs directly inside your mobile or laptop browser.</li>
            <li><strong>Instant Visual Mockups:</strong> It lets you see what your app will look like right on screen.</li>
          </ul>

          <div className="relative bg-[#0F172A] text-white p-5 rounded-xl border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                📋 Universal Idea-to-App Prompt (with Placeholders)
              </span>
              <button
                onClick={() => copyToClipboard(prompt3, 'prompt3')}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all active:scale-95"
              >
                {copiedPrompt === 'prompt3' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
              {prompt3}
            </pre>
          </div>
        </section>

        {/* Section 5: Golden Rules */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold font-archivo text-text-primary flex items-center gap-2">
            🛠️ 5. Framework 4: The 4 Golden Rules of Prompting
          </h2>
          <ol className="text-sm text-text-secondary space-y-2 list-decimal pl-5 leading-relaxed">
            <li><strong>Rule 1: Give AI a Role:</strong> Always start by assigning an identity (<em>"Act as a senior event coordinator..."</em> or <em>"Act as a copywriter..."</em>).</li>
            <li><strong>Rule 2: Provide Examples:</strong> Paste an example of what you like before asking for the result.</li>
            <li><strong>Rule 3: Use Step-by-Step Thinking:</strong> Add this phrase at the end of hard tasks: <em>"Think step-by-step before giving your final answer."</em></li>
            <li><strong>Rule 4: Never Restart—Iterate:</strong> If the AI’s answer is 70% good, reply: <em>"Make the tone more casual, cut paragraph two in half, and make the button green."</em></li>
          </ol>
        </section>

        {/* Section 6 & CTA Banner */}
        <section className="space-y-4 pt-4 border-t border-border-brand">
          <h2 className="text-xl font-bold font-archivo text-text-primary">
            🚀 6. The Next Step: Building Real Software with AI
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Prompting AI to plan ideas is step 1. The real breakthrough happens when you use these exact same plain English prompts to <strong>build and deploy real, working web applications</strong> that Ghanaian businesses will pay you <strong>GHS 1,500 – GHS 5,000</strong> for.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            In our <strong>free live online workshop in September</strong>, we will open our laptops and show you how to use these prompt frameworks to build a complete, live web app from scratch!
          </p>

          <div className="bg-gradient-to-r from-accent-primary/10 via-purple-500/10 to-emerald-500/10 border border-accent-primary/30 rounded-2xl p-6 text-center space-y-3">
            <h3 className="text-lg font-bold font-archivo text-text-primary">
              👉 Join Our WhatsApp Community for Free Workshop Access
            </h3>
            <p className="text-xs text-text-secondary max-w-md mx-auto">
              Get the exact September date, live online access link, and free templates directly on WhatsApp:
            </p>
            <a
              href="https://chat.whatsapp.com/LtAPH7IPPTg160oJj0REpS?s=cl&p=a&ilr=1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm transition-all shadow-lg hover:shadow-green-500/20 active:scale-95"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              Join Free WhatsApp Community
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { Card, CircularProgress, AccentCard, Button } from '@/components/UI';
import { 
  BookOpen, 
  Award, 
  FileSpreadsheet, 
  Calendar, 
  ChevronRight, 
  Lock, 
  CheckCircle2, 
  Circle, 
  Play, 
  Trophy, 
  ArrowRight,
  Sparkles,
  MessageSquare,
  HelpCircle,
  FileText
} from 'lucide-react';
import Link from 'next/link';

interface Cohort {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface Module {
  id: string;
  module_number: number;
  title: string;
  description: string;
  unlock_date: string;
  is_visible: boolean;
  assignment_deadline: string;
}

interface Submission {
  id: string;
  module_id: string;
  status: string;
  score: number | null;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const { theme } = useTheme();

  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Time-based greeting helper
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    if (!user || !profile) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch cohort details if assigned
        if (profile.cohort_id) {
          const { data: cohortData } = await supabase
            .from('cohorts')
            .select('*')
            .eq('id', profile.cohort_id)
            .single();
          if (cohortData) setCohort(cohortData as Cohort);
        }

        // 2. Fetch all modules ordered by module number
        const { data: modulesData } = await supabase
          .from('modules')
          .select('*')
          .order('module_number', { ascending: true });
        if (modulesData) setModules(modulesData as Module[]);

        // 3. Fetch student's submissions
        const { data: submissionsData } = await supabase
          .from('submissions')
          .select('id, module_id, status, score')
          .eq('student_id', user.id);
        if (submissionsData) setSubmissions(submissionsData as unknown as Submission[]);

        // 4. Fetch announcements
        const { data: announceData } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);
        if (announceData) setAnnouncements(announceData as Announcement[]);

      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, profile]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4 animate-fade-in">
        <div className="relative w-10 h-10 flex items-center justify-center bg-white rounded-lg p-1.5 shadow-[0_4px_12px_rgba(5,82,254,0.15)] animate-pulse">
          <img src="/logo_icon.png" alt="Loading" className="h-full w-full object-contain" />
        </div>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Loading Dashboard details...</p>
      </div>
    );
  }

  // Calculate Metrics
  const totalModules = modules.length;
  const submissionsCount = submissions.length;
  const progressPercentage = totalModules > 0 ? Math.round((submissionsCount / totalModules) * 100) : 32; // Default to 32% if empty

  // Identify current module (first unlocked module with no submission)
  const currentModule = modules.find((mod) => {
    const isUnlocked = new Date(mod.unlock_date) <= new Date() && mod.is_visible;
    const hasSubmitted = submissions.some((sub) => sub.module_id === mod.id);
    return isUnlocked && !hasSubmitted;
  }) || modules.find((mod) => new Date(mod.unlock_date) <= new Date() && mod.is_visible); // fallback to latest unlocked

  // Static list of 7 modules as per the design brief
  const staticModules = [
    { number: 1, title: 'Builder Mindset' },
    { number: 2, title: 'UI/UX Design' },
    { number: 3, title: 'Website Development' },
    { number: 4, title: 'Android Development' },
    { number: 5, title: 'Backend Development' },
    { number: 6, title: 'Product Development' },
    { number: 7, title: 'Career Accelerator' }
  ];

  // Map database modules/submissions to the 7-step learning journey
  const mappedModules = staticModules.map((item) => {
    const dbMod = modules.find(m => m.module_number === item.number);
    const sub = dbMod ? submissions.find(s => s.module_id === dbMod.id) : null;

    let status: 'completed' | 'active' | 'locked' = 'locked';
    if (dbMod) {
      const isUnlocked = new Date(dbMod.unlock_date) <= new Date() && dbMod.is_visible;
      if (sub) {
        status = 'completed';
      } else if (isUnlocked && (!currentModule || currentModule.id === dbMod.id)) {
        status = 'active';
      }
    } else if (item.number === 1 && modules.length === 0) {
      status = 'active'; // First module active if database has no modules yet
    }

    return {
      ...item,
      id: dbMod?.id || null,
      status
    };
  });

  // Calculate days remaining helper
  const getDaysRemaining = () => {
    if (!currentModule || !currentModule.assignment_deadline) return 'Flexible';
    const diff = new Date(currentModule.assignment_deadline).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    return `${days} Days Remaining`;
  };

  // Design Token Class Mappings
  const cardClass = 'bg-bg-surface border-border-brand text-text-primary';
  const titleClass = 'text-text-primary';
  const descClass = 'text-text-secondary';

  // Badges lists configuration (static UI unlocked based on submission counts)
  const achievementBadges = [
    { title: 'First Submission', icon: '🏅', unlocked: submissionsCount >= 1, desc: 'Logged first task' },
    { title: 'Builder', icon: '🛠', unlocked: submissionsCount >= 2, desc: 'Logged 2+ projects' },
    { title: 'Team Player', icon: '🤝', unlocked: submissionsCount >= 3, desc: 'Engaged in reviews' },
    { title: 'Consistency', icon: '🔥', unlocked: submissionsCount >= 4, desc: 'Consistent submissions' },
    { title: 'Perfect Score', icon: '✨', unlocked: submissionsCount >= 5, desc: 'Top marks on project' }
  ];

  // Render First-Time Experience Onboarding
  if (submissionsCount === 0) {
    return (
      <div className="space-y-8 animate-fade-in">
        
        {/* Onboarding Welcome Header Card */}
        <div className={`p-8 md:p-12 rounded-3xl relative overflow-hidden shadow-xl border border-border-brand bg-bg-surface`}>
          {theme === 'dark' && (
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          )}
          
          <div className="max-w-2xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-[10px] font-bold tracking-widest uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Founding Cohort Onboarding</span>
            </div>

            <h2 className={`text-3xl md:text-5xl font-extrabold tracking-tight leading-tight ${titleClass}`}>
              Welcome to Sena Academy, <span className="bg-gradient-to-r from-accent-primary to-indigo-500 bg-clip-text text-transparent">Founding Builder</span>.
            </h2>

            <p className={`text-sm md:text-base leading-relaxed ${descClass}`}>
              You're about to begin a journey that will take you from learning AI tools to building real, production-ready software products. Set up your workflow, complete every module, build every challenge, and earn your certificate. Let's build something extraordinary.
            </p>

            <div className="pt-4">
              <Link href="/student/modules">
                <Button className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-3.5 px-8 shadow-lg flex items-center gap-2">
                  <Play className="h-4 w-4 fill-white" />
                  Start Module 1
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Simplified stats/deadlines panels for first-time onboarding display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className={`md:col-span-2 p-6 flex flex-col justify-between ${cardClass}`}>
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-text-secondary">Next Step</span>
              <h3 className="text-base font-bold">Review Module Resources</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Read the prompt engineering guide and Cursor documentation in Module 1 to prepare for your first command-line utility challenge.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs border-t border-border-brand/40 mt-6">
              <span className="text-text-secondary">Estimated duration: 30 mins</span>
              <Link href="/student/modules" className="text-accent-primary hover:underline font-bold flex items-center gap-0.5">
                <span>Open curriculum</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>

          <Card className={`p-6 space-y-4 ${cardClass}`}>
            <h4 className="text-xs font-mono uppercase tracking-widest text-text-secondary">Platform Support</h4>
            <div className="space-y-3">
              <a href="mailto:support@senaacademy.org" className="flex items-center gap-3 text-xs hover:text-accent-primary transition-colors text-text-primary">
                <HelpCircle className="h-4 w-4 text-text-secondary" />
                <span>Get Help Desk support</span>
              </a>
              <Link href="/student/modules" className="flex items-center gap-3 text-xs hover:text-accent-primary transition-colors text-text-primary">
                <FileText className="h-4 w-4 text-text-secondary" />
                <span>Read student guidelines</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Render Standard Portal Dashboard
  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. HERO GREETING PANEL */}
      <div className={`p-8 md:p-12 rounded-3xl relative overflow-hidden border border-border-brand bg-bg-surface`}>
        {theme === 'dark' && (
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        )}
        
        <div className="max-w-2xl space-y-4 relative z-10">
          <h2 className={`text-3xl md:text-5xl font-extrabold tracking-tight ${titleClass}`}>
            {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Builder'} 👋
          </h2>
          <p className="text-base font-bold text-text-secondary">Continue building the future.</p>
          <p className={`text-xs md:text-sm leading-relaxed max-w-lg ${descClass}`}>
            Every project you complete brings you one step closer to becoming a professional AI Software Developer.
          </p>

          <div className="flex gap-4 pt-4">
            <Link href="/student/modules">
              <Button className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold text-xs py-3 px-6 shadow-md">
                ▶ Continue Learning
              </Button>
            </Link>
            <Link href="/student/history">
              <Button variant="secondary" className="font-bold text-xs py-3 px-6">
                View Progress
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. PROGRESS CARD (OVERALL PROGRESS & TARGETS) */}
      <Card className={`p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center ${cardClass}`}>
        
        {/* Progress Circle with logo accent square motif */}
        <div className="flex flex-col items-center text-center justify-center relative">
          <div className="relative">
            {/* The accent primary square motif from the logo sits next to progress circle */}
            <div className="w-2.5 h-2.5 bg-accent-primary absolute top-1 right-1 rounded-[1px] shadow-sm z-10"></div>
            <CircularProgress percentage={progressPercentage} size={110} strokeWidth={8} />
          </div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-text-secondary mt-4">Overall Progress</span>
        </div>

        {/* Current Module */}
        <div className="space-y-3 py-2 border-y md:border-y-0 md:border-x border-border-brand/40 md:px-8">
          <span className="text-[10px] font-mono tracking-widest uppercase text-text-secondary">Current Module</span>
          <h3 className={`text-lg font-extrabold ${titleClass}`}>
            {currentModule ? `Module ${currentModule.module_number}` : 'Completed'}
          </h3>
          <p className="text-sm font-semibold text-accent-primary truncate">
            {currentModule ? currentModule.title : 'All Curriculum Finished'}
          </p>
        </div>

        {/* Target Deadline */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono tracking-widest uppercase text-text-secondary">Deadline</span>
          <h3 className={`text-base font-extrabold ${titleClass}`}>
            {currentModule ? 'Next Project' : 'No Deadlines'}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold font-mono">
            <Calendar className="h-4 w-4" />
            <span>{getDaysRemaining()}</span>
          </div>
        </div>

      </Card>

      {/* 3. MIDDLE LAYOUT GRID: JOURNEY & DEADLINES/ANNOUNCEMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Learning Path Journey (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest uppercase text-text-secondary">Roadmap</span>
            <h3 className={`text-xl font-bold ${titleClass}`}>Continue Your Journey</h3>
          </div>

          <div className="space-y-4">
            {mappedModules.map((item) => (
              <div 
                key={item.number} 
                className={`p-5 rounded-2xl border flex items-center justify-between transition-all duration-200 group hover:-translate-y-0.5 ${
                  item.status === 'completed'
                    ? 'bg-bg-surface/40 border-green-500/20 text-text-secondary opacity-80'
                    : item.status === 'active'
                      ? 'bg-bg-surface border-accent-primary text-text-primary shadow-md'
                      : 'bg-bg-surface/10 border-border-brand/40 text-text-secondary opacity-40'
                }`}
              >
                <div className="flex items-center gap-4">
                  
                  {/* Status Indicator Badge */}
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                    item.status === 'completed'
                      ? 'bg-green-500/10 text-green-500'
                      : item.status === 'active'
                        ? 'bg-accent-primary/15 text-accent-primary'
                        : 'bg-bg-surface-hover text-text-secondary'
                  }`}>
                    {item.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : item.status === 'active' ? (
                      <Circle className="h-5 w-5 fill-accent-primary/20" />
                    ) : (
                      <Lock className="h-4.5 w-4.5" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono tracking-wider text-text-secondary uppercase">Module {item.number}</span>
                    <h4 className={`text-sm font-bold ${item.status === 'active' ? 'text-accent-primary' : ''}`}>{item.title}</h4>
                  </div>
                </div>

                <div>
                  {item.status === 'completed' && (
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest font-mono">Completed ✓</span>
                  )}
                  {item.status === 'active' && (
                    <Link href={`/student/modules?id=${item.id}`}>
                      <button className="text-xs font-bold text-accent-primary flex items-center gap-0.5 hover:underline uppercase tracking-wider font-mono cursor-pointer">
                        <span>Continue</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </Link>
                  )}
                  {item.status === 'locked' && (
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest font-mono">Locked</span>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Deadlines, Goals & Announcements (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Today's Goal Card */}
          <Card className={`p-6 space-y-4 ${cardClass}`}>
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Today's Goal</h4>
            <div className="space-y-2">
              <h3 className={`text-base font-bold ${titleClass}`}>Complete Lesson 4</h3>
              <p className="text-xs text-text-secondary font-medium">Estimated Time: 18 Minutes</p>
            </div>
            <Link href="/student/modules" className="block">
              <Button size="sm" className="w-full">Continue</Button>
            </Link>
          </Card>

          {/* Upcoming Deadlines Card */}
          <Card className={`p-6 space-y-4 ${cardClass}`}>
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Upcoming Deadlines</h4>
            <div className="space-y-4">
              {[
                { title: 'UI Assignment', date: 'Aug 14' },
                { title: 'Website Project', date: 'Aug 21' },
                { title: 'Android Milestone', date: 'Aug 28' },
                { title: 'Backend API', date: 'Sep 03' }
              ].map((dl, i) => (
                <div key={i} className="flex justify-between items-center border-b border-border-brand/40 pb-2 last:border-0 last:pb-0">
                  <span className="text-xs font-semibold text-text-secondary">{dl.title}</span>
                  <span className="text-[10px] font-mono font-bold text-text-secondary">{dl.date}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Announcements */}
          <Card className={`p-6 space-y-4 ${cardClass}`}>
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Announcements</h4>
            <div className="space-y-4 relative pl-4 border-l border-border-brand/40">
              {announcements.length === 0 ? (
                // Fallbacks per layout specifications
                [
                  { title: 'Welcome Founding Builders', desc: 'Welcome aboard Sena Academy Lms.' },
                  { title: 'New Assignment Released', desc: 'Module 2 task brief is live.' },
                  { title: 'Live Session Friday', desc: 'Interactive review at 5 PM.' },
                  { title: 'Facilitator Office Hours', desc: 'Drop-in debug sessions.' }
                ].map((item, i) => (
                  <div key={i} className="relative space-y-1">
                    <span className="absolute -left-[21px] top-1.5 w-2 h-2 bg-accent-primary border border-bg-surface rounded-full"></span>
                    <h5 className="text-xs font-bold text-text-primary">{item.title}</h5>
                  </div>
                ))
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className="relative space-y-1">
                    <span className="absolute -left-[21px] top-1.5 w-2 h-2 bg-accent-primary border border-bg-surface rounded-full"></span>
                    <h5 className="text-xs font-bold text-text-primary">{ann.title}</h5>
                    <p className="text-[10px] text-text-secondary truncate leading-relaxed">{ann.content}</p>
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>

      </div>

      {/* 4. ACHIEVEMENT BADGES SECTION */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest uppercase text-text-secondary">Achievements</span>
          <h3 className={`text-xl font-bold ${titleClass}`}>Your Badges</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {achievementBadges.map((badge, idx) => (
            <Card 
              key={idx} 
              className={`p-6 text-center flex flex-col items-center justify-center gap-3 transition-transform hover:-translate-y-1 duration-300 ${cardClass} ${
                !badge.unlocked ? 'opacity-40 grayscale' : 'shadow-md border-accent-primary/20'
              }`}
            >
              <span className="text-3xl block">{badge.icon}</span>
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-text-primary">{badge.title}</h5>
                <span className="text-[9px] text-text-secondary block font-mono">{badge.desc}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="pt-12 border-t border-border-brand/40 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-text-secondary">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="h-4.5 w-4.5 text-text-secondary" />
          <span>Need Help? Contact our team at <a href="mailto:support@senaacademy.org" className="text-accent-primary hover:underline">support@senaacademy.org</a></span>
        </div>
        <div className="flex gap-6 font-semibold">
          <a href="/privacy" className="hover:text-accent-primary transition-colors">Privacy</a>
          <a href="/terms" className="hover:text-accent-primary transition-colors">Terms</a>
          <a href="mailto:support@senaacademy.org" className="hover:text-accent-primary transition-colors">Support Chat</a>
        </div>
      </footer>

    </div>
  );
}

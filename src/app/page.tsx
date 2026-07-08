'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { Button, Input, Card } from '@/components/UI';
import { 
  Mail, 
  Lock, 
  Sparkles, 
  KeyRound, 
  User, 
  ChevronRight, 
  X, 
  Check, 
  BookOpen, 
  Award, 
  FileSpreadsheet, 
  Users, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface PublicStats {
  studentsCount: number;
  facilitatorsCount: number;
  projectsCount: number;
  whatsappMemberCount: number;
}

export default function LandingPage() {
  const { signIn, redeemCode, user, profile, loading } = useAuth();
  const { showToast } = useNotifications();
  const router = useRouter();

  // Navigation redirect if already logged in
  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin') router.push('/admin');
      else if (profile.role === 'facilitator') router.push('/facilitator');
      else router.push('/student');
    }
  }, [user, profile, router]);

  // Public Stats State
  const [stats, setStats] = useState<PublicStats>({
    studentsCount: 0,
    facilitatorsCount: 0,
    projectsCount: 0,
    whatsappMemberCount: 238
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/public-stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load public stats:', err);
      }
    };
    fetchStats();
  }, []);

  // Auth Modal States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'redeem_code' | 'redeem_register' | 'forgot_password'>('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Access Code Fields
  const [accessCode, setAccessCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [validatedCodeData, setValidatedCodeData] = useState<{ email?: string; cohort_id?: string } | null>(null);

  // Password Reset Modal states
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [submittingReset, setSubmittingReset] = useState(false);

  // Loading indicator for actions
  const [submitting, setSubmitting] = useState(false);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      showToast('Field Error', 'Please enter your email address.', 'warning');
      return;
    }
    setSubmittingReset(true);
    try {
      const { error } = await supabase
        .from('password_reset_requests')
        .insert({
          email: resetEmail.trim(),
          message: resetMessage.trim() || null,
        });

      if (error) {
        showToast('Submission Failed', error.message || 'Could not submit request.', 'error');
      } else {
        showToast(
          'Request Submitted',
          'Your password reset request has been logged. An admin will review it and dispatch a reset link.',
          'success'
        );
        setAuthTab('login');
        setResetEmail('');
        setResetMessage('');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'An unexpected error occurred.', 'error');
    } finally {
      setSubmittingReset(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Login Failed', 'Please enter both email and password.', 'warning');
      return;
    }
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);

    if (error) {
      showToast('Authentication Error', error.message || 'Invalid credentials.', 'error');
    } else {
      showToast('Welcome back', 'Successfully logged in to Sena Academy.', 'success');
      setShowAuthModal(false);
    }
  };

  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode) {
      showToast('Validation Error', 'Please enter an access code.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: accessCode.trim().toUpperCase() }),
      });

      const response = await res.json();

      if (!res.ok) {
        showToast('Verification Failed', response.error || 'Code verification failed.', 'error');
      } else {
        if (response.valid) {
          setValidatedCodeData({ email: response.email, cohort_id: response.cohort_id });
          showToast('Code Validated', 'Access code belongs to email: ' + response.email, 'success');
          setAuthTab('redeem_register');
        } else {
          showToast('Invalid Code', response.reason || 'Code verification failed.', 'error');
        }
      }
    } catch (err: any) {
      showToast('Error', 'An unexpected error occurred.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRedeemRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentPassword) {
      showToast('Field Error', 'Please fill in all details.', 'warning');
      return;
    }

    setSubmitting(true);
    const { success, error } = await redeemCode(accessCode, studentName, studentPassword);
    setSubmitting(false);

    if (success) {
      showToast('Account Created', 'Successfully redeemed your access code.', 'success');
      setShowAuthModal(false);
    } else {
      showToast('Redemption Failed', error || 'Could not redeem access code.', 'error');
    }
  };

  const openModalAt = (tab: typeof authTab) => {
    setAuthTab(tab);
    setShowAuthModal(true);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <img src="/logo_icon.jpg" alt="Sena Symbol" className="h-10 w-10 object-contain animate-pulse" />
          <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  // Builder Journey Steps
  const journeySteps = [
    { label: 'Discover', desc: 'Find your spark and explore modern developer tools.' },
    { label: 'Learn', desc: 'Attend interactive live sessions and review code recordings.' },
    { label: 'Build', desc: 'Complete practical challenges matching real-world developer workflows.' },
    { label: 'Submit', desc: 'Push your project to GitHub and deploy live to Vercel.' },
    { label: 'Receive Feedback', desc: 'Get descriptive async code reviews from facilitators.' },
    { label: 'Graduate', desc: 'Earn your course credentials and unlock builder status.' },
    { label: 'Become a Founding Builder', desc: 'Join the premium network of alumni builders.' }
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans relative overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-indigo-50/40 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* TOP NAVIGATION HEADER */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-zinc-100 py-4 px-6 md:px-12 flex justify-between items-center z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/logo_full.jpg" alt="Sena Academy Logo" className="h-8 md:h-9 object-contain" />
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => openModalAt('login')}
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition-colors"
          >
            Sign In
          </button>
          <a href="/enroll">
            <Button size="sm" className="bg-primary-blue hover:bg-blue-700 text-white font-semibold text-xs py-2 px-4 shadow-[0_4px_12px_rgba(37,99,235,0.2)]">
              Enroll Now
            </Button>
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative py-20 px-6 md:px-12 max-w-6xl mx-auto flex flex-col items-center text-center z-10 space-y-8">
        
        {/* Subtle geometric grid decorator */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40 z-0"></div>

        <div className="relative z-10 space-y-4 max-w-3xl">
          {/* Announcement Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-primary-blue text-[10px] font-bold tracking-widest uppercase mx-auto animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Welcome to the Builder Workspace</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-zinc-900 tracking-tight leading-tight">
            Forge the skills of tomorrow, <span className="bg-gradient-to-r from-primary-blue to-indigo-650 bg-clip-text text-transparent">one project</span> at a time.
          </h1>
          
          <p className="text-base md:text-lg text-zinc-500 leading-relaxed max-w-2xl mx-auto pt-2">
            This is where ideas become projects, projects become products, and beginners become builders. Every lesson, challenge, and milestone brings you closer to becoming a confident software developer.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
          <Button 
            onClick={() => openModalAt('login')}
            className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-sm py-3 px-8 shadow-lg transition-transform hover:-translate-y-0.5"
          >
            Continue to Sign In
          </Button>
          <a href="/enroll" className="w-full sm:w-auto">
            <Button 
              variant="secondary"
              className="w-full sm:w-auto bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 font-bold text-sm py-3 px-8 text-zinc-700 shadow-md transition-transform hover:-translate-y-0.5"
            >
              Enroll Now
            </Button>
          </a>
        </div>
      </header>

      {/* BUILDER JOURNEY PREVIEW */}
      <section className="bg-zinc-50/50 py-20 border-y border-zinc-100 z-10 relative">
        <div className="max-w-6xl mx-auto px-6 md:px-12 space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400">Roadmap</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900">Your Journey Starts Here</h2>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">Follow our systematic builder pipeline to progress from raw code setup to credentials graduation.</p>
          </div>

          {/* Interactive Horizontal/Vertical Timeline */}
          <div className="relative pt-6">
            {/* Desktop Connective line */}
            <div className="hidden md:block absolute top-[27px] left-8 right-8 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-zinc-200 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-7 gap-8 md:gap-4 relative z-10">
              {journeySteps.map((step, index) => (
                <div key={index} className="flex md:flex-col items-start md:items-center text-left md:text-center group select-none">
                  
                  {/* Glowing Node */}
                  <div className="h-[54px] w-[54px] md:h-12 md:w-12 rounded-full border border-zinc-100 bg-white shadow-md flex items-center justify-center ring-4 ring-blue-50/50 z-10 transition-transform group-hover:scale-110 duration-200 shrink-0 p-2">
                    <img src="/logo_icon.jpg" alt="Sena Milestone" className="h-full w-full object-contain" />
                  </div>

                  <div className="ml-4 md:ml-0 md:mt-4 space-y-1">
                    <h4 className="text-sm font-bold text-zinc-800 tracking-tight group-hover:text-primary-blue transition-colors">
                      {step.label}
                    </h4>
                    <p className="text-[11px] text-zinc-500 leading-relaxed md:max-w-[130px] md:mx-auto">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU'LL EXPERIENCE */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto space-y-16 z-10 relative">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400">Core Experience</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900">What You'll Experience</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Learn Card */}
          <Card className="p-8 border border-zinc-100 bg-white shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 rounded-2xl flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg shadow-inner group-hover:scale-105 transition-transform">📚</div>
              <h3 className="text-base font-bold text-zinc-800">Learn</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Attend live interactive sessions led by industry facilitators. Watch and review high-definition class recordings anytime, anywhere.
              </p>
            </div>
            <div className="pt-6 border-t border-zinc-50 mt-6 flex items-center gap-1 text-[11px] font-bold text-primary-blue font-mono uppercase tracking-wider">
              <span>Flexible learning</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          </Card>

          {/* Build Card */}
          <Card className="p-8 border border-zinc-100 bg-white shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 rounded-2xl flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-lg shadow-inner group-hover:scale-105 transition-transform">🛠</div>
              <h3 className="text-base font-bold text-zinc-800">Build</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Complete practical, hands-on project briefs. Setup repositories, commit code using Git, and deploy your live applications directly.
              </p>
            </div>
            <div className="pt-6 border-t border-zinc-50 mt-6 flex items-center gap-1 text-[11px] font-bold text-indigo-650 font-mono uppercase tracking-wider">
              <span>Project portfolio</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          </Card>

          {/* Grow Card */}
          <Card className="p-8 border border-zinc-100 bg-white shadow-sm hover:shadow-xl hover:border-violet-200 transition-all duration-300 rounded-2xl flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center text-lg shadow-inner group-hover:scale-105 transition-transform">🏆</div>
              <h3 className="text-base font-bold text-zinc-800">Grow</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Receive personalized video or written reviews from mentors. Monitor your modules progression, and earn your Founding Builder certificate.
              </p>
            </div>
            <div className="pt-6 border-t border-zinc-50 mt-6 flex items-center gap-1 text-[11px] font-bold text-violet-600 font-mono uppercase tracking-wider">
              <span>Track progress</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          </Card>

        </div>
      </section>

      {/* INSIDE THE BUILDER WORKSPACE (SPLIT LAYOUT) */}
      <section className="bg-zinc-50/50 py-24 px-6 md:px-12 border-y border-zinc-100 z-10 relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left - Workspace Preview Mockup */}
          <div className="lg:col-span-7 relative">
            <div className="absolute inset-0 bg-blue-100/50 rounded-2xl blur-xl pointer-events-none z-0"></div>
            
            {/* Branded Web Application Shell Mockup */}
            <div className="relative border border-zinc-200/80 bg-white p-6 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] z-10 space-y-6">
              
              {/* Shell header */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-200"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-200"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-200"></span>
                  <span className="text-[10px] font-mono text-zinc-400 ml-2">builder.senaacademy.org</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-50 border border-green-100 text-green-600 text-[9px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-ping mr-1"></span>
                  Connected
                </div>
              </div>

              {/* Main content grid preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Sidebar mock */}
                <div className="border border-zinc-100 bg-zinc-50/50 p-3 rounded-xl space-y-3">
                  <div className="h-3 w-1/2 bg-zinc-200 rounded"></div>
                  <div className="space-y-1.5">
                    <div className="h-5 w-full bg-white border border-zinc-100 rounded flex items-center px-1.5 gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div className="h-1.5 w-3/4 bg-zinc-200 rounded"></div>
                    </div>
                    <div className="h-5 w-full bg-transparent rounded flex items-center px-1.5 gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-zinc-250"></div>
                      <div className="h-1.5 w-1/2 bg-zinc-200 rounded"></div>
                    </div>
                  </div>
                </div>

                {/* Scorecard Mock */}
                <div className="md:col-span-2 border border-zinc-150 p-4 rounded-xl space-y-3 relative overflow-hidden bg-white">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="h-3 w-2/3 bg-zinc-200 rounded"></div>
                      <div className="h-2 w-1/2 bg-zinc-100 rounded"></div>
                    </div>
                    <span className="text-xs font-mono font-bold text-primary-blue bg-blue-50 px-1.5 py-0.5 rounded">95/100</span>
                  </div>
                  
                  <div className="space-y-1.5 pt-2 border-t border-zinc-50">
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>Git Setup</span>
                      <span>100%</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-full"></div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom activity trace */}
              <div className="p-3 bg-zinc-950 text-green-400 font-mono text-[9px] rounded-lg shadow-inner space-y-1">
                <p>&gt; git push origin main</p>
                <p className="text-zinc-500">Enumerating objects: 5, done.</p>
                <p>&gt; vercel --prod</p>
                <p className="text-blue-400">✓ Production build succeeded. Deployment Live!</p>
              </div>

            </div>
          </div>

          {/* Right - Features Checklist */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400">Builder Workspace</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 leading-tight">Inside the Workspace</h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Log in to experience a complete, dedicated sandbox environment structured around execution.
              </p>
            </div>

            <ul className="space-y-3.5">
              {[
                'Learning Journey Map',
                'Build Challenges Curriculum',
                'Direct S3/R2 Project Submissions',
                'Recorded Sessions Library',
                'Facilitator Written Feedback',
                'Dynamic Progress Tracking',
                'Credentials & Digital Certificates'
              ].map((feat, index) => (
                <li key={index} className="flex items-center gap-3.5 text-xs text-zinc-600 font-semibold">
                  <span className="w-2 h-2 bg-[#021736] inline-block shrink-0 rounded-[1px] shadow-[0_0_4px_rgba(2,23,54,0.3)]"></span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* COMMUNITY & REAL DAY-ONE STATS */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto space-y-16 z-10 relative">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-blue-50/50 p-8 md:p-12 border border-blue-100 rounded-3xl">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-650 text-[9px] font-mono uppercase tracking-widest">
                Founding Cohort
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold text-zinc-900 leading-tight">
                You're not learning alone.
              </h2>
            </div>
            <p className="text-xs md:text-sm text-zinc-500 leading-relaxed max-w-lg">
              Join a growing community of future software engineers, innovators, and entrepreneurs learning to build with modern AI-native tools. Start conversations, get debug support, and network.
            </p>
            
            {/* WhatsApp Link opening in new tab */}
            <div className="pt-2">
              <a 
                href="https://chat.whatsapp.com/JsXT6Od90Ms77sqiCy5oHm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-3 px-6 shadow-lg flex items-center gap-2 transition-transform hover:-translate-y-0.5">
                  <MessageSquare className="h-4 w-4" />
                  Join the WhatsApp Workspace
                </Button>
              </a>
            </div>
          </div>

          {/* Stats grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            
            {/* Stat 1 */}
            <div className="bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm text-center relative overflow-hidden">
              <div className="w-1.5 h-1.5 bg-[#021736] absolute top-3 right-3 rounded-[1px]"></div>
              <span className="text-2xl font-extrabold text-zinc-900 block">{stats.whatsappMemberCount}+</span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 block mt-1">Builders</span>
            </div>

            {/* Stat 2 */}
            <div className="bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm text-center relative overflow-hidden">
              <div className="w-1.5 h-1.5 bg-[#021736] absolute top-3 right-3 rounded-[1px]"></div>
              <span className="text-2xl font-extrabold text-zinc-900 block">{stats.studentsCount}</span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 block mt-1">Trainees</span>
            </div>

            {/* Stat 3 */}
            <div className="bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm text-center relative overflow-hidden">
              <div className="w-1.5 h-1.5 bg-[#021736] absolute top-3 right-3 rounded-[1px]"></div>
              <span className="text-2xl font-extrabold text-zinc-900 block">{stats.projectsCount}</span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 block mt-1">Submissions</span>
            </div>

            {/* Stat 4 */}
            <div className="bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm text-center relative overflow-hidden">
              <div className="w-1.5 h-1.5 bg-[#021736] absolute top-3 right-3 rounded-[1px]"></div>
              <span className="text-2xl font-extrabold text-zinc-900 block">94%</span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 block mt-1">Completion</span>
            </div>

          </div>

        </div>
      </section>

      {/* BUILDER QUOTE */}
      <section className="py-20 bg-zinc-50/50 border-y border-zinc-100 text-center px-6 z-10 relative">
        <div className="max-w-2xl mx-auto space-y-4">
          <blockquote className="text-xl md:text-2xl font-serif italic text-zinc-800 font-medium">
            "The future belongs to those who build it."
          </blockquote>
          <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400 block">— Sena Academy</span>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto text-center z-10 relative">
        <div className="bg-zinc-900 text-white rounded-3xl p-8 md:p-16 space-y-8 relative overflow-hidden shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-blue/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-3 relative z-10">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Ready to continue your journey?</h2>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">Access your learning portal workspace to resume submissions and grades tracking.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10 w-full sm:w-auto">
            <Button 
              onClick={() => openModalAt('login')}
              className="w-full sm:w-auto bg-primary-blue hover:bg-blue-700 text-white font-bold text-xs py-3.5 px-8 shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Sign In
            </Button>
            <a href="/enroll" className="w-full sm:w-auto">
              <Button 
                variant="secondary"
                className="w-full sm:w-auto border border-zinc-700 text-zinc-200 hover:text-white bg-zinc-850 hover:bg-zinc-800 font-bold text-xs py-3.5 px-8 transition-transform hover:-translate-y-0.5"
              >
                Enroll Now
              </Button>
            </a>
          </div>

          <p className="text-[10px] text-zinc-500 font-mono tracking-wider pt-2 relative z-10">
            Already have an access code?{' '}
            <button 
              onClick={() => openModalAt('redeem_code')}
              className="text-primary-blue hover:underline font-bold"
            >
              Redeem code here
            </button>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-zinc-100 py-12 px-6 md:px-12 max-w-6xl mx-auto z-10 relative">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-zinc-100 pb-8">
          
          <div className="flex flex-col items-center md:items-start gap-3">
            <img src="/logo_full.jpg" alt="Sena Academy Logo" className="h-8 object-contain" />
            <p className="text-[10px] text-zinc-400 font-mono">© 2026 Sena Academy. All rights reserved.</p>
          </div>

          {/* Footer Quick Links */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-xs font-semibold text-zinc-500">
            <a href="/privacy" className="hover:text-zinc-900 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-zinc-900 transition-colors">Terms of Service</a>
            <a href="mailto:support@senaacademy.org" className="hover:text-zinc-900 transition-colors">Support</a>
            <button 
              onClick={() => openModalAt('redeem_code')} 
              className="hover:text-zinc-900 transition-colors"
            >
              Redeem Access Code
            </button>
          </div>

        </div>
        
        {/* Made with love sign off */}
        <div className="flex justify-center items-center gap-1.5 pt-6 text-[10px] text-zinc-400 font-mono">
          <span>Made for Sena Academy Founding Builders</span>
        </div>
      </footer>

      {/* ================================================================= */}
      {/* AUTHENTICATION OVERLAY MODALS */}
      {/* ================================================================= */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-md w-full relative overflow-hidden animate-slide-up text-zinc-900">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-zinc-100 p-5">
              <div className="flex items-center gap-1.5">
                <img src="/logo_icon.jpg" alt="Sena Badge" className="h-5 w-5 object-contain" />
                <span className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase">
                  {authTab === 'login' && 'Sign In'}
                  {authTab === 'redeem_code' && 'Redeem Code'}
                  {authTab === 'redeem_register' && 'Setup Credentials'}
                  {authTab === 'forgot_password' && 'Password Reset'}
                </span>
              </div>
              <button 
                onClick={() => setShowAuthModal(false)}
                className="h-6 w-6 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-650 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">

              {/* VIEW 1: LOGIN TAB */}
              {authTab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-zinc-950 leading-tight">Welcome back</h3>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">Enter your credentials to claim access to your workspace.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-[38px] h-4 w-4 text-zinc-400" />
                      <Input
                        label="Email Address"
                        id="login-email"
                        type="email"
                        placeholder="name@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-7 bg-white text-zinc-900 border-zinc-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3.5 top-[38px] h-4 w-4 text-zinc-400" />
                      <Input
                        label="Password"
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-7 bg-white text-zinc-900 border-zinc-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <button 
                      type="button" 
                      onClick={() => setAuthTab('forgot_password')}
                      className="text-primary-blue hover:underline font-semibold"
                    >
                      Forgot Password?
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setAuthTab('redeem_code')}
                      className="text-indigo-650 hover:underline font-semibold"
                    >
                      Redeem an Access Code
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 text-xs" 
                    disabled={submitting}
                  >
                    {submitting ? 'Authenticating...' : 'Sign In'}
                  </Button>
                </form>
              )}

              {/* VIEW 2: REDEEM CODE TAB */}
              {authTab === 'redeem_code' && (
                <form onSubmit={handleVerifyCodeSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-zinc-950 leading-tight">Redeem Access Code</h3>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Enter the alphanumeric reference code received via email to activate your account.
                    </p>
                  </div>

                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-[38px] h-4 w-4 text-zinc-400" />
                    <Input
                      label="Verification Code"
                      id="access-code"
                      type="text"
                      placeholder="e.g. SENA-XXXXXX"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      required
                      className="pl-7 bg-white text-zinc-900 border-zinc-200 uppercase"
                    />
                  </div>

                  <div className="text-[11px] pt-1">
                    <button 
                      type="button" 
                      onClick={() => setAuthTab('login')}
                      className="text-primary-blue hover:underline font-semibold"
                    >
                      Back to Sign In
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 text-xs" 
                    disabled={submitting}
                  >
                    {submitting ? 'Verifying Code...' : 'Verify Access Code'}
                  </Button>
                </form>
              )}

              {/* VIEW 3: REDEEM REGISTER TAB */}
              {authTab === 'redeem_register' && (
                <form onSubmit={handleRedeemRegisterSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-zinc-950 leading-tight">Claim Your Account</h3>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Access verified for <span className="font-semibold text-primary-blue">{validatedCodeData?.email}</span>. Configure your details below.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-3.5 top-[38px] h-4 w-4 text-zinc-400" />
                      <Input
                        label="Full Name"
                        id="student-name"
                        type="text"
                        placeholder="John Doe"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        required
                        className="pl-7 bg-white text-zinc-900 border-zinc-200"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3.5 top-[38px] h-4 w-4 text-zinc-400" />
                      <Input
                        label="Choose Password"
                        id="student-password"
                        type="password"
                        placeholder="Min 6 characters"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        required
                        className="pl-7 bg-white text-zinc-900 border-zinc-200"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 text-xs" 
                    disabled={submitting}
                  >
                    {submitting ? 'Creating Profile...' : 'Complete Registration'}
                  </Button>
                </form>
              )}

              {/* VIEW 4: FORGOT PASSWORD TAB */}
              {authTab === 'forgot_password' && (
                <form onSubmit={handleResetSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-zinc-950 leading-tight">Request Password Reset</h3>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Admins will review your account reset ticket and email you a password recovery link.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-[38px] h-4 w-4 text-zinc-400" />
                      <Input
                        label="Student Email Address"
                        id="reset-email"
                        type="email"
                        placeholder="name@domain.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        className="pl-7 bg-white text-zinc-900 border-zinc-200"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-zinc-400 uppercase font-mono" htmlFor="reset-reason">
                        Reason for request (Optional)
                      </label>
                      <textarea
                        id="reset-reason"
                        rows={3}
                        placeholder="e.g. Lost credentials access..."
                        value={resetMessage}
                        onChange={(e) => setResetMessage(e.target.value)}
                        className="glass-input text-xs text-zinc-900 rounded-lg p-2.5 w-full bg-white border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="text-[11px] pt-1">
                    <button 
                      type="button" 
                      onClick={() => setAuthTab('login')}
                      className="text-primary-blue hover:underline font-semibold"
                    >
                      Back to Sign In
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 text-xs" 
                    disabled={submittingReset}
                  >
                    {submittingReset ? 'Submitting Request...' : 'Log Reset Request'}
                  </Button>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

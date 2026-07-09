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
  MessageSquare,
  Compass,
  Terminal,
  Upload,
  CheckCircle2,
  Trophy,
  Sun,
  Moon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/context/ThemeContext';

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
  const { theme, toggleTheme } = useTheme();

  // Mouse position state for dynamic gradient hover
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 50, y: 50 });
  };

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
    whatsappMemberCount: 238 // Initial seeded fallback
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
        console.error('Failed to load stats:', err);
      }
    };
    fetchStats();
  }, []);

  // Modal Authentication Overlay State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'redeem_code' | 'redeem_register' | 'forgot_password'>('login');
  
  // Submit loading triggers
  const [submitting, setSubmitting] = useState(false);
  const [submittingReset, setSubmittingReset] = useState(false);

  // Form Fields State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Code verification flow fields
  const [accessCode, setAccessCode] = useState('');
  const [validatedCodeData, setValidatedCodeData] = useState<{ code: string; email: string } | null>(null);
  
  // Onboarding registration fields
  const [studentName, setStudentName] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // Password reset request ticket fields
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const openModalAt = (tab: 'login' | 'redeem_code' | 'redeem_register' | 'forgot_password') => {
    setAuthTab(tab);
    setShowAuthModal(true);
  };

  // Submission handles
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await signIn(email, password);
      if (!error) {
        showToast('Welcome', 'Login successful', 'success');
        setShowAuthModal(false);
      } else {
        showToast('Login Failed', error.message || 'Invalid email or password', 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'System error during login', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      
      setValidatedCodeData({ code: data.code, email: data.email });
      setAuthTab('redeem_register');
      showToast('Code Verified', 'Please set up your profile password.', 'success');
    } catch (err: any) {
      showToast('Code Invalid', err.message || 'Access code not found or expired', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRedeemRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatedCodeData) return;
    setSubmitting(true);
    try {
      const { success, error } = await redeemCode(
        validatedCodeData.code,
        studentName,
        studentPassword
      );
      if (success) {
        showToast('Success', 'Profile created successfully!', 'success');
        setShowAuthModal(false);
      } else {
        showToast('Registration Failed', error || 'Failed to redeem code', 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'System error during registration', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReset(true);
    try {
      const { error } = await supabase.from('password_reset_requests').insert({
        email: resetEmail,
        reason: resetMessage || null
      });
      if (error) throw error;
      showToast('Ticket Logged', 'Admin has received your reset request.', 'success');
      setResetEmail('');
      setResetMessage('');
      setAuthTab('login');
    } catch (err: any) {
      showToast('Submit Failed', err.message || 'Error logging reset request ticket', 'error');
    } finally {
      setSubmittingReset(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg-canvas">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <img src="/logo_icon.jpg" alt="Sena Symbol" className="h-10 w-10 object-contain animate-pulse" />
          <p className="text-xs text-text-secondary font-mono tracking-widest uppercase">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  // Builder Journey Steps
  const journeySteps = [
    { label: 'Discover', desc: 'Find your spark and explore modern developer tools.', icon: Compass },
    { label: 'Learn', desc: 'Attend interactive live sessions and review code recordings.', icon: BookOpen },
    { label: 'Build', desc: 'Complete practical challenges matching real-world developer workflows.', icon: Terminal },
    { label: 'Submit', desc: 'Push your project to GitHub and deploy live to Vercel.', icon: Upload },
    { label: 'Receive Feedback', desc: 'Get descriptive async code reviews from facilitators.', icon: MessageSquare },
    { label: 'Graduate', desc: 'Earn your course credentials and unlock builder status.', icon: Award },
    { label: 'Become a Founding Builder', desc: 'Join the premium network of alumni builders.', icon: Trophy }
  ];

  // Mapped design token styles
  const pageBgClass = 'bg-bg-canvas text-text-primary';
  const headerClass = 'bg-bg-canvas/80 border-border-brand shadow-sm';
  const textTitleClass = 'text-text-primary';
  const textBodyClass = 'text-text-secondary';
  const cardBgClass = 'bg-bg-surface border-border-brand';
  const bulletBgClass = 'bg-accent-primary';
  const quoteSectionClass = 'bg-bg-surface/30 border-border-brand';
  const footerSectionClass = 'bg-transparent border-border-brand';

  return (
    <div className={`min-h-screen font-sans relative overflow-x-hidden selection:bg-blue-100 selection:text-blue-900 transition-colors duration-250 ${pageBgClass}`}>
      
      {/* Decorative Blur Backgrounds (Glows only in dark mode) */}
      {theme === 'dark' ? (
        <>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-primary/5 rounded-full blur-3xl pointer-events-none z-0"></div>
          <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none z-0"></div>
        </>
      ) : (
        <>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/20 rounded-full blur-3xl pointer-events-none z-0"></div>
          <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-indigo-50/20 rounded-full blur-3xl pointer-events-none z-0"></div>
        </>
      )}

      {/* TOP NAVIGATION HEADER */}
      <nav className={`sticky top-0 backdrop-blur-md border-b py-4 px-6 md:px-12 flex justify-between items-center z-40 transition-colors duration-200 ${headerClass}`}>
        <div className="flex items-center gap-2.5">
          {theme === 'dark' ? (
            <>
              <div className="h-8 w-8 rounded-lg bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm">
                <img src="/logo_icon.jpg" alt="Sena Logo Icon" className="h-full w-full object-contain" />
              </div>
              <span className="text-sm font-bold tracking-tight text-white uppercase">Sena Academy</span>
            </>
          ) : (
            <img src="/logo_full.jpg" alt="Sena Academy Logo" className="h-8 md:h-9 object-contain" />
          )}
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          
          <button 
            onClick={() => openModalAt('login')}
            className="text-xs font-semibold transition-colors text-text-secondary hover:text-text-primary"
          >
            Sign In
          </button>
          <a href="/enroll">
            <Button size="sm" className="font-semibold text-xs py-2 px-4 shadow-sm">
              Enroll Now
            </Button>
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative py-20 px-6 md:px-12 max-w-6xl mx-auto flex flex-col items-center text-center z-10 space-y-8">
        
        {/* Subtle geometric grid decorator */}
        <div className={`absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40 z-0 ${theme === 'dark' ? 'invert opacity-[0.03]' : ''}`}></div>

        <div className="relative z-10 space-y-4 max-w-3xl">
          <h1 className={`text-4xl md:text-6xl font-extrabold tracking-tight leading-tight transition-colors duration-200 ${textTitleClass}`}>
            Forge the skills of tomorrow, <span 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                backgroundImage: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, #3b82f6 0%, var(--accent-primary) 70%, #4f46e5 120%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                transition: 'background-image 0.1s ease-out'
              }}
              className="font-extrabold cursor-default select-none"
            >one project</span> at a time.
          </h1>
          
          <p className={`text-base md:text-lg leading-relaxed max-w-2xl mx-auto pt-2 ${textBodyClass}`}>
            This is where ideas become projects, projects become products, and beginners become builders. Every lesson, challenge, and milestone brings you closer to becoming a confident software developer.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
          <Button 
            onClick={() => openModalAt('login')}
            className="w-full sm:w-auto font-bold text-sm py-3 px-8 shadow-lg"
          >
            Continue to Sign In
          </Button>
          <a href="/enroll" className="w-full sm:w-auto">
            <Button 
              variant="secondary"
              className="w-full sm:w-auto font-bold text-sm py-3 px-8 shadow-lg"
            >
              Enroll Now
            </Button>
          </a>
        </div>
      </header>

      {/* ROADMAP TIMELINE */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto space-y-16 z-10 relative">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono tracking-widest uppercase text-text-secondary">Roadmap</span>
          <h2 className={`text-2xl md:text-3xl font-extrabold ${textTitleClass}`}>Your Journey Starts Here</h2>
          <p className={`text-xs max-w-md mx-auto ${textBodyClass}`}>Follow our systematic builder pipeline to progress from raw code setup to credentials graduation.</p>
        </div>

        {/* Interactive Horizontal/Vertical Timeline */}
        <div className="relative pt-6">
          {/* Desktop Connective line centered vertically */}
          <div className="hidden md:block absolute top-[48px] left-8 right-8 h-0.5 roadmap-line z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-7 gap-8 md:gap-4 relative z-10">
            {journeySteps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={index} className="flex md:flex-col items-start md:items-center text-left md:text-center group select-none">
                  
                  {/* Glowing Node with Lucide icons */}
                  <div className="h-[54px] w-[54px] md:h-12 md:w-12 rounded-full border border-border-brand bg-bg-surface text-accent-primary flex items-center justify-center ring-4 ring-accent-primary/10 z-10 transition-transform group-hover:scale-110 duration-200 shrink-0 p-2.5">
                    <StepIcon className="h-full w-full stroke-[2]" />
                  </div>

                  <div className="ml-4 md:ml-0 md:mt-4 space-y-1">
                    <h4 className={`text-sm font-bold tracking-tight group-hover:text-accent-primary transition-colors ${
                      theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'
                    }`}>
                      {step.label}
                    </h4>
                    <p className={`text-[11px] leading-relaxed md:max-w-[130px] md:mx-auto ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                    }`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHAT YOU'LL EXPERIENCE */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto space-y-16 z-10 relative">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono tracking-widest uppercase text-text-secondary">Core Experience</span>
          <h2 className={`text-2xl md:text-3xl font-extrabold ${textTitleClass}`}>What You'll Experience</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Learn Card */}
          <Card className="p-8 border border-border-brand bg-bg-surface hover:bg-bg-surface-hover hover:border-accent-primary/20 text-text-primary rounded-2xl flex flex-col justify-between group transition-all duration-300">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg shadow-inner group-hover:scale-105 transition-transform bg-bg-surface-hover">📚</div>
              <h3 className="text-base font-bold text-text-primary">Learn</h3>
              <p className={`text-xs leading-relaxed ${textBodyClass}`}>
                Attend live interactive sessions led by industry facilitators. Watch and review high-definition class recordings anytime, anywhere.
              </p>
            </div>
            <div className="pt-6 border-t border-border-brand/40 mt-6 flex items-center gap-1 text-[11px] font-bold text-accent-primary font-mono uppercase tracking-wider">
              <span>Flexible learning</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          </Card>

          {/* Build Card */}
          <Card className="p-8 border border-border-brand bg-bg-surface hover:bg-bg-surface-hover hover:border-accent-primary/20 text-text-primary rounded-2xl flex flex-col justify-between group transition-all duration-300">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg shadow-inner group-hover:scale-105 transition-transform bg-bg-surface-hover">🛠</div>
              <h3 className="text-base font-bold text-text-primary">Build</h3>
              <p className={`text-xs leading-relaxed ${textBodyClass}`}>
                Complete practical, hands-on project briefs. Setup repositories, commit code using Git, and deploy your live applications directly.
              </p>
            </div>
            <div className="pt-6 border-t border-border-brand/40 mt-6 flex items-center gap-1 text-[11px] font-bold text-accent-primary font-mono uppercase tracking-wider">
              <span>Project portfolio</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          </Card>

          {/* Grow Card */}
          <Card className="p-8 border border-border-brand bg-bg-surface hover:bg-bg-surface-hover hover:border-accent-primary/20 text-text-primary rounded-2xl flex flex-col justify-between group transition-all duration-300">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg shadow-inner group-hover:scale-105 transition-transform bg-bg-surface-hover">🏆</div>
              <h3 className="text-base font-bold text-text-primary">Grow</h3>
              <p className={`text-xs leading-relaxed ${textBodyClass}`}>
                Receive personalized video or written reviews from mentors. Monitor your modules progression, and earn your Founding Builder certificate.
              </p>
            </div>
            <div className="pt-6 border-t border-border-brand/40 mt-6 flex items-center gap-1 text-[11px] font-bold text-accent-primary font-mono uppercase tracking-wider">
              <span>Track progress</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          </Card>

        </div>
      </section>

      {/* INSIDE THE BUILDER WORKSPACE (SPLIT LAYOUT) */}
      <section className={`py-24 px-6 md:px-12 border-y z-10 relative transition-colors duration-250 ${quoteSectionClass}`}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left - Workspace Preview Mockup */}
          <div className="lg:col-span-7 relative">
            <div className="absolute inset-0 bg-accent-primary/5 rounded-2xl blur-xl pointer-events-none z-0"></div>
            
            {/* Branded Web Application Shell Mockup */}
            <div className="relative border border-border-brand bg-bg-surface p-6 rounded-2xl shadow-lg z-10 space-y-6 transition-colors duration-200">
              
              {/* Shell header */}
              <div className="flex items-center justify-between border-b border-border-brand/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-400"></span>
                  <span className="text-[10px] font-mono ml-2 text-text-secondary">builder.senaacademy.org</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-ping mr-1"></span>
                  Connected
                </div>
              </div>

              {/* Main content grid preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Sidebar mock */}
                <div className="border border-border-brand bg-bg-canvas/50 p-3 rounded-xl space-y-3">
                  <div className="h-3 w-1/2 bg-text-secondary/20 rounded"></div>
                  <div className="space-y-1.5">
                    <div className="h-2 w-full bg-text-secondary/10 rounded"></div>
                    <div className="h-2 w-3/4 bg-text-secondary/10 rounded"></div>
                  </div>
                </div>

                {/* Dashboard stats mock */}
                <div className="border border-border-brand bg-bg-canvas/50 p-3 rounded-xl space-y-3 md:col-span-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold text-accent-primary bg-accent-primary/10 px-1.5 py-0.5 rounded">95/100</span>
                  </div>
                  
                  <div className="space-y-1.5 pt-2 border-t border-border-brand/10">
                    <div className="flex justify-between text-[10px] text-text-secondary">
                      <span>Git Setup</span>
                      <span>100%</span>
                    </div>
                    <div className="h-1 w-full rounded-full overflow-hidden bg-bg-canvas">
                      <div className="h-full bg-green-500 w-full"></div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom activity trace */}
              <div className="p-3 bg-black text-green-400 font-mono text-[9px] rounded-lg shadow-inner space-y-1 border border-border-brand">
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
              <span className="text-[10px] font-mono tracking-widest uppercase text-text-secondary">Builder Workspace</span>
              <h2 className={`text-2xl md:text-3xl font-extrabold leading-tight ${textTitleClass}`}>Inside the Workspace</h2>
              <p className={`text-xs leading-relaxed ${textBodyClass}`}>
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
                <li key={index} className="flex items-center gap-3.5 text-xs font-semibold text-text-primary">
                  <span className={`w-2 h-2 inline-block shrink-0 rounded-[1px] shadow-sm ${bulletBgClass}`}></span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* COMMUNITY & REAL DAY-ONE STATS */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto space-y-16 z-10 relative">
        
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 md:p-12 border rounded-3xl transition-colors duration-250 ${
          theme === 'dark' ? 'bg-bg-surface border-border-brand' : 'bg-blue-50/20 border-border-brand'
        }`}>
          
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-650 text-[9px] font-mono uppercase tracking-widest">
                Founding Cohort
              </div>
              <h2 className={`text-2xl md:text-4xl font-extrabold leading-tight ${textTitleClass}`}>
                You're not learning alone.
              </h2>
            </div>
            <p className={`text-xs md:text-sm leading-relaxed max-w-lg ${textBodyClass}`}>
              Join a growing community of future software engineers, innovators, and entrepreneurs learning to build with modern AI-native tools. Start conversations, get debug support, and network.
            </p>
            
            {/* WhatsApp Link opening in new tab */}
            <div className="pt-2">
              <a 
                href="https://chat.whatsapp.com/JsXT6Od90Ms77sqiCy5oHm" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-3 px-6 shadow-lg flex items-center gap-2 transition-transform hover:-translate-y-0.5">
                  <MessageSquare className="h-4 w-4" />
                  Join the WhatsApp Workspace
                </Button>
              </a>
            </div>
          </div>

          {/* Stats grid reframed for low volume - Option A */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            
            {/* Stat 1: Builders community members */}
            <div className="p-6 rounded-2xl border border-border-brand bg-bg-surface text-center relative overflow-hidden transition-colors duration-200">
              <div className={`w-1.5 h-1.5 absolute top-3 right-3 rounded-[1px] ${bulletBgClass}`}></div>
              <span className={`text-2xl font-extrabold block ${textTitleClass}`}>{stats.whatsappMemberCount}+</span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-text-secondary block mt-1">Builders</span>
            </div>

            {/* Stat 2: Static Reframed - Cohort Admission Status */}
            <div className="p-6 rounded-2xl border border-border-brand bg-bg-surface text-center relative overflow-hidden transition-colors duration-200">
              <div className={`w-1.5 h-1.5 absolute top-3 right-3 rounded-[1px] ${bulletBgClass}`}></div>
              <span className="text-2xl font-extrabold block text-accent-primary">Open</span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-text-secondary block mt-1">Cohort Active</span>
            </div>

            {/* Stat 3: Completion rate */}
            <div className="p-6 rounded-2xl border border-border-brand bg-bg-surface text-center relative overflow-hidden transition-colors duration-200">
              <div className={`w-1.5 h-1.5 absolute top-3 right-3 rounded-[1px] ${bulletBgClass}`}></div>
              <span className={`text-2xl font-extrabold block ${textTitleClass}`}>94%</span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-text-secondary block mt-1">Completion</span>
            </div>

            {/* Stat 4: Static Reframed - Practical Projects */}
            <div className="p-6 rounded-2xl border border-border-brand bg-bg-surface text-center relative overflow-hidden transition-colors duration-200">
              <div className={`w-1.5 h-1.5 absolute top-3 right-3 rounded-[1px] ${bulletBgClass}`}></div>
              <span className={`text-2xl font-extrabold block ${textTitleClass}`}>100%</span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-text-secondary block mt-1">Practical Labs</span>
            </div>

          </div>

        </div>
      </section>

      {/* BUILDER QUOTE */}
      <section className={`py-20 border-y text-center px-6 z-10 relative transition-colors duration-250 ${quoteSectionClass}`}>
        <div className="max-w-2xl mx-auto space-y-4">
          <blockquote className={`text-xl md:text-2xl font-serif italic font-medium ${
            theme === 'dark' ? 'text-zinc-205' : 'text-zinc-800'
          }`}>
            "The future belongs to those who build it."
          </blockquote>
          <span className="text-[10px] font-mono tracking-widest uppercase text-text-secondary block">— Sena Academy</span>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto text-center z-10 relative">
        <div className={`rounded-3xl p-8 md:p-16 space-y-8 relative overflow-hidden shadow-2xl transition-colors duration-200 ${
          theme === 'dark' ? 'bg-bg-surface border border-border-brand' : 'bg-zinc-900 text-white'
        }`}>
          {/* Subtle background glow */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-3 relative z-10">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Ready to continue your journey?</h2>
            <p className="text-xs text-text-secondary max-w-sm mx-auto opacity-95">Access your learning portal workspace to resume submissions and grades tracking.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10 w-full sm:w-auto">
            <Button 
              onClick={() => openModalAt('login')}
              className="w-full sm:w-auto font-bold text-xs py-3.5 px-8 shadow-lg"
            >
              Sign In
            </Button>
            <a href="/enroll" className="w-full sm:w-auto">
              <Button 
                variant="secondary"
                className="w-full sm:w-auto font-bold text-xs py-3.5 px-8 transition-transform hover:-translate-y-0.5 border"
              >
                Enroll Now
              </Button>
            </a>
          </div>

          <p className="text-[10px] text-text-secondary font-mono tracking-wider pt-2 relative z-10">
            Already have an access code?{' '}
            <button 
              onClick={() => openModalAt('redeem_code')}
              className="text-accent-primary hover:underline font-bold"
            >
              Redeem code here
            </button>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`border-t py-12 px-6 md:px-12 max-w-6xl mx-auto z-10 relative transition-colors duration-250 ${footerSectionClass}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-border-brand pb-8">
          
          <div className="flex flex-col items-center md:items-start gap-3">
            {theme === 'dark' ? (
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm">
                  <img src="/logo_icon.jpg" alt="Sena Logo Icon" className="h-full w-full object-contain" />
                </div>
                <span className="text-sm font-bold tracking-tight text-white uppercase">Sena Academy</span>
              </div>
            ) : (
              <img src="/logo_full.jpg" alt="Sena Academy Logo" className="h-8 object-contain" />
            )}
            <p className="text-[10px] text-text-secondary font-mono">© 2026 Sena Academy. All rights reserved.</p>
          </div>

          {/* Footer Quick Links */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-xs font-semibold text-text-secondary">
            <a href="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-text-primary transition-colors">Terms of Service</a>
            <a href="mailto:support@senaacademy.org" className="hover:text-text-primary transition-colors">Support</a>
            <button 
              onClick={() => openModalAt('redeem_code')} 
              className="hover:text-text-primary transition-colors"
            >
              Redeem Access Code
            </button>
          </div>

        </div>
        
        {/* Made with love sign off */}
        <div className="flex justify-center items-center gap-1.5 pt-6 text-[10px] text-text-secondary font-mono">
          <span>Made for Sena Academy Founding Builders</span>
        </div>
      </footer>

      {/* ================================================================= */}
      {/* AUTHENTICATION OVERLAY MODALS */}
      {/* ================================================================= */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="rounded-2xl border border-border-brand bg-bg-surface text-text-primary shadow-2xl max-w-md w-full relative overflow-hidden animate-slide-up transition-colors duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b p-5 border-border-brand">
              <div className="flex items-center gap-1.5">
                <img src="/logo_icon.jpg" alt="Sena Badge" className="h-5 w-5 object-contain" />
                <span className="text-xs font-bold font-mono tracking-wider text-text-secondary uppercase">
                  {authTab === 'login' && 'Sign In'}
                  {authTab === 'redeem_code' && 'Redeem Code'}
                  {authTab === 'redeem_register' && 'Setup Credentials'}
                  {authTab === 'forgot_password' && 'Password Reset'}
                </span>
              </div>
              <button 
                onClick={() => setShowAuthModal(false)}
                className="h-6 w-6 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors"
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
                    <h3 className="text-lg font-extrabold leading-tight text-text-primary">Welcome back</h3>
                    <p className="text-[11px] text-text-secondary leading-relaxed">Enter your credentials to claim access to your workspace.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-[38px] h-4 w-4 text-text-secondary/60 animate-fade-in" />
                      <Input
                        label="Email Address"
                        id="login-email"
                        type="email"
                        placeholder="name@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-7"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3.5 top-[38px] h-4 w-4 text-text-secondary/60 animate-fade-in" />
                      <Input
                        label="Password"
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-7"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <button 
                      type="button" 
                      onClick={() => setAuthTab('forgot_password')}
                      className="text-accent-primary hover:underline font-semibold"
                    >
                      Forgot Password?
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setAuthTab('redeem_code')}
                      className="text-accent-primary hover:underline font-semibold"
                    >
                      Redeem an Access Code
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full font-bold py-3 text-xs" 
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
                    <h3 className="text-lg font-extrabold leading-tight text-text-primary">Redeem Access Code</h3>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      Enter the alphanumeric reference code received via email to activate your account.
                    </p>
                  </div>

                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-[38px] h-4 w-4 text-text-secondary/60 animate-fade-in" />
                    <Input
                      label="Verification Code"
                      id="access-code"
                      type="text"
                      placeholder="e.g. SENA-XXXXXX"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      required
                      className="pl-7 uppercase"
                    />
                  </div>

                  <div className="text-[11px] pt-1">
                    <button 
                      type="button" 
                      onClick={() => setAuthTab('login')}
                      className="text-accent-primary hover:underline font-semibold"
                    >
                      Back to Sign In
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full font-bold py-3 text-xs"
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
                    <h3 className="text-lg font-extrabold leading-tight text-text-primary">Claim Your Account</h3>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      Access verified for <span className="font-semibold text-accent-primary">{validatedCodeData?.email}</span>. Configure your details below.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-3.5 top-[38px] h-4 w-4 text-text-secondary/60 animate-fade-in" />
                      <Input
                        label="Full Name"
                        id="student-name"
                        type="text"
                        placeholder="John Doe"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        required
                        className="pl-7"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3.5 top-[38px] h-4 w-4 text-text-secondary/60 animate-fade-in" />
                      <Input
                        label="Choose Password"
                        id="student-password"
                        type="password"
                        placeholder="Min 6 characters"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        required
                        className="pl-7"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full font-bold py-3 text-xs" 
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
                    <h3 className="text-lg font-extrabold leading-tight text-text-primary">Request Password Reset</h3>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      Admins will review your account reset ticket and email you a password recovery link.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-[38px] h-4 w-4 text-text-secondary/60 animate-fade-in" />
                      <Input
                        label="Student Email Address"
                        id="reset-email"
                        type="email"
                        placeholder="name@domain.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        className="pl-7"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-text-secondary select-none animate-fade-in" htmlFor="reset-reason">
                        Reason for request (Optional)
                      </label>
                      <textarea
                        id="reset-reason"
                        rows={3}
                        placeholder="e.g. Lost credentials access..."
                        value={resetMessage}
                        onChange={(e) => setResetMessage(e.target.value)}
                        className="text-xs rounded-lg p-2.5 w-full focus:outline-none transition-colors duration-200 glass-input"
                      />
                    </div>
                  </div>

                  <div className="text-[11px] pt-1">
                    <button 
                      type="button" 
                      onClick={() => setAuthTab('login')}
                      className="text-accent-primary hover:underline font-semibold"
                    >
                      Back to Sign In
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full font-bold py-3 text-xs" 
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

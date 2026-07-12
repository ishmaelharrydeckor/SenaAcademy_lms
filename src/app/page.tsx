'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { Button, Input, Card, MetaRow, BuildLogCard } from '@/components/UI';
import { 
  Mail, 
  Lock, 
  Sparkles, 
  User, 
  X, 
  ExternalLink,
  MessageSquare,
  Compass,
  Terminal,
  Upload,
  Award,
  Trophy
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';

interface PublicStats {
  studentsCount: number;
  facilitatorsCount: number;
  projectsCount: number;
  whatsappMemberCount: number;
}

const ROADMAP_STEPS = [
  {
    step: 1,
    title: 'Discover Stage',
    subtitle: 'Discover — find your spark and explore modern developer tools',
    desc: 'Explore the modern tools of software engineering. Learn to configure AI coding assistants, read repository structures, and navigate local terminals to find your spark.',
    verbs: ['Explore', 'Configure', 'Navigate']
  },
  {
    step: 2,
    title: 'Learn Stage',
    subtitle: 'Learn — attend live sessions, review recordings',
    desc: 'Attend structured live interactive sessions led by industry facilitators. Access class recordings, review technical notes, and build foundation concepts.',
    verbs: ['Attend', 'Access', 'Review']
  },
  {
    step: 3,
    title: 'Build Stage',
    subtitle: 'Build — complete challenges matching real workflows',
    desc: 'Execute practical hands-on briefs matching real-world developer requirements. Set up environment variables, design styling systems, and write clean codebase solutions.',
    verbs: ['Execute', 'Configure', 'Code']
  },
  {
    step: 4,
    title: 'Submit Stage',
    subtitle: 'Submit — push to GitHub, deploy live to Vercel',
    desc: 'Stage and commit your codebase using Git. Push changes directly to GitHub repositories, run production tests, and deploy live workspaces to Vercel.',
    verbs: ['Commit', 'Push', 'Deploy']
  },
  {
    step: 5,
    title: 'Review Stage',
    subtitle: 'Receive feedback — get async code review from facilitators',
    desc: 'Receive async code reviews from facilitators. Inspect inline comments, refine implementation details, and refactor codebases based on mentor feedback.',
    verbs: ['Inspect', 'Refactor', 'Improve']
  },
  {
    step: 6,
    title: 'Graduate Stage',
    subtitle: 'Graduate — earn your course credentials',
    desc: 'Earn course credentials and unlock builder status. Finalize submission modules, calculate scores, and receive the digital completion cert.',
    verbs: ['Finalize', 'Verify', 'Unlock']
  },
  {
    step: 7,
    title: 'Launch Stage',
    subtitle: 'Become a Founding Builder — join the alumni network',
    desc: 'Join the alumni builders network. Leverage WhatsApp debug workspaces, participate in mastermind meetups, and deploy production projects in teams.',
    verbs: ['Connect', 'Network', 'Launch']
  }
];

export default function LandingPage() {
  const { signIn, redeemCode, user, profile, loading } = useAuth();
  const { showToast } = useNotifications();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Navigation redirect if already logged in
  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin') router.replace('/admin');
      else if (profile.role === 'facilitator') router.replace('/facilitator');
      else router.replace('/student');
    }
  }, [user, profile, router]);

  // Check URL parameters to trigger auto code-redemption modal
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('redeem') === 'true') {
        openModalAt('redeem_code');
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

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
        console.error('Failed to load stats:', err);
      }
    };
    fetchStats();
  }, []);

  // Modal Authentication Overlay State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'redeem_code' | 'redeem_register' | 'forgot_password'>('login');
  
  // Roadmap detail step modal state
  const [activeRoadmapStep, setActiveRoadmapStep] = useState<number | null>(null);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const FAQ_ITEMS = [
    {
      q: "How do I get an access code?",
      a: "Access codes are issued upon successful enrollment. If you are sponsored or registered by an administrator, your unique access code will be sent to your email."
    },
    {
      q: "What technologies will I build with?",
      a: "You will configure, build, and deploy production systems using React, Next.js, Tailwind CSS, PostgreSQL, and Git/GitHub command-line tools."
    },
    {
      q: "Is the schedule flexible?",
      a: "Yes. While live sessions run weekly, all recordings and project briefs are accessible asynchronously. You can commit code and submit assignments on your own schedule."
    },
    {
      q: "Who reviews my module submissions?",
      a: "Submissions are reviewed asynchronously by expert facilitators. You receive functional feedback, commit reviews, and grade scores directly in your student dashboard."
    },
    {
      q: "How do I access WhatsApp debug channels?",
      a: "Once signed in, your student dashboard contains active links to the cohort WhatsApp workspace, where you can ask facilitators and fellow builders debug questions."
    }
  ];

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
        body: JSON.stringify({ code: accessCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      
      setValidatedCodeData({ code: accessCode, email: data.email });
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
        message: resetMessage || null
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
          <img src="/logo_icon.png" alt="Sena Symbol" className="h-10 w-10 object-contain animate-pulse" />
          <p className="text-xs text-text-secondary font-mono tracking-widest uppercase">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-canvas text-text-primary transition-colors duration-250 flex flex-col font-sans select-none antialiased">
      
      {/* 1. HEADER / NAVIGATION */}
      <nav className="sticky top-0 bg-bg-canvas border-b border-border-brand z-40 transition-colors duration-250">
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex items-center justify-between h-[76px]">
          <div 
            onClick={() => router.push('/')}
            className="bg-white px-4 py-2 rounded-xl border border-border-brand/20 shadow-sm h-12 flex items-center justify-center cursor-pointer select-none hover:opacity-90 transition-opacity"
          >
            <img src="/logo_full.png" alt="Sena Academy Logo" className="h-7 object-contain" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#roadmap" className="text-sm font-medium text-text-primary hover:text-accent-primary transition-colors">Curriculum</a>
            <Link href="/events" className="text-sm font-medium text-text-primary hover:text-accent-primary transition-colors">Events</Link>
            <a href="#faq" className="text-sm font-medium text-text-primary hover:text-accent-primary transition-colors">FAQ</a>
            <a href="#community" className="text-sm font-medium text-text-primary hover:text-accent-primary transition-colors">Community</a>
          </div>
          <div className="flex items-center gap-[18px]">
            <button 
              className="theme-toggle flex items-center justify-center w-[38px] h-[38px] border border-border-brand rounded-full bg-transparent hover:bg-bg-surface-hover transition-colors text-text-primary text-base cursor-pointer" 
              onClick={toggleTheme} 
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? '◑' : '◐'}
            </button>
            <div 
              className="cta-pill flex items-center bg-btn-primary text-btn-primary-text rounded-full overflow-hidden text-sm font-semibold select-none cursor-pointer border border-btn-primary/10" 
              onClick={() => openModalAt('login')}
            >
              <span className="px-5 py-2.5">Sign in</span>
              <span className="px-4 py-2.5 border-l border-white/20 select-none">⌄</span>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="hero max-w-6xl mx-auto px-6 md:px-12 pt-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-14 items-start">
          <div className="space-y-8 text-left">
            <h1 className="headline text-4xl md:text-5xl lg:text-6xl font-black font-archivo tracking-tight leading-none text-text-primary">
              Forge the <span className="b">skills</span> of tomorrow, one <span className="u">project</span> at a time
            </h1>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => openModalAt('redeem_code')}>Become a Founding Builder</Button>
              <a 
                href="#roadmap" 
                className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-border-brand text-sm font-semibold text-text-primary hover:bg-bg-surface-hover transition-colors"
              >
                Explore the Roadmap
              </a>
            </div>
          </div>
          <div className="pt-2 md:pt-4">
            <p className="serif text-[15px] md:text-base leading-relaxed text-text-secondary/70 max-w-md">
              This is where ideas become projects, projects become products, and beginners become builders. Every lesson, challenge, and milestone brings you closer to shipping as a confident software developer.
            </p>
          </div>
        </div>

        {/* Visual Bridge */}
        <div className="flex flex-col items-center justify-center gap-2 mb-8">
          <span className="text-[10px] font-mono tracking-widest uppercase text-text-secondary/60">See it in action</span>
          <div className="h-8 w-px bg-border-brand/30"></div>
        </div>

        <div className="mb-14">
          <BuildLogCard 
            title="senaacademy.org"
            status="connected"
            lines={[
              { text: 'git push origin main', isPrompt: true },
              { text: 'Enumerating objects: 5, done.', isDim: true },
              { text: 'vercel --prod', isPrompt: true },
              { text: '✓ Production build succeeded. Deployment live.', isSuccess: true }
            ]}
            reviewLabel="Facilitator review —"
            reviewText="clean commit history, good use of env vars. Ship it."
          />
        </div>
      </section>

      {/* 3. MISSION BANNER */}
      <section className="bg-ink dark:bg-[#0F1012] text-on-dark py-16 text-center w-full">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-[10px] font-mono tracking-widest uppercase text-on-dark-soft/80 block mb-4">MISSION</span>
          <h2 className="serif text-4xl md:text-5xl font-medium max-w-xl mx-auto mb-6 leading-tight">
            Sena Academy is built on real, shipped work.
          </h2>
          <p className="serif text-base text-on-dark-soft max-w-md mx-auto mb-8 leading-relaxed">
            See how the roadmap takes you from your first commit to a live, deployed product with a facilitator's name on the review.
          </p>
          <a 
            href="#roadmap" 
            className="inline-flex items-center gap-2 bg-on-dark/10 hover:bg-on-dark/20 text-on-dark border border-on-dark/20 px-8 py-3.5 rounded-full text-sm font-semibold transition-all"
          >
            See the roadmap →
          </a>
        </div>
      </section>



      {/* 5. ROADMAP TIMELINE */}
      <section className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12 py-24 max-w-6xl mx-auto px-6 md:px-12 w-full" id="roadmap">
        <h2 className="text-2xl md:text-3xl font-black font-archivo leading-tight text-text-primary">Your journey starts here.</h2>
        <div className="flex flex-col">
          {ROADMAP_STEPS.map((step, idx) => (
            <div 
              key={idx} 
              onClick={() => setActiveRoadmapStep(idx)}
              className="list-row hover:bg-bg-surface-hover/50 cursor-pointer transition-colors px-4 -mx-4 rounded-xl"
            >
              <span className="font-semibold text-sm md:text-base text-text-primary">{step.subtitle}</span>
              <span className="text-xs text-text-secondary font-mono tracking-wider">Step {step.step}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="py-24 max-w-4xl mx-auto px-6 md:px-12 w-full border-t border-border-brand/40" id="faq">
        <h2 className="text-2xl md:text-3xl font-black font-archivo mb-12 tracking-tight text-text-primary text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx} 
                className="border border-border-brand/60 rounded-xl overflow-hidden bg-bg-surface transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full py-5 px-6 flex items-center justify-between text-left font-archivo font-bold text-sm md:text-base text-text-primary hover:bg-bg-surface-hover/30 transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  <span className="text-accent-primary font-mono text-lg">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-text-secondary serif leading-relaxed border-t border-border-brand/20 bg-bg-canvas/20">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-ink dark:bg-[#0F1012] text-on-dark py-16 w-full" id="community">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-line-dark pb-8 mb-10 gap-4">
            <div 
              onClick={() => router.push('/')}
              className="bg-white px-4 py-2 rounded-xl border border-border-brand/20 shadow-sm h-12 flex items-center justify-center cursor-pointer select-none hover:opacity-90 transition-opacity w-fit"
            >
              <img src="/logo_full.png" alt="Sena Academy Logo" className="h-7 object-contain" />
            </div>

          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-on-dark font-bold">Program</h4>
              <a href="#roadmap" className="block text-xs text-on-dark-soft hover:text-on-dark transition-colors">Roadmap</a>
              <a href="#" className="block text-xs text-on-dark-soft hover:text-on-dark transition-colors">Curriculum</a>
              <a href="#" className="block text-xs text-on-dark-soft hover:text-on-dark transition-colors">Facilitators</a>
              <a href="#" className="block text-xs text-on-dark-soft hover:text-on-dark transition-colors">Founding Builder</a>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-on-dark font-bold">Community</h4>
              <a href="https://chat.whatsapp.com/sena" target="_blank" rel="noopener noreferrer" className="block text-xs text-on-dark-soft hover:text-on-dark transition-colors inline-flex items-center gap-1">
                WhatsApp workspace <ExternalLink className="h-3 w-3" />
              </a>
              <a href="/events" className="block text-xs text-on-dark-soft hover:text-on-dark transition-colors">Events</a>
              <a href="#" className="block text-xs text-on-dark-soft hover:text-on-dark transition-colors">Alumni network</a>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-on-dark font-bold">Resources</h4>
              <a href="mailto:support@senaacademy.org" className="block text-xs text-on-dark-soft hover:text-on-dark transition-colors">Support</a>
              <button onClick={() => openModalAt('redeem_code')} className="block text-xs text-on-dark-soft hover:text-on-dark transition-colors text-left bg-transparent border-none cursor-pointer">
                Redeem access code
              </button>
              <a href="#" className="block text-xs text-on-dark-soft hover:text-on-dark transition-colors">Blog</a>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-on-dark font-bold">Legal</h4>
              <a href="#" className="block text-xs text-on-dark-soft hover:text-on-dark transition-colors">Privacy policy</a>
              <a href="#" className="block text-xs text-on-dark-soft hover:text-on-dark transition-colors">Terms of service</a>
            </div>
          </div>
          <div className="text-[11px] text-on-dark-soft/50 mt-12 pt-6 border-t border-line-dark/40">
            © 2026 Sena Academy. All rights reserved.
          </div>
        </div>
      </footer>

      {/* 7. AUTH MODALS OVERLAY */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-none transition-opacity">
          <Card className="max-w-md w-full p-8 border border-border-brand bg-bg-surface relative rounded-2xl shadow-xl">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer p-1"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* TAB SELECTORS */}
            {authTab !== 'redeem_register' && (
              <div className="flex gap-4 border-b border-border-brand/40 pb-4 mb-6">
                <button
                  onClick={() => setAuthTab('login')}
                  className={`text-xs uppercase tracking-wider font-bold cursor-pointer transition-colors ${
                    authTab === 'login' ? 'text-accent-primary border-b border-accent-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthTab('redeem_code')}
                  className={`text-xs uppercase tracking-wider font-bold cursor-pointer transition-colors ${
                    authTab === 'redeem_code' ? 'text-accent-primary border-b border-accent-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Redeem Code
                </button>
              </div>
            )}

            {/* TAB CONTENTS */}
            {authTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold leading-tight text-text-primary">Welcome back</h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">Enter your credentials to claim access to your workspace.</p>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Email address"
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="Account Password"
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => setAuthTab('forgot_password')}
                    className="text-accent-primary hover:underline font-semibold cursor-pointer"
                  >
                    Forgot your password?
                  </button>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Authenticating...' : 'Sign In to Portal'}
                </Button>
              </form>
            )}

            {authTab === 'redeem_code' && (
              <form onSubmit={handleVerifyCodeSubmit} className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold leading-tight text-text-primary">Redeem Access Code</h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Enter the alphanumeric reference code received via email to activate your account.
                  </p>
                </div>

                <Input
                  label="Access Code"
                  id="accessCode"
                  placeholder="SENA-XXXX-XXXX"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required
                />

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Verifying Code...' : 'Verify Reference Code'}
                </Button>
              </form>
            )}

            {authTab === 'redeem_register' && (
              <form onSubmit={handleRedeemRegisterSubmit} className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold leading-tight text-text-primary">Claim Your Account</h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Access verified for <span className="font-semibold text-accent-primary">{validatedCodeData?.email}</span>. Configure your details below.
                  </p>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    id="studentName"
                    placeholder="Jane Doe"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                  />
                  <Input
                    label="Configure Password"
                    id="studentPassword"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Creating Profile...' : 'Complete Profile Setup'}
                </Button>
              </form>
            )}

            {authTab === 'forgot_password' && (
              <form onSubmit={handleResetSubmit} className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold leading-tight text-text-primary">Request Password Reset</h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Admins will review your account reset ticket and email you a password recovery link.
                  </p>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Email address"
                    id="resetEmail"
                    type="email"
                    placeholder="name@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="Optional message/reason"
                    id="resetMessage"
                    placeholder="Explain why you need a reset..."
                    value={resetMessage}
                    onChange={(e) => setResetMessage(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setAuthTab('login')}
                  >
                    Back to Login
                  </Button>
                  <Button type="submit" className="flex-1" disabled={submittingReset}>
                    {submittingReset ? 'Logging Ticket...' : 'Log Reset Ticket'}
                  </Button>
                </div>
              </form>
            )}

          </Card>
        </div>
      )}

      {/* 8. ROADMAP STEP EXPLANATION MODAL */}
      {activeRoadmapStep !== null && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-none transition-opacity">
          <Card className="max-w-md w-full p-8 border border-border-brand bg-bg-surface relative rounded-2xl shadow-xl space-y-6 text-left">
            <button
              onClick={() => setActiveRoadmapStep(null)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer p-1 animate-fade-in"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-wider text-text-secondary uppercase">Step {ROADMAP_STEPS[activeRoadmapStep].step} Stage</span>
              <h3 className="text-xl font-bold font-archivo text-text-primary">{ROADMAP_STEPS[activeRoadmapStep].title}</h3>
            </div>

            <p className="serif text-sm leading-relaxed text-text-secondary">
              {ROADMAP_STEPS[activeRoadmapStep].desc}
            </p>

            <div className="space-y-2 border-t border-border-brand/40 pt-4">
              <span className="text-[10px] font-mono tracking-wider text-text-secondary uppercase">Associated Actions</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {ROADMAP_STEPS[activeRoadmapStep].verbs.map((verb, vIdx) => (
                  <span 
                    key={vIdx}
                    className="px-3 py-1 rounded-full border border-border-brand text-xs font-semibold text-text-primary bg-bg-canvas"
                  >
                    {verb}
                  </span>
                ))}
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={() => setActiveRoadmapStep(null)}
            >
              Dismiss
            </Button>
          </Card>
        </div>
      )}

    </div>
  );
}

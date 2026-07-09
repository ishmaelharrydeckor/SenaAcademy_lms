'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LoadingScreen } from '@/components/UI';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileSpreadsheet,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import Link from 'next/link';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ThemeProvider>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Gating access
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/');
      } else if (profile && profile.role !== 'admin') {
        if (profile.role === 'facilitator') router.push('/facilitator');
        else router.push('/student');
      }
    }
  }, [user, profile, loading, router]);

  if (loading || !user || !profile || profile.role !== 'admin') {
    return <LoadingScreen message="Verifying Admin Access..." />;
  }

  const navLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  ];

  return (
    <div className={`min-h-screen flex bg-bg-canvas text-text-primary relative transition-colors duration-250 ${theme}`}>
      {/* Background highlight */}
      {theme === 'dark' && (
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border-brand bg-bg-surface p-6 justify-between shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? (
              <>
                <div className="h-8 w-8 rounded-lg bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm">
                  <img src="/logo_icon.jpg" alt="Sena Logo Icon" className="h-full w-full object-contain" />
                </div>
                <span className="text-sm font-bold tracking-tight text-white uppercase">SENA ADMIN</span>
              </>
            ) : (
              <img src="/logo_full.jpg" alt="Sena Academy Logo" className="h-8 md:h-9 object-contain" />
            )}
          </div>

          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'bg-bg-surface-hover text-text-primary border-l-2 border-l-accent-primary font-semibold shadow-inner'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover/30'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${active ? 'text-accent-primary' : 'text-text-secondary'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4 pt-6 border-t border-border-brand">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-bg-surface-hover border border-border-brand flex items-center justify-center text-xs font-semibold text-text-primary">
              {profile.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">{profile.full_name}</p>
              <p className="text-[10px] text-text-secondary truncate">{profile.email}</p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-3.5 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-red-500 hover:bg-red-500/5 transition-all duration-150"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Mobile menu drawer */}
          <div className="relative flex flex-col w-64 max-w-xs bg-bg-surface border-r border-border-brand p-6 justify-between z-10 animate-fade-in">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
                    <img src="/logo_icon.jpg" alt="Sena Logo Icon" className="h-full w-full object-contain" />
                  </div>
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Admin Portal</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-text-secondary hover:text-text-primary">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                        active
                          ? 'bg-bg-surface-hover text-text-primary border-l-2 border-l-accent-primary'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover/30'
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 ${active ? 'text-accent-primary' : 'text-text-secondary'}`} />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-4 pt-6 border-t border-border-brand">
              <div className="flex items-center gap-3 px-2">
                <div className="h-8 w-8 rounded-full bg-bg-surface-hover border border-border-brand flex items-center justify-center text-xs font-semibold text-text-primary">
                  {profile.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text-primary truncate">{profile.full_name}</p>
                  <p className="text-[10px] text-text-secondary truncate">{profile.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="flex items-center gap-3 w-full px-3.5 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-red-500 hover:bg-red-500/5 transition-all duration-150"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-border-brand flex items-center justify-between px-6 bg-bg-canvas/80 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-text-secondary hover:text-text-primary"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs font-mono text-text-secondary">Control Center</span>
              <span className="text-text-secondary/40">/</span>
              <span className="text-xs text-text-primary capitalize">{pathname.split('/').pop() || 'Dashboard'}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}

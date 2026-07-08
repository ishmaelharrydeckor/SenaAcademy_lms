'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LoadingScreen } from '@/components/UI';
import { useRouter, usePathname } from 'next/navigation';
import {
  GraduationCap,
  Shield,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Role Gating
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/');
      } else if (profile && profile.role !== 'admin') {
        router.push('/student');
      }
    }
  }, [user, profile, loading, router]);

  if (loading || !user || !profile || profile.role !== 'admin') {
    return <LoadingScreen message="Gating Admin Control Area..." />;
  }

  const navLinks = [
    { name: 'Admin Dashboard', href: '/admin', icon: Shield },
  ];

  return (
    <div className="min-h-screen flex bg-brand-bg text-zinc-100 relative">
      {/* Dynamic background highlight */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary-blue/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-brand-border bg-brand-bg p-6 justify-between shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm">
              <img src="/logo_icon.jpg" alt="Sena Logo Icon" className="h-full w-full object-contain" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">SENA ADMIN</span>
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
                      ? 'bg-zinc-900 text-white border-l-2 border-l-primary-blue shadow-inner'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${active ? 'text-primary-blue' : 'text-zinc-500'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4 pt-6 border-t border-zinc-900">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-300">
              {profile.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-200 truncate">{profile.full_name}</p>
              <p className="text-[10px] text-zinc-500 truncate">{profile.email}</p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150"
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
          <div className="relative flex flex-col w-64 max-w-xs bg-brand-bg border-r border-brand-border p-6 justify-between z-10 animate-fade-in">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
                    <img src="/logo_icon.jpg" alt="Sena Logo Icon" className="h-full w-full object-contain" />
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Admin Portal</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white">
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
                          ? 'bg-zinc-900 text-white border-l-2 border-l-primary-blue'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 ${active ? 'text-primary-blue' : 'text-zinc-500'}`} />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-4 pt-6 border-t border-zinc-900">
              <div className="flex items-center gap-3 px-2">
                <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-300">
                  {profile.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-200 truncate">{profile.full_name}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{profile.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="flex items-center gap-3 w-full px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-brand-border flex items-center justify-between px-6 bg-brand-bg/85 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-zinc-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-500">Control Center</span>
              <span className="text-zinc-700">/</span>
              <span className="text-xs text-zinc-300 capitalize">{pathname.split('/').pop() || 'Dashboard'}</span>
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

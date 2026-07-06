'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { LoadingScreen, Button } from '@/components/UI';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  History,
  Bell,
  LogOut,
  Menu,
  X,
  GraduationCap,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Role Gating
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/');
      } else if (profile && profile.role !== 'student') {
        // Redirect non-students to their respective dashboards
        if (profile.role === 'admin') router.push('/admin');
        else if (profile.role === 'facilitator') router.push('/facilitator');
      }
    }
  }, [user, profile, loading, router]);

  if (loading || !user || !profile || profile.role !== 'student') {
    return <LoadingScreen message="Gating Student Area..." />;
  }

  const navLinks = [
    { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { name: 'Course Modules', href: '/student/modules', icon: BookOpen },
    { name: 'Project History', href: '/student/history', icon: History },
  ];

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-100 relative">
      {/* Background radial highlights */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary-blue/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-900 bg-zinc-950 p-6 justify-between shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary-blue to-supporting-purple flex items-center justify-center">
              <GraduationCap className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">SENA STUDENT</span>
          </div>

          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href || (link.href !== '/student' && pathname.startsWith(link.href));
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

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Drawer content */}
          <div className="relative flex flex-col w-64 max-w-xs bg-zinc-950 border-r border-zinc-900 p-6 justify-between z-10 animate-fade-in">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-primary-blue to-supporting-purple flex items-center justify-center">
                    <GraduationCap className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Student Portal</span>
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

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar header */}
        <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-zinc-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-500">Student Space</span>
              <span className="text-zinc-700">/</span>
              <span className="text-xs text-zinc-300 capitalize">{pathname.split('/').pop() || 'Dashboard'}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Realtime Notifications Trigger Button */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary-blue ring-2 ring-zinc-950 animate-pulse"></span>
              )}
            </button>
          </div>
        </header>

        {/* Dynamic Inner Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>

      {/* In-App Real-time Notifications Drawer (Right Overlay) */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay background */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setNotificationsOpen(false)}
          ></div>

          {/* Slider Panel */}
          <div className="relative w-full max-w-md bg-zinc-950 border-l border-zinc-900 flex flex-col justify-between h-full z-10 animate-fade-in shadow-2xl">
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/40">
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">Notifications</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Manage your updates and project grades.</p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-[10px] text-primary-blue hover:underline font-semibold"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-900"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {notifications.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center">
                    <Bell className="h-8 w-8 text-zinc-700 stroke-[1.5] mb-2" />
                    <p className="text-xs text-zinc-500">You are all caught up.</p>
                    <p className="text-[10px] text-zinc-600 mt-1">No alerts or grades received yet.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (!notif.is_read) markAsRead(notif.id);
                        if (notif.link) {
                          setNotificationsOpen(false);
                          router.push(notif.link);
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                        notif.is_read
                          ? 'border-zinc-900 bg-zinc-950/20 text-zinc-400 hover:bg-zinc-900/10'
                          : 'border-zinc-800 bg-zinc-900/20 text-zinc-100 hover:bg-zinc-900/40 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className={`text-xs font-semibold ${notif.is_read ? 'text-zinc-300' : 'text-zinc-100'}`}>
                            {notif.title}
                          </h4>
                          <p className="text-[11px] leading-relaxed text-zinc-400">{notif.message}</p>
                          <span className="text-[9px] font-mono text-zinc-600 block mt-1">
                            {new Date(notif.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {!notif.is_read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary-blue mt-1 shrink-0"></span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

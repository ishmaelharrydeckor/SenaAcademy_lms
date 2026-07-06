'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNotifications } from '@/context/NotificationContext';
import { Card, Button, Input } from '@/components/UI';
import {
  Users,
  BookOpen,
  KeyRound,
  Megaphone,
  Plus,
  Trash,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Sparkles,
  GraduationCap,
  CreditCard,
} from 'lucide-react';

interface Cohort {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  max_students: number;
  status: 'upcoming' | 'active' | 'completed';
}

interface Module {
  id: string;
  module_number: number;
  title: string;
  description: string;
  learning_outcomes: string[];
  objectives: string[];
  resources: Array<{ name: string; url: string; category: string }>;
  assignment_title: string;
  assignment_description: string;
  assignment_deadline: string;
  assignment_rubric: Array<{ criteria: string; max_points: number }>;
  unlock_date: string;
  is_visible: boolean;
}

interface AccessCode {
  code: string;
  assigned_email: string;
  cohort_id: string;
  role: string;
  status: 'unused' | 'redeemed' | 'expired' | 'revoked';
  expires_at: string;
  created_at: string;
  redeemed_at: string | null;
  cohort_name?: string;
}

export default function AdminPage() {
  const { showToast } = useNotifications();
  
  // Tab states: 'cohorts' | 'students' | 'modules' | 'codes' | 'payments' | 'announcements'
  const [activeTab, setActiveTab] = useState<'cohorts' | 'students' | 'modules' | 'codes' | 'payments' | 'announcements'>('cohorts');

  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Student directory filters
  const [studentSearch, setStudentSearch] = useState('');
  const [studentCohortFilter, setStudentCohortFilter] = useState('');

  // Fallback verify payment reference states
  const [verifyingRef, setVerifyingRef] = useState('');
  const [verifyingRefLoading, setVerifyingRefLoading] = useState(false);

  // --- FORM STATES ---
  // Cohort Form
  const [cohortName, setCohortName] = useState('');
  const [cohortStart, setCohortStart] = useState('');
  const [cohortEnd, setCohortEnd] = useState('');
  const [cohortMax, setCohortMax] = useState('30');
  const [cohortStatus, setCohortStatus] = useState<'upcoming' | 'active' | 'completed'>('upcoming');

  // Module Form
  const [modNum, setModNum] = useState('');
  const [modTitle, setModTitle] = useState('');
  const [modDesc, setModDesc] = useState('');
  const [modObjective, setModObjective] = useState('');
  const [modObjectivesList, setModObjectivesList] = useState<string[]>([]);
  const [modOutcome, setModOutcome] = useState('');
  const [modOutcomesList, setModOutcomesList] = useState<string[]>([]);
  
  const [modResName, setModResName] = useState('');
  const [modResUrl, setModResUrl] = useState('');
  const [modResCategory, setModResCategory] = useState('slide');
  const [modResourcesList, setModResourcesList] = useState<Array<{ name: string; url: string; category: string }>>([]);

  const [modAssignTitle, setModAssignTitle] = useState('');
  const [modAssignDesc, setModAssignDesc] = useState('');
  const [modAssignDeadline, setModAssignDeadline] = useState('');
  const [modUnlockDate, setModUnlockDate] = useState('');
  const [modVisible, setModVisible] = useState(false);
  
  const [rubricCrit, setRubricCrit] = useState('');
  const [rubricMax, setRubricMax] = useState('25');
  const [modRubricList, setModRubricList] = useState<Array<{ criteria: string; max_points: number }>>([]);

  // Access Code Form
  const [codeEmail, setCodeEmail] = useState('');
  const [codeCohortId, setCodeCohortId] = useState('');
  const [codeExpiry, setCodeExpiry] = useState('');
  const [bulkCsv, setBulkCsv] = useState('');

  // Announcement Form
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [announceCohortId, setAnnounceCohortId] = useState(''); // empty = global

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch cohorts
      const { data: cohortData } = await supabase.from('cohorts').select('*').order('created_at', { ascending: false });
      if (cohortData) setCohorts(cohortData as Cohort[]);

      // Fetch modules
      const { data: moduleData } = await supabase.from('modules').select('*').order('module_number', { ascending: true });
      if (moduleData) setModules(moduleData as Module[]);

      // Fetch access codes
      const { data: codeData } = await supabase.from('access_codes').select('*').order('created_at', { ascending: false });
      if (codeData) setCodes(codeData as AccessCode[]);

      // Fetch student profiles
      const { data: studentData } = await supabase
        .from('profiles')
        .select(`
          *,
          cohorts:cohort_id (
            name
          )
        `)
        .eq('role', 'student')
        .order('created_at', { ascending: false });
      if (studentData) setStudents(studentData);

      // Fetch Paystack payments log
      const { data: paymentData } = await supabase
        .from('payments')
        .select(`
          *,
          cohorts:cohort_id (
            name
          )
        `)
        .order('created_at', { ascending: false });
      if (paymentData) setPayments(paymentData);

    } catch (err: any) {
      showToast('Error', 'Failed to retrieve admin details: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- SUBMISSIONS ---

  // Cohort creation
  const handleCohortSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cohortName || !cohortStart || !cohortEnd || !cohortMax) return;

    setActionLoading(true);
    try {
      const { error } = await supabase.from('cohorts').insert([
        {
          name: cohortName,
          start_date: cohortStart,
          end_date: cohortEnd,
          max_students: parseInt(cohortMax),
          status: cohortStatus,
        },
      ]);

      if (error) throw error;
      showToast('Cohort Created', `Successfully initialized ${cohortName}`, 'success');
      
      // Reset form
      setCohortName('');
      setCohortStart('');
      setCohortEnd('');
      setCohortMax('30');
      setCohortStatus('upcoming');
      
      await fetchInitialData();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Module creation
  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modNum || !modTitle || !modDesc || !modAssignTitle || !modAssignDesc || !modAssignDeadline || !modUnlockDate) {
      showToast('Form Error', 'Please satisfy all required fields.', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase.from('modules').insert([
        {
          module_number: parseInt(modNum),
          title: modTitle,
          description: modDesc,
          learning_outcomes: modOutcomesList,
          objectives: modObjectivesList,
          resources: modResourcesList,
          assignment_title: modAssignTitle,
          assignment_description: modAssignDesc,
          assignment_deadline: modAssignDeadline,
          assignment_rubric: modRubricList,
          unlock_date: modUnlockDate,
          is_visible: modVisible,
        },
      ]);

      if (error) throw error;
      showToast('Module Created', `Curriculum Module ${modNum} published.`, 'success');
      
      // Reset form fields
      setModNum('');
      setModTitle('');
      setModDesc('');
      setModObjectivesList([]);
      setModOutcomesList([]);
      setModResourcesList([]);
      setModAssignTitle('');
      setModAssignDesc('');
      setModAssignDeadline('');
      setModUnlockDate('');
      setModVisible(false);
      setModRubricList([]);

      await fetchInitialData();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Access Code Generation
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeEmail || !codeCohortId || !codeExpiry) {
      showToast('Form Error', 'Fill all access code fields.', 'warning');
      return;
    }

    // Generate simple random access code
    const generatedCode = 'SENA-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    setActionLoading(true);
    try {
      const { error } = await supabase.from('access_codes').insert([
        {
          code: generatedCode,
          assigned_email: codeEmail,
          cohort_id: codeCohortId,
          role: 'student',
          status: 'unused',
          expires_at: codeExpiry,
        },
      ]);

      if (error) throw error;
      showToast('Code Generated', `Code: ${generatedCode} assigned to ${codeEmail}`, 'success');
      
      setCodeEmail('');
      setCodeExpiry('');
      
      await fetchInitialData();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk CSV Access Code Generation
  const handleBulkCodesSubmit = async (csvText: string, defaultCohortId: string, defaultExpiry: string) => {
    if (!csvText.trim()) {
      showToast('Form Error', 'Please paste CSV content.', 'warning');
      return;
    }

    const lines = csvText.split('\n');
    const codesToInsert = [];
    const makeCode = () => 'SENA-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      
      const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length === 0) continue;
      
      let email = '';
      let cohortId = defaultCohortId;
      let expiry = defaultExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      if (parts.length === 1) {
        email = parts[0];
      } else if (parts.length === 2) {
        email = parts[1];
      } else {
        email = parts[1];
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(parts[2]);
        if (isUuid) {
          cohortId = parts[2];
        } else {
          const found = cohorts.find(c => c.name.toLowerCase() === parts[2].toLowerCase());
          if (found) cohortId = found.id;
        }
      }

      if (!email.includes('@')) continue;

      codesToInsert.push({
        code: makeCode(),
        assigned_email: email,
        cohort_id: cohortId || null,
        role: 'student',
        status: 'unused',
        expires_at: expiry,
      });
    }

    if (codesToInsert.length === 0) {
      showToast('Import Failed', 'No valid email rows parsed from CSV.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase.from('access_codes').insert(codesToInsert);
      if (error) throw error;
      showToast('Import Success', `Successfully imported ${codesToInsert.length} access codes!`, 'success');
      setBulkCsv('');
      await fetchInitialData();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Manual payment verification fallback
  const handleManualVerifyPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingRef.trim()) {
      showToast('Error', 'Please enter a transaction reference number.', 'warning');
      return;
    }

    setVerifyingRefLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('You must be logged in to verify transactions.');

      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reference: verifyingRef.trim() }),
      });

      const result = await res.json();
      if (!res.ok) {
        showToast('Verification Failed', result.error || 'Failed to verify transaction.', 'error');
      } else {
        showToast('Success', result.message || 'Payment verified and code generated.', 'success');
        setVerifyingRef('');
        await fetchInitialData();
      }
    } catch (err: any) {
      showToast('Error', err.message || 'An unexpected error occurred.', 'error');
    } finally {
      setVerifyingRefLoading(false);
    }
  };

  // Revoke Access Code
  const handleRevokeCode = async (code: string) => {
    try {
      const { error } = await supabase
        .from('access_codes')
        .update({ status: 'revoked' })
        .eq('code', code);

      if (error) throw error;
      showToast('Code Revoked', `Access code ${code} has been deactivated.`, 'warning');
      await fetchInitialData();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  // Announcement publisher
  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceTitle || !announceContent) return;

    setActionLoading(true);
    try {
      // 1. Insert announcement
      const { data: ann, error: annError } = await supabase.from('announcements').insert([
        {
          title: announceTitle,
          content: announceContent,
          cohort_id: announceCohortId || null,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        },
      ]).select().single();

      if (annError) throw annError;

      // 2. Fetch profiles target to alert
      let profilesQuery = supabase.from('profiles').select('id');
      if (announceCohortId) {
        profilesQuery = profilesQuery.eq('cohort_id', announceCohortId);
      }
      const { data: targetUsers } = await profilesQuery;

      // 3. Create real-time notification records
      if (targetUsers && targetUsers.length > 0) {
        const notifPayload = targetUsers.map((profileRow) => ({
          user_id: profileRow.id,
          title: `Announcement: ${announceTitle}`,
          message: announceContent.length > 100 ? `${announceContent.substring(0, 100)}...` : announceContent,
          link: '/student',
        }));

        await supabase.from('notifications').insert(notifPayload);
      }

      showToast('Announcement Published', 'System announcement dispatched in real-time.', 'success');
      
      setAnnounceTitle('');
      setAnnounceContent('');
      setAnnounceCohortId('');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <div className="relative w-8 h-8 border-2 border-zinc-800 rounded-full">
          <div className="absolute w-8 h-8 border-2 border-t-primary-blue border-r-supporting-purple rounded-full animate-spin"></div>
        </div>
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Loading control panels...</p>
      </div>
    );
  }

  const tabs = [
    { name: 'cohorts', label: 'Cohorts', icon: Users },
    { name: 'students', label: 'Students', icon: GraduationCap },
    { name: 'modules', label: 'Modules', icon: BookOpen },
    { name: 'codes', label: 'Access Codes', icon: KeyRound },
    { name: 'payments', label: 'Payments', icon: CreditCard },
    { name: 'announcements', label: 'Announcements', icon: Megaphone },
  ];

  return (
    <div className="space-y-8">
      {/* Admin header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-900">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Admin Control Center</h2>
          <p className="text-xs text-zinc-500 mt-1">Manage cohorts, curriculum modules, student access keys, and system alerts.</p>
        </div>
      </div>

      {/* Settings tab bar */}
      <div className="flex border-b border-zinc-900 gap-1 pb-[1px] overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name as any)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold select-none border-b-2 transition-all ${
                active
                  ? 'border-primary-blue text-white bg-zinc-900/10'
                  : 'border-transparent text-zinc-550 hover:text-zinc-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* --- COHORTS TAB PANEL --- */}
      {activeTab === 'cohorts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Create Form */}
          <div className="lg:col-span-1">
            <Card className="space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">Initialize Cohort</span>
              <form onSubmit={handleCohortSubmit} className="space-y-4">
                <Input
                  label="Cohort Name"
                  id="c-name"
                  placeholder="e.g., Founding Cohort"
                  value={cohortName}
                  onChange={(e) => setCohortName(e.target.value)}
                  required
                />
                <Input
                  label="Start Date"
                  id="c-start"
                  type="date"
                  value={cohortStart}
                  onChange={(e) => setCohortStart(e.target.value)}
                  required
                />
                <Input
                  label="End Date"
                  id="c-end"
                  type="date"
                  value={cohortEnd}
                  onChange={(e) => setCohortEnd(e.target.value)}
                  required
                />
                <Input
                  label="Max Capacity"
                  id="c-max"
                  type="number"
                  value={cohortMax}
                  onChange={(e) => setCohortMax(e.target.value)}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-400">Initial Status</label>
                  <select
                    value={cohortStatus}
                    onChange={(e: any) => setCohortStatus(e.target.value)}
                    className="glass-input text-xs text-zinc-100 rounded-lg p-2.5 w-full bg-zinc-950"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <Button type="submit" className="w-full text-xs" disabled={actionLoading}>
                  Create Cohort
                </Button>
              </form>
            </Card>
          </div>

          {/* List panel */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Registry</h3>
            <div className="grid grid-cols-1 gap-3">
              {cohorts.map((c) => (
                <div key={c.id} className="glass-panel p-5 rounded-xl border border-zinc-900 flex justify-between items-center">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-zinc-100">{c.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      Capacity: {c.max_students} Students • {new Date(c.start_date).toLocaleDateString()} - {new Date(c.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                    c.status === 'active'
                      ? 'bg-success-green/10 text-success-green'
                      : c.status === 'completed'
                      ? 'bg-zinc-800 text-zinc-400'
                      : 'bg-primary-blue/10 text-primary-blue'
                  }`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- STUDENTS TAB PANEL --- */}
      {activeTab === 'students' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 self-start md:self-auto">Student Directory</h3>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="glass-input text-xs text-zinc-100 rounded-lg px-4 py-2 w-full sm:w-64 bg-zinc-950/60"
              />

              <select
                value={studentCohortFilter}
                onChange={(e) => setStudentCohortFilter(e.target.value)}
                className="glass-input text-xs text-zinc-100 rounded-lg px-3 py-2 w-full sm:w-48 bg-zinc-950"
              >
                <option value="">All Cohorts</option>
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(() => {
            const filtered = students.filter((s) => {
              const matchesSearch = 
                s.full_name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
                s.email?.toLowerCase().includes(studentSearch.toLowerCase());
              const matchesCohort = !studentCohortFilter || s.cohort_id === studentCohortFilter;
              return matchesSearch && matchesCohort;
            });

            if (filtered.length === 0) {
              return (
                <Card className="text-center py-16">
                  <Users className="h-9 w-9 text-zinc-800 stroke-[1.5] mx-auto mb-2" />
                  <p className="text-xs text-zinc-500">No students found matching your filters.</p>
                </Card>
              );
            }

            return (
              <div className="glass-panel rounded-xl border border-zinc-900 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-950/40 text-zinc-500 font-mono">
                      <th className="p-4">Full Name</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">Cohort</th>
                      <th className="p-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60">
                    {filtered.map((student) => (
                      <tr key={student.id} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="p-4 font-semibold text-zinc-200">{student.full_name}</td>
                        <td className="p-4 text-zinc-400 font-mono">{student.email}</td>
                        <td className="p-4 text-zinc-400">{student.cohorts?.name || 'Unassigned'}</td>
                        <td className="p-4 text-zinc-500">
                          {new Date(student.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* --- MODULES TAB PANEL --- */}
      {activeTab === 'modules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Create Form */}
          <div className="lg:col-span-1">
            <Card className="space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">Create Module</span>
              <form onSubmit={handleModuleSubmit} className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                <Input
                  label="Module Number"
                  id="m-num"
                  type="number"
                  placeholder="e.g. 1"
                  value={modNum}
                  onChange={(e) => setModNum(e.target.value)}
                  required
                />
                <Input
                  label="Module Title"
                  id="m-title"
                  placeholder="e.g. Building Responsive Layouts"
                  value={modTitle}
                  onChange={(e) => setModTitle(e.target.value)}
                  required
                />
                <Input
                  label="Module Description"
                  id="m-desc"
                  placeholder="General description of what this module covers..."
                  value={modDesc}
                  onChange={(e) => setModDesc(e.target.value)}
                  required
                />

                {/* Objectives list builder */}
                <div className="border-t border-zinc-900 pt-3 space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Objectives list</label>
                  <div className="flex gap-2">
                    <Input
                      id="m-obj-add"
                      placeholder="Add learning objective..."
                      value={modObjective}
                      onChange={(e) => setModObjective(e.target.value)}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (modObjective) {
                          setModObjectivesList([...modObjectivesList, modObjective]);
                          setModObjective('');
                        }
                      }}
                      className="mt-0.5"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <ul className="space-y-1.5 text-xs text-zinc-400">
                    {modObjectivesList.map((obj, i) => (
                      <li key={i} className="flex justify-between items-center bg-zinc-950 p-2 rounded border border-zinc-900">
                        <span className="truncate max-w-[200px]">{obj}</span>
                        <button
                          type="button"
                          onClick={() => setModObjectivesList(modObjectivesList.filter((_, idx) => idx !== i))}
                          className="text-zinc-650 hover:text-red-400"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Outcomes list builder */}
                <div className="border-t border-zinc-900 pt-3 space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Outcomes list</label>
                  <div className="flex gap-2">
                    <Input
                      id="m-out-add"
                      placeholder="Add learning outcome..."
                      value={modOutcome}
                      onChange={(e) => setModOutcome(e.target.value)}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (modOutcome) {
                          setModOutcomesList([...modOutcomesList, modOutcome]);
                          setModOutcome('');
                        }
                      }}
                      className="mt-0.5"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <ul className="space-y-1.5 text-xs text-zinc-400">
                    {modOutcomesList.map((out, i) => (
                      <li key={i} className="flex justify-between items-center bg-zinc-950 p-2 rounded border border-zinc-900">
                        <span className="truncate max-w-[200px]">{out}</span>
                        <button
                          type="button"
                          onClick={() => setModOutcomesList(modOutcomesList.filter((_, idx) => idx !== i))}
                          className="text-zinc-650 hover:text-red-400"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Rubric builder */}
                <div className="border-t border-zinc-900 pt-3 space-y-2">
                  <label className="text-xs font-semibold text-zinc-300">Grading Rubric criteria</label>
                  <div className="flex gap-2 items-end">
                    <Input
                      id="r-crit"
                      placeholder="e.g. Design"
                      value={rubricCrit}
                      onChange={(e) => setRubricCrit(e.target.value)}
                    />
                    <Input
                      id="r-max"
                      type="number"
                      placeholder="25"
                      value={rubricMax}
                      onChange={(e) => setRubricMax(e.target.value)}
                      className="w-20"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (rubricCrit && rubricMax) {
                          setModRubricList([...modRubricList, { criteria: rubricCrit, max_points: parseInt(rubricMax) }]);
                          setRubricCrit('');
                          setRubricMax('25');
                        }
                      }}
                      className="shrink-0 mb-0.5"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <ul className="space-y-1.5 text-xs text-zinc-400">
                    {modRubricList.map((rub, i) => (
                      <li key={i} className="flex justify-between items-center bg-zinc-950 p-2 rounded border border-zinc-900">
                        <span>{rub.criteria} ({rub.max_points} pts)</span>
                        <button
                          type="button"
                          onClick={() => setModRubricList(modRubricList.filter((_, idx) => idx !== i))}
                          className="text-zinc-650 hover:text-red-400"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Assignment settings */}
                <div className="border-t border-zinc-900 pt-3 space-y-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">Assignment details</span>
                  <Input
                    label="Assignment Name"
                    id="m-a-title"
                    placeholder="e.g. Portfolio Build"
                    value={modAssignTitle}
                    onChange={(e) => setModAssignTitle(e.target.value)}
                    required
                  />
                  <Input
                    label="Assignment Requirements"
                    id="m-a-desc"
                    placeholder="Document detailing requirements..."
                    value={modAssignDesc}
                    onChange={(e) => setModAssignDesc(e.target.value)}
                    required
                  />
                  <Input
                    label="Submission Deadline"
                    id="m-a-due"
                    type="datetime-local"
                    value={modAssignDeadline}
                    onChange={(e) => setModAssignDeadline(e.target.value)}
                    required
                  />
                </div>

                {/* Unlock date & Visibility */}
                <div className="border-t border-zinc-900 pt-3 space-y-4">
                  <Input
                    label="Unlock date"
                    id="m-unlock"
                    type="datetime-local"
                    value={modUnlockDate}
                    onChange={(e) => setModUnlockDate(e.target.value)}
                    required
                  />

                  <div className="flex items-center gap-2.5 select-none cursor-pointer text-xs font-semibold text-zinc-300">
                    <input
                      type="checkbox"
                      id="m-vis"
                      checked={modVisible}
                      onChange={(e) => setModVisible(e.target.checked)}
                      className="rounded bg-zinc-900 border-zinc-800 text-primary-blue focus:ring-primary-blue"
                    />
                    <label htmlFor="m-vis" className="flex items-center gap-1.5 cursor-pointer">
                      {modVisible ? <Eye className="h-4 w-4 text-primary-blue" /> : <EyeOff className="h-4 w-4 text-zinc-600" />}
                      Visibility Enabled
                    </label>
                  </div>
                </div>

                <Button type="submit" className="w-full text-xs" disabled={actionLoading}>
                  Publish Module
                </Button>
              </form>
            </Card>
          </div>

          {/* List panel */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Modules Published</h3>
            <div className="grid grid-cols-1 gap-3">
              {modules.map((m) => (
                <div key={m.id} className="glass-panel p-5 rounded-xl border border-zinc-900 flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">Module {m.module_number}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase font-semibold ${
                        m.is_visible ? 'bg-primary-blue/10 text-primary-blue' : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        {m.is_visible ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-zinc-100">{m.title}</h4>
                    <p className="text-[10px] text-zinc-500">
                      Rubric Criteria: {m.assignment_rubric.map((r) => r.criteria).join(', ') || 'None'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- ACCESS CODES TAB PANEL --- */}
      {activeTab === 'codes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Create Form */}
          <div className="lg:col-span-1">
            <Card className="space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">Generate Access Code</span>
              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <Input
                  label="Student Email Address"
                  id="ac-email"
                  type="email"
                  placeholder="student@domain.com"
                  value={codeEmail}
                  onChange={(e) => setCodeEmail(e.target.value)}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-400">Target Cohort</label>
                  <select
                    value={codeCohortId}
                    onChange={(e) => setCodeCohortId(e.target.value)}
                    required
                    className="glass-input text-xs text-zinc-100 rounded-lg p-2.5 w-full bg-zinc-950"
                  >
                    <option value="">Select Cohort...</option>
                    {cohorts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Expiration Date"
                  id="ac-expiry"
                  type="datetime-local"
                  value={codeExpiry}
                  onChange={(e) => setCodeExpiry(e.target.value)}
                  required
                />

                <Button type="submit" className="w-full text-xs" disabled={actionLoading}>
                  Generate Code
                </Button>
              </form>
            </Card>

            <Card className="space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">CSV Bulk Import Codes</span>
              <div className="space-y-3">
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Paste CSV rows matching format:<br />
                  <code className="text-zinc-400 font-mono text-[9px]">name, email, cohort_name_or_uuid</code>
                </p>
                <textarea
                  placeholder="John Doe, john@domain.com, Founding Cohort"
                  value={bulkCsv}
                  onChange={(e) => setBulkCsv(e.target.value)}
                  className="glass-input text-xs text-zinc-100 rounded-lg p-3 w-full h-28 resize-none placeholder-zinc-650"
                />
                <Button
                  onClick={() => handleBulkCodesSubmit(bulkCsv, codeCohortId, codeExpiry)}
                  className="w-full text-xs"
                  disabled={actionLoading}
                >
                  Import Bulk Codes
                </Button>
              </div>
            </Card>
          </div>

          {/* List panel */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Access Key Registry</h3>
            <div className="overflow-x-auto glass-panel rounded-xl border border-zinc-900">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-950/40 text-zinc-500 font-mono">
                    <th className="p-4">Key Code</th>
                    <th className="p-4">Assigned Student</th>
                    <th className="p-4">Expiry Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {codes.map((k) => (
                    <tr key={k.code} className="hover:bg-zinc-900/10">
                      <td className="p-4 font-mono font-bold text-zinc-100 select-all">{k.code}</td>
                      <td className="p-4 font-mono text-zinc-400">{k.assigned_email}</td>
                      <td className="p-4 text-zinc-550">{new Date(k.expires_at).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 font-semibold uppercase px-1.5 py-0.5 rounded text-[9px] ${
                          k.status === 'unused'
                            ? 'bg-primary-blue/10 text-primary-blue'
                            : k.status === 'redeemed'
                            ? 'bg-success-green/10 text-success-green'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}>
                          {k.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {k.status === 'unused' && (
                          <button
                            onClick={() => handleRevokeCode(k.code)}
                            className="text-[10px] text-red-400 hover:text-red-300 font-bold transition-colors"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {codes.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-zinc-500 italic">No access codes generated.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- PAYMENTS TAB PANEL --- */}
      {activeTab === 'payments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Fallback Manual Verification Card */}
          <div className="lg:col-span-1">
            <Card className="space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">Verify Paystack Reference</span>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                If a student has completed their payment but the webhook failed to trigger, enter the Paystack transaction reference string below to manually verify and deliver the access code.
              </p>
              
              <form onSubmit={handleManualVerifyPayment} className="space-y-4">
                <Input
                  label="Transaction Reference String"
                  id="pay-ref"
                  placeholder="e.g. T1234567890123"
                  value={verifyingRef}
                  onChange={(e) => setVerifyingRef(e.target.value)}
                  required
                  disabled={verifyingRefLoading}
                />
                
                <Button type="submit" className="w-full text-xs" disabled={verifyingRefLoading}>
                  {verifyingRefLoading ? 'Verifying...' : 'Verify & Generate Code'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Payments list log */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Transaction History Log ({payments.length})</h3>
            
            {payments.length === 0 ? (
              <Card className="text-center py-16">
                <CreditCard className="h-9 w-9 text-zinc-800 stroke-[1.5] mx-auto mb-2" />
                <p className="text-xs text-zinc-500">No Paystack transaction records logged yet.</p>
              </Card>
            ) : (
              <div className="glass-panel rounded-xl border border-zinc-900 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-900 bg-zinc-950/40 text-zinc-550 font-mono">
                        <th className="p-4">Reference</th>
                        <th className="p-4">Student</th>
                        <th className="p-4">Cohort</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Code Sent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {payments.map((p) => {
                        const isDuplicate = payments.filter((item) => item.paystack_reference === p.paystack_reference).length > 1;
                        
                        return (
                          <tr key={p.id} className="hover:bg-zinc-900/10 transition-colors">
                            <td className="p-4 font-mono font-semibold text-zinc-300">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate max-w-[100px]">{p.paystack_reference}</span>
                                {isDuplicate && (
                                  <span className="bg-yellow-500/10 text-yellow-500 text-[9px] font-mono px-1 rounded font-bold border border-yellow-500/20">
                                    Duplicate
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="space-y-0.5">
                                <p className="font-semibold text-zinc-200">{p.full_name}</p>
                                <p className="text-[10px] text-zinc-500 font-mono">{p.email}</p>
                              </div>
                            </td>
                            <td className="p-4 text-zinc-400">{p.cohorts?.name || 'Selected Cohort'}</td>
                            <td className="p-4 font-mono text-zinc-300">
                              {p.currency} {parseFloat(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-4">
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                                p.status === 'success' ? 'bg-success-green/10 text-success-green' : 'bg-danger-red/10 text-danger-red'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                                p.access_code_generated ? 'bg-zinc-800 text-zinc-400' : 'bg-yellow-500/10 text-yellow-500'
                              }`}>
                                {p.access_code_generated ? 'Completed' : 'Pending'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- ANNOUNCEMENTS TAB PANEL --- */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Create Form */}
          <div className="lg:col-span-1">
            <Card className="space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">Broadcast Alert</span>
              <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                <Input
                  label="Announcement Title"
                  id="ann-title"
                  placeholder="e.g. Schedule Update"
                  value={announceTitle}
                  onChange={(e) => setAnnounceTitle(e.target.value)}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-zinc-400">Content / Message</label>
                  <textarea
                    placeholder="Write details of this cohort notification..."
                    value={announceContent}
                    onChange={(e) => setAnnounceContent(e.target.value)}
                    required
                    className="glass-input text-xs text-zinc-100 rounded-lg p-3 w-full h-32 resize-none placeholder-zinc-650"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-400">Broadcast Target</label>
                  <select
                    value={announceCohortId}
                    onChange={(e) => setAnnounceCohortId(e.target.value)}
                    className="glass-input text-xs text-zinc-100 rounded-lg p-2.5 w-full bg-zinc-950"
                  >
                    <option value="">Global Broadcast (All Cohorts)</option>
                    {cohorts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Button type="submit" className="w-full text-xs" disabled={actionLoading}>
                  Publish Announcement
                </Button>
              </form>
            </Card>
          </div>

          {/* List panel */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">History Log</h3>
            <div className="py-8 text-center glass-panel rounded-xl">
              <Megaphone className="h-8 w-8 text-zinc-800 stroke-[1.5] mx-auto mb-2" />
              <p className="text-xs text-zinc-500">Live announcements are dispatched instantly.</p>
              <p className="text-[10px] text-zinc-650 mt-1">Real-time socket messages notify all targeted trainee devices.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

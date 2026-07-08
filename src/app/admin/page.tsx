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
  Archive,
  FileSpreadsheet,
  Key,
  ShieldCheck,
  Mail,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface Cohort {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  max_students: number;
  status: 'upcoming' | 'active' | 'completed';
  is_archived: boolean;
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

interface PasswordResetRequest {
  id: string;
  email: string;
  message: string | null;
  status: 'pending' | 'resolved';
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export default function AdminPage() {
  const { showToast } = useNotifications();
  
  // Tab states: 'cohorts' | 'archived_cohorts' | 'students' | 'facilitators' | 'modules' | 'codes' | 'payments' | 'resets' | 'announcements' | 'settings'
  const [activeTab, setActiveTab] = useState<'cohorts' | 'archived_cohorts' | 'students' | 'facilitators' | 'modules' | 'codes' | 'payments' | 'resets' | 'announcements' | 'settings'>('cohorts');

  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [facilitators, setFacilitators] = useState<any[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Student and Facilitator filters
  const [studentSearch, setStudentSearch] = useState('');
  const [studentCohortFilter, setStudentCohortFilter] = useState('');

  // Fallback verify payment reference states
  const [verifyingRef, setVerifyingRef] = useState('');
  const [verifyingRefLoading, setVerifyingRefLoading] = useState(false);

  // General CSV export state
  const [exportTable, setExportTable] = useState('payments');
  const [exportLoading, setExportLoading] = useState(false);

  // Safe Cohort Deletion States
  const [archiveLoadingCohortId, setArchiveLoadingCohortId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cohortToDelete, setCohortToDelete] = useState<Cohort | null>(null);
  const [confirmNameInput, setConfirmNameInput] = useState('');
  const [deletingCohort, setDeletingCohort] = useState(false);

  // Facilitator account creation states
  const [facName, setFacName] = useState('');
  const [facEmail, setFacEmail] = useState('');
  const [facSubmitting, setFacSubmitting] = useState(false);

  // Password reset action state
  const [resolvingReqId, setResolvingReqId] = useState<string | null>(null);

  // Site settings state
  const [whatsappMemberCountInput, setWhatsappMemberCountInput] = useState('238');
  const [savingSettings, setSavingSettings] = useState(false);

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

      // Fetch facilitators
      const { data: facilitatorData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'facilitator')
        .order('created_at', { ascending: false });
      if (facilitatorData) setFacilitators(facilitatorData);

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

      // Fetch password reset requests
      const { data: resetReqData } = await supabase
        .from('password_reset_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (resetReqData) setResetRequests(resetReqData as PasswordResetRequest[]);

      // Fetch site settings
      try {
        const { data: settingData } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'whatsapp_member_count')
          .maybeSingle();
        if (settingData?.value) {
          setWhatsappMemberCountInput(settingData.value);
        }
      } catch (err) {
        console.warn('site_settings query warning:', err);
      }

    } catch (err: any) {
      showToast('Error', 'Failed to retrieve admin details: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportTable = async (tableName: string) => {
    setExportLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('You must be logged in to export files.');

      const res = await fetch(`/api/admin/export-csv?table=${tableName}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate export file.');
      }

      // Read as blob and trigger browser download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tableName}_export_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      showToast('Export Successful', `Data from table "${tableName}" exported successfully.`, 'success');
    } catch (err: any) {
      showToast('Export Failed', err.message || 'Could not export data.', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const handleArchiveCohort = async (cohortId: string) => {
    setArchiveLoadingCohortId(cohortId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('You must be logged in to archive cohorts.');

      const res = await fetch('/api/admin/delete-cohort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ cohortId, action: 'archive' }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to archive cohort.');
      }

      showToast('Cohort Archived', 'The cohort has been safely moved to the archive list.', 'success');
      await fetchInitialData();
    } catch (err: any) {
      showToast('Error', err.message || 'Could not archive cohort.', 'error');
    } finally {
      setArchiveLoadingCohortId(null);
    }
  };

  const handleDeleteCohortSubmit = async () => {
    if (!cohortToDelete) return;
    if (confirmNameInput !== cohortToDelete.name) {
      showToast('Validation Error', 'Cohort name does not match.', 'warning');
      return;
    }

    setDeletingCohort(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('You must be logged in to delete cohorts.');

      const res = await fetch('/api/admin/delete-cohort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ cohortId: cohortToDelete.id, action: 'delete' }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to delete cohort.');
      }

      showToast('Cohort Deleted', 'Cohort and all associated student data permanently deleted.', 'success');
      setShowDeleteConfirm(false);
      setCohortToDelete(null);
      setConfirmNameInput('');
      await fetchInitialData();
    } catch (err: any) {
      showToast('Deletion Failed', err.message || 'Could not delete cohort.', 'error');
    } finally {
      setDeletingCohort(false);
    }
  };

  const handleFacilitatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facName.trim() || !facEmail.trim()) {
      showToast('Field Error', 'Please satisfy all required fields.', 'warning');
      return;
    }

    setFacSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('You must be logged in to onboard facilitators.');

      const res = await fetch('/api/admin/create-facilitator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName: facName.trim(), email: facEmail.trim() }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to onboard facilitator.');
      }

      showToast('Facilitator Created', result.message || 'Facilitator account successfully created.', 'success');
      setFacName('');
      setFacEmail('');
      await fetchInitialData();
    } catch (err: any) {
      showToast('Onboarding Failed', err.message || 'Could not onboard facilitator.', 'error');
    } finally {
      setFacSubmitting(false);
    }
  };

  const handleSendResetLink = async (requestId: string) => {
    setResolvingReqId(requestId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('You must be logged in to send reset links.');

      const res = await fetch('/api/admin/send-reset-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to send reset link.');
      }

      showToast('Link Dispatched', 'Password reset recovery link successfully sent to student.', 'success');
      await fetchInitialData();
    } catch (err: any) {
      showToast('Action Failed', err.message || 'Could not resolve password reset request.', 'error');
    } finally {
      setResolvingReqId(null);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappMemberCountInput.trim()) {
      showToast('Validation Error', 'Please enter a valid count.', 'warning');
      return;
    }

    setSavingSettings(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert([{ key: 'whatsapp_member_count', value: whatsappMemberCountInput.trim() }], { onConflict: 'key' });

      if (error) throw error;
      showToast('Settings Updated', 'WhatsApp member count successfully updated.', 'success');
      await fetchInitialData();
    } catch (err: any) {
      showToast('Update Failed', err.message || 'Could not save settings.', 'error');
    } finally {
      setSavingSettings(false);
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

    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Unauthorized');

      const res = await fetch('/api/generate-access-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: [{ email: codeEmail, cohortId: codeCohortId, expiry: codeExpiry }]
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate code.');

      showToast('Code Generated', `Code generated and emailed to ${codeEmail}`, 'success');
      
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
        email,
        cohortId,
        expiry,
      });
    }

    if (codesToInsert.length === 0) {
      showToast('Import Failed', 'No valid email rows parsed from CSV.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Unauthorized');

      const res = await fetch('/api/generate-access-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: codesToInsert }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to bulk generate codes.');

      showToast('Import Success', `Successfully generated and emailed ${codesToInsert.length} access codes!`, 'success');
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
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <div className="relative w-10 h-10 flex items-center justify-center bg-white rounded-lg p-1.5 shadow-[0_4px_12px_rgba(5,82,254,0.15)] animate-pulse">
          <img src="/logo_icon.jpg" alt="Loading" className="h-full w-full object-contain" />
        </div>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Loading control panels...</p>
      </div>
    );
  }

  const tabs = [
    { name: 'cohorts', label: 'Cohorts', icon: Users },
    { name: 'archived_cohorts', label: 'Archived', icon: Archive },
    { name: 'students', label: 'Students', icon: GraduationCap },
    { name: 'facilitators', label: 'Facilitators', icon: ShieldCheck },
    { name: 'modules', label: 'Modules', icon: BookOpen },
    { name: 'codes', label: 'Access Codes', icon: KeyRound },
    { name: 'payments', label: 'Payments', icon: CreditCard },
    { name: 'resets', label: 'Resets', icon: Key },
    { name: 'announcements', label: 'Announcements', icon: Megaphone },
    { name: 'settings', label: 'Settings', icon: FileSpreadsheet },
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
              {cohorts.filter(c => !c.is_archived).map((c) => (
                <div key={c.id} className="glass-panel p-5 rounded-xl border border-zinc-900 flex justify-between items-center">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-zinc-100">{c.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      Capacity: {c.max_students} Students • {new Date(c.start_date).toLocaleDateString()} - {new Date(c.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                      c.status === 'active'
                        ? 'bg-success-green/10 text-success-green'
                        : c.status === 'completed'
                        ? 'bg-zinc-800 text-zinc-400'
                        : 'bg-primary-blue/10 text-primary-blue'
                    }`}>
                      {c.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleArchiveCohort(c.id)}
                      disabled={archiveLoadingCohortId === c.id}
                      className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-450 hover:text-zinc-200 transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold"
                    >
                      <Archive className="h-3 w-3" />
                      {archiveLoadingCohortId === c.id ? 'Archiving...' : 'Archive'}
                    </button>
                  </div>
                </div>
              ))}
              {cohorts.filter(c => !c.is_archived).length === 0 && (
                <p className="text-xs text-zinc-600 italic py-6 text-center">No active cohorts found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- ARCHIVED COHORTS TAB PANEL --- */}
      {activeTab === 'archived_cohorts' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-zinc-900">
            <div>
              <h3 className="text-sm font-semibold text-white">Archived Cohorts</h3>
              <p className="text-xs text-zinc-500 mt-1">Cohorts in this list are hidden from normal view. You can restore them or trigger a permanent, transaction-safe hard-delete.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {cohorts.filter(c => c.is_archived).map((c) => (
              <div key={c.id} className="glass-panel p-5 rounded-xl border border-zinc-900 flex justify-between items-center">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-zinc-200">{c.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Capacity: {c.max_students} Students • {new Date(c.start_date).toLocaleDateString()} - {new Date(c.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      setArchiveLoadingCohortId(c.id);
                      try {
                        const { error } = await supabase
                          .from('cohorts')
                          .update({ is_archived: false })
                          .eq('id', c.id);
                        if (error) throw error;
                        showToast('Cohort Restored', `Cohort ${c.name} is now active again.`, 'success');
                        await fetchInitialData();
                      } catch (err: any) {
                        showToast('Error', err.message || 'Could not restore cohort.', 'error');
                      } finally {
                        setArchiveLoadingCohortId(null);
                      }
                    }}
                    disabled={archiveLoadingCohortId === c.id}
                    className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-450 hover:text-zinc-200 transition-all cursor-pointer text-[10px] font-semibold"
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCohortToDelete(c);
                      setShowDeleteConfirm(true);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-red-950/40 bg-red-950/10 hover:bg-red-950/20 text-red-400 hover:text-red-300 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-semibold"
                  >
                    <Trash className="h-3 w-3" />
                    Delete Cohort
                  </button>
                </div>
              </div>
            ))}
            {cohorts.filter(c => c.is_archived).length === 0 && (
              <p className="text-xs text-zinc-650 italic py-12 text-center">No archived cohorts found.</p>
            )}
          </div>
        </div>
      )}

      {/* Cascade Hard-Delete Cohort Safety Confirmation Modal */}
      {showDeleteConfirm && cohortToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <Card className="w-full max-w-md border border-red-900 bg-zinc-950 p-6 relative">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-error-red">
                <AlertCircle className="h-5 w-5 animate-pulse" />
                <h3 className="text-lg font-bold text-white tracking-tight">CRITICAL: Irreversible Deletion!</h3>
              </div>
              
              <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-3 text-xs text-red-400 space-y-2">
                <p>
                  You are about to permanently delete the cohort <strong>"{cohortToDelete.name}"</strong>.
                </p>
                <p className="font-semibold">
                  This action is destructive and cannot be undone. It will run in a single transaction and cascade to delete:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>All student profiles registered in this cohort</li>
                  <li>All student submission files inside Cloudflare R2 storage</li>
                  <li>All student grades, feedback, and submission logs</li>
                  <li>All issued access codes for this cohort</li>
                </ul>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-zinc-400">
                  To confirm, type the exact name of the cohort (<span className="text-white font-mono select-all bg-zinc-900 px-1 py-0.5 rounded">{cohortToDelete.name}</span>) below:
                </label>
                <Input
                  id="confirm-cohort-name"
                  type="text"
                  placeholder="Type cohort name to confirm..."
                  value={confirmNameInput}
                  onChange={(e) => setConfirmNameInput(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setCohortToDelete(null);
                    setConfirmNameInput('');
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-450 hover:text-zinc-200 bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 cursor-pointer"
                  disabled={deletingCohort}
                >
                  Cancel
                </button>
                <Button
                  onClick={handleDeleteCohortSubmit}
                  className="text-xs bg-error-red hover:bg-red-700 text-white animate-pulse"
                  disabled={deletingCohort || confirmNameInput !== cohortToDelete.name}
                >
                  {deletingCohort ? 'Deleting...' : 'Delete Permanently'}
                </Button>
              </div>
            </div>
          </Card>
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
      {/* --- FACILITATORS TAB PANEL --- */}
      {activeTab === 'facilitators' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Onboard Facilitator Form */}
          <div className="lg:col-span-1">
            <Card className="space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block font-semibold">Onboard Facilitator</span>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Onboard a new mentor or facilitator. They will be sent an automated activation email to set up their password.
              </p>
              
              <form onSubmit={handleFacilitatorSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  id="fac-name"
                  placeholder="e.g. Dr. Kojo Boateng"
                  value={facName}
                  onChange={(e) => setFacName(e.target.value)}
                  required
                />
                
                <Input
                  label="Email Address"
                  id="fac-email"
                  type="email"
                  placeholder="kojo@senaacademy.org"
                  value={facEmail}
                  onChange={(e) => setFacEmail(e.target.value)}
                  required
                />

                <Button type="submit" className="w-full text-xs bg-supporting-purple hover:bg-purple-750" disabled={facSubmitting}>
                  {facSubmitting ? 'Creating Account...' : 'Onboard Facilitator'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Facilitators Directory List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">Facilitators Directory</h3>
            
            <div className="border border-zinc-900 bg-zinc-950/30 rounded-xl overflow-hidden backdrop-blur-md">
              <table className="w-full text-left text-xs text-zinc-400 border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-900/10 text-zinc-300 font-semibold">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {facilitators.map((fac) => (
                    <tr key={fac.id} className="hover:bg-zinc-900/20 transition-colors">
                      <td className="p-4 font-semibold text-zinc-200">{fac.full_name}</td>
                      <td className="p-4 text-zinc-450 font-mono">{fac.email}</td>
                      <td className="p-4 text-zinc-550">
                        {new Date(fac.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {facilitators.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-zinc-650 italic">
                        No facilitator accounts registered yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
                    {cohorts.filter(c => !c.is_archived).map((c) => (
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
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Transaction History Log ({payments.length})</h3>
              <button
                type="button"
                onClick={() => handleExportTable('payments')}
                disabled={exportLoading}
                className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-450 hover:text-zinc-200 transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-success-green" />
                {exportLoading ? 'Exporting...' : 'Export Payments (CSV)'}
              </button>
            </div>
            
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

      {/* --- PASSWORD RESETS TAB PANEL --- */}
      {activeTab === 'resets' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-zinc-900">
            <div>
              <h3 className="text-sm font-semibold text-white">Password Reset Requests</h3>
              <p className="text-xs text-zinc-500 mt-1">Review student reset requests, generate secure recovery links, and dispatch them automatically via Gmail SMTP.</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
              <span>Pending Requests: <span className="text-yellow-500 font-bold">{resetRequests.filter(r => r.status === 'pending').length}</span></span>
            </div>
          </div>

          <div className="border border-zinc-900 bg-zinc-950/30 rounded-xl overflow-hidden backdrop-blur-md">
            <table className="w-full text-left text-xs text-zinc-400 border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-900/10 text-zinc-300 font-semibold">
                  <th className="p-4">Student Email</th>
                  <th className="p-4">Student Context / Notes</th>
                  <th className="p-4">Request Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60">
                {resetRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="p-4 font-semibold text-zinc-200">{req.email}</td>
                    <td className="p-4 text-zinc-450 max-w-xs truncate" title={req.message || ''}>
                      {req.message || <span className="text-zinc-650 italic">No notes provided</span>}
                    </td>
                    <td className="p-4 text-zinc-550 font-mono">
                      {new Date(req.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                        req.status === 'resolved'
                          ? 'bg-zinc-800 text-zinc-400'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {req.status === 'pending' ? (
                        <button
                          type="button"
                          onClick={() => handleSendResetLink(req.id)}
                          disabled={resolvingReqId === req.id}
                          className="px-2.5 py-1.5 rounded-lg border border-zinc-850 bg-zinc-900/50 hover:bg-zinc-850 text-primary-blue hover:text-blue-400 transition-all cursor-pointer inline-flex items-center gap-1.5 text-[10px] font-semibold"
                        >
                          <Mail className="h-3 w-3" />
                          {resolvingReqId === req.id ? 'Sending...' : 'Send Reset Link'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-550 flex items-center justify-end gap-1 font-mono">
                          <CheckCircle className="h-3 w-3 text-zinc-500" />
                          Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {resetRequests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-650 italic">
                      No password reset requests logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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

      {/* --- SETTINGS TAB PANEL --- */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-6 animate-fade-in">
          <div className="pb-4 border-b border-zinc-900">
            <h3 className="text-sm font-semibold text-white">System Settings & Data Backups</h3>
            <p className="text-xs text-zinc-500 mt-1">Perform administrative tasks, manage platform exports, and clean up system storage.</p>
          </div>

          <Card className="space-y-4">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="h-5 w-5 text-primary-blue" />
              <div>
                <h4 className="text-sm font-bold text-zinc-200">Data Export Manager</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">Select any system registry database table to dump and download as an RFC 4180 compliant CSV file.</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400">Select Database Table</label>
                <select
                  value={exportTable}
                  onChange={(e) => setExportTable(e.target.value)}
                  className="glass-input text-xs text-zinc-100 rounded-lg p-2.5 w-full bg-zinc-950/80 border border-zinc-900 focus:outline-none focus:ring-1 focus:ring-primary-blue"
                >
                  <option value="payments">Payments Log (payments)</option>
                  <option value="profiles">Student / Facilitator Profiles (profiles)</option>
                  <option value="submissions">Submissions Log (submissions)</option>
                  <option value="modules">Curriculum Modules (modules)</option>
                  <option value="access_codes">Access Codes Registry (access_codes)</option>
                </select>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => handleExportTable(exportTable)}
                  className="w-full sm:w-auto text-xs bg-primary-blue hover:bg-blue-650"
                  disabled={exportLoading}
                >
                  {exportLoading ? (
                    <span className="flex items-center gap-1.5 justify-center">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Generating CSV...
                    </span>
                  ) : (
                    'Export CSV File'
                  )}
                </Button>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Megaphone className="h-5 w-5 text-supporting-purple" />
              <div>
                <h4 className="text-sm font-bold text-zinc-200">WhatsApp Community Settings</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">Configure the manually-declared WhatsApp group member count displayed on the public landing page.</p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400" htmlFor="whatsapp-member-count-input">
                  WhatsApp Member Count (Display Value)
                </label>
                <input
                  id="whatsapp-member-count-input"
                  type="text"
                  placeholder="e.g. 238"
                  value={whatsappMemberCountInput}
                  onChange={(e) => setWhatsappMemberCountInput(e.target.value)}
                  className="glass-input text-xs text-zinc-100 rounded-lg p-2.5 w-full bg-zinc-950/80 border border-zinc-900 focus:outline-none focus:ring-1 focus:ring-primary-blue"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full sm:w-auto text-xs bg-primary-blue hover:bg-blue-650"
                  disabled={savingSettings}
                >
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

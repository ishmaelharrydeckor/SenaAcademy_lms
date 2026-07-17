'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Calendar,
  MapPin,
  Video,
  ChevronLeft,
  Loader2,
  Edit,
} from 'lucide-react';

interface Cohort {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  max_students: number;
  status: 'upcoming' | 'active' | 'completed';
  is_archived: boolean;
  price: number;
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
  const [activeTab, setActiveTab] = useState<'cohorts' | 'archived_cohorts' | 'students' | 'facilitators' | 'modules' | 'codes' | 'payments' | 'resets' | 'announcements' | 'settings' | 'events'>('cohorts');

  // Load tab from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTab = sessionStorage.getItem('admin_active_tab');
      if (storedTab) {
        setActiveTab(storedTab as any);
      }
    }
  }, []);

  // Update sessionStorage when tab changes
  const isTabMounted = useRef(false);
  useEffect(() => {
    if (isTabMounted.current) {
      if (typeof window !== 'undefined' && activeTab) {
        sessionStorage.setItem('admin_active_tab', activeTab);
      }
    } else {
      isTabMounted.current = true;
    }
  }, [activeTab]);

  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [facilitators, setFacilitators] = useState<any[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
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
  const [cohortPrice, setCohortPrice] = useState('100');
  const [editingCohortId, setEditingCohortId] = useState<string | null>(null);

  // Module Form
  const [modCohortId, setModCohortId] = useState('');
  const [moduleCohortFilter, setModuleCohortFilter] = useState('');
  const [duplicateCohortSourceId, setDuplicateCohortSourceId] = useState('');
  const [facCohortId, setFacCohortId] = useState('');
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
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const [actionLoading, setActionLoading] = useState(false);

  // --- EVENTS STATE ---
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [registrants, setRegistrants] = useState<any[]>([]);
  const [loadingRegistrants, setLoadingRegistrants] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Event Form States
  const [eventTitle, setEventTitle] = useState('');
  const [eventSlug, setEventSlug] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventCoverUrl, setEventCoverUrl] = useState('');
  const [eventType, setEventType] = useState<'online' | 'in_person'>('online');
  const [eventLocation, setEventLocation] = useState('');
  const [eventMeetingLink, setEventMeetingLink] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');
  const [eventIsPaid, setEventIsPaid] = useState(false);
  const [eventPrice, setEventPrice] = useState('');
  const [eventCapacity, setEventCapacity] = useState('');
  const [eventStatus, setEventStatus] = useState<'draft' | 'published' | 'cancelled'>('draft');
  const [eventFormSubmitting, setEventFormSubmitting] = useState(false);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase.from('events').select('*').order('start_time', { ascending: false });
      if (data) setEventsList(data);
    } catch (err) {
      console.error('Error reloading events:', err);
    }
  };

  const fetchRegistrants = async (eventId: string) => {
    setLoadingRegistrants(true);
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      if (data) setRegistrants(data);
    } catch (err) {
      console.error('Error fetching registrants:', err);
    } finally {
      setLoadingRegistrants(false);
    }
  };

  const handleTitleChange = (val: string) => {
    setEventTitle(val);
    if (!editingEventId) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setEventSlug(autoSlug);
    }
  };

  const resetEventForm = () => {
    setEditingEventId(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('admin_editing_event_id');
    }
    setEventTitle('');
    setEventSlug('');
    setEventDesc('');
    setEventCoverUrl('');
    setEventType('online');
    setEventLocation('');
    setEventMeetingLink('');
    setEventStart('');
    setEventEnd('');
    setEventIsPaid(false);
    setEventPrice('');
    setEventCapacity('');
    setEventStatus('draft');
  };

  const handleEventFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventSlug || !eventDesc || !eventStart || !eventEnd) {
      showToast('Validation Error', 'Please fill in all required fields.', 'error');
      return;
    }

    setEventFormSubmitting(true);
    
    const payload = {
      title: eventTitle,
      slug: eventSlug,
      description: eventDesc,
      cover_image_url: eventCoverUrl || null,
      event_type: eventType,
      location: eventType === 'in_person' ? eventLocation : null,
      meeting_link: eventType === 'online' ? eventMeetingLink : null,
      start_time: new Date(eventStart).toISOString(),
      end_time: new Date(eventEnd).toISOString(),
      is_paid: eventIsPaid,
      price: eventIsPaid ? Number(eventPrice) : null,
      currency: 'GHS',
      capacity: eventCapacity ? Number(eventCapacity) : null,
      status: eventStatus,
    };

    try {
      if (editingEventId) {
        const { error } = await supabase
          .from('events')
          .update(payload)
          .eq('id', editingEventId);

        if (error) throw error;
        showToast('Success', 'Event updated successfully.', 'success');
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
          .from('events')
          .insert({
            ...payload,
            created_by: user?.id,
          });

        if (error) throw error;
        showToast('Success', 'Event created successfully.', 'success');
      }

      resetEventForm();
      fetchEvents();
    } catch (err: any) {
      console.error(err);
      showToast('Error', err.message || 'Failed to save event.', 'error');
    } finally {
      setEventFormSubmitting(false);
    }
  };

  const loadEventForEdit = (ev: any) => {
    setEditingEventId(ev.id);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('admin_editing_event_id', ev.id);
    }
    setEventTitle(ev.title);
    setEventSlug(ev.slug);
    setEventDesc(ev.description);
    setEventCoverUrl(ev.cover_image_url || '');
    setEventType(ev.event_type);
    setEventLocation(ev.location || '');
    setEventMeetingLink(ev.meeting_link || '');
    setEventStart(new Date(ev.start_time).toISOString().slice(0, 16));
    setEventEnd(new Date(ev.end_time).toISOString().slice(0, 16));
    setEventIsPaid(ev.is_paid);
    setEventPrice(ev.price?.toString() || '');
    setEventCapacity(ev.capacity?.toString() || '');
    setEventStatus(ev.status);
  };

  const handleToggleCheckIn = async (regId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({ checked_in: !currentStatus })
        .eq('id', regId);

      if (error) throw error;
      
      setRegistrants(prev =>
        prev.map(r => r.id === regId ? { ...r, checked_in: !currentStatus } : r)
      );
      showToast('Success', 'Registrant check-in status toggled.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Error', 'Failed to update check-in status.', 'error');
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch events
      const { data: eventData } = await supabase.from('events').select('*').order('start_time', { ascending: false });
      if (eventData) setEventsList(eventData);

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

      // Fetch announcements
      const { data: announceData } = await supabase
        .from('announcements')
        .select(`
          *,
          cohorts:cohort_id (
            name
          )
        `)
        .order('created_at', { ascending: false });
      if (announceData) setAnnouncements(announceData);

      // Restore sub-view states if saved in sessionStorage
      if (typeof window !== 'undefined') {
        const storedEditingEventId = sessionStorage.getItem('admin_editing_event_id');
        if (storedEditingEventId && eventData) {
          const found = eventData.find(e => e.id === storedEditingEventId);
          if (found) {
            setEditingEventId(found.id);
            setEventTitle(found.title);
            setEventSlug(found.slug);
            setEventDesc(found.description);
            setEventCoverUrl(found.cover_image_url || '');
            setEventType(found.event_type);
            setEventLocation(found.location || '');
            setEventMeetingLink(found.meeting_link || '');
            setEventStart(new Date(found.start_time).toISOString().slice(0, 16));
            setEventEnd(new Date(found.end_time).toISOString().slice(0, 16));
            setEventIsPaid(found.is_paid);
            setEventPrice(found.price?.toString() || '');
            setEventCapacity(found.capacity?.toString() || '');
            setEventStatus(found.status);
          }
        }

        const storedSelectedEventId = sessionStorage.getItem('admin_selected_event_id');
        if (storedSelectedEventId && eventData) {
          const found = eventData.find(e => e.id === storedSelectedEventId);
          if (found) {
            setSelectedEvent(found);
            setLoadingRegistrants(true);
            try {
              const { data: regData } = await supabase
                .from('event_registrations')
                .select('*')
                .eq('event_id', found.id)
                .order('created_at', { ascending: false });
              if (regData) setRegistrants(regData);
            } catch (err) {
              console.error('Error fetching registrants:', err);
            } finally {
              setLoadingRegistrants(false);
            }
          }
        }

        const storedEditingModuleId = sessionStorage.getItem('admin_editing_module_id');
        if (storedEditingModuleId && moduleData) {
          const found = moduleData.find(m => m.id === storedEditingModuleId);
          if (found) {
            setEditingModuleId(found.id);
            setModNum(found.module_number.toString());
            setModTitle(found.title);
            setModDesc(found.description);
            setModObjectivesList(found.objectives || []);
            setModOutcomesList(found.learning_outcomes || []);
            setModResourcesList(found.resources || []);
            setModAssignTitle(found.assignment_title);
            setModAssignDesc(found.assignment_description);
            setModAssignDeadline(formatDateForInput(found.assignment_deadline));
            setModUnlockDate(formatDateForInput(found.unlock_date));
            setModVisible(found.is_visible);
            setModRubricList(found.assignment_rubric || []);
          }
        }
      }

    } catch (err: any) {
      showToast('Error', 'Failed to retrieve admin details: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportTable = async (tableName: string, eventId?: string) => {
    setExportLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('You must be logged in to export files.');

      const eventQuery = eventId ? `&event_id=${eventId}` : '';
      const res = await fetch(`/api/admin/export-csv?table=${tableName}${eventQuery}`, {
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
        body: JSON.stringify({ fullName: facName.trim(), email: facEmail.trim(), cohortId: facCohortId || null }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to onboard facilitator.');
      }

      showToast('Facilitator Created', result.message || 'Facilitator account successfully created.', 'success');
      setFacName('');
      setFacEmail('');
      setFacCohortId('');
      await fetchInitialData();
    } catch (err: any) {
      showToast('Onboarding Failed', err.message || 'Could not onboard facilitator.', 'error');
    } finally {
      setFacSubmitting(false);
    }
  };

  const handleUpdateFacilitatorCohort = async (facId: string, cohortId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ cohort_id: cohortId || null })
        .eq('id', facId);

      if (error) throw error;

      showToast('Facilitator Updated', 'Assigned cohort successfully updated.', 'success');
      await fetchInitialData();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update facilitator.', 'error');
    } finally {
      setActionLoading(false);
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

  // Cohort creation or update
  const handleCohortSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cohortName || !cohortStart || !cohortEnd || !cohortMax || !cohortPrice) return;

    setActionLoading(true);
    try {
      if (editingCohortId) {
        // Update existing cohort
        const { error } = await supabase
          .from('cohorts')
          .update({
            name: cohortName,
            start_date: cohortStart,
            end_date: cohortEnd,
            max_students: parseInt(cohortMax),
            status: cohortStatus,
            price: parseFloat(cohortPrice),
          })
          .eq('id', editingCohortId);

        if (error) throw error;
        showToast('Cohort Updated', `Successfully updated ${cohortName}`, 'success');
      } else {
        // Create new cohort
        const { data: newCohortData, error } = await supabase
          .from('cohorts')
          .insert([
            {
              name: cohortName,
              start_date: cohortStart,
              end_date: cohortEnd,
              max_students: parseInt(cohortMax),
              status: cohortStatus,
              price: parseFloat(cohortPrice),
            },
          ])
          .select();

        if (error) throw error;
        const newCohort = newCohortData?.[0];

        if (newCohort && duplicateCohortSourceId) {
          // Fetch source modules
          const { data: sourceModules, error: fetchModulesErr } = await supabase
            .from('modules')
            .select('*')
            .eq('cohort_id', duplicateCohortSourceId);

          if (fetchModulesErr) throw fetchModulesErr;

          if (sourceModules && sourceModules.length > 0) {
            const duplicatedModules = sourceModules.map((m) => ({
              cohort_id: newCohort.id,
              module_number: m.module_number,
              title: m.title,
              description: m.description,
              learning_outcomes: m.learning_outcomes,
              objectives: m.objectives,
              resources: m.resources,
              assignment_title: m.assignment_title,
              assignment_description: m.assignment_description,
              assignment_deadline: m.assignment_deadline,
              assignment_rubric: m.assignment_rubric,
              unlock_date: m.unlock_date,
              is_visible: m.is_visible,
            }));

            const { error: duplicateErr } = await supabase
              .from('modules')
              .insert(duplicatedModules);

            if (duplicateErr) throw duplicateErr;
            showToast('Cohort & Modules Created', `Successfully initialized ${cohortName} and duplicated ${sourceModules.length} modules.`, 'success');
          } else {
            showToast('Cohort Created', `Successfully initialized ${cohortName} (source cohort had no modules to duplicate).`, 'success');
          }
        } else {
          showToast('Cohort Created', `Successfully initialized ${cohortName}`, 'success');
        }
      }
      
      // Reset form & state
      setCohortName('');
      setCohortStart('');
      setCohortEnd('');
      setCohortMax('30');
      setCohortStatus('upcoming');
      setCohortPrice('100');
      setEditingCohortId(null);
      setDuplicateCohortSourceId('');
      
      await fetchInitialData();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCohort = (c: Cohort) => {
    setEditingCohortId(c.id);
    setCohortName(c.name);
    setCohortStart(c.start_date);
    setCohortEnd(c.end_date);
    setCohortMax(c.max_students.toString());
    setCohortStatus(c.status);
    setCohortPrice(c.price ? c.price.toString() : '100');
    
    // Scroll to the cohorts registry view or form if needed
    const formElement = document.getElementById('c-name');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      formElement.focus();
    }
  };

  const cancelCohortEdit = () => {
    setEditingCohortId(null);
    setCohortName('');
    setCohortStart('');
    setCohortEnd('');
    setCohortMax('30');
    setCohortStatus('upcoming');
    setCohortPrice('100');
  };

  // Reset Module Form fields
  const resetModuleForm = () => {
    setEditingModuleId(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('admin_editing_module_id');
    }
    setModCohortId('');
    setModNum('');
    setModTitle('');
    setModDesc('');
    setModObjective('');
    setModObjectivesList([]);
    setModOutcome('');
    setModOutcomesList([]);
    setModResName('');
    setModResUrl('');
    setModResCategory('slide');
    setModResourcesList([]);
    setModAssignTitle('');
    setModAssignDesc('');
    setModAssignDeadline('');
    setModUnlockDate('');
    setModVisible(false);
    setRubricCrit('');
    setRubricMax('25');
    setModRubricList([]);
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  const handleEditModule = (m: any) => {
    setEditingModuleId(m.id);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('admin_editing_module_id', m.id);
    }
    setModCohortId(m.cohort_id || '');
    setModNum(m.module_number.toString());
    setModTitle(m.title);
    setModDesc(m.description);
    setModObjectivesList(m.objectives || []);
    setModOutcomesList(m.learning_outcomes || []);
    setModResourcesList(m.resources || []);
    setModAssignTitle(m.assignment_title);
    setModAssignDesc(m.assignment_description);
    setModAssignDeadline(formatDateForInput(m.assignment_deadline));
    setModUnlockDate(formatDateForInput(m.unlock_date));
    setModVisible(m.is_visible);
    setModRubricList(m.assignment_rubric || []);
  };

  const handleDeleteModule = async (id: string, moduleNum: number, title: string) => {
    if (!confirm(`WARNING: Are you sure you want to permanently delete Module ${moduleNum}: "${title}"? This will also delete all student submissions and grading history for this module. This action cannot be undone.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast('Module Deleted', `Module ${moduleNum} has been permanently deleted.`, 'success');
      
      if (editingModuleId === id) {
        resetModuleForm();
      }

      await fetchInitialData();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to delete module.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Module creation / modification
  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modCohortId || !modNum || !modTitle || !modDesc || !modAssignTitle || !modAssignDesc || !modAssignDeadline || !modUnlockDate) {
      showToast('Form Error', 'Please satisfy all required fields, including cohort selection.', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      if (editingModuleId) {
        const { error } = await supabase
          .from('modules')
          .update({
            cohort_id: modCohortId,
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
          })
          .eq('id', editingModuleId);

        if (error) throw error;
        showToast('Module Updated', `Curriculum Module ${modNum} updated successfully.`, 'success');
      } else {
        const { error } = await supabase.from('modules').insert([
          {
            cohort_id: modCohortId,
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
      }
      
      resetModuleForm();
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

      const failedCount = data.failed ? data.failed.length : 0;
      const succeededCount = data.results ? data.results.length : codesToInsert.length;

      if (failedCount > 0) {
        showToast('Import Warning', `Bulk generation finished: ${succeededCount} codes succeeded, ${failedCount} failed.`, 'warning');
      } else {
        showToast('Import Success', `Successfully generated and emailed all ${succeededCount} access codes!`, 'success');
      }
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

  // Delete Access Code
  const handleDeleteCode = async (code: string) => {
    if (!confirm(`WARNING: Are you sure you want to permanently delete access key "${code}"? This will wipe the record and cannot be undone.`)) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.from('access_codes').delete().eq('code', code);
      if (error) throw error;
      showToast('Key Deleted', `Access key ${code} has been permanently deleted.`, 'warning');
      setSelectedCodes(prev => prev.filter(c => c !== code));
      await fetchInitialData();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Selected Access Codes
  const handleDeleteSelectedCodes = async () => {
    if (selectedCodes.length === 0) return;
    if (!confirm(`WARNING: Are you sure you want to permanently delete the ${selectedCodes.length} selected access keys? This will wipe their records and cannot be undone.`)) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.from('access_codes').delete().in('code', selectedCodes);
      if (error) throw error;
      showToast('Keys Deleted', `${selectedCodes.length} access keys have been permanently deleted.`, 'warning');
      setSelectedCodes([]);
      await fetchInitialData();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Payment Log
  const handleDeletePayment = async (id: string, reference: string) => {
    if (!confirm(`WARNING: Are you sure you want to permanently delete transaction record "${reference}"? This will wipe the payment history log and cannot be undone.`)) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.from('payments').delete().eq('id', id);
      if (error) throw error;
      showToast('Payment Record Deleted', `Transaction ${reference} has been removed.`, 'warning');
      await fetchInitialData();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setActionLoading(false);
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
      await fetchInitialData();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
      showToast('Announcement Deleted', 'Announcement removed successfully.', 'success');
      await fetchInitialData();
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
          <img src="/logo_icon.png" alt="Loading" className="h-full w-full object-contain" />
        </div>
        <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">Loading control panels...</p>
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
    { name: 'events', label: 'Events', icon: Calendar },
    { name: 'settings', label: 'Settings', icon: FileSpreadsheet },
  ];

  return (
    <div className="space-y-8">
      {/* Admin header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border-brand">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Admin Control Center</h2>
          <p className="text-xs text-text-secondary mt-1">Manage cohorts, curriculum modules, student access keys, and system alerts.</p>
        </div>
      </div>

      {/* Settings tab bar */}
      <div className="flex border-b border-border-brand gap-1 pb-[1px] overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => {
                setActiveTab(tab.name as any);
                setSelectedCodes([]);
                setSelectedEvent(null);
                if (typeof window !== 'undefined') {
                  sessionStorage.removeItem('admin_selected_event_id');
                }
                resetEventForm();
              }}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold select-none border-b-2 transition-all ${
                active
                  ? 'border-primary-blue text-white bg-bg-surface-hover/20'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
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
          {/* Create/Edit Form */}
          <div className="lg:col-span-1">
            <Card className="space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-secondary block">
                {editingCohortId ? 'Modify Cohort' : 'Initialize Cohort'}
              </span>
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
                <Input
                  label="Admissions Price (GHS)"
                  id="c-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={cohortPrice}
                  onChange={(e) => setCohortPrice(e.target.value)}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">Initial Status</label>
                  <select
                    value={cohortStatus}
                    onChange={(e: any) => setCohortStatus(e.target.value)}
                    className="glass-input text-xs text-text-primary rounded-lg p-2.5 w-full bg-bg-canvas"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {!editingCohortId && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-text-secondary">Duplicate Modules From (Optional)</label>
                    <select
                      value={duplicateCohortSourceId}
                      onChange={(e) => setDuplicateCohortSourceId(e.target.value)}
                      className="glass-input text-xs text-text-primary rounded-lg p-2.5 w-full bg-bg-canvas"
                    >
                      <option value="">Do not duplicate</option>
                      {cohorts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.is_archived ? '(Archived)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 text-xs" disabled={actionLoading}>
                    {editingCohortId ? 'Save Changes' : 'Create Cohort'}
                  </Button>
                  {editingCohortId && (
                    <Button type="button" variant="secondary" onClick={cancelCohortEdit} className="text-xs">
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </div>

          {/* List panel */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-text-secondary">Registry</h3>
            <div className="grid grid-cols-1 gap-3">
              {cohorts.filter(c => !c.is_archived).map((c) => (
                <div key={c.id} className="glass-panel p-5 rounded-xl border border-border-brand flex justify-between items-center">
                  <div className="space-y-1 text-left">
                    <h4 className="text-sm font-semibold text-text-primary">{c.name}</h4>
                    <p className="text-[10px] text-text-secondary font-mono">
                      Capacity: {c.max_students} Students • Price: GHS {c.price ?? 100} • {new Date(c.start_date).toLocaleDateString()} - {new Date(c.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                      c.status === 'active'
                        ? 'bg-success-green/10 text-success-green'
                        : c.status === 'completed'
                        ? 'bg-bg-surface-hover text-text-secondary'
                        : 'bg-primary-blue/10 text-primary-blue'
                    }`}>
                      {c.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEditCohort(c)}
                      className="px-2.5 py-1.5 rounded-lg border border-border-brand bg-bg-surface-hover/50 hover:bg-bg-surface-hover hover:border-border-brand text-text-secondary hover:text-text-primary transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleArchiveCohort(c.id)}
                      disabled={archiveLoadingCohortId === c.id}
                      className="px-2.5 py-1.5 rounded-lg border border-border-brand bg-bg-surface-hover/50 hover:bg-bg-surface-hover hover:border-border-brand text-text-secondary hover:text-text-primary transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold"
                    >
                      <Archive className="h-3 w-3" />
                      {archiveLoadingCohortId === c.id ? 'Archiving...' : 'Archive'}
                    </button>
                  </div>
                </div>
              ))}
              {cohorts.filter(c => !c.is_archived).length === 0 && (
                <p className="text-xs text-text-secondary italic py-6 text-center">No active cohorts found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- ARCHIVED COHORTS TAB PANEL --- */}
      {activeTab === 'archived_cohorts' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-border-brand">
            <div>
              <h3 className="text-sm font-semibold text-white">Archived Cohorts</h3>
              <p className="text-xs text-text-secondary mt-1">Cohorts in this list are hidden from normal view. You can restore them or trigger a permanent, transaction-safe hard-delete.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {cohorts.filter(c => c.is_archived).map((c) => (
              <div key={c.id} className="glass-panel p-5 rounded-xl border border-border-brand flex justify-between items-center">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-text-primary">{c.name}</h4>
                  <p className="text-[10px] text-text-secondary font-mono">
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
                    className="px-2.5 py-1.5 rounded-lg border border-border-brand bg-bg-surface-hover/50 hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary transition-all cursor-pointer text-[10px] font-semibold"
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
              <p className="text-xs text-text-secondary italic py-12 text-center">No archived cohorts found.</p>
            )}
          </div>
        </div>
      )}

      {/* Cascade Hard-Delete Cohort Safety Confirmation Modal */}
      {showDeleteConfirm && cohortToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <Card className="w-full max-w-md border border-red-900 bg-bg-canvas p-6 relative">
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
                <label className="block text-xs font-semibold text-text-secondary">
                  To confirm, type the exact name of the cohort (<span className="text-white font-mono select-all bg-bg-surface-hover px-1 py-0.5 rounded">{cohortToDelete.name}</span>) below:
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
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary bg-bg-canvas border border-border-brand hover:bg-bg-surface-hover cursor-pointer"
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
            <h3 className="text-xs font-mono uppercase tracking-widest text-text-secondary self-start md:self-auto">Student Directory</h3>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="glass-input text-xs text-text-primary rounded-lg px-4 py-2 w-full sm:w-64 bg-bg-canvas/60"
              />

              <select
                value={studentCohortFilter}
                onChange={(e) => setStudentCohortFilter(e.target.value)}
                className="glass-input text-xs text-text-primary rounded-lg px-3 py-2 w-full sm:w-48 bg-bg-canvas"
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
                  <Users className="h-9 w-9 text-text-secondary stroke-[1.5] mx-auto mb-2" />
                  <p className="text-xs text-text-secondary">No students found matching your filters.</p>
                </Card>
              );
            }

            return (
              <div className="glass-panel rounded-xl border border-border-brand overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border-brand bg-bg-canvas/40 text-text-secondary font-mono">
                      <th className="p-4">Full Name</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">Cohort</th>
                      <th className="p-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-brand">
                    {filtered.map((student) => (
                      <tr key={student.id} className="hover:bg-bg-surface-hover/30 transition-colors">
                        <td className="p-4 font-semibold text-text-primary">{student.full_name}</td>
                        <td className="p-4 text-text-secondary font-mono">{student.email}</td>
                        <td className="p-4 text-text-secondary">{student.cohorts?.name || 'Unassigned'}</td>
                        <td className="p-4 text-text-secondary">
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
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-secondary block font-semibold">Onboard Facilitator</span>
              <p className="text-xs text-text-secondary leading-relaxed">
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

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">Assigned Cohort (Optional)</label>
                  <select
                    value={facCohortId}
                    onChange={(e) => setFacCohortId(e.target.value)}
                    className="glass-input text-xs text-text-primary rounded-lg p-2.5 w-full bg-bg-canvas"
                  >
                    <option value="">None (Sees all submissions)</option>
                    {cohorts.filter(c => !c.is_archived).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Button type="submit" className="w-full text-xs bg-supporting-purple hover:bg-purple-750" disabled={facSubmitting}>
                  {facSubmitting ? 'Creating Account...' : 'Onboard Facilitator'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Facilitators Directory List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-text-secondary block">Facilitators Directory</h3>
            
            <div className="border border-border-brand bg-bg-canvas/30 rounded-xl overflow-hidden backdrop-blur-md">
              <table className="w-full text-left text-xs text-text-secondary border-collapse">
                <thead>
                  <tr className="border-b border-border-brand bg-bg-surface-hover/20 text-text-primary font-semibold">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Assigned Cohort</th>
                    <th className="p-4">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-brand">
                  {facilitators.map((fac) => (
                    <tr key={fac.id} className="hover:bg-bg-surface-hover/30 transition-colors">
                      <td className="p-4 font-semibold text-text-primary">{fac.full_name}</td>
                      <td className="p-4 text-text-secondary font-mono">{fac.email}</td>
                      <td className="p-4 text-text-secondary">
                        <div className="flex flex-col gap-1 max-w-[200px]">
                          <select
                            value={fac.cohort_id || ''}
                            onChange={(e) => handleUpdateFacilitatorCohort(fac.id, e.target.value)}
                            className="glass-input text-[11px] text-text-primary rounded p-1 bg-bg-canvas border border-border-brand w-full"
                          >
                            <option value="">No cohort (All Submissions)</option>
                            {cohorts.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} {c.is_archived ? '(Archived)' : ''}
                              </option>
                            ))}
                          </select>
                          {!fac.cohort_id && (
                            <span className="text-[9px] text-yellow-500 font-medium">
                              ⚠️ No cohort assigned — sees all submissions
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-text-secondary">
                        {new Date(fac.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {facilitators.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-text-secondary italic">
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
          {/* Create/Edit Form */}
          <div className="lg:col-span-1">
            <Card className="space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-secondary block">
                {editingModuleId ? 'Edit Module' : 'Create Module'}
              </span>
              <form onSubmit={handleModuleSubmit} className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">Target Cohort</label>
                  <select
                    value={modCohortId}
                    onChange={(e) => setModCohortId(e.target.value)}
                    required
                    className="glass-input text-xs text-text-primary rounded-lg p-2.5 w-full bg-bg-canvas"
                  >
                    <option value="">Select Cohort...</option>
                    {cohorts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.is_archived ? '(Archived)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

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
                <div className="border-t border-border-brand pt-3 space-y-2">
                  <label className="text-xs font-semibold text-text-primary">Objectives list</label>
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
                  <ul className="space-y-1.5 text-xs text-text-secondary">
                    {modObjectivesList.map((obj, i) => (
                      <li key={i} className="flex justify-between items-center bg-bg-canvas p-2 rounded border border-border-brand">
                        <span className="truncate max-w-[200px]">{obj}</span>
                        <button
                          type="button"
                          onClick={() => setModObjectivesList(modObjectivesList.filter((_, idx) => idx !== i))}
                          className="text-text-secondary hover:text-red-400"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Outcomes list builder */}
                <div className="border-t border-border-brand pt-3 space-y-2">
                  <label className="text-xs font-semibold text-text-primary">Outcomes list</label>
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
                  <ul className="space-y-1.5 text-xs text-text-secondary">
                    {modOutcomesList.map((out, i) => (
                      <li key={i} className="flex justify-between items-center bg-bg-canvas p-2 rounded border border-border-brand">
                        <span className="truncate max-w-[200px]">{out}</span>
                        <button
                          type="button"
                          onClick={() => setModOutcomesList(modOutcomesList.filter((_, idx) => idx !== i))}
                          className="text-text-secondary hover:text-red-400"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources list builder */}
                <div className="border-t border-border-brand pt-3 space-y-2">
                  <label className="text-xs font-semibold text-text-primary">Resource Library</label>
                  <div className="space-y-2">
                    <Input
                      id="m-res-name"
                      placeholder="Resource Name (e.g. Slide Deck)"
                      value={modResName}
                      onChange={(e) => setModResName(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Input
                        id="m-res-url"
                        placeholder="Resource URL (https://...)"
                        value={modResUrl}
                        onChange={(e) => setModResUrl(e.target.value)}
                        className="flex-1"
                      />
                      <select
                        value={modResCategory}
                        onChange={(e) => setModResCategory(e.target.value)}
                        className="glass-input text-xs text-text-primary rounded-lg px-2 bg-bg-canvas border border-border-brand focus:outline-none"
                      >
                        <option value="slide">Slide</option>
                        <option value="video">Video</option>
                        <option value="doc">Doc</option>
                        <option value="link">Link</option>
                      </select>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (modResName && modResUrl) {
                            setModResourcesList([...modResourcesList, { name: modResName, url: modResUrl, category: modResCategory }]);
                            setModResName('');
                            setModResUrl('');
                            setModResCategory('slide');
                          }
                        }}
                        className="mt-0.5 shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-xs text-text-secondary">
                    {modResourcesList.map((res, i) => (
                      <li key={i} className="flex justify-between items-center bg-bg-canvas p-2 rounded border border-border-brand">
                        <span className="truncate max-w-[180px]">{res.name} ({res.category})</span>
                        <button
                          type="button"
                          onClick={() => setModResourcesList(modResourcesList.filter((_, idx) => idx !== i))}
                          className="text-text-secondary hover:text-red-400"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Rubric builder */}
                <div className="border-t border-border-brand pt-3 space-y-2">
                  <label className="text-xs font-semibold text-text-primary">Grading Rubric criteria</label>
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
                  <ul className="space-y-1.5 text-xs text-text-secondary">
                    {modRubricList.map((rub, i) => (
                      <li key={i} className="flex justify-between items-center bg-bg-canvas p-2 rounded border border-border-brand">
                        <span>{rub.criteria} ({rub.max_points} pts)</span>
                        <button
                          type="button"
                          onClick={() => setModRubricList(modRubricList.filter((_, idx) => idx !== i))}
                          className="text-text-secondary hover:text-red-400"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Assignment settings */}
                <div className="border-t border-border-brand pt-3 space-y-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-text-secondary block">Assignment details</span>
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
                <div className="border-t border-border-brand pt-3 space-y-4">
                  <Input
                    label="Unlock date"
                    id="m-unlock"
                    type="datetime-local"
                    value={modUnlockDate}
                    onChange={(e) => setModUnlockDate(e.target.value)}
                    required
                  />

                  <div className="flex items-center gap-2.5 select-none cursor-pointer text-xs font-semibold text-text-primary">
                    <input
                      type="checkbox"
                      id="m-vis"
                      checked={modVisible}
                      onChange={(e) => setModVisible(e.target.checked)}
                      className="rounded bg-bg-surface-hover border-border-brand text-primary-blue focus:ring-primary-blue"
                    />
                    <label htmlFor="m-vis" className="flex items-center gap-1.5 cursor-pointer">
                      {modVisible ? <Eye className="h-4 w-4 text-primary-blue" /> : <EyeOff className="h-4 w-4 text-text-secondary" />}
                      Visibility Enabled
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 text-xs" disabled={actionLoading}>
                    {editingModuleId ? 'Save Changes' : 'Publish Module'}
                  </Button>
                  {editingModuleId && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={resetModuleForm}
                      className="text-xs px-4"
                      disabled={actionLoading}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </div>

          {/* List panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-text-secondary">Modules Published</h3>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-text-secondary whitespace-nowrap">Filter by Cohort:</label>
                <select
                  value={moduleCohortFilter}
                  onChange={(e) => setModuleCohortFilter(e.target.value)}
                  className="glass-input text-xs text-text-primary rounded-lg p-1.5 bg-bg-canvas"
                >
                  <option value="">All Cohorts</option>
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.is_archived ? '(Archived)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {(() => {
                const filteredModules = moduleCohortFilter
                  ? modules.filter((m: any) => m.cohort_id === moduleCohortFilter)
                  : modules;

                return filteredModules.map((m: any) => {
                  const cohort = cohorts.find((c) => c.id === m.cohort_id);
                  return (
                    <div key={m.id} className="glass-panel p-5 rounded-xl border border-border-brand flex justify-between items-center gap-4">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono text-text-secondary uppercase">Module {m.module_number}</span>
                          <span className="h-1 w-1 rounded-full bg-border-brand"></span>
                          <span className="text-[10px] font-mono text-accent-primary bg-primary-blue/5 px-1.5 py-0.2 rounded">
                            {cohort ? cohort.name : 'Unknown Cohort'}
                          </span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase font-semibold ${
                            m.is_visible ? 'bg-primary-blue/10 text-primary-blue' : 'bg-bg-surface-hover text-text-secondary'
                          }`}>
                            {m.is_visible ? 'Visible' : 'Hidden'}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-text-primary truncate">{m.title}</h4>
                        <p className="text-[10px] text-text-secondary truncate">
                          Rubric Criteria: {m.assignment_rubric.map((r: any) => r.criteria).join(', ') || 'None'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEditModule(m)}
                          className="text-[10px] px-2.5 py-1"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteModule(m.id, m.module_number, m.title)}
                          className="text-[10px] px-2.5 py-1"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                });
              })()}
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
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-secondary block">Generate Access Code</span>
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
                  <label className="text-xs font-medium text-text-secondary">Target Cohort</label>
                  <select
                    value={codeCohortId}
                    onChange={(e) => setCodeCohortId(e.target.value)}
                    required
                    className="glass-input text-xs text-text-primary rounded-lg p-2.5 w-full bg-bg-canvas"
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
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-secondary block">CSV Bulk Import Codes</span>
              <div className="space-y-3">
                <p className="text-[10px] text-text-secondary leading-relaxed">
                  Paste CSV rows matching format:<br />
                  <code className="text-text-secondary font-mono text-[9px]">name, email, cohort_name_or_uuid</code>
                </p>
                <textarea
                  placeholder="John Doe, john@domain.com, Founding Cohort"
                  value={bulkCsv}
                  onChange={(e) => setBulkCsv(e.target.value)}
                  className="glass-input text-xs text-text-primary rounded-lg p-3 w-full h-28 resize-none placeholder-text-secondary/50"
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
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-mono uppercase tracking-widest text-text-secondary">Access Key Registry</h3>
              <div className="flex items-center gap-3">
                {selectedCodes.length > 0 && (
                  <Button
                    onClick={handleDeleteSelectedCodes}
                    variant="danger"
                    size="sm"
                    className="text-[10px]"
                    disabled={actionLoading}
                  >
                    Delete Selected ({selectedCodes.length})
                  </Button>
                )}
                <Button
                  onClick={() => handleExportTable('access_codes')}
                  disabled={exportLoading}
                  variant="secondary"
                  size="sm"
                  className="text-[10px]"
                >
                  {exportLoading ? 'Exporting...' : 'Export Access Codes (CSV)'}
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto glass-panel rounded-xl border border-border-brand font-sans">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-brand bg-bg-canvas/40 text-text-secondary font-mono">
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={codes.length > 0 && selectedCodes.length === codes.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCodes(codes.map((c) => c.code));
                          } else {
                            setSelectedCodes([]);
                          }
                        }}
                        className="rounded border-border-brand bg-bg-canvas text-accent-primary focus:ring-accent-primary/30 h-3.5 w-3.5 cursor-pointer"
                      />
                    </th>
                    <th className="p-4">Key Code</th>
                    <th className="p-4">Assigned Student</th>
                    <th className="p-4">Expiry Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-brand">
                  {codes.map((k) => (
                    <tr key={k.code} className="hover:bg-bg-surface-hover/20">
                      <td className="p-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedCodes.includes(k.code)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCodes((prev) => [...prev, k.code]);
                            } else {
                              setSelectedCodes((prev) => prev.filter((c) => c !== k.code));
                            }
                          }}
                          className="rounded border-border-brand bg-bg-canvas text-accent-primary focus:ring-accent-primary/30 h-3.5 w-3.5 cursor-pointer"
                        />
                      </td>
                      <td className="p-4 font-mono font-bold text-text-primary select-all">{k.code}</td>
                      <td className="p-4 font-mono text-text-secondary">{k.assigned_email}</td>
                      <td className="p-4 text-text-secondary">{new Date(k.expires_at).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 font-semibold uppercase px-1.5 py-0.5 rounded text-[9px] ${
                          k.status === 'unused'
                            ? 'bg-primary-blue/10 text-primary-blue'
                            : k.status === 'redeemed'
                            ? 'bg-success-green/10 text-success-green'
                            : 'bg-bg-surface-hover text-text-secondary'
                        }`}>
                          {k.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center gap-3">
                          {k.status === 'unused' && (
                            <button
                              onClick={() => handleRevokeCode(k.code)}
                              className="text-[10px] text-yellow-500 hover:text-yellow-400 font-bold transition-colors cursor-pointer"
                            >
                              Revoke
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCode(k.code)}
                            className="text-[10px] text-red-500 hover:text-red-400 font-bold transition-colors cursor-pointer"
                            disabled={actionLoading}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {codes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-text-secondary italic">No access codes generated.</td>
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
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-secondary block">Verify Paystack Reference</span>
              <p className="text-[10px] text-text-secondary leading-relaxed">
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
              <h3 className="text-xs font-mono uppercase tracking-widest text-text-secondary">Transaction History Log ({payments.length})</h3>
              <button
                type="button"
                onClick={() => handleExportTable('payments')}
                disabled={exportLoading}
                className="px-2.5 py-1.5 rounded-lg border border-border-brand bg-bg-surface-hover/50 hover:bg-bg-surface-hover hover:border-border-brand text-text-secondary hover:text-text-primary transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-success-green" />
                {exportLoading ? 'Exporting...' : 'Export Payments (CSV)'}
              </button>
            </div>
            
            {payments.length === 0 ? (
              <Card className="text-center py-16">
                <CreditCard className="h-9 w-9 text-text-secondary stroke-[1.5] mx-auto mb-2" />
                <p className="text-xs text-text-secondary">No Paystack transaction records logged yet.</p>
              </Card>
            ) : (
              <div className="glass-panel rounded-xl border border-border-brand overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border-brand bg-bg-canvas/40 text-text-secondary font-mono">
                        <th className="p-4">Reference</th>
                        <th className="p-4">Student</th>
                        <th className="p-4">Cohort</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Code Sent</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-brand">
                      {payments.map((p) => {
                        const isDuplicate = payments.filter((item) => item.paystack_reference === p.paystack_reference).length > 1;
                        
                        return (
                          <tr key={p.id} className="hover:bg-bg-surface-hover/20 transition-colors">
                            <td className="p-4 font-mono font-semibold text-text-primary">
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
                                <p className="font-semibold text-text-primary">{p.full_name}</p>
                                <p className="text-[10px] text-text-secondary font-mono">{p.email}</p>
                              </div>
                            </td>
                            <td className="p-4 text-text-secondary">{p.cohorts?.name || 'Selected Cohort'}</td>
                            <td className="p-4 font-mono text-text-primary">
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
                                p.access_code_generated ? 'bg-bg-surface-hover text-text-secondary' : 'bg-yellow-500/10 text-yellow-500'
                              }`}>
                                {p.access_code_generated ? 'Completed' : 'Pending'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleDeletePayment(p.id, p.paystack_reference)}
                                className="text-[10px] text-red-500 hover:text-red-400 font-bold transition-colors cursor-pointer"
                                disabled={actionLoading}
                              >
                                Delete
                              </button>
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-border-brand">
            <div>
              <h3 className="text-sm font-semibold text-white">Password Reset Requests</h3>
              <p className="text-xs text-text-secondary mt-1">Review student reset requests, generate secure recovery links, and dispatch them automatically via Gmail SMTP.</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-text-secondary font-mono">
              <span>Pending Requests: <span className="text-yellow-500 font-bold">{resetRequests.filter(r => r.status === 'pending').length}</span></span>
            </div>
          </div>

          <div className="border border-border-brand bg-bg-canvas/30 rounded-xl overflow-hidden backdrop-blur-md">
            <table className="w-full text-left text-xs text-text-secondary border-collapse">
              <thead>
                <tr className="border-b border-border-brand bg-bg-surface-hover/20 text-text-primary font-semibold">
                  <th className="p-4">Student Email</th>
                  <th className="p-4">Student Context / Notes</th>
                  <th className="p-4">Request Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-brand">
                {resetRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-bg-surface-hover/30 transition-colors">
                    <td className="p-4 font-semibold text-text-primary">{req.email}</td>
                    <td className="p-4 text-text-secondary max-w-xs truncate" title={req.message || ''}>
                      {req.message || <span className="text-text-secondary italic">No notes provided</span>}
                    </td>
                    <td className="p-4 text-text-secondary font-mono">
                      {new Date(req.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                        req.status === 'resolved'
                          ? 'bg-bg-surface-hover text-text-secondary'
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
                          className="px-2.5 py-1.5 rounded-lg border border-border-brand bg-bg-surface-hover/50 hover:bg-bg-surface-hover text-primary-blue hover:text-blue-400 transition-all cursor-pointer inline-flex items-center gap-1.5 text-[10px] font-semibold"
                        >
                          <Mail className="h-3 w-3" />
                          {resolvingReqId === req.id ? 'Sending...' : 'Send Reset Link'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-text-secondary flex items-center justify-end gap-1 font-mono">
                          <CheckCircle className="h-3 w-3 text-text-secondary" />
                          Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {resetRequests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-text-secondary italic">
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
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-secondary block">Broadcast Alert</span>
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
                  <label className="text-[11px] font-medium text-text-secondary">Content / Message</label>
                  <textarea
                    placeholder="Write details of this cohort notification..."
                    value={announceContent}
                    onChange={(e) => setAnnounceContent(e.target.value)}
                    required
                    className="glass-input text-xs text-text-primary rounded-lg p-3 w-full h-32 resize-none placeholder-text-secondary/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">Broadcast Target</label>
                  <select
                    value={announceCohortId}
                    onChange={(e) => setAnnounceCohortId(e.target.value)}
                    className="glass-input text-xs text-text-primary rounded-lg p-2.5 w-full bg-bg-canvas"
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
            <h3 className="text-xs font-mono uppercase tracking-widest text-text-secondary">History Log ({announcements.length})</h3>
            <div className="overflow-x-auto glass-panel rounded-xl border border-border-brand">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-brand bg-bg-canvas/40 text-text-secondary font-mono">
                    <th className="p-4">Title</th>
                    <th className="p-4">Content</th>
                    <th className="p-4">Cohort</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-brand">
                  {announcements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-text-secondary">
                        No announcements published yet.
                      </td>
                    </tr>
                  ) : (
                    announcements.map((ann) => (
                      <tr key={ann.id} className="hover:bg-bg-surface-hover/20">
                        <td className="p-4 font-bold text-text-primary">{ann.title}</td>
                        <td className="p-4 text-text-secondary max-w-[200px] truncate" title={ann.content}>
                          {ann.content}
                        </td>
                        <td className="p-4 font-mono text-text-secondary">
                          {ann.cohorts?.name || 'Global (All Cohorts)'}
                        </td>
                        <td className="p-4 text-text-secondary">
                          {new Date(ann.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            variant="danger"
                            size="sm"
                            className="text-[10px] px-2 py-1"
                            disabled={actionLoading}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- EVENTS TAB PANEL --- */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Left Column: Create/Edit Form */}
          <div className="lg:col-span-1">
            <Card className="space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-secondary block">
                {editingEventId ? 'Modify Event Details' : 'Publish New Event'}
              </span>
              <form onSubmit={handleEventFormSubmit} className="space-y-4">
                <Input
                  label="Event Title"
                  id="ev-title"
                  placeholder="e.g. Next.js Masterclass"
                  value={eventTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                />
                
                <Input
                  label="Clean URL Slug"
                  id="ev-slug"
                  placeholder="e.g. nextjs-masterclass"
                  value={eventSlug}
                  onChange={(e) => setEventSlug(e.target.value)}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Provide a detailed description of the event..."
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    className="glass-input text-xs text-text-primary rounded-lg p-2.5 w-full bg-bg-canvas/80 border border-border-brand focus:outline-none focus:ring-1 focus:ring-primary-blue min-h-[100px]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">Event Format</label>
                  <select
                    value={eventType}
                    onChange={(e: any) => setEventType(e.target.value)}
                    className="glass-input text-xs text-text-primary rounded-lg p-2.5 w-full bg-bg-canvas/80 border border-border-brand focus:outline-none focus:ring-1 focus:ring-primary-blue"
                  >
                    <option value="online">Online Webinar</option>
                    <option value="in_person">In-Person Meetup</option>
                  </select>
                </div>

                {eventType === 'in_person' ? (
                  <Input
                    label="Physical Address Venue"
                    id="ev-location"
                    placeholder="e.g. Room 4, Sena Campus, Accra"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    required
                  />
                ) : (
                  <Input
                    label="Online Meeting Link URL"
                    id="ev-link"
                    placeholder="e.g. https://meet.google.com/..."
                    value={eventMeetingLink}
                    onChange={(e) => setEventMeetingLink(e.target.value)}
                    required
                  />
                )}

                <Input
                  label="Cover Image URL (Optional)"
                  id="ev-cover"
                  placeholder="https://domain.com/image.jpg"
                  value={eventCoverUrl}
                  onChange={(e) => setEventCoverUrl(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Start Date & Time"
                    id="ev-start"
                    type="datetime-local"
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    required
                  />
                  <Input
                    label="End Date & Time"
                    id="ev-end"
                    type="datetime-local"
                    value={eventEnd}
                    onChange={(e) => setEventEnd(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-bg-canvas/50 border border-border-brand">
                  <span className="text-xs font-medium text-text-secondary">Is Paid Event?</span>
                  <input
                    type="checkbox"
                    checked={eventIsPaid}
                    onChange={(e) => setEventIsPaid(e.target.checked)}
                    className="h-4 w-4 rounded border-border-brand text-primary-blue focus:ring-primary-blue"
                  />
                </div>

                {eventIsPaid && (
                  <Input
                    label="Ticket Price (GHS)"
                    id="ev-price"
                    type="number"
                    placeholder="e.g. 50"
                    value={eventPrice}
                    onChange={(e) => setEventPrice(e.target.value)}
                    required
                  />
                )}

                <Input
                  label="Maximum Capacity (Optional)"
                  id="ev-capacity"
                  type="number"
                  placeholder="e.g. 50 (blank = unlimited)"
                  value={eventCapacity}
                  onChange={(e) => setEventCapacity(e.target.value)}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">Publishing Status</label>
                  <select
                    value={eventStatus}
                    onChange={(e: any) => setEventStatus(e.target.value)}
                    className="glass-input text-xs text-text-primary rounded-lg p-2.5 w-full bg-bg-canvas/80 border border-border-brand focus:outline-none focus:ring-1 focus:ring-primary-blue"
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="published">Published (Public)</option>
                    <option value="cancelled">Cancelled (Public Notice)</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    className="flex-1 text-xs bg-primary-blue hover:bg-blue-650"
                    disabled={eventFormSubmitting}
                  >
                    {eventFormSubmitting ? 'Saving...' : editingEventId ? 'Update Event' : 'Create Event'}
                  </Button>
                  {editingEventId && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={resetEventForm}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </div>

          {/* Right Column: Events List / RSVP view */}
          <div className="lg:col-span-2">
            {!selectedEvent ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border-brand">
                  <span className="text-xs font-mono uppercase tracking-widest text-text-secondary">
                    Active Academy Events ({eventsList.length})
                  </span>
                </div>
                <div className="glass-panel rounded-xl overflow-hidden border border-border-brand bg-bg-canvas/50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border-brand bg-bg-surface-hover/40 text-text-secondary font-mono uppercase tracking-wider text-[10px]">
                          <th className="p-4">Title</th>
                          <th className="p-4">Format</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Price</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-brand text-text-primary">
                        {eventsList.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-text-secondary italic">
                              No events created on the platform yet.
                            </td>
                          </tr>
                        ) : (
                          eventsList.map((ev) => (
                            <tr key={ev.id} className="hover:bg-bg-surface-hover/30">
                              <td className="p-4 font-semibold text-text-primary truncate max-w-[150px]" title={ev.title}>
                                {ev.title}
                              </td>
                              <td className="p-4 capitalize">{ev.event_type.replace('_', ' ')}</td>
                              <td className="p-4 text-text-secondary">
                                {new Date(ev.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </td>
                              <td className="p-4">
                                {ev.is_paid ? `GHS ${ev.price}` : 'Free'}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                  ev.status === 'published' 
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                    : ev.status === 'cancelled'
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : 'bg-bg-surface-hover text-text-secondary border border-border-brand'
                                }`}>
                                  {ev.status}
                                </span>
                              </td>
                              <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => loadEventForEdit(ev)}
                                  className="text-[10px] px-2 py-1"
                                >
                                  Edit
                                </Button>
                                <a
                                  href={`/events/${ev.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center text-[10px] px-2 py-1 bg-bg-surface-hover text-text-primary border border-border-brand rounded-md hover:bg-bg-surface-hover hover:text-white transition-colors"
                                >
                                  View
                                </a>
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => {
                                    setSelectedEvent(ev);
                                    if (typeof window !== 'undefined') {
                                      sessionStorage.setItem('admin_selected_event_id', ev.id);
                                    }
                                    fetchRegistrants(ev.id);
                                  }}
                                  className="text-[10px] px-2 py-1"
                                >
                                  RSVPs
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Back Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border-brand">
                  <button
                    onClick={() => {
                      setSelectedEvent(null);
                      if (typeof window !== 'undefined') {
                        sessionStorage.removeItem('admin_selected_event_id');
                      }
                    }}
                    className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer text-text-secondary hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back to Events
                  </button>
                  <Button
                    onClick={() => handleExportTable('event_registrations', selectedEvent.id)}
                    className="text-[10px] px-3 py-1.5 flex items-center gap-1.5 bg-bg-surface-hover border border-border-brand"
                    disabled={exportLoading}
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-primary-blue" />
                    {exportLoading ? 'Exporting...' : 'Export RSVPs (CSV)'}
                  </Button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-text-primary">{selectedEvent.title} RSVP Registry</h3>
                  <p className="text-[11px] text-text-secondary">
                    Format: <span className="capitalize text-text-secondary">{selectedEvent.event_type}</span> | 
                    Price: <span className="text-text-secondary">{selectedEvent.is_paid ? `GHS ${selectedEvent.price}` : 'Free'}</span> |
                    Capacity: <span className="text-text-secondary">{selectedEvent.capacity ? `${registrants.length} / ${selectedEvent.capacity} filled` : `${registrants.length} registered`}</span>
                  </p>
                </div>

                <div className="glass-panel rounded-xl overflow-hidden border border-border-brand bg-bg-canvas/50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border-brand bg-bg-surface-hover/40 text-text-secondary font-mono uppercase tracking-wider text-[10px]">
                          <th className="p-4">Name</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Payment</th>
                          <th className="p-4">Checked-In</th>
                          <th className="p-4 text-right">Registered At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-brand text-text-primary">
                        {loadingRegistrants ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-text-secondary">
                              <span className="flex items-center gap-2 justify-center">
                                <Loader2 className="h-4 w-4 animate-spin text-primary-blue" />
                                Retrieving registrants list...
                              </span>
                            </td>
                          </tr>
                        ) : registrants.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-text-secondary italic">
                              No attendees registered for this event yet.
                            </td>
                          </tr>
                        ) : (
                          registrants.map((reg) => (
                            <tr key={reg.id} className="hover:bg-bg-surface-hover/30">
                              <td className="p-4 font-semibold text-text-primary">{reg.full_name}</td>
                              <td className="p-4 text-text-secondary">{reg.email}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                  reg.payment_status === 'paid' 
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                    : reg.payment_status === 'pending'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-bg-surface-hover text-text-secondary border border-border-brand'
                                }`}>
                                  {reg.payment_status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="p-4">
                                <input
                                  type="checkbox"
                                  checked={reg.checked_in}
                                  onChange={() => handleToggleCheckIn(reg.id, reg.checked_in)}
                                  className="h-4 w-4 rounded border-border-brand text-primary-blue focus:ring-primary-blue cursor-pointer"
                                />
                              </td>
                              <td className="p-4 text-right text-text-secondary">
                                {new Date(reg.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- SETTINGS TAB PANEL --- */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-6 animate-fade-in">
          <div className="pb-4 border-b border-border-brand">
            <h3 className="text-sm font-semibold text-white">System Settings & Data Backups</h3>
            <p className="text-xs text-text-secondary mt-1">Perform administrative tasks, manage platform exports, and clean up system storage.</p>
          </div>

          <Card className="space-y-4">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="h-5 w-5 text-primary-blue" />
              <div>
                <h4 className="text-sm font-bold text-text-primary">Data Export Manager</h4>
                <p className="text-[11px] text-text-secondary mt-0.5">Select any system registry database table to dump and download as an RFC 4180 compliant CSV file.</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">Select Database Table</label>
                <select
                  value={exportTable}
                  onChange={(e) => setExportTable(e.target.value)}
                  className="glass-input text-xs text-text-primary rounded-lg p-2.5 w-full bg-bg-canvas/80 border border-border-brand focus:outline-none focus:ring-1 focus:ring-primary-blue"
                >
                  <option value="payments">Payments Log (payments)</option>
                  <option value="profiles">Student / Facilitator Profiles (profiles)</option>
                  <option value="submissions">Submissions Log (submissions)</option>
                  <option value="modules">Curriculum Modules (modules)</option>
                  <option value="access_codes">Access Codes Registry (access_codes)</option>
                  <option value="events">Academy Events (events)</option>
                  <option value="event_registrations">Event Registrations (event_registrations)</option>
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
              <Megaphone className="h-5 w-5 text-accent-primary" />
              <div>
                <h4 className="text-sm font-bold text-text-primary">WhatsApp Community Settings</h4>
                <p className="text-[11px] text-text-secondary mt-0.5">Configure the manually-declared WhatsApp group member count displayed on the public landing page.</p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary" htmlFor="whatsapp-member-count-input">
                  WhatsApp Member Count (Display Value)
                </label>
                <input
                  id="whatsapp-member-count-input"
                  type="text"
                  placeholder="e.g. 238"
                  value={whatsappMemberCountInput}
                  onChange={(e) => setWhatsappMemberCountInput(e.target.value)}
                  className="glass-input text-xs text-text-primary rounded-lg p-2.5 w-full bg-bg-canvas/80 border border-border-brand focus:outline-none focus:ring-1 focus:ring-primary-blue"
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

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { Card, Button, Input } from '@/components/UI';
import {
  ClipboardList,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Download,
  Code2,
  Globe,
  FileText,
  Award,
  ArrowLeft,
  Trash2,
} from 'lucide-react';

interface SubmissionData {
  id: string;
  module_id: string;
  student_id: string;
  submission_date: string;
  zip_file_url: string | null;
  pdf_file_url: string | null;
  github_url: string | null;
  vercel_url: string | null;
  drive_url: string | null;
  comments: string | null;
  status: 'submitted' | 'graded' | 'resubmission_requested';
  score: number | null;
  draft_feedback_json: any | null;
  zip_file_deleted: boolean;
  pdf_file_deleted: boolean;
  profiles: {
    full_name: string;
    email: string;
  };
  modules: {
    module_number: number;
    title: string;
    assignment_title: string;
    assignment_deadline: string;
    assignment_rubric: Array<{ criteria: string; max_points: number }>;
  };
}

export default function FacilitatorPage() {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected submission for grading
  const [activeSubmission, setActiveSubmission] = useState<SubmissionData | null>(null);

  // Grading states
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  // File deletion states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingFileType, setDeletingFileType] = useState<'zip' | 'pdf' | null>(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const triggerDeleteConfirm = (type: 'zip' | 'pdf') => {
    setDeletingFileType(type);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteFileSubmit = async () => {
    if (!activeSubmission || !deletingFileType) return;
    setSubmittingDelete(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('You must be logged in to delete files.');

      const res = await fetch('/api/admin/delete-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          submissionId: activeSubmission.id,
          fileType: deletingFileType,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to delete file from storage.');
      }

      showToast('File Deleted', result.message || 'File removed successfully.', 'success');

      // Update local state for active submission
      const updatedSub = {
        ...activeSubmission,
        [deletingFileType === 'zip' ? 'zip_file_url' : 'pdf_file_url']: null,
        [deletingFileType === 'zip' ? 'zip_file_deleted' : 'pdf_file_deleted']: true,
      };

      setActiveSubmission(updatedSub);

      // Update submissions list
      setSubmissions((prev) =>
        prev.map((s) => (s.id === activeSubmission.id ? updatedSub : s))
      );
      setDeleteConfirmOpen(false);
    } catch (err: any) {
      showToast('Error', err.message || 'An unexpected error occurred.', 'error');
    } finally {
      setSubmittingDelete(false);
    }
  };

  // Autosave draft references & hook
  const hasUserModified = useRef(false);

  useEffect(() => {
    if (!activeSubmission || !hasUserModified.current) return;
    if (activeSubmission.status === 'graded') return;

    const timer = setTimeout(async () => {
      // Calculate overall score (same logic as final submit)
      let totalPoints = 0;
      let maxPoints = 0;
      activeSubmission.modules.assignment_rubric.forEach((item) => {
        totalPoints += rubricScores[item.criteria] ?? 0;
        maxPoints += item.max_points;
      });
      const calculatedScore = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

      const draftPayload = {
        score: calculatedScore,
        strengths,
        weaknesses,
        suggestions,
        rubric_scores: rubricScores,
        updated_at: new Date().toISOString(),
      };

      try {
        const { error } = await supabase
          .from('submissions')
          .update({ draft_feedback_json: draftPayload })
          .eq('id', activeSubmission.id);
        
        if (error) {
          console.error('Failed to autosave draft:', error.message);
        }
      } catch (err) {
        console.error('Unexpected error autosaving draft:', err);
      }
    }, 2000); // 2 seconds debounce

    return () => clearTimeout(timer);
  }, [rubricScores, strengths, weaknesses, suggestions, activeSubmission]);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          profiles:student_id (
            full_name,
            email
          ),
          modules:module_id (
            module_number,
            title,
            assignment_title,
            assignment_deadline,
            assignment_rubric
          )
        `)
        .order('submission_date', { ascending: true });

      if (error) throw error;
      if (data) {
        const submissionList = data as unknown as SubmissionData[];
        setSubmissions(submissionList);
        
        // Restore active submission if saved in sessionStorage
        if (typeof window !== 'undefined') {
          const storedSubId = sessionStorage.getItem('facilitator_active_submission_id');
          if (storedSubId) {
            const found = submissionList.find(s => s.id === storedSubId);
            if (found) {
              handleOpenGrade(found);
            }
          }
        }
      }
    } catch (err: any) {
      showToast('Error', 'Failed to load submissions: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open grading suite for a submission
  const handleOpenGrade = (sub: SubmissionData) => {
    hasUserModified.current = false; // Reset modification flag on load
    setActiveSubmission(sub);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('facilitator_active_submission_id', sub.id);
    }
    
    if (sub.draft_feedback_json) {
      const draft = sub.draft_feedback_json as any;
      setStrengths(draft.strengths || '');
      setWeaknesses(draft.weaknesses || '');
      setSuggestions(draft.suggestions || '');
      setRubricScores(draft.rubric_scores || {});
    } else {
      setStrengths('');
      setWeaknesses('');
      setSuggestions('');
      
      // Initialize rubric scores to max points by default
      const initialScores: Record<string, number> = {};
      sub.modules.assignment_rubric.forEach((item) => {
        initialScores[item.criteria] = item.max_points;
      });
      setRubricScores(initialScores);
    }
  };

  const handleRubricScoreChange = (criteria: string, score: number) => {
    hasUserModified.current = true;
    setRubricScores((prev) => ({
      ...prev,
      [criteria]: score,
    }));
  };

  const handleDownload = async (objectKey: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        alert('You must be logged in to download files.');
        return;
      }

      const res = await fetch(`/api/download-url?key=${encodeURIComponent(objectKey)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to retrieve download link.');
      }

      const { downloadUrl } = await res.json();
      window.open(downloadUrl, '_blank');
    } catch (err: any) {
      alert(err.message || 'Error downloading file');
    }
  };

  // Submit Grade
  const handleApproveGrade = async () => {
    if (!activeSubmission || !user) return;

    // Calculate score
    const totalPoints = activeSubmission.modules.assignment_rubric.reduce((acc, curr) => acc + curr.max_points, 0);
    const scoredPoints = Object.values(rubricScores).reduce((acc, curr) => acc + curr, 0);
    const finalScore = totalPoints > 0 ? Math.round((scoredPoints / totalPoints) * 100) : 0;

    setSubmittingGrade(true);
    try {
      const feedbackPayload = {
        score: finalScore,
        strengths,
        weaknesses,
        suggestions,
        rubric_scores: rubricScores,
        grader_id: user.id,
        graded_at: new Date().toISOString(),
      };

      // 1. Update Submissions table
      const { error: subError } = await supabase
        .from('submissions')
        .update({
          status: 'graded',
          score: finalScore,
          feedback_json: feedbackPayload,
          draft_feedback_json: null, // Clear draft!
        })
        .eq('id', activeSubmission.id);

      if (subError) throw subError;

      // 2. Insert notification for the student
      const { error: notifError } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: activeSubmission.student_id,
            title: `Assignment Graded: Module ${activeSubmission.modules.module_number}`,
            message: `Your project for ${activeSubmission.modules.title} has been evaluated. Score: ${finalScore}%`,
            link: `/student/modules?id=${activeSubmission.module_id}`,
          },
        ]);

      if (notifError) throw notifError;

      showToast('Grade Approved', `Score of ${finalScore}% assigned to ${activeSubmission.profiles.full_name}`, 'success');
      setActiveSubmission(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('facilitator_active_submission_id');
      }
      await fetchSubmissions();
    } catch (err: any) {
      showToast('Error', 'Failed to approve grade: ' + err.message, 'error');
    } finally {
      setSubmittingGrade(false);
    }
  };

  // Request Resubmission
  const handleRequestResubmission = async () => {
    if (!activeSubmission) return;

    setSubmittingGrade(true);
    try {
      const feedbackPayload = {
        score: 0,
        strengths: strengths || 'Please review recommendations.',
        weaknesses: weaknesses || 'Requirements missing.',
        suggestions: suggestions || 'Resubmission requested.',
        rubric_scores: rubricScores,
        grader_id: user?.id,
        graded_at: new Date().toISOString(),
      };

      // 1. Update status to resubmission requested
      const { error: subError } = await supabase
        .from('submissions')
        .update({
          status: 'resubmission_requested',
          feedback_json: feedbackPayload,
        })
        .eq('id', activeSubmission.id);

      if (subError) throw subError;

      // 2. Insert student notification
      const { error: notifError } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: activeSubmission.student_id,
            title: `Revision Requested: Module ${activeSubmission.modules.module_number}`,
            message: `The mentor requested modifications for ${activeSubmission.modules.title}.`,
            link: `/student/modules?id=${activeSubmission.module_id}`,
          },
        ]);

      if (notifError) throw notifError;

      showToast('Revision Requested', `Notification sent to ${activeSubmission.profiles.full_name}`, 'warning');
      setActiveSubmission(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('facilitator_active_submission_id');
      }
      await fetchSubmissions();
    } catch (err: any) {
      showToast('Error', 'Resubmission request failed: ' + err.message, 'error');
    } finally {
      setSubmittingGrade(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <div className="relative w-10 h-10 flex items-center justify-center bg-white rounded-lg p-1.5 shadow-[0_4px_12px_rgba(5,82,254,0.15)] animate-pulse">
          <img src="/logo_icon.png" alt="Loading" className="h-full w-full object-contain" />
        </div>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Loading submissions details...</p>
      </div>
    );
  }

  // Filter Submissions
  const pendingSubmissions = submissions.filter((s) => s.status === 'submitted');
  const gradedSubmissions = submissions.filter((s) => s.status === 'graded');

  return (
    <div className="space-y-8">
      {/* If Grading suite is active, render it, otherwise render dashboard */}
      {activeSubmission ? (
        <div className="space-y-6 animate-fade-in">
          {/* Back Action Header */}
          <button
            onClick={() => {
              setActiveSubmission(null);
              if (typeof window !== 'undefined') {
                sessionStorage.removeItem('facilitator_active_submission_id');
              }
            }}
            className="flex items-center gap-2 text-xs font-mono text-zinc-550 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Queue
          </button>

          {/* Submission and Student summary card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-900">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-supporting-purple bg-supporting-purple/10 px-2 py-0.5 rounded">
                  Module {activeSubmission.modules.module_number}
                </span>
                <span className="text-xs text-zinc-500">Submitted by: {activeSubmission.profiles.full_name}</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white mt-1">
                Grading: {activeSubmission.modules.title}
              </h2>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleRequestResubmission} disabled={submittingGrade}>
                Request Revision
              </Button>
              <Button onClick={handleApproveGrade} disabled={submittingGrade}>
                {submittingGrade ? 'Submitting...' : 'Approve Grade'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col - Student work links and comments */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">Workspace Assets</span>

                <div className="space-y-2.5 text-xs">
                  {/* ZIP Archive handling */}
                  {activeSubmission.zip_file_url ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(activeSubmission.zip_file_url!)}
                        className="flex-1 flex items-center gap-2.5 p-3 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/60 text-zinc-450 hover:text-zinc-200 transition-all text-left cursor-pointer"
                      >
                        <Download className="h-4 w-4 text-supporting-purple" />
                        <span className="truncate">Download ZIP Archive</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerDeleteConfirm('zip')}
                        className="p-3 rounded-lg border border-red-950/40 bg-red-950/10 hover:bg-red-950/30 text-red-450 hover:text-red-300 transition-all cursor-pointer flex items-center justify-center"
                        title="Delete file from storage"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : activeSubmission.zip_file_deleted ? (
                    <div className="p-3 rounded-lg border border-zinc-900 bg-zinc-950/20 text-zinc-650 italic text-[11px] flex items-center gap-2">
                      <AlertCircle className="h-3.5 w-3.5 text-zinc-600" />
                      ZIP Archive removed to save storage space.
                    </div>
                  ) : null}

                  {/* PDF Document handling */}
                  {activeSubmission.pdf_file_url ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(activeSubmission.pdf_file_url!)}
                        className="flex-1 flex items-center gap-2.5 p-3 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/60 text-zinc-450 hover:text-zinc-200 transition-all text-left cursor-pointer"
                      >
                        <FileText className="h-4 w-4 text-supporting-purple" />
                        <span className="truncate">Download PDF Document</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerDeleteConfirm('pdf')}
                        className="p-3 rounded-lg border border-red-950/40 bg-red-950/10 hover:bg-red-950/30 text-red-450 hover:text-red-300 transition-all cursor-pointer flex items-center justify-center"
                        title="Delete file from storage"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : activeSubmission.pdf_file_deleted ? (
                    <div className="p-3 rounded-lg border border-zinc-900 bg-zinc-950/20 text-zinc-650 italic text-[11px] flex items-center gap-2">
                      <AlertCircle className="h-3.5 w-3.5 text-zinc-600" />
                      PDF Document removed to save storage space.
                    </div>
                  ) : null}

                  {activeSubmission.github_url && (
                    <a
                      href={activeSubmission.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-3 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/60 text-zinc-450 hover:text-zinc-200 transition-all"
                    >
                      <Code2 className="h-4 w-4 text-supporting-purple" />
                      <span className="truncate">Open GitHub Repository</span>
                      <ExternalLink className="h-3.5 w-3.5 ml-auto" />
                    </a>
                  )}

                  {activeSubmission.vercel_url && (
                    <a
                      href={activeSubmission.vercel_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-3 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/60 text-zinc-450 hover:text-zinc-200 transition-all"
                    >
                      <Globe className="h-4 w-4 text-supporting-purple" />
                      <span className="truncate">Open Live Deployment</span>
                      <ExternalLink className="h-3.5 w-3.5 ml-auto" />
                    </a>
                  )}

                  {activeSubmission.drive_url && (
                    <a
                      href={activeSubmission.drive_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-3 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/60 text-zinc-450 hover:text-zinc-200 transition-all"
                    >
                      <FileText className="h-4 w-4 text-supporting-purple" />
                      <span className="truncate">Open Google Drive URL</span>
                      <ExternalLink className="h-3.5 w-3.5 ml-auto" />
                    </a>
                  )}

                  {!activeSubmission.zip_file_url &&
                    !activeSubmission.pdf_file_url &&
                    !activeSubmission.github_url &&
                    !activeSubmission.vercel_url &&
                    !activeSubmission.drive_url && (
                      <p className="text-zinc-600 italic">No links or files submitted.</p>
                    )}
                </div>
              </Card>

              {activeSubmission.comments && (
                <Card className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">Student Notes</span>
                  <p className="text-xs text-zinc-450 leading-relaxed bg-zinc-950 p-3 rounded-lg border border-zinc-900">
                    {activeSubmission.comments}
                  </p>
                </Card>
              )}
            </div>

            {/* Right Col - Grading sheets and sliders */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="space-y-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">Rubric Evaluation</span>

                <div className="space-y-5">
                  {activeSubmission.modules.assignment_rubric.map((rub, idx) => {
                    const currentVal = rubricScores[rub.criteria] ?? rub.max_points;
                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-zinc-300 capitalize">{rub.criteria}</span>
                          <span className="text-supporting-purple font-mono">
                            {currentVal} <span className="text-zinc-500 font-normal">/ {rub.max_points} pts</span>
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={rub.max_points}
                          value={currentVal}
                          onChange={(e) => handleRubricScoreChange(rub.criteria, parseInt(e.target.value))}
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-supporting-purple"
                        />
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Written Feedback Form */}
              <Card className="space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">Written Feedback</span>

                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-zinc-400">Strengths</label>
                    <textarea
                      placeholder="What did the student do exceptionally well?"
                      value={strengths}
                      onChange={(e) => { setStrengths(e.target.value); hasUserModified.current = true; }}
                      className="glass-input text-xs text-zinc-100 rounded-lg p-3 w-full h-20 resize-none placeholder-zinc-650"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-zinc-400">Weaknesses</label>
                    <textarea
                      placeholder="What requirements were missing or incorrect?"
                      value={weaknesses}
                      onChange={(e) => { setWeaknesses(e.target.value); hasUserModified.current = true; }}
                      className="glass-input text-xs text-zinc-100 rounded-lg p-3 w-full h-20 resize-none placeholder-zinc-650"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-zinc-400">Suggestions / Recommendations</label>
                    <textarea
                      placeholder="How can they improve their build in the future?"
                      value={suggestions}
                      onChange={(e) => { setSuggestions(e.target.value); hasUserModified.current = true; }}
                      className="glass-input text-xs text-zinc-100 rounded-lg p-3 w-full h-20 resize-none placeholder-zinc-650"
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        // Main Dashboard queue view
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-900">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Grading Dashboard</h2>
              <p className="text-xs text-zinc-500 mt-1">Review student submissions and assign grades according to criteria rubrics.</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
              <span>Pending Queue: <span className="text-supporting-purple font-bold">{pendingSubmissions.length}</span></span>
              <span>•</span>
              <span>Graded: <span className="text-success-green font-bold">{gradedSubmissions.length}</span></span>
            </div>
          </div>

          {/* Pending Submissions Queue list */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Grading Queue ({pendingSubmissions.length})</h3>

            {pendingSubmissions.length === 0 ? (
              <Card className="text-center py-16">
                <CheckCircle className="h-9 w-9 text-success-green/20 stroke-[1.5] mx-auto mb-2" />
                <p className="text-xs text-zinc-500">All submissions are graded.</p>
                <p className="text-[10px] text-zinc-650 mt-1">Good work! No items are currently waiting in your queue.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {pendingSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => handleOpenGrade(sub)}
                    className="glass-panel p-5 rounded-xl border border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-zinc-900/30 hover:border-zinc-800 transition-all group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Module {sub.modules.module_number}</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-supporting-purple"></span>
                        <span className="text-[10px] font-mono text-zinc-500 truncate max-w-[120px]">{sub.profiles.full_name}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                        {sub.modules.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 text-xs text-zinc-500">
                      <span className="font-mono">
                        Submitted: {new Date(sub.submission_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <ChevronRight className="h-4.5 w-4.5 text-zinc-600 group-hover:text-supporting-purple transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Graded History Queue list */}
          {gradedSubmissions.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Graded Submissions ({gradedSubmissions.length})</h3>
              <div className="grid grid-cols-1 gap-3">
                {gradedSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="glass-panel p-5 rounded-xl border border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Module {sub.modules.module_number}</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-success-green"></span>
                        <span className="text-[10px] font-mono text-zinc-500">{sub.profiles.full_name}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-zinc-300">
                        {sub.modules.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <span className="text-[10px] font-mono text-zinc-500">
                        Score: <span className="text-success-green font-bold font-sans text-xs">{sub.score}%</span>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        Graded: {new Date(sub.submission_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete File Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <Card className="w-full max-w-md border border-zinc-800 bg-zinc-950 p-6 relative">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-error-red">
                <AlertCircle className="h-5 w-5" />
                <h3 className="text-lg font-bold text-white tracking-tight">Delete File from Storage?</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                This permanently deletes the uploaded <strong>{deletingFileType === 'zip' ? 'ZIP Archive' : 'PDF Document'}</strong> from Cloudflare R2 storage. 
                The submission record, grade, and feedback are kept — only the file itself is removed. 
                <strong className="text-zinc-300"> This cannot be undone.</strong>
              </p>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 cursor-pointer"
                  disabled={submittingDelete}
                >
                  Cancel
                </button>
                <Button
                  onClick={handleDeleteFileSubmit}
                  className="text-xs bg-error-red hover:bg-red-700 text-white"
                  disabled={submittingDelete}
                >
                  {submittingDelete ? 'Deleting...' : 'Delete Permanently'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { supabase } from '@/lib/supabase';
import { Card, AccentCard, Button, Input } from '@/components/UI';
import { 
  BookOpen, 
  Clock, 
  FileText, 
  ExternalLink, 
  ChevronRight, 
  UploadCloud, 
  Code2, 
  Globe, 
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface RubricItem {
  criteria: string;
  max_points: number;
}

interface ResourceItem {
  name: string;
  url: string;
  category?: string;
}

interface Module {
  id: string;
  module_number: number;
  title: string;
  description: string;
  unlock_date: string;
  is_visible: boolean;
  objectives: string[];
  resources: ResourceItem[];
  assignment_title: string;
  assignment_description: string;
  assignment_deadline: string;
  assignment_rubric: RubricItem[];
}

interface Submission {
  id: string;
  status: 'pending' | 'submitted' | 'graded' | 'resubmission_requested';
  github_url: string | null;
  vercel_url: string | null;
  drive_url: string | null;
  zip_file_url?: string | null;
  pdf_file_url?: string | null;
  comments: string | null;
  score: number | null;
  submission_date: string;
  feedback_json: {
    rubric_scores?: Record<string, number>;
    strengths?: string;
    weaknesses?: string;
    suggestions?: string;
  } | null;
}

export default function StudentModules() {
  const { user, profile } = useAuth();
  const { showToast } = useNotifications();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [githubUrl, setGithubUrl] = useState('');
  const [vercelUrl, setVercelUrl] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [comments, setComments] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Interaction states
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch modules
  useEffect(() => {
    if (!user || !profile) return;

    const fetchModules = async () => {
      try {
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .order('module_number', { ascending: true });

        if (error) throw error;
        if (data) {
          // Filter unlocked modules based on unlock_date
          const unlocked = (data as Module[]).filter(
            (m) => new Date(m.unlock_date) <= new Date() && m.is_visible
          );
          setModules(unlocked);

          // Select module based on query param, fallback to first
          const queryId = searchParams.get('id');
          if (queryId) {
            const found = unlocked.find((m) => m.id === queryId);
            if (found) setSelectedModule(found);
            else if (unlocked.length > 0) setSelectedModule(unlocked[0]);
          } else if (unlocked.length > 0) {
            setSelectedModule(unlocked[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load modules:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [user, profile, searchParams]);

  // Fetch submission for selected module
  useEffect(() => {
    if (!user || !selectedModule) return;

    const fetchSubmission = async () => {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .eq('module_id', selectedModule.id)
          .eq('student_id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setSubmission(data as Submission);
          setGithubUrl(data.github_url || '');
          setVercelUrl(data.vercel_url || '');
          setDriveUrl(data.drive_url || '');
          setComments(data.comments || '');
        } else {
          setSubmission(null);
          setGithubUrl('');
          setVercelUrl('');
          setDriveUrl('');
          setComments('');
          setSelectedFile(null);
        }
      } catch (err) {
        console.error('Failed to fetch submission details:', err);
      }
    };

    fetchSubmission();
  }, [user, selectedModule]);

  // Drag & Drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'zip' || ext === 'pdf') {
        setSelectedFile(file);
      } else {
        showToast('Invalid File', 'Only ZIP or PDF uploads are supported.', 'error');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule || !user) return;

    if (!selectedFile && !githubUrl && !vercelUrl && !driveUrl) {
      showToast('Error', 'Please attach a ZIP/PDF file or provide repository links.', 'error');
      return;
    }

    setUploading(true);
    try {
      let zip_file_url = submission?.zip_file_url || null;
      let pdf_file_url = submission?.pdf_file_url || null;

      // Perform file upload if selected
      if (selectedFile) {
        const ext = selectedFile.name.split('.').pop()?.toLowerCase();
        const fileName = `${user.id}/${selectedModule.id}_${Date.now()}.${ext}`;

        // Get Cloudflare R2 Presigned Upload URL
        const res = await fetch('/api/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName, contentType: selectedFile.type })
        });
        const urlData = await res.json();
        if (!res.ok) throw new Error(urlData.error || 'Failed to initialize R2 bucket upload');

        // Put file direct to R2 presigned url
        const uploadRes = await fetch(urlData.uploadUrl, {
          method: 'PUT',
          body: selectedFile,
          headers: { 'Content-Type': selectedFile.type }
        });
        if (!uploadRes.ok) throw new Error('Cloudflare upload rejected file stream');

        // Confirm upload completion
        await fetch('/api/confirm-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath: urlData.filePath })
        });

        if (ext === 'zip') {
          zip_file_url = urlData.filePath;
          pdf_file_url = null; // Clear opposite if re-uploading
        } else {
          pdf_file_url = urlData.filePath;
          zip_file_url = null;
        }
      }

      // Upsert student submission row
      const payload = {
        student_id: user.id,
        module_id: selectedModule.id,
        github_url: githubUrl || null,
        vercel_url: vercelUrl || null,
        drive_url: driveUrl || null,
        comments: comments || null,
        zip_file_url,
        pdf_file_url,
        status: 'submitted',
        submission_date: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('submissions')
        .upsert(payload, { onConflict: 'student_id,module_id' })
        .select()
        .single();

      if (error) throw error;
      setSubmission(data as Submission);
      setSelectedFile(null);
      showToast('Success', 'Project uploaded successfully!', 'success');
    } catch (err: any) {
      showToast('Submit Failed', err.message || 'System error during upload', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <div className="relative w-10 h-10 flex items-center justify-center bg-white rounded-lg p-1.5 shadow-[0_4px_12px_rgba(5,82,254,0.15)] animate-pulse">
          <img src="/logo_icon.jpg" alt="Loading" className="h-full w-full object-contain" />
        </div>
        <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">Loading modules data...</p>
      </div>
    );
  }

  const deadlineDate = selectedModule ? new Date(selectedModule.assignment_deadline) : null;
  const isDeadlinePassed = deadlineDate ? new Date() > deadlineDate : false;
  const isGraded = submission?.status === 'graded';
  const isResubmissionRequired = submission?.status === 'resubmission_requested';
  
  // Can submit if: not submitted at all, OR status is resubmission requested, OR (already submitted but not graded yet AND deadline has not passed)
  const canSubmit = !submission || isResubmissionRequired || (submission.status === 'submitted' && !isDeadlinePassed);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Left Sidebar Checklist of modules */}
      <div className="lg:col-span-1 space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-widest text-text-secondary mb-4 px-1">Curriculum</h3>
        {modules.map((mod) => {
          const isSelected = selectedModule?.id === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => {
                setSelectedModule(mod);
                router.push(`/student/modules?id=${mod.id}`);
              }}
              className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-accent-primary bg-accent-primary/10 text-text-primary shadow-[0_0_12px_rgba(5,82,254,0.05)] font-semibold'
                  : 'border-border-brand bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover/60'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono tracking-wider text-text-secondary">MODULE {mod.module_number}</span>
                <span className="text-xs truncate max-w-[120px]">{mod.title}</span>
              </div>
              <ChevronRight className={`h-4 w-4 ${isSelected ? 'text-accent-primary' : 'text-text-secondary'}`} />
            </button>
          );
        })}
      </div>

      {/* Main Selected Module Pane */}
      {selectedModule ? (
        <div className="lg:col-span-3 space-y-6 animate-fade-in">
          {/* Module Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded">
                Module {selectedModule.module_number}
              </span>
              {deadlineDate && (
                <span className="text-xs font-mono text-text-secondary flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Due: {deadlineDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">{selectedModule.title}</h2>
            <p className="text-sm text-text-secondary leading-relaxed">{selectedModule.description}</p>
          </div>

          {/* Outcomes & Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Objectives</span>
              <ul className="mt-3 space-y-2 text-xs text-text-secondary">
                {selectedModule.objectives && selectedModule.objectives.length > 0 ? (
                  selectedModule.objectives.map((obj, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <span className="text-accent-primary font-bold">•</span>
                      <span>{obj}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-text-secondary italic">No objectives documented.</p>
                )}
              </ul>
            </Card>

            <Card>
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Resource Library</span>
              <div className="mt-3 space-y-2.5">
                {selectedModule.resources && selectedModule.resources.length > 0 ? (
                  selectedModule.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg border border-border-brand bg-bg-canvas/50 hover:bg-bg-surface-hover hover:border-accent-primary/20 transition-all text-xs group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-text-secondary group-hover:text-text-primary transition-colors" />
                        <span className="text-text-primary font-semibold truncate max-w-[150px]">{res.name}</span>
                      </div>
                      <span className="text-[9px] uppercase font-mono text-text-secondary group-hover:text-accent-primary transition-colors flex items-center gap-1">
                        {res.category || 'Link'}
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    </a>
                  ))
                ) : (
                  <div className="text-center py-6 border border-dashed border-border-brand rounded-lg">
                    <FileText className="h-5 w-5 text-text-secondary opacity-60 mx-auto mb-1.5" />
                    <p className="text-[10px] text-text-secondary">No curriculum assets attached yet.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Grader Feedback (If graded) */}
          {isGraded && submission?.feedback_json && (
            <AccentCard accent="green" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-success-green">Project Graded</span>
                  <h3 className="text-sm font-bold text-text-primary">Facilitator Marksheet</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-mono font-bold text-success-green">{submission.score}%</span>
                  <p className="text-[10px] text-text-secondary font-mono">Overall Grade</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-y border-border-brand py-4">
                {selectedModule.assignment_rubric.map((item, idx) => {
                  const score = submission.feedback_json?.rubric_scores?.[item.criteria] ?? 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <p className="text-[10px] font-mono text-text-secondary uppercase">{item.criteria}</p>
                      <p className="text-sm font-bold text-text-primary">
                        {score} <span className="text-[10px] text-text-secondary font-normal">/ {item.max_points}</span>
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 pt-2 text-xs">
                {submission.feedback_json.strengths && (
                  <div>
                    <h4 className="font-bold text-text-primary">Strengths:</h4>
                    <p className="text-text-secondary mt-0.5 leading-relaxed">{submission.feedback_json.strengths}</p>
                  </div>
                )}
                {submission.feedback_json.weaknesses && (
                  <div>
                    <h4 className="font-bold text-text-primary">Weaknesses:</h4>
                    <p className="text-text-secondary mt-0.5 leading-relaxed">{submission.feedback_json.weaknesses}</p>
                  </div>
                )}
                {submission.feedback_json.suggestions && (
                  <div>
                    <h4 className="font-bold text-text-primary">Suggestions:</h4>
                    <p className="text-text-secondary mt-0.5 leading-relaxed">{submission.feedback_json.suggestions}</p>
                  </div>
                )}
              </div>
            </AccentCard>
          )}

          {/* Submission and Assignment Block */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-tight text-text-primary border-b border-border-brand pb-3 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-accent-primary" />
              Project Assignment: {selectedModule.assignment_title}
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">{selectedModule.assignment_description}</p>

            {/* Rubric View */}
            <div className="glass-panel rounded-xl p-4 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Grading Rubric</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedModule.assignment_rubric.map((item, idx) => (
                  <div key={idx} className="border-l border-border-brand pl-3">
                    <p className="text-[10px] font-mono text-text-secondary uppercase">{item.criteria}</p>
                    <p className="text-xs font-semibold text-text-primary mt-0.5">{item.max_points} Points Max</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Submission Form OR Read-Only Submitted Status */}
            {canSubmit ? (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {isResubmissionRequired && (
                  <div className="p-4 rounded-xl bg-warning-brand/5 border border-warning-brand/20 text-warning-brand text-xs">
                    <p className="font-semibold">Resubmission Requested:</p>
                    <p className="mt-1 opacity-90">Please review grader feedback and re-upload your files or update repository links.</p>
                  </div>
                )}

                {/* Upload drag & drop */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                    dragActive
                      ? 'border-accent-primary bg-accent-primary/5'
                      : 'border-border-brand bg-bg-canvas hover:bg-bg-surface-hover/60'
                  }`}
                  onClick={handleUploadClick}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <UploadCloud className="h-10 w-10 text-text-secondary mb-3" />
                  <p className="text-xs font-semibold text-text-primary">
                    {selectedFile ? selectedFile.name : 'Drag & drop ZIP or PDF file here'}
                  </p>
                  <p className="text-[10px] text-text-secondary mt-1">or click to browse local files (max 20MB)</p>
                </div>

                {/* URL inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Code2 className="absolute left-3.5 top-[38px] h-4 w-4 text-text-secondary" />
                    <Input
                      label="GitHub Repo Link"
                      id="github-link"
                      type="url"
                      placeholder="https://github.com/..."
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="pl-7"
                    />
                  </div>

                  <div className="relative">
                    <Globe className="absolute left-3.5 top-[38px] h-4 w-4 text-text-secondary" />
                    <Input
                      label="Vercel Deploy Link"
                      id="vercel-link"
                      type="url"
                      placeholder="https://...vercel.app"
                      value={vercelUrl}
                      onChange={(e) => setVercelUrl(e.target.value)}
                      className="pl-7"
                    />
                  </div>

                  <div className="relative">
                    <FileText className="absolute left-3.5 top-[38px] h-4 w-4 text-text-secondary" />
                    <Input
                      label="Google Drive Link"
                      id="drive-link"
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>

                <Input
                  label="Student Comments / Notes"
                  id="comments"
                  placeholder="Explain any details about your submission..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />

                <Button type="submit" className="w-full" disabled={uploading}>
                  {uploading ? 'Uploading Submission...' : submission ? 'Resubmit Project' : 'Submit Assignment'}
                </Button>
              </form>
            ) : (
              // Submitted, waiting for grade status
              <AccentCard accent="blue" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-accent-primary animate-pulse" />
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">Assignment Submitted</h4>
                      <p className="text-[10px] text-text-secondary mt-0.5">Awaiting facilitator review and grading.</p>
                    </div>
                  </div>
                  {submission.submission_date && (
                    <span className="text-[10px] font-mono text-text-secondary">
                      Date: {new Date(submission.submission_date).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-border-brand pt-4 text-xs">
                  {submission.github_url && (
                    <a
                      href={submission.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-bg-surface border border-border-brand text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors"
                    >
                      <Code2 className="h-4 w-4" />
                      <span className="truncate">GitHub Repository</span>
                      <ExternalLink className="h-3 w-3 ml-auto shrink-0" />
                    </a>
                  )}

                  {submission.vercel_url && (
                    <a
                      href={submission.vercel_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-bg-surface border border-border-brand text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="truncate">Live Deployment</span>
                      <ExternalLink className="h-3 w-3 ml-auto shrink-0" />
                    </a>
                  )}

                  {submission.drive_url && (
                    <a
                      href={submission.drive_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-bg-surface border border-border-brand text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="truncate">Google Drive URL</span>
                      <ExternalLink className="h-3 w-3 ml-auto shrink-0" />
                    </a>
                  )}
                </div>

                {submission.comments && (
                  <div className="bg-bg-canvas/50 p-4 rounded-lg border border-border-brand text-xs leading-relaxed">
                    <p className="font-semibold text-text-primary mb-1">Your comments:</p>
                    <p className="text-text-secondary">{submission.comments}</p>
                  </div>
                )}
              </AccentCard>
            )}
          </div>
        </div>
      ) : (
        <div className="lg:col-span-3 text-center py-24 glass-panel rounded-xl">
          <BookOpen className="h-10 w-10 text-text-secondary opacity-65 stroke-[1.5] mx-auto mb-2" />
          <p className="text-xs text-text-secondary">No unlocked curriculum modules found.</p>
        </div>
      )}
    </div>
  );
}

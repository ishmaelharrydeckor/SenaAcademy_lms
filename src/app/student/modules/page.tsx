'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { supabase } from '@/lib/supabase';
import { Card, Button, Input, AccentCard } from '@/components/UI';
import {
  BookOpen,
  Calendar,
  FileText,
  Code2,
  Globe,
  UploadCloud,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Lock,
} from 'lucide-react';

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

interface Submission {
  id?: string;
  module_id: string;
  student_id: string;
  submission_date?: string;
  zip_file_url: string | null;
  pdf_file_url: string | null;
  github_url: string | null;
  vercel_url: string | null;
  drive_url: string | null;
  comments: string | null;
  status: 'submitted' | 'graded' | 'resubmission_requested';
  score: number | null;
  feedback_json: {
    score: number;
    strengths: string;
    weaknesses: string;
    suggestions: string;
    rubric_scores: Record<string, number>;
  } | null;
}

export default function StudentModulesPage() {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [githubUrl, setGithubUrl] = useState('');
  const [vercelUrl, setVercelUrl] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [comments, setComments] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop state
  const [dragActive, setDragActive] = useState(false);

  // Fetch URL query ID
  const urlModuleId = searchParams.get('id');

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    if (modules.length > 0) {
      let activeMod = modules[0];
      if (urlModuleId) {
        const found = modules.find((m) => m.id === urlModuleId);
        if (found) activeMod = found;
      }
      setSelectedModule(activeMod);
    }
  }, [modules, urlModuleId]);

  useEffect(() => {
    if (selectedModule && user) {
      fetchSubmission(selectedModule.id);
    }
  }, [selectedModule, user]);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('module_number', { ascending: true });

      if (error) throw error;
      if (data) {
        // filter out completely locked modules for safety
        const now = new Date();
        const visible = (data as Module[]).filter(
          (m) => m.is_visible && new Date(m.unlock_date) <= now
        );
        setModules(visible);
      }
    } catch (err: any) {
      showToast('Error', 'Failed to load modules: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmission = async (moduleId: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('module_id', moduleId)
        .eq('student_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSubmission(data as Submission);
        setGithubUrl(data.github_url || '');
        setVercelUrl(data.vercel_url || '');
        setDriveUrl(data.drive_url || '');
        setComments(data.comments || '');
        setSelectedFile(null);
      } else {
        setSubmission(null);
        setGithubUrl('');
        setVercelUrl('');
        setDriveUrl('');
        setComments('');
        setSelectedFile(null);
      }
    } catch (err: any) {
      console.error('Error fetching submission:', err);
    }
  };

  // Drag and drop handlers
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
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'zip' && ext !== 'pdf') {
      showToast('Invalid File Type', 'Please upload a ZIP or PDF file only.', 'warning');
      return;
    }

    const MAX_SIZE = 25 * 1024 * 1024; // 25MB
    if (file.size > MAX_SIZE) {
      showToast('File Too Large', 'Please select a file smaller than 25MB.', 'warning');
      return;
    }

    setSelectedFile(file);
    showToast('File selected', `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`, 'success');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule || !user) return;

    const isLate = new Date() > new Date(selectedModule.assignment_deadline);
    
    // Check if zip/pdf is required but missing on new submission
    if (!submission && !selectedFile && !githubUrl && !driveUrl) {
      showToast('Submission incomplete', 'Provide a ZIP/PDF file, a GitHub link, or a Drive link.', 'warning');
      return;
    }

    setUploading(true);
    try {
      let zipUrl = submission?.zip_file_url || null;
      let pdfUrl = submission?.pdf_file_url || null;

      // Handle file upload to Cloudflare R2 if file is selected
      if (selectedFile) {
        // Retrieve session token
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error('You must be logged in to upload files.');

        // 1. Get presigned R2 upload URL
        const uploadUrlRes = await fetch('/api/upload-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fileName: selectedFile.name,
            contentType: selectedFile.type,
            declaredSize: selectedFile.size
          })
        });

        if (!uploadUrlRes.ok) {
          const errData = await uploadUrlRes.json();
          throw new Error(errData.error || 'Failed to get upload URL.');
        }

        const { uploadUrl, objectKey } = await uploadUrlRes.json();

        // 2. Upload directly to Cloudflare R2
        const r2UploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': selectedFile.type
          },
          body: selectedFile
        });

        if (!r2UploadRes.ok) {
          throw new Error('Failed to upload file to Cloudflare R2 storage.');
        }

        // 3. Confirm upload
        const confirmRes = await fetch('/api/confirm-upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ objectKey })
        });

        if (!confirmRes.ok) {
          const errData = await confirmRes.json();
          throw new Error(errData.error || 'Failed to verify file upload.');
        }

        const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
        if (fileExt === 'pdf') {
          pdfUrl = objectKey;
        } else {
          zipUrl = objectKey;
        }
      }

      // Prepare Submission Payload
      const submissionData = {
        module_id: selectedModule.id,
        student_id: user.id,
        zip_file_url: zipUrl,
        pdf_file_url: pdfUrl,
        github_url: githubUrl || null,
        vercel_url: vercelUrl || null,
        drive_url: driveUrl || null,
        comments: comments || null,
        status: 'submitted' as const,
        score: null,
        feedback_json: null,
      };

      let error = null;

      if (submission?.id) {
        // Update existing submission
        const { error: updateError } = await supabase
          .from('submissions')
          .update(submissionData)
          .eq('id', submission.id);
        error = updateError;
      } else {
        // Insert new submission
        const { error: insertError } = await supabase
          .from('submissions')
          .insert([submissionData]);
        error = insertError;
      }

      if (error) throw error;

      showToast(
        isLate ? 'Late Submission Saved' : 'Project Submitted',
        isLate
          ? 'Your assignment was marked as a late submission.'
          : 'Your project has been uploaded successfully for grading.',
        isLate ? 'warning' : 'success'
      );
      
      // Reload submission record
      await fetchSubmission(selectedModule.id);
    } catch (err: any) {
      showToast('Error', 'Submission failed: ' + err.message, 'error');
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
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Loading modules data...</p>
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
        <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4 px-1">Curriculum</h3>
        {modules.map((mod) => {
          const isSelected = selectedModule?.id === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => {
                setSelectedModule(mod);
                router.push(`/student/modules?id=${mod.id}`);
              }}
              className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                isSelected
                  ? 'border-primary-blue bg-primary-blue/5 text-white shadow-[0_0_12px_rgba(37,99,235,0.05)]'
                  : 'border-zinc-900 bg-zinc-950/40 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/10'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono tracking-wider text-zinc-500">MODULE {mod.module_number}</span>
                <span className="text-xs font-semibold truncate max-w-[120px]">{mod.title}</span>
              </div>
              <ChevronRight className={`h-4 w-4 ${isSelected ? 'text-primary-blue' : 'text-zinc-650'}`} />
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
              <span className="text-xs font-mono text-primary-blue bg-primary-blue/10 px-2 py-0.5 rounded">
                Module {selectedModule.module_number}
              </span>
              {deadlineDate && (
                <span className="text-xs font-mono text-zinc-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Due: {deadlineDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{selectedModule.title}</h2>
            <p className="text-sm text-zinc-450 leading-relaxed">{selectedModule.description}</p>
          </div>

          {/* Outcomes & Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Objectives</span>
              <ul className="mt-3 space-y-2 text-xs text-zinc-400">
                {selectedModule.objectives.length > 0 ? (
                  selectedModule.objectives.map((obj, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <span className="text-primary-blue font-bold">•</span>
                      <span>{obj}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-zinc-600">No objectives documented.</p>
                )}
              </ul>
            </Card>

            <Card>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Resource Library</span>
              <div className="mt-3 space-y-2.5">
                {selectedModule.resources && selectedModule.resources.length > 0 ? (
                  selectedModule.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg border border-zinc-900 bg-zinc-950/30 hover:bg-zinc-900/60 hover:border-zinc-800 transition-all text-xs group"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                        <span className="text-zinc-300 font-semibold truncate max-w-[150px]">{res.name}</span>
                      </div>
                      <span className="text-[9px] uppercase font-mono text-zinc-500 group-hover:text-primary-blue transition-colors flex items-center gap-1">
                        {res.category || 'Link'}
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    </a>
                  ))
                ) : (
                  <div className="text-center py-6 border border-dashed border-zinc-900 rounded-lg">
                    <FileText className="h-5 w-5 text-zinc-800 mx-auto mb-1.5" />
                    <p className="text-[10px] text-zinc-500">No curriculum assets attached yet.</p>
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
                  <h3 className="text-sm font-bold text-zinc-200">Facilitator Marksheet</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-mono font-bold text-success-green">{submission.score}%</span>
                  <p className="text-[10px] text-zinc-500 font-mono">Overall Grade</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-y border-zinc-900 py-4">
                {selectedModule.assignment_rubric.map((item, idx) => {
                  const score = submission.feedback_json?.rubric_scores?.[item.criteria] ?? 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <p className="text-[10px] font-mono text-zinc-500 uppercase">{item.criteria}</p>
                      <p className="text-sm font-bold text-zinc-200">
                        {score} <span className="text-[10px] text-zinc-500 font-normal">/ {item.max_points}</span>
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 pt-2 text-xs">
                {submission.feedback_json.strengths && (
                  <div>
                    <h4 className="font-bold text-zinc-300">Strengths:</h4>
                    <p className="text-zinc-400 mt-0.5 leading-relaxed">{submission.feedback_json.strengths}</p>
                  </div>
                )}
                {submission.feedback_json.weaknesses && (
                  <div>
                    <h4 className="font-bold text-zinc-300">Weaknesses:</h4>
                    <p className="text-zinc-400 mt-0.5 leading-relaxed">{submission.feedback_json.weaknesses}</p>
                  </div>
                )}
                {submission.feedback_json.suggestions && (
                  <div>
                    <h4 className="font-bold text-zinc-300">Suggestions:</h4>
                    <p className="text-zinc-400 mt-0.5 leading-relaxed">{submission.feedback_json.suggestions}</p>
                  </div>
                )}
              </div>
            </AccentCard>
          )}

          {/* Submission and Assignment Block */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-tight text-white border-b border-zinc-900 pb-3 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-primary-blue" />
              Project Assignment: {selectedModule.assignment_title}
            </h3>
            <p className="text-xs text-zinc-450 leading-relaxed">{selectedModule.assignment_description}</p>

            {/* Rubric View */}
            <div className="glass-panel rounded-xl p-4 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Grading Rubric</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedModule.assignment_rubric.map((item, idx) => (
                  <div key={idx} className="border-l border-zinc-800 pl-3">
                    <p className="text-[10px] font-mono text-zinc-500 uppercase">{item.criteria}</p>
                    <p className="text-xs font-semibold text-zinc-300 mt-0.5">{item.max_points} Points Max</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Submission Form OR Read-Only Submitted Status */}
            {canSubmit ? (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {isResubmissionRequired && (
                  <div className="p-4 rounded-xl bg-warning-orange/5 border border-warning-orange/20 text-warning-orange text-xs">
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
                      ? 'border-primary-blue bg-primary-blue/5'
                      : 'border-zinc-800 bg-zinc-950/20 hover:bg-zinc-900/10'
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
                  <UploadCloud className="h-10 w-10 text-zinc-500 mb-3" />
                  <p className="text-xs font-semibold text-zinc-300">
                    {selectedFile ? selectedFile.name : 'Drag & drop ZIP or PDF file here'}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-1">or click to browse local files (max 20MB)</p>
                </div>

                {/* URL inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Code2 className="absolute left-3.5 top-[38px] h-4 w-4 text-zinc-500" />
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
                    <Globe className="absolute left-3.5 top-[38px] h-4 w-4 text-zinc-500" />
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
                    <FileText className="absolute left-3.5 top-[38px] h-4 w-4 text-zinc-500" />
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
                    <CheckCircle className="h-5 w-5 text-primary-blue animate-pulse" />
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">Assignment Submitted</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Awaiting facilitator review and grading.</p>
                    </div>
                  </div>
                  {submission.submission_date && (
                    <span className="text-[10px] font-mono text-zinc-500">
                      Date: {new Date(submission.submission_date).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-zinc-900 pt-4 text-xs">
                  {submission.github_url && (
                    <a
                      href={submission.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white"
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
                      className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white"
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
                      className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="truncate">Google Drive URL</span>
                      <ExternalLink className="h-3 w-3 ml-auto shrink-0" />
                    </a>
                  )}
                </div>

                {submission.comments && (
                  <div className="bg-zinc-950/40 p-3 rounded-lg border border-zinc-900 text-xs">
                    <p className="font-semibold text-zinc-400">Your comments:</p>
                    <p className="text-zinc-500 mt-1 leading-relaxed">{submission.comments}</p>
                  </div>
                )}
              </AccentCard>
            )}
          </div>
        </div>
      ) : (
        <div className="lg:col-span-3 text-center py-24 glass-panel rounded-xl">
          <BookOpen className="h-10 w-10 text-zinc-800 stroke-[1.5] mx-auto mb-2" />
          <p className="text-xs text-zinc-500">No unlocked curriculum modules found.</p>
        </div>
      )}
    </div>
  );
}

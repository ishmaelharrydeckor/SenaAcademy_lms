'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/UI';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Code2, 
  Globe, 
  Award 
} from 'lucide-react';

interface RubricItem {
  criteria: string;
  max_points: number;
}

interface Module {
  id: string;
  module_number: number;
  title: string;
  assignment_rubric: RubricItem[];
}

interface Submission {
  id: string;
  module_id: string;
  submission_date: string;
  status: 'pending' | 'graded' | 'resubmission_requested';
  github_url: string | null;
  vercel_url: string | null;
  zip_file_url: string | null;
  pdf_file_url: string | null;
  comments: string | null;
  score: number | null;
  feedback_json: {
    rubric_scores?: Record<string, number>;
    strengths?: string;
    weaknesses?: string;
    suggestions?: string;
  } | null;
  modules: Module;
}

export default function ProjectHistory() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchSubmissions = async () => {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select(`
            id,
            module_id,
            submission_date,
            status,
            github_url,
            vercel_url,
            zip_file_url,
            pdf_file_url,
            comments,
            score,
            feedback_json,
            modules:modules (
              id,
              module_number,
              title,
              assignment_rubric
            )
          `)
          .eq('student_id', user.id)
          .order('submission_date', { ascending: false });

        if (error) throw error;
        if (data) {
          setSubmissions(data as unknown as Submission[]);
        }
      } catch (err) {
        console.error('Error loading submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDownload = async (filePath: string) => {
    try {
      const res = await fetch(`/api/download-url?file=${encodeURIComponent(filePath)}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to download file');
      }
      const { downloadUrl } = await res.json();
      window.open(downloadUrl, '_blank');
    } catch (err: any) {
      alert(err.message || 'Error downloading file');
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <div className="relative w-10 h-10 flex items-center justify-center bg-white rounded-lg p-1.5 shadow-[0_4px_12px_rgba(5,82,254,0.15)] animate-pulse">
          <img src="/logo_icon.jpg" alt="Loading" className="h-full w-full object-contain" />
        </div>
        <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">Loading history timeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary">Project History</h2>
        <p className="text-xs text-text-secondary mt-1">Review all your previous submissions, grades, and detailed coach marks.</p>
      </div>

      {submissions.length === 0 ? (
        <Card className="text-center py-16">
          <FileText className="h-10 w-10 text-text-secondary opacity-40 stroke-[1.5] mx-auto mb-2" />
          <p className="text-xs text-text-secondary">No project submissions found.</p>
          <p className="text-[10px] text-text-secondary mt-1">Go to Course Modules to complete your first assignment.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const isExpanded = expandedId === sub.id;
            const isGraded = sub.status === 'graded';
            const isResubmission = sub.status === 'resubmission_requested';

            let statusBadge = null;
            if (isGraded) {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-500 bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-full">
                  <CheckCircle className="h-3 w-3" />
                  Graded ({sub.score}%)
                </span>
              );
            } else if (isResubmission) {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-warning-brand bg-warning-brand/10 border border-warning-brand/20 px-2.5 py-0.5 rounded-full">
                  <Clock className="h-3 w-3" />
                  Revision Requested
                </span>
              );
            } else {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-accent-primary bg-accent-primary/10 border border-accent-primary/20 px-2.5 py-0.5 rounded-full">
                  <Clock className="h-3 w-3" />
                  Pending Grade
                </span>
              );
            }

            return (
              <div key={sub.id} className="glass-panel rounded-xl overflow-hidden border border-border-brand">
                {/* Accordion Trigger row */}
                <div
                  onClick={() => toggleExpand(sub.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-bg-surface-hover/30 transition-all select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-text-secondary uppercase">Module {sub.modules.module_number}</span>
                      {statusBadge}
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary">{sub.modules.title}</h3>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <span className="text-[10px] font-mono text-text-secondary">
                      Uploaded: {new Date(sub.submission_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4.5 w-4.5 text-text-secondary" />
                    ) : (
                      <ChevronDown className="h-4.5 w-4.5 text-text-secondary" />
                    )}
                  </div>
                </div>

                {/* Collapsible Details Area */}
                {isExpanded && (
                  <div className="border-t border-border-brand bg-bg-canvas/30 p-5 space-y-5 animate-fade-in text-xs">
                    {/* Attachment links */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {sub.zip_file_url && (
                        <button
                          onClick={() => handleDownload(sub.zip_file_url!)}
                          className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-bg-surface border border-border-brand text-text-secondary hover:text-text-primary cursor-pointer hover:bg-bg-surface-hover/60 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download ZIP</span>
                        </button>
                      )}
                      {sub.pdf_file_url && (
                        <button
                          onClick={() => handleDownload(sub.pdf_file_url!)}
                          className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-bg-surface border border-border-brand text-text-secondary hover:text-text-primary cursor-pointer hover:bg-bg-surface-hover/60 transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                          <span>View PDF</span>
                        </button>
                      )}
                      {sub.github_url && (
                        <a
                          href={sub.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-bg-surface border border-border-brand text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover/60 transition-colors text-center"
                        >
                          <Code2 className="h-4 w-4" />
                          <span>GitHub Repo</span>
                        </a>
                      )}
                      {sub.vercel_url && (
                        <a
                          href={sub.vercel_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-bg-surface border border-border-brand text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover/60 transition-colors text-center"
                        >
                          <Globe className="h-4 w-4" />
                          <span>Live Site</span>
                        </a>
                      )}
                    </div>

                    {/* Student Comments */}
                    {sub.comments && (
                      <div className="p-4 bg-bg-canvas/50 border border-border-brand rounded-lg text-text-secondary leading-relaxed">
                        <p className="font-semibold text-text-primary mb-1">Your comments:</p>
                        <p>{sub.comments}</p>
                      </div>
                    )}

                    {/* Detailed grades and scores */}
                    {isGraded && sub.feedback_json ? (
                      <div className="space-y-4 pt-3 border-t border-border-brand">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="h-4 w-4 text-green-500" />
                          <h4 className="font-bold text-text-primary">Grader Evaluation details</h4>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-bg-canvas/50 p-4 rounded-xl border border-border-brand">
                          {sub.modules.assignment_rubric.map((item, idx) => {
                            const score = sub.feedback_json?.rubric_scores?.[item.criteria] ?? 0;
                            return (
                              <div key={idx} className="space-y-1">
                                <p className="text-[10px] font-mono text-text-secondary uppercase">{item.criteria}</p>
                                <p className="text-sm font-bold text-text-primary">
                                  {score} <span className="text-[10px] text-text-secondary opacity-60">/ {item.max_points}</span>
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        <div className="space-y-3 pt-1">
                          {sub.feedback_json.strengths && (
                            <div>
                              <p className="font-bold text-text-primary">Strengths:</p>
                              <p className="text-text-secondary mt-0.5 leading-relaxed">{sub.feedback_json.strengths}</p>
                            </div>
                          )}
                          {sub.feedback_json.weaknesses && (
                            <div>
                              <p className="font-bold text-text-primary">Weaknesses:</p>
                              <p className="text-text-secondary mt-0.5 leading-relaxed">{sub.feedback_json.weaknesses}</p>
                            </div>
                          )}
                          {sub.feedback_json.suggestions && (
                            <div>
                              <p className="font-bold text-text-primary">Suggestions:</p>
                              <p className="text-text-secondary mt-0.5 leading-relaxed">{sub.feedback_json.suggestions}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : isResubmission ? (
                      <div className="p-4 bg-warning-brand/5 border border-warning-brand/20 rounded-xl text-warning-brand">
                        <p className="font-bold">Grader has requested revision.</p>
                        <p className="mt-1 opacity-95">Please go to the Course Modules page for this module to perform resubmission.</p>
                      </div>
                    ) : (
                      <p className="text-text-secondary italic">This submission has not been graded yet.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, AccentCard } from '@/components/UI';
import { CheckCircle, Clock, ChevronDown, ChevronUp, Code2, Globe, FileText, Download, Award } from 'lucide-react';
import Link from 'next/link';

interface SubmissionHistory {
  id: string;
  module_id: string;
  submission_date: string;
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
  modules: {
    module_number: number;
    title: string;
    assignment_rubric: Array<{ criteria: string; max_points: number }>;
  };
}

export default function StudentHistoryPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select(`
            *,
            modules:module_id (
              module_number,
              title,
              assignment_rubric
            )
          `)
          .eq('student_id', user.id)
          .order('submission_date', { ascending: false });

        if (error) throw error;
        if (data) {
          setSubmissions(data as unknown as SubmissionHistory[]);
        }
      } catch (err) {
        console.error('Error fetching submissions timeline:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const toggleExpand = (id: string) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
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

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <div className="relative w-10 h-10 flex items-center justify-center bg-white rounded-lg p-1.5 shadow-[0_4px_12px_rgba(5,82,254,0.15)] animate-pulse">
          <img src="/logo_icon.jpg" alt="Loading" className="h-full w-full object-contain" />
        </div>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Loading history timeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">Project History</h2>
        <p className="text-xs text-zinc-500 mt-1">Review all your previous submissions, grades, and detailed coach marks.</p>
      </div>

      {submissions.length === 0 ? (
        <Card className="text-center py-16">
          <FileText className="h-10 w-10 text-zinc-800 stroke-[1.5] mx-auto mb-2" />
          <p className="text-xs text-zinc-500">No project submissions found.</p>
          <p className="text-[10px] text-zinc-650 mt-1">Go to Course Modules to complete your first assignment.</p>
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
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-success-green bg-success-green/10 border border-success-green/20 px-2.5 py-0.5 rounded-full">
                  <CheckCircle className="h-3 w-3" />
                  Graded ({sub.score}%)
                </span>
              );
            } else if (isResubmission) {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-warning-orange bg-warning-orange/10 border border-warning-orange/20 px-2.5 py-0.5 rounded-full">
                  <Clock className="h-3 w-3" />
                  Revision Requested
                </span>
              );
            } else {
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary-blue bg-primary-blue/10 border border-primary-blue/20 px-2.5 py-0.5 rounded-full">
                  <Clock className="h-3 w-3" />
                  Pending Grade
                </span>
              );
            }

            return (
              <div key={sub.id} className="glass-panel rounded-xl overflow-hidden border border-zinc-900/60">
                {/* Accordion Trigger row */}
                <div
                  onClick={() => toggleExpand(sub.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-zinc-900/30 transition-all select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">Module {sub.modules.module_number}</span>
                      {statusBadge}
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-200">{sub.modules.title}</h3>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <span className="text-[10px] font-mono text-zinc-500">
                      Uploaded: {new Date(sub.submission_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4.5 w-4.5 text-zinc-400" />
                    ) : (
                      <ChevronDown className="h-4.5 w-4.5 text-zinc-400" />
                    )}
                  </div>
                </div>

                {/* Collapsible Details Area */}
                {isExpanded && (
                  <div className="border-t border-zinc-900 bg-zinc-950/20 p-5 space-y-5 animate-fade-in text-xs">
                    {/* Attachment links */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {sub.zip_file_url && (
                        <button
                          onClick={() => handleDownload(sub.zip_file_url!)}
                          className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-450 hover:text-zinc-200 cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download ZIP</span>
                        </button>
                      )}
                      {sub.pdf_file_url && (
                        <button
                          onClick={() => handleDownload(sub.pdf_file_url!)}
                          className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-450 hover:text-zinc-200 cursor-pointer"
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
                          className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-450 hover:text-zinc-200"
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
                          className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-450 hover:text-zinc-200"
                        >
                          <Globe className="h-4 w-4" />
                          <span>Live Site</span>
                        </a>
                      )}
                    </div>

                    {/* Student Comments */}
                    {sub.comments && (
                      <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg text-zinc-450">
                        <p className="font-semibold text-zinc-300">Your comments:</p>
                        <p className="mt-1 leading-relaxed">{sub.comments}</p>
                      </div>
                    )}

                    {/* Detailed grades and scores */}
                    {isGraded && sub.feedback_json ? (
                      <div className="space-y-4 pt-3 border-t border-zinc-900">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="h-4 w-4 text-success-green" />
                          <h4 className="font-bold text-zinc-200">Grader Evaluation details</h4>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-900">
                          {sub.modules.assignment_rubric.map((item, idx) => {
                            const score = sub.feedback_json?.rubric_scores?.[item.criteria] ?? 0;
                            return (
                              <div key={idx} className="space-y-1">
                                <p className="text-[10px] font-mono text-zinc-500 uppercase">{item.criteria}</p>
                                <p className="text-sm font-bold text-zinc-300">
                                  {score} <span className="text-[10px] text-zinc-600">/ {item.max_points}</span>
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        <div className="space-y-3 pt-1">
                          {sub.feedback_json.strengths && (
                            <div>
                              <p className="font-bold text-zinc-300">Strengths:</p>
                              <p className="text-zinc-400 mt-0.5 leading-relaxed">{sub.feedback_json.strengths}</p>
                            </div>
                          )}
                          {sub.feedback_json.weaknesses && (
                            <div>
                              <p className="font-bold text-zinc-300">Weaknesses:</p>
                              <p className="text-zinc-400 mt-0.5 leading-relaxed">{sub.feedback_json.weaknesses}</p>
                            </div>
                          )}
                          {sub.feedback_json.suggestions && (
                            <div>
                              <p className="font-bold text-zinc-300">Suggestions:</p>
                              <p className="text-zinc-400 mt-0.5 leading-relaxed">{sub.feedback_json.suggestions}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : isResubmission ? (
                      <div className="p-4 bg-warning-orange/5 border border-warning-orange/20 rounded-xl text-warning-orange">
                        <p className="font-bold">Grader has requested revision.</p>
                        <p className="mt-1 opacity-90">Please go to the Course Modules page for this module to perform resubmission.</p>
                      </div>
                    ) : (
                      <p className="text-zinc-500 italic">This submission has not been graded yet.</p>
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

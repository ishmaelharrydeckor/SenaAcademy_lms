'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CircularProgress, AccentCard, Button } from '@/components/UI';
import { BookOpen, Award, FileSpreadsheet, Calendar, ChevronRight, Lock, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';

interface Cohort {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface Module {
  id: string;
  module_number: number;
  title: string;
  description: string;
  unlock_date: string;
  is_visible: boolean;
  assignment_deadline: string;
}

interface Submission {
  id: string;
  module_id: string;
  status: string;
  score: number | null;
}

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch cohort details if assigned
        if (profile.cohort_id) {
          const { data: cohortData } = await supabase
            .from('cohorts')
            .select('*')
            .eq('id', profile.cohort_id)
            .single();
          if (cohortData) setCohort(cohortData as Cohort);
        }

        // 2. Fetch all modules ordered by module number
        const { data: modulesData } = await supabase
          .from('modules')
          .select('*')
          .order('module_number', { ascending: true });
        if (modulesData) setModules(modulesData as Module[]);

        // 3. Fetch student's submissions
        const { data: submissionsData } = await supabase
          .from('submissions')
          .select('id, module_id, status, score')
          .eq('student_id', user.id);
        if (submissionsData) setSubmissions(submissionsData as unknown as Submission[]);

      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, profile]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <div className="relative w-10 h-10 flex items-center justify-center bg-white rounded-lg p-1.5 shadow-[0_4px_12px_rgba(5,82,254,0.15)] animate-pulse">
          <img src="/logo_icon.jpg" alt="Loading" className="h-full w-full object-contain" />
        </div>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Loading Dashboard details...</p>
      </div>
    );
  }

  // Calculate Metrics
  const totalModules = modules.length;
  const submissionsCount = submissions.length;
  const gradedSubmissions = submissions.filter((s) => s.status === 'graded');
  
  // Progress % based on completed (submitted or graded) modules
  const progressPercentage = totalModules > 0 ? (submissionsCount / totalModules) * 100 : 0;
  
  // Calculate average grade score
  const totalGrades = gradedSubmissions.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const averageGrade = gradedSubmissions.length > 0 ? Math.round(totalGrades / gradedSubmissions.length) : null;

  // Identify current module (first unlocked module with no submission)
  const currentModule = modules.find((mod) => {
    const isUnlocked = new Date(mod.unlock_date) <= new Date() && mod.is_visible;
    const hasSubmitted = submissions.some((sub) => sub.module_id === mod.id);
    return isUnlocked && !hasSubmitted;
  }) || modules.find((mod) => new Date(mod.unlock_date) <= new Date() && mod.is_visible); // fallback to latest unlocked

  return (
    <div className="space-y-8">
      {/* Top Banner section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-900">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Welcome back, {profile?.full_name}</h2>
          <p className="text-xs text-zinc-500 mt-1">Here is a summary of your workspace activities and curriculum progress.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/student/modules">
            <Button size="sm">Go to Class</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Current Cohort</span>
            <p className="text-sm font-bold text-zinc-100 truncate max-w-[150px]">{cohort?.name || 'Unassigned'}</p>
          </div>
          <Calendar className="h-5 w-5 text-zinc-600" />
        </Card>

        <Card className="flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Current Module</span>
            <p className="text-sm font-bold text-zinc-100 truncate max-w-[150px]">
              {currentModule ? `M${currentModule.module_number}: ${currentModule.title}` : 'Completed'}
            </p>
          </div>
          <BookOpen className="h-5 w-5 text-zinc-600" />
        </Card>

        <Card className="flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Submissions</span>
            <p className="text-sm font-bold text-zinc-100">{submissionsCount} / {totalModules}</p>
          </div>
          <FileSpreadsheet className="h-5 w-5 text-zinc-600" />
        </Card>

        <Card className="flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Average Grade</span>
            <p className="text-sm font-bold text-zinc-100">{averageGrade !== null ? `${averageGrade}%` : 'N/A'}</p>
          </div>
          <Award className="h-5 w-5 text-zinc-600" />
        </Card>
      </div>

      {/* Overview & Circular Progress Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AccentCard accent="blue" className="md:col-span-2 flex flex-col justify-between min-h-[200px]">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-500">Cohort Roadmap</span>
            <h3 className="text-sm font-semibold text-zinc-200 mt-1">Curriculum Roadmap progress</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Complete each learning module's assignments to advance. Rubrics evaluate design aesthetics, clean code implementations, and project functionality.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-6 text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success-green inline-block"></span>
              <span>Submitted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary-blue inline-block"></span>
              <span>Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-800 inline-block"></span>
              <span>Locked</span>
            </div>
          </div>
        </AccentCard>

        <Card className="flex flex-col items-center justify-center py-8">
          <CircularProgress percentage={progressPercentage} size={90} strokeWidth={7} />
          <p className="text-xs font-semibold text-zinc-300 mt-4">Modules Completed</p>
          <p className="text-[10px] text-zinc-500 mt-1">{submissionsCount} of {totalModules} modules submitted</p>
        </Card>
      </div>

      {/* Horizontal Progress Tracker Roadmap */}
      <div className="glass-panel rounded-xl p-8 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-500 block mb-6">Interactive Roadmap</span>
        
        {totalModules === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-zinc-500">No modules unlocked for this cohort yet.</p>
            <p className="text-[10px] text-zinc-600 mt-1">Admins will release course modules soon.</p>
          </div>
        ) : (
          <div className="relative">
            {/* The connector line */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-zinc-850 z-0"></div>
            
            {/* Scrollable container for roadmaps */}
            <div className="flex justify-between items-center relative z-10 overflow-x-auto pb-4 gap-8">
              {modules.map((mod, index) => {
                const submission = submissions.find((sub) => sub.module_id === mod.id);
                const isSubmitted = !!submission;
                const isUnlocked = new Date(mod.unlock_date) <= new Date() && mod.is_visible;
                const isActive = currentModule?.id === mod.id;

                let nodeStyle = '';
                let titleStyle = '';
                let iconElement = null;

                if (isSubmitted) {
                  // Glowing green node
                  nodeStyle = 'bg-success-green/10 border-success-green text-success-green shadow-[0_0_15px_rgba(34,197,94,0.2)]';
                  titleStyle = 'text-success-green font-medium';
                  iconElement = <CheckCircle2 className="h-5 w-5" />;
                } else if (isActive && isUnlocked) {
                  // Glowing blue node
                  nodeStyle = 'bg-primary-blue/10 border-primary-blue text-primary-blue shadow-[0_0_15px_rgba(37,99,235,0.3)] animate-glow';
                  titleStyle = 'text-primary-blue font-bold';
                  iconElement = <Circle className="h-5 w-5 fill-primary-blue/20" />;
                } else if (isUnlocked) {
                  // Standard unlocked node
                  nodeStyle = 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500 cursor-pointer';
                  titleStyle = 'text-zinc-300';
                  iconElement = <Circle className="h-5 w-5" />;
                } else {
                  // Locked, blurred node
                  nodeStyle = 'bg-zinc-950/80 border-zinc-900 text-zinc-600 opacity-60 backdrop-blur-sm';
                  titleStyle = 'text-zinc-600';
                  iconElement = <Lock className="h-4.5 w-4.5" />;
                }

                const content = (
                  <div className="flex flex-col items-center text-center group min-w-[120px] select-none">
                    <div className={`h-12 w-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${nodeStyle}`}>
                      {iconElement}
                    </div>
                    <span className={`text-[10px] font-mono mt-3 uppercase tracking-wider block ${titleStyle}`}>
                      Module {mod.module_number}
                    </span>
                    <span className="text-xs text-zinc-400 mt-1 font-semibold group-hover:text-zinc-100 transition-colors line-clamp-1 max-w-[140px]">
                      {mod.title}
                    </span>
                  </div>
                );

                return isUnlocked ? (
                  <Link key={mod.id} href={`/student/modules?id=${mod.id}`}>
                    {content}
                  </Link>
                ) : (
                  <div key={mod.id}>
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

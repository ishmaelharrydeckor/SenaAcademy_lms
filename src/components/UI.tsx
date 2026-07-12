'use client';

import React from 'react';

// Premium Flat Card Component
export function Card({
  children,
  className = '',
  hoverable = false,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-xl p-6 transition-colors duration-150 relative overflow-hidden group ${
        hoverable ? 'hover:bg-bg-surface-hover cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Flat Accent Border Card
export function AccentCard({
  children,
  className = '',
  accent = 'blue',
}: {
  children: React.ReactNode;
  className?: string;
  accent?: 'blue' | 'purple' | 'green' | 'orange';
}) {
  const accentBorder = {
    blue: 'border-l-2 border-l-accent-primary',
    purple: 'border-l-2 border-l-indigo-500',
    green: 'border-l-2 border-l-success-brand',
    orange: 'border-l-2 border-l-warning-brand',
  }[accent];

  return (
    <div className={`glass-panel rounded-xl p-6 relative overflow-hidden ${accentBorder} ${className}`}>
      {children}
    </div>
  );
}

// Flat Styled Button
export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
}: {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
}) {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-full transition-colors duration-150 outline-none select-none disabled:opacity-50 disabled:pointer-events-none border border-transparent';
  
  const sizeStyle = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }[size];

  const variantStyle = {
    primary: 'bg-btn-primary hover:opacity-90 text-btn-primary-text border-btn-primary/20',
    secondary: 'bg-bg-surface hover:bg-bg-surface-hover text-text-primary border-border-brand',
    success: 'bg-success-brand hover:bg-success-brand/90 text-white border-success-brand/20',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-red-500/20',
    ghost: 'hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary',
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${sizeStyle} ${variantStyle} ${className}`}
    >
      {children}
    </button>
  );
}

// Styled Input Field
export function Input({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  className = '',
  error,
  disabled = false,
  icon,
}: {
  label?: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
  error?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-text-secondary select-none">
          {label}
        </label>
      )}
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-text-secondary">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={id}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`glass-input text-sm text-text-primary rounded-full py-2.5 w-full placeholder-text-secondary/40 disabled:opacity-50 disabled:cursor-not-allowed ${
            icon ? 'pl-10 pr-4' : 'px-4'
          }`}
        />
      </div>
      {error && <span className="text-[11px] text-red-400 select-none">{error}</span>}
    </div>
  );
}

// Flat Loading Spinner
export function LoadingScreen({ message = 'Loading workspace...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-bg-canvas flex flex-col items-center justify-center z-50 animate-fade-in">
      <div className="relative flex items-center justify-center">
        {/* Spinner rings */}
        <div className="w-10 h-10 border-2 border-border-brand rounded-full"></div>
        <div className="absolute w-10 h-10 border-2 border-t-accent-primary border-r-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-xs text-text-secondary font-medium tracking-wide mt-4 uppercase animate-pulse">
        {message}
      </p>
    </div>
  );
}

// Circular Progress Component
export function CircularProgress({
  percentage,
  size = 60,
  strokeWidth = 5,
  colorClass = 'text-accent-primary',
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  colorClass?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-border-brand/40"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${colorClass} transition-all duration-500 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute text-[11px] font-semibold text-text-primary">{Math.round(percentage)}%</span>
    </div>
  );
}

// Reusable MetaRow Component (V3 Editorial style key-value line)
export function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="meta-row">
      <span className="font-sans font-medium uppercase tracking-wider text-[10px] text-text-secondary">{label}</span>
      <span className="font-sans font-semibold text-xs text-text-primary">{value}</span>
    </div>
  );
}

// Reusable BuildLogCard Component (Terminal Activity feed)
export interface LogLine {
  text: string;
  isPrompt?: boolean;
  isDim?: boolean;
  isSuccess?: boolean;
}

export function BuildLogCard({
  title = 'senaacademy.org',
  status = 'connected',
  lines = [],
  reviewLabel = 'Facilitator review —',
  reviewText = ''
}: {
  title?: string;
  status?: string;
  lines?: LogLine[];
  reviewLabel?: string;
  reviewText?: string;
}) {
  return (
    <div className="bg-[#0B0C0E] border border-border-brand/40 rounded-2xl p-6 text-left text-on-dark font-sans shadow-xl select-none">
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 text-xs text-on-dark-soft">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] opacity-95"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] opacity-95"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] opacity-95"></span>
        </div>
        <div className="font-mono text-[11px] tracking-wide text-on-dark/80">{title}</div>
        <div className="flex items-center gap-1.5 text-[#27C93F] font-bold text-[10px] uppercase tracking-wide font-mono bg-[#27C93F]/10 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-[#27C93F] inline-block animate-pulse"></span>
          {status}
        </div>
      </div>
      <div className="font-mono text-[13px] leading-relaxed space-y-2">
        {lines.map((line, idx) => (
          <div key={idx}>
            {line.isPrompt && <span className="text-accent-primary select-none mr-1.5">$</span>}
            <span className={line.isSuccess ? 'text-[#27C93F]' : line.isDim ? 'text-on-dark-soft/50' : 'text-on-dark'}>
              {line.text}
            </span>
          </div>
        ))}
      </div>
      {(reviewLabel || reviewText) && (
        <div className="border-t border-white/5 pt-4 mt-4 text-[13px] text-on-dark-soft leading-normal">
          <span className="font-semibold text-on-dark mr-1">{reviewLabel}</span>
          <span>{reviewText}</span>
        </div>
      )}
    </div>
  );
}

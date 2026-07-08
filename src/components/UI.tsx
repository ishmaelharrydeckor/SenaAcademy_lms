'use client';

import React from 'react';

// Premium Glass Card Component
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
      className={`glass-panel rounded-xl p-6 transition-all duration-300 relative overflow-hidden group ${
        hoverable ? 'hover:bg-bg-surface-hover hover:border-accent-primary/25 cursor-pointer hover:-translate-y-0.5 shadow-md hover:shadow-lg' : ''
      } ${className}`}
    >
      {/* Decorative inner top light edge */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>
      {children}
    </div>
  );
}

// Glowing Accent Border Card
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
    blue: 'border-l-2 border-l-accent-primary shadow-[inset_4px_0_12px_rgba(5,82,254,0.03)]',
    purple: 'border-l-2 border-l-supporting-purple shadow-[inset_4px_0_12px_rgba(124,58,237,0.03)]',
    green: 'border-l-2 border-l-success-green shadow-[inset_4px_0_12px_rgba(34,197,94,0.03)]',
    orange: 'border-l-2 border-l-warning-orange shadow-[inset_4px_0_12px_rgba(245,158,11,0.03)]',
  }[accent];

  return (
    <div className={`glass-panel rounded-xl p-6 relative overflow-hidden ${accentBorder} ${className}`}>
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/3 to-transparent pointer-events-none"></div>
      {children}
    </div>
  );
}

// Custom Glass Styled Button
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
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 outline-none select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 border border-transparent';
  
  const sizeStyle = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }[size];

  const variantStyle = {
    primary: 'bg-accent-primary hover:bg-accent-primary-hover text-white shadow-[0_4px_12px_rgba(5,82,254,0.15)] hover:shadow-[0_4px_16px_rgba(5,82,254,0.25)] border-accent-primary/20',
    secondary: 'bg-bg-surface hover:bg-bg-surface-hover text-text-primary border-border-brand',
    success: 'bg-success-green hover:bg-green-600 text-white shadow-[0_4px_12px_rgba(34,197,94,0.15)] border-green-500/20',
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

// Styled Glass Input Field
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
}) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-text-secondary select-none">
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="glass-input text-sm text-text-primary rounded-lg px-3.5 py-2.5 w-full placeholder-text-secondary/40 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {error && <span className="text-[11px] text-red-400 select-none">{error}</span>}
    </div>
  );
}

// Fullscreen Loading Spinner
export function LoadingScreen({ message = 'Loading workspace...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center z-50 animate-fade-in">
      <div className="relative flex items-center justify-center">
        {/* Glow core */}
        <div className="absolute w-12 h-12 rounded-full bg-primary-blue/10 blur-xl"></div>
        {/* Spinner rings */}
        <div className="w-10 h-10 border-2 border-zinc-800 rounded-full"></div>
        <div className="absolute w-10 h-10 border-2 border-t-primary-blue border-r-supporting-purple rounded-full animate-spin"></div>
      </div>
      <p className="text-xs text-zinc-500 font-medium tracking-wide mt-4 uppercase animate-pulse">
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
  colorClass = 'text-primary-blue',
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
          className="text-zinc-800"
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
      <span className="absolute text-[11px] font-semibold text-zinc-200">{Math.round(percentage)}%</span>
    </div>
  );
}

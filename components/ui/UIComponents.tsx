
import React from 'react';
import { X, Loader2 } from 'lucide-react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', isLoading, className = '', disabled, ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/20 border border-transparent",
    secondary: "bg-slate-800 text-white hover:bg-slate-700 shadow-sm dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white",
    outline: "border border-slate-200/60 bg-white/10 hover:bg-white/30 text-slate-900 dark:border-slate-700/60 dark:text-slate-100 dark:hover:bg-slate-800/50 backdrop-blur-md",
    ghost: "hover:bg-slate-100/50 text-slate-900 dark:text-slate-100 dark:hover:bg-slate-800/50",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-5 py-2",
    lg: "h-12 px-8 text-lg",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

// --- Card (Enhanced Glassmorphism) ---
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`rounded-xl border border-white/30 bg-white/40 backdrop-blur-xl shadow-sm transition-all hover:shadow-lg hover:border-white/50 hover:bg-white/50 dark:border-slate-700/30 dark:bg-slate-900/40 dark:hover:border-slate-600/50 ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = '', ...props }) => (
  <h3 className={`font-semibold leading-none tracking-tight text-lg ${className}`} {...props} />
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props} />
);

// --- Input (Enhanced Glassmorphism) ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className="flex flex-col gap-2 w-full">
    {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300">{label}</label>}
    <input
      className={`flex h-10 w-full rounded-lg border border-slate-200/50 bg-white/30 backdrop-blur-md px-3 py-2 text-sm ring-offset-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800/50 dark:bg-slate-900/30 dark:placeholder:text-slate-500 transition-all hover:bg-white/50 dark:hover:bg-slate-900/50 ${className}`}
      {...props}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);

// --- Select (Enhanced Glassmorphism) ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => (
  <div className="flex flex-col gap-2 w-full">
    {label && <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">{label}</label>}
    <div className="relative">
      <select
        className={`flex h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white/50 px-4 py-2 pr-8 text-sm ring-offset-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-50 transition-all hover:border-primary-300 dark:hover:border-slate-600 ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
        <svg className="h-4 w-4 fill-current opacity-70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  </div>
);

// --- Dialog / Modal (Enhanced Glassmorphism) ---
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, title, description, children, className = 'max-w-lg' }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[4px] transition-opacity" onClick={() => onOpenChange(false)} />
      <div className={`relative w-full rounded-2xl border border-white/30 bg-white/60 backdrop-blur-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 dark:bg-slate-900/60 dark:border-slate-700/30 mx-4 ${className}`}>
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full p-1 opacity-70 hover:bg-slate-100/50 hover:opacity-100 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 dark:hover:bg-slate-800/50"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        <div className="flex flex-col space-y-2 text-center sm:text-left mb-6">
          <h2 className="text-xl font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-50">{title}</h2>
          {description && <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  );
};

// --- Badge ---
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: "bg-slate-900/80 text-slate-50 dark:bg-slate-50/80 dark:text-slate-900 backdrop-blur-sm",
    success: "bg-green-100/50 text-green-700 dark:bg-green-500/20 dark:text-green-400 border border-green-200/50 dark:border-green-500/30 backdrop-blur-sm",
    warning: "bg-amber-100/50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/30 backdrop-blur-sm",
    destructive: "bg-red-100/50 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200/50 dark:border-red-500/30 backdrop-blur-sm",
    outline: "border border-slate-200/50 text-slate-900 dark:border-slate-700/50 dark:text-slate-300 backdrop-blur-sm"
  };

  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

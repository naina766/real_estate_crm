"use client";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Modal / Dialog ──────────────────────────────────────────────────────────
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Modal */}
      <div
        className={`relative bg-[#1a2035] border border-[#2a3356] rounded-2xl shadow-2xl w-full ${sizes[size]} mx-4 animate-scale-in`}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-[#1e2a44]">
            <h3 className="text-base font-semibold text-[#f1f5ff]">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#4a5a80] hover:text-[#f1f5ff] hover:bg-[#1e2640] transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Textarea ────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  rows?: number;
}

export function Textarea({ label, error, rows = 3, className, id, ...props }: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-xs font-medium text-[#8892b0] uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={cn(
          "w-full bg-[#161b27] border border-[#2a3356] rounded-xl px-4 py-2.5 text-sm text-[#f1f5ff] placeholder-[#4a5a80]",
          "focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all resize-none",
          error && "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/30",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─── Button ──────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:from-blue-600 hover:to-violet-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-95",
    secondary:
      "bg-[#1a2035] text-[#f1f5ff] border border-[#2a3356] hover:bg-[#1e2640] hover:border-[#3a4366] active:scale-95",
    ghost: "text-[#8892b0] hover:text-[#f1f5ff] hover:bg-[#1e2640] active:scale-95",
    danger:
      "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 active:scale-95",
    success:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  const variants = {
    default: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    danger: "bg-red-500/15 text-red-400 border-red-500/30",
    info: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    purple: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  };
  const sizes = { sm: "px-2 py-0.5 text-[11px]", md: "px-2.5 py-1 text-xs" };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border font-medium", variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({ label, error, leftIcon, rightIcon, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-[#8892b0] uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5a80]">{leftIcon}</span>
        )}
        <input
          id={inputId}
          className={cn(
            "w-full bg-[#161b27] border border-[#2a3356] rounded-xl px-4 py-2.5 text-sm text-[#f1f5ff] placeholder-[#4a5a80]",
            "focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all",
            leftIcon && "pl-9",
            rightIcon && "pr-9",
            error && "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/30",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a5a80]">{rightIcon}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─── Select ──────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, className, id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-[#8892b0] uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          "w-full bg-[#161b27] border border-[#2a3356] rounded-xl px-4 py-2.5 text-sm text-[#f1f5ff]",
          "focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all",
          "appearance-none cursor-pointer",
          error && "border-red-500/50",
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#161b27]">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
export function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-[#1a2035] border border-[#2a3356] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.3)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base", xl: "w-16 h-16 text-xl" };
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colors = ["from-blue-500 to-violet-600", "from-emerald-500 to-cyan-500", "from-orange-500 to-red-500", "from-pink-500 to-rose-500"];
  const colorIndex = name.charCodeAt(0) % colors.length;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover ring-2 ring-[#2a3356]", sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        `bg-gradient-to-br ${colors[colorIndex]} rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-[#2a3356] flex-shrink-0`,
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = { sm: "h-4 w-4 border-2", md: "h-8 w-8 border-2", lg: "h-12 w-12 border-3" };
  return (
    <div
      className={cn(
        "rounded-full border-blue-500 border-t-transparent animate-spin",
        sizes[size],
        className
      )}
    />
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  gradient?: string;
}

export function StatCard({ title, value, change, changeType = "neutral", icon, gradient }: StatCardProps) {
  return (
    <Card className="p-5 hover:border-[#3a4366] transition-all hover:shadow-[0_8px_32px_rgba(79,142,247,0.1)] group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#8892b0] uppercase tracking-wide mb-1">{title}</p>
          <p className="text-2xl font-bold text-[#f1f5ff]">{value}</p>
          {change && (
            <p className={cn("text-xs mt-1 font-medium",
              changeType === "up" ? "text-emerald-400" :
              changeType === "down" ? "text-red-400" : "text-[#8892b0]"
            )}>
              {changeType === "up" ? "↑" : changeType === "down" ? "↓" : ""} {change}
            </p>
          )}
        </div>
        <div className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform",
          gradient || "bg-gradient-to-br from-blue-500 to-violet-600"
        )}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-[#1a2035] border border-[#2a3356] flex items-center justify-center text-[#4a5a80] mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[#f1f5ff] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#8892b0] max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Switch ────────────────────────────────────────────────────────────────────
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

export function Switch({ checked, onChange, disabled, id }: SwitchProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1a2035]",
        checked ? "bg-blue-500" : "bg-[#2a3356]",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

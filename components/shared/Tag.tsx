"use client";

interface TagProps {
  label: string;
  variant?: "primary" | "secondary" | "success" | "warning" | "info" | "neutral";
  size?: "xs" | "sm" | "md";
  clickable?: boolean;
  onClick?: () => void;
}

export default function Tag({
  label,
  variant = "neutral",
  size = "sm",
  clickable = false,
  onClick,
}: TagProps) {
  const baseStyles = "inline-flex items-center font-semibold rounded-full transition-all duration-150";
  
  const sizeStyles = {
    xs: "px-2 py-0.5 text-[10px]",
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-xs",
  };

  const variantStyles = {
    primary: "bg-primary-50 text-primary dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900/30",
    secondary: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/50",
    success: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-100 dark:border-green-900/20",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/20",
    info: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20",
    neutral: "bg-zinc-50 text-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800",
  };

  const clickableStyles = clickable
    ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-sm hover:border-primary-300 dark:hover:border-primary-700"
    : "pointer-events-none";

  return (
    <span
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${clickableStyles}`}
    >
      {label}
    </span>
  );
}

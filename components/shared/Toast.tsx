"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = "info",
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const iconMap = {
    success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const bgStyles = {
    success: "bg-white border-green-100 dark:bg-zinc-900 dark:border-green-950/30",
    error: "bg-white border-red-100 dark:bg-zinc-900 dark:border-red-950/30",
    info: "bg-white border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800",
  };

  return (
    <div
      role="alert"
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3.5 rounded-2xl border p-4 shadow-xl max-w-sm w-[340px] transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${bgStyles[type]}`}
    >
      <div className="flex-shrink-0">{iconMap[type]}</div>
      <div className="flex-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
        {message}
      </div>
      <button
        onClick={onClose}
        className="rounded-full p-1 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

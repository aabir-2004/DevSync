"use client";

import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "away" | null;
  className?: string;
}

export default function Avatar({
  src,
  name,
  size = "md",
  status = null,
  className = "",
}: AvatarProps) {
  // Extract initials
  const getInitials = (userName: string) => {
    const parts = userName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0] ? parts[0][0].toUpperCase() : "?";
  };

  const initials = getInitials(name);

  const sizeStyles = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-20 w-20 text-xl",
  };

  const ringStyles = {
    xs: "ring-1",
    sm: "ring-2",
    md: "ring-2",
    lg: "ring-3",
    xl: "ring-4",
  };

  const statusStyles = {
    online: "bg-green-500",
    offline: "bg-zinc-400",
    away: "bg-amber-500",
  };

  const dotSizeStyles = {
    xs: "h-1.5 w-1.5",
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3.5 w-3.5",
    xl: "h-4.5 w-4.5",
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`flex items-center justify-center rounded-full overflow-hidden font-bold select-none ${
          sizeStyles[size]
        } ${
          src 
            ? "bg-zinc-100 dark:bg-zinc-800" 
            : "bg-primary-100 text-primary-950 dark:bg-primary-950/40 dark:text-primary-300"
        }`}
      >
        {src ? (
          <Image
            src={src}
            alt={name}
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Optional Status Indicator */}
      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-zinc-900 ${
            statusStyles[status]
          } ${dotSizeStyles[size]}`}
        />
      )}
    </div>
  );
}

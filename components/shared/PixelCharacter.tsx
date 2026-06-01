"use client";

import { useState, useCallback } from "react";

interface PixelCharacterProps {
  size?: number;
  className?: string;
}

/**
 * Interactive pixel art developer character.
 * Click to make it jump! Has idle bobbing animation.
 */
export default function PixelCharacter({ size = 64, className = "" }: PixelCharacterProps) {
  const [isJumping, setIsJumping] = useState(false);

  const handleClick = useCallback(() => {
    if (isJumping) return;
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 500);
  }, [isJumping]);

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer select-none ${isJumping ? "pixel-character-jump" : "pixel-character-idle"} ${className}`}
      title="Click me to jump!"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick(); }}
      style={{ width: size, height: size * 1.5 }}
    >
      <svg
        width={size}
        height={size * 1.5}
        viewBox="0 0 16 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pixel-terrain"
        style={{ imageRendering: "pixelated" }}
      >
        {/* Hair */}
        <rect x="4" y="0" width="8" height="1" fill="#3F3F46" />
        <rect x="3" y="1" width="10" height="1" fill="#3F3F46" />
        <rect x="3" y="2" width="10" height="1" fill="#3F3F46" />

        {/* Face */}
        <rect x="3" y="3" width="10" height="1" fill="#FBBF24" />
        <rect x="3" y="4" width="10" height="1" fill="#FBBF24" />
        {/* Eyes */}
        <rect x="5" y="4" width="2" height="1" fill="#18181B" />
        <rect x="9" y="4" width="2" height="1" fill="#18181B" />
        {/* Glasses frame */}
        <rect x="4" y="3" width="4" height="3" fill="none" stroke="#71717A" strokeWidth="0.3" />
        <rect x="8" y="3" width="4" height="3" fill="none" stroke="#71717A" strokeWidth="0.3" />
        <rect x="3" y="5" width="10" height="1" fill="#FBBF24" />
        {/* Mouth */}
        <rect x="6" y="5" width="3" height="1" fill="#D97706" />
        <rect x="3" y="6" width="10" height="1" fill="#FBBF24" />

        {/* Hoodie - Orange */}
        <rect x="2" y="7" width="12" height="1" fill="#E8590C" />
        <rect x="2" y="8" width="12" height="1" fill="#E8590C" />
        <rect x="2" y="9" width="12" height="1" fill="#E8590C" />
        <rect x="2" y="10" width="12" height="1" fill="#E8590C" />
        <rect x="3" y="11" width="10" height="1" fill="#E8590C" />
        {/* Hoodie pocket detail */}
        <rect x="5" y="9" width="6" height="2" fill="#D9480F" />
        {/* DevSync logo on hoodie: curly braces */}
        <rect x="6" y="8" width="1" height="1" fill="#FFF4E6" />
        <rect x="9" y="8" width="1" height="1" fill="#FFF4E6" />

        {/* Arms */}
        <rect x="0" y="8" width="2" height="1" fill="#FBBF24" />
        <rect x="0" y="9" width="2" height="1" fill="#FBBF24" />
        <rect x="14" y="8" width="2" height="1" fill="#FBBF24" />
        <rect x="14" y="9" width="2" height="1" fill="#FBBF24" />

        {/* Pants */}
        <rect x="3" y="12" width="10" height="1" fill="#3F3F46" />
        <rect x="3" y="13" width="4" height="1" fill="#3F3F46" />
        <rect x="9" y="13" width="4" height="1" fill="#3F3F46" />
        <rect x="3" y="14" width="4" height="1" fill="#3F3F46" />
        <rect x="9" y="14" width="4" height="1" fill="#3F3F46" />

        {/* Shoes */}
        <rect x="2" y="15" width="5" height="1" fill="#E8590C" />
        <rect x="9" y="15" width="5" height="1" fill="#E8590C" />
        <rect x="2" y="16" width="5" height="1" fill="#D9480F" />
        <rect x="9" y="16" width="5" height="1" fill="#D9480F" />
      </svg>
    </div>
  );
}

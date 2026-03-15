import React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  xs: "w-6 h-6 text-[9px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
};

// Deterministic gradient based on name initials
const gradients = [
  "from-violet-600 to-indigo-600",
  "from-pink-600 to-rose-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-cyan-600 to-sky-600",
  "from-fuchsia-600 to-purple-700",
];

function getGradient(name: string) {
  const code = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return gradients[code % gradients.length];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const sizeClass = sizes[size];

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name ?? "Avatar"}
        className={cn(
          "rounded-full object-cover flex-shrink-0",
          sizeClass,
          className,
        )}
      />
    );
  }

  const displayName = name ?? "?";
  const gradient = getGradient(displayName);

  return (
    <div
      aria-label={displayName}
      className={cn(
        "rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-white",
        `bg-gradient-to-br ${gradient}`,
        sizeClass,
        className,
      )}
    >
      {getInitials(displayName)}
    </div>
  );
}

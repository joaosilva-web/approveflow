"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

// ─── Nav items ────────────────────────────────────────────────────────────────

type NavItem = {
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    label: "Projects",
    href: "/dashboard",
    // Active on the main dashboard page OR inside any /dashboard/projects/* sub-route
    isActive: (p) => p === "/dashboard" || p.startsWith("/dashboard/projects"),
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    label: "Billing",
    href: "/dashboard/billing",
    isActive: (p) => p.startsWith("/dashboard/billing"),
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
];

// ─── Logo ─────────────────────────────────────────────────────────────────────

function SidebarLogo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-5">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <span className="text-sm font-semibold tracking-tight">
        <span className="text-white">Approve</span>
        <span className="gradient-text">Flow</span>
      </span>
    </Link>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  userName?: string | null;
  userEmail?: string | null;
}

export default function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 flex flex-col h-full border-r border-white/[0.06] bg-[#080814]">
      <SidebarLogo />

      {/* Nav */}
      <nav className="flex-1 px-3 py-2" aria-label="Dashboard navigation">
        <ul className="flex flex-col gap-0.5 list-none" role="list">
          {navItems.map(({ label, href, isActive: checkActive, icon }) => {
            const active = checkActive(pathname);

            return (
              <li key={label}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
                    active
                      ? "bg-violet-500/[0.12] text-violet-300 border border-violet-500/20"
                      : "text-white/55 hover:text-white/90 hover:bg-white/[0.05]",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={cn(
                      "shrink-0 transition-colors",
                      active
                        ? "text-violet-400"
                        : "text-white/40 group-hover:text-white/70",
                    )}
                  >
                    {icon}
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User + sign out */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03]">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
            {userName?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white/80 truncate">
              {userName ?? "User"}
            </p>
            <p className="text-[10px] text-white/35 truncate">
              {userEmail ?? ""}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={cn(
              "shrink-0 p-1.5 rounded-lg text-white/30 hover:text-white/70",
              "hover:bg-white/[0.06] transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50",
            )}
            aria-label="Sign out"
            title="Sign out"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

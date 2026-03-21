"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProjectCard from "@/features/projects/components/ProjectCard";
import NewProjectModal from "@/features/projects/components/NewProjectModal";
import { Button } from "@/components/ui/Button";
import { supabaseClient } from "@/lib/supabase/browser";

interface Stats {
  totalProjects: number;
  totalPending: number;
  totalApproved: number;
  totalChanges: number;
}

interface ProjectData {
  id: string;
  name: string;
  clientName: string;
  clientEmail?: string | null;
  totalDeliveries: number;
  latestStatus: "PENDING" | "APPROVED" | "CHANGES_REQUESTED" | null;
  updatedAt: Date;
  lastViewedAt?: Date | null;
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
      <span className="text-xs text-white/40">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </div>
  );
}

export default function DashboardPageClient({
  stats,
  projects,
  subscription,
}: {
  stats: Stats;
  projects: ProjectData[];
  subscription?: {
    planCode: string;
    maxProjects: number | null;
    projectCount: number;
    storageUsage?: number;
    maxStorageBytes?: number | null;
  };
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "CHANGES_REQUESTED"
  >("ALL");
  const [liveProjects, setLiveProjects] = useState<ProjectData[]>(projects);

  // ─── Supabase Realtime ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAndUpdateProject = async (projectId: string) => {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) return;
        const fresh: ProjectData = await res.json();
        const updated = {
          ...fresh,
          updatedAt: new Date(fresh.updatedAt),
          lastViewedAt: fresh.lastViewedAt
            ? new Date(fresh.lastViewedAt)
            : null,
        };
        setLiveProjects((prev) => {
          const exists = prev.some((p) => p.id === updated.id);
          if (exists) {
            return prev.map((p) => (p.id === updated.id ? updated : p));
          }
          return [updated, ...prev];
        });
      } catch {
        // silently ignore — next event will catch it
      }
    };

    const channel = supabaseClient
      .channel("projects-realtime")
      // Project row changes (name, clientName, etc.)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Project" },
        async (payload) => {
          if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as { id: string }).id;
            setLiveProjects((prev) => prev.filter((p) => p.id !== deletedId));
            return;
          }
          const projectId = (payload.new as { id: string }).id;
          await fetchAndUpdateProject(projectId);
        },
      )
      // Delivery changes — status (PENDING/APPROVED/CHANGES_REQUESTED) lives here
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Delivery" },
        async (payload) => {
          const row = (
            payload.eventType === "DELETE" ? payload.old : payload.new
          ) as {
            projectId: string;
          };
          if (row.projectId) {
            await fetchAndUpdateProject(row.projectId);
          }
        },
      )
      // View inserts — "client viewed X ago" lives here
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "View" },
        async (payload) => {
          const { deliveryId } = payload.new as { deliveryId: string };
          try {
            const res = await fetch(`/api/projects/by-delivery/${deliveryId}`);
            if (!res.ok) return;
            const { projectId } = await res.json();
            if (projectId) await fetchAndUpdateProject(projectId);
          } catch {
            // silently ignore
          }
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  // ─── Sorting priority ───────────────────────────────────────────────────────
  const STATUS_PRIORITY: Record<string, number> = {
    PENDING: 1,
    CHANGES_REQUESTED: 2,
    APPROVED: 3,
  };

  const filteredProjects = liveProjects
    .filter((p) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.clientName ?? "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "ALL" || p.latestStatus === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const pa = STATUS_PRIORITY[a.latestStatus ?? ""] ?? 4;
      const pb = STATUS_PRIORITY[b.latestStatus ?? ""] ?? 4;
      if (pa !== pb) return pa - pb;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const atLimit =
    subscription?.maxProjects !== null &&
    subscription !== undefined &&
    subscription.projectCount >= (subscription.maxProjects ?? Infinity);

  // Storage usage display helpers
  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  const storageUsage = subscription?.storageUsage ?? 0;
  const maxStorageBytes = subscription?.maxStorageBytes ?? null;
  const storagePercent =
    maxStorageBytes && maxStorageBytes > 0
      ? Math.min(100, Math.round((storageUsage / maxStorageBytes) * 100))
      : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Projetos</h1>
          <p className="text-sm text-white/40 mt-0.5">
            Gerencie suas entregas e links de revisão
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setModalOpen(true)}
          leftIcon={
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Novo projeto
        </Button>
      </div>
      {/* Storage usage bar */}
      {maxStorageBytes && (
        <div className="flex flex-col gap-1 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Armazenamento usado:</span>
            <span className="text-xs text-white/80 font-semibold">
              {formatSize(storageUsage)}
              {" / "}
              {formatSize(maxStorageBytes)}
            </span>
            {storagePercent !== null && (
              <span
                className={`text-xs font-semibold ${storagePercent >= 90 ? "text-red-400" : storagePercent >= 75 ? "text-yellow-400" : "text-white/40"}`}
              >
                {storagePercent}%
              </span>
            )}
          </div>
          <div className="w-full h-2 bg-white/[0.08] rounded-lg overflow-hidden">
            <div
              className={`h-2 rounded-lg transition-all duration-300 ${
                storagePercent !== null && storagePercent >= 90
                  ? "bg-red-500"
                  : storagePercent !== null && storagePercent >= 75
                    ? "bg-yellow-400"
                    : "bg-emerald-400"
              }`}
              style={{ width: `${storagePercent ?? 0}%` }}
            />
          </div>
        </div>
      )}
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total de projetos"
          value={stats.totalProjects}
          color="text-white/80"
        />
        <StatCard
          label="Aguardando revisão"
          value={stats.totalPending}
          color="text-yellow-400"
        />
        <StatCard
          label="Aprovados"
          value={stats.totalApproved}
          color="text-emerald-400"
        />
        <StatCard
          label="Alterações sol."
          value={stats.totalChanges}
          color="text-red-400"
        />
      </div>

      {/* Search + Status filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar projetos ou clientes..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          {(
            [
              { key: "ALL", label: "Todos" },
              { key: "PENDING", label: "Pendente" },
              { key: "APPROVED", label: "Aprovado" },
              { key: "CHANGES_REQUESTED", label: "Alterações" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === key
                  ? "bg-violet-600 text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Plan limit banner */}
      {atLimit && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-yellow-500/[0.06] border border-yellow-500/20">
          <div>
            <p className="text-sm font-semibold text-yellow-400">
              Limite de projetos atingido
            </p>
            <p className="text-xs text-white/50 mt-0.5">
              Você usou todos os {subscription?.maxProjects} projetos do plano
              Free.
            </p>
          </div>
          <Link
            href="/dashboard/billing"
            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors"
          >
            Fazer upgrade para Pro
          </Link>
        </div>
      )}

      {/* Projects grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((p) => (
            <ProjectCard key={p.id} {...p} />
          ))}
        </div>
      ) : liveProjects.length > 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
          <p className="text-sm font-semibold text-white/50">
            Nenhum resultado encontrado
          </p>
          <p className="text-xs text-white/30">
            Tente outro nome de projeto ou cliente
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/30"
              aria-hidden="true"
            >
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/60">
              Nenhum projeto ainda
            </p>
            <p className="text-xs text-white/30 mt-1">
              Crie seu primeiro projeto para começar
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalOpen(true)}
          >
            Criar projeto
          </Button>
        </div>
      )}

      <NewProjectModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

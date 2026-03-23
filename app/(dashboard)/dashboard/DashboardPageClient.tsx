"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProjectCard from "@/features/projects/components/ProjectCard";
import NewProjectModal from "@/features/projects/components/NewProjectModal";
import { Button } from "@/components/ui/Button";
import { Clock, CheckCircle, AlertCircle, Folders, Search } from "lucide-react";
import useLiveProjects from "@/features/projects/hooks/useLiveProjects";
import { Input } from "@/components/ui";
import StatCard from "@/features/dashboard/components/StatCard";
import { formatSize } from "@/lib/utils";

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

export default function DashboardPageClient({
  stats,
  projects,
  subscription,
  searchInputId,
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
  searchInputId?: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "CHANGES_REQUESTED"
  >("ALL");
  const [liveProjects, setLiveProjects] =
    useLiveProjects<ProjectData>(projects);

  // Realtime handled by useLiveProjects hook

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
        {/* actions */}
      </div>
      {/* Storage usage bar */}
      {maxStorageBytes && (
        <div className="flex flex-col gap-1">
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
          icon={<Folders className="w-5 h-5 text-white/40" />}
        />
        <StatCard
          label="Aguardando revisão"
          value={stats.totalPending}
          color="text-yellow-400"
          bgColor="bg-yellow-500/[0.10]"
          icon={<Clock className="w-5 h-5 text-yellow-400" />}
        />
        <StatCard
          label="Aprovados"
          value={stats.totalApproved}
          color="text-emerald-400"
          bgColor="bg-emerald-500/[0.10]"
          icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
        />
        <StatCard
          label="Alterações"
          value={stats.totalChanges}
          color="text-red-400"
          bgColor="bg-red-500/[0.10]"
          icon={<AlertCircle className="w-5 h-5 text-red-400" />}
        />
      </div>

      {/* Search + Status filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            id={searchInputId}
            type="text"
            leftElement={<Search className="w-4 h-4 text-white/40" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar projetos ou clientes..."
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl">
          {(
            [
              { key: "ALL", label: "Todos" },
              { key: "PENDING", label: "Pendente" },
              { key: "APPROVED", label: "Aprovado" },
              { key: "CHANGES_REQUESTED", label: "Alterações" },
            ] as const
          ).map(({ key, label }) => (
            <Button
              variant={statusFilter === key ? "primary" : "ghost"}
              size="sm"
              key={key}
              onClick={() => setStatusFilter(key)}
            >
              {label}
            </Button>
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
          <Button variant="primary" href="/dashboard/billing" size="sm">
            Fazer upgrade para Pro
          </Button>
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

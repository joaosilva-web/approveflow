"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Check, Edit } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "PENDING" | "APPROVED" | "CHANGES_REQUESTED";

interface ApprovalPanelProps {
  token: string;
  status: Status;
  onStatusChange: (status: Status) => void;
  /** API base path. Default: "/api/review" */
  apiBase?: string;
}

type Panel =
  | "idle"
  | "approving"
  | "requesting"
  | "done_approve"
  | "done_changes";

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBanner({ status }: { status: Status }) {
  if (status === "APPROVED") {
    return (
      <div className="flex items-center gap-3 p-4 bg-emerald-500/[0.08] border border-emerald-500/25 rounded-xl">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-400">Aprovado</p>
          <p className="text-xs text-white/50 mt-0.5">
            Esta versão foi aprovada
          </p>
        </div>
      </div>
    );
  }

  if (status === "CHANGES_REQUESTED") {
    return (
      <div className="flex items-center gap-3 p-4 bg-yellow-500/[0.08] border border-yellow-500/25 rounded-xl">
        <div className="w-8 h-8 rounded-lg bg-yellow-500/[0.12] flex items-center justify-center text-yellow-400 shrink-0">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-yellow-400">
            Alterações solicitadas
          </p>
          <p className="text-xs text-white/50 mt-0.5">
            O revisor solicitou alterações
          </p>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

function fireConfetti() {
  if (typeof window === "undefined") return;
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors = [
    "#7c3aed",
    "#10b981",
    "#f59e0b",
    "#60a5fa",
    "#f472b6",
    "#34d399",
  ];
  const particles = Array.from({ length: 90 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height * 0.4,
    w: Math.random() * 8 + 3,
    h: Math.random() * 5 + 2,
    r: Math.random() * Math.PI * 2,
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 2 + 1,
    vr: (Math.random() - 0.5) * 0.15,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
  let rafId: number;
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let any = false;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      p.vy += 0.06;
      if (p.y < canvas.height + 20) any = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (any) rafId = requestAnimationFrame(tick);
    else canvas.remove();
  };
  rafId = requestAnimationFrame(tick);
  setTimeout(() => {
    cancelAnimationFrame(rafId);
    canvas.remove();
  }, 3000);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ApprovalPanel({
  token,
  status,
  onStatusChange,
  apiBase = "/api/review",
}: ApprovalPanelProps) {
  const [panel, setPanel] = useState<Panel>("idle");
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [changeNote, setChangeNote] = useState("");
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [approvalMessage, setApprovalMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const handleApprove = () => {
    if (!signerName.trim()) {
      setFormError("Seu nome é obrigatório");
      return;
    }
    setFormError("");

    startTransition(async () => {
      const res = await fetch(`${apiBase}/${token}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerName: signerName.trim(),
          signerEmail: signerEmail.trim() || undefined,
        }),
      });

      if (res.ok) {
        fireConfetti();
        setPanel("done_approve");
        onStatusChange("APPROVED");
      } else {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error ?? "Algo deu errado");
      }
    });
  };

  const handleRequestChanges = () => {
    if (!signerName.trim()) {
      setFormError("Seu nome é obrigatório");
      return;
    }
    setFormError("");

    startTransition(async () => {
      const res = await fetch(`${apiBase}/${token}/request-changes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerName: signerName.trim(),
          note: changeNote.trim() || undefined,
        }),
      });

      if (res.ok) {
        setPanel("done_changes");
        onStatusChange("CHANGES_REQUESTED");
      } else {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error ?? "Algo deu errado");
      }
    });
  };

  const sendApprovalMessage = async () => {
    if (!approvalMessage.trim() || sendingMessage) return;
    setSendingMessage(true);
    try {
      await fetch(`${apiBase}/${token}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: approvalMessage.trim(),
          authorName: signerName || "Anonymous client",
          authorType: "CLIENT",
        }),
      });
    } catch {
      /* silently ignore — message is optional */
    }
    setSendingMessage(false);
    setMessageSent(true);
  };

  if (status !== "PENDING") {
    return <StatusBanner status={status} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Idle ──────────────────────────────────────────────────────────── */}
      {panel === "idle" && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">
            Decisão de revisão
          </p>
          <Button
            variant="success"
            fullWidth
            onClick={() => setPanel("approving")}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Aprovar esta versão
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={() => setPanel("requesting")}
            leftIcon={<Edit className="w-4 h-4" />}
          >
            Solicitar alterações
          </Button>
        </div>
      )}

      {/* ── Approve form ──────────────────────────────────────────────────── */}
      {panel === "approving" && (
        <div className="flex flex-col gap-4 p-4 bg-emerald-500/[0.05] border border-emerald-500/20 rounded-xl">
          <p className="text-sm font-semibold text-emerald-400">
            Confirmar aprovação
          </p>
          <Input
            label="Seu nome"
            placeholder="Jane Silva"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            fullWidth
            required
          />
          <Input
            label="E-mail (opcional)"
            type="email"
            placeholder="jane@empresa.com"
            value={signerEmail}
            onChange={(e) => setSignerEmail(e.target.value)}
            fullWidth
          />
          {formError && (
            <p className="text-xs text-red-400" role="alert">
              {formError}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPanel("idle");
                setFormError("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApprove}
              loading={isPending}
            >
              Confirmar aprovação
            </Button>
          </div>
        </div>
      )}

      {/* ── Changes form ──────────────────────────────────────────────────── */}
      {panel === "requesting" && (
        <div className="flex flex-col gap-4 p-4 bg-yellow-500/[0.05] border border-yellow-500/20 rounded-xl">
          <p className="text-sm font-semibold text-yellow-400">
            Solicitar alterações
          </p>
          <Input
            label="Seu nome"
            placeholder="Jane Silva"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            fullWidth
            required
          />
          <Textarea
            label="Nota (opcional)"
            placeholder="Descreva as alterações que gostaria…"
            value={changeNote}
            onChange={(e) => setChangeNote(e.target.value)}
            rows={3}
            resize="none"
            fullWidth
          />
          {formError && (
            <p className="text-xs text-red-400" role="alert">
              {formError}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPanel("idle");
                setFormError("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRequestChanges}
              loading={isPending}
            >
              Enviar solicitação
            </Button>
          </div>
        </div>
      )}

      {/* ── Done: Changes requested ───────────────────────────────────────────── */}
      {panel === "done_changes" && <StatusBanner status="CHANGES_REQUESTED" />}

      {/* ── Done: Approved ────────────────────────────────────────────────────────────── */}
      {panel === "done_approve" && (
        <div className="flex flex-col gap-4">
          {/* Celebration banner */}
          <div className="flex flex-col items-center gap-3 p-5 bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-400"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-emerald-400">
                🎉 Versão aprovada!
              </p>
              <p className="text-xs text-white/45 mt-1">
                O freelancer foi notificado.
              </p>
            </div>
          </div>

          {/* Optional post-approval message */}
          {!messageSent ? (
            <div className="flex flex-col gap-2">
              <Textarea
                label="Deixar uma mensagem opcional"
                placeholder="Ficou lindo! Obrigada pela entrega rápida…"
                value={approvalMessage}
                onChange={(e) => setApprovalMessage(e.target.value)}
                rows={2}
                resize="none"
                fullWidth
              />
              {approvalMessage.trim() && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={sendApprovalMessage}
                  loading={sendingMessage}
                >
                  Enviar mensagem
                </Button>
              )}
            </div>
          ) : (
            <p className="text-xs text-emerald-400/60 text-center">
              ✓ Mensagem enviada ao freelancer
            </p>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export interface CommentData {
  id: string;
  authorType: "CLIENT" | "FREELANCER";
  authorName: string;
  content: string;
  xPosition: number | null;
  yPosition: number | null;
  resolvedAt: string | null;
  createdAt: string;
}

interface CommentSystemProps {
  token: string;
  initialComments: CommentData[];
  pinnedComments?: Record<string, number>;
  mode?: "client" | "freelancer";
  freelancerName?: string;
  commentApiBase?: string;
  onCommentsChange?: (comments: CommentData[]) => void;
}

function timeAgo(dateStr: string): string {
  const secs = Math.floor((Date.now() - Date.parse(dateStr)) / 1000);
  if (secs < 60) return "agora mesmo";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)}d atrás`;
}

function formatResolvedAt(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(dateStr));
}

function CommentBubble({
  comment,
  pinNumber,
  canResolve,
  isToggling,
  onToggleResolved,
}: {
  comment: CommentData;
  pinNumber?: number;
  canResolve: boolean;
  isToggling: boolean;
  onToggleResolved: (comment: CommentData) => void;
}) {
  const isClient = comment.authorType === "CLIENT";
  const isResolved = Boolean(comment.resolvedAt);

  return (
    <div
      className={cn(
        "rounded-2xl border p-3 transition-colors",
        isClient
          ? isResolved
            ? "border-emerald-500/20 bg-emerald-500/[0.06]"
            : "border-violet-500/12 bg-violet-500/[0.04]"
          : "border-white/[0.06] bg-white/[0.02]",
      )}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            "h-7 w-7 shrink-0 rounded-full border text-xs font-bold flex items-center justify-center",
            isClient
              ? "border-violet-500/30 bg-violet-600/20 text-violet-400"
              : "border-white/[0.10] bg-white/[0.06] text-white/60",
          )}
        >
          {comment.authorName[0]?.toUpperCase() ?? "?"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold text-white/80">
              {comment.authorName}
            </span>
            {pinNumber !== undefined && (
              <span className="font-mono text-[10px] text-violet-400">
                #{pinNumber}
              </span>
            )}
            <span className="ml-auto text-[10px] text-white/30">
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          <p className="mt-1 break-words text-sm leading-relaxed text-white/65">
            {comment.content}
          </p>

          {isClient && (
            <div className="mt-3 flex flex-wrap items-start justify-between gap-2">
              {canResolve ? (
                <label
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium cursor-pointer",
                    isResolved
                      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                      : "border-white/[0.08] bg-white/[0.04] text-white/55",
                  )}
                >
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-white/20 bg-transparent accent-emerald-500"
                    checked={isResolved}
                    onChange={() => onToggleResolved(comment)}
                    disabled={isToggling}
                  />
                  <span>{isResolved ? "Resolvido" : "Pendente"}</span>
                </label>
              ) : (
                <div className="flex flex-col gap-1">
                  <span
                    className={cn(
                      "text-[11px] font-medium",
                      isResolved ? "text-emerald-300" : "text-yellow-300",
                    )}
                  >
                    {isResolved ? "Resolvido" : "Pendente"}
                  </span>
                  {comment.resolvedAt && (
                    <span className="text-[10px] text-emerald-300/70">
                      em {formatResolvedAt(comment.resolvedAt)}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                {comment.resolvedAt && canResolve && (
                  <span className="text-[10px] text-emerald-300/70">
                    Marcado em {formatResolvedAt(comment.resolvedAt)}
                  </span>
                )}

                {canResolve && (
                  <button
                    type="button"
                    onClick={() => onToggleResolved(comment)}
                    disabled={isToggling}
                    className={cn(
                      "text-[11px] font-medium transition-colors",
                      isResolved
                        ? "text-emerald-300/80 hover:text-emerald-200"
                        : "text-violet-300/80 hover:text-violet-200",
                      isToggling && "cursor-not-allowed opacity-60",
                    )}
                  >
                    {isToggling
                      ? "Salvando..."
                      : isResolved
                        ? "Desfazer"
                        : "Resolver"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentSystem({
  token,
  initialComments,
  pinnedComments = {},
  mode = "client",
  freelancerName = "Freelancer",
  commentApiBase = "/api/review",
  onCommentsChange,
}: CommentSystemProps) {
  const isFreelancer = mode === "freelancer";
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [formError, setFormError] = useState("");
  const [toggleError, setToggleError] = useState("");
  const [togglingCommentId, setTogglingCommentId] = useState<string | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const updateComments = (
    next: CommentData[] | ((previous: CommentData[]) => CommentData[]),
  ) => {
    setComments((previous) =>
      typeof next === "function" ? next(previous) : next,
    );
  };

  useEffect(() => {
    onCommentsChange?.(comments);
  }, [comments, onCommentsChange]);

  const submit = () => {
    if (!content.trim()) {
      setFormError("O comentário não pode ser vazio");
      return;
    }
    setFormError("");

    const effectiveName = isFreelancer
      ? freelancerName
      : authorName.trim() || "Anonymous client";

    startTransition(async () => {
      const res = await fetch(`${commentApiBase}/${token}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          authorName: effectiveName,
          authorType: isFreelancer ? "FREELANCER" : "CLIENT",
        }),
      });

      if (res.ok) {
        const data: CommentData = await res.json();
        updateComments((previous) => [...previous, data]);
        setContent("");
      } else {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error ?? "Falha ao publicar comentário");
      }
    });
  };

  const toggleResolved = (comment: CommentData) => {
    if (!isFreelancer || comment.authorType !== "CLIENT") return;

    setToggleError("");
    setTogglingCommentId(comment.id);

    startTransition(async () => {
      const res = await fetch(
        `${commentApiBase}/${token}/comment/${comment.id}/resolve`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resolved: !comment.resolvedAt }),
        },
      );

      if (res.ok) {
        const updatedComment: CommentData = await res.json();
        updateComments((previous) =>
          previous.map((item) =>
            item.id === updatedComment.id ? updatedComment : item,
          ),
        );
      } else {
        const data = await res.json().catch(() => ({}));
        setToggleError(data.error ?? "Falha ao atualizar o status do comentário");
      }

      setTogglingCommentId(null);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
        Comentários{comments.length > 0 ? ` (${comments.length})` : ""}
      </p>

      {comments.length > 0 ? (
        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <CommentBubble
              key={comment.id}
              comment={comment}
              pinNumber={pinnedComments[comment.id]}
              canResolve={isFreelancer && comment.authorType === "CLIENT"}
              isToggling={togglingCommentId === comment.id}
              onToggleResolved={toggleResolved}
            />
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-white/30">
          Nenhum comentário ainda
        </p>
      )}

      <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-4">
        {toggleError && (
          <p className="text-xs text-red-400" role="alert">
            {toggleError}
          </p>
        )}

        {isFreelancer ? (
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.06] text-xs font-bold text-white/60">
              {freelancerName[0]?.toUpperCase() ?? "F"}
            </div>
            <span className="text-xs text-white/50">
              Respondendo como{" "}
              <span className="font-medium text-white/80">{freelancerName}</span>
            </span>
          </div>
        ) : (
          <Input
            label="Seu nome (opcional)"
            placeholder="Jane Silva"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            fullWidth
          />
        )}

        {!isFreelancer && (
          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] text-white/35">Reações rápidas</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                {
                  emoji: "\u{1F44D}",
                  label: "Ficou ótimo",
                  text: "Ficou ótimo!",
                },
                {
                  emoji: "\u{1F501}",
                  label: "Precisa de ajustes",
                  text: "Precisa de ajustes: ",
                },
                {
                  emoji: "\u274C",
                  label: "Não está pronto",
                  text: "Esta versão não está pronta porque: ",
                },
              ].map((reaction) => (
                <button
                  key={reaction.label}
                  type="button"
                  onClick={() => setContent(reaction.text)}
                  className={cn(
                    "flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40",
                    content === reaction.text
                      ? "border-violet-500/30 bg-violet-500/15 text-violet-300"
                      : "border-white/[0.08] bg-white/[0.04] text-white/50 hover:bg-white/[0.07] hover:text-white/75",
                  )}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <Textarea
          label={isFreelancer ? "Sua resposta" : "Adicionar comentário"}
          placeholder={
            isFreelancer
              ? "Responder ao cliente..."
              : "Deixar uma nota para o freelancer..."
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          resize="none"
          fullWidth
        />

        {formError && (
          <p className="text-xs text-red-400" role="alert">
            {formError}
          </p>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={submit}
          loading={isPending}
          disabled={!content.trim()}
        >
          {isFreelancer ? "Enviar resposta" : "Publicar comentário"}
        </Button>
      </div>
    </div>
  );
}

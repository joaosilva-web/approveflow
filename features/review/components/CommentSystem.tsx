"use client";

import React, { useEffect, useState, useTransition, useRef } from "react";
import { supabaseClient } from "@/lib/supabase/browser";
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
  deliveryId: string;
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
  isOwn,
  canResolve,
  isToggling,
  onToggleResolved,
}: {
  comment: CommentData;
  isOwn: boolean;
  canResolve: boolean;
  isToggling: boolean;
  onToggleResolved: (comment: CommentData) => void;
}) {
  const isClient = comment.authorType === "CLIENT";
  const isResolved = Boolean(comment.resolvedAt);
  return (
    <div
      className={cn("flex flex-col gap-1", isOwn ? "items-end" : "items-start")}
    >
      <div
        className={cn(
          "max-w-[80%] px-4 py-2 rounded-2xl border text-sm",
          isOwn
            ? "bg-violet-600/30 border-violet-500/30 text-white/90"
            : isClient
              ? isResolved
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
                : "bg-white/[0.04] border-violet-500/12 text-white/80"
              : "bg-white/[0.02] border-white/[0.06] text-white/70",
        )}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold">{comment.authorName}</span>
          <span className="ml-auto text-[10px] text-white/30">
            {timeAgo(comment.createdAt)}
          </span>
        </div>
        <div className="mt-1 break-words leading-relaxed">
          {comment.content}
        </div>
        {canResolve && (
          <button
            type="button"
            onClick={() => onToggleResolved(comment)}
            disabled={isToggling}
            className={cn(
              "text-[11px] font-medium mt-2",
              isResolved
                ? "text-emerald-300/80 hover:text-emerald-200"
                : "text-violet-300/80 hover:text-violet-200",
              isToggling && "cursor-not-allowed opacity-60",
            )}
          >
            {isToggling ? "Salvando..." : isResolved ? "Desfazer" : "Resolver"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function CommentSystem({
  token,
  deliveryId,
  initialComments,
  pinnedComments = {},
  mode = "client",
  freelancerName = "Freelancer",
  commentApiBase = "/api/review",
  onCommentsChange,
  scrollable,
}: CommentSystemProps & { scrollable?: boolean }) {
  const isFreelancer = mode === "freelancer";
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const commentsEndRef = useRef<HTMLDivElement | null>(null);
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

  // Realtime subscription
  useEffect(() => {
    const channel = supabaseClient
      .channel(`comments-${deliveryId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Comment" },
        (payload) => {
          const newComment = payload.new as CommentData & {
            deliveryId: string;
          };
          if (newComment && newComment.deliveryId === deliveryId) {
            setComments((prev) => {
              if (prev.some((c) => c.id === newComment.id)) return prev;
              return [
                ...prev,
                {
                  ...newComment,
                  createdAt: newComment.createdAt || new Date().toISOString(),
                },
              ];
            });
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Comment" },
        (payload) => {
          const updated = payload.new as CommentData & { deliveryId: string };
          if (updated && updated.deliveryId === deliveryId) {
            setComments((prev) =>
              prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)),
            );
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "Comment" },
        (payload) => {
          const deleted = payload.old as CommentData & { deliveryId: string };
          if (deleted && deleted.deliveryId === deliveryId) {
            setComments((prev) => prev.filter((c) => c.id !== deleted.id));
          }
        },
      )
      .subscribe();
    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [deliveryId]);

  // Scroll to bottom on new comment
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

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
        setContent(""); // Limpa o campo, o realtime cuidará do resto
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
        setToggleError(
          data.error ?? "Falha ao atualizar o status do comentário",
        );
      }

      setTogglingCommentId(null);
    });
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
        Comentários{comments.length > 0 ? ` (${comments.length})` : ""}
      </p>

      {comments.length > 0 ? (
        <div
          className={
            scrollable
              ? "flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 px-1"
              : "flex flex-col gap-2 px-1"
          }
        >
          {comments.map((comment) => (
            <CommentBubble
              key={comment.id}
              comment={comment}
              isOwn={
                isFreelancer
                  ? comment.authorType === "FREELANCER"
                  : comment.authorType === "CLIENT"
              }
              canResolve={isFreelancer && comment.authorType === "CLIENT"}
              isToggling={togglingCommentId === comment.id}
              onToggleResolved={toggleResolved}
            />
          ))}
          <div ref={commentsEndRef} />
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-white/30">
          Nenhum comentário ainda
        </p>
      )}

      <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-2">
        {toggleError && (
          <p className="text-xs text-red-400" role="alert">
            {toggleError}
          </p>
        )}

        {isFreelancer && (
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.06] text-xs font-bold text-white/60">
              {freelancerName[0]?.toUpperCase() ?? "F"}
            </div>
            <span className="text-xs text-white/50">
              Respondendo como{" "}
              <span className="font-medium text-white/80">
                {freelancerName}
              </span>
            </span>
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
          rows={1}
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

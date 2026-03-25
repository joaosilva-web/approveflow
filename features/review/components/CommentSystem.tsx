"use client";

import React, { useEffect, useState, useTransition, useRef } from "react";
import { supabaseClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/Button";
import AudioPlayer from "@/components/ui/AudioPlayer";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import { Mic, Pause, X, SendHorizontal, Check, Reply } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui";
import {
  DEFAULT_PRIMARY_COLOR,
  hexToRgba,
  getBrandTextColor,
} from "@/lib/freelancer-branding-shared";
import type { SubscriptionInfo } from "@/features/billing/subscription";

export interface CommentData {
  id: string;
  parentId?: string | null;
  authorType: "CLIENT" | "FREELANCER";
  authorName: string;
  content: string;
  audioUrl?: string | null;
  xPosition: number | null;
  yPosition: number | null;
  resolvedAt: string | null;
  createdAt: string;
}

function getCommentPreview(comment: Pick<CommentData, "content" | "audioUrl">) {
  if (comment.audioUrl || comment.content?.startsWith("__audio__:")) {
    return "Audio";
  }

  const normalized = comment.content.replace(/\s+/g, " ").trim();
  if (!normalized) return "Mensagem";
  return normalized.length > 90 ? `${normalized.slice(0, 90)}...` : normalized;
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
  onOpenPin?: (commentId: string) => void;
  openCommentId?: string | null;
  primaryColor?: string;
  subscription?: SubscriptionInfo | null;
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
  parentComment,
  isOwn,
  canResolve,
  isToggling,
  onToggleResolved,
  onReply,
  onJumpToComment,
  pinnedNumber,
  onOpenPin,
  active,
  primaryColor,
}: {
  comment: CommentData;
  parentComment?: CommentData | null;
  isOwn: boolean;
  canResolve: boolean;
  isToggling: boolean;
  onToggleResolved: (comment: CommentData) => void;
  onReply: (comment: CommentData) => void;
  onJumpToComment: (commentId: string) => void;
  pinnedNumber?: number | null;
  onOpenPin?: (id: string) => void;
  active?: boolean;
  primaryColor?: string;
}) {
  const isClient = comment.authorType === "CLIENT";
  const isResolved = Boolean(comment.resolvedAt);
  const primary = primaryColor ?? DEFAULT_PRIMARY_COLOR;
  return (
    <div
      className={cn("flex flex-col gap-1", isOwn ? "items-end" : "items-start")}
    >
      <div
        onClick={(e) => {
          if (comment.xPosition !== null && comment.yPosition !== null) {
            e.stopPropagation();
            onOpenPin?.(comment.id);
          }
        }}
        className={cn(
          "max-w-[80%] px-3 py-2 rounded-xl border text-sm",
          active && "ring-2",
        )}
        style={{
          backgroundColor: isOwn
            ? hexToRgba(primary, 0.3)
            : isClient
              ? isResolved
                ? hexToRgba("#10B981", 0.1)
                : hexToRgba(primary, 0.04)
              : "rgba(255,255,255,0.02)",
          borderColor: isOwn
            ? hexToRgba(primary, 0.3)
            : isClient
              ? isResolved
                ? hexToRgba("#10B981", 0.2)
                : hexToRgba(primary, 0.12)
              : "rgba(255,255,255,0.06)",
          color: isOwn ? getBrandTextColor(primary) : undefined,
        }}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] font-semibold">
            {comment.authorName}
          </span>
          {typeof pinnedNumber === "number" ? (
            <span
              className="ml-1 inline-flex items-center justify-center text-[8px] p-1 rounded-full"
              style={{
                backgroundColor: primary,
                color: getBrandTextColor(primary),
              }}
            >
              Pin #{pinnedNumber}
            </span>
          ) : (
            comment.xPosition !== null &&
            comment.yPosition !== null && (
              <span
                className="ml-2 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: hexToRgba(primary, 0.8),
                  color: getBrandTextColor(primary),
                }}
              >
                <span aria-hidden>📌</span>
                <span>Fixado</span>
              </span>
            )
          )}
          <span className="ml-auto text-[10px] text-white/30">
            {timeAgo(comment.createdAt)}
          </span>
        </div>
        {parentComment && (
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onJumpToComment(parentComment.id);
            }}
            className="mt-2 flex w-full flex-col rounded-lg px-3 py-2 text-left transition"
            style={{ borderLeft: `2px solid ${hexToRgba(primary, 0.7)}` }}
          >
            <span className="text-[10px] font-semibold text-violet-200">
              Respondendo a {parentComment.authorName}
            </span>
            <span className="mt-1 text-[11px] text-white/60">
              {getCommentPreview(parentComment)}
            </span>
          </Button>
        )}
        <div className="mt-1 break-words leading-relaxed">
          {comment.audioUrl || comment.content?.startsWith("__audio__:") ? (
            <AudioPlayer
              src={
                comment.audioUrl ?? comment.content.replace("__audio__:", "")
              }
            />
          ) : (
            comment.content
          )}
        </div>
      </div>
      <div
        className={cn(
          "flex items-center gap-1.5 px-1",
          isOwn ? "justify-end" : "justify-start",
        )}
      >
        {canResolve && (
          <button
            type="button"
            onClick={onToggleResolved.bind(null, comment)}
            disabled={isToggling}
            aria-label={
              isToggling
                ? "Salvando"
                : isResolved
                  ? "Desfazer resolucao"
                  : "Resolver"
            }
            title={
              isToggling ? "Salvando..." : isResolved ? "Desfazer" : "Resolver"
            }
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-full border shadow-sm transition",
              isResolved
                ? "border-rose-400/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/15"
                : "border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15",
              isToggling && "cursor-not-allowed opacity-60",
            )}
          >
            {isResolved ? <X size={14} /> : <Check size={14} />}
          </button>
        )}
        <button
          type="button"
          onClick={() => onReply(comment)}
          aria-label="Responder"
          title="Responder"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.03] text-white/60 shadow-sm transition hover:border-violet-400/25 hover:bg-violet-500/10 hover:text-violet-200"
        >
          <Reply size={14} />
        </button>
      </div>
      {/* Pin click handled on the bubble itself to ensure proper hit area */}
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
  onOpenPin,
  openCommentId,
  scrollable,
  primaryColor,
}: CommentSystemProps & { scrollable?: boolean }) {
  const isFreelancer = mode === "freelancer";
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const commentsEndRef = useRef<HTMLDivElement | null>(null);
  const commentsContainerRef = useRef<HTMLDivElement | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [namePromptVisible, setNamePromptVisible] = useState(false);
  const [formError, setFormError] = useState("");
  const [toggleError, setToggleError] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [togglingCommentId, setTogglingCommentId] = useState<string | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const commentsById = Object.fromEntries(
    comments.map((item) => [item.id, item] as const),
  );
  const replyingToComment = replyingToId ? commentsById[replyingToId] : null;

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  // load saved author name from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("review_author_name");
      if (saved) setAuthorName(saved);
    } catch (err) {
      // ignore
    }
  }, []);

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

  // When parent requests opening a comment, scroll it into view and highlight
  useEffect(() => {
    if (!openCommentId) return;
    const container = commentsContainerRef.current;
    if (!container) return;

    const el = container.querySelector(
      `[data-comment-id="${openCommentId}"]`,
    ) as HTMLElement | null;
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setActiveCommentId(openCommentId);
    const t = setTimeout(() => setActiveCommentId(null), 3000);
    return () => clearTimeout(t);
  }, [openCommentId]);

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

  const jumpToComment = (commentId: string) => {
    const container = commentsContainerRef.current;
    if (!container) return;

    const el = container.querySelector(
      `[data-comment-id="${commentId}"]`,
    ) as HTMLElement | null;
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setActiveCommentId(commentId);
    window.setTimeout(() => {
      setActiveCommentId((current) => (current === commentId ? null : current));
    }, 3000);
  };

  // Cleanup object URL for audio preview on unmount
  useEffect(() => {
    return () => {
      if (audioPreview) URL.revokeObjectURL(audioPreview);
    };
  }, []);

  const submit = () => {
    if (!content.trim() && !audioBlob && !audioUrl) {
      setFormError("O comentário não pode ser vazio");
      return;
    }
    setFormError("");
    const trimmedName = authorName.trim();
    if (!isFreelancer && !trimmedName) {
      // ask for a name before sending
      setNamePromptVisible(true);
      setFormError("Por favor, informe seu nome para publicar comentários");
      return;
    }

    const effectiveName = isFreelancer
      ? freelancerName
      : trimmedName || "Anonymous client";

    startTransition(async () => {
      let finalAudioUrl = audioUrl;

      // If there's a recorded blob but it hasn't been uploaded yet, upload now
      if (!finalAudioUrl && audioBlob) {
        try {
          const form = new FormData();
          const filename = `${Date.now()}.webm`;
          form.append("file", audioBlob, filename);
          form.append("deliveryId", deliveryId);

          const up = await fetch(`${commentApiBase}/${token}/upload-audio`, {
            method: "POST",
            body: form,
          });

          if (!up.ok) {
            const data = await up.json().catch(() => ({}));
            setFormError(data.error ?? "Failed to upload audio");
            return;
          }

          const upData = await up.json();
          finalAudioUrl = upData.publicUrl || null;
        } catch (err) {
          setFormError("Falha ao enviar áudio");
          return;
        }
      }

      const res = await fetch(`${commentApiBase}/${token}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          audioUrl: finalAudioUrl ?? undefined,
          authorName: effectiveName,
          authorType: isFreelancer ? "FREELANCER" : "CLIENT",
          parentId: replyingToId,
        }),
      });

      if (res.ok) {
        setContent(""); // Limpa o campo, o realtime cuidará do resto
        setAudioUrl(null);
        setReplyingToId(null);
        // clear local preview
        removeAudioPreview();
      } else {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error ?? "Falha ao publicar comentário");
      }
    });
  };

  const saveNameAndContinue = async () => {
    const trimmed = authorName.trim();
    if (!trimmed) {
      setFormError("O nome não pode ficar vazio");
      return;
    }
    try {
      localStorage.setItem("review_author_name", trimmed);
    } catch (err) {
      // ignore write errors
    }
    setNamePromptVisible(false);
    setFormError("");
    // After saving name, submit the comment
    submit();
  };

  // --- Audio recording helpers (stores audio as data URL in comment content prefixed)
  const startRecording = async () => {
    setFormError("");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setFormError("Audio recording not supported in this browser");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });

        // Create a local preview URL so the user can listen before sending
        try {
          const preview = URL.createObjectURL(blob);
          setAudioBlob(blob);
          setAudioPreview(preview);
          // clear content placeholder
          setContent("");
        } catch (err) {
          setFormError("Could not prepare audio preview");
        }

        // stop all tracks
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        setMediaRecorder(null);
        setAudioChunks([]);
      };
      mr.start();
      setMediaRecorder(mr);
      setAudioChunks(chunks);
      setIsRecording(true);
    } catch (err) {
      setFormError("Could not start audio recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  };

  const removeAudioPreview = () => {
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    setAudioPreview(null);
    setAudioBlob(null);
    setAudioUrl(null);
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
          ref={commentsContainerRef}
          className={
            scrollable
              ? "flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 px-1"
              : "flex flex-col gap-2 px-1"
          }
        >
          {comments.map((comment) => (
            <div
              key={comment.id}
              data-comment-id={comment.id}
              className={cn("w-full")}
            >
              <CommentBubble
                comment={comment}
                parentComment={
                  comment.parentId ? commentsById[comment.parentId] : null
                }
                isOwn={
                  isFreelancer
                    ? comment.authorType === "FREELANCER"
                    : comment.authorType === "CLIENT"
                }
                canResolve={isFreelancer && comment.authorType === "CLIENT"}
                isToggling={togglingCommentId === comment.id}
                onToggleResolved={toggleResolved}
                onReply={(selectedComment) => {
                  setReplyingToId(selectedComment.id);
                  setFormError("");
                }}
                onJumpToComment={jumpToComment}
                pinnedNumber={
                  pinnedComments ? pinnedComments[comment.id] : undefined
                }
                onOpenPin={onOpenPin}
                active={activeCommentId === comment.id}
                primaryColor={primaryColor}
              />
            </div>
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

        {replyingToComment && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-violet-200">
                Respondendo a {replyingToComment.authorName}
              </p>
              <p className="mt-1 truncate text-xs text-white/65">
                {getCommentPreview(replyingToComment)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingToId(null)}
              brandColor={primaryColor}
            >
              Cancelar
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 w-full">
            <Textarea
              placeholder={"Escrever..."}
              value={
                content.startsWith("__audio__:")
                  ? "[Áudio pronto para enviar]"
                  : content
              }
              onChange={(e) => setContent(e.target.value)}
              rows={1}
              resize="none"
              fullWidth
              className="flex-1 h-12 px-4 py-2"
              brandColor={primaryColor}
            />

            <div className="flex items-center gap-2">
              {isRecording ? (
                <Button
                  variant="danger"
                  onClick={stopRecording}
                  aria-label="Parar gravação"
                  brandColor={primaryColor}
                >
                  <Pause />
                </Button>
              ) : content.trim() || audioBlob || audioUrl ? (
                <Button
                  variant="primary"
                  onClick={submit}
                  loading={isPending}
                  disabled={!content.trim() && !audioBlob && !audioUrl}
                  aria-label="Enviar comentário"
                  brandColor={primaryColor}
                >
                  <SendHorizontal />
                </Button>
              ) : (
                <Button
                  onClick={startRecording}
                  aria-label="Gravar áudio"
                  brandColor={primaryColor}
                >
                  <Mic />
                </Button>
              )}

              <Button
                onClick={() => {
                  if (isRecording) stopRecording();
                  removeAudioPreview();
                  setContent("");
                  setReplyingToId(null);
                }}
                variant="ghost"
                aria-label="Cancelar"
                brandColor={primaryColor}
              >
                <X />
              </Button>
            </div>
          </div>

          {/* Audio preview: allow user to listen before sending */}
          {audioPreview && (
            <div className="mt-2 flex items-center gap-2">
              <AudioPlayer src={audioPreview} />
            </div>
          )}
        </div>

        {formError && (
          <p className="text-xs text-red-400" role="alert">
            {formError}
          </p>
        )}

        <Modal
          isOpen={namePromptVisible}
          onClose={() => setNamePromptVisible(false)}
          title="What's your name?"
          description="Please enter your name so we can record who left this comment."
          size="sm"
          footer={
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setNamePromptVisible(false)}
                brandColor={primaryColor}
              >
                Cancel
              </Button>
              <Button
                onClick={saveNameAndContinue}
                variant="primary"
                brandColor={primaryColor}
              >
                Save
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Your name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              brandColor={primaryColor}
            />
            {formError && <p className="text-xs text-red-400">{formError}</p>}
          </div>
        </Modal>

        {/* <Button
          variant="secondary"
          size="sm"
          onClick={submit}
          loading={isPending}
          disabled={!content.trim() && !audioBlob && !audioUrl}
        >
          {isFreelancer ? "Enviar resposta" : "Publicar comentário"}
        </Button> */}
      </div>
    </div>
  );
}

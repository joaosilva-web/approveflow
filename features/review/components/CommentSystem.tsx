"use client";

import React, { useEffect, useState, useTransition, useRef } from "react";
import { supabaseClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/Button";
import AudioPlayer from "@/components/ui/AudioPlayer";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { Mic, Pause, X, SendHorizontal } from "lucide-react";

export interface CommentData {
  id: string;
  authorType: "CLIENT" | "FREELANCER";
  authorName: string;
  content: string;
  audioUrl?: string | null;
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
  onOpenPin?: (commentId: string) => void;
  openCommentId?: string | null;
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
  pinnedNumber,
  onOpenPin,
  active,
}: {
  comment: CommentData;
  isOwn: boolean;
  canResolve: boolean;
  isToggling: boolean;
  onToggleResolved: (comment: CommentData) => void;
  pinnedNumber?: number | null;
  onOpenPin?: (id: string) => void;
  active?: boolean;
}) {
  const isClient = comment.authorType === "CLIENT";
  const isResolved = Boolean(comment.resolvedAt);
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
          isOwn
            ? "bg-violet-600/30 border-violet-500/30 text-white/90"
            : isClient
              ? isResolved
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
                : "bg-white/[0.04] border-violet-500/12 text-white/80"
              : "bg-white/[0.02] border-white/[0.06] text-white/70",
          active && "ring-2 ring-violet-400/60",
        )}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] font-semibold">
            {comment.authorName}
          </span>
          {typeof pinnedNumber === "number" ? (
            <span className="ml-1 inline-flex items-center justify-center text-[8px] p-1 bg-violet-600 text-white rounded-full">
              Pin #{pinnedNumber}
            </span>
          ) : (
            comment.xPosition !== null &&
            comment.yPosition !== null && (
              <span className="ml-2 inline-flex items-center gap-1 text-[10px] bg-violet-700/80 text-white px-2 py-0.5 rounded-full">
                <span aria-hidden>📌</span>
                <span>Fixado</span>
              </span>
            )
          )}
          <span className="ml-auto text-[10px] text-white/30">
            {timeAgo(comment.createdAt)}
          </span>
        </div>
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
        {canResolve && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleResolved(comment);
            }}
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

    const effectiveName = isFreelancer
      ? freelancerName
      : authorName.trim() || "Anonymous client";

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
        }),
      });

      if (res.ok) {
        setContent(""); // Limpa o campo, o realtime cuidará do resto
        setAudioUrl(null);
        // clear local preview
        removeAudioPreview();
      } else {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error ?? "Falha ao publicar comentário");
      }
    });
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
                isOwn={
                  isFreelancer
                    ? comment.authorType === "FREELANCER"
                    : comment.authorType === "CLIENT"
                }
                canResolve={isFreelancer && comment.authorType === "CLIENT"}
                isToggling={togglingCommentId === comment.id}
                onToggleResolved={toggleResolved}
                pinnedNumber={
                  pinnedComments ? pinnedComments[comment.id] : undefined
                }
                onOpenPin={onOpenPin}
                active={activeCommentId === comment.id}
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
            />

            <div className="flex items-center gap-2">
              {isRecording ? (
                <Button
                  variant="danger"
                  onClick={stopRecording}
                  aria-label="Parar gravação"
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
                >
                  <SendHorizontal />
                </Button>
              ) : (
                <Button onClick={startRecording} aria-label="Gravar áudio">
                  <Mic />
                </Button>
              )}

              <Button
                onClick={() => {
                  if (isRecording) stopRecording();
                  removeAudioPreview();
                  setContent("");
                }}
                variant="ghost"
                aria-label="Cancelar"
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

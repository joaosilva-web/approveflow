"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CommentData {
  id: string;
  authorType: "CLIENT" | "FREELANCER";
  authorName: string;
  content: string;
  xPosition: number | null;
  yPosition: number | null;
  createdAt: string;
}

interface CommentSystemProps {
  token: string;
  initialComments: CommentData[];
  /** When comment has coordinates, show a pin number for reference */
  pinnedComments?: Record<string, number>;
  /** "client" = public review form; "freelancer" = reply form with pre-filled name */
  mode?: "client" | "freelancer";
  /** Pre-filled name used in freelancer mode */
  freelancerName?: string;
  /** API base path for comment submission. Default: "/api/review" */
  commentApiBase?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const secs = Math.floor((Date.now() - Date.parse(dateStr)) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Comment bubble ───────────────────────────────────────────────────────────

function CommentBubble({
  comment,
  pinNumber,
}: {
  comment: CommentData;
  pinNumber?: number;
}) {
  const isClient = comment.authorType === "CLIENT";
  return (
    <div className="flex gap-3 group">
      <div
        className={cn(
          "w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold",
          isClient
            ? "bg-violet-600/20 text-violet-400 border border-violet-500/30"
            : "bg-white/[0.06] text-white/60 border border-white/[0.10]",
        )}
      >
        {comment.authorName[0]?.toUpperCase() ?? "?"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-white/80">
            {comment.authorName}
          </span>
          {pinNumber !== undefined && (
            <span className="text-[10px] text-violet-400 font-mono">
              #{pinNumber}
            </span>
          )}
          <span className="text-[10px] text-white/30 ml-auto">
            {timeAgo(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-white/65 mt-1 leading-relaxed break-words">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CommentSystem({
  token,
  initialComments,
  pinnedComments = {},
  mode = "client",
  freelancerName = "Freelancer",
  commentApiBase = "/api/review",
}: CommentSystemProps) {
  const isFreelancer = mode === "freelancer";
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    if (!content.trim()) {
      setFormError("Comment cannot be empty");
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
        setComments((prev) => [...prev, data]);
        setContent("");
      } else {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error ?? "Failed to post comment");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">
        Comments{comments.length > 0 ? ` (${comments.length})` : ""}
      </p>

      {/* Comment list */}
      {comments.length > 0 ? (
        <div className="flex flex-col gap-4">
          {comments.map((c) => (
            <CommentBubble
              key={c.id}
              comment={c}
              pinNumber={pinnedComments[c.id]}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/30 text-center py-4">
          No comments yet
        </p>
      )}

      {/* Add comment / Reply form */}
      <div className="flex flex-col gap-3 pt-4 border-t border-white/[0.06]">
        {isFreelancer ? (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/[0.10] flex items-center justify-center text-xs font-bold text-white/60">
              {freelancerName[0]?.toUpperCase() ?? "F"}
            </div>
            <span className="text-xs text-white/50">
              Replying as{" "}
              <span className="text-white/80 font-medium">
                {freelancerName}
              </span>
            </span>
          </div>
        ) : (
          <Input
            label="Your name (optional)"
            placeholder="Jane Smith"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            fullWidth
          />
        )}
        {/* Quick reactions — client only */}
        {!isFreelancer && (
          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] text-white/35">Quick reactions</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                {
                  emoji: "\uD83D\uDC4D",
                  label: "Looks good",
                  text: "Looks good!",
                },
                {
                  emoji: "\uD83D\uDD01",
                  label: "Needs changes",
                  text: "Needs adjustments: ",
                },
                {
                  emoji: "\u274C",
                  label: "Not ready",
                  text: "This version is not ready because: ",
                },
              ].map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => setContent(r.text)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all duration-150",
                    "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40",
                    content === r.text
                      ? "bg-violet-500/15 border-violet-500/30 text-violet-300"
                      : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:bg-white/[0.07] hover:text-white/75",
                  )}
                >
                  <span>{r.emoji}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <Textarea
          label={isFreelancer ? "Your reply" : "Add a comment"}
          placeholder={
            isFreelancer
              ? "Reply to the client…"
              : "Leave a note for the freelancer…"
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
          {isFreelancer ? "Send reply" : "Post comment"}
        </Button>
      </div>
    </div>
  );
}

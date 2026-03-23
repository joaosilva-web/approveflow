"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { CommentData } from "@/features/review/components/CommentSystem";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PendingPin {
  x: number; // 0–1 normalized
  y: number;
  clientX: number; // px for popup positioning
  clientY: number;
}

interface ImageWithCommentsProps {
  signedUrl: string;
  fileName: string;
  comments: CommentData[];
  token: string;
  onCommentAdded: (comment: CommentData) => void;
  /** API base path for comment submission. Default: "/api/review" */
  commentApiBase?: string;
  openPinCommentId?: string | null;
  onPinOpened?: () => void;
  onPinClick?: (commentId: string) => void;
}

// ─── Zoom constants ───────────────────────────────────────────────────────────

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.4;

// ─── Zoom controls ────────────────────────────────────────────────────────────

function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  return (
    <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 bg-[#0d0d1e]/90 border border-white/[0.10] rounded-xl px-1.5 py-1 backdrop-blur-sm shadow-xl">
      <button
        onClick={onZoomOut}
        disabled={zoom <= MIN_ZOOM}
        aria-label="Zoom out"
        className="w-7 h-7 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/[0.07] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <button
        onClick={onReset}
        className="px-2 h-7 rounded-lg text-[11px] font-mono text-white/50 hover:text-white hover:bg-white/[0.07] transition-colors min-w-[42px]"
        aria-label="Reset zoom"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        onClick={onZoomIn}
        disabled={zoom >= MAX_ZOOM}
        aria-label="Zoom in"
        className="w-7 h-7 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/[0.07] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Pin marker ───────────────────────────────────────────────────────────────

function PinMarker({
  number,
  style,
  active = false,
}: {
  number: number;
  style: React.CSSProperties;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full",
        "flex items-center justify-center text-[10px] font-bold text-white select-none",
        "shadow-lg shadow-black/50",
        "border-2",
        active
          ? "bg-violet-600 border-violet-400 scale-110"
          : "bg-violet-700/90 border-violet-500/60",
      )}
      style={style}
    >
      {number}
    </div>
  );
}

// ─── Add comment popup ────────────────────────────────────────────────────────

interface AddCommentPopupProps {
  pin: PendingPin;
  token: string;
  commentApiBase: string;
  onAdd: (comment: CommentData) => void;
  onCancel: () => void;
}

function AddCommentPopup({
  pin,
  token,
  commentApiBase,
  onAdd,
  onCancel,
}: AddCommentPopupProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNameInput, setShowNameInput] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("review_author_name");
      if (saved) {
        setName(saved);
        setShowNameInput(false);
      }
    } catch (err) {
      // ignore
    }
  }, []);

  const submit = async () => {
    if (!content.trim()) {
      setError("Comment is required");
      return;
    }
    if (showNameInput && !name.trim()) {
      setError("Name is required");
      return;
    }
    setError("");
    setLoading(true);

    const res = await fetch(`${commentApiBase}/${token}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: content.trim(),
        authorName: name.trim(),
        xPosition: pin.x,
        yPosition: pin.y,
      }),
    });

    setLoading(false);

    if (res.ok) {
      const data: CommentData = await res.json();
      // persist name for future comments
      try {
        if (name.trim()) localStorage.setItem("review_author_name", name.trim());
      } catch (err) {
        // ignore
      }
      onAdd(data);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to post");
    }
  };

  return (
    <div
      className={cn(
        "absolute z-30 w-64 flex flex-col gap-3 p-4",
        "bg-[#0d0d1e] border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/60",
      )}
      // Offset popup above/beside click point
      style={{ left: pin.clientX + 12, top: pin.clientY - 16 }}
      onClick={(e) => e.stopPropagation()}
    >
      <p className="text-xs font-semibold text-white/70">
        Add a pinned comment
      </p>
      <input
        className={cn(
          "w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5",
          "text-sm text-white/80 placeholder:text-white/25 outline-none",
          "focus:border-violet-500/50 focus:bg-violet-500/[0.04]",
        )}
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus={showNameInput}
        style={{ display: showNameInput ? undefined : "none" }}
      />
      <textarea
        className={cn(
          "w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2",
          "text-sm text-white/80 placeholder:text-white/25 outline-none resize-none",
          "focus:border-violet-500/50 focus:bg-violet-500/[0.04]",
        )}
        placeholder="Write a comment…"
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      {error && <p className="text-[11px] text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-1.5 rounded-lg text-xs text-white/50 hover:text-white/80 bg-white/[0.04] hover:bg-white/[0.07] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={loading}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors"
        >
          {loading ? "Posting…" : "Post"}
        </button>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageWithComments({
  signedUrl,
  fileName,
  comments,
  token,
  onCommentAdded,
  commentApiBase = "/api/review",
  openPinCommentId,
  onPinOpened,
  onPinClick,
}: ImageWithCommentsProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
  const [allComments, setAllComments] = useState<CommentData[]>(comments);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setAllComments(comments);
  }, [comments]);

  const pinnedComments = allComments.filter(
    (c) => c.xPosition !== null && c.yPosition !== null,
  );
  const [activePinId, setActivePinId] = useState<string | null>(null);

  useEffect(() => {
    if (!openPinCommentId) return;
    const vp = viewportRef.current;
    if (!vp) return;

    const el = vp.querySelector(
      `[data-comment-id="${openPinCommentId}"]`,
    ) as HTMLElement | null;
    if (!el) {
      // no element found
      onPinOpened?.();
      return;
    }

    // offsetLeft/Top is relative to the positioned parent (the inner wrapper)
    const offsetLeft = el.offsetLeft + el.offsetWidth / 2;
    const offsetTop = el.offsetTop + el.offsetHeight / 2;

    vp.scrollTo({
      left: Math.max(0, offsetLeft - vp.clientWidth / 2),
      top: Math.max(0, offsetTop - vp.clientHeight / 2),
      behavior: "smooth",
    });

    setActivePinId(openPinCommentId);
    // clear highlight after 3s and notify parent
    const t = setTimeout(() => {
      setActivePinId(null);
      onPinOpened?.();
    }, 3000);

    return () => clearTimeout(t);
  }, [openPinCommentId, onPinOpened]);

  // Mouse-wheel zoom (Ctrl+scroll)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) =>
        Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.005)),
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const clampedZoom = (v: number) =>
    Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(v * 10) / 10));

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      if (pendingPin) {
        setPendingPin(null);
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const vpRect = viewportRef.current?.getBoundingClientRect() ?? rect;

      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Position popup relative to the scroll viewport
      const clientX =
        e.clientX - vpRect.left + (viewportRef.current?.scrollLeft ?? 0);
      const clientY =
        e.clientY - vpRect.top + (viewportRef.current?.scrollTop ?? 0);

      setPendingPin({ x, y, clientX, clientY });
    },
    [pendingPin],
  );

  const handleCommentAdded = (comment: CommentData) => {
    setAllComments((prev) => [...prev, comment]);
    onCommentAdded(comment);
    setPendingPin(null);
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Wrapper gives ZoomControls an absolute positioning context */}
      <div className="relative w-full">
        {/* Scrollable zoom viewport — fixed height, expands content via real width */}
        <div
          ref={viewportRef}
          className="relative w-full overflow-auto rounded-xl border border-white/[0.06] bg-[#080810] max-h-[70vh]"
        >
          {/* Inner wrapper grows to zoom * 100% width; height follows naturally */}
          <div style={{ width: `${zoom * 100}%` }} className="relative">
            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={signedUrl}
              alt={fileName}
              onClick={handleImageClick}
              className={cn(
                "w-full object-contain select-none block",
                pendingPin ? "cursor-default" : "cursor-crosshair",
              )}
              draggable={false}
            />

            {/* Pinned comment markers */}
            {(() => {
              // Group pins that are very close and stack them visually to avoid overlap
              const groups: Record<string, CommentData[]> = {};
              pinnedComments.forEach((c) => {
                const kx = Math.round((c.xPosition ?? 0) * 1000);
                const ky = Math.round((c.yPosition ?? 0) * 1000);
                const key = `${kx}_${ky}`;
                groups[key] = groups[key] || [];
                groups[key].push(c);
              });

              return pinnedComments.map((c, i) => {
                const kx = Math.round((c.xPosition ?? 0) * 1000);
                const ky = Math.round((c.yPosition ?? 0) * 1000);
                const key = `${kx}_${ky}`;
                const group = groups[key] || [];
                const indexInGroup = group.findIndex((g) => g.id === c.id);

                const transform = `translate(-50%, calc(-50% + ${indexInGroup * 12}px))`;

                return (
                  <div
                    key={c.id}
                    data-comment-id={c.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPinClick?.(c.id);
                    }}
                    style={{
                      position: "absolute",
                      left: `${(c.xPosition ?? 0) * 100}%`,
                      top: `${(c.yPosition ?? 0) * 100}%`,
                      transform,
                      cursor: "pointer",
                    }}
                  >
                    <PinMarker
                      number={i + 1}
                      style={{}}
                      active={activePinId === c.id}
                    />
                  </div>
                );
              });
            })()}

            {/* Pending pin (before popup submitted) */}
            {pendingPin && (
              <PinMarker
                number={pinnedComments.length + 1}
                active
                style={{
                  left: `${pendingPin.x * 100}%`,
                  top: `${pendingPin.y * 100}%`,
                }}
              />
            )}

            {/* Add comment popup */}
            {pendingPin && (
              <AddCommentPopup
                pin={pendingPin}
                token={token}
                commentApiBase={commentApiBase ?? "/api/review"}
                onAdd={handleCommentAdded}
                onCancel={() => setPendingPin(null)}
              />
            )}
          </div>
        </div>

        {/* Zoom controls — outside scroll container, stays pinned to bottom-right */}
        <ZoomControls
          zoom={zoom}
          onZoomIn={() => setZoom((z) => clampedZoom(z + ZOOM_STEP))}
          onZoomOut={() => setZoom((z) => clampedZoom(z - ZOOM_STEP))}
          onReset={() => setZoom(1)}
        />
      </div>

      {/* Click hint */}
      <p className="mt-2 text-[11px] text-white/25 text-center select-none">
        {zoom === 1
          ? "Click to pin a comment · Ctrl+scroll or use buttons to zoom"
          : "Click to pin a comment · scroll to pan"}
      </p>
    </div>
  );
}

// Scroll to and highlight a pin when requested
// Implemented below as a separate effect to avoid rerendering the main return.

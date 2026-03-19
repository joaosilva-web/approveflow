"use client";

import React, { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMb?: number;
  disabled?: boolean;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-violet-500"
      aria-hidden="true"
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function UploadZone({
  onFileSelect,
  accept,
  maxSizeMb = 100,
  disabled = false,
  className,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      const maxBytes = maxSizeMb * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(`File is too large. Max size is ${maxSizeMb} MB.`);
        return;
      }
      setSelectedFile(file);
      onFileSelect(file);
    },
    [maxSizeMb, onFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [disabled, processFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset input so the same file can be re-selected
      e.target.value = "";
    },
    [processFile],
  );

  return (
    <div className={cn("relative", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl",
          "border-2 border-dashed transition-all duration-200 text-center cursor-pointer",
          disabled && "opacity-50 pointer-events-none",
          isDragging
            ? "border-violet-500/70 bg-violet-500/[0.06]"
            : selectedFile
              ? "border-emerald-500/40 bg-emerald-500/[0.04]"
              : "border-white/[0.10] hover:border-violet-500/40 hover:bg-violet-500/[0.03] bg-white/[0.02]",
        )}
      >
        <label className="flex flex-col items-center gap-3 cursor-pointer w-full">
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
          />

          {selectedFile ? (
            <>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <svg
                  width="18"
                  height="18"
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
                <p className="text-sm font-medium text-white/80 truncate max-w-[200px]">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-white/40 mt-0.5">
                  {formatSize(selectedFile.size)}
                </p>
              </div>
              <span className="text-xs text-violet-400 underline underline-offset-2">
                Click to change file
              </span>
            </>
          ) : (
            <>
              <FileIcon />
              <div>
                <p className="text-sm text-white/70">
                  <span className="font-medium text-violet-400">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-white/35 mt-1">
                  Images, PDFs, videos, documents, ZIP — up to {maxSizeMb} MB
                </p>
              </div>
            </>
          )}
        </label>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

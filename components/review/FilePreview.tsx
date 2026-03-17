"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FilePreviewProps {
  signedUrl: string;
  mimeType: string;
  fileName: string;
  allowDownload: boolean;
}

function DownloadButton({ url, fileName }: { url: string; fileName: string }) {
  const [loading, setLoading] = React.useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium",
        "bg-white/[0.06] border border-white/[0.10] text-white/70",
        "hover:bg-white/[0.10] hover:text-white/90 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
        "disabled:opacity-50 disabled:cursor-not-allowed",
      )}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {loading ? "Downloading..." : "Download"}
    </button>
  );
}

export default function FilePreview({
  signedUrl,
  mimeType,
  fileName,
  allowDownload,
}: FilePreviewProps) {
  const isImage = mimeType.startsWith("image/");
  const isVideo = mimeType.startsWith("video/");
  const isPdf = mimeType === "application/pdf";

  if (isImage) {
    // Image preview is handled by ImageWithComments
    return null;
  }

  if (isVideo) {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <video
          src={signedUrl}
          controls
          className="w-full max-h-[70vh] rounded-xl bg-black object-contain"
          aria-label={fileName}
        >
          Your browser does not support the video tag.
        </video>
        {allowDownload && (
          <DownloadButton url={signedUrl} fileName={fileName} />
        )}
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <iframe
          src={`${signedUrl}#toolbar=0&navpanes=0`}
          className="w-full h-[70vh] rounded-xl border border-white/[0.06] bg-white"
          title={fileName}
        />
        {allowDownload && (
          <DownloadButton url={signedUrl} fileName={fileName} />
        )}
      </div>
    );
  }

  // Generic file
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-12">
      <div className="w-20 h-20 rounded-2xl bg-white/[0.05] border border-white/[0.10] flex items-center justify-center">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white/40"
          aria-hidden="true"
        >
          <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
          <polyline points="13 2 13 9 20 9" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-white/70 max-w-[240px] break-words">
          {fileName}
        </p>
        <p className="text-xs text-white/35 mt-1">
          Preview not available for this file type
        </p>
      </div>
      {allowDownload && <DownloadButton url={signedUrl} fileName={fileName} />}
    </div>
  );
}

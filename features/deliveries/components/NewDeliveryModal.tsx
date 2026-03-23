"use client";

import React, { useState, useTransition } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import UploadZone from "@/features/deliveries/components/UploadZone";
import {
  getUploadUrl,
  createDelivery,
} from "@/features/deliveries/actions/deliveries";
import { supabaseClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { getPublicReviewPath } from "@/lib/freelancer-branding-shared";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewDeliveryModalProps {
  projectId: string;
  freelancerSlug?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reviewToken: string) => void;
}

type Step = "upload" | "uploading" | "done" | "error";

// ─── Link copy toast ──────────────────────────────────────────────────────────

function ReviewLinkBox({
  token,
  slug,
}: {
  token: string;
  slug?: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}${getPublicReviewPath(token, slug)}`;

  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-white/70">
        Compartilhe este link com seu cliente. Sem necessidade de conta.
      </p>
      <div className="flex items-center gap-2 p-3 bg-white/[0.04] border border-white/[0.08] rounded-xl">
        <span className="flex-1 text-xs text-violet-300 font-mono truncate">
          {url}
        </span>
        <button
          onClick={copy}
          className={cn(
            "shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150",
            copied
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-white/[0.06] text-white/70 border border-white/[0.10] hover:bg-white/[0.10]",
          )}
        >
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NewDeliveryModal({
  projectId,
  freelancerSlug,
  isOpen,
  onClose,
  onSuccess,
}: NewDeliveryModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [label, setLabel] = useState("");
  const [password, setPassword] = useState("");
  const [allowDownload, setAllowDownload] = useState(true);
  const [reviewToken, setReviewToken] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    if (step === "uploading") return; // prevent close while uploading
    setStep("upload");
    setSelectedFile(null);
    setLabel("");
    setPassword("");
    setAllowDownload(true);
    setReviewToken("");
    setErrorMsg("");
    setProgress(0);
    onClose();
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    startTransition(async () => {
      setStep("uploading");
      setProgress(10);

      try {
        // 1) Get presigned upload URL from server
        const urlResult = await getUploadUrl(
          selectedFile.name,
          selectedFile.type,
          projectId,
          selectedFile.size,
        );

        if ("error" in urlResult) throw new Error(urlResult.error);

        setProgress(30);

        // 2) Upload directly to Supabase from the browser
        const { error: uploadError } = await supabaseClient.storage
          .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "deliveries")
          .uploadToSignedUrl(urlResult.path, urlResult.token, selectedFile, {
            contentType: selectedFile.type,
          });

        if (uploadError) throw new Error(uploadError.message);

        setProgress(75);

        // 3) Create delivery record
        const result = await createDelivery({
          projectId,
          label: label.trim() || undefined,
          filePath: urlResult.path,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          mimeType: selectedFile.type,
          allowDownload,
          password: password.trim() || undefined,
        });

        if (result.error) throw new Error(result.error);

        setProgress(100);
        setReviewToken(result.reviewToken!);
        setStep("done");
        onSuccess(result.reviewToken!);
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : "Falha no envio");
        setStep("error");
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Enviar nova versão"
      description="Envie um arquivo e obtenha um link de revisão seguro para compartilhar com seu cliente."
      size="md"
      closeOnOverlayClick={step !== "uploading"}
      footer={
        step === "upload" ? (
          <div className="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!selectedFile || isPending}
              loading={isPending}
              onClick={handleUpload}
            >
              Enviar e obter link
            </Button>
          </div>
        ) : step === "done" ? (
          <Button variant="primary" fullWidth onClick={handleClose}>
            Concluído
          </Button>
        ) : null
      }
    >
      {/* ── Upload form ───────────────────────────────────────────────────── */}
      {step === "upload" && (
        <div className="flex flex-col gap-5">
          <UploadZone
            onFileSelect={(f) => setSelectedFile(f)}
            maxSizeMb={100}
          />

          <Input
            label="Rótulo da versão (opcional)"
            placeholder="Ex.: Ajustes de cor, Versão final…"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            hint="Exibido no histórico de versões do cliente"
          />

          <Input
            type="password"
            label="Senha do link (opcional)"
            placeholder="Deixar em branco para sem senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint="O cliente deve inserir esta senha para ver o arquivo"
          />

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-white/70">
              Permitir download pelo cliente
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={allowDownload}
              onClick={() => setAllowDownload((v) => !v)}
              className={cn(
                "relative w-10 h-5.5 rounded-full transition-colors duration-200",
                allowDownload ? "bg-violet-600" : "bg-white/[0.12]",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200",
                  allowDownload ? "translate-x-4" : "translate-x-0",
                )}
              />
            </button>
          </label>
        </div>
      )}

      {/* ── Uploading ─────────────────────────────────────────────────────── */}
      {step === "uploading" && (
        <div className="flex flex-col items-center gap-5 py-6">
          <div className="relative w-16 h-16">
            <svg
              className="animate-spin w-16 h-16 text-violet-500/30"
              viewBox="0 0 64 64"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
            <svg
              className="absolute inset-0 w-16 h-16 -rotate-90 text-violet-500"
              viewBox="0 0 64 64"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
              {progress}%
            </span>
          </div>
          <p className="text-sm text-white/60">Enviando seu arquivo…</p>
        </div>
      )}

      {/* ── Done ──────────────────────────────────────────────────────────── */}
      {step === "done" && (
        <div className="flex flex-col gap-5">
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
              <p className="text-sm font-semibold text-emerald-400">
                Envio concluído!
              </p>
              <p className="text-xs text-white/50 mt-0.5">
                Seu link de revisão está pronto
              </p>
            </div>
          </div>
          <ReviewLinkBox token={reviewToken} slug={freelancerSlug} />
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {step === "error" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 p-4 bg-red-500/[0.08] border border-red-500/25 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-red-500/[0.12] flex items-center justify-center text-red-400 shrink-0">
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
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-400">
                Falha no envio
              </p>
              <p className="text-xs text-white/50 mt-0.5">{errorMsg}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              setStep("upload");
              setErrorMsg("");
            }}
          >
            Tentar novamente
          </Button>
        </div>
      )}
    </Modal>
  );
}



"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { createProject } from "@/features/projects/actions/projects";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewProjectModal({
  isOpen,
  onClose,
}: NewProjectModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createProject(formData);
      if (result?.error) {
        setError(result.error);
        if (result.upgrade) setShowUpgrade(true);
      }
      // On success, createProject redirects to /dashboard/projects/[id]
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo projeto"
      description="Crie um novo projeto para começar a enviar arquivos para seu cliente."
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="new-project-form"
            loading={isPending}
          >
            Criar projeto
          </Button>
        </div>
      }
    >
      <form
        id="new-project-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <Input
          name="name"
          label="Nome do projeto"
          placeholder="Identidade visual, Redesign do site…"
          required
          fullWidth
        />
        <Input
          name="clientName"
          label="Nome do cliente"
          placeholder="Empresa Ltda, João Silva…"
          required
          fullWidth
        />
        <Input
          name="clientEmail"
          label="E-mail do cliente (opcional)"
          type="email"
          placeholder="cliente@empresa.com"
          fullWidth
          hint="Usado para notificações de revisão por e-mail"
        />
        <Textarea
          name="description"
          label="Descrição (opcional)"
          placeholder="Notas sobre este projeto…"
          rows={3}
          fullWidth
          resize="none"
        />
        {error && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-red-400" role="alert">
              {error}
            </p>
            {showUpgrade && (
              <Link
                href="/dashboard/billing"
                className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-2"
              >
                Fazer upgrade para Pro &rarr;
              </Link>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}

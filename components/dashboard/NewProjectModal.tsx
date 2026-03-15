"use client";

import React, { useState, useTransition } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { createProject } from "@/lib/actions/projects";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewProjectModal({
  isOpen,
  onClose,
}: NewProjectModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createProject(formData);
      if (result?.error) {
        setError(result.error);
      }
      // On success, createProject redirects to /dashboard/projects/[id]
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New project"
      description="Create a new project to start delivering files to your client."
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="new-project-form"
            loading={isPending}
          >
            Create project
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
          label="Project name"
          placeholder="Brand guidelines, Website redesign…"
          required
          fullWidth
        />
        <Input
          name="clientName"
          label="Client name"
          placeholder="Acme Corp, John Doe…"
          required
          fullWidth
        />
        <Input
          name="clientEmail"
          label="Client email (optional)"
          type="email"
          placeholder="client@company.com"
          fullWidth
          hint="Used for optional email verification on the review link"
        />
        <Textarea
          name="description"
          label="Description (optional)"
          placeholder="Brief notes about this project…"
          rows={3}
          fullWidth
          resize="none"
        />
        {error && (
          <p className="text-xs text-red-400" role="alert">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}

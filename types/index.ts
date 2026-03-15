// ─── Shared primitive types ─────────────────────────────────────────────────

export type Size = "sm" | "md" | "lg" | "xl";

export type ColorScheme =
  | "default"
  | "brand"
  | "success"
  | "warning"
  | "error"
  | "info";

// ─── Domain types ────────────────────────────────────────────────────────────

export type ApprovalStatus =
  | "pending"
  | "approved"
  | "changes_requested"
  | "expired";

export interface Project {
  id: string;
  title: string;
  createdAt: Date;
  status: ApprovalStatus;
  versions: Version[];
  reviewToken: string;
}

export interface Version {
  id: string;
  number: number;
  label: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
  comments: Comment[];
  approvedAt?: Date;
  approvedBy?: ClientSignature;
}

export interface Comment {
  id: string;
  body: string;
  authorName: string;
  authorEmail?: string;
  createdAt: Date;
  versionId: string;
}

export interface ClientSignature {
  name: string;
  email: string;
  ip?: string;
  userAgent?: string;
  signedAt: Date;
}

export interface ReviewLink {
  token: string;
  projectId: string;
  expiresAt?: Date;
  requiresEmailVerification: boolean;
  allowDownload: boolean;
  password?: string;
}

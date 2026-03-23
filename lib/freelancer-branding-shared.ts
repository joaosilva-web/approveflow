export const DEFAULT_PRIMARY_COLOR = "#7C3AED";
export const DEFAULT_SECONDARY_COLOR = "#4F46E5";

export interface FreelancerBranding {
  userId: string;
  displayName: string;
  logoUrl: string | null;
  logoPath: string | null;
  primaryColor: string;
  secondaryColor: string;
  slug: string | null;
}

const HEX_COLOR_REGEX = /^#?[0-9a-fA-F]{6}$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED_SLUGS = new Set([
  "api",
  "dashboard",
  "design-review-tool",
  "client-approval-tool",
  "website-review-tool",
  "logo-feedback-tool",
  "ui-feedback-tool",
  "review",
  "guest-review",
  "login",
  "pt",
]);

export function normalizeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidSlug(slug: string) {
  return SLUG_REGEX.test(slug) && !RESERVED_SLUGS.has(slug);
}

export function validateSlugOrThrow(slug: string) {
  if (!slug) {
    throw new Error("Escolha um slug para o seu link.");
  }

  if (!isValidSlug(slug)) {
    throw new Error(
      "O slug deve conter apenas letras minúsculas, números e hífen, sem espaços.",
    );
  }
}

function hexToRgb(hex: string) {
  const sanitized = hex.replace("#", "");
  return {
    r: Number.parseInt(sanitized.slice(0, 2), 16),
    g: Number.parseInt(sanitized.slice(2, 4), 16),
    b: Number.parseInt(sanitized.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((value) =>
      Math.max(0, Math.min(255, Math.round(value)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")
    .toUpperCase()}`;
}

function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const normalize = (channel: number) => {
    const value = channel / 255;
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  };

  return (
    0.2126 * normalize(r) + 0.7152 * normalize(g) + 0.0722 * normalize(b)
  );
}

function mixHex(baseHex: string, otherHex: string, weight: number) {
  const base = hexToRgb(baseHex);
  const other = hexToRgb(otherHex);

  return rgbToHex(
    base.r + (other.r - base.r) * weight,
    base.g + (other.g - base.g) * weight,
    base.b + (other.b - base.b) * weight,
  );
}

function ensureAccessibleAccent(hex: string) {
  let candidate = hex.startsWith("#") ? hex : `#${hex}`;
  let tries = 0;

  while (relativeLuminance(candidate) < 0.18 && tries < 5) {
    candidate = mixHex(candidate, "#FFFFFF", 0.18);
    tries += 1;
  }

  return candidate.toUpperCase();
}

export function normalizeHexColor(input: string, fallback: string) {
  if (!input) return fallback;
  const trimmed = input.trim();
  if (!HEX_COLOR_REGEX.test(trimmed)) return fallback;
  const prefixed = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return ensureAccessibleAccent(prefixed.toUpperCase());
}

export function hexToRgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getBrandTextColor(hex: string) {
  return relativeLuminance(hex) > 0.55 ? "#0B1020" : "#FFFFFF";
}

export function getPublicReviewPath(reviewToken: string, slug?: string | null) {
  return slug ? `/${slug}/review/${reviewToken}` : `/review/${reviewToken}`;
}


import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "deliveries";

// Service-role client — server-side only (bypass RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// ─── Storage helpers ─────────────────────────────────────────────────────────

/**
 * Upload a file buffer to Supabase Storage.
 * Returns the storage path on success.
 */
export async function uploadFile(
  path: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType,
      upsert: false,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  return path;
}

/**
 * Generate a short-lived signed URL for reading a file.
 * Default expiry: 2 hours.
 */
export async function getSignedUrl(
  path: string,
  expiresIn = 60 * 60 * 2,
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error || !data) throw new Error(`Signed URL failed: ${error?.message}`);

  return data.signedUrl;
}

/**
 * Create a signed upload URL so the client can upload directly to Supabase
 * without routing the bytes through Next.js.
 */
export async function getSignedUploadUrl(path: string) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error || !data)
    throw new Error(`Signed upload URL failed: ${error?.message}`);

  return data; // { signedUrl, token, path }
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);

  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}

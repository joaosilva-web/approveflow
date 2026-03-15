import { createClient } from "@supabase/supabase-js";

// Anon client — safe to use in browser (only public env vars)
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

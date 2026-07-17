import { createClient } from "@supabase/supabase-js";

// Publishable (anon) key — safe to expose in client code. RLS enforces access.
const SUPABASE_URL = "https://prdqljwrnssybxwnnsto.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ZfUflpuGI_K_ghRT2fm7yQ_S8Xq--sJ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

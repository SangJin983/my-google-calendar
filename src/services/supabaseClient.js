import { SUPABASE_CONFIG } from "@config/supabaseConfig";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  SUPABASE_CONFIG.URL,
  SUPABASE_CONFIG.ANON_KEY
);

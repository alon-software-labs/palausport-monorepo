import { createClient } from "@supabase/supabase-js";
import { supabaseKey, supabaseUrl } from "./config";

/** Browser / SPA client (e.g. Vite). */
export function createSupabaseJsClient() {
  return createClient(supabaseUrl, supabaseKey);
}

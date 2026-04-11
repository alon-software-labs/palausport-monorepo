import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseKey, supabaseUrl } from "./config";

/** Browser / SPA client (e.g. Vite). */
declare global {
  // eslint-disable-next-line no-var
  var __palausportSupabaseJsClient: SupabaseClient | undefined;
}

export function createSupabaseJsClient() {
  if (!globalThis.__palausportSupabaseJsClient) {
    globalThis.__palausportSupabaseJsClient = createClient(supabaseUrl, supabaseKey);
  }
  return globalThis.__palausportSupabaseJsClient;
}

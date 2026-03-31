import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "./config";

/** Next.js App Router browser client. */
export function createNextBrowserSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}

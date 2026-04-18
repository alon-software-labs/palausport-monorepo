import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "./config";

declare global {
  // eslint-disable-next-line no-var
  var __palausportNextBrowserSupabaseClient:
    | ReturnType<typeof createBrowserClient>
    | undefined;
}

/** Next.js App Router browser client. */
export function createNextBrowserSupabaseClient() {
  if (!globalThis.__palausportNextBrowserSupabaseClient) {
    globalThis.__palausportNextBrowserSupabaseClient = createBrowserClient(
      supabaseUrl,
      supabaseKey
    );
  }
  return globalThis.__palausportNextBrowserSupabaseClient;
}

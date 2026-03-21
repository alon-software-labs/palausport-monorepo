import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseKey } from '@/lib/supabase/config';

export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseKey);
}

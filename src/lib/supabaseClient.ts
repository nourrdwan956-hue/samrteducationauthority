import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 'https://cceubgakgkorkzylfepz.supabase.co';
const supabaseKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 'sb_publishable_tYB4CKpWdsGyKR8uOFXiHA_ZZ-ShMm4';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper to check if Supabase connection is responding
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('platforms').select('count', { count: 'exact', head: true });
    return !error;
  } catch {
    return false;
  }
}

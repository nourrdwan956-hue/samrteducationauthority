import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cceubgakgkorkzylfepz.supabase.co';
const supabaseKey = 'sb_publishable_tYB4CKpWdsGyKR8uOFXiHA_ZZ-ShMm4';

const supabase = createClient(supabaseUrl, supabaseKey);
supabase.from('platforms').select('id').then(res => {
  console.log("Supabase platforms:", res.data);
  console.log("Error if any:", res.error);
});

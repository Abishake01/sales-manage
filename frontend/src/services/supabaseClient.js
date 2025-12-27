import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
// Support both ANON key and legacy publishable var name
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars are missing. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
}

// Basic sanity check: Supabase anon keys are JWTs; known invalid prefixes cause 400s
if (supabaseKey && supabaseKey.startsWith('sb_publishable_')) {
  // eslint-disable-next-line no-console
  console.error('The Supabase key looks invalid (starts with sb_publishable_). Use the Anon public key from Supabase → Settings → API.');
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

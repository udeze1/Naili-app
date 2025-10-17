import { createClient } from '@supabase/supabase-js';

// Make sure this anon key is correct
const SUPABASE_URL = 'https://swqcxwhcxddivtacyyff.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3cWN4d2hjeGRkaXZ0YWN5eWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODY2NTEsImV4cCI6MjA2NjI2MjY1MX0.Nfa0IRQKbL1qLknmaaWuf3-bsQqrWoKOzKiNKUXqkeo';

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { headers: { 'Content-Type': 'application/json' } },
});
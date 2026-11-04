import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://ktovjbetgforctvxfxny.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b3ZqYmV0Z2ZvcmN0dnhmeG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjI2MDMsImV4cCI6MjA5NjkzODYwM30.i4u8v37qRDZMyOWeqJl6vcJj2MqrIzqszUZSGZsazNA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

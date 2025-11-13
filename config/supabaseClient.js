import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

export const SUPABASE_URL = 'https://dzatmxvwmpczteaqpmmm.supabase.co';   
export const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6YXRteHZ3bXBjenRlYXFwbW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjY3OTAsImV4cCI6MjA3NjEwMjc5MH0.8Xf6Mx6DzJ4tGSO-VlisiBlUpgC4XxmAdNRf6j3afAs';                 // <- pega aquí tu anon key (no uses service_role)

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

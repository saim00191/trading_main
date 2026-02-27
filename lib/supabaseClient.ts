import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://vsxhewtlbbjpwtftbrhw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzeGhld3RsYmJqcHd0ZnRicmh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NTExMDcsImV4cCI6MjA4NzMyNzEwN30.dCxBE6fcTkYzpDMDdtYysVfdFppLvMvPy-940F7eQZQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
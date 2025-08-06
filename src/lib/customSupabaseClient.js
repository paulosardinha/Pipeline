import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://adsjmrwteeafwsqfcgcw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2ptcnd0ZWVhZndzcWZjZ2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxODUwNDgsImV4cCI6MjA2ODc2MTA0OH0.xKcDyhx2Nnic6Rn4b2nzLV1LcjrK4WZEifds7AY8KgU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
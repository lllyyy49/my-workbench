import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vqlsyherssrcliijadec.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxbHN5aGVyc3NyY2xpaWphZGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNDIyOTIsImV4cCI6MjEwMDcxODI5Mn0.QEiSKQNQtdRfpDvhEetMm8MopyZ69l4MVYSlzqniQ1Y'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

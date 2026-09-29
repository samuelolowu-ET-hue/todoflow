// BACKEND INTEGRATION POINT:
// This file initializes the Supabase client using environment variables.
// In production, set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
// in your Vercel/Netlify dashboard and in a local .env.local file.
//
// WHY ANON KEY IS SAFE ON THE CLIENT:
// The anon key only allows operations permitted by your Supabase Row Level Security (RLS) policies.
// Never use the service_role key in client-side code — it bypasses all security.
//
// HOW TO GET THESE VALUES:
// 1. Go to app.supabase.com
// 2. Open your project → Settings → API
// 3. Copy "Project URL" and "anon public" key
//
// SQL TABLE REQUIRED (run in Supabase SQL Editor):
// create table todos (
//   id uuid primary key default gen_random_uuid(),
//   title text not null,
//   notes text,
//   completed boolean not null default false,
//   priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
//   created_at timestamptz not null default now(),
//   updated_at timestamptz not null default now()
// );

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Check if Supabase is properly configured (not dummy/placeholder values)
export const isSupabaseConfigured =
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0 &&
  !supabaseUrl.includes('dummy') &&
  !supabaseAnonKey.includes('dummy') &&
  !supabaseAnonKey.includes('dummykey') &&
  supabaseUrl.startsWith('https://');

// Only create the client if properly configured.
// API routes check isSupabaseConfigured before using supabase.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
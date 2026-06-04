-- Migration: Upgrades for DevSync Product Finalization
-- Date: 2026-06-05
-- Description: Sets up bookmarks, settings, and update resources categories.

-- ==========================================
-- 1. ADD SETTINGS COLUMN TO USERS
-- ==========================================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS alert_ignore_date TIMESTAMPTZ;


-- ==========================================
-- 2. MIGRATE RESOURCES CATEGORIES & UPDATE CHECK CONSTRAINT
-- ==========================================
-- Safe migration of existing categories to the new segregated set:
-- ('pdf', 'code_file', 'sheet', 'dsa_link', 'link')
UPDATE public.resources SET category = 'pdf' WHERE category NOT IN ('pdf', 'code_file', 'sheet', 'dsa_link', 'link');

-- Update Check Constraint
ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS resources_category_check;
ALTER TABLE public.resources ADD CONSTRAINT resources_category_check 
  CHECK (category IN ('pdf', 'code_file', 'sheet', 'dsa_link', 'link'));


-- ==========================================
-- 3. CREATE BOOKMARKS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL,
    target_type VARCHAR NOT NULL CHECK (target_type IN ('resource', 'dsa')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_target_bookmark UNIQUE (user_id, target_id, target_type)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS bookmarks_user_idx ON public.bookmarks (user_id);

-- Enable RLS
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Bookmarks RLS Policies
CREATE POLICY "Allow read own bookmarks" 
  ON public.bookmarks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow insert own bookmarks" 
  ON public.bookmarks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow delete own bookmarks" 
  ON public.bookmarks FOR DELETE 
  USING (auth.uid() = user_id);


-- ==========================================
-- 4. CONFIGURE AVATARS STORAGE BUCKET & POLICIES
-- ==========================================
-- Insert avatars bucket into storage.buckets if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for avatars bucket
CREATE POLICY "Allow public read of avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Allow auth users to upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow users to update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Allow users to delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

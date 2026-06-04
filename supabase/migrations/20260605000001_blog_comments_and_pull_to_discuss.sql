-- Migration: Blog Comments, Admin creation, and forum-blog links
-- Date: 2026-06-05

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================
-- 1. ALTER FORUM THREADS TO LINK BLOGS
-- ==========================================
ALTER TABLE public.forum_threads ADD COLUMN IF NOT EXISTS blog_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE;

-- ==========================================
-- 2. CREATE BLOG COMMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.blog_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    upvotes INTEGER NOT NULL DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Index for speed
CREATE INDEX IF NOT EXISTS blog_comments_blog_idx ON public.blog_comments (blog_id);
CREATE INDEX IF NOT EXISTS blog_comments_parent_idx ON public.blog_comments (parent_id);

-- RLS Policies for Blog Comments
CREATE POLICY "Allow public read blog comments" 
  ON public.blog_comments FOR SELECT 
  USING (true);

CREATE POLICY "Allow auth insert blog comments" 
  ON public.blog_comments FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Allow update own blog comments or staff" 
  ON public.blog_comments FOR UPDATE 
  USING (auth.uid() = author_id OR public.is_staff(auth.uid()));

CREATE POLICY "Allow delete own blog comments or staff" 
  ON public.blog_comments FOR DELETE 
  USING (auth.uid() = author_id OR public.is_staff(auth.uid()));

-- ==========================================
-- 3. CTE BLOG COMMENT TREE FUNCTION
-- ==========================================
CREATE OR REPLACE FUNCTION public.get_blog_comment_tree(blog_id_param UUID)
RETURNS TABLE (
    id UUID,
    blog_id UUID,
    parent_id UUID,
    author_id UUID,
    content TEXT,
    upvotes INTEGER,
    is_deleted BOOLEAN,
    created_at TIMESTAMPTZ,
    depth INTEGER,
    author_name VARCHAR,
    author_avatar TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE comment_tree AS (
    SELECT c.id, c.blog_id, c.parent_id, c.author_id, c.content, c.upvotes, c.is_deleted, c.created_at, 0 AS depth
    FROM public.blog_comments c
    WHERE c.blog_id = blog_id_param AND c.parent_id IS NULL

    UNION ALL

    SELECT c.id, c.blog_id, c.parent_id, c.author_id, c.content, c.upvotes, c.is_deleted, c.created_at, ct.depth + 1 AS depth
    FROM public.blog_comments c
    JOIN comment_tree ct ON c.parent_id = ct.id
    WHERE ct.depth < 1
  )
  SELECT 
    ct.id,
    ct.blog_id,
    ct.parent_id,
    ct.author_id,
    ct.content,
    ct.upvotes,
    ct.is_deleted,
    ct.created_at,
    ct.depth,
    COALESCE(u.name, 'Deleted User')::VARCHAR AS author_name,
    u.avatar_url AS author_avatar
  FROM comment_tree ct
  LEFT JOIN public.users u ON ct.author_id = u.id
  ORDER BY ct.depth ASC, ct.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 4. FUNCTION FOR ADMIN TO CREATE MORE ADMINS
-- ==========================================
CREATE OR REPLACE FUNCTION public.create_admin_account(new_admin_id TEXT, new_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  new_user_id UUID := gen_random_uuid();
  mock_email TEXT := lower(trim(new_admin_id)) || '@devsync-admin.local';
BEGIN
  -- Verify caller is authenticated and is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can register new admin accounts.';
  END IF;

  -- Verify admin ID doesn't already exist
  IF EXISTS (
    SELECT 1 FROM auth.users WHERE email = mock_email
  ) THEN
    RAISE EXCEPTION 'Admin ID already exists.';
  END IF;

  -- Insert into auth.users (Supabase Identity Management)
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000'::uuid,
    mock_email,
    crypt(new_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    json_build_object('name', upper(trim(new_admin_id)), 'batch', 'Admin')::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now()
  );

  -- Insert into public.users profile
  INSERT INTO public.users (
    id,
    email,
    name,
    batch,
    role,
    reputation,
    created_at
  ) VALUES (
    new_user_id,
    mock_email,
    upper(trim(new_admin_id)),
    'Admin',
    'admin',
    1000,
    now()
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Limit execution permissions to authenticated users
REVOKE ALL ON FUNCTION public.create_admin_account(TEXT, TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.create_admin_account(TEXT, TEXT) TO authenticated;

-- ==========================================
-- 5. SEED MAIN ADMIN ACCOUNT "AABIR"
-- ==========================================
-- Insert primary admin credentials into auth.users directly (bypassing confirmation)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at
)
SELECT 
  'aab1aab1-aab1-aab1-aab1-aab1aab1aab1'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'aabir@devsync-admin.local',
  crypt('YOUR_ADMIN_PASSWORD_HERE', gen_salt('bf')), -- REPLACE WITH PRIVATE PASSWORD BEFORE DEPLOYING
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"AABIR","batch":"Admin"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'aabir@devsync-admin.local'
);

-- Ensure a corresponding entry in public.users exists with role = 'admin'
INSERT INTO public.users (
  id,
  email,
  name,
  batch,
  role,
  reputation,
  created_at
)
SELECT
  'aab1aab1-aab1-aab1-aab1-aab1aab1aab1'::uuid,
  'aabir@devsync-admin.local',
  'AABIR',
  'Admin',
  'admin',
  1000,
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE id = 'aab1aab1-aab1-aab1-aab1-aab1aab1aab1'::uuid
);

-- ==========================================
-- 6. FUNCTION TO UPVOTE A BLOG COMMENT
-- ==========================================
CREATE OR REPLACE FUNCTION public.upvote_blog_comment(comment_id_param UUID, score_offset INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_score INTEGER;
BEGIN
  UPDATE public.blog_comments
  SET upvotes = upvotes + score_offset
  WHERE id = comment_id_param
  RETURNING upvotes INTO new_score;
  
  RETURN new_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION public.upvote_blog_comment(UUID, INTEGER) FROM public;
GRANT EXECUTE ON FUNCTION public.upvote_blog_comment(UUID, INTEGER) TO authenticated;


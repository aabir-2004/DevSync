-- Initial Database Schema Migration for DevSync Community Platform
-- Date: 2026-06-01
-- Description: Creates the 12 core tables, indexes, constraints, and custom full-text search vectors.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
-- Sourced from auth.users (Supabase managed auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    batch VARCHAR,
    bio TEXT,
    avatar_url TEXT,
    role VARCHAR NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'moderator', 'admin', 'banned')),
    reputation INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. RESOURCES TABLE
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    description TEXT,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    category VARCHAR CHECK (category IN ('notes', 'pdf', 'placement', 'dsa', 'development', 'system_design', 'interview_exp', 'competitive', 'other')),
    semester INTEGER,
    subject VARCHAR,
    tags TEXT[] NOT NULL DEFAULT '{}',
    external_url TEXT NOT NULL,
    thumbnail_url TEXT,
    upvotes INTEGER NOT NULL DEFAULT 0,
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for resources
CREATE INDEX IF NOT EXISTS resources_search_idx ON public.resources USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS resources_tags_idx ON public.resources USING GIN (tags);

-- 3. BLOG POSTS TABLE
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    slug VARCHAR UNIQUE NOT NULL,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    content TEXT, -- Stored as sanitized HTML
    excerpt TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    status VARCHAR NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    views INTEGER NOT NULL DEFAULT 0,
    upvotes INTEGER NOT NULL DEFAULT 0,
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for blog posts
CREATE INDEX IF NOT EXISTS blog_posts_search_idx ON public.blog_posts USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS blog_posts_tags_idx ON public.blog_posts USING GIN (tags);

-- 4. FORUM THREADS TABLE
CREATE TABLE IF NOT EXISTS public.forum_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    category VARCHAR CHECK (category IN ('dsa', 'development', 'placements', 'projects', 'college', 'research', 'general')),
    body TEXT,
    upvotes INTEGER NOT NULL DEFAULT 0,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    views INTEGER NOT NULL DEFAULT 0,
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for forum threads
CREATE INDEX IF NOT EXISTS forum_threads_search_idx ON public.forum_threads USING GIN (search_vector);

-- 5. FORUM COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.forum_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    upvotes INTEGER NOT NULL DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for forum comments
CREATE INDEX IF NOT EXISTS forum_comments_thread_idx ON public.forum_comments (thread_id);
CREATE INDEX IF NOT EXISTS forum_comments_parent_idx ON public.forum_comments (parent_id);

-- 6. VOTES TABLE
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL,
    target_type VARCHAR NOT NULL CHECK (target_type IN ('resource', 'blog', 'thread', 'comment')),
    value INTEGER NOT NULL CHECK (value IN (1, -1)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_target_vote UNIQUE (user_id, target_id, target_type)
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR NOT NULL CHECK (type IN ('reply', 'mention', 'new_resource', 'announcement')),
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Composite index for quick notification fetching
CREATE INDEX IF NOT EXISTS notifications_user_unread_idx ON public.notifications (user_id, is_read);

-- 8. ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    badge_key VARCHAR NOT NULL, -- e.g. 'first_blog', 'ten_answers', 'streak_30'
    earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_badge UNIQUE (user_id, badge_key)
);

-- 9. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    target_id UUID NOT NULL,
    target_type VARCHAR NOT NULL CHECK (target_type IN ('blog', 'thread', 'comment', 'resource')),
    reason TEXT NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title VARCHAR NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR NOT NULL CHECK (type IN ('placement', 'internship', 'hackathon', 'event', 'deadline', 'general')),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. DSA PROBLEMS TABLE
CREATE TABLE IF NOT EXISTS public.dsa_problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    topic VARCHAR NOT NULL, -- e.g. Arrays, Graphs, DP
    difficulty VARCHAR NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    platform VARCHAR NOT NULL CHECK (platform IN ('leetcode', 'codeforces', 'codechef', 'gfg', 'other')),
    external_url TEXT NOT NULL,
    week_number INTEGER,
    is_weekly BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. DSA PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.dsa_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES public.dsa_problems(id) ON DELETE CASCADE,
    status VARCHAR NOT NULL CHECK (status IN ('attempted', 'solved')),
    solved_at TIMESTAMPTZ,
    CONSTRAINT unique_user_problem UNIQUE (user_id, problem_id)
);

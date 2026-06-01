-- Triggers Migration for DevSync Community Platform
-- Date: 2026-06-01
-- Description: Sets up auto-creation of public.users profiles on auth.users signups and auto-computation of search vectors.

-- 1. TRIGGER FOR NEW USER CREATION FROM SUPABASE AUTH
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, batch, bio, avatar_url, role, reputation)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'batch',
    new.raw_user_meta_data->>'bio',
    new.raw_user_meta_data->>'avatar_url',
    'student',
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition for auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. FULL TEXT SEARCH TRIGGER FOR RESOURCES
CREATE OR REPLACE FUNCTION public.resources_search_trigger() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(NEW.tags, ' ')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_resources_search_update
  BEFORE INSERT OR UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.resources_search_trigger();


-- 3. FULL TEXT SEARCH TRIGGER FOR BLOG POSTS
CREATE OR REPLACE FUNCTION public.blog_posts_search_trigger() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(NEW.tags, ' ')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_blog_posts_search_update
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.blog_posts_search_trigger();


-- 4. FULL TEXT SEARCH TRIGGER FOR FORUM THREADS
CREATE OR REPLACE FUNCTION public.forum_threads_search_trigger() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.body, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_forum_threads_search_update
  BEFORE INSERT OR UPDATE ON public.forum_threads
  FOR EACH ROW EXECUTE FUNCTION public.forum_threads_search_trigger();

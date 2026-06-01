-- Unified Global Search Function Migration for DevSync Community Platform
-- Date: 2026-06-01
-- Description: Creates a database function to execute a unified full-text search across resources, blogs, and forum threads using UNION ALL.

CREATE OR REPLACE FUNCTION public.global_search(query_param TEXT)
RETURNS TABLE (
    type TEXT,
    id UUID,
    title VARCHAR,
    ref TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'blog'::TEXT AS type, b.id, b.title, b.slug::TEXT AS ref
  FROM public.blog_posts b
  WHERE b.search_vector @@ plainto_tsquery('english', query_param)
    AND b.status = 'published'

  UNION ALL

  SELECT 'resource'::TEXT AS type, r.id, r.title, r.id::TEXT AS ref
  FROM public.resources r
  WHERE r.search_vector @@ plainto_tsquery('english', query_param)

  UNION ALL

  SELECT 'forum'::TEXT AS type, f.id, f.title, f.id::TEXT AS ref
  FROM public.forum_threads f
  WHERE f.search_vector @@ plainto_tsquery('english', query_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

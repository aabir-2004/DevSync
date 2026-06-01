-- Forum CTE Functions Migration for DevSync Community Platform
-- Date: 2026-06-01
-- Description: Creates a secure database function to fetch 2-level nested comment trees using a recursive CTE.

CREATE OR REPLACE FUNCTION public.get_comment_tree(thread_id_param UUID)
RETURNS TABLE (
    id UUID,
    thread_id UUID,
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
    SELECT c.id, c.thread_id, c.parent_id, c.author_id, c.content, c.upvotes, c.is_deleted, c.created_at, 0 AS depth
    FROM public.forum_comments c
    WHERE c.thread_id = thread_id_param AND c.parent_id IS NULL

    UNION ALL

    SELECT c.id, c.thread_id, c.parent_id, c.author_id, c.content, c.upvotes, c.is_deleted, c.created_at, ct.depth + 1 AS depth
    FROM public.forum_comments c
    JOIN comment_tree ct ON c.parent_id = ct.id
    WHERE ct.depth < 1
  )
  SELECT 
    ct.id,
    ct.thread_id,
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

-- Row Level Security (RLS) Policies for DevSync Community Platform
-- Date: 2026-06-01
-- Description: Enables RLS across all 12 tables and defines access controls.

-- ==========================================
-- ENABLE ROW LEVEL SECURITY
-- ==========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsa_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsa_progress ENABLE ROW LEVEL SECURITY;

-- Helper check function for moderation/admin checks
CREATE OR REPLACE FUNCTION public.is_staff(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_uuid AND role IN ('moderator', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper check function for admin-only checks
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_uuid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- 1. USERS TABLE POLICIES
-- ==========================================
CREATE POLICY "Allow public read users" 
  ON public.users FOR SELECT USING (true);

CREATE POLICY "Allow update own user profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);


-- ==========================================
-- 2. RESOURCES TABLE POLICIES
-- ==========================================
CREATE POLICY "Allow public read resources" 
  ON public.resources FOR SELECT USING (true);

CREATE POLICY "Allow auth insert resources" 
  ON public.resources FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Allow update own resources or staff" 
  ON public.resources FOR UPDATE 
  USING (auth.uid() = author_id OR public.is_staff(auth.uid()));

CREATE POLICY "Allow delete own resources or staff" 
  ON public.resources FOR DELETE 
  USING (auth.uid() = author_id OR public.is_staff(auth.uid()));


-- ==========================================
-- 3. BLOG POSTS TABLE POLICIES
-- ==========================================
CREATE POLICY "Allow read published blogs or drafts by author/staff" 
  ON public.blog_posts FOR SELECT 
  USING (status = 'published' OR auth.uid() = author_id OR public.is_staff(auth.uid()));

CREATE POLICY "Allow auth insert blogs" 
  ON public.blog_posts FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Allow update own blogs or staff" 
  ON public.blog_posts FOR UPDATE 
  USING (auth.uid() = author_id OR public.is_staff(auth.uid()));

CREATE POLICY "Allow delete own blogs or staff" 
  ON public.blog_posts FOR DELETE 
  USING (auth.uid() = author_id OR public.is_staff(auth.uid()));


-- ==========================================
-- 4. FORUM THREADS TABLE POLICIES
-- ==========================================
CREATE POLICY "Allow public read threads" 
  ON public.forum_threads FOR SELECT USING (true);

CREATE POLICY "Allow auth insert threads" 
  ON public.forum_threads FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Allow update own threads or staff" 
  ON public.forum_threads FOR UPDATE 
  USING (auth.uid() = author_id OR public.is_staff(auth.uid()));

CREATE POLICY "Allow delete own threads or staff" 
  ON public.forum_threads FOR DELETE 
  USING (auth.uid() = author_id OR public.is_staff(auth.uid()));


-- ==========================================
-- 5. FORUM COMMENTS TABLE POLICIES
-- ==========================================
CREATE POLICY "Allow public read comments" 
  ON public.forum_comments FOR SELECT USING (true);

CREATE POLICY "Allow auth insert comments" 
  ON public.forum_comments FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Allow update own comments or staff" 
  ON public.forum_comments FOR UPDATE 
  USING (auth.uid() = author_id OR public.is_staff(auth.uid()));

CREATE POLICY "Allow delete own comments or staff" 
  ON public.forum_comments FOR DELETE 
  USING (auth.uid() = author_id OR public.is_staff(auth.uid()));


-- ==========================================
-- 6. VOTES TABLE POLICIES
-- ==========================================
CREATE POLICY "Allow read own votes" 
  ON public.votes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow insert own votes" 
  ON public.votes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update own votes" 
  ON public.votes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow delete own votes" 
  ON public.votes FOR DELETE 
  USING (auth.uid() = user_id);


-- ==========================================
-- 7. NOTIFICATIONS TABLE POLICIES
-- ==========================================
CREATE POLICY "Allow read own notifications" 
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow update own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);


-- ==========================================
-- 8. ACHIEVEMENTS TABLE POLICIES
-- ==========================================
CREATE POLICY "Allow public read achievements" 
  ON public.achievements FOR SELECT USING (true);


-- ==========================================
-- 9. REPORTS TABLE POLICIES
-- ==========================================
CREATE POLICY "Allow staff to read reports" 
  ON public.reports FOR SELECT 
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Allow auth to submit reports" 
  ON public.reports FOR INSERT 
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Allow staff to update reports" 
  ON public.reports FOR UPDATE 
  USING (public.is_staff(auth.uid()));


-- ==========================================
-- 10. ANNOUNCEMENTS TABLE POLICIES
-- ==========================================
CREATE POLICY "Allow public read announcements" 
  ON public.announcements FOR SELECT USING (true);

CREATE POLICY "Allow staff all writes announcements" 
  ON public.announcements FOR ALL 
  USING (public.is_staff(auth.uid()));


-- ==========================================
-- 11. DSA PROBLEMS TABLE POLICIES
-- ==========================================
CREATE POLICY "Allow public read dsa problems" 
  ON public.dsa_problems FOR SELECT USING (true);

CREATE POLICY "Allow admins writes dsa problems" 
  ON public.dsa_problems FOR ALL 
  USING (public.is_admin(auth.uid()));


-- ==========================================
-- 12. DSA PROGRESS TABLE POLICIES
-- ==========================================
CREATE POLICY "Allow read own progress" 
  ON public.dsa_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow insert own progress" 
  ON public.dsa_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update own progress" 
  ON public.dsa_progress FOR UPDATE 
  USING (auth.uid() = user_id);

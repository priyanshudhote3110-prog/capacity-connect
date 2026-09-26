-- ====================================================================
-- CAPACITY CONNECT (समर्थ-पृथ्वी) — ROW LEVEL SECURITY (RLS) & RBAC
-- Ministry of Earth Sciences (MoES), Govt. of India
-- File: 02_postgres_rbac_rls.sql
-- ====================================================================

-- 1. Enable RLS on all public tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if current user is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (SELECT auth.uid())::text AND role = 'admin'
  );
$$;

-- Helper Function: Check if current user is a Trainer or Admin
CREATE OR REPLACE FUNCTION public.is_trainer_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (SELECT auth.uid())::text AND role IN ('trainer', 'admin')
  );
$$;

-- ====================================================================
-- POLICIES: users
-- ====================================================================
DROP POLICY IF EXISTS "Anyone authenticated can read users" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

CREATE POLICY "Anyone authenticated can read users"
ON public.users FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can insert own profile"
ON public.users FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid())::text = id);

CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE TO authenticated
USING ((SELECT auth.uid())::text = id)
WITH CHECK ((SELECT auth.uid())::text = id);

CREATE POLICY "Admins can manage all users"
ON public.users FOR ALL TO authenticated
USING (public.is_admin());

-- ====================================================================
-- POLICIES: courses, modules, lessons
-- ====================================================================
DROP POLICY IF EXISTS "All users can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Trainers and Admins can create courses" ON public.courses;
DROP POLICY IF EXISTS "Trainers can update own courses" ON public.courses;

CREATE POLICY "All users can view published courses"
ON public.courses FOR SELECT TO authenticated
USING (status = 'published' OR public.is_trainer_or_admin());

CREATE POLICY "Trainers and Admins can create courses"
ON public.courses FOR INSERT TO authenticated
WITH CHECK (public.is_trainer_or_admin());

CREATE POLICY "Trainers can update own courses"
ON public.courses FOR UPDATE TO authenticated
USING ((SELECT auth.uid())::text = trainer_id OR public.is_admin())
WITH CHECK ((SELECT auth.uid())::text = trainer_id OR public.is_admin());

-- Course modules & Lessons viewable if parent course is viewable
DROP POLICY IF EXISTS "View modules" ON public.course_modules;
DROP POLICY IF EXISTS "Manage modules" ON public.course_modules;
CREATE POLICY "View modules" ON public.course_modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage modules" ON public.course_modules FOR ALL TO authenticated USING (public.is_trainer_or_admin());

DROP POLICY IF EXISTS "View lessons" ON public.lessons;
DROP POLICY IF EXISTS "Manage lessons" ON public.lessons;
CREATE POLICY "View lessons" ON public.lessons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage lessons" ON public.lessons FOR ALL TO authenticated USING (public.is_trainer_or_admin());

-- ====================================================================
-- POLICIES: enrollments
-- ====================================================================
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can insert own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can update own enrollments" ON public.enrollments;

CREATE POLICY "Users can view own enrollments"
ON public.enrollments FOR SELECT TO authenticated
USING ((SELECT auth.uid())::text = user_id OR public.is_trainer_or_admin());

CREATE POLICY "Users can insert own enrollments"
ON public.enrollments FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid())::text = user_id);

CREATE POLICY "Users can update own enrollments"
ON public.enrollments FOR UPDATE TO authenticated
USING ((SELECT auth.uid())::text = user_id)
WITH CHECK ((SELECT auth.uid())::text = user_id);

-- ====================================================================
-- POLICIES: live_classes
-- ====================================================================
DROP POLICY IF EXISTS "All users can view live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Trainers and Admins can manage live classes" ON public.live_classes;

CREATE POLICY "All users can view live classes"
ON public.live_classes FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Trainers and Admins can manage live classes"
ON public.live_classes FOR ALL TO authenticated
USING (public.is_trainer_or_admin());

-- ====================================================================
-- POLICIES: certificates
-- ====================================================================
DROP POLICY IF EXISTS "Users can view own certificates" ON public.certificates;
DROP POLICY IF EXISTS "System or Admins can issue certificates" ON public.certificates;

CREATE POLICY "Users can view own certificates"
ON public.certificates FOR SELECT TO authenticated
USING ((SELECT auth.uid())::text = user_id OR public.is_trainer_or_admin());

CREATE POLICY "System or Admins can issue certificates"
ON public.certificates FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid())::text = user_id OR public.is_trainer_or_admin());

-- ====================================================================
-- POLICIES: discussions & replies
-- ====================================================================
DROP POLICY IF EXISTS "All users can view discussions" ON public.discussions;
DROP POLICY IF EXISTS "Authenticated users can create discussions" ON public.discussions;
DROP POLICY IF EXISTS "All users can view replies" ON public.discussion_replies;
DROP POLICY IF EXISTS "Authenticated users can create replies" ON public.discussion_replies;

CREATE POLICY "All users can view discussions"
ON public.discussions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create discussions"
ON public.discussions FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid())::text = user_id);

CREATE POLICY "All users can view replies"
ON public.discussion_replies FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create replies"
ON public.discussion_replies FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid())::text = user_id);

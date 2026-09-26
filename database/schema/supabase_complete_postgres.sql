-- ====================================================================
-- CAPACITY CONNECT (समर्थ-पृथ्वी) — MASTER POSTGRESQL DATABASE SETUP
-- Ministry of Earth Sciences (MoES), Govt. of India
-- LIVE SUPABASE PROJECT: https://prmbjchjpetkuoirbwvt.supabase.co
--
-- Instructions:
-- 1. Open Supabase Dashboard -> Project "capicaty connect"
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "+ New query", paste this entire script, and click "Run" (Ctrl+Enter)
-- ====================================================================

-- STAGE 1: DDL — CREATE TABLES
CREATE TABLE IF NOT EXISTS public.users (
    id VARCHAR(36) PRIMARY KEY,
    custom_role_id VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'trainer', 'employee')),
    institute VARCHAR(50) NOT NULL DEFAULT 'IMD',
    designation VARCHAR(100) DEFAULT 'Scientist / Officer',
    department VARCHAR(100) DEFAULT 'Atmospheric & Radar Sciences',
    avatar_url TEXT,
    bio TEXT,
    knowledge_points INTEGER DEFAULT 1500,
    learning_streak INTEGER DEFAULT 1,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.courses (
    id VARCHAR(50) PRIMARY KEY,
    course_code VARCHAR(30) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    institute VARCHAR(50) NOT NULL,
    trainer_id VARCHAR(36) REFERENCES public.users(id) ON DELETE SET NULL,
    trainer_name VARCHAR(150),
    level VARCHAR(20) DEFAULT 'Intermediate',
    duration_minutes INTEGER DEFAULT 0,
    thumbnail_url TEXT,
    is_mandatory BOOLEAN DEFAULT FALSE,
    deadline TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.course_modules (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    module_order INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.lessons (
    id VARCHAR(50) PRIMARY KEY,
    module_id VARCHAR(50) REFERENCES public.course_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    lesson_order INTEGER NOT NULL DEFAULT 1,
    type VARCHAR(20) NOT NULL DEFAULT 'video' CHECK (type IN ('video', 'pdf', 'quiz', 'checklist')),
    duration VARCHAR(20) DEFAULT '15:00',
    duration_minutes INTEGER DEFAULT 15,
    video_url TEXT,
    summary TEXT,
    resources JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.enrollments (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES public.users(id) ON DELETE CASCADE,
    course_id VARCHAR(50) REFERENCES public.courses(id) ON DELETE CASCADE,
    progress_percentage NUMERIC(5,2) DEFAULT 0.00,
    completed_lessons JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in-progress', 'completed')),
    last_accessed_lesson_id VARCHAR(50),
    certificate_id VARCHAR(100),
    enrolled_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.live_classes (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    course_id VARCHAR(50) REFERENCES public.courses(id) ON DELETE SET NULL,
    trainer_id VARCHAR(36) REFERENCES public.users(id) ON DELETE SET NULL,
    trainer_name VARCHAR(150),
    institute VARCHAR(50) NOT NULL,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    stream_url TEXT,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
    attendees_count INTEGER DEFAULT 0,
    recording_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.quizzes (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    passing_score NUMERIC(5,2) DEFAULT 75.00,
    time_limit_minutes INTEGER DEFAULT 15,
    questions JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id VARCHAR(50) PRIMARY KEY,
    quiz_id VARCHAR(50) REFERENCES public.quizzes(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES public.users(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    answers_submitted JSONB,
    attempted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.certificates (
    id VARCHAR(50) PRIMARY KEY,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(36) REFERENCES public.users(id) ON DELETE CASCADE,
    user_name VARCHAR(150) NOT NULL,
    course_id VARCHAR(50) REFERENCES public.courses(id) ON DELETE SET NULL,
    course_title VARCHAR(255) NOT NULL,
    institute VARCHAR(50) NOT NULL,
    score NUMERIC(5,2) NOT NULL,
    issued_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    verification_url TEXT NOT NULL,
    digital_signature_hash VARCHAR(64) NOT NULL,
    signatory_title VARCHAR(150) DEFAULT 'Secretary, Ministry of Earth Sciences, Govt. of India'
);

CREATE TABLE IF NOT EXISTS public.discussions (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) REFERENCES public.courses(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES public.users(id) ON DELETE CASCADE,
    user_name VARCHAR(150),
    user_avatar TEXT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.discussion_replies (
    id VARCHAR(50) PRIMARY KEY,
    discussion_id VARCHAR(50) REFERENCES public.discussions(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES public.users(id) ON DELETE CASCADE,
    user_name VARCHAR(150),
    user_avatar TEXT,
    content TEXT NOT NULL,
    is_trainer_solution BOOLEAN DEFAULT FALSE,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Fast Indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_courses_institute ON public.courses(institute);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_course_modules_course ON public.course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_live_classes_institute ON public.live_classes(institute);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_course ON public.discussions(course_id);

-- STAGE 2: ROW LEVEL SECURITY (RLS)
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

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = (SELECT auth.uid())::text AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_trainer_or_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = (SELECT auth.uid())::text AND role IN ('trainer', 'admin'));
$$;

DROP POLICY IF EXISTS "Anyone authenticated can read users" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Anyone authenticated can read users" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid())::text = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO authenticated USING ((SELECT auth.uid())::text = id) WITH CHECK ((SELECT auth.uid())::text = id);

DROP POLICY IF EXISTS "All users can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Trainers and Admins can create courses" ON public.courses;
DROP POLICY IF EXISTS "Trainers can update own courses" ON public.courses;
CREATE POLICY "All users can view published courses" ON public.courses FOR SELECT TO authenticated USING (status = 'published' OR public.is_trainer_or_admin());
CREATE POLICY "Trainers and Admins can create courses" ON public.courses FOR INSERT TO authenticated WITH CHECK (public.is_trainer_or_admin());
CREATE POLICY "Trainers can update own courses" ON public.courses FOR UPDATE TO authenticated USING ((SELECT auth.uid())::text = trainer_id OR public.is_admin()) WITH CHECK ((SELECT auth.uid())::text = trainer_id OR public.is_admin());

DROP POLICY IF EXISTS "View modules" ON public.course_modules;
DROP POLICY IF EXISTS "Manage modules" ON public.course_modules;
CREATE POLICY "View modules" ON public.course_modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage modules" ON public.course_modules FOR ALL TO authenticated USING (public.is_trainer_or_admin());

DROP POLICY IF EXISTS "View lessons" ON public.lessons;
DROP POLICY IF EXISTS "Manage lessons" ON public.lessons;
CREATE POLICY "View lessons" ON public.lessons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage lessons" ON public.lessons FOR ALL TO authenticated USING (public.is_trainer_or_admin());

DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can insert own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can update own enrollments" ON public.enrollments;
CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR SELECT TO authenticated USING ((SELECT auth.uid())::text = user_id OR public.is_trainer_or_admin());
CREATE POLICY "Users can insert own enrollments" ON public.enrollments FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid())::text = user_id);
CREATE POLICY "Users can update own enrollments" ON public.enrollments FOR UPDATE TO authenticated USING ((SELECT auth.uid())::text = user_id) WITH CHECK ((SELECT auth.uid())::text = user_id);

DROP POLICY IF EXISTS "All users can view live classes" ON public.live_classes;
DROP POLICY IF EXISTS "Trainers and Admins can manage live classes" ON public.live_classes;
CREATE POLICY "All users can view live classes" ON public.live_classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Trainers and Admins can manage live classes" ON public.live_classes FOR ALL TO authenticated USING (public.is_trainer_or_admin());

DROP POLICY IF EXISTS "Users can view own certificates" ON public.certificates;
DROP POLICY IF EXISTS "System or Admins can issue certificates" ON public.certificates;
CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT TO authenticated USING ((SELECT auth.uid())::text = user_id OR public.is_trainer_or_admin());
CREATE POLICY "System or Admins can issue certificates" ON public.certificates FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid())::text = user_id OR public.is_trainer_or_admin());

DROP POLICY IF EXISTS "All users can view discussions" ON public.discussions;
DROP POLICY IF EXISTS "Authenticated users can create discussions" ON public.discussions;
DROP POLICY IF EXISTS "All users can view replies" ON public.discussion_replies;
DROP POLICY IF EXISTS "Authenticated users can create replies" ON public.discussion_replies;
CREATE POLICY "All users can view discussions" ON public.discussions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create discussions" ON public.discussions FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid())::text = user_id);
CREATE POLICY "All users can view replies" ON public.discussion_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create replies" ON public.discussion_replies FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid())::text = user_id);

-- STAGE 3: AUTOMATIC GOOGLE OAUTH RBAC TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
    user_email TEXT;
    user_name TEXT;
    user_avatar TEXT;
    target_role TEXT;
    assigned_custom_id TEXT;
    raw_intent TEXT;
BEGIN
    user_email := LOWER(COALESCE(NEW.email, ''));
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(user_email, '@', 1));
    user_avatar := COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', 'https://ui-avatars.com/api/?name=' || user_name || '&background=0A2647&color=fff');
    raw_intent := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', ''));

    IF user_email = 'priyanshudhote3110@gmail.com' OR user_email LIKE '%admin@%' OR user_email = 'secretary@moes.gov.in' THEN
        target_role := 'admin';
        assigned_custom_id := 'ADM-' || UPPER(SUBSTRING(NEW.id::text, 1, 4));
    ELSIF user_email LIKE '%trainer@%' OR user_email LIKE '%faculty@%' OR user_email = 'anita.desai@imd.gov.in' THEN
        target_role := 'trainer';
        assigned_custom_id := 'TRN-' || UPPER(SUBSTRING(NEW.id::text, 1, 4));
    ELSIF raw_intent IN ('admin', 'trainer', 'employee') THEN
        target_role := raw_intent;
        assigned_custom_id := (CASE WHEN target_role = 'admin' THEN 'ADM-' WHEN target_role = 'trainer' THEN 'TRN-' ELSE 'EMP-' END) || UPPER(SUBSTRING(NEW.id::text, 1, 4));
    ELSE
        target_role := 'employee';
        assigned_custom_id := 'EMP-' || UPPER(SUBSTRING(NEW.id::text, 1, 4));
    END IF;

    INSERT INTO public.users (
        id, custom_role_id, name, email, phone, role,
        institute, designation, department, avatar_url,
        knowledge_points, learning_streak, is_verified, created_at, updated_at
    )
    VALUES (
        NEW.id::text, assigned_custom_id, user_name, user_email, NEW.phone, target_role,
        CASE WHEN target_role = 'admin' THEN 'HQ' ELSE 'IMD' END,
        CASE WHEN target_role = 'admin' THEN 'Executive Director' WHEN target_role = 'trainer' THEN 'Faculty Specialist' ELSE 'Scientist / Officer' END,
        CASE WHEN target_role = 'admin' THEN 'MoES Secretariat' ELSE 'Atmospheric & Radar Sciences' END,
        user_avatar,
        CASE WHEN target_role = 'admin' THEN 12000 WHEN target_role = 'trainer' THEN 7500 ELSE 1500 END,
        CASE WHEN target_role = 'admin' THEN 30 WHEN target_role = 'trainer' THEN 20 ELSE 12 END,
        TRUE, NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET avatar_url = EXCLUDED.avatar_url, updated_at = NOW();

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STAGE 4: MASTER INITIAL SEED DATA
INSERT INTO public.users (id, custom_role_id, name, email, phone, role, institute, designation, department, avatar_url, knowledge_points, learning_streak, is_verified)
VALUES 
  ('usr_admin_01', 'ADM-001', 'Dr. M. Ravichandran', 'secretary@moes.gov.in', '+91-9811001122', 'admin', 'HQ', 'Secretary & Director General', 'Ministry Executive Directorate', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 9500, 45, true),
  ('usr_trainer_01', 'TRN-001', 'Dr. Anita Desai', 'anita.desai@imd.gov.in', '+91-9822334455', 'trainer', 'IMD', 'Chief Radar Specialist & Head Faculty', 'Radar & Satellite Meteorology Division', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 6200, 28, true),
  ('usr_trainer_02', 'TRN-002', 'Dr. P. Balakrishnan', 'balakrishnan@incois.gov.in', '+91-9833445566', 'trainer', 'INCOIS', 'Principal Oceanographer', 'Ocean Observation & Tsunami Warning Centre', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 5800, 32, true),
  ('usr_employee_01', 'EMP-001', 'Dr. Rajesh Sharma', 'rajesh.sharma@imd.gov.in', '+91-9876543210', 'employee', 'IMD', 'Scientist ''D''', 'Monsoon Forecasting & Severe Weather Division', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 1450, 12, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.courses (id, course_code, title, description, category, institute, trainer_id, trainer_name, level, duration_minutes, thumbnail_url, is_mandatory, deadline, status, tags)
VALUES
(
  'crs_imd_01', 'MOES-IMD-401', 'Advanced Doppler Weather Radar (DWR) Calibration & Operational Nowcasting', 
  'Standard operating procedures for S-band and X-band polarimetric radars, hydrometeor classification, severe storm tracking, and automated nowcasting protocols.', 
  'Atmospheric & Radar Meteorology', 'IMD', 'usr_trainer_01', 'Dr. Anita Desai', 'Advanced', 240, 
  'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=80', true, '2026-11-30T23:59:59Z', 'published', 
  ARRAY['Radar', 'IMD', 'Nowcasting', 'Severe Weather', 'Doppler']
),
(
  'crs_incois_01', 'MOES-INC-302', 'Deep-Sea Argo Telemetry & Operational Tsunami Early Warning Synthesis', 
  'Real-time deep ocean acoustic sensors, BTH & Argo float profiling, bottom pressure recorders (BPR), and coastal tsunami propagation hazard modeling.', 
  'Ocean Science & Marine Services', 'INCOIS', 'usr_trainer_02', 'Dr. P. Balakrishnan', 'Intermediate', 300, 
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80', true, '2026-12-15T23:59:59Z', 'published', 
  ARRAY['Oceanography', 'INCOIS', 'Tsunami', 'Argo', 'Hydrodynamics']
),
(
  'crs_iitm_01', 'MOES-IITM-501', 'Coupled Climate System Dynamics & Extended Range Monsoon Ensemble Forecasts', 
  'Numerical weather prediction using CFSv2, coupled ocean-atmosphere dynamics, Madden-Julian Oscillation (MJO) diagnostics, and seasonal precipitation modeling.', 
  'Climate Science & Numerical Modeling', 'IITM', 'usr_trainer_01', 'Dr. Anita Desai', 'Advanced', 360, 
  'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&auto=format&fit=crop&q=80', false, '2027-01-31T23:59:59Z', 'published', 
  ARRAY['Climate', 'IITM', 'Monsoon', 'CFSv2', 'HPC']
),
(
  'crs_ncpor_01', 'MOES-NCPOR-204', 'Antarctic Polar Logistics, Glaciological Ice-Core Drilling & Cryosphere Science', 
  'Field safety protocols, cold-room logistics, sub-glacial ice core drilling instrumentation, and Southern Ocean biogeochemical cycles at Maitri and Bharati stations.', 
  'Polar & Cryospheric Studies', 'NCPOR', 'usr_trainer_02', 'Dr. P. Balakrishnan', 'Beginner', 180, 
  'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=600&auto=format&fit=crop&q=80', false, '2027-02-28T23:59:59Z', 'published', 
  ARRAY['Polar', 'NCPOR', 'Antarctica', 'Cryosphere', 'Glaciology']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.course_modules (id, course_id, title, module_order, description)
VALUES
  ('mod_imd_01', 'crs_imd_01', 'Module 1: Radar Hardware & Transceiver Calibration', 1, 'Transceiver alignment and transmitter verification routines.'),
  ('mod_imd_02', 'crs_imd_01', 'Module 2: Dual-Polarization Moments & Hydrometeor Analysis', 2, 'Polarimetric variables and hydrometeor signatures.'),
  ('mod_inc_01', 'crs_incois_01', 'Module 1: Deep Ocean Bottom Pressure Recorders', 1, 'Oceanic sensors and acoustic release systems.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lessons (id, module_id, title, lesson_order, type, duration, duration_minutes, video_url, summary)
VALUES
  ('les_imd_01', 'mod_imd_01', 'Lesson 1.1: Magnetron vs Klystron Power Output & Noise Calibration', 1, 'video', '24:10', 24, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'Operational overview of Doppler transmitter circuits.'),
  ('les_imd_02', 'mod_imd_01', 'Lesson 1.2: Antenna Pointing Verification via Sun-Tracking Routines', 2, 'video', '18:35', 18, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'Precise beam alignment using solar calibration flux.'),
  ('les_imd_03', 'mod_imd_02', 'Lesson 2.1: Differential Reflectivity (ZDR) & Correlation Coefficient (RhoHV)', 1, 'video', '31:40', 32, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'Detecting hail and tornado debris signatures.'),
  ('les_inc_01', 'mod_inc_01', 'Lesson 1.1: BPR Mooring Deployment & Acoustic Uplinks', 1, 'video', '28:15', 28, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'Deep sea telemetry mechanisms and surface buoys.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.quizzes (id, course_id, title, passing_score, time_limit_minutes, questions)
VALUES
(
  'qnz_imd_01', 'crs_imd_01', 'Doppler Weather Radar (DWR) Calibration Certification Examination', 75.00, 15,
  '[
    {
      "id": "q1",
      "question": "Which dual-polarization radar parameter is the primary discriminant between large tumbling hail and heavy rain?",
      "options": ["Radial Velocity (Vr)", "Differential Reflectivity (ZDR)", "Spectrum Width (SW)", "Total Power (dBZ)"],
      "correctIndex": 1,
      "topic": "Dual-Pol Physics",
      "explanation": "Tumbling hailstones appear spherical on average with ZDR near 0 dB despite very high reflectivity (Z > 55 dBZ)."
    },
    {
      "id": "q2",
      "question": "What is the maximum unambiguous range equation (Rmax) in pulse Doppler radars?",
      "options": ["c / (2 * PRF)", "c * PRF / 2", "2 * c / PRF", "c / PRF"],
      "correctIndex": 0,
      "topic": "Radar Geometry",
      "explanation": "Rmax = c / (2 * PRF), where c is the speed of light."
    }
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.live_classes (id, title, course_id, trainer_id, trainer_name, institute, scheduled_start, scheduled_end, stream_url, status, attendees_count)
VALUES
  ('live_cls_01', 'Live Doppler Radar Calibration & Nowcasting Workshop', 'crs_imd_01', 'usr_trainer_01', 'Dr. Anita Desai', 'IMD', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 2 hours', 'https://meet.google.com/lookup/moes-imd-live', 'upcoming', 42),
  ('live_cls_02', 'INCOIS Deep-Sea Argo Profiling Masterclass', 'crs_incois_01', 'usr_trainer_02', 'Dr. P. Balakrishnan', 'INCOIS', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 2 hours', 'https://meet.google.com/lookup/moes-incois-live', 'upcoming', 35)
ON CONFLICT (id) DO NOTHING;

SELECT 'Capacity Connect PostgreSQL Master Setup Successful!' AS status;

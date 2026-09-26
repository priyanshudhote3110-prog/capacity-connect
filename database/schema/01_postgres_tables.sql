-- ====================================================================
-- CAPACITY CONNECT (समर्थ-पृथ्वी) — POSTGRESQL TABLES DDL
-- Ministry of Earth Sciences (MoES), Govt. of India
-- File: 01_postgres_tables.sql
-- ====================================================================

-- 1. Users Table (Core Profile & RBAC Role)
CREATE TABLE IF NOT EXISTS public.users (
    id VARCHAR(36) PRIMARY KEY,
    custom_role_id VARCHAR(30) UNIQUE NOT NULL, -- ADM-001, TRN-001, EMP-001
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'trainer', 'employee')),
    institute VARCHAR(50) NOT NULL DEFAULT 'IMD', -- IMD, INCOIS, IITM, NCMRWF, NIOT, NCPOR, HQ
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

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id VARCHAR(50) PRIMARY KEY,
    course_code VARCHAR(30) UNIQUE NOT NULL, -- e.g. MOES-IMD-401
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    institute VARCHAR(50) NOT NULL,
    trainer_id VARCHAR(36) REFERENCES public.users(id) ON DELETE SET NULL,
    trainer_name VARCHAR(150),
    level VARCHAR(20) DEFAULT 'Intermediate', -- Beginner, Intermediate, Advanced
    duration_minutes INTEGER DEFAULT 0,
    thumbnail_url TEXT,
    is_mandatory BOOLEAN DEFAULT FALSE,
    deadline TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Course Modules Table
CREATE TABLE IF NOT EXISTS public.course_modules (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    module_order INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Lessons Table
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

-- 5. Enrollments Table
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

-- 6. Live Classes Table
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

-- 7. Quizzes Table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    passing_score NUMERIC(5,2) DEFAULT 75.00,
    time_limit_minutes INTEGER DEFAULT 15,
    questions JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Quiz Attempts Table
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

-- 9. Certificates Table
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

-- 10. Discussions & Forum Table
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

-- 11. Discussion Replies Table
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

-- Fast Indexes for Queries
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_courses_institute ON public.courses(institute);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_course_modules_course ON public.course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_live_classes_institute ON public.live_classes(institute);
CREATE INDEX IF NOT EXISTS idx_live_classes_status ON public.live_classes(status);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON public.certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_discussions_course ON public.discussions(course_id);

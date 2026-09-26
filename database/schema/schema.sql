-- ============================================================
-- CAPACITY CONNECT (समर्थ-पृथ्वी) — RELATIONAL DATABASE SCHEMA
-- Target DBMS: PostgreSQL / CockroachDB / MySQL (Compatible)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    custom_role_id VARCHAR(20) UNIQUE NOT NULL, -- ADM-001, TRN-001, EMP-001
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'trainer', 'employee')),
    institute VARCHAR(50) NOT NULL, -- IMD, INCOIS, IITM, NCMRWF, NIOT, NCPOR, HQ
    designation VARCHAR(100),
    department VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    knowledge_points INTEGER DEFAULT 0,
    learning_streak INTEGER DEFAULT 1,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(36) PRIMARY KEY,
    course_code VARCHAR(30) UNIQUE NOT NULL, -- e.g. MOES-IMD-401
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    institute VARCHAR(50) NOT NULL,
    trainer_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    level VARCHAR(20) DEFAULT 'Intermediate', -- Beginner, Intermediate, Advanced
    duration_minutes INTEGER DEFAULT 0,
    thumbnail_url TEXT,
    is_mandatory BOOLEAN DEFAULT FALSE,
    deadline TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'published', -- draft, published, archived
    tags TEXT[], -- array of tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS course_modules (
    id VARCHAR(36) PRIMARY KEY,
    course_id VARCHAR(36) REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    module_order INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR(36) PRIMARY KEY,
    module_id VARCHAR(36) REFERENCES course_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    lesson_order INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('video', 'pdf', 'quiz', 'checklist')),
    content_url TEXT,
    duration_minutes INTEGER DEFAULT 0,
    summary TEXT,
    resources JSONB, -- downloadable attachments [{ name, url, size }]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enrollments (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(36) REFERENCES courses(id) ON DELETE CASCADE,
    progress_percentage NUMERIC(5,2) DEFAULT 0.00,
    completed_lessons JSONB DEFAULT '[]'::jsonb, -- array of lesson IDs
    status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in-progress', 'completed')),
    last_accessed_lesson_id VARCHAR(36),
    certificate_id VARCHAR(100),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS live_classes (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    course_id VARCHAR(36) REFERENCES courses(id) ON DELETE SET NULL,
    trainer_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    institute VARCHAR(50) NOT NULL,
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    stream_url TEXT,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
    attendees_count INTEGER DEFAULT 0,
    recording_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS live_attendance (
    id VARCHAR(36) PRIMARY KEY,
    live_class_id VARCHAR(36) REFERENCES live_classes(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    duration_minutes INTEGER DEFAULT 0,
    UNIQUE(live_class_id, user_id)
);

CREATE TABLE IF NOT EXISTS quizzes (
    id VARCHAR(36) PRIMARY KEY,
    course_id VARCHAR(36) REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    passing_score NUMERIC(5,2) DEFAULT 75.00,
    time_limit_minutes INTEGER DEFAULT 20,
    questions JSONB NOT NULL, -- [{ id, question, options: [], correct_index, explanation, topic }]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id VARCHAR(36) PRIMARY KEY,
    quiz_id VARCHAR(36) REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    answers_submitted JSONB,
    topic_breakdown JSONB,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certificates (
    id VARCHAR(36) PRIMARY KEY,
    certificate_number VARCHAR(100) UNIQUE NOT NULL, -- MOES-CC-2026-IMD-89412
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(150) NOT NULL,
    course_id VARCHAR(36) REFERENCES courses(id) ON DELETE SET NULL,
    course_title VARCHAR(255) NOT NULL,
    institute VARCHAR(50) NOT NULL,
    score NUMERIC(5,2) NOT NULL,
    issued_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verification_url TEXT NOT NULL,
    digital_signature_hash VARCHAR(64) NOT NULL, -- SHA-256
    signatory_title VARCHAR(150) DEFAULT 'Secretary, Ministry of Earth Sciences, Govt. of India'
);

CREATE TABLE IF NOT EXISTS discussions (
    id VARCHAR(36) PRIMARY KEY,
    course_id VARCHAR(36) REFERENCES courses(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS discussion_replies (
    id VARCHAR(36) PRIMARY KEY,
    discussion_id VARCHAR(36) REFERENCES discussions(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_trainer_solution BOOLEAN DEFAULT FALSE,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'announcement', -- mandatory_alert, live_class, quiz_result, cert_issued
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for rapid querying & high throughput
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_institute ON users(institute);
CREATE INDEX IF NOT EXISTS idx_courses_institute ON courses(institute);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON certificates(certificate_number);

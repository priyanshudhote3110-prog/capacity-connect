-- ====================================================================
-- CAPACITY CONNECT (समर्थ-पृथ्वी) — PBAC AUTHORIZATION & SECURITY DDL
-- Ministry of Earth Sciences (MoES), Govt. of India
-- File: 05_pbac_authorization.sql
-- Description: Policy-Based Access Control (PBAC), RLS Policies,
--              Audit Logging, Permission Matrix & Auto-Role Trigger
--
-- RUN IN SUPABASE SQL EDITOR:
-- 1. Open: https://supabase.com/dashboard/project/prmbjchjpetkuoirbwvt/sql
-- 2. Click "+ New query", paste this file and click "Run" (Ctrl+Enter)
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. EXTENSIONS
-- --------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------
-- 2. USERS TABLE (Structured for Supabase Auth Integration)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id VARCHAR(36) PRIMARY KEY,                       -- Stores UUID or auth.users(id)
    custom_role_id VARCHAR(30) UNIQUE NOT NULL,      -- ADM-001, TRN-001, EMP-001
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),                       -- For official email/password accounts
    role VARCHAR(20) NOT NULL DEFAULT 'employee' 
        CHECK (role IN ('admin', 'trainer', 'employee')),
    institute VARCHAR(50) NOT NULL DEFAULT 'IMD',    -- HQ, IMD, INCOIS, IITM, NCMRWF, NIOT, NCPOR
    designation VARCHAR(100) DEFAULT 'Scientific Officer',
    department VARCHAR(100) DEFAULT 'Earth Sciences Research',
    avatar_url TEXT,
    bio TEXT,
    knowledge_points INTEGER DEFAULT 0,
    learning_streak INTEGER DEFAULT 1,
    is_verified BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,                   -- Soft delete / Account deactivation
    last_login_at TIMESTAMPTZ,                        -- Last session tracking
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Migration Guard: Add columns if table already existed prior to PBAC
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_active') THEN
            ALTER TABLE public.users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        END IF;
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'last_login_at') THEN
            ALTER TABLE public.users ADD COLUMN last_login_at TIMESTAMPTZ;
        END IF;
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'department') THEN
            ALTER TABLE public.users ADD COLUMN department VARCHAR(100) DEFAULT 'Earth Sciences Research';
        END IF;
    END IF;
END $$;

-- Performance & Security Indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_institute ON public.users(institute);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_custom_role_id ON public.users(custom_role_id);

-- --------------------------------------------------------------------
-- 3. ROLE PERMISSIONS TABLE (PBAC Policy Rules Matrix)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'trainer', 'employee')),
    resource VARCHAR(50) NOT NULL,         -- 'courses', 'live_classes', 'users', 'analytics', 'audit_log', 'certificates'
    action VARCHAR(20) NOT NULL,           -- 'create', 'read', 'update', 'delete', 'manage'
    is_allowed BOOLEAN DEFAULT FALSE,
    conditions JSONB DEFAULT '{}'::jsonb,  -- Conditions: {"scope": "own"}, {"scope": "institute"}
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, resource, action)
);

CREATE INDEX IF NOT EXISTS idx_permissions_role ON public.role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON public.role_permissions(resource);

-- --------------------------------------------------------------------
-- 4. SECURITY AUDIT LOG TABLE (Tamper-Resistant Security Trail)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) REFERENCES public.users(id) ON DELETE SET NULL,
    user_email VARCHAR(150),
    user_role VARCHAR(20),
    action VARCHAR(100) NOT NULL,           -- 'auth.login.success', 'auth.login.failed', 'role.changed', 'course.created'
    resource_type VARCHAR(50),              -- 'user', 'course', 'live_class', 'permission'
    resource_id VARCHAR(100),
    details JSONB DEFAULT '{}'::jsonb,      -- JSON metadata payload
    ip_address INET,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_severity ON public.audit_log(severity);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_log(created_at);

-- --------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------

-- A) Enable RLS on core tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- If courses & enrollments exist, enable RLS
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
        ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'enrollments') THEN
        ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- B) Clean existing policies on public.users
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_select_admin" ON public.users;
DROP POLICY IF EXISTS "users_select_trainer_institute" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_update_admin" ON public.users;
DROP POLICY IF EXISTS "users_delete_admin" ON public.users;
DROP POLICY IF EXISTS "users_insert_service" ON public.users;

-- POLICY 1: Authenticated user can read their own profile
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT TO authenticated
    USING ( (SELECT auth.uid())::text = id::text );

-- POLICY 2: Admins can read ALL users across the ministry
CREATE POLICY "users_select_admin" ON public.users
    FOR SELECT TO authenticated
    USING ( (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin' );

-- POLICY 3: Trainers can read employee profiles within the same institute
CREATE POLICY "users_select_trainer_institute" ON public.users
    FOR SELECT TO authenticated
    USING (
        (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'trainer'
        AND role = 'employee'
    );

-- POLICY 4: Users can update their own personal profile fields
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE TO authenticated
    USING ( (SELECT auth.uid())::text = id::text )
    WITH CHECK ( (SELECT auth.uid())::text = id::text );

-- POLICY 5: Only Admins can modify any user, role, or access status
CREATE POLICY "users_update_admin" ON public.users
    FOR UPDATE TO authenticated
    USING ( (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin' )
    WITH CHECK ( (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin' );

-- POLICY 6: Only Admins can delete users
CREATE POLICY "users_delete_admin" ON public.users
    FOR DELETE TO authenticated
    USING ( (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin' );

-- POLICY 7: Insert profile during signup (or via service role)
CREATE POLICY "users_insert_service" ON public.users
    FOR INSERT TO authenticated
    WITH CHECK ( (SELECT auth.uid())::text = id::text );

-- C) Policies for role_permissions
DROP POLICY IF EXISTS "permissions_select_all" ON public.role_permissions;
DROP POLICY IF EXISTS "permissions_modify_admin" ON public.role_permissions;

CREATE POLICY "permissions_select_all" ON public.role_permissions
    FOR SELECT TO authenticated
    USING ( true );

CREATE POLICY "permissions_modify_admin" ON public.role_permissions
    FOR ALL TO authenticated
    USING ( (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin' )
    WITH CHECK ( (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin' );

-- D) Policies for audit_log
DROP POLICY IF EXISTS "audit_select_admin" ON public.audit_log;
DROP POLICY IF EXISTS "audit_insert_all" ON public.audit_log;

CREATE POLICY "audit_select_admin" ON public.audit_log
    FOR SELECT TO authenticated
    USING ( (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin' );

CREATE POLICY "audit_insert_all" ON public.audit_log
    FOR INSERT TO authenticated
    WITH CHECK ( (SELECT auth.uid())::text = user_id::text );

-- --------------------------------------------------------------------
-- 6. DB TRIGGER: AUTOMATIC SYNC & AUTHORITATIVE ROLE RESOLUTION
-- --------------------------------------------------------------------
-- Secure trigger function: runs with SECURITY DEFINER and search_path = ''
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    user_role TEXT := 'employee';
    admin_emails TEXT[] := ARRAY[
        'secretary@moes.gov.in',
        'priyanshudhote3110@gmail.com',
        'director@imd.gov.in',
        'admin@capacityconnect.gov.in',
        'director@incois.gov.in'
    ];
    trainer_emails TEXT[] := ARRAY[
        'anita.desai@imd.gov.in',
        'balakrishnan@incois.gov.in',
        'ravi.kumar@iitm.gov.in',
        'meena.sharma@ncmrwf.gov.in',
        'suresh.nair@niot.gov.in',
        'kavita.patel@ncpor.gov.in',
        'faculty@imd.gov.in',
        'trainer@capacityconnect.gov.in',
        'arun.verma@imd.gov.in',
        'priya.singh@incois.gov.in'
    ];
    role_prefix TEXT;
    custom_id TEXT;
    user_count INT;
    user_inst TEXT := 'IMD';
    user_desig TEXT := 'Scientific Officer';
BEGIN
    -- Authoritative role check against strict official email lists
    IF LOWER(TRIM(NEW.email)) = ANY(admin_emails) THEN
        user_role := 'admin';
        user_inst := 'HQ';
        user_desig := 'Executive Director / Super Admin';
    ELSIF LOWER(TRIM(NEW.email)) = ANY(trainer_emails) THEN
        user_role := 'trainer';
        user_desig := 'Faculty Specialist / Trainer';
        -- Institute inference
        IF NEW.email ILIKE '%@incois.gov.in%' THEN user_inst := 'INCOIS';
        ELSIF NEW.email ILIKE '%@iitm.gov.in%' THEN user_inst := 'IITM';
        ELSIF NEW.email ILIKE '%@ncmrwf.gov.in%' THEN user_inst := 'NCMRWF';
        ELSIF NEW.email ILIKE '%@niot.gov.in%' THEN user_inst := 'NIOT';
        ELSIF NEW.email ILIKE '%@ncpor.gov.in%' THEN user_inst := 'NCPOR';
        ELSIF NEW.email ILIKE '%capacityconnect%' THEN user_inst := 'HQ';
        ELSE user_inst := 'IMD';
        END IF;
    ELSE
        user_role := 'employee';
        user_desig := 'Scientific Officer / MoES Official';
        user_inst := 'IMD';
    END IF;

    -- Generate sequential Custom Role ID
    role_prefix := CASE user_role
        WHEN 'admin' THEN 'ADM'
        WHEN 'trainer' THEN 'TRN'
        ELSE 'EMP'
    END;

    SELECT COUNT(*) + 1 INTO user_count
    FROM public.users WHERE role = user_role;

    custom_id := role_prefix || '-' || LPAD(user_count::TEXT, 3, '0');

    -- Insert profile into public.users
    INSERT INTO public.users (
        id,
        custom_role_id,
        name,
        email,
        role,
        institute,
        designation,
        avatar_url,
        is_verified,
        is_active
    ) VALUES (
        NEW.id::text,
        custom_id,
        COALESCE(
            NEW.raw_user_meta_data ->> 'full_name',
            NEW.raw_user_meta_data ->> 'name',
            split_part(NEW.email, '@', 1)
        ),
        LOWER(TRIM(NEW.email)),
        user_role,
        user_inst,
        user_desig,
        COALESCE(
            NEW.raw_user_meta_data ->> 'avatar_url',
            NEW.raw_user_meta_data ->> 'picture',
            'https://ui-avatars.com/api/?name=' || encode(convert_to(COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'), 'UTF8'), 'base64') || '&background=0A2647&color=fff'
        ),
        TRUE,
        TRUE
    )
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        updated_at = CURRENT_TIMESTAMP;

    -- Enforce role securely in auth.users app_metadata (Unforgeable by client)
    UPDATE auth.users
    SET raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', user_role, 'custom_role_id', custom_id, 'institute', user_inst)
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$;

-- Connect trigger to Supabase auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------------------
-- 7. SEED DATA: PBAC PERMISSIONS MATRIX
-- --------------------------------------------------------------------
INSERT INTO public.role_permissions (role, resource, action, is_allowed, conditions) VALUES
-- Admin Permissions (Full Access)
('admin', 'users', 'create', true, '{}'::jsonb),
('admin', 'users', 'read', true, '{}'::jsonb),
('admin', 'users', 'update', true, '{}'::jsonb),
('admin', 'users', 'delete', true, '{}'::jsonb),
('admin', 'courses', 'create', true, '{}'::jsonb),
('admin', 'courses', 'read', true, '{}'::jsonb),
('admin', 'courses', 'update', true, '{}'::jsonb),
('admin', 'courses', 'delete', true, '{}'::jsonb),
('admin', 'live_classes', 'create', true, '{}'::jsonb),
('admin', 'live_classes', 'read', true, '{}'::jsonb),
('admin', 'live_classes', 'update', true, '{}'::jsonb),
('admin', 'live_classes', 'delete', true, '{}'::jsonb),
('admin', 'enrollments', 'create', true, '{}'::jsonb),
('admin', 'enrollments', 'read', true, '{}'::jsonb),
('admin', 'enrollments', 'update', true, '{}'::jsonb),
('admin', 'enrollments', 'delete', true, '{}'::jsonb),
('admin', 'quizzes', 'create', true, '{}'::jsonb),
('admin', 'quizzes', 'read', true, '{}'::jsonb),
('admin', 'quizzes', 'update', true, '{}'::jsonb),
('admin', 'quizzes', 'delete', true, '{}'::jsonb),
('admin', 'certificates', 'issue', true, '{}'::jsonb),
('admin', 'certificates', 'read', true, '{}'::jsonb),
('admin', 'analytics', 'read', true, '{}'::jsonb),
('admin', 'audit_log', 'read', true, '{}'::jsonb),
('admin', 'admin_panel', 'access', true, '{}'::jsonb),

-- Trainer Permissions (Restricted to Courses/Classes & Own Institute)
('trainer', 'courses', 'create', true, '{}'::jsonb),
('trainer', 'courses', 'read', true, '{}'::jsonb),
('trainer', 'courses', 'update', true, '{"scope": "own"}'::jsonb),
('trainer', 'courses', 'delete', false, '{}'::jsonb),
('trainer', 'live_classes', 'create', true, '{}'::jsonb),
('trainer', 'live_classes', 'read', true, '{}'::jsonb),
('trainer', 'live_classes', 'update', true, '{"scope": "own"}'::jsonb),
('trainer', 'live_classes', 'delete', false, '{}'::jsonb),
('trainer', 'enrollments', 'read', true, '{"scope": "institute"}'::jsonb),
('trainer', 'quizzes', 'create', true, '{}'::jsonb),
('trainer', 'quizzes', 'read', true, '{}'::jsonb),
('trainer', 'certificates', 'issue', true, '{}'::jsonb),
('trainer', 'certificates', 'read', true, '{}'::jsonb),
('trainer', 'users', 'read', true, '{"scope": "institute_employees"}'::jsonb),
('trainer', 'admin_panel', 'access', false, '{}'::jsonb),

-- Employee Permissions (Self Service Only)
('employee', 'courses', 'read', true, '{"filter": "published"}'::jsonb),
('employee', 'courses', 'create', false, '{}'::jsonb),
('employee', 'live_classes', 'read', true, '{}'::jsonb),
('employee', 'live_classes', 'create', false, '{}'::jsonb),
('employee', 'enrollments', 'create', true, '{"scope": "self"}'::jsonb),
('employee', 'enrollments', 'read', true, '{"scope": "self"}'::jsonb),
('employee', 'enrollments', 'update', true, '{"scope": "self"}'::jsonb),
('employee', 'quizzes', 'read', true, '{}'::jsonb),
('employee', 'certificates', 'read', true, '{"scope": "self"}'::jsonb),
('employee', 'users', 'read', true, '{"scope": "self"}'::jsonb),
('employee', 'admin_panel', 'access', false, '{}'::jsonb)
ON CONFLICT (role, resource, action) DO UPDATE SET
    is_allowed = EXCLUDED.is_allowed,
    conditions = EXCLUDED.conditions;

-- --------------------------------------------------------------------
-- 8. PREDEFINED 5 ADMINS & 10 TRAINERS PROFILE INITIALIZATION
-- --------------------------------------------------------------------
INSERT INTO public.users (
    id, custom_role_id, name, email, role, institute, designation, department, is_verified, is_active
) VALUES
-- 5 Official Admins
('a0000000-0000-0000-0000-000000000001', 'ADM-001', 'Dr. M. Ravichandran', 'secretary@moes.gov.in', 'admin', 'HQ', 'Secretary, MoES', 'Executive Council', true, true),
('a0000000-0000-0000-0000-000000000002', 'ADM-002', 'Priyanshu Dhote', 'priyanshudhote3110@gmail.com', 'admin', 'HQ', 'Project Lead & Super Admin', 'Digital Transformation Division', true, true),
('a0000000-0000-0000-0000-000000000003', 'ADM-003', 'Director IMD', 'director@imd.gov.in', 'admin', 'IMD', 'Director General of Meteorology', 'Directorate', true, true),
('a0000000-0000-0000-0000-000000000004', 'ADM-004', 'Admin CC', 'admin@capacityconnect.gov.in', 'admin', 'HQ', 'Platform System Administrator', 'MoES Knowledge Systems', true, true),
('a0000000-0000-0000-0000-000000000005', 'ADM-005', 'Director INCOIS', 'director@incois.gov.in', 'admin', 'INCOIS', 'Director, INCOIS', 'Executive Directorate', true, true),

-- 10 Official Trainers
('b0000000-0000-0000-0000-000000000001', 'TRN-001', 'Dr. Anita Desai', 'anita.desai@imd.gov.in', 'trainer', 'IMD', 'Chief Radar Specialist & Faculty Head', 'Radar & Satellite Meteorology', true, true),
('b0000000-0000-0000-0000-000000000002', 'TRN-002', 'Dr. P. Balakrishnan', 'balakrishnan@incois.gov.in', 'trainer', 'INCOIS', 'Ocean Dynamics & Early Warning Specialist', 'Ocean Information Services', true, true),
('b0000000-0000-0000-0000-000000000003', 'TRN-003', 'Dr. Ravi Kumar', 'ravi.kumar@iitm.gov.in', 'trainer', 'IITM', 'Climate Modeling Faculty Lead', 'Monsoon Mission & Dynamics', true, true),
('b0000000-0000-0000-0000-000000000004', 'TRN-004', 'Dr. Meena Sharma', 'meena.sharma@ncmrwf.gov.in', 'trainer', 'NCMRWF', 'NWP High Performance Computing Instructor', 'Numerical Weather Prediction', true, true),
('b0000000-0000-0000-0000-000000000005', 'TRN-005', 'Dr. Suresh Nair', 'suresh.nair@niot.gov.in', 'trainer', 'NIOT', 'Deep Ocean Technology Lead Trainer', 'Ocean Energy & Deep Sea Mining', true, true),
('b0000000-0000-0000-0000-000000000006', 'TRN-006', 'Dr. Kavita Patel', 'kavita.patel@ncpor.gov.in', 'trainer', 'NCPOR', 'Polar Sciences & Glaciology Faculty', 'Antarctic & Arctic Research', true, true),
('b0000000-0000-0000-0000-000000000007', 'TRN-007', 'Faculty CC', 'faculty@imd.gov.in', 'trainer', 'IMD', 'Senior Meteorological Training Officer', 'Training Division', true, true),
('b0000000-0000-0000-0000-000000000008', 'TRN-008', 'Trainer CC', 'trainer@capacityconnect.gov.in', 'trainer', 'HQ', 'MoES Master Capacity Instructor', 'Human Resource Development', true, true),
('b0000000-0000-0000-0000-000000000009', 'TRN-009', 'Dr. Arun Verma', 'arun.verma@imd.gov.in', 'trainer', 'IMD', 'Aviation & Marine Forecasting Instructor', 'Aviation Meteorological Division', true, true),
('b0000000-0000-0000-0000-000000000010', 'TRN-010', 'Dr. Priya Singh', 'priya.singh@incois.gov.in', 'trainer', 'INCOIS', 'Coastal Oceanography Lead Instructor', 'Marine Observation Network', true, true)
ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    designation = EXCLUDED.designation;

-- ====================================================================
-- End of 05_pbac_authorization.sql
-- ====================================================================

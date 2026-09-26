-- ====================================================================
-- CAPACITY CONNECT (समर्थ-पृथ्वी) — SUPABASE RBAC & GOOGLE AUTH SETUP
-- Ministry of Earth Sciences (MoES), Govt. of India
-- Run this script in: Supabase Dashboard -> SQL Editor -> New Query
-- ====================================================================

-- 1. Create or Update public.users table
CREATE TABLE IF NOT EXISTS public.users (
    id VARCHAR(36) PRIMARY KEY,
    custom_role_id VARCHAR(30) UNIQUE NOT NULL, -- e.g. ADM-001, TRN-XXXX, EMP-XXXX
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for rapid querying
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_institute ON public.users(institute);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies (Postgres Best Practices)
-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.users;

-- Policy A: All logged-in users can read profiles (needed for leaderboards, course instructors, profiles)
CREATE POLICY "Authenticated users can view profiles"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- Policy B: User can insert their own profile matching auth.uid()
CREATE POLICY "Users can insert own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid())::text = id);

-- Policy C: Users can update only their own profile
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING ((select auth.uid())::text = id)
WITH CHECK ((select auth.uid())::text = id);

-- Policy D: Admins can update/manage all users
CREATE POLICY "Admins can manage all profiles"
ON public.users
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = (select auth.uid())::text AND role = 'admin'
    )
);

-- 4. PostgreSQL Trigger Function: Automatically process Google Sign-In & Assign Role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    user_email TEXT;
    user_name TEXT;
    user_avatar TEXT;
    target_role TEXT;
    assigned_custom_id TEXT;
    assigned_institute TEXT;
    assigned_designation TEXT;
    assigned_department TEXT;
    raw_intent TEXT;
BEGIN
    user_email := LOWER(COALESCE(NEW.email, ''));
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        SPLIT_PART(user_email, '@', 1)
    );
    user_avatar := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
        'https://ui-avatars.com/api/?name=' || user_name || '&background=0A2647&color=fff'
    );
    raw_intent := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', ''));

    -- Determine Role Based on Email & Intent
    IF user_email = 'priyanshudhote3110@gmail.com' 
       OR user_email LIKE '%admin@%' 
       OR user_email = 'secretary@moes.gov.in' 
       OR user_email = 'director@imd.gov.in' THEN
        target_role := 'admin';
        assigned_custom_id := 'ADM-' || UPPER(SUBSTRING(NEW.id::text, 1, 4));
        assigned_institute := 'HQ';
        assigned_designation := 'Executive Director';
        assigned_department := 'MoES Secretariat';
    ELSIF user_email LIKE '%trainer@%' 
       OR user_email LIKE '%faculty@%' 
       OR user_email = 'anita.desai@imd.gov.in' THEN
        target_role := 'trainer';
        assigned_custom_id := 'TRN-' || UPPER(SUBSTRING(NEW.id::text, 1, 4));
        assigned_institute := 'IMD';
        assigned_designation := 'Faculty Specialist';
        assigned_department := 'Faculty Studio & Atmospheric Sciences';
    ELSIF raw_intent IN ('admin', 'trainer', 'employee') THEN
        target_role := raw_intent;
        IF target_role = 'admin' THEN
            assigned_custom_id := 'ADM-' || UPPER(SUBSTRING(NEW.id::text, 1, 4));
            assigned_institute := 'HQ';
            assigned_designation := 'Executive Director';
            assigned_department := 'MoES Secretariat';
        ELSIF target_role = 'trainer' THEN
            assigned_custom_id := 'TRN-' || UPPER(SUBSTRING(NEW.id::text, 1, 4));
            assigned_institute := 'IMD';
            assigned_designation := 'Faculty Specialist';
            assigned_department := 'Radar Meteorology Division';
        ELSE
            assigned_custom_id := 'EMP-' || UPPER(SUBSTRING(NEW.id::text, 1, 4));
            assigned_institute := 'IMD';
            assigned_designation := 'Scientist / Officer';
            assigned_department := 'Atmospheric & Radar Sciences';
        END IF;
    ELSE
        target_role := 'employee';
        assigned_custom_id := 'EMP-' || UPPER(SUBSTRING(NEW.id::text, 1, 4));
        assigned_institute := 'IMD';
        assigned_designation := 'Scientist / Officer';
        assigned_department := 'Atmospheric & Radar Sciences';
    END IF;

    -- Insert or Update public.users
    INSERT INTO public.users (
        id,
        custom_role_id,
        name,
        email,
        phone,
        role,
        institute,
        designation,
        department,
        avatar_url,
        knowledge_points,
        learning_streak,
        is_verified,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id::text,
        assigned_custom_id,
        user_name,
        user_email,
        NEW.phone,
        target_role,
        assigned_institute,
        assigned_designation,
        assigned_department,
        user_avatar,
        CASE WHEN target_role = 'admin' THEN 12000 WHEN target_role = 'trainer' THEN 7500 ELSE 1500 END,
        CASE WHEN target_role = 'admin' THEN 30 WHEN target_role = 'trainer' THEN 20 ELSE 12 END,
        TRUE,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW();

    RETURN NEW;
END;
$$;

-- 5. Attach Trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Verification Confirmation
SELECT 'Capacity Connect RBAC & Trigger Setup Completed Successfully!' as status;

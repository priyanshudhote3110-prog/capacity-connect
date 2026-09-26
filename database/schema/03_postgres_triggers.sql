-- ====================================================================
-- CAPACITY CONNECT (समर्थ-पृथ्वी) — POSTGRESQL TRIGGERS & AUTOMATION
-- Ministry of Earth Sciences (MoES), Govt. of India
-- File: 03_postgres_triggers.sql
-- ====================================================================

-- 1. Automatic Timestamp Updater Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_courses_updated_at ON public.courses;
CREATE TRIGGER trg_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Master Google OAuth & New User Trigger on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
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

    -- Determine Role & Assignment
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

    -- Upsert row into public.users
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

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

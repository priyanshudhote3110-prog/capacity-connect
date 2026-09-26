-- ====================================================================
-- CAPACITY CONNECT (समर्थ-पृथ्वी) — MASTER POSTGRESQL SEED DATA
-- Ministry of Earth Sciences (MoES), Govt. of India
-- File: 04_postgres_seed_data.sql
-- ====================================================================

-- 1. Initial Master Personas
INSERT INTO public.users (id, custom_role_id, name, email, phone, role, institute, designation, department, avatar_url, knowledge_points, learning_streak, is_verified)
VALUES 
  ('usr_admin_01', 'ADM-001', 'Dr. M. Ravichandran', 'secretary@moes.gov.in', '+91-9811001122', 'admin', 'HQ', 'Secretary & Director General', 'Ministry Executive Directorate', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 9500, 45, true),
  ('usr_trainer_01', 'TRN-001', 'Dr. Anita Desai', 'anita.desai@imd.gov.in', '+91-9822334455', 'trainer', 'IMD', 'Chief Radar Specialist & Head Faculty', 'Radar & Satellite Meteorology Division', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 6200, 28, true),
  ('usr_trainer_02', 'TRN-002', 'Dr. P. Balakrishnan', 'balakrishnan@incois.gov.in', '+91-9833445566', 'trainer', 'INCOIS', 'Principal Oceanographer', 'Ocean Observation & Tsunami Warning Centre', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 5800, 32, true),
  ('usr_employee_01', 'EMP-001', 'Dr. Rajesh Sharma', 'rajesh.sharma@imd.gov.in', '+91-9876543210', 'employee', 'IMD', 'Scientist ''D''', 'Monsoon Forecasting & Severe Weather Division', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 1450, 12, true)
ON CONFLICT (id) DO NOTHING;

-- 2. Master MoES Courses
INSERT INTO public.courses (id, course_code, title, description, category, institute, trainer_id, trainer_name, level, duration_minutes, thumbnail_url, is_mandatory, deadline, status, tags)
VALUES
(
  'crs_imd_01', 
  'MOES-IMD-401', 
  'Advanced Doppler Weather Radar (DWR) Calibration & Operational Nowcasting', 
  'Standard operating procedures for S-band and X-band polarimetric radars, hydrometeor classification, severe storm tracking, and automated nowcasting protocols.', 
  'Atmospheric & Radar Meteorology', 
  'IMD', 
  'usr_trainer_01', 
  'Dr. Anita Desai', 
  'Advanced', 
  240, 
  'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=80', 
  true, 
  '2026-11-30T23:59:59Z', 
  'published', 
  ARRAY['Radar', 'IMD', 'Nowcasting', 'Severe Weather', 'Doppler']
),
(
  'crs_incois_01', 
  'MOES-INC-302', 
  'Deep-Sea Argo Telemetry & Operational Tsunami Early Warning Synthesis', 
  'Real-time deep ocean acoustic sensors, BTH & Argo float profiling, bottom pressure recorders (BPR), and coastal tsunami propagation hazard modeling.', 
  'Ocean Science & Marine Services', 
  'INCOIS', 
  'usr_trainer_02', 
  'Dr. P. Balakrishnan', 
  'Intermediate', 
  300, 
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80', 
  true, 
  '2026-12-15T23:59:59Z', 
  'published', 
  ARRAY['Oceanography', 'INCOIS', 'Tsunami', 'Argo', 'Hydrodynamics']
),
(
  'crs_iitm_01', 
  'MOES-IITM-501', 
  'Coupled Climate System Dynamics & Extended Range Monsoon Ensemble Forecasts', 
  'Numerical weather prediction using CFSv2, coupled ocean-atmosphere dynamics, Madden-Julian Oscillation (MJO) diagnostics, and seasonal precipitation modeling.', 
  'Climate Science & Numerical Modeling', 
  'IITM', 
  'usr_trainer_01', 
  'Dr. Anita Desai', 
  'Advanced', 
  360, 
  'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&auto=format&fit=crop&q=80', 
  false, 
  '2027-01-31T23:59:59Z', 
  'published', 
  ARRAY['Climate', 'IITM', 'Monsoon', 'CFSv2', 'HPC']
),
(
  'crs_ncpor_01', 
  'MOES-NCPOR-204', 
  'Antarctic Polar Logistics, Glaciological Ice-Core Drilling & Cryosphere Science', 
  'Field safety protocols, cold-room logistics, sub-glacial ice core drilling instrumentation, and Southern Ocean biogeochemical cycles at Maitri and Bharati stations.', 
  'Polar & Cryospheric Studies', 
  'NCPOR', 
  'usr_trainer_02', 
  'Dr. P. Balakrishnan', 
  'Beginner', 
  180, 
  'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=600&auto=format&fit=crop&q=80', 
  false, 
  '2027-02-28T23:59:59Z', 
  'published', 
  ARRAY['Polar', 'NCPOR', 'Antarctica', 'Cryosphere', 'Glaciology']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Course Modules
INSERT INTO public.course_modules (id, course_id, title, module_order, description)
VALUES
  ('mod_imd_01', 'crs_imd_01', 'Module 1: Radar Hardware & Transceiver Calibration', 1, 'Transceiver alignment and transmitter verification routines.'),
  ('mod_imd_02', 'crs_imd_01', 'Module 2: Dual-Polarization Moments & Hydrometeor Analysis', 2, 'Polarimetric variables and hydrometeor signatures.'),
  ('mod_inc_01', 'crs_incois_01', 'Module 1: Deep Ocean Bottom Pressure Recorders', 1, 'Oceanic sensors and acoustic release systems.'),
  ('mod_inc_02', 'crs_incois_01', 'Module 2: Real-time Inundation Mapping', 2, 'Coastal propagation and warning broadcast.')
ON CONFLICT (id) DO NOTHING;

-- 4. Lessons
INSERT INTO public.lessons (id, module_id, title, lesson_order, type, duration, duration_minutes, video_url, summary)
VALUES
  ('les_imd_01', 'mod_imd_01', 'Lesson 1.1: Magnetron vs Klystron Power Output & Noise Calibration', 1, 'video', '24:10', 24, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'Operational overview of Doppler transmitter circuits.'),
  ('les_imd_02', 'mod_imd_01', 'Lesson 1.2: Antenna Pointing Verification via Sun-Tracking Routines', 2, 'video', '18:35', 18, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'Precise beam alignment using solar calibration flux.'),
  ('les_imd_03', 'mod_imd_02', 'Lesson 2.1: Differential Reflectivity (ZDR) & Correlation Coefficient (RhoHV)', 1, 'video', '31:40', 32, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'Detecting hail and tornado debris signatures.'),
  ('les_inc_01', 'mod_inc_01', 'Lesson 1.1: BPR Mooring Deployment & Acoustic Uplinks', 1, 'video', '28:15', 28, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'Deep sea telemetry mechanisms and surface buoys.')
ON CONFLICT (id) DO NOTHING;

-- 5. Course Quizzes
INSERT INTO public.quizzes (id, course_id, title, passing_score, time_limit_minutes, questions)
VALUES
(
  'qnz_imd_01',
  'crs_imd_01',
  'Doppler Weather Radar (DWR) Calibration Certification Examination',
  75.00,
  15,
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
    },
    {
      "id": "q3",
      "question": "A sharp drop in Correlation Coefficient (RhoHV < 0.80) coincident with a supercell hook echo signifies:",
      "options": ["Stratiform snowfall", "Tornado Debris Signature (TDS)", "Pure drizzle", "Ground clutter"],
      "correctIndex": 1,
      "topic": "Severe Storm Signatures",
      "explanation": "Lofted non-meteorological debris has highly irregular shapes causing low correlation coefficients."
    }
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 6. Live Virtual Classes
INSERT INTO public.live_classes (id, title, course_id, trainer_id, trainer_name, institute, scheduled_start, scheduled_end, stream_url, status, attendees_count)
VALUES
  ('live_cls_01', 'Live Doppler Radar Calibration & Nowcasting Workshop', 'crs_imd_01', 'usr_trainer_01', 'Dr. Anita Desai', 'IMD', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 2 hours', 'https://meet.google.com/lookup/moes-imd-live', 'upcoming', 42),
  ('live_cls_02', 'INCOIS Deep-Sea Argo Profiling Masterclass', 'crs_incois_01', 'usr_trainer_02', 'Dr. P. Balakrishnan', 'INCOIS', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 2 hours', 'https://meet.google.com/lookup/moes-incois-live', 'upcoming', 35)
ON CONFLICT (id) DO NOTHING;

-- 7. Initial Enrollments
INSERT INTO public.enrollments (id, user_id, course_id, progress_percentage, completed_lessons, status, last_accessed_lesson_id)
VALUES
  ('enr_01', 'usr_employee_01', 'crs_imd_01', 33.33, '["les_imd_01"]'::jsonb, 'in-progress', 'les_imd_02'),
  ('enr_02', 'usr_employee_01', 'crs_incois_01', 0.00, '[]'::jsonb, 'enrolled', 'les_inc_01')
ON CONFLICT (user_id, course_id) DO NOTHING;

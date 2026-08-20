-- ==============================================================================
-- SEA (Smart Education Authority) - Supabase Database Schema DDL
-- منصة السلطة التعليمية الذكية - هيكل جداول قاعدة بيانات Supabase المتكاملة
-- ==============================================================================

-- 1. جدول المنصات التعليمية للمعلمين (Educational Platforms)
CREATE TABLE IF NOT EXISTS public.platforms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    subject_category TEXT NOT NULL DEFAULT 'general',
    teacher_name TEXT NOT NULL,
    teacher_title TEXT NOT NULL,
    teacher_email TEXT NOT NULL,
    teacher_password TEXT DEFAULT '123456',
    teacher_phone TEXT,
    teacher_bio TEXT,
    teacher_avatar TEXT,
    banner_image TEXT,
    logo TEXT,
    theme_color TEXT DEFAULT '#0ea5e9',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'maintenance', 'draft')),
    monthly_rent_price NUMERIC(10, 2) NOT NULL DEFAULT 850,
    annual_rent_price NUMERIC(10, 2) NOT NULL DEFAULT 8500,
    subscription_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 year'),
    features JSONB DEFAULT '["مشغل فيديو مشفر", "امتحانات إلكترونية", "بنك أسئلة", "كوبونات خصم"]'::jsonb,
    total_students_count INTEGER DEFAULT 0,
    total_courses_count INTEGER DEFAULT 0,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    whatsapp_number TEXT,
    telegram_channel TEXT,
    facebook_page TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول الكورسات التعليمية (Courses)
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    platform_id TEXT NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    thumbnail TEXT,
    subject TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 250,
    discount_price NUMERIC(10, 2),
    is_free BOOLEAN DEFAULT FALSE,
    total_duration_minutes INTEGER DEFAULT 0,
    modules_count INTEGER DEFAULT 1,
    lessons_count INTEGER DEFAULT 0,
    enrolled_count INTEGER DEFAULT 0,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    tags JSONB DEFAULT '["عام", "ثانوية عامة"]'::jsonb,
    modules_data JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول الامتحانات وبنك الأسئلة (Exams)
CREATE TABLE IF NOT EXISTS public.exams (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 20,
    passing_score_percent INTEGER NOT NULL DEFAULT 60,
    total_points INTEGER NOT NULL DEFAULT 10,
    show_result_instant BOOLEAN DEFAULT TRUE,
    allow_retake BOOLEAN DEFAULT TRUE,
    attempts_count INTEGER DEFAULT 0,
    questions_data JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول طلبات استئجار وتصميم المنصات للمعلمين (Platform Order Requests)
CREATE TABLE IF NOT EXISTS public.order_requests (
    id TEXT PRIMARY KEY,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    applicant_phone TEXT NOT NULL,
    subject TEXT NOT NULL,
    desired_platform_name TEXT NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'annual', 'custom_purchase')),
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول كوبونات الخصم (Coupons)
CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY,
    platform_id TEXT NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    discount_percentage INTEGER NOT NULL DEFAULT 20,
    max_uses INTEGER NOT NULL DEFAULT 100,
    current_uses INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '6 months'),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. جدول إجابات ونتائج امتحانات الطلاب (Exam Submissions)
CREATE TABLE IF NOT EXISTS public.exam_submissions (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    exam_title TEXT NOT NULL,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_phone TEXT,
    score NUMERIC(5, 2) NOT NULL,
    total_points NUMERIC(5, 2) NOT NULL,
    percentage NUMERIC(5, 2) NOT NULL,
    passed BOOLEAN NOT NULL,
    time_spent_seconds INTEGER NOT NULL,
    answers JSONB DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. جدول ملاحظات الطلاب أثناء مشاهدة الحصص (Student Notes)
CREATE TABLE IF NOT EXISTS public.student_notes (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    timestamp_seconds INTEGER NOT NULL DEFAULT 0,
    note_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. جدول ملفات المستخدمين والطلاب (User Profiles)
CREATE TABLE IF NOT EXISTS public.users_profile (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('super_admin', 'teacher', 'student')),
    phone TEXT,
    avatar TEXT,
    platform_id TEXT,
    grade_level TEXT,
    enrolled_course_ids JSONB DEFAULT '[]'::jsonb,
    wallet_balance NUMERIC(10, 2) DEFAULT 0,
    four_part_name TEXT,
    national_id TEXT,
    guardian_phone TEXT,
    guardian_job TEXT,
    guardian_relation TEXT DEFAULT 'father',
    mother_phone TEXT,
    governorate TEXT,
    city TEXT,
    school_name TEXT,
    academic_section TEXT DEFAULT 'general',
    education_system TEXT DEFAULT 'general_arabic',
    student_code TEXT,
    is_email_verified BOOLEAN DEFAULT true,
    account_status TEXT DEFAULT 'verified',
    device_fingerprint TEXT,
    birth_date TEXT,
    gender TEXT DEFAULT 'male',
    emergency_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;

-- Allow Public / Anonymous Read & Write Policies for seamless platform operation
CREATE POLICY "Allow public read on platforms" ON public.platforms FOR SELECT USING (true);
CREATE POLICY "Allow public write on platforms" ON public.platforms FOR ALL USING (true);

CREATE POLICY "Allow public read on courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Allow public write on courses" ON public.courses FOR ALL USING (true);

CREATE POLICY "Allow public read on exams" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Allow public write on exams" ON public.exams FOR ALL USING (true);

CREATE POLICY "Allow public read & write on order_requests" ON public.order_requests FOR ALL USING (true);
CREATE POLICY "Allow public read & write on coupons" ON public.coupons FOR ALL USING (true);
CREATE POLICY "Allow public read & write on exam_submissions" ON public.exam_submissions FOR ALL USING (true);
CREATE POLICY "Allow public read & write on student_notes" ON public.student_notes FOR ALL USING (true);
CREATE POLICY "Allow public read & write on users_profile" ON public.users_profile FOR ALL USING (true);

-- 9. جدول طلبات الدعم الفني وتعديلات المنصات (Support Tickets & Admin Requests)
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id TEXT PRIMARY KEY,
    platform_id TEXT NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
    platform_name TEXT NOT NULL,
    teacher_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('server_upgrade', 'financial_withdrawal', 'student_issue', 'feature_request', 'technical_bug')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high')),
    attachment_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'rejected')),
    admin_response TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on support_tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Allow public read & write on support_tickets
CREATE POLICY "Allow public read & write on support_tickets" ON public.support_tickets FOR ALL USING (true);


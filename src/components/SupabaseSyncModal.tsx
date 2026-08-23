import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  X,
  ExternalLink,
  Table,
  Layers,
  Sparkles,
  Server,
  Code2,
} from 'lucide-react';
import { getSupabaseHealth, SupabaseHealthStatus } from '../lib/supabaseSync';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useApp();
  const [health, setHealth] = useState<SupabaseHealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'sql' | 'tables'>('status');

  const checkStatus = async () => {
    setLoading(true);
    try {
      const res = await getSupabaseHealth();
      setHealth(res);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const copySqlToClipboard = () => {
    const sqlText = `-- SEA (Smart Education Authority) Complete Database Schema
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
    status TEXT NOT NULL DEFAULT 'active',
    monthly_rent_price NUMERIC(10, 2) NOT NULL DEFAULT 850,
    annual_rent_price NUMERIC(10, 2) NOT NULL DEFAULT 8500,
    subscription_expires_at TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    total_students_count INTEGER DEFAULT 0,
    total_courses_count INTEGER DEFAULT 0,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    whatsapp_number TEXT,
    telegram_channel TEXT,
    facebook_page TEXT,
    teacher_experience_years TEXT,
    teacher_certificates TEXT,
    teacher_highlights TEXT,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS public.users_profile (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT,
    avatar TEXT,
    photo_url TEXT,
    platform_id TEXT,
    grade_level TEXT,
    enrolled_course_ids JSONB DEFAULT '[]'::jsonb,
    wallet_balance NUMERIC(10, 2) DEFAULT 0,
    is_email_verified BOOLEAN DEFAULT TRUE,
    account_status TEXT DEFAULT 'verified',
    plain_password TEXT,
    password TEXT,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    platform_id TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    thumbnail TEXT,
    subject TEXT,
    stage TEXT,
    curriculum_type TEXT,
    term TEXT,
    grade_level TEXT,
    price NUMERIC(10, 2) DEFAULT 0,
    original_price NUMERIC(10, 2),
    is_free BOOLEAN DEFAULT FALSE,
    total_duration_minutes INTEGER DEFAULT 0,
    modules_count INTEGER DEFAULT 1,
    lessons_count INTEGER DEFAULT 0,
    enrolled_count INTEGER DEFAULT 0,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    status TEXT DEFAULT 'published',
    scheduled_publish_date TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    requirements JSONB DEFAULT '[]'::jsonb,
    what_you_will_learn JSONB DEFAULT '[]'::jsonb,
    modules_data JSONB DEFAULT '[]'::jsonb,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS public.exams (
    id TEXT PRIMARY KEY,
    course_id TEXT,
    module_id TEXT,
    lesson_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 20,
    passing_score_percent INTEGER DEFAULT 60,
    total_points INTEGER DEFAULT 10,
    questions_data JSONB DEFAULT '[]'::jsonb,
    max_attempts INTEGER DEFAULT 3,
    allow_hints BOOLEAN DEFAULT TRUE,
    show_explanation BOOLEAN DEFAULT TRUE,
    shuffle_questions BOOLEAN DEFAULT FALSE,
    enable_anti_cheat BOOLEAN DEFAULT TRUE,
    strict_fullscreen BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'published',
    is_published BOOLEAN DEFAULT TRUE,
    attempts_count INTEGER DEFAULT 0,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS public.exam_submissions (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT,
    score NUMERIC(10, 2) NOT NULL,
    total_marks NUMERIC(10, 2) NOT NULL,
    answers JSONB DEFAULT '{}'::jsonb,
    submitted_at TEXT
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id TEXT PRIMARY KEY,
    platform_id TEXT,
    platform_name TEXT,
    teacher_name TEXT,
    category TEXT,
    title TEXT,
    message TEXT,
    severity TEXT,
    attachment_url TEXT,
    status TEXT DEFAULT 'open',
    admin_response TEXT,
    created_at TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS public.printed_codes_batches (
    id TEXT PRIMARY KEY,
    platform_id TEXT,
    teacher_id TEXT,
    teacher_name TEXT,
    teacher_phone TEXT,
    course_id TEXT,
    course_title TEXT,
    batch_number INTEGER,
    quantity INTEGER,
    course_price NUMERIC(10, 2),
    total_course_value NUMERIC(10, 2),
    platform_fee_rate NUMERIC(5, 2),
    total_platform_fee NUMERIC(10, 2),
    paid_codes_count INTEGER,
    settled_amount NUMERIC(10, 2),
    remaining_due_amount NUMERIC(10, 2),
    status TEXT,
    codes JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS public.assignments (
    id TEXT PRIMARY KEY,
    course_id TEXT,
    module_id TEXT,
    lesson_id TEXT,
    title TEXT,
    description TEXT,
    subject TEXT,
    concept_sheet_title TEXT,
    concept_sheet_content TEXT,
    concept_sheet_attachment_url TEXT,
    duration_minutes INTEGER,
    passing_score_percent INTEGER,
    total_points INTEGER,
    questions_data JSONB DEFAULT '[]'::jsonb,
    max_attempts INTEGER,
    allow_concept_sheet BOOLEAN,
    show_model_answer BOOLEAN,
    auto_grading BOOLEAN,
    due_date TEXT,
    status TEXT,
    is_published BOOLEAN,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS public.study_tasks (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    course_id TEXT,
    title TEXT,
    description TEXT,
    due_date TEXT,
    due_time TEXT,
    status TEXT,
    priority TEXT,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS public.order_requests (
    id TEXT PRIMARY KEY,
    applicant_name TEXT,
    applicant_email TEXT,
    applicant_phone TEXT,
    subject TEXT,
    desired_platform_name TEXT,
    plan_type TEXT,
    notes TEXT,
    status TEXT,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY,
    platform_id TEXT,
    code TEXT,
    discount_percentage INTEGER,
    max_uses INTEGER,
    current_uses INTEGER,
    expires_at TEXT,
    is_active BOOLEAN,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS public.student_notes (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    lesson_id TEXT,
    course_id TEXT,
    timestamp_seconds INTEGER,
    note_text TEXT,
    created_at TEXT
);

-- Enable RLS and public access policies
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printed_codes_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all platforms" ON public.platforms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all users_profile" ON public.users_profile FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all exams" ON public.exams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all submissions" ON public.exam_submissions FOR ALL USING (true);
CREATE POLICY "Allow public all tickets" ON public.support_tickets FOR ALL USING (true);
CREATE POLICY "Allow public all batches" ON public.printed_codes_batches FOR ALL USING (true);
CREATE POLICY "Allow public all assignments" ON public.assignments FOR ALL USING (true);
CREATE POLICY "Allow public all tasks" ON public.study_tasks FOR ALL USING (true);
CREATE POLICY "Allow public all orders" ON public.order_requests FOR ALL USING (true);
CREATE POLICY "Allow public all coupons" ON public.coupons FOR ALL USING (true);
CREATE POLICY "Allow public all notes" ON public.student_notes FOR ALL USING (true);`;

    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    addToast('success', 'تم نسخ كود SQL بنجاح', 'يمكنك لصقه في نافذة SQL Editor في مشروع Supabase لإنشاء كافة الجداول بضغطة زر واحدة.');
    setTimeout(() => setCopiedSql(false), 3500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 overflow-hidden text-right flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/70">
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Database className="w-6 h-6 text-emerald-400" />
                <span>مركز تكامل ومزامنة قاعدة بيانات Supabase</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                فحص الاتصال المباشر، الجداول المصممة، واستخراج كود تهيئة SQL
              </p>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center justify-end gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'status'
                ? 'border-emerald-400 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            حالة الاتصال المباشر
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'tables'
                ? 'border-emerald-400 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-4 h-4" />
            الجداول وهيكل البيانات
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'sql'
                ? 'border-emerald-400 text-emerald-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            كود SQL لإنشاء الجداول
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'status' && (
            <div className="space-y-6">
              {/* Connection Status Banner */}
              <div
                className={`p-5 rounded-2xl border flex items-start justify-between ${
                  health?.connected
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                }`}
              >
                <button
                  onClick={checkStatus}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-xs font-bold flex items-center gap-2 border border-slate-700 hover:bg-slate-800 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  إعادة فحص
                </button>

                <div className="flex items-start gap-3 text-right">
                  <div>
                    <h4 className="text-sm font-black flex items-center gap-2 justify-end">
                      <span>{health?.connected ? 'متصل بنجاح بقاعدة بيانات Supabase ⚡' : 'جاهز للربط / يتم استخدام وضع الذاكرة المتزامن'}</span>
                      {health?.connected ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                      )}
                    </h4>
                    <p className="text-xs mt-1 text-slate-300">
                      {health?.connected
                        ? `زمن الاستجابة: ${health.latencyMs}ms | تم التحقق في: ${health.lastChecked}`
                        : health?.error || 'مشروع Supabase معرف وجاهز. يمكنك تطبيق كود SQL أدناه لإنشاء الجداول فورا.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Endpoint Details */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-mono text-cyan-400 text-[11px] break-all">{health?.url}</span>
                  <span className="font-bold">رابط مشروع Supabase:</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-emerald-400 font-bold">مفعلة وتلقائية (Durable Sync + Local Storage Fallback)</span>
                  <span className="font-bold">حالة المزامنة التلقائية:</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-300 font-bold">
                تم تصميم وتجهيز 8 جداول رئيسية متكاملة لتشغيل منظومة SEA التعليمية:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { name: 'platforms', title: 'منصات المعلمين', desc: 'تخزين بيانات المعلم، الأسعار، الألوان، الصلاحيات' },
                  { name: 'courses', title: 'الكورسات والمناهج', desc: 'المحاضرات، الوحدات، الأسعار، نسب الخصم' },
                  { name: 'exams', title: 'الامتحانات وبنك الأسئلة', desc: 'الأسئلة، التوقيت، نسب النجاح، الإجابات النموذجية' },
                  { name: 'order_requests', title: 'طلبات استئجار المنصات', desc: 'بيانات المعلمين الراغبين في حجز منصة مخصصة' },
                  { name: 'coupons', title: 'كوبونات الخصم', desc: 'أكواد الخصم، نسب التخفيض، عدد مرات الاستخدام' },
                  { name: 'exam_submissions', title: 'إجابات ونتائج الطلاب', desc: 'الدرجات، الوقت المستغرق، تقرير الأخطاء' },
                  { name: 'student_notes', title: 'ملاحظات الفيديو', desc: 'تدوين ملاحظات الطلاب مرتبطة بالثواني الزمنية' },
                  { name: 'users_profile', title: 'حسابات ومحافظ المستخدمين', desc: 'الأدوار، أرقام الهواتف، الأرصدة والكورسات' },
                ].map((t) => (
                  <div key={t.name} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between">
                    <span className="font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                      {t.name}
                    </span>
                    <div className="text-right">
                      <span className="font-black text-slate-100 block">{t.title}</span>
                      <span className="text-[11px] text-slate-400">{t.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={copySqlToClipboard}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition-all"
                >
                  {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? 'تم النسخ بنجاح!' : 'نسخ كود SQL كامل'}</span>
                </button>
                <span className="text-xs text-slate-400 font-bold">
                  انسخ الكود والصقه في SQL Editor داخل Supabase:
                </span>
              </div>
              <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 font-mono text-[11px] text-emerald-400 max-h-72 overflow-y-auto text-left ltr" dir="ltr">
                <pre className="whitespace-pre-wrap">
{`-- SEA Smart Education Authority Schema
CREATE TABLE IF NOT EXISTS public.platforms (...);
CREATE TABLE IF NOT EXISTS public.courses (...);
CREATE TABLE IF NOT EXISTS public.exams (...);
CREATE TABLE IF NOT EXISTS public.order_requests (...);
CREATE TABLE IF NOT EXISTS public.coupons (...);
CREATE TABLE IF NOT EXISTS public.exam_submissions (...);
CREATE TABLE IF NOT EXISTS public.student_notes (...);`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs">
          <button
            onClick={copySqlToClipboard}
            className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>نسخ سكريبت التهيئة SQL</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};

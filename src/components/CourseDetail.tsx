import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DEFAULT_COURSE_COVER } from './teacher/CourseCoverUploader';
import { CourseSubscribeModal } from './CourseSubscribeModal';
import {
  ShieldCheck,
  PlayCircle,
  FileText,
  HelpCircle,
  Lock,
  Unlock,
  CheckCircle,
  CheckCircle2,
  Tag,
  Clock,
  Layers,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  X,
  AlertTriangle,
  Users,
  GraduationCap,
  Award,
  BookOpen,
  Filter,
  FileCheck,
  Video,
  ChevronDown,
  ChevronUp,
  Home,
  MessageSquare,
  Calendar,
  Eye,
  Download,
  Activity,
  FileQuestion,
  RotateCcw,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';

export const CourseDetail: React.FC = () => {
  const {
    currentCourse,
    currentPlatform,
    currentUser,
    exams,
    assignments,
    bankQuestions,
    enrollInCourse,
    setSelectedLessonId,
    setSelectedExamId,
    setCurrentView,
    setIsAuthModalOpen,
    addToast,
    theme,
    selectedInstructorName,
    setSelectedInstructorName,
  } = useApp();

  const [couponCode, setCouponCode] = useState('');
  const [activeSubView, setActiveSubView] = useState<'welcome' | 'curriculum'>('welcome');
  const [contentFilter, setContentFilter] = useState<'all' | 'video' | 'exam' | 'pdf' | 'assignment' | 'questions'>('all');
  const [lockedItemModal, setLockedItemModal] = useState<{
    title: string;
    typeLabel: string;
    infoLabel: string;
  } | null>(null);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [showParentOverview, setShowParentOverview] = useState(true);

  // Accordion state for modules
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  if (!currentCourse) {
    return (
      <div className="w-full max-w-4xl mx-auto py-20 px-4 text-center animate-fade-in" dir="rtl">
        <div className="w-24 h-24 bg-rose-50 dark:bg-rose-950/40 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-200 dark:border-rose-900/40">
          <AlertTriangle className="w-12 h-12 text-rose-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-200 mb-2">هذا المقرر غير متاح أو غير موجود</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">
          يبدو أنه تم تغيير رابط الكورس أو حذفه من قِبل إدارة المنصة.
        </p>
        <button
          onClick={() => setCurrentView('student_portal')}
          className="px-6 py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs transition-all shadow-lg shadow-cyan-600/20 cursor-pointer flex items-center justify-center gap-2 mx-auto"
        >
          <Home className="w-4 h-4" />
          <span>العودة إلى الصفحة الرئيسية</span>
        </button>
      </div>
    );
  }

  const isEnrolled = currentUser?.enrolledCourseIds?.includes(currentCourse.id);
  const courseExams = (exams || []).filter((e) => e.courseId === currentCourse.id);
  const courseAssignments = (assignments || []).filter((a) => a.courseId === currentCourse.id);
  const courseBankQuestions = (bankQuestions || []).filter((q) => q.courseId === currentCourse.id);

  // Collect all teachers (Primary + Participating)
  const allTeachers = useMemo(() => {
    const list = [];
    if (currentPlatform) {
      list.push({
        id: 'primary',
        name: currentPlatform.teacherName || 'المعلم المعتمد',
        title: currentPlatform.teacherTitle || 'رئيس قسم المادة',
        avatar: currentPlatform.branding?.logo,
        isPrimary: true,
      });
    }
    if (currentCourse.participatingTeachers) {
      currentCourse.participatingTeachers.forEach((pt, idx) => {
        list.push({
          id: pt.id || `pt-${idx}`,
          name: pt.name,
          title: pt.title || pt.subject || currentCourse.subject,
          avatar: pt.avatar,
          isPrimary: false,
        });
      });
    }
    return list;
  }, [currentCourse, currentPlatform]);

  // Aggregate stats for Parent & Student overview
  const totalLessonsCount = currentCourse.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const freeLessonsCount = currentCourse.modules?.reduce((acc, m) => acc + (m.lessons?.filter((l) => l.isFreePreview)?.length || 0), 0) || 0;

  const handleEnroll = () => {
    if (!currentUser) {
      addToast(
        'info',
        'تسجيل الدخول مطلوب للاشتراك 🎓',
        'يرجى تسجيل الدخول أو إنشاء حساب طالب لمتابعة شراء الكورس وتفعيل المحاضرات فورياً.'
      );
      setIsAuthModalOpen(true);
      return;
    }
    setIsSubscribeModalOpen(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 text-right relative pb-20 pt-2 animate-fade-in" dir="rtl">
      
      {/* Top Header & Navigation Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Navigation CTAs */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setCurrentView('student_portal')}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs transition-all shadow-md shadow-cyan-600/20 cursor-pointer flex items-center justify-center gap-2 group"
          >
            <Home className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>العودة إلى الصفحة الرئيسية</span>
          </button>

          <button
            onClick={() => setCurrentView('platforms')}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4 text-indigo-500" />
            <span>استعراض باقي المدرسين</span>
          </button>
        </div>

        {/* Page Switcher Tabs: Welcome Page vs Classroom Workspace */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 w-full md:w-auto">
          <button
            onClick={() => setActiveSubView('welcome')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubView === 'welcome'
                ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-md border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span>بطاقة التعريف (الصفحة الأولى)</span>
          </button>

          <button
            onClick={() => setActiveSubView('curriculum')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubView === 'curriculum'
                ? 'bg-cyan-600 dark:bg-cyan-500 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>المنهج والدروس (الصفحة الثانية)</span>
          </button>
        </div>
      </div>

      {/* Protected Content Lock Modal */}
      {lockedItemModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white space-y-6 shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setLockedItemModal(null)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4 relative z-10 pt-4">
              <div className="w-20 h-20 rounded-[24px] bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-inner">
                <Lock className="w-10 h-10" />
              </div>
              <span className="px-4 py-1.5 rounded-full text-xs font-black bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 uppercase tracking-widest">
                محتوى محمي ومشفر
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{lockedItemModal.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                هذا المحتوى مغلق حالياً. يجب تفعيل الاشتراك في الكورس للتمكن من الوصول لجميع المحاضرات والملفات والامتحانات.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/80 space-y-3 relative z-10">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">نوع المحتوى المعلق</span>
                <span className="font-bold text-slate-900 dark:text-white">{lockedItemModal.typeLabel}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">التفاصيل</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{lockedItemModal.infoLabel}</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 relative z-10">
              <button
                onClick={() => {
                  setLockedItemModal(null);
                  handleEnroll();
                }}
                className="w-full py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-sm shadow-xl shadow-cyan-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>
                  {currentUser
                    ? `تأكيد الاشتراك الفوري (${currentCourse.price} ج.م)`
                    : 'تسجيل الدخول للاشتراك وفتح المحتوى'}
                </span>
              </button>
              <button
                onClick={() => setLockedItemModal(null)}
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 1: WELCOME & COURSE OVERVIEW VIEW */}
      {activeSubView === 'welcome' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Parent & Student Smart Monitoring Card (Theme Aware) */}
          <div className="p-6 rounded-[32px] bg-gradient-to-r from-indigo-50/90 via-white to-cyan-50/90 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-900/40 text-slate-900 dark:text-white shadow-sm space-y-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-100 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/20 dark:border-cyan-500/30 flex items-center justify-center font-black">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">بطاقة المتابعة الذكية (للطالب وولي الأمر)</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-black">
                      محدثة مباشرة
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    نظام متابعة موحد يضمن لولي الأمر والطالب معرفة نسبة الإنجاز والدرجات والمحاضرات القادمة.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowParentOverview(!showParentOverview)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-200/60 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>{showParentOverview ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}</span>
                {showParentOverview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showParentOverview && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 animate-fade-in">
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-indigo-100 dark:border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">إجمالي الدروس المرئية</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-cyan-600 dark:text-cyan-300">{totalLessonsCount}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">محاضرة</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                    {freeLessonsCount > 0 ? `تتضمن ${freeLessonsCount} معاينة مجانية` : 'متاحة بالكامل للمشتركين'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-indigo-100 dark:border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">الاختبارات والتقييمات</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-amber-600 dark:text-amber-300">{courseExams.length}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">امتحان</span>
                  </div>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">تصحيح وتجميع درجات تلقائي</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-indigo-100 dark:border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">الواجبات والتكليفات</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-300">{courseAssignments.length}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">تكليف</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">متابعة دقيقة للتسليم</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-indigo-100 dark:border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">حالة تفعيل الكورس</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-sm font-black ${isEnrolled ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isEnrolled ? 'مفعل ومشترك ✅' : 'مغلق (بحاجة تفعيل) 🔒'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">
                    {isEnrolled ? 'الوصول مفتوح لكافة المحتويات' : 'يمكن التفعيل عبر المحفظة أو الكود'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Hero Welcome Banner (Theme Aware) */}
          <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-white via-indigo-50/40 to-slate-50 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-2xl">
            <div className="relative z-10 p-8 md:p-12 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-10">
              
              {/* Course Info */}
              <div className="space-y-6 max-w-3xl flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs font-black">
                    {currentCourse.subject}
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-slate-200/80 dark:bg-white/10 border border-slate-300/60 dark:border-white/10 text-slate-800 dark:text-white text-xs font-bold">
                    {currentCourse.gradeLevel}
                  </span>
                  {isEnrolled && (
                    <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-black flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      تم الاشتراك وتفعيل المحتوى
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                  {currentCourse.title}
                </h1>
                
                <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl font-medium">
                  {currentCourse.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 bg-white dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5">
                    <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <span>{currentCourse.modules?.length || 1} وحدات دراسية</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5">
                    <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{currentCourse.lessonsCount || 12} محتوى متكامل</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5">
                    <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{currentCourse.enrolledCount} طالب مشترك</span>
                  </div>
                </div>
              </div>

              {/* Pricing & CTA Card */}
              <div className="w-full lg:w-96 p-6 rounded-[32px] bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-xl flex flex-col gap-5 shrink-0">
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-inner">
                  <img
                    src={currentCourse.thumbnail || DEFAULT_COURSE_COVER}
                    alt={currentCourse.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/20">
                      {currentCourse.subject}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1">الاستثمار الأكاديمي المعتمد</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                      {currentCourse.price} <span className="text-lg text-emerald-600 dark:text-emerald-400">ج.م</span>
                    </span>
                    {currentCourse.originalPrice && (
                      <span className="text-sm line-through text-slate-400 dark:text-slate-500 font-bold">
                        {currentCourse.originalPrice} ج.م
                      </span>
                    )}
                  </div>
                </div>

                {/* Primary DIRECT Page Transition Button */}
                <button
                  onClick={() => setActiveSubView('curriculum')}
                  className="w-full py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-sm transition-all shadow-lg shadow-cyan-600/20 cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>دخول المنهج والدروس المباشرة ←</span>
                </button>

                {!isEnrolled && (
                  <button
                    onClick={handleEnroll}
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>تأكيد الاشتراك وفتح كافة المحتويات</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Elite Teachers Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">معلمو ومحاضرو هذا المقرر</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    اختر المعلم للانتقال مباشرة لدروسه ومحاضراته في الصفحة الثانية.
                  </p>
                </div>
              </div>

              {selectedInstructorName && (
                <button
                  onClick={() => setSelectedInstructorName(null)}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>إلغاء تصفية المعلم</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allTeachers.map((teacher) => {
                const isSelected = selectedInstructorName === teacher.name;
                return (
                  <div
                    key={teacher.id}
                    onClick={() => {
                      setSelectedInstructorName(isSelected ? null : teacher.name);
                      setActiveSubView('curriculum');
                    }}
                    className={`p-5 rounded-3xl border flex items-center gap-4 transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-md ring-2 ring-indigo-500/50'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                      {teacher.avatar ? (
                        <img src={teacher.avatar} alt={teacher.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-black text-slate-400">{teacher.name[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`text-sm font-black truncate ${
                            isSelected
                              ? 'text-indigo-900 dark:text-indigo-300'
                              : 'text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                          }`}
                        >
                          {teacher.name}
                        </h3>
                        {teacher.isPrimary && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black shrink-0">
                            رئيسي 👑
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold truncate">
                        {teacher.title}
                      </p>
                      <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 block mt-2">
                        انقر لدخول المنهج وعرض محاضرات هذا الأستاذ ←
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PAGE 2: CLASSROOM CURRICULUM WORKSPACE VIEW */}
      {activeSubView === 'curriculum' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Workspace Top Banner & Return Trigger */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">قاعة المنهج الأكاديمي والدروس المباشرة</h2>
                {selectedInstructorName ? (
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    مصفى حالياً لعرض دروس الأستاذ: <strong>{selectedInstructorName}</strong> فقط
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    استعرض المحاضرات، الامتحانات والتقييمات، المذكرات، والواجبات.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setActiveSubView('welcome')}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>العودة لبطاقة تعريف الكورس</span>
            </button>
          </div>

          {/* Academic Content Filter Toolbar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4 overflow-x-auto">
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 shrink-0">تصفية نوع المحتوى:</span>
            
            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
              {[
                { id: 'all', label: 'الكل', icon: Layers, color: 'text-slate-700 dark:text-slate-200' },
                { id: 'video', label: 'المحاضرات والمرئيات', icon: PlayCircle, color: 'text-cyan-600 dark:text-cyan-400' },
                { id: 'exam', label: 'الامتحانات والتقييمات', icon: FileCheck, color: 'text-rose-600 dark:text-rose-400' },
                { id: 'pdf', label: 'المذكرات والملفات', icon: FileText, color: 'text-amber-600 dark:text-amber-400' },
                { id: 'assignment', label: 'الواجبات والتكليفات', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400' },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = contentFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setContentFilter(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-cyan-600 dark:bg-slate-800 text-white shadow-md border border-cyan-600 dark:border-slate-700'
                        : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modules & Lessons Accordion */}
          <div className="space-y-4">
            {currentCourse.modules?.map((mod, mIdx) => {
              const rawLessons = mod.lessons || [];
              
              // Advanced Filtering
              const filteredLessons = rawLessons.filter((lesson) => {
                if (contentFilter === 'video' && !(lesson.type === 'video' || (!lesson.type && lesson.videoUrl))) return false;
                if (contentFilter === 'exam' && !(lesson.type === 'exam' || !!lesson.examId)) return false;
                if (contentFilter === 'pdf' && !(lesson.type === 'pdf' || !!lesson.pdfUrl)) return false;
                if (contentFilter === 'assignment' && !(lesson.type === 'assignment')) return false;
                
                if (selectedInstructorName) {
                  const primaryTeacherName = currentPlatform?.teacherName || 'المعلم المعتمد';
                  const lessonInstructor = lesson.instructorName || primaryTeacherName;
                  if (lessonInstructor.toLowerCase() !== selectedInstructorName.toLowerCase()) {
                    return false;
                  }
                }
                return true;
              });

              if (contentFilter !== 'all' && filteredLessons.length === 0) {
                return null;
              }

              const isExpanded = expandedModules[mod.id] !== false;

              return (
                <div
                  key={mod.id}
                  className="rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all"
                >
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full p-6 flex items-center justify-between gap-4 text-right cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-100 dark:border-cyan-800/50">
                        <span className="text-xl font-black">{mIdx + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                          {mod.title}
                          {mod.isFree && (
                            <span className="px-2.5 py-0.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-[10px] font-black uppercase">
                              مجاني بالكامل
                            </span>
                          )}
                        </h3>
                        {mod.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl line-clamp-2">
                            {mod.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-[11px] font-bold text-slate-400">
                          <span>{filteredLessons.length} عناصر متاحة</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {/* Module Lessons Body */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 space-y-3 border-t border-slate-100 dark:border-slate-800/50">
                      {filteredLessons.length === 0 ? (
                        <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800">
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                            {selectedInstructorName
                              ? `لم يقم الأستاذ ${selectedInstructorName} برفع محتوى خاص به في هذه الوحدة حتى الآن.`
                              : 'لا توجد عناصر مطابقة للفلتر المختار داخل هذه الوحدة.'}
                          </p>
                        </div>
                      ) : (
                        filteredLessons.map((lesson) => {
                          const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'super_admin';
                          const isDraft = lesson.status === 'draft' || lesson.isPublished === false;
                          const isScheduledFuture = lesson.scheduledDate && new Date(lesson.scheduledDate).getTime() > Date.now();
                          
                          if (isDraft && !isTeacherOrAdmin) return null;

                          const canAccess = (isEnrolled || lesson.isFreePreview) && (!isScheduledFuture || isTeacherOrAdmin);
                          
                          const isVideo = lesson.type === 'video' || (!lesson.type && lesson.videoUrl);
                          const isExam = lesson.type === 'exam' || !!lesson.examId;
                          const isPdf = lesson.type === 'pdf' || !!lesson.pdfUrl;

                          const typeIcon = isVideo ? PlayCircle : isExam ? FileCheck : FileText;
                          
                          const typeColorClass = isExam
                            ? 'text-rose-500 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-900/40'
                            : isPdf
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-900/40'
                            : 'text-cyan-500 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-900/40';

                          return (
                            <div
                              key={lesson.id}
                              className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-cyan-300 dark:hover:border-cyan-800 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${typeColorClass}`}>
                                  {React.createElement(typeIcon, { className: "w-6 h-6" })}
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                      {lesson.title}
                                    </h4>

                                    {lesson.isFreePreview && (
                                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase">
                                        معاينة مجانية ✅
                                      </span>
                                    )}

                                    {isExam && (
                                      <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-black">
                                        امتحان وتقييم ⏰
                                      </span>
                                    )}

                                    {isScheduledFuture && (
                                      <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-black flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> متاح {new Date(lesson.scheduledDate!).toLocaleDateString('ar-EG')}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                    {lesson.durationMinutes && <span>⏱️ {lesson.durationMinutes} دقيقة</span>}
                                    {lesson.durationMinutes && <span>•</span>}
                                    <span>👨‍🏫 {lesson.instructorName || currentPlatform?.teacherName || 'المعلم المعتمد'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="shrink-0 flex justify-end">
                                {canAccess ? (
                                  <button
                                    onClick={() => {
                                      setSelectedLessonId(lesson.id);
                                      if (lesson.type === 'exam' || lesson.examId) {
                                        if (lesson.examId) setSelectedExamId(lesson.examId);
                                        setCurrentView('exam_view');
                                      } else {
                                        setCurrentView('lesson_player');
                                      }
                                    }}
                                    className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 ${
                                      isExam
                                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                                        : 'bg-cyan-600 dark:bg-white hover:bg-cyan-500 dark:hover:bg-slate-100 text-white dark:text-slate-900'
                                    }`}
                                  >
                                    <span>{isExam ? 'بدء الامتحان' : 'مشاهدة المحتوى'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setLockedItemModal({
                                        title: lesson.title,
                                        typeLabel: isExam ? 'امتحان محمي' : 'محتوى فيديو / ملف',
                                        infoLabel: 'مطلوب الاشتراك في المقرر',
                                      });
                                    }}
                                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
                                  >
                                    <Lock className="w-4 h-4 text-rose-500" />
                                    <span>محتوى مقفل</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Rich Academic Overview Banner if Course is empty */}
            {(!currentCourse.modules || currentCourse.modules.length === 0) && (
              <div className="p-8 sm:p-12 text-center rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto shadow-sm">
                  <Calendar className="w-10 h-10" />
                </div>

                <div className="space-y-2 max-w-xl mx-auto">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-black border border-cyan-500/20">
                    الأجندة الأكاديمية ونشر المحتوى
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    يتم إعداد ورفع محتوى المنهج حالياً
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    يقوم أستاذ المادة ({currentPlatform?.teacherName || 'المعلم المعتمد'}) برفع محاضرات ومذكرات المقرر بانتظام وفق الجدول الأكاديمي المعتمد.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      addToast('info', 'تم إرسال طلب تنبيه 🔔', 'سيتم إشعارك فور رفع المحاضرة القادمة في هذا المقرر.');
                    }}
                    className="px-5 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs transition-all shadow-md shadow-cyan-600/20 cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>تفعيل تنبيهات رفع المحاضرات</span>
                  </button>

                  <button
                    onClick={() => setCurrentView('student_portal')}
                    className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    <span>العودة للوحة الطالب</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Course Subscription / Access Code Modal */}
      <CourseSubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
        course={currentCourse}
      />
    </div>
  );
};


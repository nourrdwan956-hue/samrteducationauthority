import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { EducationalPlatform, Course } from '../types';
import { DEFAULT_COURSE_COVER } from './teacher/CourseCoverUploader';
import {
  Sparkles,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  GraduationCap,
  PlayCircle,
  FileText,
  Star,
  CheckCircle,
  Award,
  Clock,
  Video,
  ShieldCheck,
  MessageCircle,
  Search,
  Zap,
  Users,
  Smartphone,
  Lock,
  Building,
  Headphones,
  HelpCircle,
  FileCode,
  SlidersHorizontal,
  Wallet,
  Check,
  Layers,
  ChevronDown,
} from 'lucide-react';

export const HomeHero: React.FC = () => {
  const {
    setCurrentView,
    platforms,
    courses,
    setSelectedPlatformId,
    setSelectedCourseId,
    setIsAuthModalOpen,
    currentUser,
    theme,
  } = useApp();

  const isLight = theme === 'light';
  const [viewingTeacherPlatform, setViewingTeacherPlatform] = useState<EducationalPlatform | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  const WHATSAPP_NUMBER = '01151157100';
  const WHATSAPP_LINK_STUDENT = `https://wa.me/201151157100?text=${encodeURIComponent('السلام عليكم، أريد الاستفسار عن الكورسات والمنصات المتاحة للطلاب في SEA')}`;
  const WHATSAPP_LINK_TEACHER = `https://wa.me/201151157100?text=${encodeURIComponent('السلام عليكم، أريد الاستفسار عن فتح وتجهيز منصة تعليمية خاصة لمعلم داخل نظام SEA')}`;

  // Primary platform
  const primaryPlatform = platforms[0] || null;

  // Real total student enrollment count across published courses
  const totalRealEnrollments = useMemo(() => {
    return courses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);
  }, [courses]);

  // Real available published courses for students/visitors
  const featuredCourses = useMemo(() => {
    const list: { course: Course; platform: EducationalPlatform }[] = [];

    platforms.forEach((platform) => {
      const published = courses.filter(
        (c) =>
          c.platformId === platform.id &&
          (c.status === 'published' || c.isPublished !== false)
      );

      published.forEach((course) => {
        // Filter search query & grade
        const matchesQuery =
          searchQuery.trim() === '' ||
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          platform.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          platform.subject.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesGrade =
          selectedGradeFilter === 'all' || course.gradeLevel === selectedGradeFilter;

        if (matchesQuery && matchesGrade) {
          list.push({ course, platform });
        }
      });
    });

    // Sort to pick highest enrolled & newest
    return list.sort((a, b) => (b.course.enrolledCount || 0) - (a.course.enrolledCount || 0));
  }, [platforms, courses, searchQuery, selectedGradeFilter]);

  // Real Student FAQ items based on system behavior
  const studentFaqs = [
    {
      question: 'كيف يمكنني التسجيل في الكورسات وتفعيل المحاضرات؟',
      answer:
        'يمكنك إنشاء حساب طالب جديد مجاناً بالبريد الإلكتروني، ثم تصفح الكورسات المتاحة. للتفعيل يمكنك استخدام شفرة السنتر المطبوعة (16 رقم) للشحن الفوري، أو الشحن عبر فودافون كاش / إنستا باي وسداد قيمة الكورس مباشرة من محفظتك الإلكترونية بالمنصة.',
    },
    {
      question: 'كيف تعمل ورقة المفاهيم والقوانين أثناء حل الامتحانات والواجبات؟',
      answer:
        'تتيح المنظومة للطالب فتح نافذة جانبية مخصصة لورقة المفاهيم والقوانين الاسترشادية المعتمدة أثناء أداء الامتحان أو التكليف، مما يساعدك على الاستعانة بالقوانين والشرح النظري أثناء حل الأسئلة الصعبة بكل سهولة دون الخروج من صفحة الاختبار.',
    },
    {
      question: 'هل يمكنني مشاهدة الدروس من الهاتف المحمول؟ وكيف تُحفظ المحاضرات؟',
      answer:
        'نعم، المنصة متوافقة تماماً مع كافة الهواتف والشاشات وأجهزة الحاسوب. يتم تسجيل وتحديد نسبة تقدمك وتذكر دقيقة التوقف تلقائياً في كل درس حتى تتمكن من استكمال المشاهدة في أي وقت ومن أي مكان.',
    },
    {
      question: 'ما هي حماية الجهاز ومشاركة الحسابات؟',
      answer:
        'لحماية خصوصيتك واشتراكك، يتم ربط حسابك بجهازك الرئيسي تلقائياً عند أول دخول. وفي حال احتجت لنقل الحساب لجهاز جديد يمكنك التواصل مع الدعم الفني المباشر عبر الواتساب لتفعيل الجهاز الجديد.',
    },
    {
      question: 'كيف يتواصل ولي الأمر لمتابعة الدرجات والمستوى الأكاديمي؟',
      answer:
        'يتضمن ملف الطالب كوداً خاصاً ورقم ولي الأمر، وتوفر المنظومة رصداً فورياً لنتائج الامتحانات والواجبات مع إمكانية طباعة تقارير الأداء وتصديرها بصيغة PDF لمتابعة ولي الأمر أولاً بأول.',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-20 text-right relative pb-12">
      
      {/* Floating WhatsApp Quick Action Button for Direct Chat */}
      <a
        href={WHATSAPP_LINK_STUDENT}
        target="_blank"
        rel="noopener noreferrer"
        title="تحدث معنا على الواتساب 01151157100"
        className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-50 px-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-2xl shadow-emerald-500/50 flex items-center gap-2.5 transition-all duration-300 hover:scale-105 group border-2 border-white/20"
      >
        <div className="relative">
          <MessageCircle className="w-5 sm:w-6 h-5 sm:h-6 fill-white text-emerald-500" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
        </div>
        <span className="hidden xs:inline">واتساب SEA المباشر: {WHATSAPP_NUMBER}</span>
        <span className="xs:hidden">الواتساب</span>
      </a>

      {/* ========================================================================= */}
      {/* SECTION 1: STUDENT HERO TOP HEADER (المنصة المخصصة للطلاب) */}
      {/* ========================================================================= */}
      <div className="relative pt-6 pb-4 overflow-hidden">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          
          {/* Top Badge */}
          <div
            className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full border text-xs font-bold shadow-xl backdrop-blur-md transition-colors ${
              isLight
                ? 'bg-white/90 border-slate-200 text-cyan-800 shadow-slate-200/50'
                : 'bg-slate-900/90 border-slate-800 text-cyan-300 shadow-cyan-950/20'
            }`}
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>البوابة الرقمية المعتمدة للطلاب • Smart Education Authority</span>
          </div>

          {/* Main Title for Students */}
          <h1
            className={`text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.25] transition-colors ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            تعلم واحتراف المواد الدراسية{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500">
              مع صفوة ونخبة المعلمين
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`text-base sm:text-lg max-w-3xl leading-relaxed transition-colors ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            شاهد دروسك بجودة عالية مع حفظ موضع التوقف، حل الامتحانات والواجبات المرفقة بأوراق المفاهيم وقوانين الشرح، واحصل على تصحيح آلي وملاحظات فورية لتطوير مستواك الدراسي.
          </p>

          {/* Quick Real System Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl pt-2">
            <div className={`p-3.5 rounded-2xl border text-center ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/90 border-slate-800'}`}>
              <div className="text-lg sm:text-2xl font-black text-cyan-500">{courses.length} كورس</div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">متاح الآن بالمنصة</div>
            </div>
            <div className={`p-3.5 rounded-2xl border text-center ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/90 border-slate-800'}`}>
              <div className="text-lg sm:text-2xl font-black text-emerald-500">{platforms.length} منصات</div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">معلمين معتمدين</div>
            </div>
            <div className={`p-3.5 rounded-2xl border text-center ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/90 border-slate-800'}`}>
              <div className="text-lg sm:text-2xl font-black text-amber-500">
                مؤمنة 100%
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">بيئة دراسية متكاملة</div>
            </div>
            <div className={`p-3.5 rounded-2xl border text-center ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/90 border-slate-800'}`}>
              <div className="text-lg sm:text-2xl font-black text-sky-500">100%</div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">تفاعل وتصحيح آلي</div>
            </div>
          </div>

          {/* Action CTAs for Students */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4 w-full max-w-2xl mx-auto">
            {primaryPlatform ? (
              <button
                id="btn-hero-primary-platform"
                onClick={() => {
                  setSelectedPlatformId(primaryPlatform.id);
                  setCurrentView('platform_detail');
                }}
                className="w-full sm:w-auto justify-center px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 shadow-xl shadow-cyan-950/40 transition-all duration-300 flex items-center gap-2.5 cursor-pointer hover:scale-[1.02]"
              >
                <GraduationCap className="w-4 sm:w-5 h-4 sm:h-5 text-slate-950 stroke-[2.5]" />
                <span>دخول منصة {primaryPlatform.teacherName} ({primaryPlatform.subject})</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : null}

            <a
              href={WHATSAPP_LINK_STUDENT}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto justify-center px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl font-black text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-950/30 transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 sm:w-5 h-4 sm:h-5 fill-white" />
              <span>استفسار الطلاب: {WHATSAPP_NUMBER}</span>
            </a>

            {!currentUser && (
              <button
                id="btn-hero-login"
                onClick={() => setIsAuthModalOpen(true)}
                className={`w-full sm:w-auto justify-center px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl font-bold text-xs border shadow-lg transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  isLight
                    ? 'bg-sky-50 hover:bg-sky-100 text-sky-900 border-sky-200'
                    : 'bg-sky-950/40 hover:bg-sky-900/40 text-sky-300 border-sky-800/40'
                }`}
              >
                <Sparkles className="w-4 h-4 text-sky-500" />
                <span>تسجيل الدخول / حساب طالب جديد</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: STUDENT COURSES DIRECTORY & GRADE FILTERS */}
      {/* ========================================================================= */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6 border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-500 font-bold text-xs mb-1">
              <BookOpen className="w-4 h-4" />
              <span>دليل المحاضرات والكورسات المتاحة</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              اختر صفك الدراسي وابدأ المشاهدة والتعلم
            </h2>
            <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              جميع الكورسات تتضمن محاضرات فيديو، ملخصات PDF، امتحانات بأسئلة تفاعلية، وتكليفات للحل.
            </p>
          </div>

          {/* Grade Level Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setSelectedGradeFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedGradeFilter === 'all'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              كافة المراحل
            </button>
            <button
              onClick={() => setSelectedGradeFilter('الصف الثالث الثانوي')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedGradeFilter === 'الصف الثالث الثانوي'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              الصف الثالث الثانوي
            </button>
            <button
              onClick={() => setSelectedGradeFilter('الصف الثاني الثانوي')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedGradeFilter === 'الصف الثاني الثانوي'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              الصف الثاني الثانوي
            </button>
            <button
              onClick={() => setSelectedGradeFilter('الصف الأول الثانوي')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedGradeFilter === 'الصف الأول الثانوي'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              الصف الأول الثانوي
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الكورس، أستاذ المادة، أو عنوان الدرس..."
            className={`w-full pr-11 pl-4 py-3.5 rounded-2xl border text-xs sm:text-sm focus:border-cyan-500 focus:outline-none shadow-sm transition-all ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          />
          <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5" />
        </div>

        {/* Courses Cards Grid */}
        {featuredCourses.length === 0 ? (
          <div className={`p-10 rounded-3xl border text-center ${isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40 text-cyan-500" />
            <p className="font-black text-sm">لا توجد كورسات مطابقة لخيارات البحث حالياً</p>
            <p className="text-xs text-slate-400 mt-1">جرّب إلغاء تصفية المرحلة الدراسية أو كتابة كلمة بحث مختلفة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map(({ course, platform }) => {
              const isBestSeller = (course.enrolledCount || 0) > 0;
              return (
                <div
                  key={course.id}
                  onClick={() => {
                    if (platform) setSelectedPlatformId(platform.id);
                    setSelectedCourseId(course.id);
                    setCurrentView('course_detail');
                  }}
                  className={`rounded-3xl border shadow-xl overflow-hidden flex flex-col justify-between cursor-pointer transition-all duration-300 group hover:-translate-y-1.5 ${
                    isLight
                      ? 'bg-white border-slate-200 hover:border-cyan-400 shadow-slate-200/60'
                      : 'bg-slate-900 border-slate-800 hover:border-cyan-500/50'
                  }`}
                >
                  <div>
                    {/* Thumbnail & Badges */}
                    <div className="relative h-52 overflow-hidden bg-slate-950">
                      <img
                        src={course.thumbnail || DEFAULT_COURSE_COVER}
                        alt={course.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = DEFAULT_COURSE_COVER;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      
                      {/* Price Badge */}
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-xl text-xs font-black bg-sky-400 text-slate-950 shadow-md">
                        {course.isFree ? 'مجاني 100%' : `${course.price} ج.م`}
                      </div>

                      {/* Best Seller / Flagship Badge */}
                      <div className="absolute top-3 left-3">
                        {isBestSeller ? (
                          <span className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-amber-400 text-slate-950 shadow-md flex items-center gap-1">
                            <Sparkles className="w-3 h-3 fill-slate-950" />
                            <span>كورس متميز وموصى به ⭐</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-cyan-500 text-slate-950 shadow-md flex items-center gap-1">
                            <Sparkles className="w-3 h-3 fill-slate-950" />
                            <span>كورس المنصة الرئيسي</span>
                          </span>
                        )}
                      </div>

                      {/* Teacher & Grade Overlay */}
                      <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs font-bold text-white/95">
                        <div className="flex items-center gap-2">
                          <img
                            src={platform.teacherAvatar}
                            alt={platform.teacherName}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover border border-white/80"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <span className="truncate max-w-[130px]">{platform.teacherName}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-[11px]">
                          {course.gradeLevel}
                        </span>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400">
                        <span>مادة {platform.subject}</span>
                        <span className="text-slate-400 text-[11px]">
                          {course.curriculumType === 'azhar' ? 'أزهر' : course.curriculumType === 'international' ? 'لغات' : 'ثانوية عامة'}
                        </span>
                      </div>
                      
                      <h3 className={`text-base font-black line-clamp-1 group-hover:text-cyan-500 transition-colors ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {course.title}
                      </h3>
                      {course.subtitle && (
                        <p className="text-xs text-sky-600 dark:text-sky-400 line-clamp-1 font-semibold">
                          {course.subtitle}
                        </p>
                      )}
                      <p className={`text-xs line-clamp-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {course.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className={`p-5 pt-3 border-t flex items-center justify-between text-xs ${isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-sky-500" />
                      <span>{course.totalDurationMinutes || 180} دقيقة</span>
                    </span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-black flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform">
                      <span>دخول الكورس والتسجيل</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: FEATURED TEACHER PLATFORM SPOTLIGHT */}
      {/* ========================================================================= */}
      {primaryPlatform && (
        <div
          className={`p-8 sm:p-10 rounded-3xl border shadow-2xl relative overflow-hidden transition-all ${
            isLight
              ? 'bg-gradient-to-br from-sky-50 via-white to-cyan-50 border-sky-200 shadow-sky-100/50'
              : 'bg-gradient-to-br from-sky-950/80 via-slate-900 to-slate-950 border-sky-800/50 shadow-cyan-950/30'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left/Main Column: Platform Overview */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1 rounded-full text-xs font-black bg-sky-500 text-slate-950 flex items-center gap-1.5 shadow-md">
                  <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                  المنصة التعليمية المعتمدة
                </span>
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                  مادة {primaryPlatform.subject}
                </span>
              </div>

              <div>
                <h2 className={`text-2xl sm:text-4xl font-black leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {primaryPlatform.name}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <p className="text-sm sm:text-base font-bold text-sky-600 dark:text-sky-300">
                    تقديم الأستاذ {primaryPlatform.teacherName} — {primaryPlatform.teacherTitle}
                  </p>
                  {Boolean(primaryPlatform.teacherBio || primaryPlatform.teacherExperienceYears) && (
                    <button
                      type="button"
                      onClick={() => setViewingTeacherPlatform(primaryPlatform)}
                      className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>نبذة وخبرات المعلم</span>
                    </button>
                  )}
                </div>
              </div>

              <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                {primaryPlatform.teacherBio}
              </p>

              {/* Platform Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {primaryPlatform.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 text-xs font-semibold p-2.5 rounded-xl border ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-700'
                        : 'bg-slate-900/90 border-slate-800 text-slate-200'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="line-clamp-1">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Direct Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => {
                    setSelectedPlatformId(primaryPlatform.id);
                    setCurrentView('platform_detail');
                  }}
                  className="px-8 py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-300 hover:to-cyan-300 text-slate-950 shadow-xl shadow-cyan-950/30 transition-all flex items-center gap-2.5 cursor-pointer"
                >
                  <GraduationCap className="w-5 h-5 stroke-[2.5]" />
                  <span>دخول منصة {primaryPlatform.teacherName} وعرض المحتوى</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: Platform Visual Card */}
            <div className="lg:col-span-5">
              <div
                className={`p-6 rounded-3xl border shadow-xl relative overflow-hidden space-y-4 ${
                  isLight
                    ? 'bg-white border-sky-100 shadow-sky-100/60'
                    : 'bg-slate-900/95 border-slate-800 shadow-slate-950'
                }`}
              >
                <div className="relative h-48 rounded-2xl overflow-hidden shadow-md">
                  <img
                    src={primaryPlatform.bannerImage}
                    alt={primaryPlatform.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-3 right-3 flex items-center gap-3">
                    <img
                      src={primaryPlatform.teacherAvatar}
                      alt={primaryPlatform.teacherName}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-lg"
                    />
                    <div className="text-white">
                      <p className="text-sm font-black">{primaryPlatform.teacherName}</p>
                      <p className="text-xs text-sky-300">{primaryPlatform.subject}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>المادة التعليمية:</span>
                    <span className="font-black text-sky-600 dark:text-sky-400">{primaryPlatform.subject}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>الكورسات المتاحة:</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">
                      {courses.filter(c => c.platformId === primaryPlatform.id).length} كورس
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>تقييم المنصة:</span>
                    <span className="font-black text-amber-500 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {primaryPlatform.rating} / 5.0
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: DEEP STUDENT LEARNING EXPERIENCE SHOWCASE (المزايا التقنية للطالب) */}
      {/* ========================================================================= */}
      <div className="space-y-8">
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold border border-cyan-500/20">
            <Zap className="w-4 h-4" />
            <span>تجربة تعلم متطورة بدون تعقيد</span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
            كل ما يحتاجه الطالب المتفوق في مكان واحد
          </h2>
          <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            مصممة بعناية فائقة لتوفير بيئة تعليمية هادئة وسريعة وبدون أي مشتتات
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Video Player */}
          <div
            className={`p-7 rounded-3xl border shadow-xl space-y-4 transition-all hover:-translate-y-1 ${
              isLight ? 'bg-white border-slate-200 shadow-slate-100' : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center font-bold">
              <Video className="w-6 h-6" />
            </div>
            <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              مشغل دروس محمي مع تذكر التوقف
            </h3>
            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              مشاهدة مرئية نقية تدعم جودات متعددة، التحكم في السرعة، وتحديد موضع التوقف التلقائي لكل درس لاستكمال المذاكرة فوراً من أي جهاز.
            </p>
          </div>

          {/* Card 2: Exams with Concept Sheets */}
          <div
            className={`p-7 rounded-3xl border shadow-xl space-y-4 transition-all hover:-translate-y-1 ${
              isLight ? 'bg-white border-slate-200 shadow-slate-100' : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              امتحانات تفاعلية وأوراق المفاهيم
            </h3>
            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              نافذة جانبية مخصصة لعرض ورقة المفاهيم والقوانين أثناء الحل، مع تصحيح آلي فوري، وتوضيح الإجابة النموذجية فور تسليم الامتحان.
            </p>
          </div>

          {/* Card 3: Wallet & Charging */}
          <div
            className={`p-7 rounded-3xl border shadow-xl space-y-4 transition-all hover:-translate-y-1 ${
              isLight ? 'bg-white border-slate-200 shadow-slate-100' : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              شحن المحفظة وشفرات السنتر (16 رقم)
            </h3>
            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              إمكانية الشحن الإلكتروني الفوري عبر فودافون كاش وإنستا باي، أو كتابة كود الاشتراك المطبوع من السنتر (16 رقم) لتفعيل المحاضرات فوراً.
            </p>
          </div>

          {/* Card 4: Homework Submission */}
          <div
            className={`p-7 rounded-3xl border shadow-xl space-y-4 transition-all hover:-translate-y-1 ${
              isLight ? 'bg-white border-slate-200 shadow-slate-100' : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-500/15 text-sky-500 flex items-center justify-center font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              تسليم الواجبات ورصد الملاحظات
            </h3>
            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              رفع إجابات الواجبات المقالية والتطبيقية، مع إمكانية مراجعة الدرجات ورصد ملحوظات معلم المادة لتطوير خطتك الدراسية.
            </p>
          </div>

          {/* Card 5: Lecture Notes */}
          <div
            className={`p-7 rounded-3xl border shadow-xl space-y-4 transition-all hover:-translate-y-1 ${
              isLight ? 'bg-white border-slate-200 shadow-slate-100' : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center font-bold">
              <FileCode className="w-6 h-6" />
            </div>
            <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              تدوين الملاحظات والأسئلة الخاصة
            </h3>
            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              حفظ نوتس وملاحظات الشرح المرتبطة بثانية المشاهدة داخل كل درس، مع إمكانية توجيه الأسئلة لمساعدي المعلم والرد المباشر.
            </p>
          </div>

          {/* Card 6: Account Protection */}
          <div
            className={`p-7 rounded-3xl border shadow-xl space-y-4 transition-all hover:-translate-y-1 ${
              isLight ? 'bg-white border-slate-200 shadow-slate-100' : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center font-bold">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              ربط الحساب بجهاز الطالب
            </h3>
            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              حماية خصوصيتك واشتراكك بربط الحساب تلقائياً بجهازك الخاص لضمان عدم خروج الحساب أو تداخله مع أي أجهزة أخرى.
            </p>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: STUDENT & GUARDIAN FAQ SECTION */}
      {/* ========================================================================= */}
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold border border-sky-500/20">
            <HelpCircle className="w-4 h-4" />
            <span>الأسئلة الشائعة للطلاب وأولياء الأمور</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
            كل ما تريد معرفته عن نظام SEA
          </h2>
        </div>

        <div className="space-y-3">
          {studentFaqs.map((faq, index) => {
            const isOpen = activeFaqIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isLight
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaqIndex(isOpen ? null : index)}
                  className="w-full p-5 text-right font-black text-xs sm:text-sm flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className={isLight ? 'text-slate-900' : 'text-white'}>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-cyan-500 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className={`p-5 pt-0 text-xs sm:text-sm leading-relaxed border-t border-dashed ${
                    isLight ? 'border-slate-100 text-slate-600' : 'border-slate-800 text-slate-300'
                  }`}>
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 6 (BOTTOM LOWER SECTION): DEDICATED TEACHER & CENTER PLATFORM SECTION */}
      {/* (قسم المعلمين والسناتر - في أسفل الصفحة الرئيسية حسب طلب المستخدم) */}
      {/* ========================================================================= */}
      <div
        id="section-teachers-launch"
        className={`p-8 sm:p-12 rounded-3xl border shadow-2xl relative overflow-hidden transition-all mt-16 ${
          isLight
            ? 'bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-950 text-white border-cyan-800 shadow-cyan-950/20'
            : 'bg-gradient-to-br from-[#060b18] via-[#09152a] to-[#040814] text-white border-cyan-500/30 shadow-2xl shadow-cyan-950/50'
        }`}
      >
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          
          {/* Header & Main Call to Action */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/10 pb-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-black">
                <Building className="w-4 h-4 text-cyan-400" />
                <span>خاص بالمعلمين وأصحاب المراكز والسناتر التعليمية</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black leading-tight text-white">
                هل أنت معلم أو صاحب سنتر تعليمي وتريد إطلاق منصتك الرقمية الخاصة داخل نظام SEA؟
              </h2>
              <p className="text-xs sm:text-sm text-cyan-100/80 leading-relaxed">
                نوفر لك منصة تعليمية رقمية متكاملة تدار بالكامل باسمك وشعارك، مع نظام حماية الفيديوهات من التسريب، إصدار أكواد الشحن المطبوعة للسنتر، وبنك أسئلة متكامل.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <a
                href={WHATSAPP_LINK_TEACHER}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>حجز المنصة عبر الواتساب: {WHATSAPP_NUMBER}</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setCurrentView('rental_form');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileCode className="w-4 h-4" />
                <span>تعبئة طلب استئجار منصة</span>
              </button>
            </div>
          </div>

          {/* Teacher Capabilities & Platform Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white">حماية الفيديوهات والعلامة المائية</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                طباعة متحركة لاسم ورقم هاتف الطالب عبر شاشة المحاضرة لمنع التسريب وحظر كافة برامج وتسجيلات الشاشة.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white">إصدار أكواد الشحن المطبوعة (16 رقم)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                إنشاء وإدارة دفعة كروت شحن مطبوعة ومحمية برمز مكون من 16 رقم لبيعها لطلاب السنتر وتسهيل الاشتراك.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white">امتحانات وبنك أسئلة مع أوراق المفاهيم</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                إضافة بنك أسئلة تصنيفي، امتحانات محددة بوقت، ربط ورقة المفاهيم، ومنع الغش بتقييد ملء الشاشة والتصحيح الآلي.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white">ربط جهاز الطالب والأجهزة المسموحة</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                ربط أوتوماتيكي لجهاز الطالب لمنع مشاركة وتداول الحسابات، مع لوحة للتحكم وإلغاء الربط عند الضرورة.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white">حسابات خاصة لمساعدي المعلم</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                تخصيص حسابات لمساعديك لمتابعة غياب وحضور الطلاب، تصحيح الواجبات المقالية، وإرسال التقارير لأولياء الأمور.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white">دعم فني وتجهيز المنصة خلال ساعات</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                فريق مهندسين متكامل لتجهيز وإطلاق منصتك باسمك وشعارك وسيرفراتك خلال أقل من 24 ساعة مع متابعة دورية.
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* Teacher Profile & Professional Info Modal */}
      {viewingTeacherPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-right">
          <div
            className={`w-full max-w-2xl rounded-3xl p-6 sm:p-8 border shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <img
                  src={viewingTeacherPlatform.teacherAvatar}
                  alt={viewingTeacherPlatform.teacherName}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black">{viewingTeacherPlatform.teacherName}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 text-xs font-bold">
                      معلم معتمد
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                    {viewingTeacherPlatform.teacherTitle} — {viewingTeacherPlatform.subject}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingTeacherPlatform(null)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Profile Content */}
            <div className="space-y-4">
              {viewingTeacherPlatform.teacherBio && (
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800/80'}`}>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 flex items-center gap-1.5">
                    <span>📖</span>
                    <span>النبذة التعريفية:</span>
                  </span>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                    {viewingTeacherPlatform.teacherBio}
                  </p>
                </div>
              )}

              {viewingTeacherPlatform.teacherExperienceYears && (
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-amber-50/50 border-amber-200' : 'bg-amber-950/20 border-amber-500/30'}`}>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300 block mb-1.5 flex items-center gap-1.5">
                    <span>⏳</span>
                    <span>مدة وسنوات الخبرة والتدريس:</span>
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {viewingTeacherPlatform.teacherExperienceYears}
                  </p>
                </div>
              )}

              {viewingTeacherPlatform.teacherCertificates && (
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/30'}`}>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block mb-1.5 flex items-center gap-1.5">
                    <span>📜</span>
                    <span>الشهادات والمؤهلات العلمية:</span>
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {viewingTeacherPlatform.teacherCertificates}
                  </p>
                </div>
              )}

              {viewingTeacherPlatform.teacherHighlights && (
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-sky-50/50 border-sky-200' : 'bg-sky-950/20 border-sky-500/30'}`}>
                  <span className="text-xs font-bold text-sky-700 dark:text-sky-300 block mb-1.5 flex items-center gap-1.5">
                    <span>🌟</span>
                    <span>أبرز ما يميز الأسلوب وطريقة الشرح:</span>
                  </span>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                    {viewingTeacherPlatform.teacherHighlights}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const id = viewingTeacherPlatform.id;
                  setViewingTeacherPlatform(null);
                  setSelectedPlatformId(id);
                  setCurrentView('platform_detail');
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-300 hover:to-cyan-300 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <span>الانتقال لمنصة المعلم</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setViewingTeacherPlatform(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

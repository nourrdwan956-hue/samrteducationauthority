import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { EducationalPlatform, Course } from '../types';
import { FALLBACK_PLATFORM } from '../data/mockData';
import { DEFAULT_COURSE_COVER } from './teacher/CourseCoverUploader';
import {
  Sparkles,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  GraduationCap,
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
  Check,
  Phone,
  Calendar,
  Hammer,
  Cpu,
  Globe,
  ArrowUpRight,
  Shield,
  Briefcase,
  Layers,
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
  
  // Hierarchical Smart Filtering States: Stage -> Class / Grade -> Education Type -> Instructor
  const [selectedStage, setSelectedStage] = useState<string>('all'); // 'all', 'secondary', 'preparatory', 'primary'
  const [selectedClass, setSelectedClass] = useState<string>('all'); // 'all', 'sec_3', 'sec_2', 'sec_1', 'prep_3', etc.
  const [selectedEduType, setSelectedEduType] = useState<string>('all'); // 'all', 'general', 'azhar', 'international'
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>('all'); // 'all' or instructorId/name

  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  // Check if a student recently submitted their registration and is waiting for review
  const pendingStudent = useMemo(() => {
    if (currentUser?.accountStatus === 'pending_review') {
      return {
        name: currentUser.name,
        studentCode: currentUser.studentCode,
      };
    }
    try {
      const raw = localStorage.getItem('sea_pending_student');
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      return null;
    }
    return null;
  }, [currentUser]);

  const CONTACT_NUMBER = '011';
  const WHATSAPP_LINK_INQUIRIES = `https://wa.me/2011?text=${encodeURIComponent('السلام عليكم، أود الاستفسار عن تفاصيل منظومة SEA التعليمية')}`;

  // Primary platform (English)
  const primaryPlatform = platforms[0] || null;

  // Hierarchical available stages, classes, and education systems
  const educationalStages = [
    { id: 'all', name: 'كافة المراحل التعليمية', icon: '🏫', badge: 'شامل' },
    { id: 'secondary', name: 'المرحلة الثانوية', icon: '🎓', badge: '3 صفوف' },
    { id: 'preparatory', name: 'المرحلة الإعدادية', icon: '📚', badge: '3 صفوف' },
    { id: 'primary', name: 'المرحلة الابتدائية', icon: '✏️', badge: 'تأسيس' },
  ];

  const classOptionsByStage: Record<string, { id: string; name: string; stageId: string }[]> = {
    secondary: [
      { id: 'sec_3', name: 'الصف الثالث الثانوي (3 ث)', stageId: 'secondary' },
      { id: 'sec_2', name: 'الصف الثاني الثانوي (2 ث)', stageId: 'secondary' },
      { id: 'sec_1', name: 'الصف الأول الثانوي (1 ث)', stageId: 'secondary' },
    ],
    preparatory: [
      { id: 'prep_3', name: 'الصف الثالث الإعدادي (3 ع)', stageId: 'preparatory' },
      { id: 'prep_2', name: 'الصف الثاني الإعدادي (2 ع)', stageId: 'preparatory' },
      { id: 'prep_1', name: 'الصف الأول الإعدادي (1 ع)', stageId: 'preparatory' },
    ],
    primary: [
      { id: 'prim_6', name: 'الصف السادس الابتدائي', stageId: 'primary' },
      { id: 'prim_5', name: 'الصف الخامس الابتدائي', stageId: 'primary' },
      { id: 'prim_4', name: 'الصف الرابع الابتدائي', stageId: 'primary' },
    ],
  };

  const educationTypes = [
    { id: 'all', name: 'كافة نظم التعليم', desc: 'عام / لغات / أزهر' },
    { id: 'general', name: 'تعليم عام (عربي)', desc: 'مدارس عامة ورسمية' },
    { id: 'international', name: 'لغات وتجريبي', desc: 'English / Science / Math' },
    { id: 'azhar', name: 'أزهر شريف', desc: 'المعاهد الأزهرية النموذجية' },
  ];

  // Map class option ID to matching text keywords in course.gradeLevel or course.title
  const matchesClassFilter = (courseGrade: string = '', courseTitle: string = '', classId: string): boolean => {
    if (classId === 'all') return true;
    const text = `${courseGrade} ${courseTitle}`.toLowerCase();
    if (classId === 'sec_3') return text.includes('ثالث') && text.includes('ثانو') || text.includes('3 ثانوي') || text.includes('3ث');
    if (classId === 'sec_2') return text.includes('ثاني') && text.includes('ثانو') || text.includes('2 ثانوي') || text.includes('2ث');
    if (classId === 'sec_1') return text.includes('أول') && text.includes('ثانو') || text.includes('1 ثانوي') || text.includes('1ث');
    if (classId === 'prep_3') return text.includes('ثالث') && text.includes('إعداد') || text.includes('3 إعدادي');
    if (classId === 'prep_2') return text.includes('ثاني') && text.includes('إعداد') || text.includes('2 إعدادي');
    if (classId === 'prep_1') return text.includes('أول') && text.includes('إعداد') || text.includes('1 إعدادي');
    if (classId === 'prim_6') return text.includes('سادس') && text.includes('ابتدائ');
    if (classId === 'prim_5') return text.includes('خامس') && text.includes('ابتدائ');
    if (classId === 'prim_4') return text.includes('رابع') && text.includes('ابتدائ');
    return false;
  };

  // Map stage ID to matching text keywords
  const matchesStageFilter = (courseStage: string = '', courseGrade: string = '', courseTitle: string = '', stageId: string): boolean => {
    if (stageId === 'all') return true;
    if (courseStage === stageId) return true;
    const text = `${courseGrade} ${courseTitle}`.toLowerCase();
    if (stageId === 'secondary') return text.includes('ثانو') || text.includes('ث ');
    if (stageId === 'preparatory') return text.includes('إعداد') || text.includes('اعداد');
    if (stageId === 'primary') return text.includes('ابتدائ');
    return false;
  };

  // Real available published courses for students/visitors matching the hierarchical criteria
  const featuredCourses = useMemo(() => {
    const list: { course: Course; platform: EducationalPlatform }[] = [];
    const q = searchQuery.trim().toLowerCase();

    courses.forEach((course) => {
      // Find associated platform or fallback
      const platform =
        platforms.find((p) => p.id === course.platformId) ||
        platforms[0] ||
        FALLBACK_PLATFORM;

      // Allow published courses
      const isCoursePublished =
        course.status === 'published' || course.isPublished !== false;

      if (!isCoursePublished) return;

      const courseTitle = (course.title || '').toLowerCase();
      const courseSubject = (course.subject || '').toLowerCase();
      const platformSubject = (platform.subject || '').toLowerCase();
      const courseDesc = (course.description || '').toLowerCase();
      const teacherName = (platform.teacherName || '').toLowerCase();
      const courseTags = (course.tags || []).map((t) => t.toLowerCase());

      // 1. Text Search Query - Strict Subject Logic
      let matchesQuery = true;
      if (q !== '') {
        const knownSubjects = [
          'رياضيات',
          'رياضة',
          'عربي',
          'لغة عربية',
          'إنجليزي',
          'انجليزي',
          'لغة إنجليزية',
          'لغة انجليزية',
          'english',
          'علوم',
          'أحياء',
          'احياء',
          'كيمياء',
          'فيزياء',
          'تاريخ',
          'جغرافيا',
          'فلسفة',
          'فرنساوي',
          'لغة فرنسية',
          'دراسات',
        ];
        const isSubjectQuery = knownSubjects.some((sub) => q.includes(sub));

        if (isSubjectQuery) {
          // Strict search: course MUST match the subject
          matchesQuery =
            courseSubject.includes(q) ||
            platformSubject.includes(q) ||
            courseTitle.includes(q) ||
            courseTags.some((t) => t.includes(q));
        } else {
          // General search
          matchesQuery =
            courseTitle.includes(q) ||
            courseSubject.includes(q) ||
            platformSubject.includes(q) ||
            teacherName.includes(q) ||
            courseDesc.includes(q) ||
            courseTags.some((t) => t.includes(q));
        }
      }

      // 2. Stage Filter
      const matchesStage = matchesStageFilter(
        course.stage,
        course.gradeLevel,
        course.title,
        selectedStage
      );

      // 3. Class Filter
      const matchesClass = matchesClassFilter(
        course.gradeLevel,
        course.title,
        selectedClass
      );

      // 4. Education Type Filter
      const matchesType =
        selectedEduType === 'all' ||
        course.curriculumType === selectedEduType ||
        (!course.curriculumType && selectedEduType === 'general');

      // 5. Instructor / Teacher Filter
      const matchesTeacher =
        selectedTeacherFilter === 'all' ||
        teacherName === selectedTeacherFilter.toLowerCase() ||
        platform.id === selectedTeacherFilter;

      if (matchesQuery && matchesStage && matchesClass && matchesType && matchesTeacher) {
        list.push({ course, platform });
      }
    });

    return list.sort(
      (a, b) => (b.course.enrolledCount || 0) - (a.course.enrolledCount || 0)
    );
  }, [
    platforms,
    courses,
    searchQuery,
    selectedStage,
    selectedClass,
    selectedEduType,
    selectedTeacherFilter,
  ]);

  // List of active instructors for quick filtering
  const activeInstructorsList = useMemo(() => {
    const map = new Map<string, { name: string; subject: string; count: number }>();
    platforms.forEach((p) => {
      if (p.teacherName) {
        const cCount = courses.filter((c) => c.platformId === p.id && (c.status === 'published' || c.isPublished !== false)).length;
        map.set(p.teacherName, { name: p.teacherName, subject: p.subject, count: cCount });
      }
    });
    return Array.from(map.values());
  }, [platforms, courses]);

  // Subject List as specified by user
  const subjectsData = [
    {
      id: 'english',
      name: 'اللغة الإنجليزية',
      nameEn: 'English Language',
      status: 'coming_soon',
      desc: 'قيد التجهيز والمراجعة الأكاديمية لتقديم محتوى تعليمي تفاعلي متكامل للطلاب.',
      color: 'from-cyan-500 to-blue-600',
      tag: 'جاري الانتهاء من الإعداد',
      launchDate: 'قيد التجهيز',
      accentColor: 'blue',
    },
    {
      id: 'arabic',
      name: 'اللغة العربية',
      nameEn: 'Arabic Language',
      status: 'coming_soon',
      desc: 'قيد التجهيز الأكاديمي بواسطة خبراء وموجهي المادة لتقديم تجربة تعليمية شاملة في البلاغة، النحو، والأدب.',
      color: 'from-emerald-500 to-teal-600',
      tag: 'مجدول للإطلاق في أكتوبر 2026',
      launchDate: 'أكتوبر 2026',
      accentColor: 'green',
    },
    {
      id: 'math',
      name: 'الرياضيات',
      nameEn: 'Mathematics',
      status: 'coming_soon',
      desc: 'بنية حسابية مبسطة للقوانين الهندسية والجبرية معززة ببنوك الأسئلة وأوراق المفاهيم التفاعلية.',
      color: 'from-blue-600 to-indigo-600',
      tag: 'مجدول للإطلاق في ديسمبر 2026',
      launchDate: 'ديسمبر 2026',
      accentColor: 'blue',
    },
    {
      id: 'sciences',
      name: 'العلوم',
      nameEn: 'Sciences',
      status: 'coming_soon',
      desc: 'شرح تطبيقي وتفاعلي لتبسيط فروع الفيزياء، الكيمياء، والأحياء.',
      color: 'from-rose-500 to-red-600',
      tag: 'مجدول للإطلاق في فبراير 2027',
      launchDate: 'فبراير 2027',
      accentColor: 'red',
    },
    {
      id: 'integrated_sciences',
      name: 'العلوم المتكاملة',
      nameEn: 'Integrated Sciences',
      status: 'coming_soon',
      desc: 'المفهوم الحديث للعلوم الشاملة والمصمم خصيصاً لمواكبة أحدث معايير المناهج التعليمية المعتمدة.',
      color: 'from-emerald-600 to-cyan-600',
      tag: 'مجدول للإطلاق في أبريل 2027',
      launchDate: 'أبريل 2027',
      accentColor: 'green',
    },
    {
      id: 'social_studies',
      name: 'الدراسات الاجتماعية',
      nameEn: 'Social Studies',
      status: 'coming_soon',
      desc: 'رحلة معرفية تفاعلية تعتمد على الفهم التاريخي والجغرافي المعزز بالخرائط الرقمية والجداول التحليلية.',
      color: 'from-amber-600 to-rose-600',
      tag: 'مجدول للإطلاق في يونيو 2027',
      launchDate: 'يونيو 2027',
      accentColor: 'red',
    },
  ];

  const studentFaqs = [
    {
      question: 'كيف يمكن تفعيل المحاضرات والاشتراك بالمنصة؟',
      answer:
        'يمكن للطلاب التسجيل برقم الهاتف والبريد الإلكتروني، وتفعيل الكورسات فورياً باستخدام الأكواد المطبوعة، أو من خلال خيارات الدفع المدمجة في المنصة.',
    },
    {
      question: 'هل يمكنني استخدام حسابي على أجهزة متعددة؟',
      answer:
        'لضمان استقرار الخدمة وتوفير تجربة مخصصة لكل طالب، يتم تسجيل الدخول من جهاز رئيسي واحد يختاره الطالب، لضمان تركيز الطالب ومتابعة تقدمه بدقة.',
    },
    {
      question: 'كيف تعمل ورقة المفاهيم المدمجة داخل الاختبارات والواجبات؟',
      answer:
        'تتيح المنظومة للطالب استعراض الملخصات والقوانين والقواعد الرسمية المعتمدة في نافذة موازية أثناء حل الأسئلة لتوفير الوقت والتركيز الكامل.',
    },
    {
      question: 'هل تدعم المنصة تقارير المتابعة لأولياء الأمور؟',
      answer:
        'نعم، توفر المنصة نظام رصد فوري للدرجات والنسب المئوية لكل واجب واختبار، مع إمكانية عرض تقارير الأداء التفصيلية لولي الأمر لمتابعة تقدم الطالب أولاً بأول.',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-16 sm:space-y-24 text-right relative pb-20 select-none px-3 sm:px-6 lg:px-8">
      
      {/* Dynamic Ambient Background Elements - Minimal & Luxury */}
      <div className="absolute top-[-100px] left-1/4 w-[280px] sm:w-[500px] h-[280px] sm:h-[500px] bg-cyan-500/[0.03] rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute top-[400px] right-10 w-[240px] sm:w-[400px] h-[240px] sm:h-[400px] bg-sky-500/[0.03] rounded-full blur-[90px] sm:blur-[120px] pointer-events-none" />

      {/* ========================================================================= */}
      {/* SECTION 1: OFFICIAL INSTITUTIONAL HERO HEADER */}
      {/* ========================================================================= */}
      <div className="relative pt-3 sm:pt-6 pb-6 overflow-hidden">
        {/* Artistic Student/Teacher Watermark - High Quality & Refined */}
        <div className="absolute top-0 left-0 w-full h-[650px] pointer-events-none flex justify-center items-center opacity-[0.04] dark:opacity-[0.06] -z-10 overflow-hidden select-none">
          <div className="flex justify-between items-center w-full max-w-[1500px] px-3 sm:px-12">
            <img
              src="/student-logo.png"
              alt="Student Watermark"
              className="w-[140px] sm:w-[320px] lg:w-[460px] h-auto object-contain transform -rotate-6 filter drop-shadow-sm"
              loading="lazy"
            />
            <img
              src="/teacher-logo.png"
              alt="Teacher Watermark"
              className="w-[140px] sm:w-[320px] lg:w-[460px] h-auto object-contain transform rotate-6 filter drop-shadow-sm"
              loading="lazy"
            />
          </div>
        </div>

        {/* Pending Review Alert Banner if student submitted registration */}
        {pendingStudent && (
          <div className="mb-8 max-w-4xl mx-auto p-5 rounded-3xl bg-amber-500/10 dark:bg-amber-500/15 border-2 border-amber-500/40 text-amber-900 dark:text-amber-200 shadow-xl backdrop-blur-md animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      طلب مراجعة بياناتك قيد الانتظار
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px]">
                      قيد المراجعة ⏳
                    </span>
                  </div>
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mt-1">
                    سيتم فحص بياناتك ومراجعتها، والرد عليك خلال مدة تبدأ من ساعة وحتى 48 ساعة بحد أقصى.
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-slate-950/60 px-3 py-1.5 rounded-xl border border-amber-500/30">
                  {pendingStudent.name ? `طالب: ${pendingStudent.name.split(' ')[0]}` : 'طلب جديد'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-5xl mx-auto">
          
          {/* Institutional Badge with Crest Aesthetic */}
          <div
            className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full border text-[11px] font-black tracking-wide shadow-sm backdrop-blur-md transition-all duration-300 ${
              isLight
                ? 'bg-slate-100/90 border-slate-200 text-slate-800'
                : 'bg-slate-900/90 border-slate-800 text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-cyan-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            <span>البوابة الرسمية المعتمدة لمنظومة المدارس والمنصات الذكية • SEA Education Group</span>
          </div>

          {/* Master Display Headline - Structured, Highly Professional */}
          <div className="space-y-4">
            <h1
              className={`text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.3] transition-colors ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              منظومة <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600 font-extrabold">SEA لإدارة المحتوى والمنصات التعليمية</span>
            </h1>
            <p className="text-base sm:text-xl font-bold text-cyan-600 dark:text-cyan-400 max-w-3xl mx-auto">
              بالتعاون مع نخبة من كبار موجهي وخبراء المواد الدراسية
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-cyan-500 to-sky-500 mx-auto rounded-full" />
          </div>

          <p
            className={`text-sm sm:text-lg max-w-3xl leading-relaxed font-medium transition-colors ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            بنية تعليمية متكاملة تهدف إلى دعم الطلاب وتيسير استيعاب المناهج الدراسية، عبر محاضرات تفاعلية منظمة، ومذكرات دراسية، واختبارات دورية مع تقارير متابعة لأولياء الأمور.
          </p>

          {/* Institutional Quick Action Center */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 pt-4 w-full max-w-2xl mx-auto">
            {primaryPlatform ? (
              <button
                id="btn-hero-primary-platform"
                onClick={() => {
                  setSelectedPlatformId(primaryPlatform.id);
                  setCurrentView('platform_detail');
                }}
                className="w-full sm:w-auto px-8 py-4.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-slate-900 to-slate-950 dark:from-sky-400 dark:to-cyan-400 hover:opacity-90 text-white dark:text-slate-950 shadow-lg shadow-cyan-500/10 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer hover:scale-[1.01]"
              >
                <GraduationCap className="w-5 h-5 text-cyan-400 dark:text-slate-950 stroke-[2.5]" />
                <span>دخول منصة مادة {primaryPlatform.subject} ({primaryPlatform.teacherName})</span>
                <ArrowLeft className="w-4 h-4 text-cyan-400 dark:text-slate-950" />
              </button>
            ) : null}

            {!currentUser && (
              <button
                id="btn-hero-login"
                onClick={() => setIsAuthModalOpen(true)}
                className={`w-full sm:w-auto px-7 py-4.5 rounded-xl font-black text-xs sm:text-sm border shadow-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                    : 'bg-slate-900/60 hover:bg-slate-900 text-slate-200 border-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-cyan-500" />
                <span>إنشاء حساب أكاديمي / تسجيل الدخول</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: STATELY UNDER DEVELOPMENT ROADMAP & DESIGNER NOUR EL-SAEED */}
      {/* ========================================================================= */}
      <div className="relative">
        <div
          className={`p-8 sm:p-12 rounded-3xl border relative overflow-hidden transition-all duration-500 ${
            isLight
              ? 'bg-slate-50/80 border-slate-200/80 shadow-md'
              : 'bg-slate-900/30 border-slate-800/80 shadow-2xl'
          }`}
        >
          {/* Top-right subtle blueprint motif */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.02] border-b border-l border-dashed border-cyan-500/10 rounded-bl-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            <div className="lg:col-span-8 space-y-6">
              
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-black border border-cyan-500/20">
                <Calendar className="w-4 h-4" />
                <span>خارطة طريق التطوير التقني والتربوي</span>
              </div>
              
              <div className="space-y-3">
                <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  بيان رسمي: <span className="text-cyan-500 font-extrabold">المنظومة في مرحلة التطوير والتحسين المستمر</span>
                </h2>
                <div className="w-20 h-1 bg-cyan-500 rounded" />
              </div>
              
              <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                بخطى ثابتة ورؤية طموحة، نعلن أن المنظومة قيد البناء والاختبار الفني اليومي لضمان ثباتها وكفاءتها القصوى. يتم تنفيذ وتوجيه الأعمال البرمجية والتصميمية والهندسة العتادية يومياً بواسطة المطور والمصمم الرئيسي للمشروع:
                <span className="font-extrabold text-cyan-500 dark:text-cyan-400 mx-1.5">Nour El-Saeed (Nour Mohamed El-Saeed)</span> 
                تحت إشراف مباشر وتنسيق كامل مع كوكبة متميزة من الخبراء والموجهين التربويين لضمان دقة وملائمة المنهج والمحتوى العلمي للطلاب.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="text-xs text-slate-400 mb-1">📅 الإطلاق والتدشين الرسمي المجدول</div>
                  <div className="text-sm font-black text-cyan-500">يوليو 2027 م (إن شاء الله)</div>
                </div>
                <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="text-xs text-slate-400 mb-1">💻 كبير مطوري ومصممي المنظومة</div>
                  <div className="text-sm font-black text-slate-800 dark:text-slate-100 font-mono">Nour Mohamed El-Saeed</div>
                </div>
              </div>
            </div>

            {/* Verification & Trust Side Column */}
            <div className="lg:col-span-4 flex flex-col justify-center">
              <div className={`p-6.5 rounded-2xl border text-right space-y-4 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/90 border-slate-800'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>تأمين مؤسسي متكامل</h4>
                    <p className="text-[10px] text-slate-400">بنية برمجية معتمدة</p>
                  </div>
                </div>
                <ul className="space-y-2 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span>مزامنة سحابية فائقة السرعة للدرجات.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span>توفير المحاضرات بدقة عالية وبشكل مستقر.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span>تحديثات برمجية تلقائية دون تشتيت الطالب.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: THE 6 OFFICIALLY ACCREDITED SUBJECTS */}
      {/* ========================================================================= */}
      <div className="space-y-12">
        <div className="text-center space-y-3.5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-black border border-slate-200 dark:border-slate-700">
            <Layers className="w-3.5 h-3.5" />
            <span>المقررات الأكاديمية الستة المعتمدة</span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            خارطة تخصصات المنظومة التعليمية
          </h2>
          <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            نستعرض المقررات الست المخطط تفعيلها بالمنصة. مع العلم أن تخصص اللغة الإنجليزية هو المكتمل فنياً ويخضع للتطوير الفعلي حالياً.
          </p>
        </div>

        {/* 6 Subjects - Institutional Mathematical Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6.5">
          {subjectsData.map((sub) => {
            const isActive = sub.status === 'active';
            const isBlue = sub.accentColor === 'blue';
            const isGreen = sub.accentColor === 'green';
            const isRed = sub.accentColor === 'red';

            return (
              <div
                key={sub.id}
                className={`p-7 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between group ${
                  isActive
                    ? isLight
                      ? 'bg-white border-cyan-400 shadow-lg shadow-cyan-100/50 hover:shadow-cyan-200/60'
                      : 'bg-slate-900/90 border-cyan-500/40 shadow-2xl hover:border-cyan-400'
                    : isGreen
                    ? isLight
                      ? 'bg-emerald-50/40 border-emerald-200/90 hover:border-emerald-300 shadow-sm'
                      : 'bg-emerald-950/20 border-emerald-900/50 hover:border-emerald-700/60'
                    : isRed
                    ? isLight
                      ? 'bg-rose-50/40 border-rose-200/90 hover:border-rose-300 shadow-sm'
                      : 'bg-rose-950/20 border-rose-900/50 hover:border-rose-700/60'
                    : isLight
                    ? 'bg-blue-50/40 border-blue-200/90 hover:border-blue-300 shadow-sm'
                    : 'bg-blue-950/20 border-blue-900/50 hover:border-blue-700/60'
                }`}
              >
                {/* Discrete Background Watermark: Student Reading & Teacher Lecturing Symbolism */}
                <div className="absolute -left-6 -bottom-6 pointer-events-none opacity-[0.04] dark:opacity-[0.06] select-none">
                  {isBlue || isActive ? (
                    <GraduationCap className="w-36 h-36 text-cyan-600 dark:text-cyan-400" />
                  ) : isGreen ? (
                    <BookOpen className="w-36 h-36 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <ShieldCheck className="w-36 h-36 text-rose-600 dark:text-rose-400" />
                  )}
                </div>

                {/* Thin colored line indicator at the top for neatness */}
                <div className={`absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r ${sub.color}`} />

                <div className="space-y-5 pt-2 relative z-10">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-lg text-[11px] font-black tracking-wide ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950 shadow-sm'
                          : isGreen
                          ? isLight
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                          : isRed
                          ? isLight
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                          : isLight
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                      }`}
                    >
                      {sub.tag}
                    </span>
                    <span className="font-mono text-[10px] font-black text-slate-400">
                      {sub.nameEn}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {sub.name}
                      </h3>
                      <span className={`text-[11px] font-black px-2 py-0.5 rounded ${
                        isActive
                          ? 'text-cyan-600 dark:text-cyan-400'
                          : isGreen
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isRed
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        📅 {sub.launchDate}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {sub.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-5 border-t border-dashed border-slate-200 dark:border-slate-800 mt-6 flex items-center justify-between relative z-10">
                  <span className="text-[10px] font-bold text-slate-400">منظومة SEA الرقمية المعتمدة</span>
                  {isActive && primaryPlatform ? (
                    <button
                      onClick={() => {
                        setSelectedPlatformId(primaryPlatform.id);
                        setCurrentView('platform_detail');
                      }}
                      className="px-4.5 py-2 rounded-lg text-[11px] font-black bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <span>تصفح المنصة النشطة</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className={`text-[11px] font-black flex items-center gap-1 ${
                      isGreen
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isRed
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}>
                      <span>تحت التجهيز</span>
                      <span className="text-[10px] font-normal opacity-80">({sub.launchDate})</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: INSTITUTIONAL MULTI-TENANCY EXPLANATION */}
      {/* ========================================================================= */}
      <div className="relative">
        <div
          className={`p-8 sm:p-12 rounded-3xl border relative overflow-hidden transition-all duration-500 ${
            isLight
              ? 'bg-slate-50/70 border-slate-200/80'
              : 'bg-slate-900/20 border-slate-800/80'
          }`}
        >
          {/* Blueprint background grid effect */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-black border border-cyan-500/20">
                <Cpu className="w-4 h-4" />
                <span>بروتوكول البنية المتعددة للمنصات الأكاديمية</span>
              </div>

              <div className="space-y-3">
                <h3 className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  متاح إنشاء أكثر من منصة مستقلة لنفس المادة الدراسية
                </h3>
                <div className="w-20 h-1 bg-cyan-500" />
              </div>

              <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                تتميز بنية منظومة <span className="font-bold">SEA</span> الرقمية بالمرونة والقدرة على التعددية اللامركزية الكاملة.
                <span className="font-bold text-slate-800 dark:text-white mx-1">
                  إذا تم تأسيس منصة لغة إنجليزية لمعلم معين، فإنه يحق لأي معلم آخر تقديم طلب لتأسيس منصة خاصة ومستقلة به بالكامل لنفس المقرر، لتظهر جنباً إلى جنب ضمن قائمة معلمي ومدرسي المادة، وينطبق هذا المفهوم على بقية المواد بالمنظومة.
                </span>
              </p>

              <div className={`p-5 rounded-xl border text-xs sm:text-sm leading-relaxed ${isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                <span className="font-extrabold text-cyan-500 block mb-1">كيف تدعم المنصة التعددية؟</span>
                تعتمد المنصة على بنية تتيح لكل معلم الحصول على لوحة تحكم مستقلة، وقاعدة بيانات طلاب، وسجلات وبنوك أسئلة وفيديوهات محمية منفصلة، مع واجهة مرنة موحدة للطلاب لاختيار المعلم المفضل.
              </div>
            </div>

            <div className="lg:col-span-4 flex items-center justify-center">
              <div className={`p-6 rounded-2xl border w-full max-w-sm space-y-4 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'}`}>
                <div className="text-xs font-bold text-slate-400">سير العمل التعددي للمنصات:</div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                    <div className="text-xs">
                      <div className="font-bold text-slate-800 dark:text-white">طلب ترخيص المعلم</div>
                      <p className="text-slate-400 text-[10px]">تقديم طلب التأسيس وتخصيص المادة.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                    <div className="text-xs">
                      <div className="font-bold text-slate-800 dark:text-white">بناء الخادم المنفصل</div>
                      <p className="text-slate-400 text-[10px]">توليد لوحة تحكم وقاعدة بيانات مستقلة للمعلم.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                    <div className="text-xs">
                      <div className="font-bold text-slate-800 dark:text-white">الإدراج بالقائمة العامة</div>
                      <p className="text-slate-400 text-[10px]">ظهور منصة المعلم للطلاب فوراً وبشكل مخصص.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: ACCREDITED COURSES AND LECTURES DIRECTORY (HIERARCHICAL & SMART) */}
      {/* ========================================================================= */}
      <div id="courses-explorer-section" className="space-y-8">
        
        {/* Header with Title & Reset Button */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6 border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-500 font-bold text-xs mb-1">
              <BookOpen className="w-4 h-4" />
              <span>نظام الفرز الأكاديمي الذكي • Smart Educational Navigator</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              استكشف كورسات ومحاضرات نخبة المعلمين
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              حدد المرحلة الدراسية، ثم الصف الدراسي، ثم نظام التعليم لعرض الكورسات المتوافقة مع أستاذ المادة مباشرة.
            </p>
          </div>

          {(selectedStage !== 'all' || selectedClass !== 'all' || selectedEduType !== 'all' || selectedTeacherFilter !== 'all' || searchQuery.trim() !== '') && (
            <button
              onClick={() => {
                setSelectedStage('all');
                setSelectedClass('all');
                setSelectedEduType('all');
                setSelectedTeacherFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl text-xs font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1.5 self-end md:self-center"
            >
              <span>إعادة ضبط التصفية 🔄</span>
            </button>
          )}
        </div>

        {/* =================================================================== */}
        {/* MULTI-TIER SMART FILTERING CONTROL PANEL (Mobile-friendly & Desktop) */}
        {/* =================================================================== */}
        <div className={`p-4 sm:p-6 rounded-3xl border space-y-6 transition-all ${
          isLight ? 'bg-slate-50/80 border-slate-200 shadow-sm' : 'bg-slate-900/40 border-slate-800 backdrop-blur-md'
        }`}>
          
          {/* STEP 1: Educational Stage Selector (المرحلة التعليمية) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px] font-black">1</span>
                <span>المرحلة التعليمية:</span>
              </label>
              {selectedStage !== 'all' && (
                <span className="text-[10px] font-bold text-cyan-500">تم تحديد المرحلة</span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {educationalStages.map((stg) => {
                const isSelected = selectedStage === stg.id;
                return (
                  <button
                    key={stg.id}
                    onClick={() => {
                      setSelectedStage(stg.id);
                      setSelectedClass('all'); // reset sub-class when stage changes
                    }}
                    className={`p-3 sm:p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md scale-[1.01]'
                        : isLight
                        ? 'bg-white hover:bg-slate-100/80 border-slate-200 text-slate-800'
                        : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-base sm:text-lg">{stg.icon}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-slate-950/20 text-slate-950'
                          : 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'
                      }`}>
                        {stg.badge}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-black truncate">{stg.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Grade / Class Selector (الصف الدراسي بناءً على المرحلة) */}
          {selectedStage !== 'all' && classOptionsByStage[selectedStage] && (
            <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800/80 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px] font-black">2</span>
                  <span>الصف الدراسي (السنة):</span>
                </label>
                <span className="text-[10px] font-bold text-slate-400">
                  {selectedClass === 'all' ? 'جميع صفوف هذه المرحلة' : 'محدد'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedClass('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedClass === 'all'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : isLight
                      ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  جميع صفوف المرحلة
                </button>
                {classOptionsByStage[selectedStage].map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      selectedClass === cls.id
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : isLight
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {cls.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 & 4: Education System Type & Teacher Selection Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
            
            {/* Education System Type */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px] font-black">3</span>
                <span>نوع التعليم والمنهج:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {educationTypes.map((edu) => (
                  <button
                    key={edu.id}
                    onClick={() => setSelectedEduType(edu.id)}
                    className={`px-2.5 py-2 rounded-xl text-[11px] font-black text-center transition-all cursor-pointer truncate ${
                      selectedEduType === edu.id
                        ? 'bg-cyan-500 text-slate-950 shadow-sm font-extrabold'
                        : isLight
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                    title={edu.desc}
                  >
                    {edu.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Instructor / Teacher Filter */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px] font-black">4</span>
                <span>تصفية بحسب المعلم المعتمد:</span>
              </label>
              <select
                value={selectedTeacherFilter}
                onChange={(e) => setSelectedTeacherFilter(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold border focus:border-cyan-500 focus:outline-none transition-all ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-900'
                    : 'bg-slate-900 border-slate-800 text-white'
                }`}
              >
                <option value="all">كافة المعلمين والأساتذة المعتمدين</option>
                {activeInstructorsList.map((inst) => (
                  <option key={inst.name} value={inst.name}>
                    👨‍🏫 الأستاذ: {inst.name} ({inst.subject}) - {inst.count} كورسات
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Search Bar - Responsive Input */}
          <div className="relative pt-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالاسم، موضوع الدرس، أو الكلمات المفتاحية..."
              className={`w-full pr-11 pl-4 py-3 sm:py-3.5 rounded-2xl border text-xs sm:text-sm focus:border-cyan-500 focus:outline-none transition-all ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
              }`}
            />
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute right-4 top-5" />
          </div>

        </div>

        {/* Results Summary Bar */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              تم العثور على <strong className="text-cyan-500 font-black">{featuredCourses.length}</strong> كورس ومحاضرة معتمدة
            </span>
          </div>
          <span className="text-[11px]">
            التسجيل والاعتماد إلزامي للوصول الكامل
          </span>
        </div>

        {/* Courses Cards Grid - Responsive Grid (1 col on mobile, 2 on tablet, 3 on desktop) */}
        {featuredCourses.length === 0 ? (
          <div className={`p-10 sm:p-14 rounded-3xl border text-center space-y-4 ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}>
            <BookOpen className="w-12 h-12 mx-auto opacity-40 text-cyan-500" />
            <div className="space-y-1">
              <p className="font-black text-sm sm:text-base text-slate-800 dark:text-slate-200">
                لا توجد مقررات دراسية مطابقة للفرز الحالي
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                يرجى اختيار مرحلة دراسية أو صف دراسي مختلف، أو مسح نص البحث لعرض كافة المقررات المتاحة.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedStage('all');
                setSelectedClass('all');
                setSelectedEduType('all');
                setSelectedTeacherFilter('all');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs hover:bg-cyan-400 transition-all cursor-pointer shadow-md"
            >
              عرض جميع المقررات المتاحة
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map(({ course, platform }) => {
              const isBestSeller = (course.enrolledCount || 0) > 0;
              const isSuspendedPlatform = platform.status === 'suspended';

              return (
                <div
                  key={course.id}
                  onClick={() => {
                    if (platform) setSelectedPlatformId(platform.id);
                    setSelectedCourseId(course.id);
                    setCurrentView('course_detail');
                  }}
                  className={`rounded-3xl border overflow-hidden flex flex-col justify-between cursor-pointer transition-all duration-300 group hover:-translate-y-1 ${
                    isSuspendedPlatform
                      ? 'border-rose-500/40 bg-rose-500/5'
                      : isLight
                      ? 'bg-white border-slate-200 hover:border-cyan-400 shadow-md'
                      : 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="relative">
                    {/* Discrete Background Watermark: Student Reading / Teacher Lecturing motif */}
                    <div className="absolute -left-4 -bottom-4 pointer-events-none opacity-[0.03] dark:opacity-[0.05] select-none">
                      <GraduationCap className="w-32 h-32 text-cyan-600 dark:text-cyan-400" />
                    </div>

                    {/* Thumbnail & Badges */}
                    <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-950">
                      <img
                        src={course.thumbnail || DEFAULT_COURSE_COVER}
                        alt={course.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = DEFAULT_COURSE_COVER;
                        }}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      
                      {/* Price / Free Badge */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <div className={`px-3 py-1 rounded-xl text-xs font-black shadow-lg ${
                          course.isFree
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-cyan-500 text-slate-950'
                        }`}>
                          {course.isFree ? 'مقرر مجاني 🆓' : `${course.price} ج.م`}
                        </div>
                      </div>

                      {/* Suspension or Verification Badge */}
                      <div className="absolute top-3 left-3">
                        {isSuspendedPlatform ? (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-rose-600 text-white shadow-md flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>منصة مجمدة</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-slate-900/90 text-white shadow-md flex items-center gap-1 border border-slate-800 backdrop-blur-md">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>معتمد من الإدارة</span>
                          </span>
                        )}
                      </div>

                      {/* Teacher Overlay Info */}
                      <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs font-bold text-white/95">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={platform.teacherAvatar}
                            alt={platform.teacherName}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover border border-white/50 shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <span className="truncate text-[11px] font-black">{platform.teacherName}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] shrink-0">
                          {course.gradeLevel}
                        </span>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-black text-cyan-500">
                        <span>مادة {platform.subject}</span>
                        <span className="text-slate-400">
                          {course.curriculumType === 'azhar' ? 'أزهر شريف' : course.curriculumType === 'international' ? 'لغات وتجريبي' : 'عام'}
                        </span>
                      </div>
                      
                      <h3 className={`text-base font-black line-clamp-1 group-hover:text-cyan-500 transition-colors ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {course.title}
                      </h3>
                      
                      {course.subtitle && (
                        <p className="text-xs text-cyan-500 line-clamp-1 font-semibold">
                          {course.subtitle}
                        </p>
                      )}

                      <p className={`text-xs line-clamp-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {course.description || 'مقرر تعليمي شامل معزز بأوراق المفاهيم، الواجبات التفاعلية، والامتحانات الدورية.'}
                      </p>

                      {/* Strict Access Requirement Notice */}
                      <div className="pt-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                        <span>يتطلب قيد الطالب المعتمد من شؤون الطلاب</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className={`p-5 pt-3.5 border-t flex items-center justify-between text-xs ${
                    isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800 text-slate-400'
                  }`}>
                    <span className="flex items-center gap-1 font-semibold text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-cyan-500" />
                      <span>{course.totalDurationMinutes || 180} دقيقة</span>
                    </span>
                    <span className="text-cyan-500 font-black flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform text-xs">
                      <span>عرض تفاصيل المقرر</span>
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
      {/* SECTION 6: INSTITUTIONAL INQUIRIES CENTER (لحجز المنصات التعليمية - رقم 011) */}
      {/* ========================================================================= */}
      <div className="relative">
        <div
          className={`p-10 sm:p-14 rounded-3xl text-center relative overflow-hidden transition-all duration-500 ${
            isLight
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-slate-950 text-white border-slate-800'
          }`}
        >
          {/* Subtle architectural details */}
          <div className="absolute top-0 bottom-0 left-0 w-2 bg-cyan-500" />
          <div className="absolute top-[-40px] left-[-40px] w-64 h-64 bg-cyan-500/[0.03] rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-7 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-cyan-500/15 text-cyan-400 text-xs font-black border border-cyan-500/20 mx-auto">
              <Phone className="w-4 h-4 text-cyan-400" />
              <span>لحجز المنصات للمعلمين</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              لحجز المنصات التعليمية
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              إذا كنت معلماً وترغب في حجز وتأسيس منصة تعليمية خاصة بك، يرجى التواصل عبر الرقم التالي. <br/><span className="text-rose-400 font-bold block mt-2">(ملاحظة هامة: هذا الرقم مخصص للمعلمين فقط لحجز المنصات، وليس مخصصاً للطلاب)</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <a
                href={WHATSAPP_LINK_INQUIRIES}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-slate-950 text-slate-950" />
                <span>رقم الاستفسارات المباشر: {CONTACT_NUMBER}</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setCurrentView('rental_form');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-6 py-4 rounded-xl font-black text-xs bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileCode className="w-4 h-4" />
                <span>تقديم طلب حجز وتأسيس منصة</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 7: DETAILED FEATURES GRID */}
      {/* ========================================================================= */}
      <div className="space-y-10">
        <div className="text-center space-y-2">
          <div className="text-cyan-500 font-black text-xs">معايير الجودة التقنية والمدرسية</div>
          <h2 className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
            بنية تحتية مبنية بمعايير مؤسسية حاسمة
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className={`p-6.5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'} space-y-4`}>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
              <Video className="w-5 h-5" />
            </div>
            <h4 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>مشغل فيديوهات متقدم</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              تقنيات متقدمة تضمن استقرار البث مع تعديل تلقائي لجودة وسرعة العرض بما يتناسب مع سرعة اتصال الطالب.
            </p>
          </div>

          <div className={`p-6.5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'} space-y-4`}>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>الاستخدام المخصص</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              تخصيص الحسابات وتخصيص تجربة كل طالب، لضمان أعلى معايير الجودة في متابعة التقدم التعليمي.
            </p>
          </div>

          <div className={`p-6.5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'} space-y-4`}>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h4 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>تقارير متابعة دورية كاملة</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              إمكانية تصدير وطباعة تقارير فورية بصيغة PDF للنتائج والمستويات والواجبات المنزلية، لمشاركتها بصفة دورية مع أولياء الأمور.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 8: PLATFORM FAQ ACCORDION */}
      {/* ========================================================================= */}
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="text-cyan-500 font-black text-xs">مستودع المعرفة للطلاب والزوار</div>
          <h2 className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
            الأسئلة الشائعة والأجوبة الرسمية
          </h2>
        </div>

        <div className="space-y-3">
          {studentFaqs.map((faq, idx) => {
            const isOpen = activeFaqIndex === idx;
            return (
              <div
                key={idx}
                className={`border rounded-xl transition-all overflow-hidden ${
                  isOpen
                    ? isLight
                      ? 'bg-slate-50 border-slate-300'
                      : 'bg-slate-900/80 border-slate-700'
                    : isLight
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-4.5 text-right font-black text-xs sm:text-sm flex items-center justify-between cursor-pointer focus:outline-none"
                >
                  <span className={isLight ? 'text-slate-900' : 'text-white'}>{faq.question}</span>
                  <span className={`text-cyan-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {isOpen && (
                  <div className={`px-6 pb-5 text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 9: ACCREDITED INSTITUTIONAL FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t pt-10 text-center space-y-4 border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
        <p className="font-bold">منظومة SEA التعليمية الذكية • البوابة الموحدة للمنصات والمستودعات الرقمية المعتمدة</p>
        <p className="font-medium text-[11px]">
          تطوير وإشراف هندسي: <span className="font-mono text-cyan-500 font-bold">Nour El-Saeed (Nour Mohamed El-Saeed)</span> • كافة الحقوق البرمجية والمحتوى محفوظة للجهة المالكة والمشرفين © 2026 - 2027 م.
        </p>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL: TEACHER BIO MODAL DETAILED VIEW */}
      {/* ========================================================================= */}
      {viewingTeacherPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div
            className={`w-full max-w-2xl rounded-2xl border text-right overflow-hidden shadow-2xl transition-all ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            {/* Modal Header */}
            <div className="p-6 border-b flex items-center justify-between border-slate-200 dark:border-slate-800">
              <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                السجل الأكاديمي والخبرات للمعلم
              </h3>
              <button
                onClick={() => setViewingTeacherPlatform(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={viewingTeacherPlatform.teacherAvatar}
                  alt={viewingTeacherPlatform.teacherName}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover border-2 border-cyan-500/30"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div>
                  <h4 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    الأستاذ {viewingTeacherPlatform.teacherName}
                  </h4>
                  <p className="text-xs text-cyan-500 font-bold">{viewingTeacherPlatform.teacherTitle}</p>
                </div>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div>
                  <span className="font-black text-slate-400 block mb-1">المادة والتخصص:</span>
                  <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    مادة {viewingTeacherPlatform.subject}
                  </span>
                </div>
                {viewingTeacherPlatform.teacherBio && (
                  <div>
                    <span className="font-black text-slate-400 block mb-1">النبذة التعريفية الرسمية:</span>
                    <p className={isLight ? 'text-slate-600' : 'text-slate-300'}>
                      {viewingTeacherPlatform.teacherBio}
                    </p>
                  </div>
                )}
                {viewingTeacherPlatform.teacherExperienceYears && (
                  <div>
                    <span className="font-black text-slate-400 block mb-1">سجل سنوات الخبرة التعليمية المعتمدة:</span>
                    <span className="font-bold text-cyan-500">
                      أكثر من {viewingTeacherPlatform.teacherExperienceYears} سنوات خبرة في تدريس المناهج الرسمية واللغات.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t flex justify-end border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setViewingTeacherPlatform(null)}
                className="px-5 py-2.5 rounded-lg bg-cyan-500 text-slate-950 font-black text-xs cursor-pointer hover:bg-cyan-400"
              >
                إغلاق نافذة السجل
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

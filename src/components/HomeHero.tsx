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
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  const CONTACT_NUMBER = '011';
  const WHATSAPP_LINK_INQUIRIES = `https://wa.me/2011?text=${encodeURIComponent('السلام عليكم، أود الاستفسار عن تفاصيل منظومة SEA التعليمية')}`;

  // Primary platform (English)
  const primaryPlatform = platforms[0] || null;

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

    return list.sort((a, b) => (b.course.enrolledCount || 0) - (a.course.enrolledCount || 0));
  }, [platforms, courses, searchQuery, selectedGradeFilter]);

  // Subject List as specified by user
  const subjectsData = [
    {
      id: 'english',
      name: 'اللغة الإنجليزية',
      nameEn: 'English Language',
      status: 'active',
      desc: 'البوابة التعليمية المكتملة والمجهزة بالكامل بشرح تفاعلي متقدم وأقوى نظام لحماية المحاضرات والامتحانات الإلكترونية ضد التسريب.',
      color: 'from-cyan-500 to-blue-600',
      tag: 'متاح ومكتمل التطوير الفني',
    },
    {
      id: 'arabic',
      name: 'اللغة العربية',
      nameEn: 'Arabic Language',
      status: 'coming_soon',
      desc: 'قيد التجهيز الأكاديمي بواسطة خبراء وموجهي المادة لتقديم تجربة تعليمية شاملة في البلاغة، النحو، والأدب.',
      color: 'from-emerald-500 to-teal-600',
      tag: 'مجدول للإطلاق في يوليو 2027',
    },
    {
      id: 'math',
      name: 'الرياضيات',
      nameEn: 'Mathematics',
      status: 'coming_soon',
      desc: 'منظومة حسابية ذكية لتبسيط القوانين الهندسية والجبرية معززة ببنوك الأسئلة وأوراق المفاهيم التفاعلية.',
      color: 'from-purple-500 to-indigo-600',
      tag: 'مجدول للإطلاق في يوليو 2027',
    },
    {
      id: 'sciences',
      name: 'العلوم',
      nameEn: 'Sciences',
      status: 'coming_soon',
      desc: 'شرح تطبيقي وتفاعلي معزز بنماذج ثلاثية الأبعاد لتبسيط فروع الفيزياء، الكيمياء، والأحياء.',
      color: 'from-rose-500 to-red-600',
      tag: 'مجدول للإطلاق في يوليو 2027',
    },
    {
      id: 'integrated_sciences',
      name: 'العلوم المتكاملة',
      nameEn: 'Integrated Sciences',
      status: 'coming_soon',
      desc: 'المفهوم الحديث للعلوم الشاملة والمصمم خصيصاً لمواكبة أحدث معايير المناهج التعليمية المعتمدة.',
      color: 'from-amber-500 to-orange-600',
      tag: 'مجدول للإطلاق في يوليو 2027',
    },
    {
      id: 'social_studies',
      name: 'الدراسات الاجتماعية',
      nameEn: 'Social Studies',
      status: 'coming_soon',
      desc: 'رحلة معرفية تفاعلية تعتمد على الفهم التاريخي والجغرافي المعزز بالخرائط الرقمية والجداول التحليلية.',
      color: 'from-sky-500 to-blue-600',
      tag: 'مجدول للإطلاق في يوليو 2027',
    },
  ];

  const studentFaqs = [
    {
      question: 'كيف يمكن تفعيل المحاضرات والاشتراك بالمنظومة؟',
      answer:
        'يمكن للطلاب التسجيل برقم الهاتف والبريد الإلكتروني، وتفعيل الكورسات فورياً باستخدام الأكواد المطبوعة، أو من خلال خيارات المحفظة الرقمية المدمجة في المنصة.',
    },
    {
      question: 'ما هي حماية الجهاز وما ميزتها الأمنية للطلاب؟',
      answer:
        'لحماية خصوصية حساب الطالب ومنع الاختراقات، يتم ربط كل حساب بجهاز واحد رئيسي وبصمة متصفح مميزة تلقائياً عند أول عملية دخول، مع حجب تسجيل الشاشة أو التقاط الصور.',
    },
    {
      question: 'كيف تعمل ورقة المفاهيم المدمجة داخل الاختبارات والواجبات؟',
      answer:
        'تتيح المنظومة للطالب استعراض الملخصات والقوانين والقواعد الرسمية المعتمدة في نافذة موازية أثناء حل الأسئلة لتوفير الوقت والتركيز الكامل.',
    },
    {
      question: 'هل تدعم المنظومة المتابعة وتقارير أولياء الأمور؟',
      answer:
        'نعم، توفر المنصة نظام رصد فوري للدرجات والنسب المئوية لكل واجب واختبار، مع إمكانية تصدير تقارير الأداء وطباعتها لإطلاع ولي الأمر أولاً بأول.',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-24 text-right relative pb-20 select-none px-4 sm:px-6 lg:px-8">
      
      {/* Dynamic Ambient Background Elements - Minimal & Luxury */}
      <div className="absolute top-[-100px] left-1/4 w-[500px] h-[500px] bg-cyan-500/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[400px] right-10 w-[400px] h-[400px] bg-sky-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      {/* ========================================================================= */}
      {/* SECTION 1: OFFICIAL INSTITUTIONAL HERO HEADER */}
      {/* ========================================================================= */}
      <div className="relative pt-12 pb-6 overflow-hidden">
        <div className="relative z-10 flex flex-col items-center text-center space-y-10 max-w-5xl mx-auto">
          
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
              className={`text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.2] transition-colors ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              المنظومة الرقمية السيادية{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600 font-extrabold block sm:inline">
                لإدارة المحتوى والتعليم التفاعلي
              </span>
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-cyan-500 to-sky-500 mx-auto rounded-full" />
          </div>

          <p
            className={`text-base sm:text-xl max-w-3xl leading-relaxed font-medium transition-colors ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            بنية تحتية برمجية متكاملة ومحميّة تهدف إلى تأسيس معايير جديدة للتعلم الرقمي المؤسسي، مع دمج أدوات الحماية العتادية ضد القرصنة، وبنوك الأسئلة المقارنة، والتقارير الفورية لأولياء الأمور.
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
                    <span>تأمين المحاضرات عتادياً ضد التسريب.</span>
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
            return (
              <div
                key={sub.id}
                className={`p-7 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between group ${
                  isActive
                    ? isLight
                      ? 'bg-white border-cyan-400 shadow-lg shadow-cyan-50/50'
                      : 'bg-slate-900/90 border-cyan-500/30 shadow-2xl'
                    : isLight
                    ? 'bg-slate-50 border-slate-200/80 opacity-90'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-80'
                }`}
              >
                {/* Thin colored line indicator at the top for neatness */}
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${sub.color}`} />

                <div className="space-y-5 pt-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-black tracking-wide uppercase ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950 shadow-sm'
                          : isLight
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {sub.tag}
                    </span>
                    <span className="font-mono text-[10px] font-black text-slate-400">
                      {sub.nameEn}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {sub.name}
                    </h3>
                    <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {sub.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-5 border-t border-dashed border-slate-200 dark:border-slate-800 mt-6 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">منظومة SEA الرقمية</span>
                  {isActive && primaryPlatform ? (
                    <button
                      onClick={() => {
                        setSelectedPlatformId(primaryPlatform.id);
                        setCurrentView('platform_detail');
                      }}
                      className="px-4.5 py-2 rounded-lg text-[11px] font-black bg-cyan-500 text-slate-950 flex items-center gap-1.5 hover:bg-cyan-400 transition-colors cursor-pointer shadow-sm"
                    >
                      <span>تصفح المنصة النشطة</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[11px] font-black text-amber-500 dark:text-amber-400">تحت التجهيز</span>
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
      {/* SECTION 5: ACCREDITED COURSES AND LECTURES DIRECTORY */}
      {/* ========================================================================= */}
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b pb-6 border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-500 font-bold text-xs mb-1">
              <BookOpen className="w-4 h-4" />
              <span>دليل المحاضرات والكورسات المتاحة</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              اختر صفك الدراسي وابدأ المشاهدة والتعلم
            </h2>
          </div>

          {/* Grade Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {['all', 'الصف الثالث الثانوي', 'الصف الثاني الثانوي', 'الصف الأول الثانوي'].map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGradeFilter(grade)}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  selectedGradeFilter === grade
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {grade === 'all' ? 'كافة المراحل الدراسية' : grade}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar - Modern & Responsive */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث السريع في بنية المقررات الدراسية..."
            className={`w-full pr-11 pl-4 py-4 rounded-xl border text-xs sm:text-sm focus:border-cyan-500 focus:outline-none transition-all ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          />
          <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-4.5" />
        </div>

        {/* Courses Cards Grid */}
        {featuredCourses.length === 0 ? (
          <div className={`p-12 rounded-2xl border text-center ${isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40 text-cyan-500" />
            <p className="font-black text-sm">لا توجد كورسات مطابقة لخيارات البحث حالياً</p>
            <p className="text-xs text-slate-400 mt-1">جرّب إلغاء تصفية المرحلة الدراسية أو كتابة كلمة بحث مختلفة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6.5">
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
                  className={`rounded-2xl border overflow-hidden flex flex-col justify-between cursor-pointer transition-all duration-300 group hover:-translate-y-1 ${
                    isLight
                      ? 'bg-white border-slate-200 hover:border-cyan-400 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-cyan-500/40'
                  }`}
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative h-52 overflow-hidden bg-slate-950">
                      <img
                        src={course.thumbnail || DEFAULT_COURSE_COVER}
                        alt={course.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = DEFAULT_COURSE_COVER;
                        }}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      
                      {/* Price Badge */}
                      <div className="absolute top-3 right-3 px-3 py-1 rounded text-xs font-black bg-cyan-500 text-slate-950 shadow-sm">
                        {course.isFree ? 'مجاني بالكامل' : `${course.price} ج.م`}
                      </div>

                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded text-[10px] font-black bg-slate-900/90 text-white shadow-md flex items-center gap-1 border border-slate-800">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>المقرر المعتمد</span>
                        </span>
                      </div>

                      {/* Teacher Overlay */}
                      <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs font-bold text-white/95">
                        <div className="flex items-center gap-2">
                          <img
                            src={platform.teacherAvatar}
                            alt={platform.teacherName}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover border border-white/50"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <span className="truncate max-w-[140px] text-[11px] font-black">{platform.teacherName}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px]">
                          {course.gradeLevel}
                        </span>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-black text-cyan-500">
                        <span>مادة {platform.subject}</span>
                        <span className="text-slate-400">
                          {course.curriculumType === 'azhar' ? 'أزهر' : course.curriculumType === 'international' ? 'لغات' : 'ثانوية عامة'}
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
                        {course.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className={`p-5 pt-3.5 border-t flex items-center justify-between text-xs ${isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-cyan-500" />
                      <span>{course.totalDurationMinutes || 180} دقيقة</span>
                    </span>
                    <span className="text-cyan-500 font-black flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform">
                      <span>الولوج للمادة التعليمية</span>
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
      {/* SECTION 6: INSTITUTIONAL INQUIRIES CENTER (للاستفسارات فقط - رقم 011) */}
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
              <span>خط الاتصال المؤسسي الموحد</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              للاستفسارات فقط
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              للتواصل والتنسيق الأكاديمي، أو لطلب تراخيص تأسيس منصات مستقلة جديدة لمعلمي وموجهي المواد التعليمية المعتمدة بالمنظومة، يرجى التواصل مباشرة عبر خط الاستفسارات الموحد:
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
            <h4 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>مشغل فيديوهات معزز الحماية</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              تقنيات متقدمة تمنع تصوير الشاشة أو التسجيل، مع تعديل تلقائي لجودة البث وسرعة العرض بما يتناسب مع سرعة الاتصال.
            </p>
          </div>

          <div className={`p-6.5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'} space-y-4`}>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>ربط الحساب بجهاز الطالب</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              تأمين الحسابات عبر تقنيات ربط العتاد (Hardware Locking)، لحماية بيانات واشتراك الطلاب ومنع تداول كلمات المرور والقرصنة.
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

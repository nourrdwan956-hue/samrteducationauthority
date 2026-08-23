import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Users,
  Video,
  Settings,
  Plus,
  Play,
  Award,
  GraduationCap,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Tag,
  DollarSign,
  Ticket,
  Megaphone,
  Radio,
  Clock,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  Send,
  KeyRound,
  FileText,
  Trash2,
  Edit,
  Eye,
  AlertTriangle,
  Globe,
  EyeOff,
  Power,
  Image as ImageIcon,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Course, EducationalPlatform } from '../types';
import { CreateCourseModal } from './teacher/CreateCourseModal';
import { EditCourseCoverModal } from './teacher/EditCourseCoverModal';
import { EditCourseDetailsModal } from './teacher/EditCourseDetailsModal';
import { CourseLessonsTab } from './teacher/CourseLessonsTab';
import { CourseExamsTab } from './teacher/CourseExamsTab';
import { CourseStudentsTab } from './teacher/CourseStudentsTab';
import { CourseResultsTab } from './teacher/CourseResultsTab';
import { CourseCouponsTab } from './teacher/CourseCouponsTab';
import { CourseAnnouncementsTab } from './teacher/CourseAnnouncementsTab';
import { CourseLiveSessionsTab } from './teacher/CourseLiveSessionsTab';
import { CourseSupportTab } from './teacher/CourseSupportTab';
import { CourseQuestionsTab } from './teacher/CourseQuestionsTab';
import { QuestionBankManager } from './teacher/QuestionBankManager';
import { AssignmentsManager } from './teacher/AssignmentsManager';
import { PrintedCodesManager } from './teacher/PrintedCodesManager';

type TeacherTab =
  | 'overview'
  | 'lessons'
  | 'exams'
  | 'bank'
  | 'assignments'
  | 'access_codes'
  | 'questions'
  | 'students'
  | 'results'
  | 'coupons'
  | 'announcements'
  | 'live'
  | 'support'
  | 'settings';

export const TeacherDashboard: React.FC = () => {
  const {
    currentUser,
    platforms,
    courses,
    exams,
    coupons,
    examSubmissions,
    courseStudents,
    courseAnnouncements,
    liveSessions,
    createCourse,
    updateCourse,
    deleteCourse,
    addLessonToCourse,
    updateLesson,
    deleteLesson,
    createExam,
    updateExam,
    deleteExam,
    addCourseStudent,
    toggleStudentStatus,
    deleteCourseStudent,
    addCourseAnnouncement,
    deleteCourseAnnouncement,
    addLiveSession,
    updateLiveSession,
    deleteLiveSession,
    createCoupon,
    toggleCouponStatus,
    deleteCoupon,
    logAdminActivity,
    setSelectedCourseId,
    setSelectedLessonId,
    setSelectedExamId,
    setCurrentView,
    addToast,
    updatePlatform,
  } = useApp();

  // Find the platform for current teacher (Default to English platform if not matched)
  if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'super_admin')) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <ShieldCheck className="w-20 h-20 text-rose-500 mb-6" />
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">صلاحيات غير كافية</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">
          هذه الصفحة مخصصة للسادة المعلمين وإدارة المنصة فقط.
        </p>
        <button 
          onClick={() => setCurrentView('home')}
          className="px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all"
        >
          العودة للصفحة الرئيسية
        </button>
      </div>
    );
  }

  const teacherPlatform =
    platforms.find((p) => p.id === currentUser?.platformId) ||
    platforms[0];

  const teacherCourses = (courses || []).filter(
    (c) => c.platformId === teacherPlatform?.id
  );

  const [activeTab, setActiveTab] = useState<TeacherTab>('overview');
  const [selectedCourse, setSelectedCourse] = useState<Course>(
    teacherCourses[0] || courses[0]
  );
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  useEffect(() => {
    if (!selectedCourse && teacherCourses.length > 0) {
      setSelectedCourse(teacherCourses[0]);
    } else if (selectedCourse) {
      const refreshed = teacherCourses.find((c) => c.id === selectedCourse.id);
      if (refreshed) {
        setSelectedCourse(refreshed);
      } else if (teacherCourses.length > 0) {
        setSelectedCourse(teacherCourses[0]);
      }
    }
  }, [courses, teacherCourses]);

  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [courseForCoverEdit, setCourseForCoverEdit] = useState<Course | null>(null);
  const [courseForDetailsEdit, setCourseForDetailsEdit] = useState<Course | null>(null);

  // Platform profile edit state
  const [teacherBio, setTeacherBio] = useState(teacherPlatform?.teacherBio || '');
  const [whatsappNumber, setWhatsappNumber] = useState(teacherPlatform?.whatsappNumber || '');
  const [telegramChannel, setTelegramChannel] = useState(teacherPlatform?.telegramChannel || '');
  const [teacherExperienceYears, setTeacherExperienceYears] = useState(teacherPlatform?.teacherExperienceYears || '');
  const [teacherCertificates, setTeacherCertificates] = useState(teacherPlatform?.teacherCertificates || '');
  const [teacherHighlights, setTeacherHighlights] = useState(teacherPlatform?.teacherHighlights || '');

  // Calculate aggregated stats
  const totalStudents = (courseStudents || []).filter((s) =>
    teacherCourses.some((c) => c.id === s.courseId)
  ).length;

  const totalExams = (exams || []).filter((e) =>
    teacherCourses.some((c) => c.id === e.courseId)
  ).length;

  const totalLessons = teacherCourses.reduce(
    (acc, c) => acc + (c.modules?.reduce((mAcc, m) => mAcc + (m.lessons?.length || 0), 0) || c.lessonsCount || 0),
    0
  );

  // Course Publish/Unpublish toggle
  const handleToggleCoursePublish = (course: Course) => {
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    updateCourse(course.id, { status: newStatus });
    if (newStatus === 'published') {
      addToast('success', 'تم نشر الكورس للطلاب بنجاح! 🟢', `أصبح كورس "${course.title}" متاحاً ومرئياً للطلاب للاشتراك والدراسة.`);
    } else {
      addToast('warning', 'تم تعطيل نشر الكورس وإخفاؤه 🔒', `تم تحويل كورس "${course.title}" إلى وضع المسودة وحجبه عن الطلاب.`);
    }
  };

  // Confirm delete course
  const handleConfirmDeleteCourse = () => {
    if (!courseToDelete) return;
    const targetId = courseToDelete.id;
    const targetTitle = courseToDelete.title;
    deleteCourse(targetId);
    setCourseToDelete(null);
    if (selectedCourse?.id === targetId) {
      const remaining = teacherCourses.filter((c) => c.id !== targetId);
      if (remaining.length > 0) {
        setSelectedCourse(remaining[0]);
      }
    }
    addToast('success', 'تم حذف الكورس بنجاح 🗑️', `تم حذف كورس "${targetTitle}" وكافة ملفاته ومحاضراته.`);
  };

  // Change / Update course cover image
  const handleSaveCourseCover = (courseId: string, newCoverUrl: string) => {
    updateCourse(courseId, { thumbnail: newCoverUrl });
    if (selectedCourse?.id === courseId) {
      setSelectedCourse({
        ...selectedCourse,
        thumbnail: newCoverUrl,
      });
    }
    addToast(
      'success',
      'تم تحديث غلاف الكورس بنجاح 🖼️✨',
      'تم حفظ صورة الغلاف الجديدة وستظهر لجميع الطلاب بالصفحة الرئيسية وصفحة الكورس.'
    );
  };

  // Update course inner details, title, description, stage, pricing, etc.
  const handleSaveCourseDetails = (courseId: string, updates: Partial<Course>) => {
    updateCourse(courseId, updates);
    if (selectedCourse?.id === courseId) {
      setSelectedCourse({
        ...selectedCourse,
        ...updates,
      });
    }
    addToast(
      'success',
      'تم حفظ وتحديث بيانات الكورس بنجاح! 📝✨',
      'تم تعديل العنوان والوصف والتسعير والمرحلة التعليمية فورياً.'
    );
  };

  // Handlers
  const handleCreateCourse = (courseData: Partial<Course>) => {
    createCourse({
      ...courseData,
      platformId: teacherPlatform?.id || 'platform-english-01',
    });
    // Select newly created or existing
    setTimeout(() => {
      if (teacherCourses.length > 0) {
        setSelectedCourse(teacherCourses[teacherCourses.length - 1]);
      }
    }, 200);
  };

  const handlePreviewLesson = (courseId: string, lessonId: string) => {
    setSelectedCourseId(courseId);
    setSelectedLessonId(lessonId);
    setCurrentView('lesson_player');
  };

  const handlePreviewExam = (examId: string) => {
    setSelectedExamId(examId);
    setCurrentView('exam_view');
  };

  const handleSavePlatformSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherPlatform) return;
    updatePlatform(teacherPlatform.id, {
      teacherBio,
      whatsappNumber,
      telegramChannel,
      teacherExperienceYears,
      teacherCertificates,
      teacherHighlights,
    });
    addToast('success', 'تم حفظ وتحديث بيانات الملف الشخصي بنجاح! ✨');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-20 pt-4 sm:pt-6 transition-colors">
      
      {/* Top Banner / Teacher Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Suspended Platform Warning Notice */}
        {teacherPlatform?.status === 'suspended' && (
          <div className="p-5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg backdrop-blur-md animate-pulse">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-right">
                <h3 className="text-sm sm:text-base font-black">
                  تنبيه إداري عاجل: هذه المنصة موقوفة ومجمدة حالياً بقرار من إدارة SEA
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5">
                  تم حجب المنصة وجميع مقرراتها عن الطلاب مؤقتاً. يُرجى مراجعة إدارة المنظومة لإعادة التفعيل وتصحيح الحالة.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-black shrink-0">
              حالة المنصة: مجمدة إدارياً
            </span>
          </div>
        )}
        
        {/* Welcome Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900 dark:to-cyan-950/40 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl dark:shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={teacherPlatform?.teacherAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                  alt={teacherPlatform?.teacherName || 'المعلم'}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-cyan-500 shadow-xl"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] text-white dark:text-slate-950 font-black" title="نشط أونلاين">
                  ✓
                </div>
              </div>

              {/* Official SEA Teacher Emblem Badge */}
              <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-400/30 p-1 items-center justify-center shrink-0 overflow-hidden shadow-lg backdrop-blur-md">
                <img 
                  src="/teacher-logo.png" 
                  alt="شعار قطاع المعلمين SEA" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.teacher-logo-header-fallback');
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
                <BookOpen className="teacher-logo-header-fallback hidden w-7 h-7 text-indigo-500" />
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">
                    {teacherPlatform?.teacherName || 'مستر محمد رضوان'}
                  </h1>
                  <span className="px-3 py-0.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 dark:border-cyan-400/40 text-xs font-black">
                    {teacherPlatform?.subject || 'اللغة الإنجليزية'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-semibold">
                  {teacherPlatform?.name || 'منصة مادة اللغة الإنجليزية المعتمدة'} • منصة معتمدة بـ SEA
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" /> المنصة مؤمنة ومحمية من التسريب
                  </span>
                  <span>•</span>
                  <span className="text-slate-600 dark:text-slate-300 font-mono">
                    ID: {teacherPlatform?.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={() => {
                  if (teacherCourses.length > 0) {
                    setSelectedCourse(teacherCourses[0]);
                  }
                  setActiveTab('support');
                  addToast('info', 'تم فتح تذاكر الدعم والطلبات المالية 🎫');
                }}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white dark:text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40"
                title="طلب سحب المستحقات المالية، ترقية الخادم، أو الدعم الفني"
              >
                <Ticket className="w-4 h-4" />
                <span>الدعم وطلب سحب الأرباح 💰🎫</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (teacherPlatform) {
                    setTeacherBio(teacherPlatform.teacherBio || '');
                    setTeacherExperienceYears(teacherPlatform.teacherExperienceYears || '');
                    setTeacherCertificates(teacherPlatform.teacherCertificates || '');
                    setTeacherHighlights(teacherPlatform.teacherHighlights || '');
                    setWhatsappNumber(teacherPlatform.whatsappNumber || '');
                    setTelegramChannel(teacherPlatform.telegramChannel || '');
                  }
                  setIsEditProfileModalOpen(true);
                }}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-400/40"
                title="كتابة وتعديل الخبرات والشهادات التي ستظهر للطلاب في الصفحة الرئيسية"
              >
                <Award className="w-4 h-4" />
                <span>معلوماتي المهنية والخبرات 🎓</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCreateCourseModalOpen(true)}
                className="flex-1 md:flex-initial px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white dark:text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إنشاء كورس جديد</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedCourseId(selectedCourse?.id || null);
                  setCurrentView('platform_detail');
                }}
                className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>معاينة صفحة المنصة</span>
              </button>
            </div>

          </div>
        </div>

        {/* 4 Quick KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">إجمالي الطلاب</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {totalStudents}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">+12% هذا الأسبوع</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">الكورسات المنشورة</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {teacherCourses.length}
              </span>
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">متاح للطلاب 2026</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">المحاضرات والفيديوهات</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {totalLessons}
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">مشغل مشفر</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">الامتحانات والاختبارات</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {totalExams}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">تصحيح فوري</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Course Workspace Bar */}
        {activeTab !== 'overview' && selectedCourse && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              العودة للكورسات
            </button>
            <div className="flex items-center gap-2 text-xs font-black text-cyan-600 dark:text-cyan-400">
              <Layers className="w-4 h-4" />
              <span>إدارة كورس:</span>
            </div>
            <div className="text-slate-900 dark:text-white text-sm sm:text-base font-black">
              {selectedCourse.title}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs w-full md:w-auto justify-start md:justify-end">
            {/* Quick Publish / Unpublish Toggle */}
            <button
              type="button"
              onClick={() => handleToggleCoursePublish(selectedCourse)}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer border shadow-sm ${
                selectedCourse.status !== 'draft'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100'
              }`}
              title={selectedCourse.status !== 'draft' ? 'الكورس معروض للطلاب - اضغط لتعطيل النشر' : 'الكورس مسودة - اضغط لنشره للطلاب'}
            >
              {selectedCourse.status !== 'draft' ? (
                <>
                  <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>منشور للطلاب (اضغط لتعطيل النشر)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>مسودة معطلة (اضغط للنشر للطلاب)</span>
                </>
              )}
            </button>

            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold">
              المرحلة: <strong className="text-cyan-600 dark:text-cyan-400">{selectedCourse.stage === 'primary' ? 'الابتدائي' : selectedCourse.stage === 'preparatory' ? 'الإعدادي' : 'الثانوي'}</strong>
            </span>
            
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold">
              {selectedCourse.isFree ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-black">مجاني 100%</span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-black">{selectedCourse.price} ج.م</span>
              )}
            </span>

            {/* Edit Course Details Button */}
            <button
              type="button"
              onClick={() => setCourseForDetailsEdit(selectedCourse)}
              className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/50 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="تعديل تفاصيل الكورس، الوصف، التسعير، والمرحلة الدراسية"
            >
              <Edit className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>تعديل بيانات الكورس</span>
            </button>

            {/* Change Course Cover Button */}
            <button
              type="button"
              onClick={() => setCourseForCoverEdit(selectedCourse)}
              className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/50 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="تغيير أو رفع غلاف جديد لهذا الكورس"
            >
              <ImageIcon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>تغيير الغلاف</span>
            </button>

            {/* Delete Course Button in Header */}
            <button
              type="button"
              onClick={() => setCourseToDelete(selectedCourse)}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="حذف هذا الكورس بالكامل"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف الكورس</span>
            </button>
          </div>
        </div>
        )}
        
        {/* Multi-Tab Navigation Bar */}
        {activeTab !== 'overview' && selectedCourse && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
          {[
            { id: 'lessons', label: 'المحاضرات والوحدات', icon: Video },
            { id: 'exams', label: 'الامتحانات والاختبارات', icon: HelpCircle },
            { id: 'bank', label: 'بنك الأسئلة المتقدم 📚', icon: Layers },
            { id: 'assignments', label: 'الواجبات وورقة المفاهيم 📝', icon: FileText },
            { id: 'access_codes', label: 'طباعة كروت الأكواد (16 حرف) 🖨️', icon: Tag },
            { id: 'questions', label: 'أسئلة ومناقشات الطلاب 💬', icon: MessageSquare },
            { id: 'students', label: 'الطلاب المشتركون', icon: Users },
            { id: 'results', label: 'نتائج وتحليلات الطلاب', icon: Award },
            { id: 'coupons', label: 'أكواد السناتر والخصومات', icon: Ticket },
            { id: 'announcements', label: 'التنبيهات والإعلانات', icon: Megaphone },
            { id: 'live', label: 'البث المباشر Live', icon: Radio },
            { id: 'support', label: 'الدعم الفني والطلبات 🎫', icon: Ticket },
            { id: 'settings', label: 'إعدادات المنصة والأمان', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TeacherTab)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-white dark:text-slate-950 shadow-lg shadow-cyan-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        )}

        {/* Tab 1: Overview & Courses List */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Quick Banner: Teacher Professional Profile */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0 shadow-lg shadow-amber-500/20">
                  🎓
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                    <span>الملف المهني والخبرات التعريفية للمعلم</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                      يظهر للطلاب بالصفحة الرئيسية
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {teacherPlatform?.teacherExperienceYears || teacherPlatform?.teacherCertificates || teacherPlatform?.teacherHighlights
                      ? `✨ معلوماتك مسجلة حالياً وتظهر للطلاب في الصفحة الرئيسية للمنصة.`
                      : 'ℹ️ لم تقم بإدخال تفاصيل خبراتك وشهاداتك بعد (اختيارية). يمكنك إضافتها في أي وقت لتظهر للطلاب وأولياء الأمور في الصفحة الرئيسية للمنصة.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (teacherPlatform) {
                    setTeacherBio(teacherPlatform.teacherBio || '');
                    setTeacherExperienceYears(teacherPlatform.teacherExperienceYears || '');
                    setTeacherCertificates(teacherPlatform.teacherCertificates || '');
                    setTeacherHighlights(teacherPlatform.teacherHighlights || '');
                    setWhatsappNumber(teacherPlatform.whatsappNumber || '');
                    setTelegramChannel(teacherPlatform.telegramChannel || '');
                  }
                  setIsEditProfileModalOpen(true);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-md"
              >
                <Award className="w-4 h-4" />
                <span>كتابة وتعديل المعلومات المهنية</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">كافة الكورسات في منصتك ({teacherCourses.length})</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">إدارة المحتوى، النشر والتعطيل، التسعير، والمناهج</p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateCourseModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة كورس جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {teacherCourses.map((course) => {
                const isCurrentSelected = selectedCourse?.id === course.id;
                const isDraft = course.status === 'draft';
                return (
                  <div
                    key={course.id}
                    className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-all group relative ${
                      isCurrentSelected
                        ? 'bg-white dark:bg-slate-900 border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-500/20 shadow-xl'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-md'
                    }`}
                  >
                    {/* Thumbnail & Badges */}
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 dark:from-slate-950 via-transparent to-transparent" />
                      
                      {/* Top-Left: Publish Status Pill (Clickable) */}
                      <div className="absolute top-3 left-3 z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleCoursePublish(course);
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer transition-all border ${
                            !isDraft
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-400'
                              : 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-300'
                          }`}
                          title={!isDraft ? 'الكورس منشور للطلاب - اضغط لتعطيل النشر' : 'الكورس معطل النشر (مسودة) - اضغط للنشر للطلاب'}
                        >
                          {!isDraft ? (
                            <>
                              <Globe className="w-3.5 h-3.5" />
                              <span>منشور للطلاب</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>مسودة (معطل)</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Top-Right: Price Badge */}
                      <div className="absolute top-3 right-3">
                        {course.isFree ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-500 text-white font-black text-xs shadow-md">
                            مجاني 100%
                          </span>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                            <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md">
                              {course.price} ج.م
                            </span>
                            {course.originalPrice && (
                              <span className="text-[10px] line-through text-slate-300 font-bold ml-1">
                                {course.originalPrice} ج.م
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Stage Badge & Cover Change Badge Button */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-md text-cyan-300 text-xs font-bold border border-slate-700">
                          {course.gradeLevel}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-md text-slate-300 text-xs font-bold border border-slate-700">
                          {course.curriculumType === 'azhar' ? 'أزهر' : course.curriculumType === 'international' ? 'بكالوريا' : 'عام'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCourseForCoverEdit(course);
                        }}
                        className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-xl bg-slate-950/80 hover:bg-cyan-500 hover:text-slate-950 text-white font-bold text-[11px] backdrop-blur-md border border-slate-700/80 shadow-md flex items-center gap-1.5 transition-all cursor-pointer group/btn"
                        title="رفع صورة جديدة أو تغيير غلاف الكورس أو حذفه"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-cyan-400 group-hover/btn:text-slate-950 transition-colors" />
                        <span>تغيير الغلاف</span>
                      </button>
                    </div>

                    {/* Course Body */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                            {course.title}
                          </h4>
                        </div>
                        {course.subtitle && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{course.subtitle}</p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{course.modulesCount || 1} وحدات • {course.lessonsCount || 0} دروس</span>
                        <span className="text-cyan-600 dark:text-cyan-400 font-bold">{course.enrolledCount || 0} طالب</span>
                      </div>

                      {/* Actions */}
                      <div className="pt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCourse(course);
                            setActiveTab('lessons');
                            addToast('info', `تم فتح كورس "${course.title}" لإدارته`);
                          }}
                          className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>إدارة المحتوى</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCourseForDetailsEdit(course)}
                          className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/50 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 transition-colors cursor-pointer"
                          title="تعديل بيانات الكورس، الوصف والأسعار والمرحلة"
                        >
                          <Edit className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setCourseForCoverEdit(course)}
                          className="p-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/50 dark:hover:bg-cyan-900/60 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 transition-colors cursor-pointer"
                          title="تغيير أو رفع غلاف الكورس"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleCoursePublish(course)}
                          className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                            !isDraft
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                          }`}
                          title={!isDraft ? 'تعطيل نشر الكورس وإخفاؤه' : 'نشر الكورس للطلاب'}
                        >
                          {!isDraft ? <Power className="w-4 h-4 text-emerald-600" /> : <Globe className="w-4 h-4 text-amber-600" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            setCurrentView('course_detail');
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                          title="معاينة صفحة الكورس"
                        >
                          <Eye className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setCourseToDelete(course)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                          title="حذف الكورس نهائياً"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* Tab 2: Lessons and Modules */}
        {activeTab === 'lessons' && selectedCourse && (
          <CourseLessonsTab
            course={selectedCourse}
            onAddLesson={addLessonToCourse}
            onUpdateLesson={updateLesson}
            onDeleteLesson={deleteLesson}
            onPreviewLesson={handlePreviewLesson}
            onUpdateCourse={updateCourse}
          />
        )}

        {/* Tab 3: Exams */}
        {activeTab === 'exams' && selectedCourse && (
          <CourseExamsTab
            course={selectedCourse}
            courses={teacherCourses}
            exams={exams}
            onCreateExam={createExam}
            onUpdateExam={updateExam}
            onDeleteExam={deleteExam}
            onPreviewExam={handlePreviewExam}
            onUpdateCourse={updateCourse}
          />
        )}

        {/* Tab: Question Bank */}
        {activeTab === 'bank' && selectedCourse && (
          <QuestionBankManager course={selectedCourse} />
        )}

        {/* Tab: Assignments & Concept Sheet */}
        {activeTab === 'assignments' && selectedCourse && (
          <AssignmentsManager course={selectedCourse} />
        )}

        {/* Tab: Printed 16-Char Access Codes & 15% Platform Settlement */}
        {activeTab === 'access_codes' && selectedCourse && (
          <PrintedCodesManager course={selectedCourse} />
        )}

        {/* Tab: Student Questions & Discussions */}
        {activeTab === 'questions' && selectedCourse && (
          <CourseQuestionsTab
            course={selectedCourse}
            courses={teacherCourses}
          />
        )}

        {/* Tab 4: Students */}
        {activeTab === 'students' && selectedCourse && (
          <CourseStudentsTab
            course={selectedCourse}
            students={courseStudents}
            onAddStudent={addCourseStudent}
            onToggleStatus={toggleStudentStatus}
            onDeleteStudent={deleteCourseStudent}
          />
        )}

        {/* Tab 5: Results & Analytics */}
        {activeTab === 'results' && selectedCourse && (
          <CourseResultsTab
            course={selectedCourse}
            exams={exams}
            submissions={examSubmissions}
          />
        )}

        {/* Tab 6: Coupons */}
        {activeTab === 'coupons' && selectedCourse && (
          <CourseCouponsTab
            course={selectedCourse}
            coupons={coupons}
            onCreateCoupon={createCoupon}
            onToggleStatus={toggleCouponStatus}
            onDeleteCoupon={deleteCoupon}
            onToast={addToast}
            onLogAdminActivity={logAdminActivity}
          />
        )}

        {/* Tab 7: Announcements */}
        {activeTab === 'announcements' && selectedCourse && (
          <CourseAnnouncementsTab
            course={selectedCourse}
            announcements={courseAnnouncements}
            onAddAnnouncement={addCourseAnnouncement}
            onDeleteAnnouncement={deleteCourseAnnouncement}
          />
        )}

        {/* Tab 8: Live Sessions */}
        {activeTab === 'live' && selectedCourse && (
          <CourseLiveSessionsTab
            course={selectedCourse}
            courses={teacherCourses}
            liveSessions={liveSessions}
            onAddLiveSession={addLiveSession}
            onUpdateLiveSession={updateLiveSession}
            onDeleteLiveSession={deleteLiveSession}
            onUpdateCourse={updateCourse}
            onAddLesson={addLessonToCourse}
            onToast={addToast}
          />
        )}

        {/* Tab: Support & Request Tickets */}
        {activeTab === 'support' && teacherPlatform && (
          <CourseSupportTab
            platformId={teacherPlatform.id}
            platformName={teacherPlatform.name}
            teacherName={teacherPlatform.teacherName}
          />
        )}

        {/* Tab 9: Settings & Protected Credentials Notice */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Teacher Profile Info Form */}
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">تخصيص ملف المعلم والتواصل المباشر</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  تحديث النبذة التعريفية، رقم الواتساب، وقناة التليجرام لطلاب المنصة
                </p>
              </div>

              <form onSubmit={handleSavePlatformSettings} className="space-y-4">
                {/* Warning notice */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs leading-relaxed font-bold flex items-start gap-2.5">
                  <span className="text-base shrink-0">⚠️</span>
                  <div>
                    <span className="font-black block mb-0.5">تنبيه هام للأمانة المهنية:</span>
                    يرجى التحلي بالصدق والأمانة التامة عند كتابة خبراتك وشهاداتك المهنية وأبرز مميزاتك؛ فهذه المعلومات تظهر مباشرة للطلاب وأولياء الأمور لضمان بناء ثقة تعليمية حقيقية. (هذه الحقول اختيارية تماماً).
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    النبذة التعريفية للمعلم (Bio)
                  </label>
                  <textarea
                    rows={3}
                    value={teacherBio}
                    onChange={(e) => setTeacherBio(e.target.value)}
                    className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-cyan-500 focus:outline-none text-right"
                    placeholder="نبذة عامة مختصرة..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      مدة وسنوات التدريس (مثال: 12 سنة خبرة) — اختيارية
                    </label>
                    <input
                      type="text"
                      value={teacherExperienceYears}
                      onChange={(e) => setTeacherExperienceYears(e.target.value)}
                      placeholder="مثال: 10 سنوات تدريس للمرحلة الثانوية"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      الشهادات والاعتمادات والدرجات العلمية — اختيارية
                    </label>
                    <input
                      type="text"
                      value={teacherCertificates}
                      onChange={(e) => setTeacherCertificates(e.target.value)}
                      placeholder="مثال: ماجستير في المناهج وطرق التدريس - جامعة القاهرة"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    أبرز ما يتميز به أسلوبك في التدريس — اختيارية
                  </label>
                  <textarea
                    rows={2}
                    value={teacherHighlights}
                    onChange={(e) => setTeacherHighlights(e.target.value)}
                    placeholder="مثال: التركيز على تبسيط القواعد الصعبة، الامتحانات التفاعلية الفورية، المتابعة الفردية..."
                    className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-cyan-500 focus:outline-none text-right"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>رقم الواتساب لاستفسارات الطلاب</span>
                    </label>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-cyan-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Megaphone className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <span>رابط قناة التليجرام للمذكرات</span>
                    </label>
                    <input
                      type="text"
                      value={telegramChannel}
                      onChange={(e) => setTelegramChannel(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-7 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white dark:text-slate-950 font-black text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>حفظ تعديلات الملف الشخصي</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Read-Only Teacher Credentials & Security Policy */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-cyan-500/30 shadow-xl space-y-6">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">بيانات الدخول والحماية الأمنية</h3>
              </div>

              {/* Read-Only Credentials Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-right">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">البريد الإلكتروني المعتمد:</span>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-cyan-700 dark:text-cyan-300 break-all select-all font-bold">
                    {teacherPlatform?.teacherEmail || 'Mrenglishlangue9190krt@mnsa.sea.com'}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">كلمة المرور المشفرة:</span>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-amber-700 dark:text-amber-300 break-all select-all flex items-center justify-between font-bold">
                    <span>{teacherPlatform?.teacherPassword || 'ff-engl1-00p$zmnes-sea'}</span>
                    <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  </div>
                </div>
              </div>

              {/* Security Policy Notice */}
              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 dark:border-amber-500/40 text-amber-800 dark:text-amber-200/90 text-xs leading-relaxed space-y-2">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-black">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>تنبيه أمني هام بشأن تعديل البيانات:</span>
                </div>
                <p>
                  وفقاً لسياسة الأمان الصارمة لمنظومة <strong>SEA Smart Educational Authority</strong>، يتم تعديل البريد الإلكتروني وكلمة المرور حصرياً وبشكل مشفر عبر <strong>الإدارة العليا (Super Admin)</strong> لضمان حماية محتوى المعلم ومنع أي محاولات اختراق أو انتحال.
                </p>
                <div className="pt-2 border-t border-amber-500/20 dark:border-amber-500/30 flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-300">
                  <span>خط الدعم الفني المباشر للمعلمين:</span>
                  <span className="font-mono">01099887766</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white block">حساب المنصة موثق بالكامل</span>
                  <span>تم تفعيل العلامة المائية المشفرة على كافة الفيديوهات.</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Modal: Create Course */}
      <CreateCourseModal
        isOpen={isCreateCourseModalOpen}
        onClose={() => setIsCreateCourseModalOpen(false)}
        onSubmit={handleCreateCourse}
        platformId={teacherPlatform?.id || 'platform-english-01'}
      />

      {/* Modal: Edit Teacher Professional Profile */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-right overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl p-6 sm:p-8 border shadow-2xl space-y-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
                  🎓
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black">بيانات ومعلومات المعلم المهنية</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">تظهر هذه المعلومات للطلاب وأولياء الأمور بالصفحة الرئيسية للمنصة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={(e) => {
              handleSavePlatformSettings(e);
              setIsEditProfileModalOpen(false);
            }} className="space-y-5">

              {/* Warning Notice about Honesty */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs leading-relaxed font-bold flex items-start gap-2.5">
                <span className="text-base shrink-0">⚠️</span>
                <div>
                  <span className="font-black block mb-0.5">تنبيه هام للأمانة المهنية والمصداقية:</span>
                  يرجى التحلي بالصدق والأمانة التامة عند كتابة خبراتك وسنوات تدريسك وشهاداتك؛ فهذه المعلومات ستظهر في الصفحة الرئيسية لطلابك وأولياء الأمور لبناء ثقة تعليمية حقيقية. (جميع هذه الحقول اختيارية، وإذا تركتها فارغة لن يظهر أي قسم أو زر للطلاب).
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  النبذة التعريفية العامة للمعلم (Bio) — اختيارية
                </label>
                <textarea
                  rows={3}
                  value={teacherBio}
                  onChange={(e) => setTeacherBio(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-cyan-500 focus:outline-none text-right"
                  placeholder="مثال: معلم أول لغة إنجليزية وخبير تدريس مناهج الثانوية العامة بنظام الفهم الحديث..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    مدة وسنوات الخبرة والتدريس — اختيارية
                  </label>
                  <input
                    type="text"
                    value={teacherExperienceYears}
                    onChange={(e) => setTeacherExperienceYears(e.target.value)}
                    placeholder="مثال: 12 سنة خبرة في تدريس الثانوية"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    الشهادات والاعتمادات والدرجات العلمية — اختيارية
                  </label>
                  <input
                    type="text"
                    value={teacherCertificates}
                    onChange={(e) => setTeacherCertificates(e.target.value)}
                    placeholder="مثال: ليسانس آداب وتربية + ماجستير طرق تدريس"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  أبرز ما يتميز به أسلوبك وشرحك في التدريس — اختيارية
                </label>
                <textarea
                  rows={2}
                  value={teacherHighlights}
                  onChange={(e) => setTeacherHighlights(e.target.value)}
                  placeholder="مثال: التركيز على تبسيط القواعد المعقدة، حل نماذج امتحانات شاملة أسبوعياً، متابعة دورية مع ولي الأمر..."
                  className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-cyan-500 focus:outline-none text-right"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>رقم الواتساب للاستفسارات</span>
                  </label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>رابط قناة التليجرام الرسمية</span>
                  </label>
                  <input
                    type="text"
                    value={telegramChannel}
                    onChange={(e) => setTelegramChannel(e.target.value)}
                    placeholder="https://t.me/yourchannel"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 cursor-pointer transition-all flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>حفظ ونشر المعلومات بالصفحة الرئيسية ✨</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Edit Course Cover Modal */}
      {courseForCoverEdit && (
        <EditCourseCoverModal
          course={courseForCoverEdit}
          isOpen={!!courseForCoverEdit}
          onClose={() => setCourseForCoverEdit(null)}
          onSaveCover={handleSaveCourseCover}
        />
      )}

      {/* Edit Course Inner Details Modal */}
      {courseForDetailsEdit && (
        <EditCourseDetailsModal
          course={courseForDetailsEdit}
          isOpen={!!courseForDetailsEdit}
          onClose={() => setCourseForDetailsEdit(null)}
          onSaveCourse={handleSaveCourseDetails}
        />
      )}

      {/* Delete Course Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-rose-500/30 p-6 shadow-2xl space-y-5 text-right">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                تأكيد حذف الكورس نهائياً؟
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                أنت على وشك حذف كورس <strong className="text-rose-600 dark:text-rose-400 font-bold">"{courseToDelete.title}"</strong> بشكل نهائي. سيتم حذف جميع المحاضرات والملفات والامتحانات المرتبطة به.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-[11px] text-rose-700 dark:text-rose-300 font-semibold leading-relaxed">
              ⚠️ تنبيه: هذا الإجراء لا يمكن التراجع عنه. إذا كنت ترغب فقط في إخفاء الكورس عن الطلاب مؤقتاً، يمكنك الضغط على "إلغاء النشر / تحويل لمسودة" بدلاً من الحذف.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                إلغاء وتراجع
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCourse}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>تأكيد الحذف النهائي</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

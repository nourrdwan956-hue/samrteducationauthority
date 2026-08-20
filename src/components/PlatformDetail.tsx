import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Star,
  Users,
  BookOpen,
  Award,
  PlayCircle,
  CheckCircle,
  Phone,
  Send,
  ArrowLeft,
  Lock,
  Sparkles,
  Plus,
  Sliders,
} from 'lucide-react';
import { CreateCourseModal } from './teacher/CreateCourseModal';
import { DEFAULT_COURSE_COVER } from './teacher/CourseCoverUploader';
import { CourseSubscribeModal } from './CourseSubscribeModal';
import { Course } from '../types';

export const PlatformDetail: React.FC = () => {
  const {
    currentPlatform,
    courses,
    setSelectedCourseId,
    setSelectedLessonId,
    setCurrentView,
    enrollInCourse,
    createCourse,
    currentUser,
    setIsAuthModalOpen,
    theme,
  } = useApp();

  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
  const [isTeacherProfileModalOpen, setIsTeacherProfileModalOpen] = useState(false);
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);

  const hasTeacherDetails = Boolean(
    currentPlatform?.teacherExperienceYears ||
    currentPlatform?.teacherCertificates ||
    currentPlatform?.teacherHighlights
  );

  const isLight = theme === 'light';

  if (!currentPlatform) {
    return (
      <div className={`text-center py-20 ${isLight ? 'text-slate-700' : 'text-white'}`}>
        <p>المنصة غير موجودة.</p>
      </div>
    );
  }

  const platformCourses = (courses || []).filter((c) => {
    if (c.platformId !== currentPlatform.id) return false;
    if (currentUser?.role === 'teacher' || currentUser?.role === 'admin' || currentUser?.role === 'super_admin') {
      return true;
    }
    return c.status === 'published' || c.isPublished !== false;
  });

  const handleCreateCourseSubmit = (courseData: Partial<Course>) => {
    createCourse({
      ...courseData,
      platformId: currentPlatform.id,
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12 text-right">
      
      {/* Platform Hero Banner */}
      <div
        className={`relative rounded-3xl overflow-hidden border shadow-2xl transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-slate-200/60' : 'bg-slate-900 border-slate-800 shadow-slate-950'
        }`}
      >
        
        {/* Banner image with overlay */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img
            src={currentPlatform.bannerImage}
            alt={currentPlatform.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div
            className={`absolute inset-0 ${
              isLight
                ? 'bg-gradient-to-t from-white via-white/70 to-black/30'
                : 'bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20'
            }`}
          />
        </div>

        {/* Content Box */}
        <div className="relative p-6 sm:p-10 -mt-20 z-10">
          <div
            className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            
            {/* Teacher Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative flex items-center gap-2">
                <img
                  src={currentPlatform.teacherAvatar}
                  alt={currentPlatform.teacherName}
                  referrerPolicy="no-referrer"
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 shadow-2xl shrink-0 ${
                    isLight ? 'border-white' : 'border-slate-900'
                  }`}
                />
                <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-400/30 p-1 items-center justify-center shrink-0 overflow-hidden shadow-lg">
                  <img 
                    src="/teacher-logo.png" 
                    alt="شعار المعلمين SEA" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="px-3 py-1 rounded-xl text-xs font-black shadow-md"
                    style={{ backgroundColor: currentPlatform.themeColor, color: '#090d16' }}
                  >
                    {currentPlatform.subject}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 border ${
                      isLight
                        ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                        : 'text-emerald-400 bg-emerald-950/70 border-emerald-800/60'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    منصة معتمدة من SEA
                  </span>
                </div>

                <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {currentPlatform.name}
                </h1>
                <p className="text-sm font-bold text-sky-600 dark:text-cyan-400">
                  {currentPlatform.teacherName} • {currentPlatform.teacherTitle}
                </p>

                {hasTeacherDetails && (
                  <div className="pt-1.5">
                    <button
                      type="button"
                      onClick={() => setIsTeacherProfileModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-black text-xs inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>عرض المعلومات الشخصية والمهنية للمعلم 🎓</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div
              className={`flex items-center gap-4 p-3 rounded-2xl border backdrop-blur-md ${
                isLight
                  ? 'bg-slate-50/90 border-slate-200 shadow-sm'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div className="text-center px-2">
                <span className={`text-xs block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>تقييم الطلاب</span>
                <span className="text-base font-black text-amber-500 flex items-center gap-1 justify-center">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {currentPlatform.rating}
                </span>
              </div>
              <div className={`w-px h-8 ${isLight ? 'bg-slate-300' : 'bg-slate-800'}`} />
              <div className="text-center px-2">
                <span className={`text-xs block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>الطلاب المشتركين</span>
                <span className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {currentPlatform.totalStudentsCount.toLocaleString()}
                </span>
              </div>
            </div>

          </div>

          {/* Teacher Bio & Direct Contact */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
            <div className="lg:col-span-2 space-y-4">
              <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>عن المعلم وطريقة الشرح</h3>
              <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                {currentPlatform.teacherBio}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {(currentPlatform.features || []).map((feat, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 text-xs p-2.5 rounded-xl border ${
                      isLight
                        ? 'text-slate-700 bg-slate-50 border-slate-200'
                        : 'text-slate-300 bg-slate-950/60 border-slate-800/60'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Box */}
            <div
              className={`p-5 rounded-2xl border space-y-3 h-fit ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <h4 className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>للاستفسارات والاشتراك المباشر</h4>
              {currentPlatform.whatsappNumber && (
                <a
                  href={`https://wa.me/${currentPlatform.whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>تواصل واتساب مع المعلم</span>
                </a>
              )}
              {currentPlatform.telegramChannel && (
                <a
                  href={currentPlatform.telegramChannel}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>قناة التيليجرام الرسمية</span>
                </a>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Courses Catalog Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              الكورسات والمناهج المتاحة ({platformCourses.length})
            </h2>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              اختر الكورس المناسب لسنتك الدراسية وابدأ المشاهدة والحل فوراً
            </p>
          </div>

          <div className="flex items-center gap-2">
            {currentUser?.role === 'teacher' && (
              <button
                type="button"
                onClick={() => setIsCreateCourseModalOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ إنشاء كورس جديد في هذه المنصة</span>
              </button>
            )}
            {currentUser?.role === 'teacher' && (
              <button
                type="button"
                onClick={() => setCurrentView('teacher_dashboard')}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>لوحة تحكم المعلم</span>
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platformCourses.map((course) => {
            const isEnrolled = currentUser?.enrolledCourseIds.includes(course.id);
            const firstLesson = course.modules?.[0]?.lessons?.[0];

            return (
              <div
                key={course.id}
                className={`rounded-3xl border shadow-2xl overflow-hidden flex flex-col justify-between transition-all group ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-cyan-400 shadow-slate-200/60'
                    : 'bg-slate-900 border-slate-800 hover:border-cyan-500/50'
                }`}
              >
                <div>
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={course.thumbnail || DEFAULT_COURSE_COVER}
                      alt={course.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_COURSE_COVER;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-xs font-bold text-cyan-300 border border-cyan-500/30">
                      {course.gradeLevel}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3
                      className={`text-base font-black transition-colors line-clamp-2 ${
                        isLight ? 'text-slate-900 group-hover:text-cyan-700' : 'text-white group-hover:text-cyan-400'
                      }`}
                    >
                      {course.title}
                    </h3>
                    <p className={`text-xs line-clamp-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {course.subtitle || course.description}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className={`text-xs block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>سعر الاشتراك</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                            {course.price} ج.م
                          </span>
                          {course.originalPrice && (
                            <span className="text-xs line-through text-slate-400 font-bold">
                              {course.originalPrice} ج.م
                            </span>
                          )}
                        </div>
                      </div>

                      <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {course.lessonsCount || 12} محاضرة وواجب
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-2">
                  {isEnrolled ? (
                    <button
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        if (firstLesson) {
                          setSelectedLessonId(firstLesson.id);
                          setCurrentView('lesson_player');
                        } else {
                          setCurrentView('course_detail');
                        }
                      }}
                      className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>متابعة المشاهدة والامتحانات</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setSelectedCourseId(course.id);
                          setCurrentView('course_detail');
                        }}
                        className={`py-2.5 rounded-xl font-bold text-xs transition-colors text-center cursor-pointer ${
                          isLight
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            : 'bg-slate-950 hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        تفاصيل المحتوى
                      </button>

                      <button
                        onClick={() => {
                          if (!currentUser) {
                            setIsAuthModalOpen(true);
                          } else {
                            setSelectedCourseForModal(course);
                          }
                        }}
                        className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors text-center cursor-pointer shadow-md"
                      >
                        اشترك الآن
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={isCreateCourseModalOpen}
        onClose={() => setIsCreateCourseModalOpen(false)}
        onSubmit={handleCreateCourseSubmit}
        platformId={currentPlatform.id}
      />

      {/* Course Subscription / Code Modal */}
      {selectedCourseForModal && (
        <CourseSubscribeModal
          isOpen={Boolean(selectedCourseForModal)}
          onClose={() => setSelectedCourseForModal(null)}
          course={selectedCourseForModal}
        />
      )}

      {/* Teacher Profile & Professional Info Modal */}
      {isTeacherProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-xl rounded-3xl p-6 sm:p-8 border shadow-2xl space-y-6 ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'}`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={currentPlatform.teacherAvatar}
                  alt={currentPlatform.teacherName}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-2xl object-cover border border-cyan-500/30"
                />
                <div>
                  <h3 className="text-base font-black">{currentPlatform.teacherName}</h3>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 font-bold">{currentPlatform.teacherTitle}</p>
                </div>
              </div>
              <button
                onClick={() => setIsTeacherProfileModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs sm:text-sm max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
              
              {currentPlatform.teacherExperienceYears && (
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 space-y-1">
                  <span className="text-[11px] font-bold text-cyan-700 dark:text-cyan-300 block">مدة وسنوات الخبرة والتدريس:</span>
                  <p className="font-black text-slate-900 dark:text-white">{currentPlatform.teacherExperienceYears}</p>
                </div>
              )}

              {currentPlatform.teacherCertificates && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block">الشهادات والاعتمادات والدرجات العلمية:</span>
                  <p className="font-black text-slate-900 dark:text-white">{currentPlatform.teacherCertificates}</p>
                </div>
              )}

              {currentPlatform.teacherHighlights && (
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                  <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 block">أبرز ما يتميز به أسلوب التدريس:</span>
                  <p className="font-medium leading-relaxed text-slate-800 dark:text-slate-200">{currentPlatform.teacherHighlights}</p>
                </div>
              )}

              {currentPlatform.teacherBio && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">النبذة التعريفية:</span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{currentPlatform.teacherBio}</p>
                </div>
              )}

              <div className="pt-2 text-center text-[11px] text-slate-400">
                ✨ كافة البيانات الشخصية والمهنية معتمدة من المعلم وموثقة عبر منصة سمارت إيديوكشن (Smart Education).
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsTeacherProfileModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs text-slate-800 dark:text-white cursor-pointer transition-colors"
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


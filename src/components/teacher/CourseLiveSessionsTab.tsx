import React, { useState } from 'react';
import {
  Radio,
  Plus,
  Video,
  Calendar,
  Clock,
  ExternalLink,
  Users,
  Sparkles,
  Play,
  Trash2,
  X,
  Copy,
  ArrowRightLeft,
  CheckCircle,
  Tv,
  MessageSquare,
  Send,
  Info,
  FolderPlus,
  Layers,
  HelpCircle,
  Share2,
} from 'lucide-react';
import { Course, CourseModule, Lesson, LiveSession } from '../../types';
import { extractYouTubeId } from '../../lib/videoUtils';
import { encryptVideoUrl } from '../../lib/videoEncryption';

interface CourseLiveSessionsTabProps {
  course: Course;
  courses?: Course[];
  liveSessions: LiveSession[];
  onAddLiveSession: (session: Omit<LiveSession, 'id' | 'createdAt'>) => void;
  onUpdateLiveSession: (sessionId: string, updates: Partial<LiveSession>) => void;
  onDeleteLiveSession: (sessionId: string, courseName: string) => void;
  onUpdateCourse?: (courseId: string, updates: Partial<Course>) => void;
  onAddLesson?: (courseId: string, moduleId: string, lesson: Partial<Lesson>) => void;
  onToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, msg?: string) => void;
}

export const CourseLiveSessionsTab: React.FC<CourseLiveSessionsTabProps> = ({
  course,
  courses,
  liveSessions,
  onAddLiveSession,
  onUpdateLiveSession,
  onDeleteLiveSession,
  onUpdateCourse,
  onAddLesson,
  onToast,
}) => {
  const sessions = liveSessions.filter((s) => s.courseId === course.id);

  // Schedule Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-02-25');
  const [time, setTime] = useState('08:00 مساءً');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [platform, setPlatform] = useState<'youtube_live' | 'zoom' | 'jitsi'>('youtube_live');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [description, setDescription] = useState('');

  // Active Live Room Modal State
  const [activeLiveSession, setActiveLiveSession] = useState<LiveSession | null>(null);
  const [chatMessages, setChatMessages] = useState<{ id: string; user: string; text: string; time: string; isTeacher?: boolean }[]>([
    { id: '1', user: 'أحمد محمود (طالب)', text: 'السلام عليكم يا مستر، هل البث يعمل بجودة عالية؟', time: '08:01' },
    { id: '2', user: 'المعلم (أنت)', text: 'أهلاً بك يا بطل! نعم البث عبر سيرفرات يوتيوب بدقة HD وبدون أي تقطيع.', time: '08:02', isTeacher: true },
  ]);
  const [newChatMessage, setNewChatMessage] = useState('');

  // Transfer / Copy Modal State
  const [transferringSession, setTransferringSession] = useState<LiveSession | null>(null);
  const [targetCourseId, setTargetCourseId] = useState<string>(course.id);
  const [targetModuleId, setTargetModuleId] = useState<string>('');
  const [transferMode, setTransferMode] = useState<'duplicate' | 'move'>('duplicate');

  // Convert Completed Session to Module Video Lesson Modal
  const [convertingSession, setConvertingSession] = useState<LiveSession | null>(null);
  const [convertModuleId, setConvertModuleId] = useState<string>(course.modules?.[0]?.id || '');

  // Handle Schedule New Live Session
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const rawVideoId = extractYouTubeId(meetingUrl.trim()) || 'dQw4w9WgXcQ';
    const encryptedVideoId = encryptVideoUrl(rawVideoId);
    const encryptedMeetingUrl = encryptVideoUrl(meetingUrl.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');

    const newSession: LiveSession = {
      id: 'live_' + Date.now(),
      courseId: course.id,
      moduleId: selectedModuleId || undefined,
      title: title.trim(),
      date,
      time,
      durationMinutes: 60,
      platform,
      meetingUrl: encryptedMeetingUrl,
      youtubeVideoId: encryptedVideoId,
      status: 'upcoming',
      description: description.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onAddLiveSession(newSession);
    setIsModalOpen(false);
    setTitle('');
    setMeetingUrl('');
    setDescription('');
    setSelectedModuleId('');
  };

  // Toggle Live Status
  const handleStatusChange = (id: string, newStatus: 'upcoming' | 'live' | 'completed') => {
    onUpdateLiveSession(id, { status: newStatus });
    if (newStatus === 'live') {
      onToast('success', 'تم بدء البث المباشر الآن! 🔴', 'الطلاب يمكنهم الانضمام ومتابعة الشرح والتفاعل معكم.');
    } else if (newStatus === 'completed') {
      onToast('info', 'تم إنهاء البث المباشر 🟢', 'يمكنك الآن تحويل البث إلى درس مسجل داخل أية وحدة.');
    }
  };

  // Delete Session
  const handleDelete = (id: string) => {
    onDeleteLiveSession(id, course.title);
  };

  // Submit Live Chat Message
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        id: 'msg_' + Date.now(),
        user: 'المعلم (أنت)',
        text: newChatMessage.trim(),
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        isTeacher: true,
      },
    ]);
    setNewChatMessage('');
  };

  // Confirm Convert Completed Session to Module Video Lesson
  const handleConfirmConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingSession || !convertModuleId) return;

    if (onAddLesson) {
      onAddLesson(course.id, convertModuleId, {
        title: `تسجيل بث حي: ${convertingSession.title}`,
        type: 'video',
        youtubeVideoId: convertingSession.youtubeVideoId || extractYouTubeId(convertingSession.meetingUrl),
        durationMinutes: convertingSession.durationMinutes || 60,
        description: `محاضرة بث مباشر مسجلة بتاريخ ${convertingSession.date}`,
        playerMode: 'platform',
        isPublished: true,
        status: 'published',
      });

      onToast('success', 'تم تحويل البث المباشر إلى درس فيديو مسجل بنجاح! 🎬', 'أصبح الفيديو مدرجاً كدرس دائم داخل الوحدة المحددة للطلاب.');
    } else {
      onToast('info', 'تمت المعالجة', 'تم اعتماد تحويل الفيديو داخل الوحدة.');
    }

    setConvertingSession(null);
  };

  // Confirm Transfer / Copy Live Session to Another Course
  const handleConfirmTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferringSession || !targetCourseId) return;

    const targetCourseObj = (courses || [course]).find((c) => c.id === targetCourseId);

    if (transferMode === 'duplicate') {
      const clonedSession: LiveSession = {
        ...transferringSession,
        id: 'live_copy_' + Date.now() + Math.floor(Math.random() * 1000),
        courseId: targetCourseId,
        moduleId: targetModuleId || undefined,
        title: `${transferringSession.title} (نسخة)`,
        createdAt: new Date().toISOString(),
      };
      onAddLiveSession(clonedSession);
      onToast('success', 'تم نسخ وتكرار البث المباشر بنجاح! 📋', `أصبح البث مدرجاً أيضاً في كورس "${targetCourseObj?.title || ''}".`);
    } else {
      // Move session
      onUpdateLiveSession(transferringSession.id, { 
        courseId: targetCourseId, 
        moduleId: targetModuleId || undefined 
      });
      onToast('success', 'تم نقل البث المباشر بنجاح! 🚚', `تم تعديل مكان البث لكورس "${targetCourseObj?.title || ''}".`);
    }

    setTransferringSession(null);
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Header Info Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />

        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              نظام البث المباشر الحي عبر سيرفرات يوتيوب (YouTube Live)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              استهلاك 0MB من مساحتك
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed max-w-2xl">
            يمكنك جدولة بث حي مباشر وغير مدرج Unlisted على يوتيوب، أو إدراجه داخل أية <strong>وحدة دراسية محددة</strong> في الكورس. يتحمل يوتيوب معالجة الفيديو والبث مجاناً بالكامل دون التأثير على خوادم أو مساحة المنصة، وبعد انتهاء البث يتحول تلقائياً لدرس فيديو مسجل يمكن نقله أو نسخه لأي كورس آخر!
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedModuleId(course.modules?.[0]?.id || '');
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>جدولة بث مباشر جديد</span>
        </button>
      </div>

      {/* Live Sessions List */}
      {sessions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <Video className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">لا توجد حصص بث مباشر مجدولة في هذا الكورس</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            اضغط زر "جدولة بث مباشر جديد" لبدء بث حي عبر سيرفرات يوتيوب وإدراجه داخل وحدات الكورس.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>جدولة أول بث مباشر</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((sess) => {
            const assignedModule = (course.modules || []).find((m) => m.id === sess.moduleId);

            return (
              <div
                key={sess.id}
                className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-sm space-y-4 ${
                  sess.status === 'live'
                    ? 'border-rose-500/60 ring-2 ring-rose-500/20'
                    : sess.status === 'completed'
                    ? 'border-emerald-500/40'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        sess.status === 'live'
                          ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40'
                          : sess.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Radio className="w-6 h-6" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        {sess.status === 'live' && (
                          <span className="px-3 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center gap-1 shadow-md">
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                            <span>بث حي مباشر الآن 🔴</span>
                          </span>
                        )}

                        {sess.status === 'upcoming' && (
                          <span className="px-3 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 text-[10px] font-black flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>مجدول قادماً</span>
                          </span>
                        )}

                        {sess.status === 'completed' && (
                          <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-black flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>مكتمل ومسجل 🟢</span>
                          </span>
                        )}

                        {/* Platform Badge */}
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black">
                          {sess.platform === 'youtube_live' ? '📺 YouTube Live (سيرفرات يوتيوب)' : sess.platform === 'zoom' ? 'Zoom Meeting' : 'Jitsi Room'}
                        </span>

                        {/* Assigned Module Badge */}
                        {assignedModule ? (
                          <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 text-[10px] font-black flex items-center gap-1">
                            📦 داخل وحدة: {assignedModule.title}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
                            عام لكامل الكورس
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        {sess.title}
                      </h4>

                      {sess.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {sess.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {sess.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          {sess.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions Bar */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 self-start sm:self-center">
                    
                    {/* Enter / Join Live Room Modal */}
                    <button
                      type="button"
                      onClick={() => setActiveLiveSession(sess)}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Tv className="w-4 h-4" />
                      <span>{sess.status === 'live' ? 'دخول غرفة البث المباشر الآن' : 'معاينة شاشة البث'}</span>
                    </button>

                    {/* Status Toggle Switcher */}
                    {sess.status === 'upcoming' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(sess.id, 'live')}
                        className="px-3 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs cursor-pointer"
                      >
                        بدء البث 🔴
                      </button>
                    )}

                    {sess.status === 'live' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(sess.id, 'completed')}
                        className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
                      >
                        إنهاء البث 🟢
                      </button>
                    )}

                    {/* Convert Completed Session into Module Video Lesson */}
                    {sess.status === 'completed' && (
                      <button
                        type="button"
                        onClick={() => {
                          setConvertingSession(sess);
                          setConvertModuleId(sess.moduleId || course.modules?.[0]?.id || '');
                        }}
                        className="px-3 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        title="تحويل البث المكتمل إلى درس فيديو مسجل دائم داخل إحدى الوحدات"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>تحويل لدرس مسجل</span>
                      </button>
                    )}

                    {/* Transfer / Copy Session Modal */}
                    <button
                      type="button"
                      onClick={() => {
                        setTransferringSession(sess);
                        setTargetCourseId(course.id);
                        setTargetModuleId(sess.moduleId || '');
                      }}
                      className="px-3 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      title="نسخ أو نقل هذا البث لكورس أو وحدة أخرى"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>نسخ / نقل</span>
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(sess.id)}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="حذف البث"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Schedule Live Stream */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-right relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">جدولة بث مباشر حي (YouTube Live)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">إدراج البث المباشر داخل الكورس أو وحدة محددة</p>
              </div>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان بث المباشر *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مراجعة ليلة الامتحان والرد التفاعلي على الأسئلة"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-rose-500 focus:outline-none"
                />
              </div>

              {/* Module / Unit Assignment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>تحديد الوحدة داخل الكورس (اختياري)</span>
                  <span className="text-[11px] text-slate-500 font-normal">لتثبيته داخل دروس تلك الوحدة</span>
                </label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-rose-500 focus:outline-none cursor-pointer"
                >
                  <option value="">-- بدون وحدة (بث مباشر عام للكورس) --</option>
                  {(course.modules || []).map((mod) => (
                    <option key={mod.id} value={mod.id}>
                      📦 {mod.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Platform Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  منصة تقنية البث المباشر
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlatform('youtube_live')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      platform === 'youtube_live'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Tv className="w-4 h-4" />
                    <span>YouTube Live</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlatform('zoom')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      platform === 'zoom'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>Zoom Meeting</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlatform('jitsi')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      platform === 'jitsi'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Jitsi Room</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رابط البث غير المدرج Unlisted على يوتيوب (YouTube Live Link or Video ID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ضع رابط البث https://www.youtube.com/watch?v=... أو dQw4w9WgXcQ"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:border-rose-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  💡 تلميح: أنشئ بثاً حياً غير مدرج (Unlisted) على قناتك، وضع رابط البث هنا لتشغيله بسلاسة داخل المنصة دون استهلاك مساحتك.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">التاريخ</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الوقت</label>
                  <input
                    type="text"
                    placeholder="08:00 مساءً"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">وصف أو تعليمات للبث (اختياري)</label>
                <textarea
                  rows={2}
                  placeholder="أدخل أية إرشادات ترغب في إظهارها للطلاب قبل انطلاق البث..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 cursor-pointer"
                >
                  جدولة البث المباشر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Interactive Live Room Player & Questions Chat */}
      {activeLiveSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-6xl rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6 text-right relative my-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>بث حقيقي مباشر على سيرفرات يوتيوب 📺</span>
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    {activeLiveSession.date} • {activeLiveSession.time}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mt-1.5">
                  {activeLiveSession.title}
                </h3>
              </div>

              <button
                onClick={() => setActiveLiveSession(null)}
                className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Embedded YouTube Live Player */}
              <div className="lg:col-span-2 space-y-3">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${activeLiveSession.youtubeVideoId || extractYouTubeId(activeLiveSession.meetingUrl)}?autoplay=1&rel=0`}
                    title={activeLiveSession.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle className="w-4 h-4" />
                    <span>البث يعمل عبر خوادم يوتيوب العالمية بمرونة وسلاسة فائقة</span>
                  </span>

                  <a
                    href={activeLiveSession.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-300 border border-rose-500/30 font-bold hover:bg-rose-600/30 transition-colors flex items-center gap-1"
                  >
                    <span>فتح في يوتيوب</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Real-time Questions & Chat Feed */}
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 flex flex-col justify-between h-[420px] text-right">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-rose-500" />
                      <span>دردشة واستفسارات الطلاب المباشرة</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">نشط الآن 🟢</span>
                  </div>

                  <div className="space-y-2.5 overflow-y-auto max-h-[290px] pl-1">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-2.5 rounded-xl text-xs space-y-1 ${
                          msg.isTeacher
                            ? 'bg-rose-500/10 border border-rose-500/20 text-rose-200'
                            : 'bg-slate-900 border border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className={msg.isTeacher ? 'text-rose-400' : 'text-cyan-400'}>{msg.user}</span>
                          <span className="text-slate-500">{msg.time}</span>
                        </div>
                        <p className="font-semibold text-slate-200">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Send Chat Message Form */}
                <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-3 border-t border-slate-800">
                  <input
                    type="text"
                    placeholder="اكتب رداً أو سؤالاً للطلاب..."
                    value={newChatMessage}
                    onChange={(e) => setNewChatMessage(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:border-rose-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </form>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Convert Completed Live Session to Video Lesson */}
      {convertingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/40 p-6 shadow-2xl space-y-4 text-right">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">تحويل البث لمسجل دائِم</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">إدراج تسجِيل البث المباشر كدرس فيديو داخل إحدى الوحدات</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-300 font-bold">
              البث المحدد: "{convertingSession.title}"
            </div>

            <form onSubmit={handleConfirmConvert} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اختر الوحدة المستهدفة لإدراج الدرس داخلها *
                </label>
                <select
                  required
                  value={convertModuleId}
                  onChange={(e) => setConvertModuleId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  {(course.modules || []).map((mod) => (
                    <option key={mod.id} value={mod.id}>
                      📦 {mod.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setConvertingSession(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  تحويل لدرس فيديو مسجل 🎬
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Copy / Transfer Live Session to Another Course & Unit */}
      {transferringSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-indigo-500/30 p-6 shadow-2xl space-y-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">نسخ أو نقل البث المباشر لكورس آخر</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">تكرار البث أو نقل مكانه إلى كورس ووحدة أخرى</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTransferringSession(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 font-bold">
              البث المحدد: <span className="text-indigo-600 dark:text-indigo-400 font-black">"{transferringSession.title}"</span>
            </div>

            <form onSubmit={handleConfirmTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  نوع العملية
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransferMode('duplicate')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      transferMode === 'duplicate'
                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                    <span>تكرار نسخة جديدة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTransferMode('move')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      transferMode === 'move'
                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>نقل مكان البث المباشر</span>
                  </button>
                </div>
              </div>

              {/* Target Course Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اختر الكورس المستهدف *
                </label>
                <select
                  required
                  value={targetCourseId}
                  onChange={(e) => {
                    setTargetCourseId(e.target.value);
                    setTargetModuleId('');
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  {(courses && courses.length > 0 ? courses : [course]).map((c) => (
                    <option key={c.id} value={c.id}>
                      🎓 {c.title} {c.id === course.id ? '(الكورس الحالي)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Module Selection */}
              {(() => {
                const selectedTargetCourse = (courses || [course]).find((c) => c.id === targetCourseId);
                const targetModules = selectedTargetCourse?.modules || [];

                return (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      اختر الوحدة داخل الكورس المستهدف (اختياري)
                    </label>
                    <select
                      value={targetModuleId}
                      onChange={(e) => setTargetModuleId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none cursor-pointer"
                    >
                      <option value="">-- بدون وحدة (بث مباشر عام للكورس) --</option>
                      {targetModules.map((mod) => (
                        <option key={mod.id} value={mod.id}>
                          📦 {mod.title}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })()}

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTransferringSession(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{transferMode === 'duplicate' ? 'نسخ وتكرار البث المباشر' : 'نقل البث المباشر الآن'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

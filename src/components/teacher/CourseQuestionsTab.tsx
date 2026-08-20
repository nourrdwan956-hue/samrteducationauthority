import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Course, LessonQuestion } from '../../types';
import {
  MessageSquare,
  HelpCircle,
  Clock,
  UserCheck,
  Send,
  CornerDownLeft,
  CheckCircle2,
  Trash2,
  Filter,
  Search,
  BookOpen,
  Video,
} from 'lucide-react';

interface CourseQuestionsTabProps {
  course: Course;
  courses: Course[];
}

export const CourseQuestionsTab: React.FC<CourseQuestionsTabProps> = ({
  course,
  courses,
}) => {
  const {
    lessonQuestions,
    replyToLessonQuestion,
    updateLessonQuestionStatus,
    deleteLessonQuestion,
    addToast,
  } = useApp();

  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>(course.id);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'answered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  // Filter questions
  const filteredQuestions = (lessonQuestions || []).filter((q) => {
    // Course match
    if (selectedCourseFilter !== 'all' && q.courseId !== selectedCourseFilter) {
      return false;
    }
    // Status match
    if (statusFilter !== 'all' && q.status !== statusFilter) {
      return false;
    }
    // Search match
    if (searchQuery.trim()) {
      const sq = searchQuery.toLowerCase();
      const matchText = q.questionText.toLowerCase().includes(sq);
      const matchStudent = q.studentName.toLowerCase().includes(sq) || (q.studentCode && q.studentCode.toLowerCase().includes(sq));
      const matchLesson = q.lessonTitle.toLowerCase().includes(sq);
      if (!matchText && !matchStudent && !matchLesson) {
        return false;
      }
    }
    return true;
  });

  const handleSendReply = (questionId: string) => {
    const text = replyTextMap[questionId];
    if (!text || !text.trim()) {
      addToast('info', 'اكتب الرد أولاً', 'يرجى كتابة نص الرد قبل الإرسال.');
      return;
    }

    replyToLessonQuestion(questionId, text.trim());
    setReplyTextMap((prev) => ({ ...prev, [questionId]: '' }));
    addToast('success', 'تم إرسال الرد للوصول إلى الطالب فوراً 👨‍🏫');
  };

  const formatTime = (secs?: number) => {
    if (secs === undefined) return '';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header & Overview Stats */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sky-500" />
              <span>بنك استفسارات وأسئلة الطلاب على الفيديوهات</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تلقي أسئلة الطلاب على كل محاضرة مع رقم الدقيقة والرد عليها رسمياً ومتابعة استفساراتهم
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-black text-xs">
              إجمالي الأسئلة: {lessonQuestions?.length || 0}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-black text-xs">
              بانتظار الرد: {(lessonQuestions || []).filter((q) => q.status === 'pending').length}
            </span>
          </div>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              تصفية حسب الكورس:
            </label>
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">كل الكورسات التعليمية</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              حالة السؤال:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">بانتظار رد المعلم ⏳</option>
              <option value="answered">تم الرد عليها ✅</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              بحث في نص السؤال أو اسم الطالب:
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث بالاسم أو محتوى السؤال..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* Questions Feed */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
            <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h4 className="text-sm font-black text-slate-700 dark:text-slate-300">
              لا توجد أسئلة تطابق معايير البحث الحالية
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              عندما يسأل الطلاب أي سؤال في أي فيديو، سيصلك إشعار فوري وتجده هنا مباشرة.
            </p>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isAnswered = q.status === 'answered';
            const currentReplyText = replyTextMap[q.id] || '';

            return (
              <div
                key={q.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 transition-all"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        q.studentAvatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                      }
                      alt={q.studentName}
                      className="w-11 h-11 rounded-2xl object-cover border border-cyan-500/40"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {q.studentName}
                        </span>
                        {q.studentCode && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">
                            كود: {q.studentCode}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{q.courseTitle}</span>
                        <span>•</span>
                        <span className="text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          <span>{q.lessonTitle}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {q.timestampSeconds !== undefined && q.timestampSeconds > 0 && (
                      <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-300 font-mono text-xs font-bold border border-sky-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>عند الدقيقة {formatTime(q.timestampSeconds)}</span>
                      </span>
                    )}

                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-black border ${
                        isAnswered
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 animate-pulse'
                      }`}
                    >
                      {isAnswered ? 'تم الرد ✅' : 'بانتظار ردك ⏳'}
                    </span>

                    <button
                      type="button"
                      onClick={() => deleteLessonQuestion(q.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-500 transition-colors cursor-pointer"
                      title="حذف هذا السؤال"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Body */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                  {q.questionText}
                </div>

                {/* Replies Thread */}
                {q.replies && q.replies.length > 0 && (
                  <div className="space-y-2.5 pr-4 border-r-2 border-emerald-500/40">
                    {q.replies.map((rep) => {
                      const isTeacher = rep.authorRole === 'teacher' || rep.authorRole === 'super_admin';
                      return (
                        <div
                          key={rep.id}
                          className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                            isTeacher
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/50 text-emerald-950 dark:text-emerald-100 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black flex items-center gap-1.5">
                              {isTeacher ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>رد المعلم الرسمي ({rep.authorName})</span>
                                </>
                              ) : (
                                <span>{rep.authorName}</span>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(rep.createdAt).toLocaleTimeString('ar-EG', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="font-semibold leading-relaxed whitespace-pre-wrap">
                            {rep.message}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Teacher Reply Input */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="اكتب ردك التوضيحي للطالب..."
                      value={currentReplyText}
                      onChange={(e) =>
                        setReplyTextMap((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendReply(q.id);
                        }
                      }}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendReply(q.id)}
                      disabled={!currentReplyText.trim()}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 shrink-0"
                    >
                      <Send className="w-3.5 h-3.5 rotate-180" />
                      <span>إرسال رد المعلم</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

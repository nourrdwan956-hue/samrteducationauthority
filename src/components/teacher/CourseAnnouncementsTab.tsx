import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Pin,
  Trash2,
  Send,
  Calendar,
  Sparkles,
  Megaphone,
} from 'lucide-react';
import { CourseAnnouncement, Course } from '../../types';

interface CourseAnnouncementsTabProps {
  course: Course;
  announcements: CourseAnnouncement[];
  onAddAnnouncement: (announcement: Omit<CourseAnnouncement, 'id' | 'createdAt'>) => void;
  onDeleteAnnouncement: (id: string) => void;
}

export const CourseAnnouncementsTab: React.FC<CourseAnnouncementsTabProps> = ({
  course,
  announcements,
  onAddAnnouncement,
  onDeleteAnnouncement,
}) => {
  const courseAnnouncements = (announcements || []).filter((a) => a.courseId === course.id);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    onAddAnnouncement({
      courseId: course.id,
      title: title.trim(),
      message: message.trim(),
      isPinned,
    });

    setIsCreateModalOpen(false);
    setTitle('');
    setMessage('');
    setIsPinned(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              التنبيهات والإعلانات الفورية للطلاب ({courseAnnouncements.length})
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إرسال مواعيد الامتحانات، روابط ملفات المراجعة، وملاحظات المعلم اليومية
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white dark:text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>نشر تنبيه أو إعلان جديد</span>
        </button>
      </div>

      {/* Announcements List */}
      {courseAnnouncements.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <Bell className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">لا توجد إعلانات منشورة لهذا الكورس حالياً</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            انشر تنبيهاً لتذكير الطلاب بمواعيد حل الواجب أو مراجعة ليلة الامتحان.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {courseAnnouncements.map((anc) => (
            <div
              key={anc.id}
              className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col sm:flex-row items-start justify-between gap-4 ${
                anc.isPinned
                  ? 'bg-sky-50 dark:bg-gradient-to-r dark:from-sky-950/40 dark:to-slate-900 border-sky-300 dark:border-sky-500/40'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  {anc.isPinned && (
                    <span className="px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-500/40 text-[10px] font-black flex items-center gap-1">
                      <Pin className="w-3 h-3" /> تنبيه مثبت
                    </span>
                  )}
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">{anc.title}</h4>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{anc.message}</p>

                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-1">
                  <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  {anc.createdAt}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onDeleteAnnouncement(anc.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors self-end sm:self-center cursor-pointer"
                title="حذف التنبيه"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Announcement */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-right">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <span>نشر تنبيه أو إشعار لطلاب الكورس</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان التنبيه *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: موعد تسليم امتحان المراجعة وتنبيه هام"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نص الرسالة والتفاصيل *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="اكتب التنبيه هنا..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-sky-500 focus:outline-none text-right"
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <input
                  type="checkbox"
                  id="chk-pinned"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                />
                <label htmlFor="chk-pinned" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>تثبيت هذا الإعلان في أعلى لوحة تحكم الطلاب</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white dark:text-slate-950 font-black text-xs flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>نشر الإعلان للطلاب</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

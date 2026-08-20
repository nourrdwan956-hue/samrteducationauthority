import React, { useState } from 'react';
import { X, ImageIcon, Sparkles, Check, Save } from 'lucide-react';
import { Course } from '../../types';
import { CourseCoverUploader, DEFAULT_COURSE_COVER } from './CourseCoverUploader';

interface EditCourseCoverModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCover: (courseId: string, newCoverUrl: string) => void;
}

export const EditCourseCoverModal: React.FC<EditCourseCoverModalProps> = ({
  course,
  isOpen,
  onClose,
  onSaveCover,
}) => {
  if (!isOpen || !course) return null;

  const [coverUrl, setCoverUrl] = useState<string>(course.thumbnail || DEFAULT_COURSE_COVER);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    onSaveCover(course.id, coverUrl);
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-5 sm:p-7 text-right space-y-5 max-h-[92vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                تعديل وتغيير صورة غلاف الكورس
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                كورس: <strong className="text-slate-800 dark:text-slate-200 font-bold">{course.title}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form with Uploader */}
        <form onSubmit={handleSave} className="space-y-5">
          <CourseCoverUploader
            currentCover={coverUrl}
            onChangeCover={(newUrl) => setCoverUrl(newUrl)}
            onDeleteCover={() => setCoverUrl(DEFAULT_COURSE_COVER)}
            courseTitle={course.title}
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 cursor-pointer transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جارِ الحفظ...' : 'حفظ غلاف الكورس الجديد ✨'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

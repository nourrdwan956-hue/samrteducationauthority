import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  DollarSign,
  Layers,
  Sparkles,
  Edit3,
  Save,
  CheckCircle2,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { EducationalStage, CurriculumType, Course } from '../../types';
import { CourseCoverUploader, DEFAULT_COURSE_COVER } from './CourseCoverUploader';

interface EditCourseDetailsModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCourse: (courseId: string, updates: Partial<Course>) => void;
}

export const EditCourseDetailsModal: React.FC<EditCourseDetailsModalProps> = ({
  course,
  isOpen,
  onClose,
  onSaveCourse,
}) => {
  if (!isOpen || !course) return null;

  const [title, setTitle] = useState(course.title || '');
  const [subtitle, setSubtitle] = useState(course.subtitle || '');
  const [description, setDescription] = useState(course.description || '');
  const [thumbnail, setThumbnail] = useState(course.thumbnail || DEFAULT_COURSE_COVER);
  const [isFree, setIsFree] = useState(course.isFree || false);
  const [price, setPrice] = useState<number>(course.price || 0);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(course.originalPrice);
  const [stage, setStage] = useState<EducationalStage>(course.stage || 'secondary');
  const [gradeLevel, setGradeLevel] = useState(course.gradeLevel || 'الصف الثالث الثانوي');
  const [curriculumType, setCurriculumType] = useState<CurriculumType>(course.curriculumType || 'general');
  const [status, setStatus] = useState<'published' | 'draft'>(course.status || 'published');
  const [requirementsText, setRequirementsText] = useState((course.requirements || []).join('\n'));
  const [whatYouWillLearnText, setWhatYouWillLearnText] = useState((course.whatYouWillLearn || []).join('\n'));
  const [isSaving, setIsSaving] = useState(false);

  // Sync when course changes
  useEffect(() => {
    if (course) {
      setTitle(course.title || '');
      setSubtitle(course.subtitle || '');
      setDescription(course.description || '');
      setThumbnail(course.thumbnail || DEFAULT_COURSE_COVER);
      setIsFree(course.isFree || false);
      setPrice(course.price || 0);
      setOriginalPrice(course.originalPrice);
      setStage(course.stage || 'secondary');
      setGradeLevel(course.gradeLevel || 'الصف الثالث الثانوي');
      setCurriculumType(course.curriculumType || 'general');
      setStatus(course.status || 'published');
      setRequirementsText((course.requirements || []).join('\n'));
      setWhatYouWillLearnText((course.whatYouWillLearn || []).join('\n'));
    }
  }, [course]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);

    const requirements = requirementsText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const whatYouWillLearn = whatYouWillLearnText
      .split('\n')
      .map((w) => w.trim())
      .filter(Boolean);

    const updates: Partial<Course> = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      thumbnail,
      isFree,
      price: isFree ? 0 : Number(price),
      originalPrice: isFree || !originalPrice ? undefined : Number(originalPrice),
      stage,
      gradeLevel,
      curriculumType,
      status,
      requirements,
      whatYouWillLearn,
    };

    onSaveCourse(course.id, updates);

    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-7 text-right space-y-6 max-h-[92vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                تعديل وتحديث بيانات الكورس
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تعديل العنوان، الوصف، الأسعار، المرحلة التعليمية، والغلاف
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

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* 1. Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                عنوان الكورس *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:border-cyan-500 focus:outline-none"
                placeholder="مثال: كورس المراجعة الشاملة - لغة إنجليزية 2026"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                العنوان الفرعي / نبذة مختصرة
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-cyan-500 focus:outline-none"
                placeholder="مثال: شرح القواعد وحل 1000 سؤال وترجمة متقدمة"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الوصف التفصيلي للكورس
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-cyan-500 focus:outline-none"
                placeholder="اكتب وصفاً جذاباً يوضح محتوى الكورس للطلاب..."
              />
            </div>
          </div>

          {/* 2. Educational Stages & Grade Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المرحلة الدراسية
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as EducationalStage)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:border-cyan-500 focus:outline-none"
              >
                <option value="secondary">المرحلة الثانوية</option>
                <option value="preparatory">المرحلة الإعدادية</option>
                <option value="primary">المرحلة الابتدائية</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الصف الدراسي
              </label>
              <input
                type="text"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:border-cyan-500 focus:outline-none"
                placeholder="الصف الثالث الثانوي"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                نوع المنهج
              </label>
              <select
                value={curriculumType}
                onChange={(e) => setCurriculumType(e.target.value as CurriculumType)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:border-cyan-500 focus:outline-none"
              >
                <option value="general">عام (ثانوية عامة)</option>
                <option value="azhar">أزهر شريف</option>
                <option value="international">لغات وتجريبي / دولي</option>
              </select>
            </div>
          </div>

          {/* 3. Pricing & Status */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
            {/* Publishing Status */}
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
                حالة النشر والظهور بالصفحة الرئيسية للطلاب:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('published')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    status === 'published'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>منشور للطلاب (بالصفحة الرئيسية) 🟢</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('draft')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    status === 'draft'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <span>مسودة خاصة (معطل النشر) 🔒</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>تسعير الكورس ورسوم الاشتراك:</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-cyan-500"
                />
                <span>كورس مجاني 100% للطلاب</span>
              </label>
            </div>

            {!isFree && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    سعر الاشتراك الفعلي (ج.م) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    السعر قبل الخصم (اختياري للشطب)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={originalPrice || ''}
                    onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="مثال: 450"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. What will student learn & requirements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ماذا سيتعلم الطالب؟ (سطر لكل عنصر)
              </label>
              <textarea
                rows={3}
                value={whatYouWillLearnText}
                onChange={(e) => setWhatYouWillLearnText(e.target.value)}
                placeholder="إتقان قواعد المنهج بالكامل&#10;حل نماذج الامتحانات السابقة&#10;تدريب مكثف على المقالي"
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                متطلبات الكورس (سطر لكل عنصر)
              </label>
              <textarea
                rows={3}
                value={requirementsText}
                onChange={(e) => setRequirementsText(e.target.value)}
                placeholder="كتاب المادة أو المذكرة&#10;هاتف ذكي أو لابتوب&#10;حضور المحاضرات بالترتيب"
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 5. Course Cover Manager */}
          <div className="pt-2">
            <CourseCoverUploader
              currentCover={thumbnail}
              onChangeCover={(newUrl) => setThumbnail(newUrl)}
              onDeleteCover={() => setThumbnail(DEFAULT_COURSE_COVER)}
              courseTitle={title}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
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
              className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 cursor-pointer transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جارِ الحفظ...' : 'حفظ كافة تعديلات الكورس ✨'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

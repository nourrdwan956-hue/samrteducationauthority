import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  GraduationCap,
  Layers,
  DollarSign,
  Image as ImageIcon,
  CheckCircle2,
  Lock,
  Calendar,
  Tag,
} from 'lucide-react';
import { EducationalStage, CurriculumType, Course } from '../../types';
import { CourseCoverUploader, DEFAULT_COURSE_COVER } from './CourseCoverUploader';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (courseData: Partial<Course>) => void;
  platformId: string;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  platformId,
}) => {
  const [stage, setStage] = useState<EducationalStage>('secondary');
  const [curriculumType, setCurriculumType] = useState<CurriculumType>('general');
  const [gradeLevel, setGradeLevel] = useState<string>('الصف الثالث الثانوي');
  const [term, setTerm] = useState<string>('الترم الثاني');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState(DEFAULT_COURSE_COVER);
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState<number>(280);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [hasDiscount, setHasDiscount] = useState<boolean>(false);
  const [tagsInput, setTagsInput] = useState('شرح كامل, مراجعة ليلة الامتحان, بنك أسئلة 2026');

  if (!isOpen) return null;

  // Grade options based on stage
  const getGradeOptions = (stg: EducationalStage) => {
    switch (stg) {
      case 'primary':
        return [
          'الصف الأول الابتدائي',
          'الصف الثاني الابتدائي',
          'الصف الثالث الابتدائي',
          'الصف الرابع الابتدائي',
          'الصف الخامس الابتدائي',
          'الصف السادس الابتدائي',
        ];
      case 'preparatory':
        return [
          'الصف الأول الإعدادي',
          'الصف الثاني الإعدادي',
          'الصف الثالث الإعدادي',
        ];
      case 'secondary':
      default:
        return [
          'الصف الأول الثانوي',
          'الصف الثاني الثانوي',
          'الصف الثالث الثانوي',
        ];
    }
  };

  const handleStageChange = (newStage: EducationalStage) => {
    setStage(newStage);
    const availableGrades = getGradeOptions(newStage);
    setGradeLevel(availableGrades[availableGrades.length - 1]);

    // If switching from secondary to primary/prep and curriculum was international, reset to general
    if (newStage !== 'secondary' && curriculumType === 'international') {
      setCurriculumType('general');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newCourseData: Partial<Course> = {
      platformId,
      title: title.trim() || 'كورس تعليمي جديد في اللغة الإنجليزية',
      subtitle: subtitle.trim(),
      description: description.trim(),
      thumbnail,
      stage,
      curriculumType,
      gradeLevel,
      term,
      isFree,
      price: isFree ? 0 : Number(price) || 0,
      originalPrice: isFree ? undefined : (hasDiscount && originalPrice ? Number(originalPrice) : undefined),
      subject: 'اللغة الإنجليزية',
      tags: tags.length > 0 ? tags : ['جديد', 'لغة إنجليزية 2026'],
      status: 'published',
    };

    onSubmit(newCourseData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl overflow-hidden text-right">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-white dark:text-slate-950 font-black shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">إنشاء كورس تعليمي جديد</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">تحديد المرحلة، الشعبة، التسعير وتفاصيل المنهج</p>
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

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* 1. Educational Stage Selection */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>1. اختر المرحلة التعليمية (Stage)</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'primary', label: 'الابتدائي', icon: '🎒', desc: 'تأسيس وبداية المنهج' },
                { id: 'preparatory', label: 'الإعدادي', icon: '📐', desc: 'تطوير القواعد والمهارات' },
                { id: 'secondary', label: 'الثانوي', icon: '🎓', desc: 'ثانوية عامة وبكالوريا' },
              ].map((stg) => {
                const isSelected = stage === stg.id;
                return (
                  <button
                    key={stg.id}
                    type="button"
                    onClick={() => handleStageChange(stg.id as EducationalStage)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-500 dark:border-cyan-400 text-cyan-700 dark:text-cyan-300 ring-2 ring-cyan-400/20 shadow-lg'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl">{stg.icon}</span>
                    <span className="text-xs font-black">{stg.label}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight hidden sm:block">
                      {stg.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Track / Curriculum Type Selection */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>2. نوع المنهج والشعبة (Curriculum Track)</span>
            </label>

            {stage === 'secondary' ? (
              // Secondary: 3 options (عام / أزهر / بكالوريا دولية)
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'general', title: 'ثانوي عام', desc: 'منهج وزارة التربية والتعليم' },
                  { id: 'azhar', title: 'ثانوي أزهري', desc: 'المناهج الأزهرية والشرعية' },
                  { id: 'international', title: 'بكالوريا ولغات / IG', desc: 'International & Languages' },
                ].map((track) => (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => setCurriculumType(track.id as CurriculumType)}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      curriculumType === track.id
                        ? 'bg-sky-50 dark:bg-sky-500/15 border-sky-500 dark:border-sky-400 text-sky-800 dark:text-sky-300 ring-2 ring-sky-400/20'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">{track.title}</span>
                      {curriculumType === track.id && (
                        <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">{track.desc}</span>
                  </button>
                ))}
              </div>
            ) : (
              // Primary and Prep: Only 2 options (عام / أزهر)
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'general', title: 'تعليم عام', desc: 'منهج المدارس الحكومية والخاصة' },
                  { id: 'azhar', title: 'تعليم أزهري', desc: 'المعاهد الأزهرية' },
                ].map((track) => (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => setCurriculumType(track.id as CurriculumType)}
                    className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                      curriculumType === track.id
                        ? 'bg-sky-50 dark:bg-sky-500/15 border-sky-500 dark:border-sky-400 text-sky-800 dark:text-sky-300 ring-2 ring-sky-400/20'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">{track.title}</span>
                      {curriculumType === track.id && (
                        <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">{track.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Grade Level & Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                الصف الدراسي
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:border-cyan-500 focus:outline-none"
              >
                {getGradeOptions(stage).map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                الفترة / الفصل الدراسي
              </label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:border-cyan-500 focus:outline-none"
              >
                <option value="الترم الثاني">الترم الثاني (مناهج الفصل الدراسي الثاني)</option>
                <option value="الترم الأول">الترم الأول</option>
                <option value="مراجعة نهائية وليلة الامتحان">مراجعة نهائية ومعسكر الامتحان</option>
                <option value="كورس سنوي شامل">المنهج الكامل للعام الدراسي</option>
              </select>
            </div>
          </div>

          {/* 4. Basic Course Details */}
          <div className="space-y-3.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>3. المعلومات الأساسية للكورس</span>
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                عنوان الكورس الرئيسي *
              </label>
              <input
                type="text"
                required
                placeholder="مثال: كورس العباقرة في اللغة الإنجليزية - مراجعة شاملة لجميع الوحدات 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                شعار / عنوان فرعي مختصر
              </label>
              <input
                type="text"
                placeholder="شرح القواعد التراكمية، مهارات المقال والترجمة الاحترافية، وحل 1000 سؤال"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الوصف التفصيلي وخطة الكورس
              </label>
              <textarea
                rows={2}
                placeholder="تفاصيل ما سيحصل عليه الطالب في هذا الكورس والجدول الزمني..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-cyan-500 focus:outline-none text-right"
              />
            </div>

            {/* Course Cover Image Uploader & Manager */}
            <div className="pt-2">
              <CourseCoverUploader
                currentCover={thumbnail}
                onChangeCover={(newUrl) => setThumbnail(newUrl)}
                onDeleteCover={() => setThumbnail(DEFAULT_COURSE_COVER)}
                courseTitle={title}
              />
            </div>
          </div>

          {/* 5. Pricing & Free Toggle Configuration */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>4. تسعير الكورس وسياسة الاشتراك</span>
            </h4>

            {/* Free Mode Toggle Box */}
            <div className={`p-4 rounded-2xl border transition-all ${
              isFree
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/50 ring-1 ring-emerald-500/20'
                : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="chk-is-free"
                    checked={isFree}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsFree(checked);
                      if (checked) {
                        setPrice(0);
                        setOriginalPrice(undefined);
                      } else {
                        setPrice(280);
                      }
                    }}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                  <div>
                    <label
                      htmlFor="chk-is-free"
                      className="text-xs sm:text-sm font-black text-slate-900 dark:text-white cursor-pointer block"
                    >
                      إتاحة هذا الكورس مجاناً بالكامل (Free Course)
                    </label>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      عند التفعيل سيتمكن جميع الطلاب من الدخول ومشاهدة كافة المحاضرات بدون دفع أي رسوم.
                    </span>
                  </div>
                </div>

                {isFree && (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300 font-black text-xs">
                    كورس مجاني 100%
                  </span>
                )}
              </div>
            </div>

            {/* Price Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>سعر الكورس (أرقام فقط بالعملة المحلية) *</span>
                  {isFree && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                      <Lock className="w-3 h-3" /> مقفل لأن الكورس مجاني
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required={!isFree}
                    disabled={isFree}
                    value={isFree ? 0 : price}
                    onChange={(e) => {
                      const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                      setPrice(val);
                    }}
                    placeholder="280"
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-black transition-all ${
                      isFree
                        ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 focus:outline-none'
                    }`}
                  />
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                    ج.م
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>السعر قبل الخصم (للشطب)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">تفعيل الخصم</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isFree) setHasDiscount(!hasDiscount);
                      }}
                      className={`w-8 h-4 rounded-full flex items-center transition-colors ${
                        hasDiscount && !isFree ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
                      } ${isFree ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className={`w-3 h-3 rounded-full bg-white shadow-sm transform transition-transform ${
                        hasDiscount && !isFree ? '-translate-x-1' : '-translate-x-4'
                      }`} />
                    </button>
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    disabled={isFree || !hasDiscount}
                    value={isFree || !hasDiscount ? '' : originalPrice || ''}
                    onChange={(e) => {
                      const val = e.target.value ? Math.max(0, parseInt(e.target.value, 10) || 0) : undefined;
                      setOriginalPrice(val);
                    }}
                    placeholder={hasDiscount ? "مثال: 350" : "الخصم غير مفعل"}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isFree || !hasDiscount
                        ? 'bg-slate-100/50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none'
                    }`}
                  />
                  <span className={`absolute left-3 top-2.5 text-xs font-bold ${isFree || !hasDiscount ? 'text-slate-400 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'}`}>
                    ج.م
                  </span>
                </div>
              </div>
            </div>

            {/* Tags / Keywords */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>الكلمات المفتاحية والوسوم (مفصولة بفاصلة)</span>
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="قواعد, مهارات, ترجمة, مراجعة ليلة الامتحان"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>

          </div>

          {/* Modal Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 bg-white/90 dark:bg-slate-900/90 py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-white dark:text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>إنشاء ونشر الكورس الآن</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

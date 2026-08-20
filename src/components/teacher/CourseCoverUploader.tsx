import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon,
  AlertCircle,
  Eye,
} from 'lucide-react';

export const DEFAULT_COURSE_COVER =
  'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1200&q=80';

export const PRESET_COURSE_COVERS = [
  {
    id: 'english-grammar',
    title: 'الإنجليزية - قواعد وترجمة ثانوية عامة',
    category: 'اللغة الإنجليزية',
    url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'english-vocab',
    title: 'المفردات، التعبيرات والمحادثة المتقدمة',
    category: 'اللغة الإنجليزية',
    url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'final-revision',
    title: 'المراجعات النهائية وليالي الامتحانات',
    category: 'مراجعات عامة',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'languages-foundation',
    title: 'تأسيس اللغات والمهارات الشاملة',
    category: 'تأسيس',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'interactive-learning',
    title: 'كورس إلكتروني تفاعلي وحل بنوك الأسئلة',
    category: 'تقنية وتعليم',
    url: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'arabic-literature',
    title: 'اللغة العربية - النحو والبلاغة والأدب',
    category: 'اللغة العربية',
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'science-physics',
    title: 'الفيزياء والعلوم التطبيقية والمسائل',
    category: 'علمي',
    url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'chemistry-lab',
    title: 'الكيمياء - معادلات وتجارب عضوية وغير عضوية',
    category: 'علمي',
    url: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'biology-medical',
    title: 'الأحياء والجيولوجيا - تشريح ورسومات علمية',
    category: 'علمي',
    url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'mathematics-algebra',
    title: 'الرياضيات البحتة والتطبيقية والتفاضل',
    category: 'رياضيات',
    url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'history-philosophy',
    title: 'التاريخ والجغرافيا والفلسفة والمنطق',
    category: 'أدبي',
    url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'french-german',
    title: 'اللغة الفرنسية والألمانية والإيطالية',
    category: 'لغات أجنبية ثانية',
    url: 'https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?auto=format&fit=crop&w=1200&q=80',
  },
];

interface CourseCoverUploaderProps {
  currentCover?: string;
  onChangeCover: (newCoverUrl: string) => void;
  onDeleteCover?: () => void;
  courseTitle?: string;
  className?: string;
}

export const CourseCoverUploader: React.FC<CourseCoverUploaderProps> = ({
  currentCover,
  onChangeCover,
  onDeleteCover,
  courseTitle,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(currentCover || '');
  const [previewLoaded, setPreviewLoaded] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeCover = currentCover?.trim() || DEFAULT_COURSE_COVER;
  const isDefaultCover = activeCover === DEFAULT_COURSE_COVER || !currentCover;
  const isUploadedDataUrl = activeCover.startsWith('data:image/');

  const handleFile = (file: File) => {
    setErrorMessage(null);

    // Validate type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('يرجى اختيار ملف صورة صالح بصيغة (PNG, JPG, JPEG, WebP, GIF)');
      return;
    }

    // Validate size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 10 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onChangeCover(dataUrl);
        setUrlInput('');
      }
    };
    reader.onerror = () => {
      setErrorMessage('حدث خطأ أثناء قراءة ملف الصورة. حاول مجدداً.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setErrorMessage('يرجى كتابة رابط صورة صحيح');
      return;
    }
    setErrorMessage(null);
    onChangeCover(urlInput.trim());
  };

  const handleDeleteOrReset = () => {
    if (onDeleteCover) {
      onDeleteCover();
    } else {
      onChangeCover(DEFAULT_COURSE_COVER);
    }
    setUrlInput('');
    setErrorMessage(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 1. Main Cover Display & Action Bar */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 group shadow-md">
        {/* Cover Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-950 flex items-center justify-center">
          <img
            src={activeCover}
            alt={courseTitle || 'غلاف الكورس'}
            onLoad={() => setPreviewLoaded(true)}
            onError={() => {
              setPreviewLoaded(false);
              setErrorMessage('تعذر تحميل الصورة من الرابط الحالي.');
            }}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              !previewLoaded ? 'opacity-40' : 'opacity-100'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

          {/* Badges Over Cover */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            {isUploadedDataUrl ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white font-black text-[11px] flex items-center gap-1 shadow-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>صورة مرفوعة من جهازك</span>
              </span>
            ) : isDefaultCover ? (
              <span className="px-2.5 py-1 rounded-full bg-slate-800/90 backdrop-blur-md text-slate-200 border border-slate-700 font-bold text-[11px] flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>الغلاف الافتراضي</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-cyan-500 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow-lg">
                <Sparkles className="w-3.5 h-3.5" />
                <span>غلاف مخصص</span>
              </span>
            )}
          </div>

          {/* Bottom Overlay Title & Action Buttons */}
          <div className="absolute bottom-3 inset-x-3 flex flex-wrap items-center justify-between gap-2 z-10">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-medium">معاينة غلاف الكورس</span>
              <h5 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                {courseTitle || 'كورس تعليمي جديد'}
              </h5>
            </div>

            <div className="flex items-center gap-2">
              {/* Trigger local file picker */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>تغيير / رفع غلاف</span>
              </button>

              {/* Delete / Reset button */}
              {!isDefaultCover && (
                <button
                  type="button"
                  onClick={handleDeleteOrReset}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
                  title="حذف هذا الغلاف والعودة للغلاف الافتراضي"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف الغلاف</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml"
        onChange={handleFileInputChange}
        className="hidden"
        id="course-cover-file-input"
      />

      {/* Error alert if any */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. Source Tabs (Upload / Presets / Direct URL) */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>خيارات تخصيص ورفع غلاف الكورس:</span>
          </label>

          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              📤 رفع من جهازك
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'presets'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🎨 أغلفة جاهزة
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🔗 رابط خارجي
            </button>
          </div>
        </div>

        {/* Tab 1: Drag & Drop / Click to upload */}
        {activeTab === 'upload' && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-cyan-500 bg-cyan-500/10 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-400 bg-white dark:bg-slate-900/50'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-inner">
              <Upload className="w-6 h-6 animate-bounce" />
            </div>

            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                اضغط هنا لاختيار صورة من جهازك أو اسحب وأفلت الصورة مباشرة
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                يدعم صيغ PNG, JPG, WebP, GIF • يفضل مقاس (16:9) بجودة عالية حتى 10 ميجابايت
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors pointer-events-auto"
            >
              استعراض الملفات من الكمبيوتر أو الهاتف 📁
            </button>
          </div>
        )}

        {/* Tab 2: Presets Gallery */}
        {activeTab === 'presets' && (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              اختر غلافاً تعليمياً عالي الدقة بضغطة زر واحدة:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRESET_COURSE_COVERS.map((preset) => {
                const isSelected = activeCover === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onChangeCover(preset.url);
                      setUrlInput('');
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all cursor-pointer group text-right ${
                      isSelected
                        ? 'border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-400/40'
                        : 'border-slate-200 dark:border-slate-800 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    
                    <span className="absolute bottom-1.5 right-2 left-2 text-[10px] font-bold text-white line-clamp-1 drop-shadow">
                      {preset.title}
                    </span>

                    {isSelected && (
                      <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Direct URL */}
        {activeTab === 'url' && (
          <form onSubmit={handleApplyUrl} className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
              أدخل رابط صورة غلاف مباشر (Direct Image URL):
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:border-cyan-500 focus:outline-none text-left ltr"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-colors cursor-pointer shrink-0"
              >
                تطبيق الرابط
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

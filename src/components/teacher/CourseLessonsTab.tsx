import React, { useState } from 'react';
import {
  Video,
  FileText,
  HelpCircle,
  Radio,
  Plus,
  Play,
  Trash2,
  Clock,
  ShieldCheck,
  FolderPlus,
  Calendar,
  Lock,
  Globe,
  Power,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  X,
  Tv2,
  Eye,
  ChevronDown,
  ChevronUp,
  Pencil,
  Copy,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  Unlock,
  Check,
  Sliders,
} from 'lucide-react';
import { Course, CourseModule, Lesson, LessonType } from '../../types';
import { extractYouTubeId } from '../../lib/videoUtils';
import { SecureVideoPlayer } from '../SecureVideoPlayer';

interface CourseLessonsTabProps {
  course: Course;
  onAddLesson: (courseId: string, moduleId: string, lesson: Partial<Lesson>) => void;
  onUpdateLesson?: (courseId: string, moduleId: string, lessonId: string, updates: Partial<Lesson>) => void;
  onDeleteLesson: (courseId: string, moduleId: string, lessonId: string) => void;
  onPreviewLesson: (courseId: string, lessonId: string) => void;
  onUpdateCourse: (courseId: string, updates: Partial<Course>) => void;
}

export const CourseLessonsTab: React.FC<CourseLessonsTabProps> = ({
  course,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  onPreviewLesson,
  onUpdateCourse,
}) => {
  const modules = course.modules || [];

  const [selectedModuleId, setSelectedModuleId] = useState<string>(
    modules[0]?.id || ''
  );

  // Modals
  const [isAddModuleModalOpen, setIsAddModuleModalOpen] = useState(false);
  const [moduleToEdit, setModuleToEdit] = useState<CourseModule | null>(null);
  const [moduleToDelete, setModuleToDelete] = useState<CourseModule | null>(null);
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<{ moduleId: string; lesson: Lesson } | null>(null);
  const [schedulingLesson, setSchedulingLesson] = useState<{
    moduleId: string;
    lesson: Lesson;
    scheduledDate: string;
  } | null>(null);
  const [previewVideoLesson, setPreviewVideoLesson] = useState<Lesson | null>(null);

  // Unit Collapse state
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  // New Module Form State
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDescription, setNewModuleDescription] = useState('');
  const [newModuleStatus, setNewModuleStatus] = useState<'published' | 'draft' | 'scheduled'>('published');
  const [newModuleScheduledDate, setNewModuleScheduledDate] = useState('');
  const [newModuleIsFree, setNewModuleIsFree] = useState(false);
  const [newModuleIsRequiredCompletion, setNewModuleIsRequiredCompletion] = useState(false);

  // Edit Module Form State
  const [editModuleTitle, setEditModuleTitle] = useState('');
  const [editModuleDescription, setEditModuleDescription] = useState('');
  const [editModuleStatus, setEditModuleStatus] = useState<'published' | 'draft' | 'scheduled'>('published');
  const [editModuleScheduledDate, setEditModuleScheduledDate] = useState('');
  const [editModuleIsFree, setEditModuleIsFree] = useState(false);
  const [editModuleIsRequiredCompletion, setEditModuleIsRequiredCompletion] = useState(false);

  // Add Lesson Form state
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<LessonType>('video');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [lessonStatus, setLessonStatus] = useState<'published' | 'draft'>('published');
  const [lessonScheduledDate, setLessonScheduledDate] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [playerMode, setPlayerMode] = useState<'platform' | 'youtube'>('platform');

  // Toggle Collapse
  const toggleCollapseModule = (modId: string) => {
    setCollapsedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  // --- UNIT CRUD ACTIONS ---

  // 1. Create Module
  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    const newMod: CourseModule = {
      id: 'mod_' + Date.now(),
      courseId: course.id,
      title: newModuleTitle.trim(),
      description: newModuleDescription.trim() || undefined,
      status: newModuleStatus,
      scheduledPublishDate: newModuleStatus === 'scheduled' ? newModuleScheduledDate : undefined,
      isFree: newModuleIsFree,
      isRequiredCompletion: newModuleIsRequiredCompletion,
      order: modules.length + 1,
      lessons: [],
    };

    const updatedModules = [...modules, newMod];

    onUpdateCourse(course.id, {
      modules: updatedModules,
      modulesCount: updatedModules.length,
    });

    // Reset
    setNewModuleTitle('');
    setNewModuleDescription('');
    setNewModuleStatus('published');
    setNewModuleScheduledDate('');
    setNewModuleIsFree(false);
    setNewModuleIsRequiredCompletion(false);
    setIsAddModuleModalOpen(false);
    setSelectedModuleId(newMod.id);
  };

  // 2. Open Edit Module
  const handleOpenEditModule = (mod: CourseModule) => {
    setModuleToEdit(mod);
    setEditModuleTitle(mod.title || '');
    setEditModuleDescription(mod.description || '');
    setEditModuleStatus(mod.status || 'published');
    setEditModuleScheduledDate(mod.scheduledPublishDate || '');
    setEditModuleIsFree(!!mod.isFree);
    setEditModuleIsRequiredCompletion(!!mod.isRequiredCompletion);
  };

  // 3. Submit Edit Module
  const handleSaveEditModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleToEdit || !editModuleTitle.trim()) return;

    const updatedModules = modules.map((m) => {
      if (m.id === moduleToEdit.id) {
        return {
          ...m,
          title: editModuleTitle.trim(),
          description: editModuleDescription.trim() || undefined,
          status: editModuleStatus,
          scheduledPublishDate: editModuleStatus === 'scheduled' ? editModuleScheduledDate : undefined,
          isFree: editModuleIsFree,
          isRequiredCompletion: editModuleIsRequiredCompletion,
        };
      }
      return m;
    });

    onUpdateCourse(course.id, {
      modules: updatedModules,
    });

    setModuleToEdit(null);
  };

  // 4. Confirm Delete Module (Purge Unit with all contents)
  const handleConfirmDeleteModule = () => {
    if (!moduleToDelete) return;

    const updatedModules = modules.filter((m) => m.id !== moduleToDelete.id);
    const totalRemainingLessons = updatedModules.reduce(
      (sum, m) => sum + (m.lessons || []).length,
      0
    );

    onUpdateCourse(course.id, {
      modules: updatedModules,
      modulesCount: updatedModules.length,
      lessonsCount: totalRemainingLessons,
    });

    setModuleToDelete(null);
  };

  // 5. Reorder Modules (Move Up / Down)
  const handleMoveModuleUp = (idx: number) => {
    if (idx <= 0) return;
    const newMods = [...modules];
    const temp = newMods[idx - 1];
    newMods[idx - 1] = newMods[idx];
    newMods[idx] = temp;

    // re-assign order numbers
    newMods.forEach((m, i) => {
      m.order = i + 1;
    });

    onUpdateCourse(course.id, { modules: newMods });
  };

  const handleMoveModuleDown = (idx: number) => {
    if (idx >= modules.length - 1) return;
    const newMods = [...modules];
    const temp = newMods[idx + 1];
    newMods[idx + 1] = newMods[idx];
    newMods[idx] = temp;

    // re-assign order numbers
    newMods.forEach((m, i) => {
      m.order = i + 1;
    });

    onUpdateCourse(course.id, { modules: newMods });
  };

  // 6. Duplicate Module
  const handleDuplicateModule = (mod: CourseModule) => {
    const timestamp = Date.now();
    const clonedLessons: Lesson[] = (mod.lessons || []).map((les, lIdx) => ({
      ...les,
      id: `les_clone_${timestamp}_${lIdx}`,
      moduleId: `mod_clone_${timestamp}`,
      title: `${les.title} (نسخة)`,
      status: 'draft',
      isPublished: false,
    }));

    const clonedModule: CourseModule = {
      ...mod,
      id: `mod_clone_${timestamp}`,
      title: `نسخة من - ${mod.title}`,
      order: modules.length + 1,
      status: 'draft',
      lessons: clonedLessons,
    };

    const updatedModules = [...modules, clonedModule];
    const totalLessons = updatedModules.reduce((sum, m) => sum + m.lessons.length, 0);

    onUpdateCourse(course.id, {
      modules: updatedModules,
      modulesCount: updatedModules.length,
      lessonsCount: totalLessons,
    });
  };

  // 7. Batch Toggle Lesson Status inside Module
  const handleBatchToggleModuleLessons = (modId: string, targetStatus: 'published' | 'draft') => {
    const updatedModules = modules.map((m) => {
      if (m.id === modId) {
        const updatedLessons = (m.lessons || []).map((l) => ({
          ...l,
          status: targetStatus,
          isPublished: targetStatus === 'published',
        }));
        return { ...m, lessons: updatedLessons };
      }
      return m;
    });

    onUpdateCourse(course.id, { modules: updatedModules });
  };

  // --- LESSON ACTIONS ---

  const handleOpenAddLesson = (modId: string) => {
    setSelectedModuleId(modId);
    setLessonTitle('');
    setDurationMinutes('');
    setYoutubeVideoId('');
    setVideoUrl('');
    setPlayerMode('platform');
    setPdfTitle('');
    setPdfUrl('');
    setIsFreePreview(false);
    setLessonStatus('published');
    setLessonScheduledDate('');
    setLessonDescription('');
    setIsAddLessonModalOpen(true);
  };

  const handleAddLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModuleId || !lessonTitle.trim()) return;

    const parsedVideoId = extractYouTubeId(youtubeVideoId.trim() || videoUrl.trim());

    const newLessonData: Partial<Lesson> = {
      title: lessonTitle.trim(),
      type: lessonType,
      durationMinutes: Number(durationMinutes) || 0,
      isFreePreview,
      status: lessonStatus,
      isPublished: lessonStatus === 'published',
      scheduledDate: lessonScheduledDate || undefined,
      scheduledPublishDate: lessonScheduledDate || undefined,
      isScheduled: !!lessonScheduledDate,
      youtubeVideoId: parsedVideoId || undefined,
      playerMode,
      videoUrl: videoUrl.trim() || undefined,
      pdfTitle: pdfTitle.trim() || undefined,
      pdfUrl: pdfUrl.trim() || (lessonType === 'pdf' ? 'https://example.com/lecture-summary.pdf' : undefined),
      description: lessonDescription.trim() || undefined,
    };

    onAddLesson(course.id, selectedModuleId, newLessonData);
    setIsAddLessonModalOpen(false);
  };

  const handleToggleLessonPublish = (moduleId: string, lesson: Lesson) => {
    if (!onUpdateLesson) return;
    const isCurrentlyDraft = lesson.status === 'draft' || lesson.isPublished === false;
    const newStatus = isCurrentlyDraft ? 'published' : 'draft';
    onUpdateLesson(course.id, moduleId, lesson.id, {
      status: newStatus,
      isPublished: newStatus === 'published',
    });
  };

  const handleSaveLessonSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingLesson || !onUpdateLesson) return;

    const { moduleId, lesson, scheduledDate } = schedulingLesson;
    onUpdateLesson(course.id, moduleId, lesson.id, {
      scheduledDate: scheduledDate || undefined,
      scheduledPublishDate: scheduledDate || undefined,
      isScheduled: !!scheduledDate,
    });
    setSchedulingLesson(null);
  };

  const handleConfirmDeleteLesson = () => {
    if (!lessonToDelete) return;
    onDeleteLesson(course.id, lessonToDelete.moduleId, lessonToDelete.lesson.id);
    setLessonToDelete(null);
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <span>إدارة الوحدات والدروس المتقدمة</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            تعديل، حذف، جدولة نشر الوحدات بالكامل، ترتيب المحتوى، وإدراج الدروس والمذكرات المشفرة
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsAddModuleModalOpen(true)}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <FolderPlus className="w-4 h-4" />
            <span>إضافة وحدة جديدة</span>
          </button>
        </div>
      </div>

      {/* Modules & Lessons List */}
      {modules.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <FolderPlus className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">لا توجد وحدات بعد في هذا الكورس</p>
          <button
            type="button"
            onClick={() => setIsAddModuleModalOpen(true)}
            className="mt-3 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs inline-flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة أول وحدة دراسية</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((mod, modIdx) => {
            const isCollapsed = !!collapsedModules[mod.id];
            const modStatus = mod.status || 'published';
            const isModScheduled = modStatus === 'scheduled' && !!mod.scheduledPublishDate;

            return (
              <div
                key={mod.id}
                className={`rounded-2xl bg-white dark:bg-slate-900 border transition-all overflow-hidden ${
                  modStatus === 'draft'
                    ? 'border-amber-300 dark:border-amber-900/50 shadow-xs'
                    : isModScheduled
                    ? 'border-purple-300 dark:border-purple-900/50 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 shadow-sm'
                }`}
              >
                {/* Module Header Bar */}
                <div className="p-4 bg-slate-100/80 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  
                  {/* Title & Badges */}
                  <div className="flex items-start gap-3 w-full md:w-auto">
                    <span className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 text-xs font-black flex items-center justify-center border border-cyan-500/20 shrink-0 mt-0.5">
                      {modIdx + 1}
                    </span>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          {mod.title}
                        </h4>

                        {/* Status Badge */}
                        {modStatus === 'draft' && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-black flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>مسودة (مغلقة)</span>
                          </span>
                        )}

                        {isModScheduled && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 text-[10px] font-black flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>مجدولة بالنشر ({mod.scheduledPublishDate})</span>
                          </span>
                        )}

                        {modStatus === 'published' && !isModScheduled && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-black flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>منشورة</span>
                          </span>
                        )}

                        {/* Additional Attributes Badges */}
                        {mod.isFree && (
                          <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 text-[10px] font-black">
                            🎁 وحدة تجريبية مجانية
                          </span>
                        )}

                        {mod.isRequiredCompletion && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 text-[10px] font-black">
                            🔒 تتطلب إكمال الوحدة السابقة
                          </span>
                        )}
                      </div>

                      {mod.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          {mod.description}
                        </p>
                      )}

                      <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-3">
                        <span>{(mod.lessons || []).length} دروس ومحتويات</span>
                      </div>
                    </div>
                  </div>

                  {/* Unit Action Buttons Toolbar */}
                  <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-200 dark:border-slate-800">
                    
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={modIdx === 0}
                      onClick={() => handleMoveModuleUp(modIdx)}
                      title="ترتيب للأعلى"
                      className="p-1.5 rounded-lg bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={modIdx === modules.length - 1}
                      onClick={() => handleMoveModuleDown(modIdx)}
                      title="ترتيب للأسفل"
                      className="p-1.5 rounded-lg bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Duplicate Unit */}
                    <button
                      type="button"
                      onClick={() => handleDuplicateModule(mod)}
                      title="نسخ الوحدة بالكامل"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">نسخ</span>
                    </button>

                    {/* Edit Unit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModule(mod)}
                      title="تعديل اسم وإعدادات الوحدة"
                      className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/20 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">تعديل</span>
                    </button>

                    {/* Delete Unit */}
                    <button
                      type="button"
                      onClick={() => setModuleToDelete(mod)}
                      title="حذف الوحدة بالكامل بجميع محتوياتها"
                      className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/20 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">حذف بالكامل</span>
                    </button>

                    {/* Add Lesson */}
                    <button
                      type="button"
                      onClick={() => handleOpenAddLesson(mod.id)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1 cursor-pointer shadow-sm ml-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة درس</span>
                    </button>

                    {/* Toggle Collapse */}
                    <button
                      type="button"
                      onClick={() => toggleCollapseModule(mod.id)}
                      title={isCollapsed ? 'توسيع الوحدة' : 'طي الوحدة'}
                      className="p-1.5 rounded-lg bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Module Body (Collapsible) */}
                {!isCollapsed && (
                  <div className="p-3 sm:p-4 space-y-3">
                    
                    {/* Batch Actions Bar inside Module */}
                    {(mod.lessons || []).length > 0 && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 text-xs">
                        <span className="text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-cyan-500" />
                          <span>تحكم سريع في كل دروس هذه الوحدة:</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleBatchToggleModuleLessons(mod.id, 'published')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[11px] font-bold cursor-pointer"
                          >
                            نشر الجميع 🟢
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBatchToggleModuleLessons(mod.id, 'draft')}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[11px] font-bold cursor-pointer"
                          >
                            تحويل الجميع لمسودة 🟡
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Module Lessons list */}
                    {(mod.lessons || []).length === 0 ? (
                      <div className="p-6 text-center rounded-xl bg-slate-50/60 dark:bg-slate-950/40 border border-dashed border-slate-300 dark:border-slate-800">
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                          هذه الوحدة فارغة حالياً. اضغط "إضافة درس" لإدراج فيديو، مذكرة PDF، أو امتحان.
                        </p>
                      </div>
                    ) : (
                      (mod.lessons || []).map((lesson, lesIdx) => {
                        const isDraft = lesson.status === 'draft' || lesson.isPublished === false;
                        const hasSchedule = !!lesson.scheduledDate || !!lesson.scheduledPublishDate;

                        return (
                          <div
                            key={lesson.id}
                            className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 ${
                              isDraft
                                ? 'bg-amber-500/5 dark:bg-amber-950/10 border-amber-300 dark:border-amber-900/40'
                                : 'bg-slate-50/80 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-start sm:items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0 shadow-xs mt-0.5 sm:mt-0">
                                {lesson.type === 'video' ? (
                                  <Video className="w-4 h-4" />
                                ) : lesson.type === 'pdf' ? (
                                  <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                ) : lesson.type === 'exam' ? (
                                  <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <Radio className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                )}
                              </div>

                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-bold text-slate-400">#{lesIdx + 1}</span>
                                  <h5 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                                    {lesson.title}
                                  </h5>
                                  
                                  {/* Lesson Status Badge */}
                                  {isDraft ? (
                                    <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-black flex items-center gap-1">
                                      <Lock className="w-3 h-3" />
                                      <span>مسودة</span>
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-black flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" />
                                      <span>منشور للطلاب</span>
                                    </span>
                                  )}

                                  {lesson.isFreePreview && (
                                    <span className="px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 text-[10px] font-black">
                                      معاينة مجانية
                                    </span>
                                  )}

                                  {hasSchedule && (
                                    <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 text-[10px] font-black flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>مجدول: {lesson.scheduledDate || lesson.scheduledPublishDate}</span>
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-slate-500 font-medium">
                                  {lesson.type === 'video' ? (
                                    <span>
                                      فيديو {lesson.durationMinutes ? `• ${lesson.durationMinutes} دقيقة` : ''} • نمط العرض: {lesson.playerMode === 'youtube' ? 'يوتيوب مباشر' : 'مشغل المنصة المشفر'}
                                    </span>
                                  ) : lesson.type === 'pdf' ? (
                                    <span>مذكرة PDF {lesson.pdfTitle ? `• ${lesson.pdfTitle}` : ''}</span>
                                  ) : (
                                    <span>اختبار أونلاين تفاعلي</span>
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Lesson Actions */}
                            <div className="flex items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-200 dark:border-slate-800">
                              
                              {/* Preview Lesson Button */}
                              {lesson.type === 'video' && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewVideoLesson(lesson)}
                                  className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-xs flex items-center gap-1 border border-cyan-500/20 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>معاينة حية</span>
                                </button>
                              )}

                              {/* Toggle Publish State */}
                              <button
                                type="button"
                                onClick={() => handleToggleLessonPublish(mod.id, lesson)}
                                className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 border cursor-pointer transition-colors ${
                                  isDraft
                                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                }`}
                              >
                                {isDraft ? <Globe className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                                <span>{isDraft ? 'نشر المحاضرة' : 'تعطيل للطلاب'}</span>
                              </button>

                              {/* Schedule Publication */}
                              <button
                                type="button"
                                onClick={() => setSchedulingLesson({ moduleId: mod.id, lesson, scheduledDate: lesson.scheduledDate || '' })}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>جدولة النشر</span>
                              </button>

                              {/* Delete Lesson Button */}
                              <button
                                type="button"
                                onClick={() => setLessonToDelete({ moduleId: mod.id, lesson })}
                                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* --- MODALS SECTION --- */}

      {/* 1. Modal: Create New Module */}
      {isAddModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-right relative">
            <button
              onClick={() => setIsAddModuleModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <FolderPlus className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">إضافة وحدة تعليمية جديدة</h3>
            </div>

            <form onSubmit={handleCreateModule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم الوحدة التعليمية *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الوحدة الأولى - التوازن الكيميائي"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  وصف مختصر للوحدة (اختياري)
                </label>
                <textarea
                  rows={2}
                  placeholder="أدخل وصفاً توضيحياً لما سيتم تغطيته في هذه الوحدة..."
                  value={newModuleDescription}
                  onChange={(e) => setNewModuleDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  حالة النشر والظهور للطلاب
                </label>
                <select
                  value={newModuleStatus}
                  onChange={(e) => setNewModuleStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="published">🟢 منشورة ومتاحة للطلاب فوراً</option>
                  <option value="draft">🟡 مسودة مغلقة (لا تظهر للطلاب)</option>
                  <option value="scheduled">🟣 مجدولة بالنشر التلقائي في تاريخ محدد</option>
                </select>
              </div>

              {/* Scheduled Date Picker */}
              {newModuleStatus === 'scheduled' && (
                <div>
                  <label className="block text-xs font-bold text-purple-600 dark:text-purple-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>تاريخ ووقت النشر المجدول *</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newModuleScheduledDate}
                    onChange={(e) => setNewModuleScheduledDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-purple-500/5 border border-purple-300 dark:border-purple-800 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {/* Switches */}
              <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newModuleIsFree}
                    onChange={(e) => setNewModuleIsFree(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    🎁 وحدة تجريبية مجانية (متاحة للجميع بدون شروط)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newModuleIsRequiredCompletion}
                    onChange={(e) => setNewModuleIsRequiredCompletion(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    🔒 تشترط إكمال الوحدة السابقة قبل فتحها للطلاب
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModuleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md cursor-pointer"
                >
                  حفظ الوحدة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Edit Existing Module */}
      {moduleToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-right relative">
            <button
              onClick={() => setModuleToEdit(null)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-sky-500" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">تعديل بيانات وإعدادات الوحدة</h3>
            </div>

            <form onSubmit={handleSaveEditModule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم الوحدة التعليمية *
                </label>
                <input
                  type="text"
                  required
                  value={editModuleTitle}
                  onChange={(e) => setEditModuleTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  وصف الوحدة
                </label>
                <textarea
                  rows={2}
                  value={editModuleDescription}
                  onChange={(e) => setEditModuleDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  حالة النشر والظهور للطلاب
                </label>
                <select
                  value={editModuleStatus}
                  onChange={(e) => setEditModuleStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="published">🟢 منشورة ومتاحة للطلاب فوراً</option>
                  <option value="draft">🟡 مسودة مغلقة (لا تظهر للطلاب)</option>
                  <option value="scheduled">🟣 مجدولة بالنشر التلقائي في تاريخ محدد</option>
                </select>
              </div>

              {/* Scheduled Date Picker */}
              {editModuleStatus === 'scheduled' && (
                <div>
                  <label className="block text-xs font-bold text-purple-600 dark:text-purple-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>تاريخ ووقت النشر المجدول *</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editModuleScheduledDate}
                    onChange={(e) => setEditModuleScheduledDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-purple-500/5 border border-purple-300 dark:border-purple-800 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {/* Switches */}
              <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editModuleIsFree}
                    onChange={(e) => setEditModuleIsFree(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    🎁 وحدة تجريبية مجانية (متاحة للجميع بدون شروط)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editModuleIsRequiredCompletion}
                    onChange={(e) => setEditModuleIsRequiredCompletion(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    🔒 تشترط إكمال الوحدة السابقة قبل فتحها للطلاب
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModuleToEdit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md cursor-pointer"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Delete Module Confirmation (Safety Purge) */}
      {moduleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-rose-500/40 p-6 shadow-2xl space-y-4 text-right">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                تأكيد حذف الوحدة بالكامل بمحتوياتها؟
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                أنت على وشك حذف وحدة <strong className="text-rose-600 dark:text-rose-400 font-bold">"{moduleToDelete.title}"</strong>.
              </p>
              
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold">
                ⚠️ تحذير: تحتوي هذه الوحدة على <span className="underline">{(moduleToDelete.lessons || []).length} محتويات ودوروس</span> وستحذف جميع الفيديوهات والمذكرات داخلها فورياً ونهاائياً!
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModuleToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                إلغاء الحذف
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteModule}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>تأكيد الحذف الكلي</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: Add Lesson to Module */}
      {isAddLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-right relative my-8">
            <button
              onClick={() => setIsAddLessonModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">إضافة درس / محتوى للوحدة</h3>
            </div>

            <form onSubmit={handleAddLessonSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان المحاضرة / المذكرة *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الشرح التفصيلي لدرس الاتزان والأيونات"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Lesson Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نوع المحتوى
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setLessonType('video')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      lessonType === 'video'
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>فيديو</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLessonType('pdf')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      lessonType === 'pdf'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>ملف PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLessonType('exam')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      lessonType === 'exam'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>امتحان</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLessonType('live_session')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      lessonType === 'live_session'
                        ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>بث مباشر</span>
                  </button>
                </div>
              </div>

              {/* Video Specific inputs */}
              {lessonType === 'video' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  
                  {/* Player Mode Switcher */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      نمط مشغل الفيديو
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPlayerMode('platform')}
                        className={`py-1.5 px-3 rounded-xl border text-[11px] font-bold cursor-pointer ${
                          playerMode === 'platform'
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                            : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-400'
                        }`}
                      >
                        🛡️ المشغل المشفر المنصة
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlayerMode('youtube')}
                        className={`py-1.5 px-3 rounded-xl border text-[11px] font-bold cursor-pointer ${
                          playerMode === 'youtube'
                            ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                            : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-400'
                        }`}
                      >
                        📺 يوتيوب المباشر
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      رابط الفيديو / معرّف يوتيوب (YouTube Video ID or URL)
                    </label>
                    <input
                      type="text"
                      placeholder="ضع رابط يوتيوب أو المعرف e.g. dQw4w9WgXcQ"
                      value={youtubeVideoId}
                      onChange={(e) => setYoutubeVideoId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      مدة الفيديو بالدقائق
                    </label>
                    <input
                      type="number"
                      placeholder="45"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* PDF Specific inputs */}
              {lessonType === 'pdf' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-700 dark:text-amber-300 mb-1">
                      رابط ملف الـ PDF (رابط مشفر أو Google Drive / Direct URL)
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/lecture-summary.pdf"
                      value={pdfUrl}
                      onChange={(e) => setPdfUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Lesson Controls */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFreePreview}
                    onChange={(e) => setIsFreePreview(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    جعل هذا الدرس معاينة مجانية (Free Preview) لجميع الطلاب
                  </span>
                </label>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">حالة النشر:</span>
                  <select
                    value={lessonStatus}
                    onChange={(e) => setLessonStatus(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="published">منشور فوراً للطلاب 🟢</option>
                    <option value="draft">مسودة معطلة 🟡</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddLessonModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md cursor-pointer"
                >
                  إضافة المحتوى
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Schedule Lesson */}
      {schedulingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-right relative">
            <button
              onClick={() => setSchedulingLesson(null)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">جدولة تاريخ ووقت نشر المحاضرة</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              حدد الموعد المحدد الذي ترغب في أن تتاح فيه هذه المحاضرة تلقائياً للطلاب المشتركين:
            </p>

            <form onSubmit={handleSaveLessonSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تاريخ ووقت النشر
                </label>
                <input
                  type="datetime-local"
                  required
                  value={schedulingLesson.scheduledDate}
                  onChange={(e) => setSchedulingLesson({ ...schedulingLesson, scheduledDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              {schedulingLesson.scheduledDate && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdateLesson) {
                        onUpdateLesson(course.id, schedulingLesson.moduleId, schedulingLesson.lesson.id, {
                          scheduledDate: undefined,
                          scheduledPublishDate: undefined,
                          isScheduled: false,
                        });
                      }
                      setSchedulingLesson(null);
                    }}
                    className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                  >
                    إلغاء الجدولة
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSchedulingLesson(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md cursor-pointer"
                >
                  حفظ الجدولة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal: Delete Lesson Confirmation */}
      {lessonToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-rose-500/30 p-6 shadow-2xl space-y-4 text-right">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                تأكيد حذف الدرس؟
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف درس <strong className="text-rose-600 dark:text-rose-400 font-bold">"{lessonToDelete.lesson.title}"</strong>؟ لن يتمكن الطلاب من مشاهدته بعد الآن.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLessonToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteLesson}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>تأكيد الحذف</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal: Teacher Live Video Preview */}
      {previewVideoLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6 text-right relative my-8">
            <button
              onClick={() => setPreviewVideoLesson(null)}
              className="absolute top-4 left-4 p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer z-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    👁️ معاينة مشغل الفيديو الحية للمعلم
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300">
                    {previewVideoLesson.playerMode === 'youtube' ? '📺 يوتيوب مباشر' : '🛡️ مشغل المنصة المشفر'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mt-2">
                  {previewVideoLesson.title}
                </h3>
              </div>

              {/* Live Switcher in Preview Modal */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newMode = previewVideoLesson.playerMode === 'youtube' ? 'platform' : 'youtube';
                    const updated = { ...previewVideoLesson, playerMode: newMode };
                    setPreviewVideoLesson(updated);
                    if (onUpdateLesson) {
                      const mod = modules.find((m) => m.lessons.some((l) => l.id === previewVideoLesson.id));
                      if (mod) onUpdateLesson(course.id, mod.id, previewVideoLesson.id, { playerMode: newMode });
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Tv2 className="w-4 h-4" />
                  <span>
                    اختبار بالنمط الآخر ({previewVideoLesson.playerMode === 'youtube' ? 'المنصة المشفر 🛡️' : 'يوتيوب المباشر 📺'})
                  </span>
                </button>
              </div>
            </div>

            {/* Live SecureVideoPlayer Component */}
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-2">
              <SecureVideoPlayer lesson={previewVideoLesson} course={course} />
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed flex items-center justify-between">
              <span>
                💡 تجربة حية: يتيح لك هذا الشباك معاينة تجربة الطالب الدقيقة واختبار طبقة الحماية أو النمط الإعلاني بضغطة زر.
              </span>
              <button
                onClick={() => setPreviewVideoLesson(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

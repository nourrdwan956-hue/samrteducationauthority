import React, { useState } from 'react';
import {
  CheckCircle,
  CheckSquare,
  AlignLeft,
  ArrowUpDown,
  Headphones,
  FileText,
  Plus,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  Layers,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Sparkles,
  Users,
  Check,
  X,
  FileDown,
  Tag,
  Star,
  MessageSquare,
  Search,
  RefreshCw,
  Volume2,
  Lightbulb,
  PlusCircle,
  ArrowRight,
  ArrowLeft,
  Copy,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  Assignment,
  AssignmentSubmission,
  Course,
  Question,
  QuestionType,
  MatchingPair,
  PassageSubQuestion,
} from '../../types';

interface AssignmentsManagerProps {
  course: Course;
}

const QUESTION_TYPES: { type: QuestionType; label: string; icon: any; description: string }[] = [
  { type: 'mcq', label: 'اختيار من متعدد (MCQ)', icon: CheckCircle, description: '4 خيارات مع تحديد الإجابة الصحيحة' },
  { type: 'true_false', label: 'صح أم خطأ (True / False)', icon: CheckSquare, description: 'عبارة يحدد الطالب صحتها أو خطأها' },
  { type: 'fill_blank', label: 'أكمل الفراغات (Fill in the Blank)', icon: AlignLeft, description: 'كلمة مفقودة يدخلها الطالب مع كلمات بديلة مقبولة' },
  { type: 'matching', label: 'التوصيل والمزاوجة (Matching)', icon: Layers, description: 'ربط عناصر العمود الأيمن بالعمود الأيسر' },
  { type: 'ordering', label: 'ترتيب الجمل (Sentence Ordering)', icon: ArrowUpDown, description: 'ترتيب كلمات أو جمل مبعثرة في سياق صحيح' },
  { type: 'listening', label: 'فهم واستماع صوتي (Listening)', icon: Headphones, description: 'مقطع أو نص صوتي مسموع مع أسئلة استيعاب' },
  { type: 'passage', label: 'قطعة قراءة وفهم (Reading Passage)', icon: FileText, description: 'نص قرائي متكامل مع أسئلة فرعية متعددة' },
  { type: 'error_correction', label: 'تصحيح الخطأ (Error Correction)', icon: AlertCircle, description: 'تحديد الكلمة الخاطئة في الجملة وكتابة تصحيحها' },
  { type: 'short_answer', label: 'سؤال مقالي قصير (Short Answer)', icon: BookOpen, description: 'إجابة مركزة مع نموذج إجابة وكلمات مفتاحية' },
  { type: 'essay', label: 'مقال وموضوع تعبير (Essay)', icon: FileText, description: 'كتابة مقال متكامل مع معايير تقييم واضحة' },
];

export const AssignmentsManager: React.FC<AssignmentsManagerProps> = ({ course }) => {
  const {
    currentUser,
    assignments,
    assignmentSubmissions,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    gradeAssignmentSubmission,
    addToast,
    courses,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignmentForGrading, setSelectedAssignmentForGrading] = useState<Assignment | null>(null);
  const [activeGradingSubmission, setActiveGradingSubmission] = useState<AssignmentSubmission | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateTargetAssignment, setDuplicateTargetAssignment] = useState<Assignment | null>(null);
  const [duplicateTargetCourseId, setDuplicateTargetCourseId] = useState<string>(course.id);
  const [duplicateTargetModuleId, setDuplicateTargetModuleId] = useState<string>('');
  const [copyMode, setCopyMode] = useState<'duplicate' | 'move'>('duplicate');
  const [customDuplicateTitle, setCustomDuplicateTitle] = useState('');
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSubject, setFormSubject] = useState(course.subject || 'اللغة الإنجليزية');
  const [formDuration, setFormDuration] = useState(30);
  const [formPassingPercent, setFormPassingPercent] = useState(60);
  const [formMaxAttempts, setFormMaxAttempts] = useState(3);
  const [formDueDate, setFormDueDate] = useState('2026-12-31');
  const [formAllowConceptSheet, setFormAllowConceptSheet] = useState(true);
  const [formConceptSheetTitle, setFormConceptSheetTitle] = useState('ورقة المفاهيم والقواعد الوزارية الاسترشادية');
  const [formConceptSheetContent, setFormConceptSheetContent] = useState('');
  const [formAutoGrading, setFormAutoGrading] = useState(true);
  const [formShowModelAnswer, setFormShowModelAnswer] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Add Question Handler
  const handleAddQuestion = (type: QuestionType = 'mcq') => {
    const qId = 'q_' + Date.now() + '_' + (questions.length + 1);
    let newQ: Question = {
      id: qId,
      examId: '',
      type,
      prompt: '',
      hint: '',
      allowHint: true,
      explanation: '',
      points: 2,
    };

    switch (type) {
      case 'mcq':
        newQ.options = ['', '', '', ''];
        newQ.correctOptionIndex = 0;
        break;
      case 'true_false':
        newQ.options = ['صحيح (True)', 'خطأ (False)'];
        newQ.correctBool = true;
        newQ.correctOptionIndex = 0;
        break;
      case 'fill_blank':
        newQ.fillBlankAnswers = [''];
        break;
      case 'matching':
        newQ.matchingPairs = [
          { id: 'm1', left: 'المصطلح الأول', right: 'التعريف المقابل له' },
          { id: 'm2', left: 'المصطلح الثاني', right: 'التعريف المقابل له' },
        ];
        break;
      case 'ordering':
        newQ.orderingItems = ['الكلمة الأولى', 'الكلمة الثانية', 'الكلمة الثالثة', 'الكلمة الرابعة'];
        break;
      case 'listening':
        newQ.audioScript = 'نص المقطع الصوتي المسموع للطالب...';
        newQ.options = ['الخيار أ', 'الخيار ب', 'الخيار ج', 'الخيار د'];
        newQ.correctOptionIndex = 0;
        break;
      case 'passage':
        newQ.passageText = 'اكتب نص القطعة القرائية هنا بتفاصيلها...';
        newQ.passageQuestions = [
          {
            id: 'pq_1',
            prompt: 'السؤال الأول على القطعة:',
            options: ['إجابة 1', 'إجابة 2', 'إجابة 3', 'إجابة 4'],
            correctOptionIndex: 0,
            points: 2,
          },
        ];
        break;
      case 'error_correction':
        newQ.sentenceWithMistake = 'اكتب الجملة الكاملة المحتوية على الخطأ هنا';
        newQ.targetMistake = 'الكلمة الخاطئة';
        newQ.correction = 'الكلمة الصحيحة البديلة';
        break;
      case 'short_answer':
        newQ.sampleAnswer = 'نموذج الإجابة المتوقعة من الطالب';
        newQ.keywords = ['كلمة مفتاحية 1', 'كلمة مفتاحية 2'];
        break;
      case 'essay':
        newQ.sampleAnswer = 'معايير التقييم وتوزيع الدرجات على الأفكار والأسلوب والقواعد';
        break;
    }

    setQuestions((prev) => [...prev, newQ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMoveQuestionUp = (idx: number) => {
    if (idx === 0) return;
    setQuestions((prev) => {
      const updated = [...prev];
      const temp = updated[idx];
      updated[idx] = updated[idx - 1];
      updated[idx - 1] = temp;
      return updated;
    });
  };

  const handleMoveQuestionDown = (idx: number) => {
    if (idx === questions.length - 1) return;
    setQuestions((prev) => {
      const updated = [...prev];
      const temp = updated[idx];
      updated[idx] = updated[idx + 1];
      updated[idx + 1] = temp;
      return updated;
    });
  };

  const handleDuplicateQuestion = (idx: number) => {
    const qToDup = questions[idx];
    const duplicated: Question = {
      ...qToDup,
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      prompt: qToDup.prompt + ' (نسخة)',
    };
    setQuestions((prev) => {
      const updated = [...prev];
      updated.splice(idx + 1, 0, duplicated);
      return updated;
    });
  };

  // Manual Grading State
  const [manualScores, setManualScores] = useState<Record<string, number>>({});
  const [teacherFeedback, setTeacherFeedback] = useState('');

  // Filter assignments for this course
  const courseAssignments = assignments.filter(
    (a) => a.courseId === course.id || !a.courseId
  );

  const filteredAssignments = courseAssignments.filter(
    (a) =>
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = (existing?: Assignment) => {
    if (existing) {
      setEditingAssignment(existing);
      setFormTitle(existing.title);
      setFormDescription(existing.description || '');
      setFormSubject(existing.subject || course.subject || 'اللغة الإنجليزية');
      setFormDuration(existing.durationMinutes || 30);
      setFormPassingPercent(existing.passingScorePercent || 60);
      setFormMaxAttempts(existing.maxAttempts || 3);
      setFormDueDate(existing.dueDate || '2026-12-31');
      setFormAllowConceptSheet(existing.allowConceptSheet ?? true);
      setFormConceptSheetTitle(existing.conceptSheetTitle || 'ورقة المفاهيم والقواعد الوزارية الاسترشادية');
      setFormConceptSheetContent(existing.conceptSheetContent || '');
      setFormAutoGrading(existing.autoGrading ?? true);
      setFormShowModelAnswer(existing.showModelAnswerAfterSubmission ?? true);
      setQuestions(existing.questions || []);
    } else {
      setEditingAssignment(null);
      setFormTitle('');
      setFormDescription('واجب منزلي تخصصي مع ورقة مفاهيم استرشادية مرافقة للطالب في كافة الأسئلة.');
      setFormSubject(course.subject || 'اللغة الإنجليزية');
      setFormDuration(35);
      setFormPassingPercent(60);
      setFormMaxAttempts(3);
      setFormDueDate('2026-12-31');
      setFormAllowConceptSheet(true);
      setFormConceptSheetTitle('ورقة المفاهيم والقواعد الذهبية - ليلة الامتحان');
      setFormConceptSheetContent(
        `## 📌 ورقة المفاهيم وقوانين الواجب:\n` +
          `1. **If Conditionals Summary**:\n` +
          `   - Zero: If + Present Simple, Present Simple (حقيقة علمية)\n` +
          `   - First: If + Present Simple, will + inf (احتمال في المستقبل)\n` +
          `   - Second: If + Past Simple, would + inf (افتراض غير واقعي في الحاضر)\n` +
          `   - Third: If + Past Perfect (had + p.p), would have + p.p (ندم أو افتراض مستحيل في الماضي)\n\n` +
          `2. **Key Notes & Irregular Verbs**:\n` +
          `   - Unless = If not\n` +
          `   - Provided that / As long as = If\n` +
          `   - In case of + V-ing / noun\n` +
          `   - Without / But for + V-ing / noun`
      );
      setFormAutoGrading(true);
      setFormShowModelAnswer(true);
      setQuestions([]);
    }
    setIsCreateModalOpen(true);
  };

  const handleDuplicateOrMove = () => {
    if (!duplicateTargetAssignment || !duplicateTargetCourseId) return;

    const chosenTitle = customDuplicateTitle.trim() || (
      copyMode === 'duplicate'
        ? (duplicateTargetAssignment.title + (duplicateTargetCourseId === course.id ? ' (نسخة)' : ''))
        : duplicateTargetAssignment.title
    );

    if (copyMode === 'move') {
      updateAssignment(duplicateTargetAssignment.id, {
        courseId: duplicateTargetCourseId,
        moduleId: duplicateTargetModuleId || undefined,
        title: chosenTitle,
      });
      setIsDuplicateModalOpen(false);
      setDuplicateTargetAssignment(null);
      addToast('success', 'تم نقل الواجب بنجاح إلى الكورس/الوحدة المحددة! 📦');
      return;
    }

    const newAssignment: Assignment = {
      ...duplicateTargetAssignment,
      id: 'asg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      courseId: duplicateTargetCourseId,
      moduleId: duplicateTargetModuleId || undefined,
      title: chosenTitle,
      createdAt: new Date().toISOString(),
      status: duplicateTargetAssignment.status || 'published',
      isPublished: duplicateTargetAssignment.isPublished ?? true,
      questions: (duplicateTargetAssignment.questions || []).map((q, idx) => ({
        ...q,
        id: 'q_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substring(2, 6),
        examId: '',
      })),
    };

    createAssignment(newAssignment);
    setIsDuplicateModalOpen(false);
    setDuplicateTargetAssignment(null);
    addToast('success', 'تم استنساخ الواجب بنجاح بكافة أسئلته وورقة المفاهيم! 📑');
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      addToast('يرجى كتابة عنوان الواجب المنزلي.', 'error');
      return;
    }

    const payload: Partial<Assignment> = {
      courseId: course.id,
      title: formTitle.trim(),
      description: formDescription.trim(),
      subject: formSubject.trim(),
      durationMinutes: formDuration,
      passingScorePercent: formPassingPercent,
      maxAttempts: formMaxAttempts,
      dueDate: formDueDate,
      allowConceptSheet: formAllowConceptSheet,
      conceptSheetTitle: formConceptSheetTitle.trim(),
      conceptSheetContent: formConceptSheetContent.trim(),
      autoGrading: formAutoGrading,
      showModelAnswerAfterSubmission: formShowModelAnswer,
      questions,
      totalPoints: questions.reduce((sum, q) => {
        if (q.type === 'passage' && q.passageQuestions) {
          return sum + q.passageQuestions.reduce((pqAcc, pq) => pqAcc + pq.points, 0);
        }
        return sum + (q.points || 1);
      }, 0),
      status: 'published',
      isPublished: true,
    };

    if (editingAssignment) {
      updateAssignment(editingAssignment.id, payload);
      addToast('تم تحديث الواجب بنجاح!', 'success');
    } else {
      createAssignment(payload);
      addToast('تم إنشاء ونشر الواجب بنجاح!', 'success');
    }

    setIsCreateModalOpen(false);
  };

  const handleOpenGradingModal = (sub: AssignmentSubmission) => {
    setActiveGradingSubmission(sub);
    setManualScores(sub.manualGradePoints || {});
    setTeacherFeedback(sub.teacherFeedback || '');
  };

  const handleSaveGrading = () => {
    if (!activeGradingSubmission) return;
    gradeAssignmentSubmission(activeGradingSubmission.id, manualScores, teacherFeedback);
    setActiveGradingSubmission(null);
    addToast('تم حفظ التقييم وملاحظات المعلم بنجاح!', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-900/90 via-slate-900 to-cyan-950/80 border border-teal-500/30 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  الواجبات المنزلية المتخصصة وورقة المفاهيم 📝
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold">
                  {courseAssignments.length} واجب
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                إسناد واجبات تدريبية مع ميزة "ورقة المفاهيم والقوانين" التي تظهر للطالب أثناء الإجابة، مع التصحيح الإلكتروني ورصد ملاحظات المعلم.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => openCreateModal()}
          className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-teal-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء واجب تخصصي جديد</span>
        </button>
      </div>

      {/* Search and Summary */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في عنوان أو وصف الواجب..."
            className="w-full pr-10 pl-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span>إجمالي التسليمات:</span>
          <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">
            {assignmentSubmissions.length} تسليم
          </span>
        </div>
      </div>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-500 mx-auto flex items-center justify-center">
            <FileText className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-white">لم يتم إنشاء واجبات منزلية بعد</h4>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            قم بإنشاء أول واجب تخصصي مع ورقة مفاهيم تفاعلية لمساعدة الطلاب على تطبيق القواعد والقوانين.
          </p>
          <button
            onClick={() => openCreateModal()}
            className="px-5 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-colors"
          >
            إنشاء واجب الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAssignments.map((assignment) => {
            const subsForAssignment = assignmentSubmissions.filter(
              (s) => s.assignmentId === assignment.id
            );
            const passedSubs = subsForAssignment.filter((s) => s.passed).length;
            const passRate =
              subsForAssignment.length > 0
                ? Math.round((passedSubs / subsForAssignment.length) * 100)
                : 0;

            return (
              <div
                key={assignment.id}
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-teal-500/40 transition-all"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-black">
                        واجب تخصصي
                      </span>
                      {assignment.allowConceptSheet && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[11px] font-bold flex items-center gap-1">
                          <span>📑 مرفق ورقة المفاهيم</span>
                        </span>
                      )}
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {assignment.subject || 'عام'}
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {assignment.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {assignment.description || 'لا توجد تعليمات إضافية'}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-500" />
                        {assignment.durationMinutes || 30} دقيقة
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-teal-500" />
                        {assignment.totalPoints || assignment.questions?.length * 2 || 10} درجة
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-teal-500" />
                        النجاح من {assignment.passingScorePercent || 60}%
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-teal-500" />
                        {assignment.questions?.length || 0} سؤال
                      </span>
                      {assignment.dueDate && (
                        <span className="flex items-center gap-1 text-rose-500 font-bold">
                          <Calendar className="w-3.5 h-3.5" />
                          ينتهي: {assignment.dueDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-center min-w-[120px] flex-1 sm:flex-none">
                      <div className="text-sm font-black text-teal-600 dark:text-teal-400">
                        {subsForAssignment.length} تسليم
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        نسبة النجاح: {passRate}%
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedAssignmentForGrading(assignment)}
                        className="px-3.5 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Users className="w-4 h-4" />
                        <span>التسليمات ({subsForAssignment.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openCreateModal(assignment)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-teal-500 hover:text-white transition-colors cursor-pointer"
                        title="تعديل الواجب"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDuplicateTargetAssignment(assignment);
                          setDuplicateTargetCourseId(course.id);
                          setDuplicateTargetModuleId(assignment.moduleId || '');
                          setCopyMode('duplicate');
                          setCustomDuplicateTitle(assignment.title + (duplicateTargetCourseId === course.id ? ' (نسخة)' : ''));
                          setIsDuplicateModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-500 hover:text-white transition-colors cursor-pointer"
                        title="استنساخ أو نقل التكليف لكورس أو وحدة أخرى"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setAssignmentToDelete(assignment)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                        title="حذف الواجب نهائياً"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const newStatus = assignment.isPublished ? false : true;
                          updateAssignment(assignment.id, { isPublished: newStatus, status: newStatus ? 'published' : 'draft' });
                          addToast(newStatus ? 'تم نشر الواجب للطلاب' : 'تم تحويل الواجب إلى مسودة', 'info');
                        }}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          assignment.isPublished
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                        title={assignment.isPublished ? 'إلغاء النشر' : 'نشر الواجب'}
                      >
                        {assignment.isPublished ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4 opacity-50" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Concept Sheet Preview Snippet */}
                {assignment.allowConceptSheet && assignment.conceptSheetContent && (
                  <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 text-xs">
                    <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300 pb-1">
                      <span>📑 {assignment.conceptSheetTitle || 'ورقة المفاهيم المرفقة'}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 font-mono text-[11px] line-clamp-2 leading-relaxed">
                      {assignment.conceptSheetContent}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Submissions & Electronic Grading Drawer / Modal */}
      {selectedAssignmentForGrading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>تسليمات واجب:</span>
                  <span className="text-teal-600 dark:text-teal-400">
                    "{selectedAssignmentForGrading.title}"
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  عرض الدرجات والتصحيح الإلكتروني مع إمكانية مراجعة إجابات الطالب وإضافة ملاحظات وتعديل الدرجة.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAssignmentForGrading(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submissions List */}
            {assignmentSubmissions.filter((s) => s.assignmentId === selectedAssignmentForGrading.id).length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                لم يقم أي طالب بتسليم هذا الواجب حتى الآن.
              </div>
            ) : (
              <div className="space-y-3">
                {assignmentSubmissions
                  .filter((s) => s.assignmentId === selectedAssignmentForGrading.id)
                  .map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {sub.studentName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              sub.passed
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {sub.passed ? 'ناجح ✓' : 'راسب ✗'} ({sub.percentage}%)
                          </span>
                          {sub.gradedByTeacher && (
                            <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-bold">
                              تم رصد ملاحظات المعلم ✍️
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span>الدرجة: {sub.score} / {sub.totalPoints}</span>
                          <span>•</span>
                          <span>تاريخ التسليم: {new Date(sub.submittedAt).toLocaleDateString('ar-EG')}</span>
                          {sub.conceptSheetUsed && (
                            <>
                              <span>•</span>
                              <span className="text-amber-500 font-bold">استعان بورقة المفاهيم 📑</span>
                            </>
                          )}
                        </div>

                        {sub.teacherFeedback && (
                          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-500/10 p-2 rounded-lg mt-1">
                            ملاحظة المعلم: {sub.teacherFeedback}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const grantKey = `sea_grant_assignment_${selectedAssignmentForGrading.id}_${sub.studentId}`;
                            const current = Number(localStorage.getItem(grantKey) || '0');
                            localStorage.setItem(grantKey, String(current + 1));
                            addToast(`تم منح الطالب (${sub.studentName}) محاولة إضافية جديدة للواجب 🎉`, 'success');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                          title="منح الطالب إذن محاولة جديدة بعد استنفاذ المحاولات"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                          <span>منح محاولة جديدة 🔄</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenGradingModal(sub)}
                          className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
                        >
                          مراجعة وتعديل الدرجة ✍️
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Grading Review Sub-Modal */}
      {activeGradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                تصحيح ورصد ملاحظات الطالب: {activeGradingSubmission.studentName}
              </h4>
              <button
                type="button"
                onClick={() => setActiveGradingSubmission(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-800 dark:text-teal-300 text-xs">
                الدرجة الحالية المحسوبة تلقائياً: <strong>{activeGradingSubmission.score} من {activeGradingSubmission.totalPoints}</strong> ({activeGradingSubmission.percentage}%)
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تعديل الدرجة الإجمالية (اختياري):
                </label>
                <input
                  type="number"
                  defaultValue={activeGradingSubmission.score}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setManualScores({ manual_override: val });
                  }}
                  min={0}
                  max={activeGradingSubmission.totalPoints}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ملاحظات وتوجيهات المعلم للطالب:
                </label>
                <textarea
                  rows={4}
                  value={teacherFeedback}
                  onChange={(e) => setTeacherFeedback(e.target.value)}
                  placeholder="اكتب ملاحظاتك للطالب، نقاط القوة ونقاط الضعف..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setActiveGradingSubmission(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveGrading}
                className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20"
              >
                حفظ التقييم والملاحظات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy & Move Modal */}
      {isDuplicateModalOpen && duplicateTargetAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Copy className="w-5 h-5 text-indigo-500" />
                <span>إدارة الواجب: استنساخ أو نقل</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsDuplicateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setCopyMode('duplicate');
                  setCustomDuplicateTitle(duplicateTargetAssignment.title + (duplicateTargetCourseId === course.id ? ' (نسخة)' : ''));
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  copyMode === 'duplicate'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                استنساخ نسخة جديدة (Duplicate)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCopyMode('move');
                  setCustomDuplicateTitle(duplicateTargetAssignment.title);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  copyMode === 'move'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                نقل الواجب بالكامل (Move)
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان الواجب في الوجهة:
                </label>
                <input
                  type="text"
                  value={customDuplicateTitle}
                  onChange={(e) => setCustomDuplicateTitle(e.target.value)}
                  placeholder="عنوان التكليف الجديد..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الكورس المستهدف:
                </label>
                <select
                  value={duplicateTargetCourseId}
                  onChange={(e) => {
                    setDuplicateTargetCourseId(e.target.value);
                    setDuplicateTargetModuleId('');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} {c.id === course.id ? '(الكورس الحالي)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {(() => {
                const selCourse = courses.find((c) => c.id === duplicateTargetCourseId) || course;
                const modules = selCourse.modules || [];
                if (modules.length === 0) return null;

                return (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      الوحدة / الباب المستهدف (اختياري):
                    </label>
                    <select
                      value={duplicateTargetModuleId}
                      onChange={(e) => setDuplicateTargetModuleId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none"
                    >
                      <option value="">-- بدون تعيين لوحدة محددة (واجب عام بالكورس) --</option>
                      {modules.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })()}

              <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 text-xs text-indigo-900 dark:text-indigo-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <span>معلومات التكليف:</span>
                </p>
                <p className="text-[11px] opacity-80">
                  • عدد الأسئلة: {duplicateTargetAssignment.questions?.length || 0} أسئلة ({duplicateTargetAssignment.totalPoints} درجة)
                </p>
                <p className="text-[11px] opacity-80">
                  • ورقة المفاهيم: {duplicateTargetAssignment.allowConceptSheet ? 'مفعلة مع القوانين المرفقة' : 'غير مفعلة'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsDuplicateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDuplicateOrMove}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all ${
                  copyMode === 'move'
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20'
                }`}
              >
                {copyMode === 'move' ? 'تأكيد نقل الواجب 📦' : 'تأكيد استنساخ الواجب 📑'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {assignmentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">تأكيد حذف الواجب</h3>
                <p className="text-xs text-rose-500 font-semibold">إجراء لا يمكن التراجع عنه</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                هل أنت متأكد من رغبتك في حذف هذا الواجب نهائياً؟
              </p>
              <p className="text-slate-600 dark:text-slate-400 font-bold">
                "{assignmentToDelete.title}"
              </p>
              <p className="text-[11px] text-slate-500">
                يحتوي الواجب على {assignmentToDelete.questions?.length || 0} أسئلة بإجمالي {assignmentToDelete.totalPoints} درجة.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAssignmentToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                تراجع وإلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAssignment(assignmentToDelete.id);
                  setAssignmentToDelete(null);
                  addToast('success', 'تم حذف الواجب بنجاح.');
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-900/20"
              >
                نعم، احذف الواجب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ASSIGNMENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {editingAssignment ? 'تعديل الواجب التخصصي' : 'إنشاء واجب تخصصي مع ورقة المفاهيم'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    بناء تكليف متكامل مدعوم بكافة أنماط الأسئلة وورقة القوانين الاسترشادية
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body & Form */}
            <form onSubmit={handleSaveAssignment} className="flex flex-col min-h-0 flex-1">
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                {/* Title & Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      عنوان الواجب:
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="مثال: واجب الوحدة الأولى - التراكيب اللغوية"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      المادة:
                    </label>
                    <input
                      type="text"
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تعليمات ووصف الواجب:
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="تعليمات للطالب قبل البدء في الحل..."
                    className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* CONCEPT SHEET CONFIGURATION SECTION */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📑</span>
                      <label className="text-xs font-black text-amber-900 dark:text-amber-200 select-none cursor-pointer">
                        تضمين ورقة المفاهيم والقوانين (تظهر للطالب في كل الأسئلة)
                      </label>
                    </div>
                    <input
                      type="checkbox"
                      checked={formAllowConceptSheet}
                      onChange={(e) => setFormAllowConceptSheet(e.target.checked)}
                      className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                  </div>

                  {formAllowConceptSheet && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-300 mb-1">
                          عنوان ورقة المفاهيم:
                        </label>
                        <input
                          type="text"
                          value={formConceptSheetTitle}
                          onChange={(e) => setFormConceptSheetTitle(e.target.value)}
                          placeholder="مثال: ورقة القواعد الذهبية والملاحظات الاسترشادية"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/40 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-300 mb-1">
                          محتوى ورقة المفاهيم والقوانين (نصوص، قواعد، تلخيص):
                        </label>
                        <div className="relative rounded-2xl overflow-hidden border border-amber-300 dark:border-amber-700/50 shadow-inner bg-amber-50/50 dark:bg-slate-900 focus-within:ring-2 focus-within:ring-amber-500 transition-all">
                          <div className="flex items-center gap-2 p-2 border-b border-amber-200 dark:border-amber-800/50 bg-amber-100/50 dark:bg-slate-800/80">
                            <button
                              type="button"
                              onClick={() => setFormConceptSheetContent((prev) => prev + '\n**قاعدة جديدة:** ')}
                              className="px-2 py-1 rounded-lg bg-amber-200/60 dark:bg-slate-700 text-amber-900 dark:text-amber-300 text-[10px] font-bold"
                            >
                              + قاعدة B
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormConceptSheetContent((prev) => prev + '\n- نقطة استرشادية: ')}
                              className="px-2 py-1 rounded-lg bg-amber-200/60 dark:bg-slate-700 text-amber-900 dark:text-amber-300 text-[10px] font-bold"
                            >
                              • نقطة
                            </button>
                            <span className="h-4 w-px bg-amber-300 dark:bg-amber-700 mx-1"></span>
                            <span className="text-[10px] font-bold text-amber-700/70 dark:text-amber-500/70">
                              تظهر بنافذة منبثقة تفاعلية للطالب أثناء الحل
                            </span>
                          </div>
                          <textarea
                            rows={6}
                            value={formConceptSheetContent}
                            onChange={(e) => setFormConceptSheetContent(e.target.value)}
                            placeholder="اكتب هنا القواعد، المعادلات، أو الملاحظات التي ستكون متاحة للطالب للاطلاع عليها أثناء الحل..."
                            className="w-full p-4 font-mono text-xs sm:text-sm bg-transparent text-amber-950 dark:text-amber-100 focus:outline-none resize-y"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Assignment Timing & Attempts */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      المدة (دقيقة):
                    </label>
                    <input
                      type="number"
                      value={formDuration}
                      onChange={(e) => setFormDuration(Number(e.target.value) || 30)}
                      min={5}
                      max={180}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      نسبة النجاح (%):
                    </label>
                    <input
                      type="number"
                      value={formPassingPercent}
                      onChange={(e) => setFormPassingPercent(Number(e.target.value) || 60)}
                      min={10}
                      max={100}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      عدد المحاولات:
                    </label>
                    <input
                      type="number"
                      value={formMaxAttempts}
                      onChange={(e) => setFormMaxAttempts(Number(e.target.value) || 1)}
                      min={1}
                      max={10}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      تاريخ الانتهاء:
                    </label>
                    <input
                      type="date"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* QUESTIONS SECTION */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-teal-400" />
                        <span>بنك الأسئلة والأنماط المخصصة ({questions.length} سؤال)</span>
                      </h4>
                      <p className="text-xs text-slate-400">أضف الأسئلة بأي نمط ترغب به</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        onChange={(e) => {
                          handleAddQuestion(e.target.value as QuestionType);
                          e.target.value = '';
                        }}
                        defaultValue=""
                        className="px-3 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs cursor-pointer shadow-md focus:outline-none"
                      >
                        <option value="" disabled>+ إضافة سؤال بنمط محدد...</option>
                        {QUESTION_TYPES.map((qt) => (
                          <option key={qt.type} value={qt.type} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            + {qt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Question Cards List */}
                  <div className="space-y-4">
                    {questions.map((q, idx) => {
                      const currentTypeInfo = QUESTION_TYPES.find((qt) => qt.type === q.type) || QUESTION_TYPES[0];
                      const TypeIcon = currentTypeInfo.icon;

                      return (
                        <div
                          key={q.id}
                          className="p-5 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm transition-all"
                        >
                          {/* Question Card Top Bar */}
                          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80">
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 font-black text-xs flex items-center justify-center border border-teal-500/30">
                                {idx + 1}
                              </span>

                              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-teal-600 dark:text-teal-300">
                                <TypeIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                                <span>{currentTypeInfo.label}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
                                <span className="text-[11px] font-bold text-slate-500">الدرجة:</span>
                                <input
                                  type="number"
                                  min={1}
                                  max={50}
                                  value={q.points || 1}
                                  onChange={(e) => {
                                    const val = Number(e.target.value) || 1;
                                    setQuestions((prev) =>
                                      prev.map((item, i) => (i === idx ? { ...item, points: val } : item))
                                    );
                                  }}
                                  className="w-10 text-center font-bold text-xs bg-transparent text-slate-900 dark:text-white focus:outline-none"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleMoveQuestionUp(idx)}
                                disabled={idx === 0}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
                                title="تحريك لأعلى"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleMoveQuestionDown(idx)}
                                disabled={idx === questions.length - 1}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
                                title="تحريك لأسفل"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDuplicateQuestion(idx)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                                title="نسخ السؤال"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveQuestion(idx)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/20"
                                title="حذف السؤال"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Question Prompt */}
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              نص السؤال *
                            </label>
                            <input
                              type="text"
                              required
                              value={q.prompt}
                              onChange={(e) => {
                                const val = e.target.value;
                                setQuestions((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, prompt: val } : item))
                                );
                              }}
                              placeholder="اكتب منطوق السؤال هنا بوضوح..."
                              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:border-teal-500 focus:outline-none"
                            />
                          </div>

                          {/* QUESTION TYPE SPECIFIC FIELDS */}
                          {/* 1. MCQ */}
                          {q.type === 'mcq' && (
                            <div className="space-y-2.5 pt-1">
                              <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                  الخيارات (حدد الإجابة بالضغط على الدائرة):
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuestions((prev) =>
                                      prev.map((item, i) => {
                                        if (i === idx) {
                                          const curOpts = item.options || ['', '', '', ''];
                                          return { ...item, options: [...curOpts, ''] };
                                        }
                                        return item;
                                      })
                                    );
                                  }}
                                  className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>+ إضافة خيار</span>
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {(q.options || ['', '', '', '']).map((opt, optIdx) => (
                                  <div
                                    key={optIdx}
                                    className={`flex items-center gap-2 p-2.5 rounded-2xl border transition-all ${
                                      q.correctOptionIndex === optIdx
                                        ? 'bg-emerald-500/10 border-emerald-500/50 dark:bg-emerald-950/20'
                                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setQuestions((prev) =>
                                          prev.map((item, i) =>
                                            i === idx ? { ...item, correctOptionIndex: optIdx } : item
                                          )
                                        );
                                      }}
                                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                        q.correctOptionIndex === optIdx
                                          ? 'border-emerald-500 bg-emerald-500 text-white'
                                          : 'border-slate-400 hover:border-emerald-500'
                                      }`}
                                    >
                                      {q.correctOptionIndex === optIdx && <Check className="w-3 h-3 stroke-[3]" />}
                                    </button>
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) => {
                                        const newOpts = [...(q.options || ['', '', '', ''])];
                                        newOpts[optIdx] = e.target.value;
                                        setQuestions((prev) =>
                                          prev.map((item, i) => (i === idx ? { ...item, options: newOpts } : item))
                                        );
                                      }}
                                      placeholder={`الخيار ${String.fromCharCode(65 + optIdx)}...`}
                                      className="flex-1 text-xs bg-transparent text-slate-900 dark:text-white focus:outline-none font-medium"
                                    />
                                    {(q.options || []).length > 2 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setQuestions((prev) =>
                                            prev.map((item, i) => {
                                              if (i === idx) {
                                                const updatedOpts = (item.options || []).filter((_, oI) => oI !== optIdx);
                                                let newCorr = item.correctOptionIndex || 0;
                                                if (newCorr >= updatedOpts.length) {
                                                  newCorr = Math.max(0, updatedOpts.length - 1);
                                                } else if (newCorr === optIdx) {
                                                  newCorr = 0;
                                                }
                                                return { ...item, options: updatedOpts, correctOptionIndex: newCorr };
                                              }
                                              return item;
                                            })
                                          );
                                        }}
                                        title="حذف الخيار"
                                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 2. True / False */}
                          {q.type === 'true_false' && (
                            <div className="space-y-2 pt-1">
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                الإجابة الصحيحة للعبارة:
                              </label>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuestions((prev) =>
                                      prev.map((item, i) =>
                                        i === idx
                                          ? { ...item, correctBool: true, correctOptionIndex: 0 }
                                          : item
                                      )
                                    );
                                  }}
                                  className={`flex-1 py-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                    q.correctBool !== false
                                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                                  }`}
                                >
                                  <Check className="w-4 h-4" />
                                  <span>صحيح (True)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuestions((prev) =>
                                      prev.map((item, i) =>
                                        i === idx
                                          ? { ...item, correctBool: false, correctOptionIndex: 1 }
                                          : item
                                      )
                                    );
                                  }}
                                  className={`flex-1 py-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                    q.correctBool === false
                                      ? 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400 shadow-sm'
                                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                                  }`}
                                >
                                  <X className="w-4 h-4" />
                                  <span>خطأ (False)</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* 3. Fill in the Blank */}
                          {q.type === 'fill_blank' && (
                            <div className="space-y-2 pt-1">
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                الكلمات والعبارات المقبولة كإجابة صحيحة (افصل بين الإجابات البديلة بفاصلة):
                              </label>
                              <input
                                type="text"
                                value={(q.fillBlankAnswers || []).join(' , ')}
                                onChange={(e) => {
                                  const answers = e.target.value.split(',').map((s) => s.trim());
                                  setQuestions((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, fillBlankAnswers: answers } : item))
                                  );
                                }}
                                placeholder="مثال: photosynthesis , Photosynthesis , البناء الضوئي"
                                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-teal-500 focus:outline-none"
                              />
                            </div>
                          )}

                          {/* 4. Matching */}
                          {q.type === 'matching' && (
                            <div className="space-y-2 pt-1">
                              <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                  أزواج التوصيل والمزاوجة:
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const pairs = q.matchingPairs || [];
                                    const newPair: MatchingPair = {
                                      id: 'm_' + Date.now(),
                                      left: 'عنصر ' + (pairs.length + 1),
                                      right: 'المقابل ' + (pairs.length + 1),
                                    };
                                    setQuestions((prev) =>
                                      prev.map((item, i) =>
                                        i === idx ? { ...item, matchingPairs: [...pairs, newPair] } : item
                                      )
                                    );
                                  }}
                                  className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline"
                                >
                                  + إضافة زوج توصيل
                                </button>
                              </div>
                              <div className="space-y-2">
                                {(q.matchingPairs || []).map((pair, pIdx) => (
                                  <div key={pair.id} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={pair.left}
                                      onChange={(e) => {
                                        const newPairs = [...(q.matchingPairs || [])];
                                        newPairs[pIdx] = { ...pair, left: e.target.value };
                                        setQuestions((prev) =>
                                          prev.map((item, i) =>
                                            i === idx ? { ...item, matchingPairs: newPairs } : item
                                          )
                                        );
                                      }}
                                      placeholder="العنصر الأيمن..."
                                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                                    />
                                    <span className="text-teal-500 font-bold">↔</span>
                                    <input
                                      type="text"
                                      value={pair.right}
                                      onChange={(e) => {
                                        const newPairs = [...(q.matchingPairs || [])];
                                        newPairs[pIdx] = { ...pair, right: e.target.value };
                                        setQuestions((prev) =>
                                          prev.map((item, i) =>
                                            i === idx ? { ...item, matchingPairs: newPairs } : item
                                          )
                                        );
                                      }}
                                      placeholder="المطابق الأيسر..."
                                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newPairs = (q.matchingPairs || []).filter((_, pi) => pi !== pIdx);
                                        setQuestions((prev) =>
                                          prev.map((item, i) =>
                                            i === idx ? { ...item, matchingPairs: newPairs } : item
                                          )
                                        );
                                      }}
                                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 5. Ordering */}
                          {q.type === 'ordering' && (
                            <div className="space-y-2 pt-1">
                              <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                  العناصر بالترتيب الصحيح (سيتم خلطها تلقائياً للطالب):
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuestions((prev) =>
                                      prev.map((itemQ, i) => {
                                        if (i === idx) {
                                          const curItems = itemQ.orderingItems || [];
                                          return { ...itemQ, orderingItems: [...curItems, `عنصر ${curItems.length + 1}`] };
                                        }
                                        return itemQ;
                                      })
                                    );
                                  }}
                                  className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline"
                                >
                                  + إضافة عنصر للترتيب
                                </button>
                              </div>
                              <div className="space-y-2">
                                {(q.orderingItems || []).map((item, oIdx) => (
                                  <div key={oIdx} className="flex items-center gap-2">
                                    <span className="w-6 text-center text-xs font-bold text-teal-500">{oIdx + 1}.</span>
                                    <input
                                      type="text"
                                      value={item}
                                      onChange={(e) => {
                                        const newItems = [...(q.orderingItems || [])];
                                        newItems[oIdx] = e.target.value;
                                        setQuestions((prev) =>
                                          prev.map((itemQ, i) =>
                                            i === idx ? { ...itemQ, orderingItems: newItems } : itemQ
                                          )
                                        );
                                      }}
                                      placeholder={`الخطوة / الكلمة ${oIdx + 1}...`}
                                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                                    />
                                    {(q.orderingItems || []).length > 2 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newItems = (q.orderingItems || []).filter((_, oi) => oi !== oIdx);
                                          setQuestions((prev) =>
                                            prev.map((itemQ, i) =>
                                              i === idx ? { ...itemQ, orderingItems: newItems } : itemQ
                                            )
                                          );
                                        }}
                                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                        title="حذف هذا العنصر"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 6. Listening */}
                          {q.type === 'listening' && (
                            <div className="space-y-2 pt-1">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                                  <Volume2 className="w-4 h-4 text-teal-500" />
                                  <span>نص المقطع الصوتي (يتم نطقه للطالب تلقائياً بالذكاء الاصطناعي):</span>
                                </label>
                                <textarea
                                  rows={3}
                                  value={q.audioScript || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setQuestions((prev) =>
                                      prev.map((item, i) => (i === idx ? { ...item, audioScript: val } : item))
                                    );
                                  }}
                                  placeholder="اكتب النص الإنجليزي أو العربي المراد قراءته للطالب صوتياً..."
                                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                          )}

                          {/* 7. Reading Passage */}
                          {q.type === 'passage' && (
                            <div className="space-y-3 pt-1">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                  نص القطعة القرائية:
                                </label>
                                <textarea
                                  rows={4}
                                  value={q.passageText || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setQuestions((prev) =>
                                      prev.map((item, i) => (i === idx ? { ...item, passageText: val } : item))
                                    );
                                  }}
                                  placeholder="اكتب نص القطعة القرائية هنا بتفاصيلها..."
                                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                          )}

                          {/* 8. Error Correction */}
                          {q.type === 'error_correction' && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                              <div className="sm:col-span-3">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                  الجملة المحتوية على الخطأ:
                                </label>
                                <input
                                  type="text"
                                  value={q.sentenceWithMistake || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setQuestions((prev) =>
                                      prev.map((item, i) =>
                                        i === idx ? { ...item, sentenceWithMistake: val } : item
                                      )
                                    );
                                  }}
                                  placeholder="She go to school yesterday."
                                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-rose-500 mb-1">الكلمة الخاطئة:</label>
                                <input
                                  type="text"
                                  value={q.targetMistake || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setQuestions((prev) =>
                                      prev.map((item, i) => (i === idx ? { ...item, targetMistake: val } : item))
                                    );
                                  }}
                                  placeholder="go"
                                  className="w-full px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs focus:outline-none"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-[11px] font-bold text-emerald-500 mb-1">التصحيح الصحيح:</label>
                                <input
                                  type="text"
                                  value={q.correction || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setQuestions((prev) =>
                                      prev.map((item, i) => (i === idx ? { ...item, correction: val } : item))
                                    );
                                  }}
                                  placeholder="went"
                                  className="w-full px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                          )}

                          {/* 9. Short Answer / 10. Essay */}
                          {(q.type === 'short_answer' || q.type === 'essay') && (
                            <div className="space-y-2 pt-1">
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                نموذج الإجابة ومعايير التقييم:
                              </label>
                              <textarea
                                rows={3}
                                value={q.sampleAnswer || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setQuestions((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, sampleAnswer: val } : item))
                                  );
                                }}
                                placeholder="اكتب نموذج الإجابة والمعايير المتوقعة..."
                                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                              />
                            </div>
                          )}

                          {/* Explanation & Hint */}
                          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400">
                              <Lightbulb className="w-4 h-4" />
                              <span>تفسير الإجابة وشرح الحل (يظهر للطالب بعد التصحيح):</span>
                            </div>
                            <input
                              type="text"
                              value={q.explanation || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setQuestions((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, explanation: val } : item))
                                );
                              }}
                              placeholder="مثال: تم اختيار هذه الإجابة لأن قاعدة Future Perfect تعبر عن..."
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* BOTTOM FAST ADD BOX */}
                  <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-right space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-teal-400 flex items-center gap-1.5">
                        <PlusCircle className="w-4 h-4" />
                        <span>إضافة سريعة لسؤال جديد بنقرة واحدة:</span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {QUESTION_TYPES.map((qt) => {
                        const Icon = qt.icon;
                        return (
                          <button
                            key={qt.type}
                            type="button"
                            onClick={() => handleAddQuestion(qt.type)}
                            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-teal-500/20 border border-slate-700 hover:border-teal-500/50 text-right transition-all group cursor-pointer flex items-center justify-between"
                          >
                            <span className="text-[11px] font-bold text-white group-hover:text-teal-300 line-clamp-1">
                              {qt.label.split('(')[0]}
                            </span>
                            <Icon className="w-3.5 h-3.5 text-teal-400" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Sticky Footer */}
              <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  إجمالي الأسئلة: {questions.length} | إجمالي الدرجات:{' '}
                  {questions.reduce((sum, q) => sum + (q.points || 1), 0)} درجة
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-lg shadow-teal-500/20"
                  >
                    {editingAssignment ? 'حفظ التعديلات' : 'نشر الواجب للطلاب'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

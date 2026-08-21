import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Clock,
  Award,
  CheckCircle,
  PlusCircle,
  Trash2,
  Sparkles,
  BookOpen,
  Headphones,
  FileText,
  Layers,
  CheckSquare,
  ArrowUpDown,
  AlertCircle,
  AlignLeft,
  X,
  Volume2,
  Lightbulb,
  ShieldCheck,
  ShieldAlert,
  Shuffle,
  Eye,
  CheckCircle2,
  FileQuestion,
  HelpCircle as QuestionIcon,
  Calendar,
  Lock,
  Globe,
  Power,
  Copy,
  ArrowRightLeft,
  FolderPlus,
} from 'lucide-react';
import { Exam, Question, QuestionType, Course, MatchingPair, PassageSubQuestion } from '../../types';

interface CourseExamsTabProps {
  course: Course;
  courses?: Course[];
  exams: Exam[];
  onCreateExam: (examData: Partial<Exam>) => void;
  onUpdateExam: (examId: string, examData: Partial<Exam>) => void;
  onDeleteExam: (examId: string) => void;
  onPreviewExam: (examId: string) => void;
  onUpdateCourse?: (courseId: string, updates: Partial<Course>) => void;
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

export const CourseExamsTab: React.FC<CourseExamsTabProps> = ({
  course,
  courses,
  exams,
  onCreateExam,
  onUpdateExam,
  onDeleteExam,
  onPreviewExam,
  onUpdateCourse,
}) => {
  const courseExams = (exams || []).filter((e) => e.courseId === course.id);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);

  // Unit selection state inside course
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');

  // Copy / Transfer Exam states
  const [copyingExam, setCopyingExam] = useState<Exam | null>(null);
  const [targetCourseId, setTargetCourseId] = useState<string>('');
  const [targetModuleId, setTargetModuleId] = useState<string>('');
  const [copyMode, setCopyMode] = useState<'duplicate' | 'move'>('duplicate');

  // Helper: Sync exam lesson in course modules
  const syncExamWithCourseModules = (
    targetCourseObj: Course,
    examId: string,
    examTitle: string,
    newModuleId?: string,
    durationMins: number = 20
  ) => {
    if (!onUpdateCourse) return;

    const updatedModules = (targetCourseObj.modules || []).map((mod) => {
      const filteredLessons = (mod.lessons || []).filter((l) => l.examId !== examId);

      if (newModuleId && mod.id === newModuleId) {
        const examLesson = {
          id: 'les_exam_' + examId,
          moduleId: newModuleId,
          courseId: targetCourseObj.id,
          title: examTitle,
          type: 'exam' as const,
          durationMinutes: durationMins,
          order: filteredLessons.length + 1,
          status: 'published' as const,
          isPublished: true,
          examId: examId,
        };
        return {
          ...mod,
          lessons: [...filteredLessons, examLesson],
        };
      }

      return {
        ...mod,
        lessons: filteredLessons,
      };
    });

    const totalLessons = updatedModules.reduce((acc, m) => acc + (m.lessons || []).length, 0);

    onUpdateCourse(targetCourseObj.id, {
      modules: updatedModules,
      lessonsCount: totalLessons,
    });
  };

  // Delete & Schedule state
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [schedulingExam, setSchedulingExam] = useState<{
    exam: Exam;
    startDate: string;
    endDate: string;
  } | null>(null);

  // Form states
  const [examTitle, setExamTitle] = useState('');
  const [examDescription, setExamDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [passingScorePercent, setPassingScorePercent] = useState(60);
  const [examStatus, setExamStatus] = useState<'published' | 'draft'>('published');
  const [examStartDate, setExamStartDate] = useState('');
  const [examEndDate, setExamEndDate] = useState('');

  // Master Exam Feature Toggles
  const [allowHints, setAllowHints] = useState(true);
  const [showExplanationAfterSubmit, setShowExplanationAfterSubmit] = useState(true);
  const [enableAntiCheat, setEnableAntiCheat] = useState(true);
  const [strictFullscreenEnforced, setStrictFullscreenEnforced] = useState(true);
  const [cancelOnLeave, setCancelOnLeave] = useState(true);
  const [maxViolationsAllowed, setMaxViolationsAllowed] = useState(1);
  const [preventCopyPaste, setPreventCopyPaste] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [showResultInstant, setShowResultInstant] = useState(true);
  const [allowRetake, setAllowRetake] = useState(true);
  const [maxAttempts, setMaxAttempts] = useState<number>(2);

  // Fast sequential single-question addition modal state
  const [isQuickFlowModalOpen, setIsQuickFlowModalOpen] = useState(false);
  const [quickQType, setQuickQType] = useState<QuestionType>('mcq');
  const [quickQPrompt, setQuickQPrompt] = useState('');
  const [quickQOptions, setQuickQOptions] = useState<string[]>(['', '', '', '']);
  const [quickQCorrectIndex, setQuickQCorrectIndex] = useState(0);
  const [quickQCorrectBool, setQuickQCorrectBool] = useState(true);
  const [quickQFillAnswers, setQuickQFillAnswers] = useState<string[]>(['']);
  const [quickQMatchingPairs, setQuickQMatchingPairs] = useState<MatchingPair[]>([
    { id: 'm1', left: 'المصطلح الأول', right: 'التعريف المقابل له' },
    { id: 'm2', left: 'المصطلح الثاني', right: 'التعريف المقابل له' },
  ]);
  const [quickQOrderingItems, setQuickQOrderingItems] = useState<string[]>([
    'العنصر الأول',
    'العنصر الثاني',
    'العنصر الثالث',
  ]);
  const [quickQAudioScript, setQuickQAudioScript] = useState('نص الاستماع الصوتي المسموع للطالب...');
  const [quickQSentenceWithMistake, setQuickQSentenceWithMistake] = useState('');
  const [quickQTargetMistake, setQuickQTargetMistake] = useState('');
  const [quickQCorrection, setQuickQCorrection] = useState('');
  const [quickQSampleAnswer, setQuickQSampleAnswer] = useState('');
  const [quickQKeywords, setQuickQKeywords] = useState<string[]>(['']);
  const [quickQPassageText, setQuickQPassageText] = useState('اكتب نص القطعة القرائية هنا...');
  const [quickQPassageQuestions, setQuickQPassageQuestions] = useState<PassageSubQuestion[]>([
    {
      id: 'pq_1',
      prompt: 'السؤال الأول على القطعة:',
      options: ['إجابة 1', 'إجابة 2', 'إجابة 3', 'إجابة 4'],
      correctOptionIndex: 0,
      points: 2,
    },
  ]);
  const [quickQHint, setQuickQHint] = useState('');
  const [quickQExplanation, setQuickQExplanation] = useState('');
  const [quickQPoints, setQuickQPoints] = useState(2);
  const [quickAddSuccessAlert, setQuickAddSuccessAlert] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q_' + Date.now() + '_1',
      examId: '',
      type: 'mcq',
      prompt: 'Choose the correct answer: By next year, I _______ my English master degree.',
      options: ['will finish', 'will have finished', 'have finished', 'finish'],
      correctOptionIndex: 1,
      hint: 'انتبه إلى التعبير الزمني "By next year" الذي يدل على حدث سيكتمل بحلول نقطة محددة في المستقبل.',
      allowHint: true,
      explanation: 'قاعدة المستقبل التام (Future Perfect: will have + P.P): نستخدمها عندما نتحدث عن حدث سيكتمل قبل أو بحلول وقت محدد في المستقبل (By + future time).',
      points: 2,
    },
    {
      id: 'q_' + Date.now() + '_2',
      examId: '',
      type: 'fill_blank',
      prompt: 'Fill in the blank: The illegal copying and distribution of copyrighted books is called _______.',
      fillBlankAnswers: ['piracy', 'Piracy', 'copyright piracy'],
      hint: 'مصطلح قانوني ولغوي يعبر عن القرصنة الفكرية وسرقة الملكية الأدبية.',
      allowHint: true,
      explanation: 'كلمة (Piracy) تعني القرصنة وانتهاك حقوق الملكية الفكرية، وتُعد جريمة يعاقب عليها القانون.',
      points: 2,
    },
  ]);

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

    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) {
      const qId = 'q_' + Date.now() + '_1';
      setQuestions([
        {
          id: qId,
          examId: '',
          type: 'mcq',
          prompt: '',
          options: ['', '', '', ''],
          correctOptionIndex: 0,
          hint: '',
          allowHint: true,
          explanation: '',
          points: 2,
        },
      ]);
      return;
    }
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleInsertQuestionBelow = (idx: number, type: QuestionType = 'mcq') => {
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

    const updated = [...questions];
    updated.splice(idx + 1, 0, newQ);
    setQuestions(updated);
  };

  const handleOpenQuickFlowModal = () => {
    setQuickQPrompt('');
    setQuickQOptions(['', '', '', '']);
    setQuickQCorrectIndex(0);
    setQuickQCorrectBool(true);
    setQuickQFillAnswers(['']);
    setQuickQSentenceWithMistake('');
    setQuickQTargetMistake('');
    setQuickQCorrection('');
    setQuickQSampleAnswer('');
    setQuickQKeywords(['']);
    setQuickQHint('');
    setQuickQExplanation('');
    setQuickQPoints(2);
    setQuickAddSuccessAlert(false);
    setIsQuickFlowModalOpen(true);
  };

  const handleSaveQuickQuestion = (keepOpen: boolean) => {
    if (!quickQPrompt.trim()) return;

    const qId = 'q_' + Date.now() + '_' + (questions.length + 1);
    let newQ: Question = {
      id: qId,
      examId: '',
      type: quickQType,
      prompt: quickQPrompt.trim(),
      hint: quickQHint.trim(),
      allowHint: !!quickQHint.trim(),
      explanation: quickQExplanation.trim(),
      points: Number(quickQPoints) || 2,
    };

    switch (quickQType) {
      case 'mcq':
        newQ.options = quickQOptions.map((o) => o.trim() || 'خيار إضافي');
        newQ.correctOptionIndex = quickQCorrectIndex;
        break;
      case 'true_false':
        newQ.options = ['صحيح (True)', 'خطأ (False)'];
        newQ.correctBool = quickQCorrectBool;
        newQ.correctOptionIndex = quickQCorrectBool ? 0 : 1;
        break;
      case 'fill_blank':
        newQ.fillBlankAnswers = quickQFillAnswers.filter((a) => a.trim().length > 0);
        if (newQ.fillBlankAnswers.length === 0) newQ.fillBlankAnswers = ['إجابة'];
        break;
      case 'matching':
        newQ.matchingPairs = quickQMatchingPairs;
        break;
      case 'ordering':
        newQ.orderingItems = quickQOrderingItems.filter((item) => item.trim().length > 0);
        break;
      case 'listening':
        newQ.audioScript = quickQAudioScript;
        newQ.options = quickQOptions.map((o) => o.trim() || 'خيار');
        newQ.correctOptionIndex = quickQCorrectIndex;
        break;
      case 'passage':
        newQ.passageText = quickQPassageText;
        newQ.passageQuestions = quickQPassageQuestions;
        break;
      case 'error_correction':
        newQ.sentenceWithMistake = quickQSentenceWithMistake;
        newQ.targetMistake = quickQTargetMistake;
        newQ.correction = quickQCorrection;
        break;
      case 'short_answer':
        newQ.sampleAnswer = quickQSampleAnswer;
        newQ.keywords = quickQKeywords.filter((k) => k.trim().length > 0);
        break;
      case 'essay':
        newQ.sampleAnswer = quickQSampleAnswer;
        break;
    }

    setQuestions((prev) => [...prev, newQ]);

    if (keepOpen) {
      // Clear fields for the next question
      setQuickQPrompt('');
      setQuickQOptions(['', '', '', '']);
      setQuickQCorrectIndex(0);
      setQuickQCorrectBool(true);
      setQuickQFillAnswers(['']);
      setQuickQSentenceWithMistake('');
      setQuickQTargetMistake('');
      setQuickQCorrection('');
      setQuickQSampleAnswer('');
      setQuickQKeywords(['']);
      setQuickQHint('');
      setQuickQExplanation('');
      setQuickAddSuccessAlert(true);
      setTimeout(() => setQuickAddSuccessAlert(false), 3000);
    } else {
      setIsQuickFlowModalOpen(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingExamId(null);
    setExamTitle('');
    setExamDescription('');
    setSelectedModuleId('');
    setDurationMinutes(25);
    setPassingScorePercent(60);
    setExamStatus('published');
    setExamStartDate('');
    setExamEndDate('');
    setAllowHints(true);
    setShowExplanationAfterSubmit(true);
    setEnableAntiCheat(true);
    setStrictFullscreenEnforced(true);
    setCancelOnLeave(true);
    setMaxViolationsAllowed(1);
    setPreventCopyPaste(true);
    setShuffleQuestions(false);
    setShowResultInstant(true);
    setAllowRetake(true);
    setMaxAttempts(2);
    setQuestions([
      {
        id: 'q_' + Date.now() + '_1',
        examId: '',
        type: 'mcq',
        prompt: 'السؤال الأول:',
        options: ['خيار 1', 'خيار 2', 'خيار 3', 'خيار 4'],
        correctOptionIndex: 0,
        points: 2,
      },
    ]);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (exam: Exam) => {
    setEditingExamId(exam.id);
    setExamTitle(exam.title);
    setExamDescription(exam.description);
    setSelectedModuleId(exam.moduleId || '');
    setDurationMinutes(exam.durationMinutes || 25);
    setPassingScorePercent(exam.passingScorePercent || 60);
    setExamStatus(exam.status || (exam.isPublished === false ? 'draft' : 'published'));
    setExamStartDate(exam.startDate || exam.scheduledDate || '');
    setExamEndDate(exam.endDate || exam.deadline || '');
    setAllowHints(exam.allowHints !== false);
    setShowExplanationAfterSubmit(exam.showExplanationAfterSubmit !== false);
    setEnableAntiCheat(exam.enableAntiCheat !== false);
    setStrictFullscreenEnforced(exam.strictFullscreenEnforced !== false);
    setCancelOnLeave(exam.cancelOnLeave !== false);
    setMaxViolationsAllowed(exam.maxViolationsAllowed !== undefined ? exam.maxViolationsAllowed : 1);
    setPreventCopyPaste(exam.preventCopyPaste !== false);
    setShuffleQuestions(!!exam.shuffleQuestions);
    setShowResultInstant(exam.showResultInstant !== false);
    setAllowRetake(exam.allowRetake !== false);
    setMaxAttempts(exam.maxAttempts !== undefined ? exam.maxAttempts : (exam.allowRetake !== false ? 2 : 1));
    setQuestions(exam.questions || []);
    setIsCreateModalOpen(true);
  };

  const handleUnassignModule = (exam: Exam) => {
    onUpdateExam(exam.id, { moduleId: undefined });
    syncExamWithCourseModules(course, exam.id, exam.title, undefined);
  };

  const handleOpenCopyModal = (exam: Exam) => {
    setCopyingExam(exam);
    const availableCourses = courses && courses.length > 0 ? courses : [course];
    const defaultTarget = availableCourses.find((c) => c.id !== course.id) || availableCourses[0];
    setTargetCourseId(defaultTarget.id);
    setTargetModuleId('');
    setCopyMode('duplicate');
  };

  const handleConfirmCopyExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copyingExam || !targetCourseId) return;

    const availableCourses = courses && courses.length > 0 ? courses : [course];
    const targetCourseObj = availableCourses.find((c) => c.id === targetCourseId);
    if (!targetCourseObj) return;

    const newExamId = 'exam_' + Date.now();

    const clonedQuestions = (copyingExam.questions || []).map((q, idx) => ({
      ...q,
      id: 'q_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substring(2, 6),
      examId: newExamId,
    }));

    const isSameCourse = targetCourseId === course.id;
    const newTitle = copyingExam.title + (copyMode === 'duplicate' && isSameCourse ? ' (نسخة)' : '');

    const newExamData: Partial<Exam> = {
      id: newExamId,
      courseId: targetCourseId,
      moduleId: targetModuleId || undefined,
      title: newTitle,
      description: copyingExam.description,
      durationMinutes: copyingExam.durationMinutes,
      passingScorePercent: copyingExam.passingScorePercent,
      totalPoints: copyingExam.totalPoints,
      questions: clonedQuestions,
      showResultInstant: copyingExam.showResultInstant,
      allowRetake: copyingExam.allowRetake,
      allowHints: copyingExam.allowHints,
      showExplanationAfterSubmit: copyingExam.showExplanationAfterSubmit,
      shuffleQuestions: copyingExam.shuffleQuestions,
      enableAntiCheat: copyingExam.enableAntiCheat,
      status: copyingExam.status || 'published',
      isPublished: copyingExam.isPublished !== false,
      attemptsCount: 0,
    };

    if (copyMode === 'move') {
      if (isSameCourse) {
        onUpdateExam(copyingExam.id, { moduleId: targetModuleId || undefined, title: newTitle });
        syncExamWithCourseModules(course, copyingExam.id, newTitle, targetModuleId || undefined, copyingExam.durationMinutes);
        setCopyingExam(null);
        return;
      } else {
        onCreateExam(newExamData);
        if (targetModuleId) {
          syncExamWithCourseModules(targetCourseObj, newExamId, newTitle, targetModuleId, copyingExam.durationMinutes);
        }
        syncExamWithCourseModules(course, copyingExam.id, copyingExam.title, undefined);
        onDeleteExam(copyingExam.id);
        setCopyingExam(null);
        return;
      }
    }

    onCreateExam(newExamData);

    if (targetModuleId) {
      syncExamWithCourseModules(targetCourseObj, newExamId, newTitle, targetModuleId, copyingExam.durationMinutes);
    }

    setCopyingExam(null);
  };

  const handleToggleExamPublish = (exam: Exam) => {
    const isCurrentlyDraft = exam.status === 'draft' || exam.isPublished === false;
    const newStatus = isCurrentlyDraft ? 'published' : 'draft';
    onUpdateExam(exam.id, {
      status: newStatus,
      isPublished: newStatus === 'published',
    });
  };

  const handleSaveExamSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingExam) return;

    const { exam, startDate, endDate } = schedulingExam;
    onUpdateExam(exam.id, {
      startDate: startDate || undefined,
      scheduledDate: startDate || undefined,
      endDate: endDate || undefined,
      deadline: endDate || undefined,
      isScheduled: !!startDate || !!endDate,
    });
    setSchedulingExam(null);
  };

  const handleConfirmDeleteExam = () => {
    if (!examToDelete) return;
    // Also remove from module lessons
    syncExamWithCourseModules(course, examToDelete.id, examToDelete.title, undefined);
    onDeleteExam(examToDelete.id);
    setExamToDelete(null);
  };

  const handleMoveQuestionUp = (idx: number) => {
    if (idx === 0) return;
    const updated = [...questions];
    const temp = updated[idx];
    updated[idx] = updated[idx - 1];
    updated[idx - 1] = temp;
    setQuestions(updated);
  };

  const handleMoveQuestionDown = (idx: number) => {
    if (idx === questions.length - 1) return;
    const updated = [...questions];
    const temp = updated[idx];
    updated[idx] = updated[idx + 1];
    updated[idx + 1] = temp;
    setQuestions(updated);
  };

  const handleDuplicateQuestion = (idx: number) => {
    const qToDup = questions[idx];
    const duplicated: Question = {
      ...qToDup,
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      prompt: qToDup.prompt + ' (نسخة)',
    };
    const updated = [...questions];
    updated.splice(idx + 1, 0, duplicated);
    setQuestions(updated);
  };

  const handleSaveExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || questions.length === 0) return;

    const totalPts = questions.reduce((acc, q) => {
      if (q.type === 'passage' && q.passageQuestions) {
        return acc + q.passageQuestions.reduce((pqAcc, pq) => pqAcc + pq.points, 0);
      }
      return acc + (q.points || 1);
    }, 0);

    const targetExamId = editingExamId || ('exam_' + Date.now());

    const examData: Partial<Exam> = {
      id: targetExamId,
      courseId: course.id,
      moduleId: selectedModuleId || undefined,
      title: examTitle.trim(),
      description: examDescription.trim() || 'امتحان شامل ومتنوع لتقييم كافة جوانب استيعاب الطالب',
      durationMinutes: Number(durationMinutes) || 20,
      passingScorePercent: Number(passingScorePercent) || 60,
      totalPoints: totalPts,
      status: examStatus,
      isPublished: examStatus === 'published',
      startDate: examStartDate || undefined,
      scheduledDate: examStartDate || undefined,
      endDate: examEndDate || undefined,
      deadline: examEndDate || undefined,
      isScheduled: !!examStartDate || !!examEndDate,
      questions,
      showResultInstant,
      allowRetake,
      maxAttempts: Number(maxAttempts) || 2,
      allowHints,
      showExplanationAfterSubmit,
      shuffleQuestions,
      enableAntiCheat,
      strictFullscreenEnforced,
      cancelOnLeave,
      maxViolationsAllowed: Number(maxViolationsAllowed) || 1,
      preventCopyPaste,
    };

    if (editingExamId) {
      onUpdateExam(editingExamId, examData);
    } else {
      onCreateExam({ ...examData, attemptsCount: 0 });
    }

    syncExamWithCourseModules(course, targetExamId, examTitle.trim(), selectedModuleId || undefined, Number(durationMinutes) || 20);

    setIsCreateModalOpen(false);
    setEditingExamId(null);
    setExamTitle('');
    setExamDescription('');
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-500" />
            <span>امتحانات وبنوك أسئلة الكورس الشاملة</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            دعم كامل لـ 10 أنماط أسئلة (اختياري، صح/خطأ، أكمل، توصيل، ترتيب، استماع، قطع فهم، تصحيح أخطاء، ومقالي)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white dark:text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء امتحان بنك أسئلة متكامل</span>
        </button>
      </div>

      {/* Exams Grid / List */}
      {courseExams.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <Award className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-300">لا توجد امتحانات في هذا الكورس بعد</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            أضف اختبارات بعد كل وحدة لقياس استيعاب الطلاب ورفع مستواهم بجميع أنماط الأسئلة.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="mt-4 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white dark:text-slate-950 font-black text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء أول امتحان الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courseExams.map((exam) => {
            const isDraft = exam.status === 'draft' || exam.isPublished === false;
            const hasStart = !!exam.startDate || !!exam.scheduledDate;
            const hasEnd = !!exam.endDate || !!exam.deadline;

            const assignedModule = (course.modules || []).find((m) => m.id === exam.moduleId);

            return (
              <div
                key={exam.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 shadow-sm ${
                  isDraft
                    ? 'bg-amber-500/5 dark:bg-amber-950/15 border-amber-300 dark:border-amber-900/50'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {isDraft ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-black flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>مسودة (معطل النشر)</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-black flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          <span>منشور للطلاب</span>
                        </span>
                      )}

                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                        {exam.questions.length} أسئلة
                      </span>
                    </div>

                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      {exam.durationMinutes} دقيقة
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">{exam.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{exam.description}</p>
                  
                  {/* Module Assignment Badge */}
                  <div className="pt-1">
                    {assignedModule ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-[11px] font-bold">
                        <FolderPlus className="w-3.5 h-3.5 text-purple-500" />
                        <span>مدرج في وحدة: <strong>{assignedModule.title}</strong></span>
                        <button
                          type="button"
                          onClick={() => handleUnassignModule(exam)}
                          className="p-0.5 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900 text-purple-600 dark:text-purple-400 transition-colors cursor-pointer mr-1"
                          title="إلغاء إدراج الامتحان من هذه الوحدة"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 text-[11px] font-bold">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>امتحان شامل لكامل الكورس (غير مرتبط بوحدة محددة)</span>
                      </div>
                    )}
                  </div>

                  {/* Scheduling badges */}
                  {(hasStart || hasEnd) && (
                    <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-[11px] text-sky-800 dark:text-sky-300 space-y-1">
                      {hasStart && (
                        <div className="flex items-center gap-1.5 font-bold">
                          <Calendar className="w-3.5 h-3.5 text-sky-500" />
                          <span>تاريخ البدء: {new Date(exam.startDate || exam.scheduledDate || '').toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                      {hasEnd && (
                        <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400">
                          <Clock className="w-3.5 h-3.5 text-rose-500" />
                          <span>الموعد النهائي للإغلاق: {new Date(exam.endDate || exam.deadline || '').toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Question Types Pills Preview */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Array.from(new Set((exam.questions || []).map((q) => q.type))).map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                      >
                        {QUESTION_TYPES.find((qt) => qt.type === t)?.label.split(' ')[0] || t}
                      </span>
                    ))}
                  </div>

                  {/* Feature Tags (Hints, Solutions, Anti-cheat) */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px]">
                    {exam.allowHints !== false && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-500" />
                        تلميحات ذكية
                      </span>
                    )}
                    {exam.showExplanationAfterSubmit !== false && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-bold flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-cyan-500" />
                        شرح وتفسير الإجابات
                      </span>
                    )}
                    {exam.enableAntiCheat !== false && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-rose-500" />
                        حماية الغش
                      </span>
                    )}
                    {exam.shuffleQuestions && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-bold flex items-center gap-1">
                        <Shuffle className="w-3 h-3 text-purple-500" />
                        خلط أسئلة
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-bold">
                    <span>{exam.totalPoints} درجات</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400">نجاح من {exam.passingScorePercent}%</span>
                    <span>•</span>
                    <span className="text-cyan-600 dark:text-cyan-400">{exam.attemptsCount || 0} محاولة</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 self-stretch sm:self-auto justify-end">
                    {/* Copy to Course button */}
                    <button
                      type="button"
                      onClick={() => handleOpenCopyModal(exam)}
                      className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="نسخ أو نقل هذا الامتحان لكورس آخر"
                    >
                      <Copy className="w-3.5 h-3.5 text-indigo-500" />
                      <span>نسخ/نقل</span>
                    </button>

                    {/* Toggle publish button */}
                    <button
                      type="button"
                      onClick={() => handleToggleExamPublish(exam)}
                      className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                        isDraft
                          ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                          : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                      }`}
                      title={isDraft ? 'نشر الامتحان للطلاب' : 'تعطيل نشر الامتحان وتحويله لمسودة'}
                    >
                      {isDraft ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>{isDraft ? 'نشر' : 'إلغاء النشر'}</span>
                    </button>

                    {/* Schedule button */}
                    <button
                      type="button"
                      onClick={() =>
                        setSchedulingExam({
                          exam,
                          startDate: exam.startDate || exam.scheduledDate || '',
                          endDate: exam.endDate || exam.deadline || '',
                        })
                      }
                      className={`p-2 rounded-xl border font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                        hasStart || hasEnd
                          ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                      title="جدولة موعد بدء وإغلاق الامتحان"
                    >
                      <Calendar className="w-3.5 h-3.5 text-sky-500" />
                      <span className="hidden sm:inline">جدولة</span>
                    </button>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(exam)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <span>تعديل ✏️</span>
                    </button>

                    {/* Delete button with modal */}
                    <button
                      type="button"
                      onClick={() => setExamToDelete(exam)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center transition-colors cursor-pointer border border-rose-500/20"
                      title="حذف الامتحان نهائياً"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Preview button */}
                    <button
                      type="button"
                      onClick={() => onPreviewExam(exam.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white dark:text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer hover:opacity-90"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>معاينة</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Comprehensive Exam Creator */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-slate-950/90 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[94vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden text-right">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-slate-950 font-black shadow-md">
                  <BookOpen className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">منشئ الامتحانات وبنوك الأسئلة المتقدمة</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">يدعم 10 أنماط تقييم مع تصحيح ذكي فوري وتفسير مفصل</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveExamSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              
              {/* Exam Info & Features Settings */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                  <span>البيانات الأساسية للامتحان</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      عنوان الامتحان *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: امتحان التحدي الشامل على قواعد وكلمات الوحدة الأولى"
                      value={examTitle}
                      onChange={(e) => setExamTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      تعليمات وتوجيهات الامتحان للطلاب
                    </label>
                    <input
                      type="text"
                      placeholder="اقرأ كل سؤال بعناية، النتيجة تظهر فوراً مع تفسير كل إجابة."
                      value={examDescription}
                      onChange={(e) => setExamDescription(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Module / Unit Assignment Option */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>إدراج الامتحان داخل وحدة محددة (اختياري)</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">عند اختياره سيظهر داخل دروس تلك الوحدة فقط</span>
                  </label>
                  <select
                    value={selectedModuleId}
                    onChange={(e) => setSelectedModuleId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">-- بدون وحدة (امتحان شامل لكامل الكورس) --</option>
                    {(course.modules || []).map((mod) => (
                      <option key={mod.id} value={mod.id}>
                        📦 {mod.title}
                      </option>
                    ))}
                  </select>


  
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      المدة المحددة (دقيقة)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      نسبة النجاح (%)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={passingScorePercent}
                      onChange={(e) => setPassingScorePercent(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1 flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">إجمالي الأسئلة:</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{questions.length} سؤال</span>
                  </div>
                </div>

                {/* Publishing State & Schedule Inputs */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <label className="block text-xs font-bold text-slate-800 dark:text-white">
                    حالة النشر والجدولة الزمنية للامتحان
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setExamStatus('published')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        examStatus === 'published'
                          ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>نشر فوري للطلاب 🟢</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExamStatus('draft')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        examStatus === 'draft'
                          ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>حفظ كمسودة 🔒</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                    <div>
                      <label className="block text-xs font-bold text-sky-700 dark:text-sky-400 mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>موعد بدء الامتحان (اختياري)</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={examStartDate}
                        onChange={(e) => setExamStartDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-rose-700 dark:text-rose-400 mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>الموعد النهائي للإغلاق Deadline (اختياري)</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={examEndDate}
                        onChange={(e) => setExamEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Master Feature Toggles Section */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                      <span>إعدادات النظام الذكي ومميزات الاختبار:</span>
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">تحكم كامل في تفعيل وإلغاء أي خاصية بمرونة</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    
                    {/* Toggle: Hints */}
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>نظام التلميحات (Hints)</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          إمكانية طلب تلميح استرشادي أثناء الامتحان
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAllowHints(!allowHints)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                          allowHints ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                      </button>
                    </div>

                    {/* Toggle: Explanations */}
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-300">
                          <BookOpen className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                          <span>شرح الإجابات (Solutions)</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          عرض تفسير وتوضيح الحل النموذجي بعد التسليم
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowExplanationAfterSubmit(!showExplanationAfterSubmit)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                          showExplanationAfterSubmit ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                      </button>
                    </div>

                    {/* Toggle: Anti-Cheat */}
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>حماية الغش ومراقبة التبويب</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          مراقبة مغادرة التبويب وتنبيه الطالب فوراً
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEnableAntiCheat(!enableAntiCheat)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                          enableAntiCheat ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                      </button>
                    </div>

                    {/* Toggle: Strict Fullscreen Lockdown */}
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                          <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>إلزام وضع ملء الشاشة الصارم</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          منع خوض الامتحان إلا في وضع ملء الشاشة المحكم
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStrictFullscreenEnforced(!strictFullscreenEnforced)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                          strictFullscreenEnforced ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                      </button>
                    </div>

                    {/* Toggle: Cancel on Leave / Tab Switch */}
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>إلغاء الامتحان فوراً عند المغادرة</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          إلغاء الامتحان واحتساب صفر عند الخروج من النافذة
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCancelOnLeave(!cancelOnLeave)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                          cancelOnLeave ? 'bg-rose-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                      </button>
                    </div>

                    {/* Setting: Max Allowed Violations */}
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                          <ShieldAlert className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>حد الإنذارات قبل الإلغاء</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          عدد الإنذارات المسموحة قبل الطرد
                        </p>
                      </div>
                      <select
                        value={maxViolationsAllowed}
                        onChange={(e) => setMaxViolationsAllowed(Number(e.target.value))}
                        className="px-2.5 py-1 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value={0}>0 (إلغاء فوري بدون إنذار)</option>
                        <option value={1}>1 إنذار ثم الإلغاء</option>
                        <option value={2}>إنذاران ثم الإلغاء</option>
                        <option value={3}>3 إنذارات ثم الإلغاء</option>
                      </select>
                    </div>

                    {/* Toggle: Prevent Copy / Paste */}
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300">
                          <Lock className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                          <span>حظر النسخ واللصق ولقطات الشاشة</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          تعطيل الزر الأيمن والاختصارات والتظليل
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreventCopyPaste(!preventCopyPaste)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                          preventCopyPaste ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                      </button>
                    </div>

                    {/* Toggle: Shuffle */}
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                          <Shuffle className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span>خلط الأسئلة عشوائياً</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          تغيير ترتيب الأسئلة لكل طالب تلقائياً
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShuffleQuestions(!shuffleQuestions)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                          shuffleQuestions ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                      </button>
                    </div>

                    {/* Toggle: Instant Result */}
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>التصحيح والنتيجة الفورية</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          إظهار الدرجة والنسبة المئوية فور الضغط على تسليم
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowResultInstant(!showResultInstant)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                          showResultInstant ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                      </button>
                    </div>

                    {/* Toggle: Allow Retake & Max Attempts */}
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                            <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>السماح بإعادة المحاولة للطالب</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                            تمكين الطالب من إعادة خوض الاختبار مع تحديد السقف الأقصى لعدد المحاولات
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const next = !allowRetake;
                            setAllowRetake(next);
                            if (!next) setMaxAttempts(1);
                            else if (maxAttempts <= 1) setMaxAttempts(2);
                          }}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                            allowRetake ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                        </button>
                      </div>

                      {allowRetake && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-in fade-in">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              إجمالي عدد المحاولات الكلية المسموح بها:
                            </span>
                            <div className="flex items-center gap-1">
                              {[2, 3, 4, 5].map((num) => (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => setMaxAttempts(num)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                    maxAttempts === num
                                      ? 'bg-blue-600 text-white shadow-md'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                  }`}
                                >
                                  {num} محاولات
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-[10px] text-blue-900 dark:text-blue-200 font-medium">
                            💡 <strong>تنبيه دقيق:</strong> عند تحديد {maxAttempts} محاولات، فإن الطالب يحق له دخول الامتحان {maxAttempts} مرات كحد أقصى (المحاولة الأولى + {maxAttempts - 1} محاولات إعادة). بعد ذلك يُقفل الاختبار نهائياً.
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>

              {/* Questions Section */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      <span>بنك الأسئلة والأنماط المخصصة ({questions.length} سؤال)</span>
                    </h4>
                    <p className="text-xs text-slate-400">أضف الأسئلة دون الحاجة للصعود لأعلى الصفحة</p>
                  </div>

                  {/* Top Fast Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleOpenQuickFlowModal}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>⚡ نمط الإضافة المتتابعة السريعة (سؤال بسؤال)</span>
                    </button>

                    <select
                      onChange={(e) => {
                        handleAddQuestion(e.target.value as QuestionType);
                        e.target.value = '';
                      }}
                      defaultValue=""
                      className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow-md focus:outline-none"
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
                <div className="space-y-5">
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
                            <span className="w-7 h-7 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/30">
                              {idx + 1}
                            </span>
                            
                            {/* Type Selector Dropdown */}
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-cyan-600 dark:text-cyan-300">
                              <TypeIcon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                              <select
                                value={q.type}
                                onChange={(e) => {
                                  const newType = e.target.value as QuestionType;
                                  setQuestions((prev) =>
                                    prev.map((item, i) => {
                                      if (i === idx) {
                                        return {
                                          ...item,
                                          type: newType,
                                          options: newType === 'mcq' || newType === 'listening' ? ['', '', '', ''] : newType === 'true_false' ? ['صحيح (True)', 'خطأ (False)'] : undefined,
                                          correctOptionIndex: 0,
                                          correctBool: newType === 'true_false' ? true : undefined,
                                          fillBlankAnswers: newType === 'fill_blank' ? [''] : undefined,
                                          matchingPairs: newType === 'matching' ? [{ id: 'm1', left: '', right: '' }, { id: 'm2', left: '', right: '' }] : undefined,
                                          orderingItems: newType === 'ordering' ? ['', '', ''] : undefined,
                                          audioScript: newType === 'listening' ? '' : undefined,
                                          passageText: newType === 'passage' ? '' : undefined,
                                          passageQuestions: newType === 'passage' ? [{ id: 'pq_1', prompt: '', options: ['', '', '', ''], correctOptionIndex: 0, points: 2 }] : undefined,
                                          sentenceWithMistake: newType === 'error_correction' ? '' : undefined,
                                          targetMistake: newType === 'error_correction' ? '' : undefined,
                                          correction: newType === 'error_correction' ? '' : undefined,
                                        };
                                      }
                                      return item;
                                    })
                                  );
                                }}
                                className="bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                              >
                                {QUESTION_TYPES.map((qt) => (
                                  <option key={qt.type} value={qt.type} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                    {qt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-500 dark:text-slate-400">الدرجة:</span>
                              <input
                                type="number"
                                min="1"
                                value={q.points}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setQuestions((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, points: val } : item))
                                  );
                                }}
                                className="w-14 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs text-center font-bold"
                              />
                            </div>

                            <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveQuestionUp(idx)}
                                className={`p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${idx === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                                title="تحريك لأعلى"
                              >
                                ⬆️
                              </button>
                              <button
                                type="button"
                                disabled={idx === questions.length - 1}
                                onClick={() => handleMoveQuestionDown(idx)}
                                className={`p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${idx === questions.length - 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
                                title="تحريك لأسفل"
                              >
                                ⬇️
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicateQuestion(idx)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40 transition-colors text-xs"
                                title="تنسيق وتكرار السؤال"
                              >
                                📋
                              </button>
                              {questions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestion(idx)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                                  title="حذف السؤال"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Prompt Input */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            نص السؤال أو التعليمات الأساسية *
                          </label>
                          <textarea
                            rows={2}
                            required
                            value={q.prompt}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuestions((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, prompt: val } : item))
                              );
                            }}
                            placeholder="اكتب نص السؤال بدقة هنا..."
                            className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-emerald-500 focus:outline-none text-right"
                          />
                        </div>

                        {/* TYPE 1: MCQ */}
                        {q.type === 'mcq' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                خيارات الإجابة (حدد الدائرة بجانب الإجابة الصحيحة):
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setQuestions((prev) =>
                                    prev.map((item, i) => {
                                      if (i === idx) {
                                        const currentOpts = item.options || ['', ''];
                                        return { ...item, options: [...currentOpts, ''] };
                                      }
                                      return item;
                                    })
                                  );
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>إضافة خيار إضافي</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {(q.options || ['', '']).map((opt, oIdx) => (
                                <div
                                  key={oIdx}
                                  className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                                    q.correctOptionIndex === oIdx
                                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm'
                                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`correct_${q.id}`}
                                    checked={q.correctOptionIndex === oIdx}
                                    onChange={() => {
                                      setQuestions((prev) =>
                                        prev.map((item, i) => (i === idx ? { ...item, correctOptionIndex: oIdx } : item))
                                      );
                                    }}
                                    className="w-4 h-4 accent-emerald-500 cursor-pointer shrink-0"
                                  />
                                  <input
                                    type="text"
                                    required
                                    value={opt}
                                    placeholder={`الخيار ${String.fromCharCode(65 + oIdx)}`}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setQuestions((prev) =>
                                        prev.map((item, i) => {
                                          if (i === idx) {
                                            const updated = [...(item.options || [])];
                                            updated[oIdx] = val;
                                            return { ...item, options: updated };
                                          }
                                          return item;
                                        })
                                      );
                                    }}
                                    className="flex-1 bg-transparent text-slate-900 dark:text-white text-xs focus:outline-none"
                                  />
                                  {(q.options || []).length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setQuestions((prev) =>
                                          prev.map((item, i) => {
                                            if (i === idx) {
                                              const updatedOpts = (item.options || []).filter((_, optIndex) => optIndex !== oIdx);
                                              let newCorrectIdx = item.correctOptionIndex || 0;
                                              if (newCorrectIdx >= updatedOpts.length) {
                                                newCorrectIdx = Math.max(0, updatedOpts.length - 1);
                                              } else if (newCorrectIdx === oIdx) {
                                                newCorrectIdx = 0;
                                              }
                                              return { ...item, options: updatedOpts, correctOptionIndex: newCorrectIdx };
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

                        {/* TYPE 2: True / False */}
                        {q.type === 'true_false' && (
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                              الإجابة النموذجية الصحيحة:
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setQuestions((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, correctBool: true, correctOptionIndex: 0 } : item))
                                  );
                                }}
                                className={`p-3 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                  q.correctBool !== false
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                <span>صحيح (True) ✓</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setQuestions((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, correctBool: false, correctOptionIndex: 1 } : item))
                                  );
                                }}
                                className={`p-3 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                  q.correctBool === false
                                    ? 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300 shadow-sm'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                <span>خطأ (False) ✗</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* TYPE 3: Fill in the Blank */}
                        {q.type === 'fill_blank' && (
                          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                              الكلمات أو العبارات المقبولة للإجابة الصحيحة (مفصولة بفواصل):
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="مثال: piracy, Piracy, digital piracy"
                              value={(q.fillBlankAnswers || []).join(', ')}
                              onChange={(e) => {
                                const list = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                                setQuestions((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, fillBlankAnswers: list } : item))
                                );
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none"
                            />
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              ملاحظة: التصحيح الذكي يتجاهل حالة الأحرف (Case-insensitive) تلقائياً.
                            </p>
                          </div>
                        )}

                        {/* TYPE 4: Matching Pairs */}
                        {q.type === 'matching' && (
                          <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                أزواج التوصيل (العمود الأيمن ↔ العمود الأيسر):
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setQuestions((prev) =>
                                    prev.map((item, i) => {
                                      if (i === idx) {
                                        const pairs = item.matchingPairs || [];
                                        return {
                                          ...item,
                                          matchingPairs: [...pairs, { id: 'm_' + Date.now(), left: '', right: '' }],
                                        };
                                      }
                                      return item;
                                    })
                                  );
                                }}
                                className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-xs font-bold cursor-pointer transition-colors"
                              >
                                + زوج إضافي
                              </button>
                            </div>

                            <div className="space-y-2">
                              {(q.matchingPairs || []).map((pair, pIdx) => (
                                <div key={pair.id || pIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    required
                                    placeholder={`عنصر العمود الأيمن #${pIdx + 1}`}
                                    value={pair.left}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setQuestions((prev) =>
                                        prev.map((item, i) => {
                                          if (i === idx) {
                                            const pairs = [...(item.matchingPairs || [])];
                                            pairs[pIdx] = { ...pairs[pIdx], left: val };
                                            return { ...item, matchingPairs: pairs };
                                          }
                                          return item;
                                        })
                                      );
                                    }}
                                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none"
                                  />
                                  <input
                                    type="text"
                                    required
                                    placeholder={`التعريف أو المقابل المقترن به #${pIdx + 1}`}
                                    value={pair.right}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setQuestions((prev) =>
                                        prev.map((item, i) => {
                                          if (i === idx) {
                                            const pairs = [...(item.matchingPairs || [])];
                                            pairs[pIdx] = { ...pairs[pIdx], right: val };
                                            return { ...item, matchingPairs: pairs };
                                          }
                                          return item;
                                        })
                                      );
                                    }}
                                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* TYPE 5: Sentence Ordering */}
                        {q.type === 'ordering' && (
                          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                              العناصر والكلمات بالترتيب الصحيح (مفصولة بفواصل):
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="مثال: No sooner, had he, arrived home, than, the rain, started"
                              value={(q.orderingItems || []).join(', ')}
                              onChange={(e) => {
                                const list = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                                setQuestions((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, orderingItems: list } : item))
                                );
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none"
                            />
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              سيتم خلط الكلمات عشوائياً للطالب ويطلب منه ترتيبها بالشكل الصحيح.
                            </p>
                          </div>
                        )}

                        {/* TYPE 6: Listening */}
                        {q.type === 'listening' && (
                          <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                                <Volume2 className="w-3.5 h-3.5 text-cyan-500" />
                                <span>نص المقطع المسموع (Audio Script):</span>
                              </label>
                              <textarea
                                rows={2}
                                required
                                value={q.audioScript}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setQuestions((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, audioScript: val } : item))
                                  );
                                }}
                                placeholder="اكتب النص الذي سيستمع إليه الطالب عبر قارئ الصوت الذكي..."
                                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none text-right"
                              />
                            </div>

                            {/* Options */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                  خيارات السؤال المسموع:
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuestions((prev) =>
                                      prev.map((item, i) => {
                                        if (i === idx) {
                                          const currentOpts = item.options || ['', ''];
                                          return { ...item, options: [...currentOpts, ''] };
                                        }
                                        return item;
                                      })
                                    );
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>إضافة خيار</span>
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {(q.options || ['', '']).map((opt, oIdx) => (
                                  <div
                                    key={oIdx}
                                    className={`flex items-center gap-2 p-2 rounded-xl border ${
                                      q.correctOptionIndex === oIdx
                                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`correct_listening_${q.id}`}
                                      checked={q.correctOptionIndex === oIdx}
                                      onChange={() => {
                                        setQuestions((prev) =>
                                          prev.map((item, i) => (i === idx ? { ...item, correctOptionIndex: oIdx } : item))
                                        );
                                      }}
                                      className="w-4 h-4 accent-emerald-500 cursor-pointer shrink-0"
                                    />
                                    <input
                                      type="text"
                                      required
                                      value={opt}
                                      placeholder={`خيار ${String.fromCharCode(65 + oIdx)}`}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setQuestions((prev) =>
                                          prev.map((item, i) => {
                                            if (i === idx) {
                                              const updated = [...(item.options || [])];
                                              updated[oIdx] = val;
                                              return { ...item, options: updated };
                                            }
                                            return item;
                                          })
                                        );
                                      }}
                                      className="flex-1 bg-transparent text-slate-900 dark:text-white text-xs focus:outline-none"
                                    />
                                    {(q.options || []).length > 2 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setQuestions((prev) =>
                                            prev.map((item, i) => {
                                              if (i === idx) {
                                                const updatedOpts = (item.options || []).filter((_, optIndex) => optIndex !== oIdx);
                                                let newCorrectIdx = item.correctOptionIndex || 0;
                                                if (newCorrectIdx >= updatedOpts.length) {
                                                  newCorrectIdx = Math.max(0, updatedOpts.length - 1);
                                                }
                                                return { ...item, options: updatedOpts, correctOptionIndex: newCorrectIdx };
                                              }
                                              return item;
                                            })
                                          );
                                        }}
                                        title="حذف الخيار"
                                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* TYPE 7: Reading Passage */}
                        {q.type === 'passage' && (
                          <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                نص القطعة القرائية (Passage Text):
                              </label>
                              <textarea
                                rows={4}
                                required
                                value={q.passageText}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setQuestions((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, passageText: val } : item))
                                  );
                                }}
                                placeholder="اكتب نص القطعة الكامل هنا ليقرأه الطالب ويجيب على الأسئلة التابعة له..."
                                className="w-full p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none text-right"
                              />
                            </div>

                            {/* Sub Questions */}
                            <div className="space-y-3 pt-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                  الأسئلة الفرعية على القطعة:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuestions((prev) =>
                                      prev.map((item, i) => {
                                        if (i === idx) {
                                          const sub = item.passageQuestions || [];
                                          return {
                                            ...item,
                                            passageQuestions: [
                                              ...sub,
                                              {
                                                id: 'pq_' + Date.now(),
                                                prompt: '',
                                                options: ['', '', '', ''],
                                                correctOptionIndex: 0,
                                                points: 2,
                                              },
                                            ],
                                          };
                                        }
                                        return item;
                                      })
                                    );
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition-colors cursor-pointer"
                                >
                                  + سؤال فرعي إضافي
                                </button>
                              </div>

                              {(q.passageQuestions || []).map((subQ, sIdx) => (
                                <div key={subQ.id || sIdx} className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                      السؤال الفرعي #{sIdx + 1}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setQuestions((prev) =>
                                            prev.map((item, i) => {
                                              if (i === idx) {
                                                const sub = [...(item.passageQuestions || [])];
                                                const currentSubOpts = sub[sIdx].options || ['', ''];
                                                sub[sIdx] = { ...sub[sIdx], options: [...currentSubOpts, ''] };
                                                return { ...item, passageQuestions: sub };
                                              }
                                              return item;
                                            })
                                          );
                                        }}
                                        className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>إضافة خيار</span>
                                      </button>
                                      {(q.passageQuestions || []).length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setQuestions((prev) =>
                                              prev.map((item, i) => {
                                                if (i === idx) {
                                                  const sub = (item.passageQuestions || []).filter((_, subIdx) => subIdx !== sIdx);
                                                  return { ...item, passageQuestions: sub };
                                                }
                                                return item;
                                              })
                                            );
                                          }}
                                          className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                          title="حذف هذا السؤال الفرعي"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <input
                                    type="text"
                                    required
                                    placeholder={`اكتب نص السؤال الفرعي #${sIdx + 1}...`}
                                    value={subQ.prompt}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setQuestions((prev) =>
                                        prev.map((item, i) => {
                                          if (i === idx) {
                                            const sub = [...(item.passageQuestions || [])];
                                            sub[sIdx] = { ...sub[sIdx], prompt: val };
                                            return { ...item, passageQuestions: sub };
                                          }
                                          return item;
                                        })
                                      );
                                    }}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none"
                                  />

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {(subQ.options || ['', '', '', '']).map((sOpt, soIdx) => (
                                      <div key={soIdx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                                        <input
                                          type="radio"
                                          name={`sub_correct_${subQ.id}_${idx}`}
                                          checked={subQ.correctOptionIndex === soIdx}
                                          onChange={() => {
                                            setQuestions((prev) =>
                                              prev.map((item, i) => {
                                                if (i === idx) {
                                                  const sub = [...(item.passageQuestions || [])];
                                                  sub[sIdx] = { ...sub[sIdx], correctOptionIndex: soIdx };
                                                  return { ...item, passageQuestions: sub };
                                                }
                                                return item;
                                              })
                                            );
                                          }}
                                          className="w-4 h-4 accent-emerald-500 cursor-pointer shrink-0"
                                        />
                                        <input
                                          type="text"
                                          required
                                          placeholder={`الخيار ${String.fromCharCode(65 + soIdx)}`}
                                          value={sOpt}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setQuestions((prev) =>
                                              prev.map((item, i) => {
                                                if (i === idx) {
                                                  const sub = [...(item.passageQuestions || [])];
                                                  const subOpts = [...sub[sIdx].options];
                                                  subOpts[soIdx] = val;
                                                  sub[sIdx] = { ...sub[sIdx], options: subOpts };
                                                  return { ...item, passageQuestions: sub };
                                                }
                                                return item;
                                              })
                                            );
                                          }}
                                          className="flex-1 bg-transparent text-slate-900 dark:text-white text-xs focus:outline-none"
                                        />
                                        {(subQ.options || []).length > 2 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setQuestions((prev) =>
                                                prev.map((item, i) => {
                                                  if (i === idx) {
                                                    const sub = [...(item.passageQuestions || [])];
                                                    const subOpts = (sub[sIdx].options || []).filter((_, oI) => oI !== soIdx);
                                                    let newCorrectIdx = sub[sIdx].correctOptionIndex || 0;
                                                    if (newCorrectIdx >= subOpts.length) {
                                                      newCorrectIdx = Math.max(0, subOpts.length - 1);
                                                    }
                                                    sub[sIdx] = { ...sub[sIdx], options: subOpts, correctOptionIndex: newCorrectIdx };
                                                    return { ...item, passageQuestions: sub };
                                                  }
                                                  return item;
                                                })
                                              );
                                            }}
                                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                                            title="حذف الخيار"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* TYPE 8: Error Correction */}
                        {q.type === 'error_correction' && (
                          <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                الجملة الكاملة المحتوية على الخطأ النحوي / اللغوي:
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="مثال: Hardly he had finished his work when the bell rang."
                                value={q.sentenceWithMistake}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setQuestions((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, sentenceWithMistake: val } : item))
                                  );
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                  الكلمة / العبارة الخاطئة في الجملة:
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="مثال: he had"
                                  value={q.targetMistake}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setQuestions((prev) =>
                                      prev.map((item, i) => (i === idx ? { ...item, targetMistake: val } : item))
                                    );
                                  }}
                                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-rose-600 dark:text-rose-300 text-xs focus:border-rose-500 focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                  التصحيح المعتمد المطلوب من الطالب:
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="مثال: had he"
                                  value={q.correction}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setQuestions((prev) =>
                                      prev.map((item, i) => (i === idx ? { ...item, correction: val } : item))
                                    );
                                  }}
                                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-300 text-xs focus:border-emerald-500 focus:outline-none font-bold"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* TYPE 9 & 10: Short Answer & Essay */}
                        {(q.type === 'short_answer' || q.type === 'essay') && (
                          <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                نموذج الإجابة ومعايير التقييم (Rubric):
                              </label>
                              <textarea
                                rows={2}
                                required
                                value={q.sampleAnswer}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setQuestions((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, sampleAnswer: val } : item))
                                  );
                                }}
                                placeholder="اكتب الإجابة النموذجية ومعايير احتساب الدرجة للطالب..."
                                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none text-right"
                              />
                            </div>

                            {q.type === 'short_answer' && (
                              <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                  الكلمات المفتاحية للتحقق الذكي (مفصولة بفواصل):
                                </label>
                                <input
                                  type="text"
                                  placeholder="مثال: past, action, before, earlier"
                                  value={(q.keywords || []).join(', ')}
                                  onChange={(e) => {
                                    const list = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                                    setQuestions((prev) =>
                                      prev.map((item, i) => (i === idx ? { ...item, keywords: list } : item))
                                    );
                                  }}
                                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:outline-none"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Smart Hint & Explanation Settings for this Question */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                          
                          {/* 1. Smart Hint Builder */}
                          <div className="p-3 rounded-2xl bg-amber-500/5 dark:bg-slate-900/80 border border-amber-500/20 dark:border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-black text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                                <span>تلميح استرشادي أثناء الامتحان (Hint)</span>
                              </label>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                  {q.allowHint !== false ? 'مفعل' : 'معطل'}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={q.allowHint !== false}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setQuestions((prev) =>
                                      prev.map((item, i) => (i === idx ? { ...item, allowHint: checked } : item))
                                    );
                                  }}
                                  className="w-3.5 h-3.5 accent-amber-500 cursor-pointer rounded"
                                />
                              </div>
                            </div>
                            
                            <input
                              type="text"
                              disabled={q.allowHint === false}
                              value={q.hint || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setQuestions((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, hint: val } : item))
                                );
                              }}
                              placeholder="مثال: تلميح: انتبه للكلمة الدالة الدالة على زمن المستقبل التام..."
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-amber-500/30 dark:border-slate-800 text-amber-900 dark:text-amber-100 text-xs focus:border-amber-500 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                            />
                            <p className="text-[9px] text-slate-500 dark:text-slate-400">
                              يظهر كزر تلميح يفتحه الطالب لمساعدته على استرجاع القاعدة دون كشف الجواب
                            </p>
                          </div>

                          {/* 2. Detailed Explanation & Solution */}
                          <div className="p-3 rounded-2xl bg-cyan-500/5 dark:bg-slate-900/80 border border-cyan-500/20 dark:border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-black text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-cyan-500" />
                                <span>الشرح وتفسير الإجابة (Explanation)</span>
                              </label>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">يظهر بعد التسليم</span>
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
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-cyan-500/30 dark:border-slate-800 text-cyan-900 dark:text-cyan-100 text-xs focus:border-cyan-500 focus:outline-none"
                            />
                            <p className="text-[9px] text-slate-500 dark:text-slate-400">
                              يظهر في تقرير المراجعة النهائية للطالب بعد إنهاء وتصحيح الاختبار
                            </p>
                          </div>

                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* BOTTOM DEDICATED QUICK QUESTION ADD BOX */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-slate-900/90 to-cyan-500/10 border-2 border-dashed border-emerald-500/30 text-right space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-black text-emerald-400 flex items-center gap-2">
                        <PlusCircle className="w-5 h-5 text-emerald-400" />
                        <span>إضافة سؤال جديد هنا مباشرة في أسفل بنك الأسئلة</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        انقر على أي نمط أدناه لإضافته فوراً في موضعك الحالي دون الحاجة للعودة إلى أعلى الصفحة:
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenQuickFlowModal}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all hover:scale-105 shrink-0"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>⚡ نمط الإضافة المتتابعة (سؤال بسؤال دون عناء)</span>
                    </button>
                  </div>

                  {/* 1-Click Question Type Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
                    {QUESTION_TYPES.map((qt) => {
                      const Icon = qt.icon;
                      return (
                        <button
                          key={qt.type}
                          type="button"
                          onClick={() => handleAddQuestion(qt.type)}
                          className="p-3 rounded-2xl bg-slate-900/90 hover:bg-emerald-500/20 border border-slate-800 hover:border-emerald-500/50 text-right transition-all group cursor-pointer flex flex-col justify-between space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <Icon className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md">+ إضافة</span>
                          </div>
                          <span className="text-xs font-bold text-white group-hover:text-emerald-300 line-clamp-1">
                            {qt.label.split('(')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Submit & Quick Bar */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-3 px-2 z-20">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black">
                    إجمالي الأسئلة: {questions.length}
                  </span>

                  <select
                    onChange={(e) => {
                      handleAddQuestion(e.target.value as QuestionType);
                      e.target.value = '';
                    }}
                    defaultValue=""
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow-md focus:outline-none"
                  >
                    <option value="" disabled>+ إضافة سؤال فوري...</option>
                    {QUESTION_TYPES.map((qt) => (
                      <option key={qt.type} value={qt.type} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        + {qt.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleOpenQuickFlowModal}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer transition-colors"
                  >
                    ⚡ إضافة متتابعة
                  </button>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 cursor-pointer flex items-center gap-2 hover:opacity-95 transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>حفظ ونشر الامتحان وبنك الأسئلة</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: SEQUENTIAL FAST QUESTION BUILDER (سؤال بسؤال دون عناء) */}
      {isQuickFlowModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in text-right">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>وضع الإضافة المتتابعة السريعة (سؤال بسؤال)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  أدخل بيانات السؤال واضغط "حفظ وإضافة التالي" لتسجيل السؤال فوراً والانتقال للذي يليه بسلاسة تامة.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickFlowModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quickAddSuccessAlert && (
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>تم حفظ السؤال وإضافته لبنك الأسئلة بنجاح! جاهز لإدخال السؤال التالي الآن.</span>
              </div>
            )}

            {/* Select Question Type */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">اختر نمط السؤال:</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {QUESTION_TYPES.map((qt) => {
                  const Icon = qt.icon;
                  const isSelected = quickQType === qt.type;
                  return (
                    <button
                      key={qt.type}
                      type="button"
                      onClick={() => setQuickQType(qt.type)}
                      className={`p-2 rounded-xl text-right text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span className="line-clamp-1">{qt.label.split('(')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prompt & Points */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-300 mb-1">نص السؤال:</label>
                <textarea
                  rows={2}
                  value={quickQPrompt}
                  onChange={(e) => setQuickQPrompt(e.target.value)}
                  placeholder="اكتب نص السؤال هنا بدقة..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="w-24">
                <label className="block text-xs font-bold text-slate-300 mb-1">الدرجة:</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={quickQPoints}
                  onChange={(e) => setQuickQPoints(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-black text-center focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* MCQ Options in Quick Flow */}
            {quickQType === 'mcq' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">الخيارات الأربعة (حدد الصحيح):</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickQOptions.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`flex items-center gap-2 p-2 rounded-xl border ${
                        quickQCorrectIndex === oIdx ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300' : 'bg-slate-950 border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="quick_mcq_opt"
                        checked={quickQCorrectIndex === oIdx}
                        onChange={() => setQuickQCorrectIndex(oIdx)}
                        className="w-4 h-4 accent-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder={`خيار ${oIdx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const val = e.target.value;
                          const nextOpts = [...quickQOptions];
                          nextOpts[oIdx] = val;
                          setQuickQOptions(nextOpts);
                        }}
                        className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* True/False in Quick Flow */}
            {quickQType === 'true_false' && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setQuickQCorrectBool(true)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-black transition-all ${
                    quickQCorrectBool ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-slate-950 border-slate-700 text-slate-400'
                  }`}
                >
                  صحيح (True) ✓
                </button>
                <button
                  type="button"
                  onClick={() => setQuickQCorrectBool(false)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-black transition-all ${
                    !quickQCorrectBool ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-slate-950 border-slate-700 text-slate-400'
                  }`}
                >
                  خطأ (False) ✗
                </button>
              </div>
            )}

            {/* Fill Blank in Quick Flow */}
            {quickQType === 'fill_blank' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الإجابة الصحيحة المقبولة:</label>
                <input
                  type="text"
                  value={quickQFillAnswers[0] || ''}
                  onChange={(e) => setQuickQFillAnswers([e.target.value])}
                  placeholder="مثال: will finish"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {/* Quick Hint & Explanation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-amber-300 mb-1">تلميح ذكي للطالب (اختياري):</label>
                <input
                  type="text"
                  value={quickQHint}
                  onChange={(e) => setQuickQHint(e.target.value)}
                  placeholder="تلميح للمساعدة في الحل..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-200 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-cyan-300 mb-1">الشرح والتفسير بعد التسليم:</label>
                <input
                  type="text"
                  value={quickQExplanation}
                  onChange={(e) => setQuickQExplanation(e.target.value)}
                  placeholder="سبب اختيار هذه الإجابة..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-cyan-200 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Flow Action Buttons */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-400 font-bold">
                الأسئلة المحفوظة حالياً: {questions.length}
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsQuickFlowModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  إغلاق والعودة
                </button>

                <button
                  type="button"
                  disabled={!quickQPrompt.trim()}
                  onClick={() => handleSaveQuickQuestion(false)}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs font-bold"
                >
                  حفظ وخروج
                </button>

                <button
                  type="button"
                  disabled={!quickQPrompt.trim()}
                  onClick={() => handleSaveQuickQuestion(true)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-white text-xs font-black shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>💾 حفظ وإضافة السؤال التالي مباشرة (+1) ⚡</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Quick Exam Schedule */}
      {schedulingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-right space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-500" />
                <span>جدولة ومواعيد الامتحان</span>
              </h3>
              <button
                type="button"
                onClick={() => setSchedulingExam(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              تحديد نافذة فتح وإغلاق امتحان <strong className="text-slate-900 dark:text-white font-bold">"{schedulingExam.exam.title}"</strong> للطلاب.
            </p>

            <form onSubmit={handleSaveExamSchedule} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  موعد بدء وإتاحة الامتحان للطلاب
                </label>
                <input
                  type="datetime-local"
                  value={schedulingExam.startDate}
                  onChange={(e) =>
                    setSchedulingExam({
                      ...schedulingExam,
                      startDate: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الموعد النهائي لإغلاق الامتحان (Deadline)
                </label>
                <input
                  type="datetime-local"
                  value={schedulingExam.endDate}
                  onChange={(e) =>
                    setSchedulingExam({
                      ...schedulingExam,
                      endDate: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {(schedulingExam.startDate || schedulingExam.endDate) && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs text-sky-700 dark:text-sky-300 font-semibold">
                  <span>تم تعيين نافذة توقيت للامتحان</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSchedulingExam({
                        ...schedulingExam,
                        startDate: '',
                        endDate: '',
                      })
                    }
                    className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-bold"
                  >
                    مسح التواريخ
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSchedulingExam(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white dark:text-slate-950 font-black text-xs shadow-md cursor-pointer"
                >
                  حفظ مواعيد الامتحان
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Exam Confirmation */}
      {examToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-rose-500/30 p-6 shadow-2xl space-y-4 text-right">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                تأكيد حذف الامتحان نهائياً؟
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                هل أنت متأكد من حذف امتحان <strong className="text-rose-600 dark:text-rose-400 font-bold">"{examToDelete.title}"</strong> بجميع أسئلته ({examToDelete.questions.length} أسئلة)؟ هذا الإجراء نهائي ولا يمكن التراجع عنه.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setExamToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteExam}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>تأكيد الحذف</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Copy / Transfer Exam to Another Course */}
      {copyingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-indigo-500/30 p-6 shadow-2xl space-y-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Copy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">نسخ أو نقل الامتحان لكورس آخر</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">تكرار الامتحان بكافة أسئلته دون الحاجة لكتابته مجدداً</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCopyingExam(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 font-bold">
              الامتحان المحدد: <span className="text-indigo-600 dark:text-indigo-400 font-black">"{copyingExam.title}"</span> ({copyingExam.questions.length} أسئلة)
            </div>

            <form onSubmit={handleConfirmCopyExam} className="space-y-4">
              {/* Operation Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  نوع العملية
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCopyMode('duplicate')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      copyMode === 'duplicate'
                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                    <span>تكرار نسخة جديدة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCopyMode('move')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      copyMode === 'move'
                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>نقل الكورس (تغيير مكان)</span>
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
                      <option value="">-- بدون وحدة (امتحان كورس عام) --</option>
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
                  onClick={() => setCopyingExam(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copyMode === 'duplicate' ? 'نسخ وتكرار الامتحان' : 'نقل الامتحان الآن'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

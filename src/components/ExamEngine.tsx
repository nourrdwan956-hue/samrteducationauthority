import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { Exam, ExamSubmission, Question } from '../types';
import { isEnglishText, getOptionPrefix } from '../utils/langUtils';
import { AntiLeakWatermark } from './AntiLeakWatermark';
import {
  initScreenRecordingProtection,
  subscribeToScreenProtection,
} from '../lib/screenProtection';
import {
  Timer,
  CheckCircle,
  XCircle,
  Award,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  Flag,
  FileCheck,
  Headphones,
  Volume2,
  BookOpen,
  ArrowUpDown,
  Layers,
  CheckSquare,
  AlertCircle,
  AlignLeft,
  FileText,
  RotateCcw,
  Bookmark,
  Lightbulb,
  Lock,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Type,
  Palette,
  Edit3,
  HelpCircle,
  Sun,
  Moon,
  Eye,
  Zap,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

interface ExamEngineProps {
  exam?: Exam;
  onExit?: () => void;
}

type ExamTheme = 'dark' | 'light' | 'sepia' | 'contrast';
type FontSize = 'sm' | 'md' | 'lg' | 'xl';
type ColorHighlight = 'none' | 'amber' | 'emerald' | 'cyan' | 'rose' | 'purple';

export const ExamEngine: React.FC<ExamEngineProps> = ({ exam: propExam, onExit }) => {
  const {
    currentExam,
    courses,
    currentCourse,
    currentUser,
    submitExamAttempt,
    addToast,
    setCurrentView,
    enrollInCourse,
    setIsAuthModalOpen,
    examSubmissions,
  } = useApp();

  const exam = propExam || currentExam;

  // Strict Access Guard Verification for Exams
  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'super_admin';
  const relatedCourse =
    (courses || []).find((c) => c.modules?.some((m) => m.lessons?.some((l) => l.examId === exam?.id))) ||
    currentCourse;

  const isEnrolled = relatedCourse ? currentUser?.enrolledCourseIds?.includes(relatedCourse.id) : false;
  const hasAccess = isEnrolled || isTeacherOrAdmin;

  // Strict Attempts Logic Calculation
  // If allowRetake is false => 1 attempt. If true => maxAttempts (e.g. 2 means 2 total, not 3).
  const maxAllowedAttempts = exam?.allowRetake === false ? 1 : Math.max(1, exam?.maxAttempts || 2);
  
  const studentPreviousSubmissions = (examSubmissions || []).filter(
    (s) => s.examId === exam?.id && (s.studentId === (currentUser?.id || 'anon_student') || (currentUser?.email && s.studentEmail === currentUser?.email))
  );

  const usedAttemptsCount = studentPreviousSubmissions.length;
  const isAttemptsExhausted = !isTeacherOrAdmin && usedAttemptsCount >= maxAllowedAttempts;
  const currentAttemptNumber = Math.min(maxAllowedAttempts, usedAttemptsCount + 1);

  // Exam Workflow States
  const [hasStartedExam, setHasStartedExam] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [questionColorTags, setQuestionColorTags] = useState<Record<string, ColorHighlight>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(exam ? exam.durationMinutes * 60 : 1200);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<ExamSubmission | null>(null);

  // Ergonomics & Accessibility States
  const [examTheme, setExamTheme] = useState<ExamTheme>('dark');
  const [fontSize, setFontSize] = useState<FontSize>('md');
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [scratchpadText, setScratchpadText] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'unanswered' | 'flagged'>('all');

  // Interactive Concept & Formula Sheet States
  const [isConceptSheetOpen, setIsConceptSheetOpen] = useState(false);
  const [conceptSheetSearch, setConceptSheetSearch] = useState('');
  const [activeConceptTab, setActiveConceptTab] = useState<'all' | 'laws' | 'rules' | 'notes' | 'tips'>('all');

  // Ambient Focus Sound Generator (Web Audio API)
  const [isAmbientFocusActive, setIsAmbientFocusActive] = useState(false);
  const audioCtxRef = useRef<any>(null);

  // Strict Anti-Cheat & Security States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violationsCount, setViolationsCount] = useState(0);
  const [lastViolationReason, setLastViolationReason] = useState<string | null>(null);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [isCancelledDueToViolation, setIsCancelledDueToViolation] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const timerStorageKey = `sea_exam_deadline_${exam?.id}_${currentUser?.id || 'guest'}`;

  // Automated Scoring Engine
  const evaluateQuestion = (q: Question, ans: any): { isCorrect: boolean; pointsEarned: number } => {
    if (ans === undefined || ans === null || ans === '') {
      return { isCorrect: false, pointsEarned: 0 };
    }

    switch (q.type) {
      case 'mcq':
      case 'listening': {
        const correct = Number(ans) === q.correctOptionIndex;
        return { isCorrect: correct, pointsEarned: correct ? q.points : 0 };
      }

      case 'true_false': {
        const expected = q.correctBool !== undefined ? q.correctBool : q.correctOptionIndex === 0;
        const correct = ans === expected;
        return { isCorrect: correct, pointsEarned: correct ? q.points : 0 };
      }

      case 'fill_blank': {
        const studentStr = String(ans).trim().toLowerCase();
        const validList = (q.fillBlankAnswers || []).map((s) => s.trim().toLowerCase());
        const correct = validList.includes(studentStr);
        return { isCorrect: correct, pointsEarned: correct ? q.points : 0 };
      }

      case 'matching': {
        const matchingPairs = q.matchingPairs || [];
        if (matchingPairs.length === 0) return { isCorrect: true, pointsEarned: q.points };

        let correctCount = 0;
        matchingPairs.forEach((pair) => {
          if (ans && ans[pair.left] === pair.right) {
            correctCount++;
          }
        });
        const correct = correctCount === matchingPairs.length;
        const points = Math.round((correctCount / matchingPairs.length) * q.points);
        return { isCorrect: correct, pointsEarned: points };
      }

      case 'ordering': {
        const expected = q.orderingItems || [];
        if (!Array.isArray(ans) || ans.length !== expected.length) {
          return { isCorrect: false, pointsEarned: 0 };
        }
        const correct = ans.every((item, i) => item === expected[i]);
        return { isCorrect: correct, pointsEarned: correct ? q.points : 0 };
      }

      case 'error_correction': {
        const studentStr = String(ans).trim().toLowerCase();
        const expected = (q.correction || '').trim().toLowerCase();
        const correct = studentStr === expected;
        return { isCorrect: correct, pointsEarned: correct ? q.points : 0 };
      }

      case 'passage': {
        const subQuestions = q.passageQuestions || [];
        if (subQuestions.length === 0) return { isCorrect: true, pointsEarned: q.points };

        let totalSubScore = 0;
        let allCorrect = true;
        subQuestions.forEach((subQ) => {
          if (ans && ans[subQ.id] === subQ.correctOptionIndex) {
            totalSubScore += subQ.points;
          } else {
            allCorrect = false;
          }
        });
        return { isCorrect: allCorrect, pointsEarned: totalSubScore };
      }

      case 'short_answer': {
        const studentStr = String(ans).trim().toLowerCase();
        if (!studentStr) return { isCorrect: false, pointsEarned: 0 };
        const keywords = (q.keywords || []).map((k) => k.trim().toLowerCase());
        const matchCount = keywords.filter((kw) => studentStr.includes(kw)).length;
        const passRatio = keywords.length > 0 ? matchCount / keywords.length : studentStr.length > 5 ? 1 : 0.5;
        const pts = Math.round(passRatio * q.points);
        return { isCorrect: passRatio >= 0.5, pointsEarned: pts };
      }

      case 'essay': {
        const studentStr = String(ans).trim();
        const pts = studentStr.length > 30 ? q.points : Math.round(q.points * 0.5);
        return { isCorrect: true, pointsEarned: pts };
      }

      default:
        return { isCorrect: false, pointsEarned: 0 };
    }
  };

  // Immediate Exam Cancellation Handler on Policy Violation
  const handleCancelExamDueToViolation = (reason: string) => {
    if (!exam || isSubmitted || isCancelledDueToViolation) return;

    let maxScore = 0;
    exam.questions.forEach((q) => {
      const qMax =
        q.type === 'passage' && q.passageQuestions
          ? q.passageQuestions.reduce((acc, pq) => acc + pq.points, 0)
          : q.points;
      maxScore += qMax;
    });

    const result = submitExamAttempt({
      examId: exam.id,
      examTitle: exam.title,
      studentId: currentUser?.id || 'anon_student',
      studentName: currentUser?.name || 'طالب',
      studentPhone: currentUser?.phone,
      score: 0,
      totalPoints: maxScore,
      percentage: 0,
      passed: false,
      timeSpentSeconds: Math.max(1, exam.durationMinutes * 60 - timeLeftSeconds),
      answers: selectedAnswers,
      isCancelledDueToViolation: true,
      violationReason: reason,
      violationsCount: violationsCount + 1,
    });

    setIsCancelledDueToViolation(true);
    setCancellationReason(reason);
    setSubmissionResult(result);
    setIsSubmitted(true);
    setShowViolationModal(false);

    if (document.fullscreenElement && document.exitFullscreen) {
      try {
        document.exitFullscreen();
      } catch {}
    }

    addToast(
      'error',
      'تم إلغاء الامتحان واحتساب درجة 0 ⛔',
      `تم رصد مغادرة بيئة الامتحان الصارمة مخالفةً لقواعد النزاهة الأكاديمية.`
    );
  };

  // Trigger Violation Event
  const registerViolation = (reason: string) => {
    if (!exam || !hasStartedExam || isSubmitted || isCancelledDueToViolation) return;
    if (exam.enableAntiCheat === false) return;

    const maxAllowed = exam.maxViolationsAllowed !== undefined ? exam.maxViolationsAllowed : 1;
    const newViolations = violationsCount + 1;
    setViolationsCount(newViolations);
    setLastViolationReason(reason);

    // If cancel on leave is enabled AND threshold reached -> Cancel instantly
    if (exam.cancelOnLeave !== false && newViolations >= maxAllowed) {
      handleCancelExamDueToViolation(reason);
    } else {
      setShowViolationModal(true);
    }
  };

  const handleSubmitExam = () => {
    if (!exam || isSubmitted || isCancelledDueToViolation) return;

    // Clean up timer and audio
    localStorage.removeItem(timerStorageKey);
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch {}
      audioCtxRef.current = null;
      setIsAmbientFocusActive(false);
    }

    setShowSubmitConfirmModal(false);

    let totalScore = 0;
    let maxScore = 0;

    exam.questions.forEach((q) => {
      const qMax =
        q.type === 'passage' && q.passageQuestions
          ? q.passageQuestions.reduce((acc, pq) => acc + pq.points, 0)
          : q.points;
      maxScore += qMax;

      const evalResult = evaluateQuestion(q, selectedAnswers[q.id]);
      totalScore += evalResult.pointsEarned;
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const passed = percentage >= exam.passingScorePercent;

    const result = submitExamAttempt({
      examId: exam.id,
      examTitle: exam.title,
      studentId: currentUser?.id || 'anon_student',
      studentName: currentUser?.name || 'طالب متميز',
      studentPhone: currentUser?.phone,
      score: totalScore,
      totalPoints: maxScore,
      percentage,
      passed,
      timeSpentSeconds: Math.max(1, exam.durationMinutes * 60 - timeLeftSeconds),
      answers: selectedAnswers,
      violationsCount,
      isCancelledDueToViolation: false,
    });

    setSubmissionResult(result);
    setIsSubmitted(true);

    if (document.fullscreenElement && document.exitFullscreen) {
      try {
        document.exitFullscreen();
      } catch {}
    }

    if (passed) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      addToast('success', 'تهانينا! لقد اجتزت الامتحان بنجاح 🎓', `حصلت على ${percentage}%`);
    } else {
      addToast(
        'warning',
        'لم تحقق درجة النجاح المطلوبة',
        `حصلت على ${percentage}%. يمكنك مراجعة الإجابات النموذجية وإعادة المحاولة.`
      );
    }
  };

  // Anti-Cheat: Event Listeners for Strict Environment - MUST be declared before any early returns
  useEffect(() => {
    if (!exam || !hasStartedExam || isSubmitted || isCancelledDueToViolation) return;

    const cleanupProtection = initScreenRecordingProtection();
    const unsubscribeProtection = subscribeToScreenProtection((status) => {
      if (status.isRecordingDetected) {
        registerViolation(status.reason || 'محاولة تشغيل مسجل شاشة أو برامج بث خارجية أثناء الامتحان');
      } else if (status.isDevToolsOpen) {
        registerViolation('فتح أدوات تطوير المتصفح (DevTools) أثناء الامتحان');
      }
    });

    const handleVisibilityChange = () => {
      if (document.hidden) {
        registerViolation('تبديل التبويب أو تصغير نافذة الامتحان أثناء الجلسة');
      }
    };

    const handleWindowBlur = () => {
      registerViolation('الخروج من نافذة الامتحان أو النقر على تطبيق خارجي');
    };

    const handleFullscreenChange = () => {
      const isStillFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isStillFullscreen);
      if (!isStillFullscreen && exam.strictFullscreenEnforced !== false) {
        registerViolation('مغادرة وضع ملء الشاشة الصارم (Fullscreen)');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (exam.preventCopyPaste !== false) {
        e.preventDefault();
        addToast('warning', 'ميزة محظورة', 'النقر بالزر الأيمن معطل لحماية بيئة الامتحان.');
      }
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      if (exam.preventCopyPaste !== false) {
        e.preventDefault();
        addToast('warning', 'ميزة محظورة', 'النسخ واللصق معطل تماماً أثناء الامتحان.');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (exam.preventCopyPaste !== false) {
        if (
          e.key === 'F12' ||
          e.key === 'F5' ||
          e.key === 'F11' ||
          e.key === 'PrintScreen' ||
          (e.ctrlKey && ['c', 'v', 'u', 's', 'a', 'p', 'r', 'w'].includes(e.key.toLowerCase())) ||
          (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) ||
          (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab'))
        ) {
          e.preventDefault();
          e.stopPropagation();
          addToast('warning', 'اختصار محظور', 'هذا الاختصار معطل داخل بيئة الامتحان الصارمة لحماية النزاهة.');
        }
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
      addToast('warning', 'ممنوع الرجوع للخلف', 'لا يمكنك الخروج من صفحة الامتحان إلا بعد تسليمه رسمياً.');
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'الامتحان جاري حالياً. مغادرتك ستؤدي إلى إلغاء الامتحان أو رسوبك!';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      unsubscribeProtection();
      cleanupProtection();
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [hasStartedExam, isSubmitted, isCancelledDueToViolation, violationsCount, exam]);

  // Persistent Countdown timer synced with real-world deadline in localStorage
  useEffect(() => {
    if (!exam || !hasStartedExam || isSubmitted || isCancelledDueToViolation) return;

    let deadline = Number(localStorage.getItem(timerStorageKey));
    const now = Date.now();
    const expectedDurationMs = (exam?.durationMinutes || 20) * 60 * 1000;
    
    if (!deadline || isNaN(deadline) || deadline <= now || deadline > now + expectedDurationMs + 10000) {
      deadline = now + expectedDurationMs;
      localStorage.setItem(timerStorageKey, String(deadline));
    }

    const updateTimer = () => {
      const currentNow = Date.now();
      const storedDeadline = Number(localStorage.getItem(timerStorageKey)) || deadline;
      const diffSeconds = Math.max(0, Math.floor((storedDeadline - currentNow) / 1000));
      
      setTimeLeftSeconds(diffSeconds);

      if (diffSeconds <= 0) {
        localStorage.removeItem(timerStorageKey);
        handleSubmitExam();
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [hasStartedExam, isSubmitted, isCancelledDueToViolation, exam]);

  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-slate-950 text-white rounded-3xl p-6 text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-black mb-2">تعذر تحميل الامتحان</h2>
        <p className="text-sm text-slate-400 max-w-md">لم يتم العثور على بيانات الامتحان المطلوب أو تم حذفه.</p>
        <button
          onClick={() => (onExit ? onExit() : setCurrentView('student_portal'))}
          className="px-6 py-2.5 mt-6 bg-cyan-600 rounded-2xl hover:bg-cyan-500 font-bold text-sm cursor-pointer shadow-lg"
        >
          العودة للبوابة
        </button>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-4 text-right">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl animate-pulse">
              <Lock className="w-10 h-10" />
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
              🔒 امتحان تفاعلي محمي ومغلق للمشتركين
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-white">
              عفواً! دخول هذا الامتحان يتطلب اشتراكاً مفعلاً في الكورس
            </h2>

            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              أنت تحاول فتح امتحان <span className="font-bold text-amber-400">"{exam.title}"</span>. أسئلة الامتحان،
              خيارات الإجابة، الموعد المحدد، والتصحيح الفوري هي ميزات محمية تماماً ومتاحة فقط لطلاب الكورس المشتركين.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">نظرة عامة على هيكل الامتحان:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-400" />
                <span>عدد الأسئلة: {(exam.questions || []).length} سؤالاً</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2">
                <Timer className="w-4 h-4 text-cyan-400" />
                <span>زمن الامتحان: {exam.durationMinutes} دقيقة</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>الدرجة الكلية: {exam.totalMarks || exam.totalPoints || 100} درجة</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                if (!currentUser) {
                  addToast('info', 'تسجيل الدخول مطلوب', 'يرجى تسجيل الدخول أولاً لتأكيد اشتراكك في الكورس.');
                  setIsAuthModalOpen(true);
                } else if (relatedCourse) {
                  enrollInCourse(relatedCourse.id);
                }
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-950/40 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              <span>
                {currentUser
                  ? `الاشتراك بـ ${relatedCourse?.price || 250} ج.م لفتح الاختبارات`
                  : 'تسجيل الدخول والاشتراك الآن'}
              </span>
            </button>

            <button
              onClick={() => {
                if (onExit) {
                  onExit();
                } else {
                  setCurrentView('course_detail');
                }
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm border border-slate-700 transition-colors cursor-pointer text-center"
            >
              العودة لمعاينة فهرس الكورس
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalQuestions = exam.questions.length;
  const currentQuestion: Question | undefined = exam.questions[currentQuestionIndex];

  // Request Fullscreen
  const enterStrictFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
    } catch {
      // In iframes or strict browsers, standard fallback
      setIsFullscreen(true);
    }
  };

  // Toggle ambient sound generator
  const toggleAmbientFocus = () => {
    if (isAmbientFocusActive) {
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {}
        audioCtxRef.current = null;
      }
      setIsAmbientFocusActive(false);
      addToast('info', 'تم إيقاف صوت التركيز 🔇', 'العودة للأجواء الصامتة.');
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) {
          addToast('info', 'المتصفح لا يدعم مولد الأصوات');
          return;
        }
        const ctx = new AudioCtx();
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 1.5;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        const gain = ctx.createGain();
        gain.gain.value = 0.04;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();

        audioCtxRef.current = ctx;
        setIsAmbientFocusActive(true);
        addToast('success', 'تم تفعيل صوت التركيز الذهني 🎧', 'صوت خلفي خافت ومريح للمساعدة على التركيز وإبعاد التشتت.');
      } catch {
        addToast('info', 'تعذر تشغيل مولد الصوت');
      }
    }
  };

  const handleSelectAnswer = (qId: string, answer: any) => {
    if (isSubmitted || isCancelledDueToViolation) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: answer,
    }));
  };

  const toggleFlag = (qId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const setQuestionColor = (qId: string, color: ColorHighlight) => {
    setQuestionColorTags((prev) => ({
      ...prev,
      [qId]: prev[qId] === color ? 'none' : color,
    }));
  };

  const playSpeechAudio = (text: string) => {
    if (!('speechSynthesis' in window)) {
      addToast('info', 'المتصفح لا يدعم قارئ الصوت التلقائي');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Count answered questions
  const answeredCount = (exam.questions || []).filter(
    (q) => selectedAnswers[q.id] !== undefined && selectedAnswers[q.id] !== ''
  ).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Filtered Question Index list for drawer
  const filteredQuestionIndices = (exam.questions || [])
    .map((q, idx) => ({ q, idx }))
    .filter(({ q }) => {
      if (filterMode === 'flagged') return !!flaggedQuestions[q.id];
      if (filterMode === 'unanswered') return selectedAnswers[q.id] === undefined || selectedAnswers[q.id] === '';
      return true;
    });

  // Dynamic Font Size Class
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg sm:text-xl';
      case 'xl':
        return 'text-xl sm:text-2xl';
      default:
        return 'text-base sm:text-lg';
    }
  };

  // Dynamic Theme Container Class
  const getThemeClass = () => {
    switch (examTheme) {
      case 'light':
        return 'bg-slate-100 text-slate-900 border-slate-300';
      case 'sepia':
        return 'bg-[#fbf0d9] text-[#433422] border-[#e4cca4]';
      case 'contrast':
        return 'bg-black text-yellow-400 border-yellow-500';
      default:
        return 'bg-slate-950 text-white border-slate-800';
    }
  };

  const getCardThemeClass = () => {
    switch (examTheme) {
      case 'light':
        return 'bg-white border-slate-200 shadow-xl text-slate-900';
      case 'sepia':
        return 'bg-[#f4e5c3] border-[#e0cb9d] shadow-xl text-[#3b2d1d]';
      case 'contrast':
        return 'bg-slate-950 border-yellow-500 shadow-2xl text-yellow-300';
      default:
        return 'bg-slate-900 border-slate-800 shadow-2xl text-slate-100';
    }
  };

  // Color Highlighter Styles
  const getColorHighlightBadge = (color: ColorHighlight) => {
    switch (color) {
      case 'amber':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/50';
      case 'emerald':
        return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50';
      case 'cyan':
        return 'bg-cyan-500/20 text-cyan-500 border-cyan-500/50';
      case 'rose':
        return 'bg-rose-500/20 text-rose-500 border-rose-500/50';
      case 'purple':
        return 'bg-purple-500/20 text-purple-500 border-purple-500/50';
      default:
        return '';
    }
  };

  // -------------------------------------------------------------
  // VIEW 1: PRE-EXAM STRICT ENVIRONMENT ENTRY GATEWAY
  // -------------------------------------------------------------
  if (!hasStartedExam) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8 px-4 text-right select-none" ref={containerRef}>
        <div className="p-6 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl">
              <ShieldCheck className="w-10 h-10" />
            </div>

            <span className="px-3.5 py-1 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              ⚡ بيئة الاختبارات الإلكترونية الصارمة (Secure Exam Environment)
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-white">{exam.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {exam.description ||
                'يرجى قراءة ضوابط وسياسات النزاهة الأكاديمية بعناية قبل بدء الاختبار. عند النقر على الزر سيتم تفعيل وضع الاختبار المحمي مباشرة.'}
            </p>
          </div>

          {/* Attempts Enforcement Notice */}
          {isAttemptsExhausted ? (
            <div className="p-6 rounded-2xl bg-rose-950/40 border-2 border-rose-600 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-600/20 border border-rose-500 flex items-center justify-center text-rose-400 mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-rose-400">
                ⛔ تم استنفاد كافة المحاولات المسموح بها لهذا الامتحان
              </h3>
              <p className="text-xs sm:text-sm text-rose-200/90 leading-relaxed max-w-xl mx-auto">
                لقد خضت هذا الامتحان <span className="font-bold text-white underline">{usedAttemptsCount}</span> مرات من إجمالي <span className="font-bold text-white underline">{maxAllowedAttempts}</span> محاولات مصرح بها من المعلم. وفق قواعد النظام، لا يمكنك خوض محاولات إضافية.
              </p>

              {/* Submissions History Preview */}
              {studentPreviousSubmissions.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-900/60 max-w-md mx-auto space-y-2 text-xs">
                  <span className="block font-bold text-slate-300 border-b border-slate-800 pb-1">سجل محاولاتك السابقة:</span>
                  {studentPreviousSubmissions.map((sub, sIdx) => (
                    <div key={sub.id || sIdx} className="flex items-center justify-between py-1 text-slate-300">
                      <span>المحاولة {sIdx + 1}:</span>
                      <span className="font-black text-cyan-400">{sub.score} / {sub.totalPoints} ({sub.percentage}%)</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sub.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                        {sub.passed ? 'ناجح' : 'راسب'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => (onExit ? onExit() : setCurrentView('student_portal'))}
                  className="px-8 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  العودة للبوابة
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">
                  {currentAttemptNumber}
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold">حالة المحاولات للطالب:</span>
                  <span className="text-sm font-black text-white">
                    أنت بصدد بدء المحاولة ({currentAttemptNumber}) من إجمالي ({maxAllowedAttempts}) محاولات مسموحة فقط.
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {maxAllowedAttempts - usedAttemptsCount} محاولات متبقية
              </span>
            </div>
          )}

          {/* Exam Parameters Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <Timer className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
              <span className="block text-[11px] text-slate-400">المدة الزمنية</span>
              <span className="text-base font-black text-white">{exam.durationMinutes} دقيقة</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <FileCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
              <span className="block text-[11px] text-slate-400">عدد الأسئلة</span>
              <span className="text-base font-black text-white">{totalQuestions} سؤال</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <Award className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
              <span className="block text-[11px] text-slate-400">درجة النجاح</span>
              <span className="text-base font-black text-white">{exam.passingScorePercent}%</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <ShieldAlert className="w-5 h-5 text-rose-400 mx-auto mb-1.5" />
              <span className="block text-[11px] text-slate-400">سياسة الخروج</span>
              <span className="text-xs font-black text-rose-400">
                {exam.cancelOnLeave !== false ? 'إلغاء فوري عند الخروج' : 'تنبيه ورصد المخالفة'}
              </span>
            </div>
          </div>

          {/* Security & Strict Policy Box */}
          <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-4">
            <h3 className="text-sm font-black text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>تعليمات وضوابط الامتحان الصارمة:</span>
            </h3>
            <ul className="text-xs text-rose-200/90 space-y-2.5 leading-relaxed pr-4 list-disc">
              <li>
                <strong className="text-white">وضع ملء الشاشة الإلزامي:</strong> سيتم تشغيل وضع ملء الشاشة الكامل تلقائياً
                عند بدء الامتحان على كافة الأجهزة والهواتف.
              </li>
              <li>
                <strong className="text-white">حظر مغادرة الشاشة أو التطبيق:</strong> أي محاولة لتبديل التبويب، تصغير النافذة، أو
                الخروج من الشاشة{' '}
                <span className="underline font-bold text-rose-400">
                  {exam.cancelOnLeave !== false
                    ? 'ستؤدي إلى إلغاء الامتحان فوراً واحتساب صفر'
                    : 'سيتم رصدها وتسجيلها في تقرير الطالب'}
                </span>
                .
              </li>
              <li>
                <strong className="text-white">حظر النسخ واللصق والاختصارات:</strong> النقر الأيمن، اختصارات لوحة المفاتيح، والرجوع للخلف
                معطلة بالكامل حتى تسليم الاختبار.
              </li>
              <li>
                <strong className="text-white">أدوات مساعدة مدمجة:</strong> تتوفر أدوات تغيير حجم الخط، تلوين الأسئلة،
                والمسودة الإلكترونية المساعدة داخل شريط الأدوات العلوي.
              </li>
            </ul>
          </div>

          {/* Action to Start */}
          {!isAttemptsExhausted && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={async () => {
                  await enterStrictFullscreen();
                  setHasStartedExam(true);
                }}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-base shadow-xl shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-3 transform hover:scale-[1.02]"
              >
                <Maximize2 className="w-5 h-5" />
                <span>دخول بيئة الامتحان وبدء المحاولة ({currentAttemptNumber}) الآن</span>
              </button>

              <button
                onClick={() => (onExit ? onExit() : setCurrentView('student_portal'))}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm border border-slate-700 transition-colors cursor-pointer text-center"
              >
                إلغاء والعودة
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: CANCELLATION SCREEN (IF CANCELLED DUE TO VIOLATION)
  // -------------------------------------------------------------
  if (isCancelledDueToViolation) {
    return (
      <div className="w-full max-w-4xl mx-auto py-10 px-4 text-right select-none">
        <div className="p-8 sm:p-12 rounded-3xl bg-rose-950/40 border-2 border-rose-600 text-white space-y-8 shadow-2xl text-center">
          <div className="w-24 h-24 rounded-3xl bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center text-rose-500 mx-auto shadow-2xl animate-pulse">
            <ShieldAlert className="w-14 h-14" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-rose-400">
              تم إلغاء الامتحان واحتساب درجة (0) ⛔
            </h2>
            <p className="text-sm text-rose-200 max-w-xl mx-auto leading-relaxed">
              تم إنهاء جلسة الاختبار تلقائياً لمخالفة سياسة بيئة الامتحانات الصارمة بعد رصد مغادرة النافذة أو كسر وضع ملء
              الشاشة.
            </p>
          </div>

          {/* Violation Details */}
          <div className="p-6 rounded-2xl bg-slate-950/90 border border-rose-800 text-right space-y-3 max-w-xl mx-auto">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="text-slate-400">سبب الإلغاء المرصود:</span>
              <span className="font-bold text-rose-400">{cancellationReason}</span>
            </div>
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="text-slate-400">عدد المخالفات المسجلة:</span>
              <span className="font-bold text-amber-400">{violationsCount} مخالفة</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">توقيت الرصد:</span>
              <span className="font-mono text-slate-300">{new Date().toLocaleTimeString('ar-EG')}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => (onExit ? onExit() : setCurrentView('student_portal'))}
              className="px-8 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all cursor-pointer"
            >
              العودة إلى بوابة الكورسات
            </button>
            {exam.allowRetake !== false && (
              <button
                onClick={() => {
                  setIsCancelledDueToViolation(false);
                  setHasStartedExam(false);
                  setIsSubmitted(false);
                  setSubmissionResult(null);
                  setViolationsCount(0);
                  setSelectedAnswers({});
                  setTimeLeftSeconds(exam.durationMinutes * 60);
                }}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-sm flex items-center gap-2 cursor-pointer shadow-lg hover:opacity-90"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة المحاولة في بيئة ملتزمة</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // CONCEPT SHEET DEFINITION & SEARCH FILTER
  // -------------------------------------------------------------
  const conceptItems = React.useMemo(() => {
    const items: Array<{
      id: string;
      category: 'laws' | 'rules' | 'notes' | 'tips';
      categoryLabel: string;
      title: string;
      formula?: string;
      details: string;
      badge?: string;
    }> = [];

    const subj = (exam.subject || '').toLowerCase();
    
    if (subj.includes('رياض') || subj.includes('math') || subj.includes('هندس') || subj.includes('جبر') || subj.includes('تفاضل')) {
      items.push(
        {
          id: 'math-1',
          category: 'laws',
          categoryLabel: 'قوانين ومعادلات',
          title: 'قانون المميز وحل المعادلات التربيعية',
          formula: 'x = (-b ± √(b² - 4ac)) / (2a)',
          details: 'المميز Δ = b² - 4ac : إذا كان Δ > 0 يوجد جذران حقيقيان مختلفان، وإذا كان = 0 يوجد جذر مكرر، وإذا كان < 0 فالجذران مركبان.',
          badge: 'جبر أساسي'
        },
        {
          id: 'math-2',
          category: 'laws',
          categoryLabel: 'قوانين ومعادلات',
          title: 'المتطابقات المثلثية الأساسية',
          formula: 'sin²(θ) + cos²(θ) = 1 | 1 + tan²(θ) = sec²(θ)',
          details: 'تذكر أن: sin(2θ) = 2 sin(θ) cos(θ) و cos(2θ) = cos²(θ) - sin²(θ).',
          badge: 'حساب مثلثات'
        },
        {
          id: 'math-3',
          category: 'laws',
          categoryLabel: 'قوانين ومعادلات',
          title: 'قواعد الاشتقاق والتفاضل الأساسية',
          formula: 'd/dx [xⁿ] = n·xⁿ⁻¹ | d/dx [u·v] = u\'v + uv\'',
          details: 'مشتقة القسمة: [u/v]\' = (u\'v - uv\') / v² | مشتقة الدالة المركبة (قاعدة السلسلة): f\'(g(x))·g\'(x).',
          badge: 'تفاضل وتكامل'
        },
        {
          id: 'math-4',
          category: 'rules',
          categoryLabel: 'قواعد وملاحظات',
          title: 'المحددات والمصفوفات',
          formula: 'det(A·B) = det(A) · det(B) | A⁻¹ = (1/det(A)) · adj(A)',
          details: 'تكون المصفوفة غير قابلة للعكس (منفردة) إذا كان محددها يساوي صفراً.',
          badge: 'جبر خطي'
        }
      );
    } else if (subj.includes('فيز') || subj.includes('physic')) {
      items.push(
        {
          id: 'phys-1',
          category: 'laws',
          categoryLabel: 'قوانين ومعادلات',
          title: 'معادلات الحركة الخطية بتسارع منتظم',
          formula: 'v = v₀ + at | d = v₀t + ½at² | v² = v₀² + 2ad',
          details: 'في السقوط الحر يتم استبدال التسارع a بعجلة الجاذبية g (≈ 9.8 m/s²).',
          badge: 'ميكانيكا'
        },
        {
          id: 'phys-2',
          category: 'laws',
          categoryLabel: 'قوانين ومعادلات',
          title: 'قانون أوم وحساب القدرة الكهربائية',
          formula: 'V = I · R | P = V · I = I² · R = V² / R',
          details: 'توصيل المقاومات: في التوالي R_eq = Σ R ، وفي التوازي 1/R_eq = Σ (1/R).',
          badge: 'كهربية'
        },
        {
          id: 'phys-3',
          category: 'laws',
          categoryLabel: 'قوانين ومعادلات',
          title: 'قانون نيوتن والشغل والطاقة',
          formula: 'F = m · a | W = F · d · cos(θ) | KE = ½ m v²',
          details: 'مبدأ بقاء الطاقة: الطاقة الكلية تظل ثابتة ولا تفنى ولا تستحدث من العدم.',
          badge: 'ديناميكا'
        }
      );
    } else if (subj.includes('كيم') || subj.includes('chem')) {
      items.push(
        {
          id: 'chem-1',
          category: 'laws',
          categoryLabel: 'قوانين ومعادلات',
          title: 'قانون الغاز المثالي وحساب عدد المولات',
          formula: 'P · V = n · R · T | n = m / M',
          details: 'حيث n عدد المولات، m الكتلة بالجرام، M الكتلة المولية، R = 0.0821 L·atm/(mol·K).',
          badge: 'كيمياء عامة'
        },
        {
          id: 'chem-2',
          category: 'rules',
          categoryLabel: 'قواعد وملاحظات',
          title: 'الرقم الهيدروجيني والاتزان الأيوني',
          formula: 'pH = -log[H⁺] | pH + pOH = 14',
          details: 'المحلول حمضي إذا كان pH < 7، ومتعادل عند pH = 7، وقاعدي إذا كان pH > 7.',
          badge: 'اتزان كيميائي'
        }
      );
    } else if (subj.includes('عرب') || subj.includes('arabic') || subj.includes('لغة')) {
      items.push(
        {
          id: 'ar-1',
          category: 'rules',
          categoryLabel: 'قواعد وملاحظات',
          title: 'علامات الإعراب الأصلية والفرعية',
          formula: 'الرفع: الضمة (أصلية) / الألف والواو وثبوت النون (فرعية)',
          details: 'النصب: الفتحة (أصلية) / الياء والكسرة والألف وحذف النون (فرعية). الجر: الكسرة / الياء والفتحة في الممنوع من الصرف.',
          badge: 'نحو'
        },
        {
          id: 'ar-2',
          category: 'rules',
          categoryLabel: 'قواعد وملاحظات',
          title: 'الأفعال الناسخة والحروف الناسخة',
          formula: 'كان + اسم مرفوع + خبر منصوب | إنّ + اسم منصوب + خبر مرفوع',
          details: 'كاد وأخواتها تعمل عمل كان بشرط أن يكون خبرها جملة فعلية فعلها مضارع.',
          badge: 'نواسخ'
        },
        {
          id: 'ar-3',
          category: 'notes',
          categoryLabel: 'مفاهيم ونقاط ذهبية',
          title: 'أسرار علم البلاغة والبيان',
          formula: 'التشبيه | الاستعارة (تصريحية أو مكنية) | الكناية',
          details: 'الاستعارة المكنية حذف فيها المشبه به ورمز له بشيء من لوازمه، وسر الجمال: التشخيص، التجسيم، أو التوضيح.',
          badge: 'بلاغة'
        }
      );
    } else if (subj.includes('انجليز') || subj.includes('english')) {
      items.push(
        {
          id: 'en-1',
          category: 'rules',
          categoryLabel: 'قواعد وملاحظات',
          title: 'Conditional Sentences (If Conditionals)',
          formula: 'Zero: If + Pres, Pres | First: If + Pres, will + V | Second: If + Past, would + V | Third: If + Past Perf, would have + V3',
          details: 'Pay attention to inversions (Had I known..., Were he to come...).',
          badge: 'Grammar'
        },
        {
          id: 'en-2',
          category: 'rules',
          categoryLabel: 'قواعد وملاحظات',
          title: 'Passive Voice Formula',
          formula: 'Object + Verb to be (in correct tense) + Past Participle (V3)',
          details: 'Continuous: being + V3 | Perfect: been + V3 | Modals: modal + be + V3.',
          badge: 'Grammar'
        }
      );
    }

    // Universal Golden Exam Tips
    items.push(
      {
        id: 'tip-1',
        category: 'tips',
        categoryLabel: 'إرشادات الحل السريع',
        title: 'استراتيجية الاستبعاد الذكي (Elimination Method)',
        details: 'اقرأ رأس السؤال بتركيز وحدد الكلمات المفتاحية. استبعد فوراً الإجابات غير المنطقية وركز على المفاضلة بين الخيارات المتبقية.',
        badge: 'مهارة تفوق ⚡'
      },
      {
        id: 'tip-2',
        category: 'tips',
        categoryLabel: 'إرشادات الحل السريع',
        title: 'إدارة وقت الاختبار وتجنب التعليق',
        details: 'إذا واجهت سؤالاً معقداً يستغرق وقتاً طويلاً، استخدم زر تعليم السؤال (العلم 🚩) وانتقل فوراً للسؤال التالي، ثم عد إليه لاحقاً.',
        badge: 'إدارة الوقت ⏱️'
      },
      {
        id: 'tip-3',
        category: 'notes',
        categoryLabel: 'مفاهيم ونقاط ذهبية',
        title: 'التحقق من الوحدات والمعطيات',
        details: 'تأكد دائماً من مطابقة وحدات القياس (ثانية/دقيقة، سم/متر، جرام/كجم) قبل إجراء العمليات الحسابية النهائية.',
        badge: 'دقة حسابية 🎯'
      }
    );

    return items;
  }, [exam.subject]);

  const filteredConcepts = conceptItems.filter((item) => {
    if (activeConceptTab !== 'all' && item.category !== activeConceptTab) return false;
    if (!conceptSheetSearch.trim()) return true;
    const q = conceptSheetSearch.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.details.toLowerCase().includes(q) ||
      (item.formula && item.formula.toLowerCase().includes(q)) ||
      (item.badge && item.badge.toLowerCase().includes(q))
    );
  });

  // -------------------------------------------------------------
  // VIEW 3: IN-EXAM ACTIVE SESSION / RESULT REVIEW
  // -------------------------------------------------------------
  const inActiveExamSession = hasStartedExam && !isSubmitted && !isCancelledDueToViolation;

  return (
    <div
      className={`${
        inActiveExamSession
          ? 'fixed inset-0 z-[99999] w-screen h-screen overflow-y-auto overscroll-none touch-pan-y p-3 sm:p-6'
          : 'w-full max-w-6xl mx-auto p-2 sm:p-4 rounded-3xl'
      } space-y-5 text-right transition-colors duration-300 relative ${getThemeClass()} ${
        exam.preventCopyPaste !== false ? 'select-none' : ''
      }`}
      ref={containerRef}
    >
      {/* Background Anti-Leak Watermark in Active Session */}
      {inActiveExamSession && <AntiLeakWatermark mode="exam" />}

      {/* Interactive Concept & Formula Sheet Modal */}
      {isConceptSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in text-right" dir="rtl">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-indigo-500/10 dark:from-slate-950 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    ورقة المفاهيم والمعادلات والقواعد المعتمدة 💡
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    مرجع أكاديمي موثق لمساعدتك في تذكر القوانين واستراتيجيات الحل أثناء الاختبار.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConceptSheetOpen(false)}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Search and Category Filter Toolbar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
              <input
                type="text"
                value={conceptSheetSearch}
                onChange={(e) => setConceptSheetSearch(e.target.value)}
                placeholder="ابحث في القوانين، القواعد، أو المصطلحات المفتاحية..."
                className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:border-amber-500 focus:outline-none"
              />

              <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {[
                  { id: 'all', label: 'كافة المفاهيم' },
                  { id: 'laws', label: 'قوانين ومعادلات 📐' },
                  { id: 'rules', label: 'قواعد وضوابط 📜' },
                  { id: 'notes', label: 'مفاهيم ذهبية ✨' },
                  { id: 'tips', label: 'إرشادات الحل ⚡' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveConceptTab(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                      activeConceptTab === tab.id
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Concept Cards Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {filteredConcepts.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-bold">لا توجد نتائج مطابقة لبحثك في ورقة المفاهيم.</p>
                </div>
              ) : (
                filteredConcepts.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 space-y-2 hover:border-amber-400/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">{c.title}</h4>
                      </div>
                      {c.badge && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black">
                          {c.badge}
                        </span>
                      )}
                    </div>

                    {c.formula && (
                      <div
                        dir="ltr"
                        className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs sm:text-sm font-black border border-slate-800 text-left flex items-center justify-between"
                      >
                        <span className="truncate">{c.formula}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(c.formula || '');
                            addToast('info', 'تم نسخ المعادلة بنجاح');
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 ml-2 shrink-0 cursor-pointer"
                        >
                          نسخ
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-bold">
                      {c.details}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span>ورقة المفاهيم مخصصة للاسترشاد السريع أثناء الحل.</span>
              <button
                type="button"
                onClick={() => setIsConceptSheetOpen(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
              >
                العودة لأسئلة الامتحان
              </button>
            </div>

          </div>
        </div>
      )}
      {/* Violation Warning Modal */}
      {showViolationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-amber-500 text-white text-center space-y-6 shadow-2xl animate-scaleUp">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40 animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-amber-400">إنذار نظام المراقبة الأكاديمية!</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                تم رصد: <span className="text-amber-300 font-bold">{lastViolationReason}</span>.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-xs text-amber-200">
                المخالفة رقم <strong>{violationsCount}</strong> من أصل{' '}
                <strong>{exam.maxViolationsAllowed !== undefined ? exam.maxViolationsAllowed : 1}</strong> مسموحة. تكرار
                المخالفة سيؤدي لإلغاء الامتحان فوراً واحتساب صفر!
              </div>
            </div>

            <button
              onClick={async () => {
                setShowViolationModal(false);
                await enterStrictFullscreen();
              }}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all cursor-pointer shadow-lg"
            >
              فهمت، العودة إلى وضع ملء الشاشة والمتابعة
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Review Modal */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-700 text-white space-y-6 shadow-2xl text-right">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black">مراجعة وتأكيد تسليم الامتحان</h3>
                <p className="text-xs text-slate-400">تأكد من إجابتك على كافة الأسئلة قبل التصحيح النهائي</p>
              </div>
            </div>

            {/* Answered vs Unanswered summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <span className="block text-xs font-bold text-emerald-400">الأسئلة المجابة</span>
                <span className="text-2xl font-black text-emerald-300">
                  {answeredCount} / {totalQuestions}
                </span>
              </div>
              <div
                className={`p-4 rounded-2xl text-center border ${
                  unansweredCount > 0
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <span className="block text-xs font-bold">المتبقي بدون إجابة</span>
                <span className="text-2xl font-black">{unansweredCount}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  تنبيه: لديك <strong>{unansweredCount}</strong> سؤال بدون إجابة. سيتم احتساب 0 للأسئلة المتروكة.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitConfirmModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                العودة للأسئلة
              </button>
              <button
                type="button"
                onClick={handleSubmitExam}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                تأكيد التسليم النهائي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Digital Scratchpad Modal */}
      {isScratchpadOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full p-6 rounded-3xl bg-slate-900 border border-slate-700 text-white space-y-4 shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-black">المسودة الإلكترونية للحسابات والملاحظات</h3>
              </div>
              <button
                onClick={() => setIsScratchpadOpen(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg cursor-pointer"
              >
                إغلاق ✕
              </button>
            </div>

            {/* Quick Math Symbols palette */}
            <div className="flex items-center gap-1.5 flex-wrap pb-2 border-b border-slate-800">
              <span className="text-[11px] text-slate-400 ml-2">رموز سريعة:</span>
              {['√', 'π', '²', '³', '±', '≠', '≤', '≥', '÷', '×', 'θ', 'Σ', 'Δ', 'Ω', '∞'].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => setScratchpadText((prev) => prev + sym)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold cursor-pointer"
                >
                  {sym}
                </button>
              ))}
            </div>

            <textarea
              rows={8}
              value={scratchpadText}
              onChange={(e) => setScratchpadText(e.target.value)}
              placeholder="اكتب خطوات الحل أو المسودات هنا..."
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:border-cyan-500 focus:outline-none"
            />

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>المسودة مؤقتة ولا تؤثر على درجات الامتحان</span>
              <button
                type="button"
                onClick={() => setScratchpadText('')}
                className="text-rose-400 hover:underline cursor-pointer"
              >
                مسح المسودة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER & ERGONOMIC TOOLBAR */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl ${getCardThemeClass()}`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 inline-flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-cyan-500" />
              {exam.title}
            </span>
            {exam.strictFullscreenEnforced !== false && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                بيئة مقفلة
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
            <span>
              سؤال <strong>{currentQuestionIndex + 1}</strong> من <strong>{totalQuestions}</strong>
            </span>
            <span>•</span>
            <span>
              تمت الإجابة: <strong className="text-emerald-500">{answeredCount}</strong>
            </span>
          </div>
        </div>

        {/* Student Ergonomics: Font Scaler, Themes, Scratchpad & Timer */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {!isSubmitted && (
            <>
              {/* Font Size Scaler */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  title="خط صغير"
                  onClick={() => setFontSize('sm')}
                  className={`px-2 py-1 text-xs rounded-lg font-bold cursor-pointer ${
                    fontSize === 'sm' ? 'bg-cyan-500 text-white' : 'text-slate-500'
                  }`}
                >
                  A-
                </button>
                <button
                  type="button"
                  title="خط متوسط"
                  onClick={() => setFontSize('md')}
                  className={`px-2 py-1 text-xs rounded-lg font-bold cursor-pointer ${
                    fontSize === 'md' ? 'bg-cyan-500 text-white' : 'text-slate-500'
                  }`}
                >
                  A
                </button>
                <button
                  type="button"
                  title="خط كبير"
                  onClick={() => setFontSize('lg')}
                  className={`px-2 py-1 text-xs rounded-lg font-bold cursor-pointer ${
                    fontSize === 'lg' ? 'bg-cyan-500 text-white' : 'text-slate-500'
                  }`}
                >
                  A+
                </button>
                <button
                  type="button"
                  title="خط ضخم"
                  onClick={() => setFontSize('xl')}
                  className={`px-2 py-1 text-xs rounded-lg font-bold cursor-pointer ${
                    fontSize === 'xl' ? 'bg-cyan-500 text-white' : 'text-slate-500'
                  }`}
                >
                  A++
                </button>
              </div>

              {/* Theme Selector */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  title="وضع ليلي"
                  onClick={() => setExamTheme('dark')}
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    examTheme === 'dark' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="وضع نهاري"
                  onClick={() => setExamTheme('light')}
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    examTheme === 'light' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="وضع القراءة الهادئ"
                  onClick={() => setExamTheme('sepia')}
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    examTheme === 'sepia' ? 'bg-[#ebd7b2] text-[#433422]' : 'text-slate-400'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="وضع التباين العالي"
                  onClick={() => setExamTheme('contrast')}
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    examTheme === 'contrast' ? 'bg-yellow-400 text-black font-black' : 'text-slate-400'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Concept Sheet Quick Trigger */}
              <button
                type="button"
                onClick={() => setIsConceptSheetOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="فتح ورقة المفاهيم والقواعد والمعادلات"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>ورقة المفاهيم 💡</span>
              </button>

              {/* Ambient Focus Audio Trigger */}
              <button
                type="button"
                onClick={toggleAmbientFocus}
                className={`px-3 py-2 rounded-xl border text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                  isAmbientFocusActive
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/30 font-black'
                    : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
                title={isAmbientFocusActive ? 'إيقاف صوت التركيز' : 'تشغيل أصوات التركيز الذهني الهادئة'}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAmbientFocusActive ? 'تركيز 🎧' : 'صوت تركيز'}</span>
              </button>

              {/* Scratchpad Button */}
              <button
                type="button"
                onClick={() => setIsScratchpadOpen(true)}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300"
                title="المسودة الإلكترونية"
              >
                <Edit3 className="w-3.5 h-3.5 text-cyan-500" />
                <span className="hidden sm:inline">المسودة</span>
              </button>

              {/* Fullscreen Toggle / Restore */}
              <button
                type="button"
                onClick={enterStrictFullscreen}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-500 cursor-pointer"
                title="ملء الشاشة"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Real-time Timer */}
              <div
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-mono text-sm sm:text-base font-black border transition-colors ${
                  timeLeftSeconds < 180
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-cyan-600 dark:text-cyan-400'
                }`}
              >
                <Timer className="w-4 h-4 text-cyan-500" />
                <span>{formatTime(timeLeftSeconds)}</span>
              </div>

              {/* Finish Exam Button */}
              <button
                onClick={() => setShowSubmitConfirmModal(true)}
                className="px-4 sm:px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>تسليم الامتحان</span>
              </button>
            </>
          )}

          {isSubmitted && (
            <button
              onClick={() => (onExit ? onExit() : setCurrentView('student_portal'))}
              className="px-5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              العودة للكورس
            </button>
          )}
        </div>
      </div>

      {/* Motivational Progress Milestone Bar */}
      {!isSubmitted && (
        <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-300 shrink-0">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              نسبة الإنجاز:{' '}
              <strong className="text-cyan-600 dark:text-cyan-400 font-black">
                {Math.round((answeredCount / (totalQuestions || 1)) * 100)}%
              </strong>
            </span>
          </div>

          <div className="flex-1 bg-slate-100 dark:bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.round((answeredCount / (totalQuestions || 1)) * 100)}%` }}
            />
          </div>

          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
            {answeredCount === totalQuestions
              ? '🎉 أتممت كافة الأسئلة بنجاح!'
              : `متبقي ${totalQuestions - answeredCount} أسئلة`}
          </div>
        </div>
      )}

      {/* MAIN EXAMINATION AREA VS RESULT REVIEW */}
      {!isSubmitted ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Main Question Card (3 Cols) */}
          <div className="lg:col-span-3 space-y-5">
            {currentQuestion && (
              <div
                className={`p-5 sm:p-8 rounded-3xl border space-y-6 shadow-xl relative overflow-hidden ${getCardThemeClass()}`}
              >
                {/* Question Top Bar: Index, Points, Highlighter & Bookmark */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-black text-sm flex items-center justify-center border border-cyan-500/30">
                      {currentQuestionIndex + 1}
                    </span>
                    <span className="text-xs font-bold opacity-75">
                      ({currentQuestion.points} درجات) • نوع السؤال:{' '}
                      <span className="text-cyan-500 font-bold">{currentQuestion.type}</span>
                    </span>
                  </div>

                  {/* Highlighter Palette & Bookmark Action */}
                  <div className="flex items-center gap-2">
                    {/* 5-Color Highlighters */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      {(['amber', 'emerald', 'cyan', 'rose', 'purple'] as ColorHighlight[]).map((c) => (
                        <button
                          key={c}
                          type="button"
                          title={`تلوين السؤال باللون ${c}`}
                          onClick={() => setQuestionColor(currentQuestion.id, c)}
                          className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                            c === 'amber'
                              ? 'bg-amber-400'
                              : c === 'emerald'
                              ? 'bg-emerald-400'
                              : c === 'cyan'
                              ? 'bg-cyan-400'
                              : c === 'rose'
                              ? 'bg-rose-400'
                              : 'bg-purple-400'
                          } ${
                            questionColorTags[currentQuestion.id] === c
                              ? 'scale-125 ring-2 ring-white dark:ring-slate-950'
                              : 'opacity-70 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Bookmark / Flag for Review */}
                    <button
                      onClick={() => toggleFlag(currentQuestion.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        flaggedQuestions[currentQuestion.id]
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/40'
                          : 'opacity-75 hover:opacity-100 bg-slate-100 dark:bg-slate-950'
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>{flaggedQuestions[currentQuestion.id] ? 'معلم للمراجعة' : 'تعليم'}</span>
                    </button>
                  </div>
                </div>

                {/* Prompt Text with Dynamic Font Scaling and Question Color Highlight */}
                {(() => {
                  const isQEnglish = isEnglishText(currentQuestion.prompt, exam?.subject);
                  return (
                    <div
                      dir={isQEnglish ? 'ltr' : 'rtl'}
                      className={`p-4 rounded-2xl border font-black leading-relaxed ${
                        isQEnglish ? 'text-left' : 'text-right'
                      } ${getFontSizeClass()} ${
                        questionColorTags[currentQuestion.id] && questionColorTags[currentQuestion.id] !== 'none'
                          ? getColorHighlightBadge(questionColorTags[currentQuestion.id])
                          : 'border-transparent'
                      }`}
                    >
                      {currentQuestion.prompt}
                    </div>
                  );
                })()}

                {/* Smart Hint Bar */}
                {exam.allowHints !== false && currentQuestion.hint && currentQuestion.allowHint !== false && (
                  <div className="pt-1">
                    {!revealedHints[currentQuestion.id] ? (
                      <button
                        type="button"
                        onClick={() => setRevealedHints((prev) => ({ ...prev, [currentQuestion.id]: true }))}
                        className="px-4 py-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Lightbulb className="w-4 h-4 text-amber-500 animate-pulse" />
                        <span>طلب تلميح مساعد من المعلم (Hint) 💡</span>
                      </button>
                    ) : (
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs sm:text-sm space-y-2">
                        <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                          <span className="font-black text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            <span>تلميح استرشادي من المعلم:</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setRevealedHints((prev) => ({ ...prev, [currentQuestion.id]: false }))}
                            className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                          >
                            إخفاء التلميح ✕
                          </button>
                        </div>
                        <p className="leading-relaxed font-semibold">{currentQuestion.hint}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* DYNAMIC RENDERING FOR ALL 10 QUESTION TYPES */}

                {/* 1. MCQ */}
                {currentQuestion.type === 'mcq' && (() => {
                  const isQEnglish = isEnglishText(currentQuestion.prompt, exam?.subject);
                  return (
                    <div className="space-y-3 pt-2" dir={isQEnglish ? 'ltr' : 'rtl'}>
                      {(currentQuestion.options || []).map((opt, idx) => {
                        const isSelected = selectedAnswers[currentQuestion.id] === idx;
                        const prefix = getOptionPrefix(idx, isQEnglish);
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectAnswer(currentQuestion.id, idx)}
                            className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                              isQEnglish ? 'text-left' : 'text-right'
                            } ${
                              isSelected
                                ? 'bg-cyan-500/15 border-cyan-500 text-cyan-600 dark:text-cyan-200 shadow-md scale-[1.01]'
                                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 opacity-90 hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                                  isSelected
                                    ? 'bg-cyan-500 text-white dark:text-slate-950'
                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                                }`}
                              >
                                {prefix}
                              </span>
                              <span className={`font-semibold ${getFontSizeClass()}`}>{opt}</span>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-cyan-500 bg-cyan-500/20' : 'border-slate-300 dark:border-slate-700'
                              }`}
                            >
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* 2. TRUE / FALSE */}
                {currentQuestion.type === 'true_false' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {[
                      { val: true, label: 'صحيح (True)', icon: CheckCircle, color: 'emerald' },
                      { val: false, label: 'خطأ (False)', icon: XCircle, color: 'rose' },
                    ].map((item) => {
                      const isSelected = selectedAnswers[currentQuestion.id] === item.val;
                      const Icon = item.icon;
                      return (
                        <button
                          key={String(item.val)}
                          onClick={() => handleSelectAnswer(currentQuestion.id, item.val)}
                          className={`p-6 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
                            isSelected
                              ? item.val
                                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-200 shadow-xl'
                                : 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-200 shadow-xl'
                              : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <Icon
                            className={`w-8 h-8 ${
                              isSelected
                                ? item.val
                                  ? 'text-emerald-500'
                                  : 'text-rose-500'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          />
                          <span className="text-base font-black">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 3. FILL IN THE BLANK */}
                {currentQuestion.type === 'fill_blank' && (
                  <div className="space-y-3 pt-2 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <label className="block text-xs font-bold opacity-75">اكتب الكلمة أو العبارة المناسبة لملء الفراغ:</label>
                    <input
                      type="text"
                      placeholder="اكتب الإجابة هنا..."
                      value={selectedAnswers[currentQuestion.id] || ''}
                      onChange={(e) => handleSelectAnswer(currentQuestion.id, e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold focus:border-cyan-500 focus:outline-none ${getFontSizeClass()}`}
                    />
                  </div>
                )}

                {/* 4. MATCHING */}
                {currentQuestion.type === 'matching' && (
                  <div className="space-y-4 pt-2">
                    <p className="text-xs font-bold opacity-75">اختر المقابل الصحيح لكل عنصر من القائمة المنسدلة:</p>
                    <div className="space-y-3">
                      {(currentQuestion.matchingPairs || []).map((pair, pIdx) => {
                        const currentVal = (selectedAnswers[currentQuestion.id] || {})[pair.left] || '';
                        return (
                          <div
                            key={pIdx}
                            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <span className="text-sm font-black text-cyan-600 dark:text-cyan-300">{pair.left}</span>
                            <select
                              value={currentVal}
                              onChange={(e) => {
                                const prevMatches = selectedAnswers[currentQuestion.id] || {};
                                handleSelectAnswer(currentQuestion.id, {
                                  ...prevMatches,
                                  [pair.left]: e.target.value,
                                });
                              }}
                              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:border-cyan-500 focus:outline-none"
                            >
                              <option value="">-- اختر التعريف المناسب --</option>
                              {(currentQuestion.matchingPairs || []).map((optP, optIdx) => (
                                <option key={optIdx} value={optP.right}>
                                  {optP.right}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. ORDERING */}
                {currentQuestion.type === 'ordering' && (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold opacity-75">استخدم أزرار الأسهم لترتيب العناصر في السياق الصحيح:</p>
                    <div className="space-y-2">
                      {((selectedAnswers[currentQuestion.id] as string[]) || currentQuestion.orderingItems || []).map(
                        (item, iIdx, arr) => (
                          <div
                            key={iIdx}
                            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-black flex items-center justify-center border border-cyan-500/20">
                                {iIdx + 1}
                              </span>
                              <span className={`font-bold ${getFontSizeClass()}`}>{item}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={iIdx === 0}
                                onClick={() => {
                                  const updated = [...arr];
                                  const temp = updated[iIdx - 1];
                                  updated[iIdx - 1] = updated[iIdx];
                                  updated[iIdx] = temp;
                                  handleSelectAnswer(currentQuestion.id, updated);
                                }}
                                className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-900 hover:bg-slate-300 dark:hover:bg-slate-800 text-xs disabled:opacity-30 cursor-pointer"
                              >
                                ↑ لأعلى
                              </button>
                              <button
                                type="button"
                                disabled={iIdx === arr.length - 1}
                                onClick={() => {
                                  const updated = [...arr];
                                  const temp = updated[iIdx + 1];
                                  updated[iIdx + 1] = updated[iIdx];
                                  updated[iIdx] = temp;
                                  handleSelectAnswer(currentQuestion.id, updated);
                                }}
                                className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-900 hover:bg-slate-300 dark:hover:bg-slate-800 text-xs disabled:opacity-30 cursor-pointer"
                              >
                                ↓ لأسفل
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* 6. LISTENING */}
                {currentQuestion.type === 'listening' && (
                  <div className="space-y-4 pt-2">
                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                          <Headphones className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-black">مقطع صوتي تفاعلي (Listening Audio)</p>
                          <p className="text-[11px] text-cyan-600 dark:text-cyan-300">استمع للنص ثم أجب عن السؤال</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => playSpeechAudio(currentQuestion.audioScript || currentQuestion.prompt)}
                        className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                          isPlayingAudio
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-white dark:text-slate-950'
                        }`}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{isPlayingAudio ? 'جارٍ التشغيل...' : 'استمع للمقطع'}</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(currentQuestion.options || []).map((opt, oIdx) => {
                        const isSelected = selectedAnswers[currentQuestion.id] === oIdx;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectAnswer(currentQuestion.id, oIdx)}
                            className={`w-full p-3.5 rounded-xl border text-right transition-all flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-cyan-500/15 border-cyan-500 font-bold text-cyan-600 dark:text-cyan-300'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
                            }`}
                          >
                            <span className={getFontSizeClass()}>{opt}</span>
                            <div
                              className={`w-4 h-4 rounded-full border ${
                                isSelected ? 'border-cyan-500 bg-cyan-500' : 'border-slate-300 dark:border-slate-700'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 7. PASSAGE */}
                {currentQuestion.type === 'passage' && (
                  <div className="space-y-5 pt-2">
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm leading-relaxed max-h-60 overflow-y-auto custom-scrollbar">
                      <div className="flex items-center gap-1.5 text-xs font-black text-cyan-600 dark:text-cyan-400 mb-2">
                        <FileText className="w-4 h-4" />
                        <span>نص القطعة القرائية:</span>
                      </div>
                      <p className={`whitespace-pre-line ${getFontSizeClass()}`}>{currentQuestion.passageText}</p>
                    </div>

                    <div className="space-y-4">
                      {(currentQuestion.passageQuestions || []).map((subQ, sqIdx) => {
                        const subAns = (selectedAnswers[currentQuestion.id] || {})[subQ.id];
                        return (
                          <div
                            key={subQ.id}
                            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
                          >
                            <p className="text-xs font-black">
                              {sqIdx + 1}. {subQ.prompt}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {(subQ.options || []).map((sOpt, sOptIdx) => {
                                const isSubSelected = subAns === sOptIdx;
                                return (
                                  <button
                                    key={sOptIdx}
                                    onClick={() => {
                                      const prevSub = selectedAnswers[currentQuestion.id] || {};
                                      handleSelectAnswer(currentQuestion.id, {
                                        ...prevSub,
                                        [subQ.id]: sOptIdx,
                                      });
                                    }}
                                    className={`p-2.5 rounded-xl border text-xs text-right transition-all flex items-center justify-between ${
                                      isSubSelected
                                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-600 dark:text-cyan-200 font-bold'
                                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                                    }`}
                                  >
                                    <span>{sOpt}</span>
                                    <div
                                      className={`w-3.5 h-3.5 rounded-full border ${
                                        isSubSelected
                                          ? 'bg-cyan-500 border-cyan-500'
                                          : 'border-slate-300 dark:border-slate-700'
                                      }`}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 8. ERROR CORRECTION */}
                {currentQuestion.type === 'error_correction' && (
                  <div className="space-y-4 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="text-xs font-bold opacity-75">الجملة:</span>
                      <p className="text-base font-black font-mono">{currentQuestion.sentenceWithMistake}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                      <label className="block text-xs font-bold opacity-75">
                        اكتب الكلمة أو العبارة البديلة المصححة بدقة:
                      </label>
                      <input
                        type="text"
                        placeholder="اكتب التصحيح هنا..."
                        value={selectedAnswers[currentQuestion.id] || ''}
                        onChange={(e) => handleSelectAnswer(currentQuestion.id, e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-emerald-500 font-black focus:border-emerald-500 focus:outline-none ${getFontSizeClass()}`}
                      />
                    </div>
                  </div>
                )}

                {/* 9 & 10. SHORT ANSWER & ESSAY */}
                {(currentQuestion.type === 'short_answer' || currentQuestion.type === 'essay') && (
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold opacity-75">اكتب إجابتك وصياغتك هنا:</label>
                    <textarea
                      rows={currentQuestion.type === 'essay' ? 6 : 3}
                      placeholder="اكتب الإجابة النموذجية..."
                      value={selectedAnswers[currentQuestion.id] || ''}
                      onChange={(e) => handleSelectAnswer(currentQuestion.id, e.target.value)}
                      className={`w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 focus:outline-none text-right ${getFontSizeClass()}`}
                    />
                    <span className="text-[11px] opacity-60 block">
                      عدد الحروف: {String(selectedAnswers[currentQuestion.id] || '').length}
                    </span>
                  </div>
                )}

                {/* Navigation Bar between Questions */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-2 disabled:opacity-40 cursor-pointer transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>السابق</span>
                  </button>

                  <div className="text-xs font-bold opacity-75">
                    سؤال {currentQuestionIndex + 1} من {totalQuestions}
                  </div>

                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                      className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white dark:text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
                    >
                      <span>التالي</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSubmitConfirmModal(true)}
                      className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white dark:text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>تسليم ومراجعة</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Question Map Drawer (1 Col) */}
          <div className="space-y-4">
            <div className={`p-5 rounded-3xl border space-y-4 shadow-xl ${getCardThemeClass()}`}>
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-xs font-black flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-cyan-500" />
                  <span>خريطة الأسئلة السريعة</span>
                </h3>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-bold">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`flex-1 py-1 rounded-lg transition-all cursor-pointer text-center ${
                    filterMode === 'all' ? 'bg-cyan-500 text-white' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  الكل ({totalQuestions})
                </button>
                <button
                  onClick={() => setFilterMode('unanswered')}
                  className={`flex-1 py-1 rounded-lg transition-all cursor-pointer text-center ${
                    filterMode === 'unanswered' ? 'bg-rose-500 text-white' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  المتبقي ({unansweredCount})
                </button>
                <button
                  onClick={() => setFilterMode('flagged')}
                  className={`flex-1 py-1 rounded-lg transition-all cursor-pointer text-center ${
                    filterMode === 'flagged' ? 'bg-amber-500 text-white' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  المعلم ({Object.values(flaggedQuestions).filter(Boolean).length})
                </button>
              </div>

              {/* Question Map Grid */}
              <div className="grid grid-cols-4 gap-2 max-h-72 overflow-y-auto custom-scrollbar p-1">
                {filteredQuestionIndices.map(({ q, idx }) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined && selectedAnswers[q.id] !== '';
                  const isCurrent = currentQuestionIndex === idx;
                  const isFlagged = flaggedQuestions[q.id];
                  const colorTag = questionColorTags[q.id];

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer relative ${
                        isCurrent
                          ? 'ring-2 ring-cyan-500 bg-cyan-500 text-white font-black'
                          : isAnswered
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100'
                      }`}
                    >
                      {idx + 1}
                      {/* Flag marker */}
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
                      )}
                      {/* Color highlight dot */}
                      {colorTag && colorTag !== 'none' && (
                        <span
                          className={`absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                            colorTag === 'amber'
                              ? 'bg-amber-400'
                              : colorTag === 'emerald'
                              ? 'bg-emerald-400'
                              : colorTag === 'cyan'
                              ? 'bg-cyan-400'
                              : colorTag === 'rose'
                              ? 'bg-rose-400'
                              : 'bg-purple-400'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Status Legend */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-[11px] opacity-80">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md bg-emerald-500" />
                  <span>تمت الإجابة ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md bg-slate-200 dark:bg-slate-950 border border-slate-400" />
                  <span>متبقٍ دون إجابة ({unansweredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md bg-amber-500" />
                  <span>معلم للمراجعة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* -------------------------------------------------------------
           RESULT & DETAILED MODEL EXPLANATIONS REVIEW VIEW
        ------------------------------------------------------------- */
        <div className="space-y-6">
          {/* Result Card */}
          <div
            className={`p-8 rounded-3xl border shadow-2xl text-center space-y-4 ${
              submissionResult?.passed
                ? 'bg-emerald-500/5 border-emerald-500/50'
                : 'bg-rose-500/5 border-rose-500/50'
            }`}
          >
            <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-xl">
              {submissionResult?.passed ? (
                <Award className="w-16 h-16 text-emerald-500" />
              ) : (
                <XCircle className="w-16 h-16 text-rose-500" />
              )}
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black">
                {submissionResult?.passed ? 'مبروك! اجتزت الامتحان بنجاح 🎓' : 'للأسف لم تحقق نسبة النجاح المطلوبة'}
              </h2>
              <p className="text-xs opacity-75 mt-1">درجة النجاح المعتمدة: {exam.passingScorePercent}%</p>
            </div>

            {/* Score Badges */}
            <div className="inline-flex items-center gap-6 px-8 py-4 rounded-3xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-xl">
              <div>
                <span className="block text-[11px] opacity-75 font-bold">النسبة المئوية</span>
                <span
                  className={`text-3xl font-black ${
                    submissionResult?.passed ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {submissionResult?.percentage}%
                </span>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:border-slate-800" />
              <div>
                <span className="block text-[11px] opacity-75 font-bold">الدرجة المكتسبة</span>
                <span className="text-3xl font-black">
                  {submissionResult?.score} / {submissionResult?.totalPoints}
                </span>
              </div>
            </div>
          </div>

          {/* Retake & Action Bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <button
              onClick={() => (onExit ? onExit() : setCurrentView('student_portal'))}
              className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs sm:text-sm cursor-pointer transition-all"
            >
              العودة إلى قائمة الكورسات
            </button>

            {exam.allowRetake !== false && (
              usedAttemptsCount >= maxAllowedAttempts && !isTeacherOrAdmin ? (
                <div className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700">
                  ⛔ اكتملت جميع المحاولات المسموح بها ({usedAttemptsCount} من {maxAllowedAttempts})
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setSubmissionResult(null);
                    setCurrentQuestionIndex(0);
                    setSelectedAnswers({});
                    setFlaggedQuestions({});
                    setRevealedHints({});
                    setTimeLeftSeconds(exam.durationMinutes * 60);
                    setViolationsCount(0);
                    setHasStartedExam(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-lg hover:opacity-90"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>
                    إعادة خوض الامتحان ({usedAttemptsCount + 1} من {maxAllowedAttempts})
                  </span>
                </button>
              )
            )}
          </div>

          {/* Model Solutions & Explanations Review */}
          {exam.showExplanationAfterSubmit !== false ? (
            <div className="space-y-4">
              <h3 className="text-base font-black flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>مراجعة الأسئلة وتفسير مفتاح الإجابة والشرح النموذجي</span>
              </h3>

              {(exam.questions || []).map((q, idx) => {
                const studentAns = selectedAnswers[q.id];
                const evalResult = evaluateQuestion(q, studentAns);

                return (
                  <div
                    key={q.id}
                    className={`p-6 rounded-3xl border space-y-4 shadow-md bg-white dark:bg-slate-900/95 ${
                      evalResult.isCorrect ? 'border-emerald-500/40' : 'border-rose-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-cyan-500">سؤال {idx + 1}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            evalResult.isCorrect
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                          }`}
                        >
                          {evalResult.isCorrect ? 'إجابة صحيحة ✓' : 'إجابة خاطئة ✗'} ({evalResult.pointsEarned}/
                          {q.points} درجات)
                        </span>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base font-black">{q.prompt}</p>

                    {/* Student answer preview */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <div className="text-[11px] font-bold opacity-60">إجابتك المسجلة:</div>
                      <div className="font-semibold">
                        {typeof studentAns === 'undefined'
                          ? 'لم تتم الإجابة'
                          : q.type === 'mcq'
                          ? q.options?.[studentAns] || `الخيار ${studentAns}`
                          : q.type === 'true_false'
                          ? studentAns
                            ? 'صحيح (True)'
                            : 'خطأ (False)'
                          : String(studentAns)}
                      </div>
                    </div>

                    {/* Model Answer & Explanation */}
                    {q.explanation && (
                      <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/30 text-xs space-y-1">
                        <span className="font-black text-cyan-600 dark:text-cyan-300 flex items-center gap-1.5 text-sm">
                          <BookOpen className="w-4 h-4 text-cyan-500" />
                          <span>الشرح وتفسير الإجابة النموذجية:</span>
                        </span>
                        <p className="leading-relaxed font-medium pt-1 opacity-90">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xl">
              <Lock className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-base font-black">نموذج الإجابات والشرح التفصيلي محجوب</h4>
              <p className="text-xs sm:text-sm opacity-70 max-w-md mx-auto leading-relaxed">
                تم حجب استعراض مفتاح الإجابات وتفسير الأسئلة بناءً على إعدادات المعلم لهذا الامتحان. درجتك ونتيجتك مسجلة
                بنجاح.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

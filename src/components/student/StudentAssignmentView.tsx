import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText, Clock, CheckCircle2, AlertCircle, BookOpen, ArrowRight, ArrowLeft,
  Award, Sparkles, HelpCircle, Eye, Check, X, Send, RefreshCw, Layers,
  ChevronRight, ChevronLeft, Bookmark, Plus, Lock, Edit3, BookmarkPlus,
  Lightbulb, Headphones, Volume2, Maximize2, Minimize2, Grid, ShieldAlert,
  Moon, Sun, Zap, Flag, Timer
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Assignment, Question } from '../../types';
import { AntiLeakWatermark } from '../AntiLeakWatermark';
import { isEnglishText, getOptionPrefix } from '../../utils/langUtils';
import {
  initScreenRecordingProtection,
  subscribeToScreenProtection,
} from '../../lib/screenProtection';

interface StudentAssignmentViewProps {
  assignmentId?: string;
  onBack?: () => void;
}

type ColorHighlight = 'none' | 'amber' | 'emerald' | 'cyan' | 'rose' | 'purple';

export const StudentAssignmentView: React.FC<StudentAssignmentViewProps> = ({
  assignmentId,
  onBack,
}) => {
  const {
    currentUser,
    assignments,
    assignmentSubmissions,
    submitAssignment,
    setCurrentView,
    addToast,
    theme,
  } = useApp();

  const isLight = theme === 'light';

  // Find assignment
  const currentAssignment =
    assignments.find((a) => a.id === assignmentId) ||
    assignments[0];

  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // States
  const [hasStartedAssignment, setHasStartedAssignment] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  
  // Security & Violations
  const [violationsCount, setViolationsCount] = useState<number>(0);
  const [showViolationModal, setShowViolationModal] = useState<boolean>(false);
  const [lastViolationReason, setLastViolationReason] = useState<string>('');
  const [isCancelledDueToViolation, setIsCancelledDueToViolation] = useState<boolean>(false);

  // Ergonomics & Accessibility
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [assignmentTheme, setAssignmentTheme] = useState<'system' | 'light' | 'dark' | 'sepia' | 'contrast'>('system');
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [questionColorTags, setQuestionColorTags] = useState<Record<string, ColorHighlight>>({});
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [scratchpadText, setScratchpadText] = useState('');
  const [isAmbientFocusActive, setIsAmbientFocusActive] = useState(false);

  // Concept Sheet State
  const [isConceptSheetOpen, setIsConceptSheetOpen] = useState(false);
  const [conceptSheetSearch, setConceptSheetSearch] = useState('');
  const [activeConceptTab, setActiveConceptTab] = useState<'all' | 'laws' | 'rules' | 'notes' | 'tips'>('all');
  const [showQuestionHintModal, setShowQuestionHintModal] = useState<boolean>(false);

  // Timer & Submission
  const initialDurationSeconds = (currentAssignment?.durationMinutes || 30) * 60;
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(initialDurationSeconds);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);

  // Reattempt grants and attempt limit calculation
  const studentPreviousSubmissions = (assignmentSubmissions || []).filter(
    (s) => s.assignmentId === currentAssignment?.id && s.studentId === currentUser?.id
  );
  const reattemptGrantKey = `sea_grant_assignment_${currentAssignment?.id}_${currentUser?.id || 'guest'}`;
  const grantedExtraAttempts = Number(localStorage.getItem(reattemptGrantKey) || '0');
  const maxAllowedAttempts = (currentAssignment?.maxAttempts || 3) + grantedExtraAttempts;
  const usedAttemptsCount = studentPreviousSubmissions.length;
  const isAttemptsExhausted = usedAttemptsCount >= maxAllowedAttempts;

  // Persistent Timer Key
  const timerStorageKey = `sea_assignment_timer_deadline_${currentAssignment?.id || 'unknown'}_${currentUser?.id || 'guest'}`;

  // -------------------------------------------------------------
  // PERSISTENT REAL-TIME TIMER SYNCHRONIZATION
  // -------------------------------------------------------------
  useEffect(() => {
    if (!hasStartedAssignment || isSubmitted || isCancelledDueToViolation || !currentAssignment) return;

    let deadlineMs = 0;
    const stored = localStorage.getItem(timerStorageKey);
    const now = Date.now();

    if (stored) {
      deadlineMs = parseInt(stored, 10);
      if (isNaN(deadlineMs) || deadlineMs < now) {
        // Expired
        setTimeRemainingSeconds(0);
        handleAutoSubmit();
        return;
      }
    } else {
      deadlineMs = now + initialDurationSeconds * 1000;
      localStorage.setItem(timerStorageKey, deadlineMs.toString());
    }

    const updateTimer = () => {
      const remainingMs = deadlineMs - Date.now();
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
      setTimeRemainingSeconds(remainingSec);

      if (remainingSec <= 0) {
        localStorage.removeItem(timerStorageKey);
        handleAutoSubmit();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [hasStartedAssignment, isSubmitted, isCancelledDueToViolation, currentAssignment]);

  // -------------------------------------------------------------
  // FULLSCREEN & ANTI-CHEAT SECURITY MEASURES
  // -------------------------------------------------------------
  const enterStrictFullscreen = async () => {
    try {
      const el = containerRef.current || document.documentElement;
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) await el.requestFullscreen();
        // @ts-ignore
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
        // @ts-ignore
        else if (el.msRequestFullscreen) await el.msRequestFullscreen();
      }
    } catch {
      // Browser permissions fallback
    }
  };

  const handleSecurityViolation = (reason: string) => {
    if (isSubmitted || isCancelledDueToViolation || !hasStartedAssignment) return;

    setLastViolationReason(reason);
    const nextCount = violationsCount + 1;
    setViolationsCount(nextCount);

    const maxAllowed = 2; // Strict default for assignments
    if (nextCount > maxAllowed) {
      setIsCancelledDueToViolation(true);
      setShowViolationModal(false);
      localStorage.removeItem(timerStorageKey);
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch {}
      }
      addToast('تم إغلاق الواجب ورصد مخالفة أمنية متكررة.', 'error');
    } else {
      setShowViolationModal(true);
    }
  };

  useEffect(() => {
    if (!hasStartedAssignment || isSubmitted || isCancelledDueToViolation) return;

    const cleanupProtection = initScreenRecordingProtection();
    const unsubscribeProtection = subscribeToScreenProtection((status) => {
      if (status.isRecordingDetected) {
        handleSecurityViolation(status.reason || 'محاولة تشغيل مسجل شاشة أو برنامج بث');
      } else if (status.isDevToolsOpen) {
        handleSecurityViolation('فتح أدوات تطوير المتصفح (DevTools)');
      }
    });

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleSecurityViolation('مغادرة صفحة الواجب أو فتح تبويب آخر');
      }
    };

    const handleWindowBlur = () => {
      handleSecurityViolation('فقدان تركيز نافذة الواجب أو الانتقال لتطبيق خارجي');
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasStartedAssignment && !isSubmitted && !isCancelledDueToViolation) {
        handleSecurityViolation('الخروج من وضع ملء الشاشة الكامل');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      addToast('النقر الأيمن محظور في بيئة الواجبات الآمنة', 'warning');
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'p' || e.key === 'u' || e.key === 's')) ||
        (e.metaKey && (e.key === 'c' || e.key === 'v' || e.key === 'p' || e.key === 's'))
      ) {
        e.preventDefault();
        addToast('الاختصارات ونسخ النصوص محظورة', 'warning');
        return false;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubscribeProtection();
      cleanupProtection();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasStartedAssignment, isSubmitted, isCancelledDueToViolation, violationsCount]);

  // -------------------------------------------------------------
  // AMBIENT FOCUS AUDIO GENERATOR (ALPHA WAVE FOCUS)
  // -------------------------------------------------------------
  const toggleAmbientFocus = () => {
    if (isAmbientFocusActive) {
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch {}
        audioCtxRef.current = null;
      }
      setIsAmbientFocusActive(false);
      addToast('تم إيقاف صوت التركيز', 'info');
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        // Create relaxing pink/brown noise
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start(0);
        setIsAmbientFocusActive(true);
        addToast('تم تشغيل صوت التركيز الذهني الهادئ 🎧', 'success');
      } catch {
        addToast('تعذر تشغيل الصوت في المتصفح', 'error');
      }
    }
  };

  // -------------------------------------------------------------
  // CONCEPT SHEET DEFINITIONS
  // -------------------------------------------------------------
  const conceptItems = useMemo(() => {
    const items: Array<{
      id: string;
      category: 'laws' | 'rules' | 'notes' | 'tips';
      categoryLabel: string;
      title: string;
      formula?: string;
      details: string;
      badge?: string;
    }> = [];

    const subj = (currentAssignment?.subject || '').toLowerCase();

    // Subject Specific Concept Cards
    if (subj.includes('رياض') || subj.includes('math') || subj.includes('هندس') || subj.includes('جبر') || subj.includes('تفاضل')) {
      items.push(
        {
          id: 'm-1',
          category: 'laws',
          categoryLabel: 'قوانين ومعادلات',
          title: 'قانون المميز والمعادلة التربيعية',
          formula: 'x = (-b ± √(b² - 4ac)) / (2a)',
          details: 'Δ = b² - 4ac يحدد طبيعة الجذور: موجب (جذران حقيقيان)، صفر (جذر مكرر)، سالب (جذران مركبان).',
          badge: 'جبر'
        },
        {
          id: 'm-2',
          category: 'laws',
          categoryLabel: 'قوانين ومعادلات',
          title: 'المتطابقات المثلثية الأساسية',
          formula: 'sin²(θ) + cos²(θ) = 1 | 1 + tan²(θ) = sec²(θ)',
          details: 'sin(2θ) = 2 sin(θ) cos(θ) | cos(2θ) = cos²(θ) - sin²(θ).',
          badge: 'حساب مثلثات'
        },
        {
          id: 'm-3',
          category: 'laws',
          categoryLabel: 'قوانين ومعادلات',
          title: 'قواعد الاشتقاق وسلسلة التفاضل',
          formula: 'd/dx [u·v] = u\'v + uv\' | d/dx [u/v] = (u\'v - uv\') / v²',
          details: 'تفاضل القوس المركب: n·[g(x)]ⁿ⁻¹ · g\'(x).',
          badge: 'تفاضل وتكامل'
        }
      );
    } else if (subj.includes('فيز') || subj.includes('physic')) {
      items.push(
        {
          id: 'p-1',
          category: 'laws',
          categoryLabel: 'قوانين ومعادلات',
          title: 'معادلات الحركة بتسارع منتظم',
          formula: 'v = v₀ + at | d = v₀t + ½at² | v² = v₀² + 2ad',
          details: 'في السقوط الحر يتم التعويض بعجلة الجاذبية الأرضية g ≈ 9.8 م/ث².',
          badge: 'ميكانيكا'
        },
        {
          id: 'p-2',
          category: 'laws',
          categoryLabel: 'قوانين ومعادلات',
          title: 'قانون أوم والقدرة المستهلكة',
          formula: 'V = I · R | P = V · I = I² · R',
          details: 'في التوالي: التيار ثابت وفروق الجهد تجمع. في التوازي: الجهد ثابت والتيارات تجمع.',
          badge: 'كهربية'
        }
      );
    } else if (subj.includes('عرب') || subj.includes('arabic') || subj.includes('لغة')) {
      items.push(
        {
          id: 'a-1',
          category: 'rules',
          categoryLabel: 'قواعد وملاحظات',
          title: 'علامات الإعراب الأصلية والفرعية',
          formula: 'الرفع: الضمة / الألف والواو | النصب: الفتحة / الياء والكسرة والألف',
          details: 'الجر: الكسرة / الياء والفتحة في الممنوع من الصرف.',
          badge: 'نحو'
        },
        {
          id: 'a-2',
          category: 'rules',
          categoryLabel: 'قواعد وملاحظات',
          title: 'كان وأخواتها وإن وأخواتها',
          formula: 'كان (ترفع المبتدأ وتنصب الخبر) | إنّ (تنصب المبتدأ وترفع الخبر)',
          details: 'كاد وأخواتها تشترط أن يكون خبرها جملة فعلية مضارعة.',
          badge: 'نواسخ'
        }
      );
    }

    // Default concept sheet text provided by teacher
    if (currentAssignment?.conceptSheetContent) {
      items.push({
        id: 'teacher-sheet',
        category: 'notes',
        categoryLabel: 'ملاحظات المعلم',
        title: currentAssignment.conceptSheetTitle || 'ورقة المعلم الإرشادية',
        details: currentAssignment.conceptSheetContent,
        badge: 'مخصص للواجب 📌'
      });
    }

    // Universal tips
    items.push(
      {
        id: 'tip-1',
        category: 'tips',
        categoryLabel: 'استراتيجيات الحل',
        title: 'استراتيجية الاستبعاد الذكي',
        details: 'استبعد الخيارات غير المنطقية أولاً، وركز على المفاضلة الدقيقة بين الإجابات المتقاربة.',
        badge: 'إرشاد ذكي ⚡'
      },
      {
        id: 'tip-2',
        category: 'tips',
        categoryLabel: 'استراتيجيات الحل',
        title: 'مراجعة الوحدات والأرقام',
        details: 'تأكد من مطابقة وحدات القياس قبل الحساب النهائي، واستخدم المسودة لتسجيل الخطوات.',
        badge: 'دقة حسابية 🎯'
      }
    );

    return items;
  }, [currentAssignment]);

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
  // ACTIONS & HANDLERS
  // -------------------------------------------------------------
  const handleAutoSubmit = () => {
    addToast('انتهى وقت الواجب! تم التسليم تلقائياً.', 'info');
    executeFinalSubmit();
  };

  const executeFinalSubmit = () => {
    if (!currentAssignment || !currentUser) return;

    localStorage.removeItem(timerStorageKey);
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch {}
      audioCtxRef.current = null;
      setIsAmbientFocusActive(false);
    }

    setShowSubmitConfirmModal(false);

    const submission = submitAssignment(
      currentAssignment.id,
      currentUser.id,
      userAnswers,
      initialDurationSeconds - timeRemainingSeconds,
      true
    );
    setSubmissionResult(submission);
    setIsSubmitted(true);
    addToast('تم تسليم الواجب ورصد الدرجة بنجاح!', 'success');
  };

  const toggleFlag = (qId: string) => {
    setFlaggedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const setQuestionColor = (qId: string, color: ColorHighlight) => {
    setQuestionColorTags((prev) => ({
      ...prev,
      [qId]: prev[qId] === color ? 'none' : color,
    }));
  };

  // Helper theme classes
  const getThemeClass = () => {
    if (assignmentTheme === 'light') return 'bg-[#f8fafc] text-slate-900';
    if (assignmentTheme === 'dark') return 'bg-[#0f172a] text-slate-100';
    if (assignmentTheme === 'sepia') return 'bg-[#fbf0d9] text-[#433422]';
    if (assignmentTheme === 'contrast') return 'bg-black text-yellow-300';
    return isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-slate-950 text-slate-100';
  };

  const getCardThemeClass = () => {
    if (assignmentTheme === 'light') return 'bg-white border-slate-200 text-slate-900';
    if (assignmentTheme === 'dark') return 'bg-[#1e293b] border-slate-700 text-slate-100';
    if (assignmentTheme === 'sepia') return 'bg-[#f4e4c1] border-[#d8c39d] text-[#433422]';
    if (assignmentTheme === 'contrast') return 'bg-black border-2 border-yellow-400 text-yellow-300';
    return isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white';
  };

  const getFontSizeClass = () => {
    if (fontSize === 'sm') return 'text-sm sm:text-base';
    if (fontSize === 'lg') return 'text-xl sm:text-2xl';
    if (fontSize === 'xl') return 'text-2xl sm:text-3xl';
    return 'text-base sm:text-lg';
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentAssignment) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h2 className="text-xl font-bold">لم يتم العثور على التكليف</h2>
        <button onClick={onBack} className="px-6 py-2 rounded-xl bg-cyan-500 text-white font-bold cursor-pointer">
          عودة
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 1: PRE-START SCREEN & STRICT SECURITY INSTRUCTIONS
  // -------------------------------------------------------------
  if (!hasStartedAssignment && !isSubmitted && !isCancelledDueToViolation) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8 px-4 text-right select-none" dir="rtl">
        <div className="p-6 sm:p-10 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-2xl space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white">{currentAssignment.title}</h1>
                <p className="text-xs text-slate-400">{currentAssignment.subject} • تكليف دراسي رسمي</p>
              </div>
            </div>
            <span className="px-3.5 py-1 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              بيئة واجبات مؤمّنة
            </span>
          </div>

          {/* Attempt Status */}
          {isAttemptsExhausted ? (
            <div className="p-6 rounded-2xl bg-rose-950/40 border-2 border-rose-500 text-rose-200 text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
              <h3 className="text-lg font-black text-white">استنفدت جميع المحاولات المسموحة لهذا الواجب</h3>
              <p className="text-xs text-rose-300">
                لقد قمت بإجراء ({usedAttemptsCount}) محاولة من أصل ({maxAllowedAttempts}) محاولات مسموحة.
              </p>
              <button
                onClick={onBack}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                العودة للكورس
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">
                  {usedAttemptsCount + 1}
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold">حالة محاولات الواجب:</span>
                  <span className="text-sm font-black text-white">
                    أنت بصدد بدء المحاولة رقم ({usedAttemptsCount + 1}) من إجمالي ({maxAllowedAttempts}) محاولات.
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {maxAllowedAttempts - usedAttemptsCount} محاولات متبقية
              </span>
            </div>
          )}

          {/* Parameters Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <Timer className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
              <span className="block text-[11px] text-slate-400">المدة الزمنية</span>
              <span className="text-sm font-black text-white">{currentAssignment.durationMinutes || 30} دقيقة</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <FileText className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
              <span className="block text-[11px] text-slate-400">عدد الأسئلة</span>
              <span className="text-sm font-black text-white">{currentAssignment.questions.length} سؤال</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <Lightbulb className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
              <span className="block text-[11px] text-slate-400">ورقة المفاهيم</span>
              <span className="text-xs font-black text-amber-400">متاحة ومحدثة 💡</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <ShieldAlert className="w-5 h-5 text-rose-400 mx-auto mb-1.5" />
              <span className="block text-[11px] text-slate-400">الحماية والمراقبة</span>
              <span className="text-xs font-black text-rose-400">تأمين كامل ومؤقت حقيقي</span>
            </div>
          </div>

          {/* Security & Strict Rules Notice */}
          <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
            <h3 className="text-sm font-black text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>تعليمات وضوابط أداء الواجب:</span>
            </h3>
            <ul className="text-xs text-rose-200/90 space-y-2 leading-relaxed pr-4 list-disc">
              <li>
                <strong className="text-white">المؤقت التراكمي الحقيقي:</strong> يبدأ المؤقت فور الدخول ويستمر حتى لو خرجت من الصفحة؛ عُد قبل انتهاء الوقت لتسليم الإجابات.
              </li>
              <li>
                <strong className="text-white">حظر مغادرة الشاشة:</strong> أي خروج من النافذة أو تبديل التبويبات سيتم رصده وقد يؤدي لقفل الواجب واحتساب صفر.
              </li>
              <li>
                <strong className="text-white">أدوات مساعدة مدمجة:</strong> تتوفر ورقة المفاهيم، تلوين الأسئلة، تكبير الخط، والمسودة الإلكترونية في الشريط العلوي.
              </li>
            </ul>
          </div>

          {!isAttemptsExhausted && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={async () => {
                  await enterStrictFullscreen();
                  setHasStartedAssignment(true);
                }}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-base shadow-xl shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-3 transform hover:scale-[1.02]"
              >
                <Maximize2 className="w-5 h-5" />
                <span>دخول بيئة الواجب وبدء المحاولة ({usedAttemptsCount + 1}) الآن</span>
              </button>
              <button
                onClick={onBack}
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
  // VIEW 2: CANCELLATION SCREEN (ON REPEATED VIOLATION)
  // -------------------------------------------------------------
  if (isCancelledDueToViolation) {
    return (
      <div className="w-full max-w-4xl mx-auto py-10 px-4 text-right select-none" dir="rtl">
        <div className="p-8 sm:p-12 rounded-3xl bg-rose-950/40 border-2 border-rose-600 text-white space-y-6 shadow-2xl text-center">
          <div className="w-20 h-20 rounded-3xl bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center text-rose-500 mx-auto shadow-2xl animate-pulse">
            <ShieldAlert className="w-12 h-12" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-rose-400">
              تم إغلاق الواجب وإلغاؤه لأسباب أمنية!
            </h2>
            <p className="text-sm sm:text-base text-rose-200 max-w-xl mx-auto leading-relaxed">
              رصد نظام المراقبة تجاوز الحد الأقصى للمخالفات الأمنية ({lastViolationReason}). تم قفل المحاولة وإلغاؤها.
            </p>
          </div>
          <div className="pt-4 flex justify-center">
            <button
              onClick={onBack}
              className="px-8 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm cursor-pointer"
            >
              العودة للمنصة والكورس
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: ACTIVE ASSIGNMENT / REVIEW RESULTS
  // -------------------------------------------------------------
  const inActiveSession = hasStartedAssignment && !isSubmitted && !isCancelledDueToViolation;
  const currentQuestion = currentAssignment.questions[currentQuestionIndex];
  const isEn = isEnglishText(currentQuestion?.prompt, currentAssignment.subject);
  const totalQuestions = currentAssignment.questions.length;
  const answeredCount = Object.keys(userAnswers).filter(
    (k) => userAnswers[k] !== undefined && userAnswers[k] !== ''
  ).length;

  return (
    <div
      ref={containerRef}
      dir="rtl"
      className={`${
        inActiveSession
          ? 'fixed inset-0 z-[99999] w-screen h-screen overflow-y-auto overscroll-none touch-pan-y p-3 sm:p-6'
          : 'w-full max-w-6xl mx-auto p-2 sm:p-4 rounded-3xl'
      } space-y-5 text-right transition-colors duration-300 relative ${getThemeClass()} select-none`}
    >
      {/* Background Anti-Leak Watermark */}
      {inActiveSession && <AntiLeakWatermark mode="document" />}

      {/* Concept & Formula Sheet Modal */}
      {isConceptSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in text-right">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-indigo-500/10 dark:from-slate-950 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    ورقة المفاهيم والمعادلات المعتمدة 💡
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    مرجع شامل لكافة القوانين والقواعد الذهبية لمساعدتك في حل الواجب.
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

            {/* Filter toolbar */}
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

            {/* Concept cards body */}
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
                            addToast('تم نسخ المعادلة بنجاح', 'info');
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
              <span>ورقة المفاهيم متاحة للاسترشاد أثناء حل الواجب.</span>
              <button
                type="button"
                onClick={() => setIsConceptSheetOpen(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
              >
                العودة للواجب
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Violation Modal */}
      {showViolationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-amber-500 text-white text-center space-y-6 shadow-2xl animate-scaleUp">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-amber-400">إنذار أمني في بيئة الواجبات!</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                تم رصد: <span className="text-amber-300 font-bold">{lastViolationReason}</span>.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-xs text-amber-200">
                المخالفة رقم <strong>{violationsCount}</strong> من أصل <strong>2</strong> مسموحة. تكرار المخالفة سيؤدي لإلغاء الواجب فوراً.
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

      {/* Submit Confirmation Modal */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-700 text-white space-y-6 shadow-2xl text-right">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black">مراجعة وتأكيد تسليم الواجب</h3>
                <p className="text-xs text-slate-400">تأكد من إجابتك على كافة الأسئلة قبل التسليم النهائي</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <span className="block text-xs font-bold text-emerald-400">الأسئلة المجابة</span>
                <span className="text-2xl font-black text-emerald-300">
                  {answeredCount} / {totalQuestions}
                </span>
              </div>
              <div
                className={`p-4 rounded-2xl text-center border ${
                  totalQuestions - answeredCount > 0
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <span className="block text-xs font-bold">المتبقي بدون إجابة</span>
                <span className="text-2xl font-black">{totalQuestions - answeredCount}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitConfirmModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                متابعة الحل
              </button>
              <button
                type="button"
                onClick={executeFinalSubmit}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black cursor-pointer shadow-lg"
              >
                تأكيد التسليم الآن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Hint & Concept Popover Modal */}
      {showQuestionHintModal && currentQuestion && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-right">
          <div className="max-w-xl w-full p-6 sm:p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-amber-500/30 text-slate-900 dark:text-white space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    تلميح ومفاهيم السؤال رقم ({currentQuestionIndex + 1}) 💡
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    مستخرج من ورقة المفاهيم والمعادلات المعتمدة للمادة
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuestionHintModal(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>نصائح وملاحظات مفتاحية لحل هذا السؤال:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-semibold">
                {currentQuestion.explanation ||
                  currentQuestion.hint ||
                  `استحضر قوانين ${currentAssignment.subject} ذات الصلة. انتبه إلى صياغة السؤال واستبعد الإجابات غير المنطقية.`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/50 space-y-2">
              <span className="text-xs font-black text-cyan-700 dark:text-cyan-300 block">
                هل تحتاج للورقة الشاملة؟
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                يمكنك الاطلاع على كافة المعادلات والقوانين العامة بفتح ورقة المفاهيم الكاملة من الشريط العلوي.
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowQuestionHintModal(false);
                  setIsConceptSheetOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>فتح ورقة المفاهيم الكاملة 📖</span>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowQuestionHintModal(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-xs cursor-pointer"
              >
                فهمت، متابعة الحل 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Scratchpad Modal */}
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
              <span>المسودة مؤقتة ولا تؤثر على درجات الواجب</span>
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
      <div className={`p-4 sm:p-5 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl ${getCardThemeClass()}`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 inline-flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-cyan-500" />
              {currentAssignment.title}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              بيئة واجبات مقفلة
            </span>
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

        {/* Toolbar Controls */}
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
                  onClick={() => setAssignmentTheme('dark')}
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    assignmentTheme === 'dark' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="وضع نهاري"
                  onClick={() => setAssignmentTheme('light')}
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    assignmentTheme === 'light' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="وضع القراءة الهادئ"
                  onClick={() => setAssignmentTheme('sepia')}
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    assignmentTheme === 'sepia' ? 'bg-[#ebd7b2] text-[#433422]' : 'text-slate-400'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="وضع التباين العالي"
                  onClick={() => setAssignmentTheme('contrast')}
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    assignmentTheme === 'contrast' ? 'bg-yellow-400 text-black font-black' : 'text-slate-400'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Concept Sheet Trigger */}
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

              {/* Fullscreen Toggle */}
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
                  timeRemainingSeconds < 180
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-cyan-600 dark:text-cyan-400'
                }`}
              >
                <Timer className="w-4 h-4 text-cyan-500" />
                <span>{formatTime(timeRemainingSeconds)}</span>
              </div>

              {/* Finish Button */}
              <button
                onClick={() => setShowSubmitConfirmModal(true)}
                className="px-4 sm:px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تسليم الواجب</span>
              </button>
            </>
          )}

          {isSubmitted && (
            <button
              onClick={onBack}
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

      {/* MAIN WORKSPACE: QUESTIONS VS RESULTS */}
      {!isSubmitted ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Main Question Card (3 cols) */}
          <div className="lg:col-span-3 space-y-5">
            {currentQuestion && (
              <div className={`p-5 sm:p-8 rounded-3xl border space-y-6 shadow-xl relative overflow-hidden ${getCardThemeClass()}`}>
                
                {/* Question Top Bar */}
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

                  {/* Highlighter, Concept Hint, and Bookmark */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Dedicated Question Concept Sheet Hint Button */}
                    <button
                      type="button"
                      onClick={() => setShowQuestionHintModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 text-xs font-black hover:bg-amber-500/30 transition-all cursor-pointer shadow-sm"
                      title="فتح مفاهيم وتلميح هذا السؤال تحديداً"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span>تلميح ومفاهيم السؤال 💡</span>
                    </button>

                    {/* Highlighter Palette */}
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

                    {/* Bookmark */}
                    <button
                      type="button"
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

                {/* Prompt Text with Font Scaler and Highlights */}
                <div
                  dir={isEn ? 'ltr' : 'rtl'}
                  className={`p-4 rounded-2xl border font-black leading-relaxed ${
                    questionColorTags[currentQuestion.id] === 'amber'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-200'
                      : questionColorTags[currentQuestion.id] === 'emerald'
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                      : questionColorTags[currentQuestion.id] === 'cyan'
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-900 dark:text-cyan-200'
                      : questionColorTags[currentQuestion.id] === 'rose'
                      ? 'bg-rose-500/10 border-rose-500/40 text-rose-900 dark:text-rose-200'
                      : questionColorTags[currentQuestion.id] === 'purple'
                      ? 'bg-purple-500/10 border-purple-500/40 text-purple-900 dark:text-purple-200'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
                  } ${getFontSizeClass()}`}
                >
                  {currentQuestion.prompt}
                </div>

                {/* Question Image if present */}
                {currentQuestion.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-80 flex items-center justify-center bg-black/5 dark:bg-black/40">
                    <img
                      src={currentQuestion.imageUrl}
                      alt="Question attachment"
                      className="max-h-80 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Options / Answer Input */}
                <div className="space-y-3" dir={isEn ? 'ltr' : 'rtl'}>
                  {currentQuestion.type === 'mcq' &&
                    currentQuestion.options?.map((opt, idx) => {
                      const isSelected = userAnswers[currentQuestion.id] === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setUserAnswers((prev) => ({
                              ...prev,
                              [currentQuestion.id]: idx,
                            }))
                          }
                          className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 text-right cursor-pointer ${
                            isSelected
                              ? 'border-cyan-500 bg-cyan-500/10 shadow-md shadow-cyan-500/10'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 border ${
                                isSelected
                                  ? 'bg-cyan-500 text-white border-cyan-400'
                                  : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-300 dark:border-slate-700'
                              }`}
                            >
                              {getOptionPrefix(idx, isEn)}
                            </span>
                            <span className={`font-bold ${getFontSizeClass()}`}>{opt}</span>
                          </div>
                          {isSelected && <Check className="w-5 h-5 text-cyan-500 shrink-0" />}
                        </button>
                      );
                    })}

                  {currentQuestion.type === 'true_false' && (
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { val: true, label: 'صحيح (True)' },
                        { val: false, label: 'خطأ (False)' },
                      ].map((item) => {
                        const isSelected = userAnswers[currentQuestion.id] === item.val;
                        return (
                          <button
                            key={String(item.val)}
                            type="button"
                            onClick={() =>
                              setUserAnswers((prev) => ({
                                ...prev,
                                [currentQuestion.id]: item.val,
                              }))
                            }
                            className={`p-5 rounded-2xl border-2 font-black text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'border-cyan-500 bg-cyan-500/10 shadow-md'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {(currentQuestion.type === 'short_answer' || currentQuestion.type === 'essay') && (
                    <textarea
                      rows={6}
                      value={userAnswers[currentQuestion.id] || ''}
                      onChange={(e) =>
                        setUserAnswers((prev) => ({
                          ...prev,
                          [currentQuestion.id]: e.target.value,
                        }))
                      }
                      placeholder="اكتب إجابتك هنا بوضوح..."
                      className={`w-full p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 focus:border-cyan-500 focus:outline-none leading-relaxed ${getFontSizeClass()}`}
                    />
                  )}
                </div>

                {/* Question Navigation Controls */}
                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-5">
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>السابق</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {currentQuestionIndex < totalQuestions - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                        className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer hover:opacity-90"
                      >
                        <span>التالي</span>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowSubmitConfirmModal(true)}
                        className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تسليم الواجب الآن</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Side Question Map (1 Col) */}
          <div className="space-y-4">
            <div className={`p-5 rounded-3xl border shadow-xl space-y-4 ${getCardThemeClass()}`}>
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-xs font-black flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-500" />
                  <span>خريطة أسئلة الواجب</span>
                </h3>
                <span className="text-[11px] font-bold text-slate-400">
                  {answeredCount} / {totalQuestions}
                </span>
              </div>

              {/* Matrix of Question Numbers */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {currentAssignment.questions.map((q, idx) => {
                  const isAns = userAnswers[q.id] !== undefined && userAnswers[q.id] !== '';
                  const isFlag = flaggedQuestions[q.id];
                  const isCur = idx === currentQuestionIndex;
                  const colTag = questionColorTags[q.id];

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-11 rounded-2xl font-black text-xs relative flex items-center justify-center transition-all cursor-pointer border ${
                        isCur
                          ? 'ring-2 ring-cyan-500 scale-105 shadow-md'
                          : ''
                      } ${
                        isAns
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                          : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>{idx + 1}</span>

                      {/* Flag indicator */}
                      {isFlag && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full ring-2 ring-slate-900 flex items-center justify-center text-[8px] text-black">
                          🚩
                        </span>
                      )}

                      {/* Color Tag dot */}
                      {colTag && colTag !== 'none' && (
                        <span
                          className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${
                            colTag === 'amber'
                              ? 'bg-amber-400'
                              : colTag === 'emerald'
                              ? 'bg-emerald-400'
                              : colTag === 'cyan'
                              ? 'bg-cyan-400'
                              : colTag === 'rose'
                              ? 'bg-rose-400'
                              : 'bg-purple-400'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-md bg-emerald-500/30 border border-emerald-500" />
                  <span>تمت الإجابة</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-md bg-slate-200 dark:bg-slate-800" />
                  <span>غير مجاب</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🚩</span>
                  <span>معلم للمراجعة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className={`p-8 sm:p-12 rounded-3xl border shadow-xl text-center space-y-6 ${getCardThemeClass()}`}>
          <div className="w-24 h-24 mx-auto bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
            <Award className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-emerald-500">تم تسليم الواجب بنجاح!</h2>

          {currentAssignment.autoGrading && submissionResult ? (
            <div className="py-6 space-y-2">
              <div className="text-5xl font-black flex items-center justify-center gap-2">
                <span className={submissionResult.passed ? 'text-emerald-500' : 'text-rose-500'}>
                  {submissionResult.score}
                </span>
                <span className="text-2xl text-slate-400">/ {submissionResult.totalPoints}</span>
              </div>
              <p className="text-base font-bold text-slate-500">
                النسبة المئوية: %{Math.round(submissionResult.percentage)}
              </p>
            </div>
          ) : (
            <div className="py-4">
              <p className="text-sm sm:text-base font-bold text-slate-600 dark:text-slate-400">
                تم تسجيل إجاباتك بنجاح في سجل الطالب. سيقوم المعلم بمراجعة التكليف وتقييمه قريباً.
              </p>
            </div>
          )}

          <div className="pt-6 flex justify-center">
            <button
              onClick={onBack}
              className="px-8 py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black hover:scale-105 transition-transform cursor-pointer shadow-lg"
            >
              العودة للمنصة والكورس
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Award,
  Sparkles,
  HelpCircle,
  Eye,
  Check,
  X,
  Send,
  RefreshCw,
  Layers,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  Plus,
  Lock,
  Edit3,
  BookmarkPlus,
  Lightbulb,
  Headphones,
  Volume2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Assignment, Question } from '../../types';
import { isEnglishText, getOptionPrefix } from '../../utils/langUtils';
import { ConceptSheetModal } from '../common/ConceptSheetModal';

interface StudentAssignmentViewProps {
  assignmentId?: string;
  onBack?: () => void;
}

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
  } = useApp();

  // Find assignment
  const currentAssignment =
    assignments.find((a) => a.id === assignmentId) ||
    assignments[0];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(
    (currentAssignment?.durationMinutes || 30) * 60
  );
  const [isConceptSheetOpen, setIsConceptSheetOpen] = useState(false);
  const [hasOpenedConceptSheet, setHasOpenedConceptSheet] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [hasRequestedReattempt, setHasRequestedReattempt] = useState(false);

  // Reattempt grants and attempt limit calculation
  const studentPreviousSubmissions = (assignmentSubmissions || []).filter(
    (s) => s.assignmentId === currentAssignment?.id && s.studentId === currentUser?.id
  );
  const reattemptGrantKey = `sea_grant_assignment_${currentAssignment?.id}_${currentUser?.id || 'guest'}`;
  const grantedExtraAttempts = Number(localStorage.getItem(reattemptGrantKey) || '0');
  const maxAllowedAttempts = (currentAssignment?.maxAttempts || 3) + grantedExtraAttempts;
  const usedAttemptsCount = studentPreviousSubmissions.length;
  const isAttemptsExhausted = usedAttemptsCount >= maxAllowedAttempts;

  // Speech synthesizer for listening questions
  const playSpeechAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const isEn = isEnglishText(text, currentAssignment?.subject);
      utterance.lang = isEn ? 'en-US' : 'ar-SA';
      setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      addToast('متصفحك لا يدعم القارئ الصوتي التفاعلي', 'error');
    }
  };

  // Timer
  useEffect(() => {
    if (isSubmitted || !currentAssignment || isAttemptsExhausted) return;
    const interval = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitAssignment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, currentAssignment, isAttemptsExhausted]);

  if (!currentAssignment) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">الواجب غير موجود</h3>
        <button
          onClick={() => (onBack ? onBack() : setCurrentView('student_dashboard'))}
          className="mt-4 px-5 py-2 rounded-xl bg-cyan-600 text-white text-sm font-bold"
        >
          العودة للوحة الطالب
        </button>
      </div>
    );
  }

  // Handle request reattempt
  const handleRequestReattempt = () => {
    try {
      const requestKey = `sea_req_reattempt_assignment_${currentAssignment.id}_${currentUser?.id || 'guest'}`;
      localStorage.setItem(requestKey, JSON.stringify({
        studentId: currentUser?.id,
        studentName: currentUser?.name || 'طالب',
        assignmentId: currentAssignment.id,
        requestedAt: new Date().toISOString(),
      }));
      setHasRequestedReattempt(true);
      addToast('تم إرسال طلب إعادة المحاولة إلى المعلم بنجاح 📩', 'success');
    } catch {
      addToast('تعذر حفظ طلب إعادة المحاولة', 'error');
    }
  };

  const questions = currentAssignment.questions || [];
  const activeQuestion: Question | undefined = questions[currentQuestionIndex];

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleTextAnswer = (questionId: string, text: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  };

  const handleToggleBool = (questionId: string, val: boolean) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: val,
    }));
  };

  const handleOpenConceptSheet = () => {
    setIsConceptSheetOpen(true);
    setHasOpenedConceptSheet(true);
  };

  const handleSubmitAssignment = () => {
    if (isSubmitted) return;

    const result = submitAssignment(
      currentAssignment.id,
      userAnswers,
      hasOpenedConceptSheet
    );

    setSubmissionResult(result);
    setIsSubmitted(true);
  };

  // Format time
  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;

  // LTR language check for active question or assignment subject
  const isQuestionLtr = activeQuestion
    ? isEnglishText(activeQuestion.prompt, currentAssignment.subject)
    : false;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-6 px-3 sm:px-6 lg:px-8 animate-fade-in relative">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => (onBack ? onBack() : setCurrentView('student_dashboard'))}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="رجوع"
            >
              <ArrowRight className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[11px] font-black border border-teal-500/20">
                  كراسة واجبات تفاعلية 📓
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white line-clamp-1">
                  {currentAssignment.title}
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                المادة: {currentAssignment.subject || 'عام'} • إجمالي الدرجات: {currentAssignment.totalPoints}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* CONCEPT SHEET BUTTON */}
            {currentAssignment.allowConceptSheet !== false && (
              <button
                type="button"
                onClick={handleOpenConceptSheet}
                className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-black text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer animate-pulse"
                title="فتح ورقة المفاهيم والقواعد"
              >
                <FileText className="w-4 h-4 text-amber-500" />
                <span>ورقة المفاهيم والقوانين 📖</span>
              </button>
            )}

            {/* Timer */}
            {!isSubmitted && (
              <div className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                <Clock className="w-4 h-4 text-teal-500" />
                <span>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* POST-SUBMISSION RESULTS VIEW */}
        {isSubmitted && submissionResult ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-center animate-scale-up">
            <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-xl font-black text-3xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white">
              {submissionResult.passed ? '🎉' : '📚'}
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {submissionResult.passed ? 'أحسنت! تم اجتياز الواجب بنجاح' : 'تم تسليم الواجب - استمر في المراجعة'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                تم تصحيح إجاباتك إلكترونياً وحفظ النتيجة في سجل تقدمك الأكاديمي.
              </p>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block">الدرجة الكلية</span>
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
                  {submissionResult.score} / {submissionResult.totalPoints}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block">النسبة المئوية</span>
                <span className="text-xl font-black text-teal-600 dark:text-teal-400 font-mono mt-1 block">
                  {submissionResult.percentage}%
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block">الحالة</span>
                <span
                  className={`text-sm font-black mt-1 block ${
                    submissionResult.passed ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {submissionResult.passed ? 'ناجح ✓' : 'مراجعة مطلوب'}
                </span>
              </div>
            </div>

            {/* Action */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => (onBack ? onBack() : setCurrentView('student_dashboard'))}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-teal-600/20"
              >
                العودة للوحة الطالب
              </button>
            </div>
          </div>
        ) : isAttemptsExhausted ? (
          /* ATTEMPTS EXHAUSTED VIEW */
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-center animate-scale-up">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto shadow-lg text-3xl">
              ⚠️
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                استنفذت جميع المحاولات المتاحة لهذا الواجب
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                لقد قمت بتقديم الواجب <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{usedAttemptsCount}</span> من أصل <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">{maxAllowedAttempts}</span> محاولة مسموحة.
                إذا كنت ترغب في إعادة المحاولة، يُمكنك إرسال طلب للمعلم لفتح محاولة جديدة لك.
              </p>
            </div>

            {studentPreviousSubmissions.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 max-w-md mx-auto text-right space-y-2 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">سجل محاولاتك السابقة:</span>
                {studentPreviousSubmissions.map((sub, sIdx) => (
                  <div key={sub.id || sIdx} className="flex justify-between items-center py-1.5 border-b border-slate-200/60 dark:border-slate-700/60 last:border-0 font-mono">
                    <span>محاولة #{sIdx + 1} ({new Date(sub.submittedAt).toLocaleDateString('ar-EG')})</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">{sub.score} / {sub.totalPoints} ({sub.percentage}%)</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {!hasRequestedReattempt ? (
                <button
                  type="button"
                  onClick={handleRequestReattempt}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>طلب إذن إعادة المحاولة من المعلم 📩</span>
                </button>
              ) : (
                <div className="px-5 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>تم إرسال الطلب للمعلم. سيتصل بك المعلم أو يمنحك محاولة جديدة قريباً!</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => (onBack ? onBack() : setCurrentView('student_dashboard'))}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                العودة للوحة الطالب
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE SOLVING VIEW - SKETCHBOOK WORKBOOK STYLE (صفحة واحدة لكل سؤال) */
          <div className="space-y-6">
            {/* Notebook Thumbnails & Page Flip Selector */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-teal-500" />
                  <span>تقليب أوراق الكراسة (صفحة {currentQuestionIndex + 1} من {questions.length})</span>
                </span>
                <span className="text-teal-600 dark:text-teal-400 font-mono">
                  تم الإجابة: {Object.keys(userAnswers).length} / {questions.length}
                </span>
              </div>

              {/* Page Number Quick Selection Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
                {questions.map((q, idx) => {
                  const isCurrent = currentQuestionIndex === idx;
                  const isAnswered = userAnswers[q.id] !== undefined && userAnswers[q.id] !== '';
                  return (
                    <button
                      key={q.id || idx}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-9 min-w-[2.25rem] px-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center cursor-pointer shrink-0 border ${
                        isCurrent
                          ? 'bg-teal-600 text-white border-teal-500 shadow-md ring-2 ring-teal-500/30 scale-105'
                          : isAnswered
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-teal-500/50'
                      }`}
                    >
                      <span>صفحة {idx + 1}</span>
                      {isAnswered && !isCurrent && <span className="mr-1 text-[10px]">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* THE INTERACTIVE SKETCHBOOK PAGE (صفحة السؤال الورقية) */}
            {activeQuestion && (
              <div className="relative rounded-3xl bg-amber-50/40 dark:bg-slate-900/90 border-2 border-slate-300 dark:border-slate-800 shadow-2xl p-6 sm:p-10 space-y-6 transition-all duration-300 overflow-hidden min-h-[480px] flex flex-col justify-between">
                {/* Visual Ring-Binder holes effect at top or side */}
                <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 opacity-60" />
                
                {/* Page Corner Ribbon / Bookmark Tag */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 font-black text-xs">
                      سؤال رقم {currentQuestionIndex + 1}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs">
                      {activeQuestion.points || 1} {activeQuestion.points === 1 ? 'درجة' : 'درجات'}
                    </span>
                    {isQuestionLtr && (
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold">
                        LTR English
                      </span>
                    )}
                  </div>

                  {currentAssignment.allowConceptSheet && (
                    <button
                      type="button"
                      onClick={handleOpenConceptSheet}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                      <span>ورقة المفاهيم 📖</span>
                    </button>
                  )}
                </div>

                {/* QUESTION CONTENT CONTAINER WITH DIRECTION CONTROL */}
                <div 
                  className={`space-y-5 flex-1 ${
                    isQuestionLtr ? 'dir-ltr text-left' : 'dir-rtl text-right'
                  }`}
                  dir={isQuestionLtr ? 'ltr' : 'rtl'}
                >
                  {/* Question Passage if any */}
                  {activeQuestion.passageText && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm leading-relaxed font-serif">
                      <span className="text-xs font-bold text-teal-600 dark:text-teal-400 block mb-1">
                        {isQuestionLtr ? 'Reading Passage:' : 'القطعة الاسترشادية:'}
                      </span>
                      {activeQuestion.passageText}
                    </div>
                  )}

                  {/* Question Image if any */}
                  {activeQuestion.image && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-60">
                      <img src={activeQuestion.image} alt="Question Visual" className="w-full h-full object-contain" />
                    </div>
                  )}

                  {/* Question Prompt */}
                  <h3 className={`text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed ${
                    isQuestionLtr ? 'font-sans' : 'font-sans'
                  }`}>
                    {activeQuestion.prompt}
                  </h3>

                  {/* Optional Hint */}
                  {activeQuestion.hint && activeQuestion.allowHint !== false && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                      <span><strong>تلميح المعلم:</strong> {activeQuestion.hint}</span>
                    </div>
                  )}

                  {/* QUESTION ANSWER INPUT TYPES */}

                  {/* 1. MCQ */}
                  {activeQuestion.type === 'mcq' && activeQuestion.options && (
                    <div className="grid grid-cols-1 gap-3 pt-2">
                      {activeQuestion.options.map((opt, optIdx) => {
                        const isSelected = userAnswers[activeQuestion.id] === optIdx;
                        const optionPrefix = getOptionPrefix(optIdx, isQuestionLtr);
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectOption(activeQuestion.id, optIdx)}
                            className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-teal-500/15 border-teal-500 text-teal-950 dark:text-teal-200 ring-2 ring-teal-500/30 shadow-md'
                                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-teal-500/50'
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              <span
                                className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                                  isSelected
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {optionPrefix}
                              </span>
                              <span className="leading-snug">{opt}</span>
                            </div>
                            {isSelected && <Check className="w-5 h-5 text-teal-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 2. True / False */}
                  {activeQuestion.type === 'true_false' && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => handleToggleBool(activeQuestion.id, true)}
                        className={`p-5 rounded-2xl border font-bold text-sm transition-all cursor-pointer ${
                          userAnswers[activeQuestion.id] === true
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-200 shadow-md'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isQuestionLtr ? 'True ✓' : 'صحيح (True) ✓'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleBool(activeQuestion.id, false)}
                        className={`p-5 rounded-2xl border font-bold text-sm transition-all cursor-pointer ${
                          userAnswers[activeQuestion.id] === false
                            ? 'bg-rose-500/20 border-rose-500 text-rose-800 dark:text-rose-200 shadow-md'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isQuestionLtr ? 'False ✗' : 'خطأ (False) ✗'}
                      </button>
                    </div>
                  )}

                  {/* 3. Text inputs (fill_blank, short_answer, essay) */}
                  {(activeQuestion.type === 'fill_blank' ||
                    activeQuestion.type === 'short_answer' ||
                    activeQuestion.type === 'essay') && (
                    <div className="space-y-2 pt-2">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                        {isQuestionLtr ? 'Type your answer:' : 'اكتب إجابتك هنا:'}
                      </label>
                      {activeQuestion.type === 'essay' ? (
                        <textarea
                          rows={4}
                          value={userAnswers[activeQuestion.id] || ''}
                          onChange={(e) => handleTextAnswer(activeQuestion.id, e.target.value)}
                          placeholder={isQuestionLtr ? 'Type detailed answer here...' : 'اكتب إجابتك المقالية بالتفصيل...'}
                          className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500"
                        />
                      ) : (
                        <input
                          type="text"
                          value={userAnswers[activeQuestion.id] || ''}
                          onChange={(e) => handleTextAnswer(activeQuestion.id, e.target.value)}
                          placeholder={isQuestionLtr ? 'Type answer accurately...' : 'اكتب إجابتك هنا بدقة...'}
                          className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-teal-500 font-mono"
                        />
                      )}
                    </div>
                  )}

                  {/* 4. Matching */}
                  {activeQuestion.type === 'matching' && (
                    <div className="space-y-3 pt-2">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        {isQuestionLtr ? 'Match each term on the left with its definition:' : 'اختر المقابل الصحيح لكل عنصر من القائمة المنسدلة:'}
                      </p>
                      <div className="space-y-3">
                        {(activeQuestion.matchingPairs || []).map((pair, pIdx) => {
                          const currentVal = (userAnswers[activeQuestion.id] || {})[pair.left] || '';
                          return (
                            <div
                              key={pIdx}
                              className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <span className="text-sm font-black text-teal-600 dark:text-teal-400">{pair.left}</span>
                              <select
                                value={currentVal}
                                onChange={(e) => {
                                  const prevMatches = userAnswers[activeQuestion.id] || {};
                                  setUserAnswers((prev) => ({
                                    ...prev,
                                    [activeQuestion.id]: {
                                      ...prevMatches,
                                      [pair.left]: e.target.value,
                                    },
                                  }));
                                }}
                                className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:border-teal-500 focus:outline-none"
                              >
                                <option value="">-- {isQuestionLtr ? 'Select matching pair' : 'اختر التعريف المناسب'} --</option>
                                {(activeQuestion.matchingPairs || []).map((optP, optIdx) => (
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

                  {/* 5. Ordering */}
                  {activeQuestion.type === 'ordering' && (
                    <div className="space-y-3 pt-2">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        {isQuestionLtr ? 'Use arrows to arrange items in correct sequence:' : 'استخدم أزرار الأسهم لترتيب العناصر في السياق الصحيح:'}
                      </p>
                      <div className="space-y-2">
                        {((userAnswers[activeQuestion.id] as string[]) || activeQuestion.orderingItems || []).map(
                          (item, iIdx, arr) => (
                            <div
                              key={iIdx}
                              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-black flex items-center justify-center border border-teal-500/20 font-mono">
                                  {iIdx + 1}
                                </span>
                                <span className="font-bold text-sm">{item}</span>
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
                                    setUserAnswers((prev) => ({
                                      ...prev,
                                      [activeQuestion.id]: updated,
                                    }));
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs disabled:opacity-30 cursor-pointer font-bold"
                                >
                                  ↑ {isQuestionLtr ? 'Up' : 'أعلى'}
                                </button>
                                <button
                                  type="button"
                                  disabled={iIdx === arr.length - 1}
                                  onClick={() => {
                                    const updated = [...arr];
                                    const temp = updated[iIdx + 1];
                                    updated[iIdx + 1] = updated[iIdx];
                                    updated[iIdx] = temp;
                                    setUserAnswers((prev) => ({
                                      ...prev,
                                      [activeQuestion.id]: updated,
                                    }));
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs disabled:opacity-30 cursor-pointer font-bold"
                                >
                                  ↓ {isQuestionLtr ? 'Down' : 'أسفل'}
                                </button>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* 6. Listening / Audio */}
                  {activeQuestion.type === 'listening' && (
                    <div className="space-y-4 pt-2">
                      <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                            <Headphones className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-black">{isQuestionLtr ? 'Interactive Listening Track' : 'مقطع صوتي تفاعلي (Listening Audio)'}</p>
                            <p className="text-[11px] text-teal-600 dark:text-teal-300">{isQuestionLtr ? 'Listen to recording then answer:' : 'استمع للنص ثم أجب عن السؤال'}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => playSpeechAudio(activeQuestion.audioScript || activeQuestion.prompt)}
                          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                            isPlayingAudio
                              ? 'bg-rose-500 text-white animate-pulse'
                              : 'bg-teal-600 hover:bg-teal-500 text-white'
                          }`}
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>{isPlayingAudio ? (isQuestionLtr ? 'Playing...' : 'جارٍ التشغيل...') : (isQuestionLtr ? 'Listen Audio' : 'استمع للمقطع')}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {(activeQuestion.options || []).map((opt, oIdx) => {
                          const isSelected = userAnswers[activeQuestion.id] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => handleSelectOption(activeQuestion.id, oIdx)}
                              className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                                isSelected
                                  ? 'bg-teal-500/15 border-teal-500 font-bold text-teal-900 dark:text-teal-200'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <span>{opt}</span>
                              <div
                                className={`w-4 h-4 rounded-full border ${
                                  isSelected ? 'border-teal-500 bg-teal-500' : 'border-slate-300 dark:border-slate-700'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 7. Passage Sub-questions */}
                  {activeQuestion.type === 'passage' && (
                    <div className="space-y-4 pt-2">
                      {(activeQuestion.passageQuestions || []).map((subQ, sqIdx) => {
                        const subAns = (userAnswers[activeQuestion.id] || {})[subQ.id];
                        return (
                          <div
                            key={subQ.id}
                            className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3"
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
                                    type="button"
                                    onClick={() => {
                                      const prevSub = userAnswers[activeQuestion.id] || {};
                                      setUserAnswers((prev) => ({
                                        ...prev,
                                        [activeQuestion.id]: {
                                          ...prevSub,
                                          [subQ.id]: sOptIdx,
                                        },
                                      }));
                                    }}
                                    className={`p-2.5 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${
                                      isSubSelected
                                        ? 'bg-teal-500/15 border-teal-500 text-teal-900 dark:text-teal-200 font-bold'
                                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                                    }`}
                                  >
                                    <span>{sOpt}</span>
                                    <div
                                      className={`w-3.5 h-3.5 rounded-full border ${
                                        isSubSelected ? 'bg-teal-500 border-teal-500' : 'border-slate-300 dark:border-slate-700'
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
                  )}

                  {/* 8. Error Correction */}
                  {activeQuestion.type === 'error_correction' && (
                    <div className="space-y-4 pt-2">
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                        <span className="text-xs font-bold text-slate-500">{isQuestionLtr ? 'Sentence with error:' : 'الجملة المحتوية على الخطأ:'}</span>
                        <p className="text-base font-black font-mono text-rose-600 dark:text-rose-400">{activeQuestion.sentenceWithMistake}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                          {isQuestionLtr ? 'Type corrected substitute word or phrase:' : 'اكتب الكلمة أو العبارة البديلة المصححة بدقة:'}
                        </label>
                        <input
                          type="text"
                          placeholder={isQuestionLtr ? 'Type correction...' : 'اكتب التصحيح هنا...'}
                          value={userAnswers[activeQuestion.id] || ''}
                          onChange={(e) => handleTextAnswer(activeQuestion.id, e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-black focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* BOTTOM PAGE FLIP CONTROLS */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800/80 dir-rtl">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      currentQuestionIndex === 0
                        ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>الصفحة السابقة</span>
                  </button>

                  <div className="text-xs font-mono font-bold text-slate-500">
                    صفحة {currentQuestionIndex + 1} / {questions.length}
                  </div>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                      className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-teal-600/20 cursor-pointer"
                    >
                      <span>الصفحة التالية</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitAssignment}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>إنهاء وتسليم الواجب 🚀</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {/* CONCEPT SHEET MODAL */}
        <ConceptSheetModal
          isOpen={isConceptSheetOpen}
          onClose={() => setIsConceptSheetOpen(false)}
          title={currentAssignment.conceptSheetTitle || 'ورقة المفاهيم والقواعد الاسترشادية'}
          rawContent={currentAssignment.conceptSheetContent || 'لا توجد قواعد إضافية للواجب.'}
          subject={currentAssignment.subject}
          storageKey={`sea_student_concepts_${currentUser?.id || 'guest'}_${currentAssignment.id}`}
        />
      </div>
    </div>
  );
};


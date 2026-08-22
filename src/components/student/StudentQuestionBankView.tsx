import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  CheckCircle2,
  XCircle,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Award,
  Clock,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Lightbulb,
  Check,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BankQuestion, QuestionType } from '../../types';
import { AntiLeakWatermark } from '../AntiLeakWatermark';

interface StudentQuestionBankViewProps {
  onBack?: () => void;
}

export const StudentQuestionBankView: React.FC<StudentQuestionBankViewProps> = ({ onBack }) => {
  const { currentUser, courses, bankQuestions, addToast } = useApp();

  // Enrolled courses for this student
  const enrolledCourses = courses.filter(
    (c) =>
      currentUser?.enrolledCourseIds?.includes(c.id) ||
      c.enrolledStudents?.includes(currentUser?.id || '') ||
      c.isFree
  );

  // Available bank questions for student's enrolled courses or general
  const availableQuestions = bankQuestions.filter((q) => {
    if (!q.courseId) return true; // General subject questions
    return enrolledCourses.some((c) => c.id === q.courseId);
  });

  // State
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [practiceMode, setPracticeMode] = useState<'interactive' | 'timed'>('interactive');
  
  // Interactive Practice State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [scoreCount, setScoreCount] = useState({ correct: 0, wrong: 0 });

  // Filtered Questions List
  const filteredQuestions = availableQuestions.filter((q) => {
    if (selectedCourseId !== 'all' && q.courseId !== selectedCourseId) return false;
    if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    return true;
  });

  // Topics set
  const uniqueTopics = Array.from(
    new Set(
      availableQuestions
        .filter((q) => selectedCourseId === 'all' || q.courseId === selectedCourseId)
        .map((q) => q.topic)
    )
  ).filter(Boolean);

  const activeQuestion: BankQuestion | undefined = filteredQuestions[currentIndex];

  const handleCheckAnswer = () => {
    if (selectedAnswer === null || selectedAnswer === undefined) {
      addToast('warning', 'الرجاء اختيار إجابة أولاً للتحقق');
      return;
    }

    setIsAnswerChecked(true);
    let isCorrect = false;

    if (activeQuestion?.type === 'mcq' || (activeQuestion?.type as string) === 'multiple_choice' || !activeQuestion?.type) {
      isCorrect = Number(selectedAnswer) === activeQuestion?.correctOptionIndex;
    } else if (activeQuestion?.type === 'true_false') {
      isCorrect = Boolean(selectedAnswer) === activeQuestion?.correctBool;
    } else {
      isCorrect = true; // Sample text check
    }

    if (isCorrect) {
      setScoreCount((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setScoreCount((prev) => ({ ...prev, wrong: prev.wrong + 1 }));
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setShowHint(false);
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setShowHint(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleResetPractice = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setShowHint(false);
    setScoreCount({ correct: 0, wrong: 0 });
  };

  return (
    <div className="space-y-6 animate-fade-in text-right relative min-h-[500px]" dir="rtl" onContextMenu={(e) => e.preventDefault()}>
      <AntiLeakWatermark mode="general" />
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[32px] p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-white/10 shadow-2xl text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-black border border-cyan-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>بنك الأسئلة المعتمد والتدريبات الذكية</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              تدريبات وتطبيقات بنك الأسئلة
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              تصفح وحل الأسئلة المعتمدة الموضوعة بواسطة معلمي كورساتك، مع شرح وتفسير تفصيلي لكل إجابة.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto flex-1">
          {/* Course Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">تصفية بالكورس</label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSelectedTopic('all');
                setCurrentIndex(0);
                setIsAnswerChecked(false);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">جميع الكورسات المشترك بها ({enrolledCourses.length})</option>
              {enrolledCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">الموضوع / الوحدة</label>
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                setCurrentIndex(0);
                setIsAnswerChecked(false);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">جميع الموضوعات والوحدات</option>
              {uniqueTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">مستوى الصعوبة</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setCurrentIndex(0);
                setIsAnswerChecked(false);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">جميع المستويات</option>
              <option value="easy">سهل (مباشر)</option>
              <option value="medium">متوسط (تطبيقي)</option>
              <option value="hard">متقدم (عالي التفكير)</option>
            </select>
          </div>
        </div>

        {/* Counter Badge & Reset */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>متاح {filteredQuestions.length} سؤال للتدريب</span>
          </div>

          <button
            onClick={handleResetPractice}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            title="إعادة التعيين"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Question Display Box */}
      {filteredQuestions.length === 0 ? (
        <div className="p-12 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <HelpCircle className="w-14 h-14 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">لا توجد أسئلة متاحة مطابقة للتصفية</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            جرب اختيار كورس آخر أو إزالة تصفية الموضوعات لعرض كافة أسئلة المعلم.
          </p>
        </div>
      ) : activeQuestion ? (
        <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
          
          {/* Watermark Security Overlay */}
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center opacity-[0.03] select-none rotate-[-15deg]">
            <p className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-widest text-center">
              {currentUser?.name || 'STUDENT ACCESS'} • {currentUser?.studentCode || 'SECURE'}
            </p>
          </div>

          {/* Question Header Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-cyan-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                {currentIndex + 1}
              </span>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  سؤال {currentIndex + 1} من {filteredQuestions.length}
                </span>
                <p className="text-[11px] font-bold text-slate-400">
                  الموضوع: {activeQuestion.topic || 'تطبيق عام'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                  activeQuestion.difficulty === 'easy'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : activeQuestion.difficulty === 'medium'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}
              >
                المستوى: {activeQuestion.difficulty === 'easy' ? 'سهل' : activeQuestion.difficulty === 'medium' ? 'متوسط' : 'صعب'}
              </span>

              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                الدرجة: {activeQuestion.points || 1} نقطة
              </span>
            </div>
          </div>

          {/* Question Prompt */}
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-relaxed">
              {activeQuestion.prompt}
            </h3>

            {activeQuestion.image && (
              <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                <img src={activeQuestion.image} alt="Question Illustration" className="w-full object-contain" />
              </div>
            )}
          </div>

          {/* Options Display (Multiple Choice or True/False) */}
          {(activeQuestion.type === 'mcq' || (activeQuestion.type as string) === 'multiple_choice' || !activeQuestion.type) && activeQuestion.options && (
            <div className="grid grid-cols-1 gap-3 pt-2">
              {activeQuestion.options.map((opt, oIdx) => {
                const isSelected = selectedAnswer === oIdx;
                const isCorrectOption = oIdx === activeQuestion.correctOptionIndex;

                let optionBg = 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-cyan-400';
                if (isAnswerChecked) {
                  if (isCorrectOption) {
                    optionBg = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                  } else if (isSelected && !isCorrectOption) {
                    optionBg = 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 font-bold';
                  }
                } else if (isSelected) {
                  optionBg = 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500/30';
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => !isAnswerChecked && setSelectedAnswer(oIdx)}
                    disabled={isAnswerChecked}
                    className={`p-4 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${optionBg}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{opt}</span>
                    </div>

                    {isAnswerChecked && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    )}
                    {isAnswerChecked && isSelected && !isCorrectOption && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {activeQuestion.type === 'true_false' && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              {[
                { label: 'صواب (True)', val: true },
                { label: 'خطأ (False)', val: false },
              ].map((tf) => {
                const isSelected = selectedAnswer === tf.val;
                const isCorrectVal = tf.val === activeQuestion.correctBool;

                let btnBg = 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800';
                if (isAnswerChecked) {
                  if (isCorrectVal) btnBg = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200';
                  else if (isSelected && !isCorrectVal) btnBg = 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-200';
                } else if (isSelected) {
                  btnBg = 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500';
                }

                return (
                  <button
                    key={String(tf.val)}
                    onClick={() => !isAnswerChecked && setSelectedAnswer(tf.val)}
                    disabled={isAnswerChecked}
                    className={`p-4 rounded-2xl border font-bold text-sm transition-all cursor-pointer ${btnBg}`}
                  >
                    {tf.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Hint Dropdown if available */}
          {activeQuestion.hint && (
            <div className="pt-2">
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 flex items-center gap-1.5 cursor-pointer"
              >
                <Lightbulb className="w-4 h-4" />
                <span>{showHint ? 'إخفاء التلميح الاسترشادي' : 'عرض تلميح مساعد'}</span>
              </button>

              {showHint && (
                <div className="mt-2 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 leading-relaxed animate-fade-in">
                  💡 <strong>تلميح:</strong> {activeQuestion.hint}
                </div>
              )}
            </div>
          )}

          {/* Explanation Banner when Checked */}
          {isAnswerChecked && activeQuestion.explanation && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs leading-relaxed text-slate-800 dark:text-slate-200 space-y-1 animate-fade-in">
              <div className="flex items-center gap-2 font-black text-emerald-700 dark:text-emerald-400">
                <Check className="w-4 h-4" />
                <span>الشرح والتفسير الأكاديمي من المعلم:</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 pt-1">{activeQuestion.explanation}</p>
            </div>
          )}

          {/* Action Footer Controls */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isAnswerChecked ? (
                <button
                  onClick={handleCheckAnswer}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs transition-all shadow-md shadow-cyan-600/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>التحقق من الإجابة</span>
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  disabled={currentIndex === filteredQuestions.length - 1}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>السؤال التالي</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevQuestion}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                السابق
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={currentIndex === filteredQuestions.length - 1}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                التالي
              </button>
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
};

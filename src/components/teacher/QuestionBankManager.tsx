import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  Layers,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Trash2,
  Edit,
  ArrowRight,
  ArrowLeft,
  Copy,
  FileDown,
  FileUp,
  Award,
  AlertCircle,
  Clock,
  Shuffle,
  Eye,
  EyeOff,
  Check,
  X,
  Volume2,
  FileText,
  Tag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BankQuestion, Course, Exam, QuestionType } from '../../types';

interface QuestionBankManagerProps {
  course: Course;
}

export const QuestionBankManager: React.FC<QuestionBankManagerProps> = ({ course }) => {
  const {
    currentUser,
    bankQuestions,
    exams,
    createBankQuestion,
    updateBankQuestion,
    deleteBankQuestion,
    importExamToQuestionBank,
    createExamFromBankQuestions,
    addToast,
  } = useApp();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Selected questions for Bulk Actions (e.g. creating exam)
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [showAnswerForId, setShowAnswerForId] = useState<Record<string, boolean>>({});

  // Modals
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<BankQuestion | null>(null);
  const [isImportExamModalOpen, setIsImportExamModalOpen] = useState(false);
  const [isCreateExamModalOpen, setIsCreateExamModalOpen] = useState(false);

  // Filter bank questions for this course / subject or general
  const filteredQuestions = bankQuestions.filter((q) => {
    const matchesSearch =
      !searchQuery ||
      q.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.tags && q.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesTopic = selectedTopic === 'all' || q.topic === selectedTopic;
    const matchesDifficulty = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    const matchesType = selectedType === 'all' || q.type === selectedType;

    return matchesSearch && matchesTopic && matchesDifficulty && matchesType;
  });

  // Extract unique topics for filter dropdown
  const uniqueTopics = Array.from(new Set(bankQuestions.map((q) => q.topic))).filter(Boolean);

  // Handle Select All
  const handleSelectAll = () => {
    if (selectedQuestionIds.length === filteredQuestions.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(filteredQuestions.map((q) => q.id));
    }
  };

  const toggleSelectQuestion = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleShowAnswer = (id: string) => {
    setShowAnswerForId((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Convert Exam to Question Bank State
  const [selectedExamToImport, setSelectedExamToImport] = useState<string>('');
  const [customImportTopic, setCustomImportTopic] = useState<string>('');

  const handleExecuteImportExam = () => {
    if (!selectedExamToImport) {
      addToast('error', 'يرجى اختيار الامتحان المراد استيراده');
      return;
    }
    const count = importExamToQuestionBank(selectedExamToImport, customImportTopic || undefined);
    if (count > 0) {
      setIsImportExamModalOpen(false);
      setSelectedExamToImport('');
      setCustomImportTopic('');
    }
  };

  // Create Exam from Bank State
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamDuration, setNewExamDuration] = useState(30);
  const [newExamPassingPercent, setNewExamPassingPercent] = useState(60);
  const [newExamMaxAttempts, setNewExamMaxAttempts] = useState(2);

  const handleExecuteCreateExam = () => {
    if (selectedQuestionIds.length === 0) {
      addToast('error', 'يرجى تحديد سؤال واحد على الأقل لإنشاء الامتحان.');
      return;
    }
    if (!newExamTitle.trim()) {
      addToast('error', 'يرجى كتابة عنوان الامتحان الجديد.');
      return;
    }

    createExamFromBankQuestions(selectedQuestionIds, {
      courseId: course.id,
      title: newExamTitle.trim(),
      durationMinutes: newExamDuration,
      passingScorePercent: newExamPassingPercent,
      maxAttempts: newExamMaxAttempts,
    });

    setIsCreateExamModalOpen(false);
    setSelectedQuestionIds([]);
    setNewExamTitle('');
  };

  // New/Edit Question Form State
  const [formType, setFormType] = useState<QuestionType>('mcq');
  const [formTopic, setFormTopic] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [formPrompt, setFormPrompt] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrectOptionIndex, setFormCorrectOptionIndex] = useState<number>(0);
  const [formCorrectBool, setFormCorrectBool] = useState<boolean>(true);
  const [formFillBlankAnswers, setFormFillBlankAnswers] = useState<string>('');
  const [formSampleAnswer, setFormSampleAnswer] = useState<string>('');
  const [formSentenceWithMistake, setFormSentenceWithMistake] = useState<string>('');
  const [formTargetMistake, setFormTargetMistake] = useState<string>('');
  const [formCorrection, setFormCorrection] = useState<string>('');
  const [formHint, setFormHint] = useState<string>('');
  const [formExplanation, setFormExplanation] = useState<string>('');
  const [formPoints, setFormPoints] = useState<number>(2);
  const [formTags, setFormTags] = useState<string>('');

  const openAddQuestionModal = (existing?: BankQuestion) => {
    if (existing) {
      setEditingQuestion(existing);
      setFormType(existing.type);
      setFormTopic(existing.topic);
      setFormDifficulty(existing.difficulty);
      setFormPrompt(existing.prompt);
      setFormOptions(existing.options && existing.options.length > 0 ? existing.options : ['', '', '', '']);
      setFormCorrectOptionIndex(existing.correctOptionIndex || 0);
      setFormCorrectBool(existing.correctBool ?? true);
      setFormFillBlankAnswers(existing.fillBlankAnswers ? existing.fillBlankAnswers.join(', ') : '');
      setFormSampleAnswer(existing.sampleAnswer || '');
      setFormSentenceWithMistake(existing.sentenceWithMistake || '');
      setFormTargetMistake(existing.targetMistake || '');
      setFormCorrection(existing.correction || '');
      setFormHint(existing.hint || '');
      setFormExplanation(existing.explanation || '');
      setFormPoints(existing.points || 2);
      setFormTags(existing.tags ? existing.tags.join(', ') : '');
    } else {
      setEditingQuestion(null);
      setFormType('mcq');
      setFormTopic('Grammar & Usage');
      setFormDifficulty('medium');
      setFormPrompt('');
      setFormOptions(['', '', '', '']);
      setFormCorrectOptionIndex(0);
      setFormCorrectBool(true);
      setFormFillBlankAnswers('');
      setFormSampleAnswer('');
      setFormSentenceWithMistake('');
      setFormTargetMistake('');
      setFormCorrection('');
      setFormHint('');
      setFormExplanation('');
      setFormPoints(2);
      setFormTags('قواعد, تراكيب');
    }
    setIsAddQuestionModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPrompt.trim() && formType !== 'error_correction') {
      addToast('error', 'يرجى كتابة نص السؤال.');
      return;
    }

    const tagsArray = formTags
      .split(/[,،]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const fillBlanksArray = formFillBlankAnswers
      .split(/[,،]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const questionData: Omit<BankQuestion, 'id' | 'createdAt' | 'updatedAt'> = {
      courseId: course.id,
      subject: course.subject || 'اللغة الإنجليزية',
      topic: formTopic.trim() || 'عام',
      difficulty: formDifficulty,
      tags: tagsArray,
      type: formType,
      prompt: formPrompt.trim() || (formType === 'error_correction' ? 'صوّب الخطأ في الجملة التالية:' : ''),
      options: formType === 'mcq' ? formOptions.filter((o) => o.trim().length > 0) : undefined,
      correctOptionIndex: formType === 'mcq' ? formCorrectOptionIndex : undefined,
      correctBool: formType === 'true_false' ? formCorrectBool : undefined,
      fillBlankAnswers: formType === 'fill_blank' ? fillBlanksArray : undefined,
      sampleAnswer: formType === 'short_answer' || formType === 'essay' ? formSampleAnswer : undefined,
      sentenceWithMistake: formType === 'error_correction' ? formSentenceWithMistake : undefined,
      targetMistake: formType === 'error_correction' ? formTargetMistake : undefined,
      correction: formType === 'error_correction' ? formCorrection : undefined,
      hint: formHint.trim() || undefined,
      explanation: formExplanation.trim() || undefined,
      points: Number(formPoints) || 1,
    };

    if (editingQuestion) {
      updateBankQuestion(editingQuestion.id, questionData);
    } else {
      createBankQuestion(questionData);
    }

    setIsAddQuestionModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900/90 via-slate-900 to-cyan-950/80 border border-indigo-500/30 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  بنك الأسئلة المتقدم (مستقل عن الامتحانات)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold">
                  {bankQuestions.length} سؤال مسجل
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                مستودع شامل لتخزين وتصنيف الأسئلة حسب المواضيع والمستوى، مع ميزة التحويل المتبادل بين بنك الأسئلة والامتحانات.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setIsImportExamModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:border-indigo-400"
          >
            <FileDown className="w-4 h-4 text-indigo-400" />
            <span>تحويل امتحان إلى بنك أسئلة 📥</span>
          </button>

          <button
            type="button"
            disabled={selectedQuestionIds.length === 0}
            onClick={() => {
              setNewExamTitle(`امتحان مجمع (${selectedQuestionIds.length} أسئلة) - ${new Date().toLocaleDateString('ar-EG')}`);
              setIsCreateExamModalOpen(true);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
              selectedQuestionIds.length > 0
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <FileUp className="w-4 h-4" />
            <span>توليد امتحان من الأسئلة المحددة ({selectedQuestionIds.length}) 🎯</span>
          </button>

          <button
            type="button"
            onClick={() => openAddQuestionModal()}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سؤال جديد للبنك</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في نص السؤال، الموضوع، التاج..."
              className="w-full pr-10 pl-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Topic Filter */}
          <div>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">كل الموضوعات ({uniqueTopics.length})</option>
              {uniqueTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">جميع مستويات الصعوبة</option>
              <option value="easy">سهل (Easy)</option>
              <option value="medium">متوسط (Medium)</option>
              <option value="hard">متقدم وصعب (Hard)</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">جميع أنواع الأسئلة</option>
              <option value="mcq">اختيار من متعدد (MCQ)</option>
              <option value="true_false">صح أو خطأ (True/False)</option>
              <option value="fill_blank">أكمل الفراغ (Fill in the Blank)</option>
              <option value="short_answer">إجابة قصيرة (Short Answer)</option>
              <option value="error_correction">تصويب الخطأ (Error Correction)</option>
              <option value="matching">توصيل (Matching)</option>
            </select>
          </div>
        </div>

        {/* Bulk Selection Summary Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer font-bold select-none">
              <input
                type="checkbox"
                checked={filteredQuestions.length > 0 && selectedQuestionIds.length === filteredQuestions.length}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
              />
              <span>تحديد الكل ({filteredQuestions.length} سؤال)</span>
            </label>
            {selectedQuestionIds.length > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-black">
                تم تحديد {selectedQuestionIds.length} سؤال
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span>النتائج المعروضة: {filteredQuestions.length} سؤال</span>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 mx-auto flex items-center justify-center">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-white">لا توجد أسئلة تطابق هذا الفلتر</h4>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            يمكنك إضافة أسئلة جديدة إلى البنك يدوياً أو استيراد كامل الأسئلة من أي امتحان بضغطة زر واحدة.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openAddQuestionModal()}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
            >
              إضافة سؤال للبنك
            </button>
            <button
              onClick={() => setIsImportExamModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors"
            >
              استيراد من امتحان
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question, index) => {
            const isSelected = selectedQuestionIds.includes(question.id);
            const isAnswerShown = !!showAnswerForId[question.id];

            return (
              <div
                key={question.id}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all shadow-sm ${
                  isSelected
                    ? 'border-cyan-500 ring-2 ring-cyan-500/20 dark:bg-slate-900/90'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectQuestion(question.id)}
                      className="w-4 h-4 mt-1 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />

                    {/* Question Content */}
                    <div className="space-y-2 flex-1">
                      {/* Meta Tags */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold">
                          #{index + 1}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold">
                          {question.topic}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            question.difficulty === 'easy'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : question.difficulty === 'hard'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {question.difficulty === 'easy'
                            ? 'سهل 🟢'
                            : question.difficulty === 'hard'
                            ? 'متقدم 🔴'
                            : 'متوسط 🟡'}
                        </span>

                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-semibold">
                          نوع: {question.type.toUpperCase()}
                        </span>

                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-[11px] font-bold">
                          {question.points} {question.points === 1 ? 'درجة' : 'درجات'}
                        </span>

                        {question.tags?.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[10px]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      {/* Prompt */}
                      <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed pt-1">
                        {question.prompt}
                      </p>

                      {/* Error Correction Specific Preview */}
                      {question.type === 'error_correction' && question.sentenceWithMistake && (
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-xs sm:text-sm font-mono text-amber-900 dark:text-amber-200">
                          {question.sentenceWithMistake}
                        </div>
                      )}

                      {/* MCQ Options Preview */}
                      {question.type === 'mcq' && question.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          {question.options.map((opt, optIdx) => {
                            const isCorrect = question.correctOptionIndex === optIdx;
                            return (
                              <div
                                key={optIdx}
                                className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between border transition-all ${
                                  isAnswerShown && isCorrect
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-300 font-bold'
                                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span>{opt}</span>
                                </div>
                                {isAnswerShown && isCorrect && (
                                  <Check className="w-4 h-4 text-emerald-500" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Answer & Explanation Panel (Collapsible) */}
                      {isAnswerShown && (
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 mt-3 text-xs animate-fade-in">
                          {/* Correct Answer Display */}
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              الإجابة النموذجية:
                            </span>
                            <span className="text-slate-800 dark:text-slate-200 font-mono font-semibold">
                              {question.type === 'mcq' &&
                                question.options &&
                                `${String.fromCharCode(65 + (question.correctOptionIndex || 0))}) ${
                                  question.options[question.correctOptionIndex || 0]
                                }`}
                              {question.type === 'true_false' &&
                                (question.correctBool ? 'صحيح (True)' : 'خطأ (False)')}
                              {question.type === 'fill_blank' &&
                                (question.fillBlankAnswers?.join(' / ') || question.sampleAnswer)}
                              {question.type === 'short_answer' && question.sampleAnswer}
                              {question.type === 'error_correction' &&
                                `الخطأ: (${question.targetMistake}) ⬅️ الصواب: (${question.correction})`}
                            </span>
                          </div>

                          {/* Explanation */}
                          {question.explanation && (
                            <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                              <span className="font-bold text-indigo-500">الشرح والتعليل:</span>
                              <p className="leading-relaxed">{question.explanation}</p>
                            </div>
                          )}

                          {/* Hint */}
                          {question.hint && (
                            <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400">
                              <span className="font-bold text-amber-500">تلميح الطالب:</span>
                              <p>{question.hint}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Dropdown / Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleShowAnswer(question.id)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors text-xs flex items-center gap-1 font-semibold cursor-pointer"
                      title={isAnswerShown ? 'إخفاء الإجابة' : 'عرض الإجابة النموذجية'}
                    >
                      {isAnswerShown ? <EyeOff className="w-4 h-4 text-cyan-500" /> : <Eye className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => openAddQuestionModal(question)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 transition-colors cursor-pointer"
                      title="تعديل السؤال"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('هل أنت متأكد من حذف هذا السؤال من بنك الأسئلة؟')) {
                          deleteBankQuestion(question.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                      title="حذف السؤال"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Import Exam to Question Bank */}
      {isImportExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-indigo-500">
                <FileDown className="w-5 h-5" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  تحويل امتحان إلى بنك أسئلة 📥
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsImportExamModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              اختر أي امتحان موجود في المنصة لاستخراج جميع أسئلته وإضافتها فوراً إلى بنك الأسئلة العام للاستفادة منها وإعادة توليد امتحانات جديدة لاحقاً.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اختر الامتحان المراد تحويله:
                </label>
                <select
                  value={selectedExamToImport}
                  onChange={(e) => setSelectedExamToImport(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">-- اختر الامتحان --</option>
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.title} ({ex.questions?.length || 0} أسئلة)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الموضوع / التصنيف في بنك الأسئلة (اختياري):
                </label>
                <input
                  type="text"
                  value={customImportTopic}
                  onChange={(e) => setCustomImportTopic(e.target.value)}
                  placeholder="مثال: مراجعة شاملة للوحدة الأولى"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsImportExamModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleExecuteImportExam}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                استيراد الأسئلة للبنك
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Exam from Selected Bank Questions */}
      {isCreateExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-emerald-500">
                <FileUp className="w-5 h-5" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  تحويل أسئلة البنك إلى امتحان جديد 🎯
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateExamModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                سيتم تجميع ({selectedQuestionIds.length}) أسئلة مختارة من بنك الأسئلة وتوليد امتحان كامل وجاهز للطلاب فوراً.
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان الامتحان:
                </label>
                <input
                  type="text"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  placeholder="مثال: امتحان التحدي والمراجعة الشاملة"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المدة (دقيقة):
                  </label>
                  <input
                    type="number"
                    value={newExamDuration}
                    onChange={(e) => setNewExamDuration(Number(e.target.value) || 30)}
                    min={5}
                    max={180}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نسبة النجاح (%):
                  </label>
                  <input
                    type="number"
                    value={newExamPassingPercent}
                    onChange={(e) => setNewExamPassingPercent(Number(e.target.value) || 60)}
                    min={10}
                    max={100}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    عدد المحاولات:
                  </label>
                  <input
                    type="number"
                    value={newExamMaxAttempts}
                    onChange={(e) => setNewExamMaxAttempts(Number(e.target.value) || 1)}
                    min={1}
                    max={10}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateExamModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleExecuteCreateExam}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                إنشاء الامتحان الآن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Question */}
      {isAddQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl my-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-cyan-500">
                <HelpCircle className="w-6 h-6" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {editingQuestion ? 'تعديل سؤال في بنك الأسئلة' : 'إضافة سؤال جديد إلى بنك الأسئلة'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddQuestionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Question Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نوع السؤال:
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as QuestionType)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="mcq">اختيار من متعدد (MCQ)</option>
                    <option value="true_false">صح أو خطأ (True/False)</option>
                    <option value="fill_blank">أكمل الفراغ (Fill blank)</option>
                    <option value="error_correction">تصويب الخطأ (Error Correction)</option>
                    <option value="short_answer">إجابة مقالية قصيرة (Short Answer)</option>
                  </select>
                </div>

                {/* Topic */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الموضوع / الوحدة:
                  </label>
                  <input
                    type="text"
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    placeholder="مثال: Grammar - Conditional"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المستوى:
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="easy">سهل (Easy)</option>
                    <option value="medium">متوسط (Medium)</option>
                    <option value="hard">متقدم (Hard)</option>
                  </select>
                </div>
              </div>

              {/* Prompt */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نص السؤال (Prompt):
                </label>
                <textarea
                  rows={3}
                  value={formPrompt}
                  onChange={(e) => setFormPrompt(e.target.value)}
                  placeholder="اكتب نص السؤال هنا بدقة..."
                  className="w-full p-3 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  required={formType !== 'error_correction'}
                />
              </div>

              {/* Options for MCQ */}
              {formType === 'mcq' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      الخيارات (حدد الإجابة الصحيحة بالضغط على الدائرة):
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormOptions([...formOptions, ''])}
                      className="text-xs text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ إضافة خيار</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formOptions.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={formCorrectOptionIndex === optIdx}
                          onChange={() => setFormCorrectOptionIndex(optIdx)}
                          className="w-4 h-4 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-500 w-4">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...formOptions];
                            newOpts[optIdx] = e.target.value;
                            setFormOptions(newOpts);
                          }}
                          placeholder={`الخيار ${String.fromCharCode(65 + optIdx)}`}
                          className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                          required
                        />
                        {formOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newOpts = formOptions.filter((_, i) => i !== optIdx);
                              setFormOptions(newOpts);
                              if (formCorrectOptionIndex >= newOpts.length) {
                                setFormCorrectOptionIndex(Math.max(0, newOpts.length - 1));
                              } else if (formCorrectOptionIndex === optIdx) {
                                setFormCorrectOptionIndex(0);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="حذف الخيار"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* True/False */}
              {formType === 'true_false' && (
                <div className="flex items-center gap-4 py-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">الإجابة الصحيحة:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <input
                      type="radio"
                      name="tf"
                      checked={formCorrectBool === true}
                      onChange={() => setFormCorrectBool(true)}
                      className="text-emerald-600"
                    />
                    <span>صحيح (True)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-rose-600 dark:text-rose-400">
                    <input
                      type="radio"
                      name="tf"
                      checked={formCorrectBool === false}
                      onChange={() => setFormCorrectBool(false)}
                      className="text-rose-600"
                    />
                    <span>خطأ (False)</span>
                  </label>
                </div>
              )}

              {/* Fill in the blanks */}
              {formType === 'fill_blank' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الإجابات المقبولة (افصل بينها بفواصل):
                  </label>
                  <input
                    type="text"
                    value={formFillBlankAnswers}
                    onChange={(e) => setFormFillBlankAnswers(e.target.value)}
                    placeholder="research, experiments, study"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              )}

              {/* Error correction */}
              {formType === 'error_correction' && (
                <div className="space-y-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <div>
                    <label className="block text-xs font-bold text-amber-900 dark:text-amber-200 mb-1">
                      الجملة التي تحتوي على الخطأ:
                    </label>
                    <input
                      type="text"
                      value={formSentenceWithMistake}
                      onChange={(e) => setFormSentenceWithMistake(e.target.value)}
                      placeholder="Despite he was exhausted, he completed the race."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
                        الكلمة الخطأ المستهدفة:
                      </label>
                      <input
                        type="text"
                        value={formTargetMistake}
                        onChange={(e) => setFormTargetMistake(e.target.value)}
                        placeholder="Despite"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                        التصويب الصحيح:
                      </label>
                      <input
                        type="text"
                        value={formCorrection}
                        onChange={(e) => setFormCorrection(e.target.value)}
                        placeholder="Although"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Short Answer / Essay */}
              {formType === 'short_answer' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الإجابة النموذجية الاسترشادية:
                  </label>
                  <textarea
                    rows={2}
                    value={formSampleAnswer}
                    onChange={(e) => setFormSampleAnswer(e.target.value)}
                    placeholder="اكتب الإجابة النموذجية المرجعية..."
                    className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              {/* Explanation & Hint */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الشرح والتفسير للطالب:
                  </label>
                  <input
                    type="text"
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    placeholder="لماذا هذه هي الإجابة الصحيحة..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تلميح اختياري (Hint):
                  </label>
                  <input
                    type="text"
                    value={formHint}
                    onChange={(e) => setFormHint(e.target.value)}
                    placeholder="تلميح لمساعدة الطالب..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Points & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الدرجات:
                  </label>
                  <input
                    type="number"
                    value={formPoints}
                    onChange={(e) => setFormPoints(Number(e.target.value) || 1)}
                    min={1}
                    max={20}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الكلمات الدلالية (Tags):
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="قواعد, ثانوية عامة, 2026"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddQuestionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  {editingQuestion ? 'حفظ التعديلات' : 'إضافة إلى بنك الأسئلة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

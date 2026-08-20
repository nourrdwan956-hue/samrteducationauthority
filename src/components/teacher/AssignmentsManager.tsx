import React, { useState } from 'react';
import {
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Assignment, AssignmentSubmission, Course, Question } from '../../types';

interface AssignmentsManagerProps {
  course: Course;
}

export const AssignmentsManager: React.FC<AssignmentsManagerProps> = ({ course }) => {
  const {
    currentUser,
    assignments,
    assignmentSubmissions,
    bankQuestions,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    gradeAssignmentSubmission,
    addToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignmentForGrading, setSelectedAssignmentForGrading] = useState<Assignment | null>(null);
  const [activeGradingSubmission, setActiveGradingSubmission] = useState<AssignmentSubmission | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
  const [formSelectedBankQuestionIds, setFormSelectedBankQuestionIds] = useState<string[]>([]);

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
      setFormDescription(existing.description);
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
      setFormSelectedBankQuestionIds([]);
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
      // Pre-select 3-4 questions from bank by default
      setFormSelectedBankQuestionIds(bankQuestions.slice(0, 3).map((q) => q.id));
    }
    setIsCreateModalOpen(true);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      addToast('error', 'يرجى كتابة عنوان الواجب المنزلي.');
      return;
    }

    // Prepare questions
    let questionsForAssignment: Question[] = [];
    if (editingAssignment && editingAssignment.questions.length > 0 && formSelectedBankQuestionIds.length === 0) {
      questionsForAssignment = editingAssignment.questions;
    } else if (formSelectedBankQuestionIds.length > 0) {
      const selectedBankQs = bankQuestions.filter((bq) => formSelectedBankQuestionIds.includes(bq.id));
      questionsForAssignment = selectedBankQs.map((bq, idx) => ({
        id: `as_q_${Date.now()}_${idx}`,
        examId: 'assignment_temp',
        type: bq.type,
        prompt: bq.prompt,
        options: bq.options,
        correctOptionIndex: bq.correctOptionIndex,
        correctBool: bq.correctBool,
        fillBlankAnswers: bq.fillBlankAnswers,
        sampleAnswer: bq.sampleAnswer,
        sentenceWithMistake: bq.sentenceWithMistake,
        targetMistake: bq.targetMistake,
        correction: bq.correction,
        hint: bq.hint,
        explanation: bq.explanation,
        points: bq.points || 2,
        allowHint: true,
      }));
    } else if (editingAssignment?.questions) {
      questionsForAssignment = editingAssignment.questions;
    } else {
      // Fallback sample question
      questionsForAssignment = [
        {
          id: `as_q_${Date.now()}_1`,
          examId: 'assignment_temp',
          type: 'mcq',
          prompt: 'If you ________ harder in your previous semester, you would have passed with distinction.',
          options: ['had studied', 'studied', 'study', 'have studied'],
          correctOptionIndex: 0,
          points: 2,
          explanation: 'الحالة الشرطية الثالثة: If + had + p.p -> would have + p.p',
          allowHint: true,
        },
      ];
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
      questions: questionsForAssignment,
      totalPoints: questionsForAssignment.reduce((sum, q) => sum + (q.points || 1), 0),
      status: 'published',
      isPublished: true,
    };

    if (editingAssignment) {
      updateAssignment(editingAssignment.id, payload);
    } else {
      createAssignment(payload);
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
          className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-teal-500/20"
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
                      {assignment.autoGrading && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                          ⚡ تصحيح إلكتروني فوري
                        </span>
                      )}
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {assignment.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      {assignment.description}
                    </p>

                    {/* Stats & Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>{assignment.questions?.length || 0} أسئلة</span>
                      </span>

                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>{assignment.totalPoints} درجة</span>
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{assignment.durationMinutes || 30} دقيقة</span>
                      </span>

                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-teal-500" />
                        <span>آخر موعد: {assignment.dueDate || 'مفتوح'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Submission Statistics & Actions */}
                  <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center min-w-[110px]">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        تسليمات الطلاب
                      </span>
                      <span className="text-base font-black text-teal-600 dark:text-teal-400 font-mono">
                        {subsForAssignment.length} طالب
                      </span>
                      <span className="text-[10px] text-emerald-500 font-bold block">
                        نسبة النجاح: {passRate}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedAssignmentForGrading(assignment)}
                        className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="مراجعة وتصحيح تسليمات الطلاب"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>التسليمات ({subsForAssignment.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openCreateModal(assignment)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 transition-colors cursor-pointer"
                        title="تعديل الواجب وورقة المفاهيم"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('هل أنت متأكد من حذف هذا الواجب؟')) {
                            deleteAssignment(assignment.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                        title="حذف الواجب"
                      >
                        <Trash2 className="w-4 h-4" />
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
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm overflow-y-auto flex-1 custom-scrollbar">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">الدرجة الحالية:</span>
                  <span className="font-bold font-mono">
                    {activeGradingSubmission.score} / {activeGradingSubmission.totalPoints}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">النسبة المئوية:</span>
                  <span className="font-bold text-teal-500">
                    {activeGradingSubmission.percentage}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ملاحظات وتوجيهات المعلم للطالب:
                </label>
                <textarea
                  rows={4}
                  value={teacherFeedback}
                  onChange={(e) => setTeacherFeedback(e.target.value)}
                  placeholder="مثال: إجابات ممتازة في القواعد، يرجى التركيز أكثر على الأزمنة المركبة..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/80 dark:bg-slate-900/80">
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
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-lg shadow-teal-600/20"
              >
                حفظ التقييم والملاحظات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create/Edit Specialized Assignment */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
            
            {/* Modal Sticky Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2 text-teal-500">
                <FileText className="w-6 h-6" />
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {editingAssignment ? 'تعديل الواجب التخصصي' : 'إنشاء واجب تخصصي مع ورقة مفاهيم'}
                </h3>
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
                        <textarea
                          rows={4}
                          value={formConceptSheetContent}
                          onChange={(e) => setFormConceptSheetContent(e.target.value)}
                          placeholder="اكتب هنا القواعد، المعادلات، أو الملاحظات التي ستكون متاحة للطالب للاطلاع عليها أثناء الحل..."
                          className="w-full p-3 font-mono text-xs rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/40 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                        />
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

                {/* Questions from Bank Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    حدد الأسئلة من بنك الأسئلة لإدراجها في هذا الواجب:
                  </label>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 custom-scrollbar">
                    {bankQuestions.map((bq) => {
                      const isSelected = formSelectedBankQuestionIds.includes(bq.id);
                      return (
                        <label
                          key={bq.id}
                          className={`flex items-start gap-2 p-2 rounded-lg text-xs cursor-pointer select-none transition-all ${
                            isSelected
                              ? 'bg-teal-500/10 text-teal-900 dark:text-teal-200 font-semibold'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setFormSelectedBankQuestionIds((prev) =>
                                prev.includes(bq.id)
                                  ? prev.filter((id) => id !== bq.id)
                                  : [...prev, bq.id]
                              );
                            }}
                            className="w-4 h-4 mt-0.5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                          <div className="flex-1">
                            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold ml-1">
                              [{bq.topic}]
                            </span>
                            <span>{bq.prompt}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Sticky Footer */}
              <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

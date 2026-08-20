import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  Search,
  CheckCircle2,
  XCircle,
  Printer,
  Trophy,
} from 'lucide-react';
import { ExamSubmission, Exam, Course } from '../../types';

interface CourseResultsTabProps {
  course: Course;
  exams: Exam[];
  submissions: ExamSubmission[];
}

export const CourseResultsTab: React.FC<CourseResultsTabProps> = ({
  course,
  exams,
  submissions,
}) => {
  const courseExams = (exams || []).filter((e) => e.courseId === course.id);
  const examIds = courseExams.map((e) => e.id);
  const courseSubmissions = (submissions || []).filter((s) => examIds.includes(s.examId));

  const [selectedExamFilter, setSelectedExamFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Top Leaderboard calculation
  const passedSubmissions = [...courseSubmissions]
    .filter((s) => s.passed)
    .sort((a, b) => b.percentage - a.percentage);

  const topStudents = passedSubmissions.slice(0, 3);

  const filteredSubmissions = courseSubmissions.filter((sub) => {
    const matchesExam =
      selectedExamFilter === 'all' || sub.examId === selectedExamFilter;
    const matchesSearch =
      sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.examTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesExam && matchesSearch;
  });

  const totalAttempts = courseSubmissions.length;
  const passedCount = courseSubmissions.filter((s) => s.passed).length;
  const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;
  const avgScore = totalAttempts > 0 ? Math.round(courseSubmissions.reduce((acc, s) => acc + s.percentage, 0) / totalAttempts) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">إجمالي محاولات الحل</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{totalAttempts} تسليم</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">نسبة النجاح العامة</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{passRate}%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">متوسط الدرجات</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">{avgScore}%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Top Leaderboard Podium (أوائل الطلاب) */}
      {topStudents.length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-white to-cyan-500/10 dark:from-amber-950/30 dark:via-slate-900 dark:to-cyan-950/30 border border-amber-500/30 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">لوحة شرف الأوائل والمتميزين</h3>
            </div>
            <span className="text-xs text-amber-800 dark:text-amber-300 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              أعلى الدرجات في امتحانات الكورس
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topStudents.map((top, idx) => (
              <div
                key={top.id}
                className="p-4 rounded-2xl bg-white/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center gap-3 relative overflow-hidden shadow-xs"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shadow-sm ${
                  idx === 0
                    ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300/40'
                    : idx === 1
                    ? 'bg-slate-200 dark:bg-slate-300 text-slate-950'
                    : 'bg-amber-700 text-white'
                }`}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">{top.studentName}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{top.examTitle}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono block">
                    {top.percentage}%
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {top.score}/{top.totalPoints}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Print bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-1 items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="بحث باسم الطالب أو الامتحان..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Exam Filter */}
          <select
            value={selectedExamFilter}
            onChange={(e) => setSelectedExamFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none shrink-0"
          >
            <option value="all">جميع الامتحانات ({courseExams.length})</option>
            {courseExams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700"
        >
          <Printer className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>طباعة كشف الدرجات</span>
        </button>
      </div>

      {/* Results Table */}
      {filteredSubmissions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <Award className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">لا توجد تسليمات مسجلة بعد</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ستظهر درجات الطلاب وإجاباتهم هنا فور إكمالهم لأي امتحان.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredSubmissions.map((sub) => (
            <div
              key={sub.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  sub.passed
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                }`}>
                  {sub.passed ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{sub.studentName}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{sub.examTitle}</span>
                    <span>•</span>
                    <span>{new Date(sub.submittedAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">الدرجة المحققة</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono">
                    {sub.score} / {sub.totalPoints}
                  </span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-black font-mono ${
                    sub.passed
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-700'
                  }`}
                >
                  {sub.percentage}% • {sub.passed ? 'ناجح' : 'راسب'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

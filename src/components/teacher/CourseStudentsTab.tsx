import React, { useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Power,
  Trash2,
  Phone,
} from 'lucide-react';

export interface CourseStudentItem {
  id: string;
  studentName: string;
  studentPhone: string;
  parentPhone?: string;
  studentEmail?: string;
  joinedAt: string;
  progressPercent: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  status: 'active' | 'suspended';
  subscriptionMethod: 'online' | 'coupon_center' | 'free_grant';
  lastActive: string;
}

interface CourseStudentsTabProps {
  courseId: string;
  courseStudents: CourseStudentItem[];
  onAddStudent: (student: Omit<CourseStudentItem, 'id' | 'joinedAt'>) => void;
  onToggleStatus: (studentId: string) => void;
  onDeleteStudent: (studentId: string) => void;
}

export const CourseStudentsTab: React.FC<CourseStudentsTabProps> = ({
  courseStudents,
  onAddStudent,
  onToggleStatus,
  onDeleteStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [subscriptionMethod, setSubscriptionMethod] = useState<'online' | 'coupon_center' | 'free_grant'>('coupon_center');

  const filteredStudents = (courseStudents || []).filter((std) => {
    const matchesSearch =
      std.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.studentPhone.includes(searchTerm) ||
      (std.parentPhone && std.parentPhone.includes(searchTerm));

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && std.status === filterStatus;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddStudent({
      studentName: name.trim(),
      studentPhone: phone.trim() || '01000000000',
      parentPhone: parentPhone.trim() || undefined,
      studentEmail: email.trim() || undefined,
      progressPercent: 0,
      completedLessonsCount: 0,
      totalLessonsCount: 15,
      status: 'active',
      subscriptionMethod,
      lastActive: 'الآن',
    });

    setIsAddModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
    setParentPhone('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              الطلاب المشتركون في هذا الكورس ({courseStudents.length})
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            إدارة الطلاب، متابعة نسب التقدم، وأرقام أولياء الأمور للاطمئنان على الحضور
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة طالب يدوياً للكورس</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالاسم، رقم هاتف الطالب، أو رقم ولي الأمر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:border-cyan-500 focus:outline-none text-right shadow-xs"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0 shadow-xs">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'active', label: 'نشط' },
            { id: 'suspended', label: 'مجمّد' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Students List Table / Cards */}
      {filteredStudents.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <Users className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">لا يوجد طلاب مطابقين للبحث</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            يمكنك إضافة طالب أو تفعيل اشتراكات السناتر وأكواد الخصم.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((std) => (
            <div
              key={std.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xs ${
                std.status === 'active'
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  : 'bg-slate-100 dark:bg-slate-950/60 border-rose-300 dark:border-rose-900/30 opacity-75'
              }`}
            >
              {/* Student Identity */}
              <div className="flex items-center gap-3 min-w-[220px]">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-sky-500 text-white font-black text-sm flex items-center justify-center shadow-sm">
                  {std.studentName.charAt(0)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{std.studentName}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        std.status === 'active'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      {std.status === 'active' ? 'نشط' : 'موقوف'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                      {std.studentPhone}
                    </span>
                    {std.parentPhone && (
                      <span className="flex items-center gap-1 font-mono text-amber-600 dark:text-amber-400">
                        <span>ولي الأمر:</span> {std.parentPhone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress & Stats */}
              <div className="flex-1 w-full lg:w-auto px-0 lg:px-4 py-2 border-y lg:border-y-0 lg:border-x border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700 dark:text-slate-300">
                    الدروس المكتملة: {std.completedLessonsCount} من {std.totalLessonsCount}
                  </span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-mono">{std.progressPercent}%</span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full transition-all duration-500"
                    style={{ width: `${std.progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  <span>طريقة الاشتراك: {std.subscriptionMethod === 'online' ? 'دفع إلكتروني' : std.subscriptionMethod === 'coupon_center' ? 'كود سنتر' : 'منحة مجانية'}</span>
                  <span>آخر نشاط: {std.lastActive}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end lg:self-center">
                <button
                  type="button"
                  onClick={() => onToggleStatus(std.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                    std.status === 'active'
                      ? 'bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400'
                      : 'bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  }`}
                  title={std.status === 'active' ? 'تجميد حساب الطالب' : 'إعادة تفعيل الحساب'}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{std.status === 'active' ? 'تجميد' : 'تفعيل'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteStudent(std.id)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors cursor-pointer border border-slate-200 dark:border-slate-800"
                  title="حذف الطالب من الكورس"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Student */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-right">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span>إضافة طالب وتفعيل اشتراكه في الكورس</span>
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم الطالب *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: يوسف أحمد عبد العال"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">هاتف الطالب</label>
                  <input
                    type="tel"
                    placeholder="01012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">هاتف ولي الأمر</label>
                  <input
                    type="tel"
                    placeholder="01298765432"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني للطالب (اختياري)</label>
                <input
                  type="email"
                  placeholder="youssef@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">طريقة وسند الاشتراك</label>
                <select
                  value={subscriptionMethod}
                  onChange={(e) => setSubscriptionMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-cyan-500 focus:outline-none"
                >
                  <option value="coupon_center">كود سنتر / تسليم نقدي مباشر</option>
                  <option value="online">دفع إلكتروني معتمد</option>
                  <option value="free_grant">منحة مجانية / أوائل الطلاب</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs"
                >
                  تفعيل وإضافة الطالب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

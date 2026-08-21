import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Wallet, BookOpen, GraduationCap, Clock, CheckCircle2, 
  XCircle, AlertCircle, ChevronRight, FileText, PlayCircle, 
  Lock, Ticket, HeadphonesIcon, ShieldCheck, User as UserIcon, 
  CreditCard, Calendar, Star, HelpCircle, FileCheck, Award,
  Sparkles, Zap, ArrowRight, CheckCircle, RefreshCw, KeyRound,
  DollarSign, Send, Info, BellRing, Smartphone, ShieldAlert, Users,
  NotebookPen, Plus, Trash2, Edit2, Pin, CalendarDays, Layers,
  Laptop, Monitor, Tablet, AlertTriangle, Shield
} from 'lucide-react';
import { StudentAssignmentView } from './student/StudentAssignmentView';
import { StudentQuestionBankView } from './student/StudentQuestionBankView';
import { detectCurrentDevice } from '../utils/deviceUtils';
import { CourseSubscribeModal } from './CourseSubscribeModal';
import { Course } from '../types';

export const StudentPortal: React.FC = () => {
  const { 
    currentUser, 
    courses, 
    exams, 
    examSubmissions,
    assignments,
    assignmentSubmissions,
    courseAnnouncements,
    supportTickets, 
    setCurrentView, 
    setSelectedCourseId, 
    setSelectedLessonId, 
    setSelectedExamId,
    setSelectedInstructorName,
    createSupportTicket,
    rechargeWallet,
    verifyDeviceAccess,
    removeSecondaryDevice,
    redeemCourseAccessCode,
    addToast,
    theme,
    platforms,
    depositRequests,
    paymentSettings,
    submitDepositRequest,
    generalNotes,
    studyTasks,
    addGeneralNote,
    updateGeneralNote,
    deleteGeneralNote,
    addStudyTask,
    updateStudyTask,
    deleteStudyTask,
  } = useApp();

  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState<'dashboard' | 'my_courses' | 'assignments' | 'question_bank' | 'exams' | 'schedule' | 'notes' | 'wallet' | 'devices' | 'support' | 'my_profile'>('dashboard');
  const [activeSolvingAssignmentId, setActiveSolvingAssignmentId] = useState<string | null>(null);

  // Modal State for Subscription & Code Entry
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);
  const [selectedTargetCourseIdForQuickCode, setSelectedTargetCourseIdForQuickCode] = useState<string>('');

  // Device Management State
  const [isRemovingSecondary, setIsRemovingSecondary] = useState(false);
  const [showConfirmRemoveSecondary, setShowConfirmRemoveSecondary] = useState(false);

  // Exams Sub-tab: 'available' vs 'history'
  const [examSubTab, setExamSubTab] = useState<'available' | 'history'>('available');

  // Quick Code Redemption State
  const [quickCode, setQuickCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Wallet Custom Recharge State
  const [rechargeAmountInput, setRechargeAmountInput] = useState('100');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'fawry' | 'vodafone' | 'card'>('fawry');

  // Support Ticket State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  // General Notes State
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Study Task State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [ticketCategory, setTicketCategory] = useState<'technical' | 'billing' | 'academic' | 'other'>('technical');

  // Real Deposit Request State
  const [depositAmount, setDepositAmount] = useState('250');
  const [depositMethod, setDepositMethod] = useState<'vodafone' | 'instapay' | 'fawry' | 'manual'>('vodafone');
  const [depositSenderNumber, setDepositSenderNumber] = useState('');
  const [depositTransactionId, setDepositTransactionId] = useState('');
  const [depositScreenshot, setDepositScreenshot] = useState('');
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);

  // Derived Data
  const enrolledCourses = useMemo(() => {
    if (!currentUser) return [];
    return courses.filter(c => currentUser.enrolledCourseIds?.includes(c.id));
  }, [currentUser, courses]);

  const availableExams = useMemo(() => {
    return exams.filter(e => enrolledCourses.some(c => c.id === e.courseId));
  }, [exams, enrolledCourses]);

  const myExamSubmissions = useMemo(() => {
    if (!currentUser) return [];
    return examSubmissions.filter(sub => sub.studentId === currentUser.id || sub.studentName === currentUser.name);
  }, [examSubmissions, currentUser]);

  const myTickets = useMemo(() => {
    if (!currentUser) return [];
    return supportTickets.filter(t => t.studentEmail === currentUser.email || t.studentName === currentUser.name);
  }, [supportTickets, currentUser]);

  const relevantAnnouncements = useMemo(() => {
    if (!enrolledCourses.length) return [];
    const courseIds = enrolledCourses.map(c => c.id);
    return courseAnnouncements.filter(a => courseIds.includes(a.courseId));
  }, [courseAnnouncements, enrolledCourses]);

  const myTeachers = useMemo(() => {
    const list: {
      name: string;
      title: string;
      avatar: string;
      subject: string;
      courseId: string;
      courseTitle: string;
      isPrimary: boolean;
    }[] = [];

    const seenNames = new Set<string>();

    enrolledCourses.forEach(course => {
      // Find platform primary teacher
      const platform = platforms.find(p => p.id === course.platformId);
      if (platform) {
        const teacherName = platform.teacherName || 'المعلم المعتمد';
        if (!seenNames.has(teacherName.toLowerCase())) {
          seenNames.add(teacherName.toLowerCase());
          list.push({
            name: teacherName,
            title: platform.teacherTitle || 'أستاذ المادة القدير',
            avatar: platform.teacherAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200',
            subject: course.subject,
            courseId: course.id,
            courseTitle: course.title,
            isPrimary: true
          });
        }
      }

      // Find participating teachers
      if (course.participatingTeachers && course.participatingTeachers.length > 0) {
        course.participatingTeachers.forEach(pt => {
          if (!seenNames.has(pt.name.toLowerCase())) {
            seenNames.add(pt.name.toLowerCase());
            list.push({
              name: pt.name,
              title: pt.title || 'أستاذ المادة المساعد',
              avatar: pt.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
              subject: pt.subject || course.subject,
              courseId: course.id,
              courseTitle: course.title,
              isPrimary: false
            });
          }
        });
      }
    });

    return list;
  }, [enrolledCourses, platforms]);

  const handleOpenCourse = (courseId: string) => {
    const access = verifyDeviceAccess();
    if (!access.success) {
      addToast('error', access.message);
      return;
    }
    if (access.isNewDevice) {
      addToast('info', access.message);
    }
    setSelectedCourseId(courseId);
    setSelectedInstructorName(null); // Reset teacher filter when opening course generally
    setCurrentView('course_detail');
  };

  const handleOpenTeacher = (teacher: { name: string; courseId: string }) => {
    const access = verifyDeviceAccess();
    if (!access.success) {
      addToast('error', access.message);
      return;
    }
    if (access.isNewDevice) {
      addToast('info', access.message);
    }
    setSelectedCourseId(teacher.courseId);
    setSelectedInstructorName(teacher.name);
    setCurrentView('course_detail');
  };

  const handleStartExam = (examId: string, courseId: string) => {
    const access = verifyDeviceAccess();
    if (!access.success) {
      addToast('error', access.message);
      return;
    }
    if (access.isNewDevice) {
      addToast('info', access.message);
    }
    setSelectedCourseId(courseId);
    setSelectedExamId(examId);
    setCurrentView('exam_view');
  };

  const handleQuickRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCode.trim()) return;
    setIsRedeeming(true);
    try {
      const res = redeemCourseAccessCode(quickCode.trim(), selectedTargetCourseIdForQuickCode || undefined);
      if (res.success) {
        setQuickCode('');
        setSelectedTargetCourseIdForQuickCode('');
      }
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleSubmitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) {
      addToast('warning', 'يرجى تحديد أو كتابة مبلغ شحن صحيح أكبر من صفر.');
      return;
    }

    if (depositMethod === 'vodafone' && !depositSenderNumber.trim()) {
      addToast('warning', 'يرجى كتابة رقم الهاتف الذي قمت بالتحويل منه لتأكيد المعاملة.');
      return;
    }

    if ((depositMethod === 'instapay' || depositMethod === 'fawry') && !depositTransactionId.trim()) {
      addToast('warning', 'يرجى كتابة كود أو رقم عملية التحويل (Transaction ID).');
      return;
    }

    setIsSubmittingDeposit(true);
    setTimeout(() => {
      submitDepositRequest({
        studentId: currentUser.id,
        studentName: currentUser.fourPartName || currentUser.name,
        studentEmail: currentUser.email,
        studentPhone: currentUser.phone || '',
        amount,
        paymentMethod: depositMethod,
        senderNumber: depositMethod === 'vodafone' ? depositSenderNumber.trim() : undefined,
        transactionId: (depositMethod === 'instapay' || depositMethod === 'fawry') ? depositTransactionId.trim() : undefined,
        screenshotUrl: depositScreenshot.trim() || undefined,
      });
      setDepositSenderNumber('');
      setDepositTransactionId('');
      setDepositScreenshot('');
      setIsSubmittingDeposit(false);
    }, 600);
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !ticketSubject.trim() || !ticketMessage.trim()) return;

    createSupportTicket({
      title: ticketSubject,
      message: ticketMessage,
      category: ticketCategory,
      studentName: currentUser.fourPartName || currentUser.name,
      studentEmail: currentUser.email,
      studentPhone: currentUser.phone || 'غير مسجل',
      severity: 'medium',
    });

    setTicketSubject('');
    setTicketMessage('');
  };

  if (!currentUser || currentUser.role !== 'student') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in" dir="rtl">
        <div className="w-24 h-24 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500 mb-6 shadow-xl p-2 overflow-hidden">
          <img 
            src="/student-logo.png" 
            alt="شعار قطاع الطلاب" 
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.unauth-student-fallback');
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
          <GraduationCap className="unauth-student-fallback hidden w-12 h-12 text-cyan-500" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">بوابة الطلاب والتعلّم المعتمد (SEA)</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8 text-sm leading-relaxed">
          هذه الصفحة مخصصة لطلاب المنظومة التعليمية فقط للوصول لمقرراتهم وامتحاناتهم ومحفظتهم. يرجى تسجيل الدخول بحساب طالب.
        </p>
        <button 
          onClick={() => setCurrentView('home')}
          className="px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-lg shadow-cyan-600/20"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  // --- RENDER DASHBOARD TAB ---
  const renderDashboard = () => {
    const myTasks = studyTasks.filter(t => t.studentId === currentUser?.id && t.status === 'pending').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const myNotes = generalNotes.filter(n => n.studentId === currentUser?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
      <div className="space-y-6 animate-fade-in text-right" dir="rtl">
        {/* Advanced Welcome Banner (Glassmorphism & Gradients) */}
        <div className="relative overflow-hidden rounded-[32px] p-8 md:p-10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-white/10 shadow-2xl">
          {/* Decorative Orbs */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 p-1.5 flex items-center justify-center shadow-xl shrink-0 overflow-hidden backdrop-blur-md">
                  <img
                    src="/student-logo.png"
                    alt="شعار قطاع الطلاب SEA"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                      const fallback = e.currentTarget.parentElement?.querySelector('.student-portal-banner-fallback');
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                  <GraduationCap className="student-portal-banner-fallback hidden w-8 h-8 text-cyan-400 stroke-[2.5]" />
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-xs font-black text-cyan-300">
                  <Sparkles className="w-4 h-4" />
                  <span>كود الطالب الموحد: {currentUser.studentCode || `SEA-${currentUser.id.slice(-6).toUpperCase()}`}</span>
                </div>
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
                  مرحباً بك، <span className="text-transparent bg-clip-text bg-gradient-to-l from-cyan-400 to-emerald-400">{currentUser.fourPartName?.split(' ')[0] || currentUser.name}</span> 👋
                </h2>
                <p className="text-slate-300 text-sm max-w-2xl leading-relaxed font-medium">
                  مرحباً بك في منظومة الطلاب الذكية SEA. حيث يلتقي التميز الأكاديمي بالتطور التقني. تابع مسارك، نظم وقتك، واختبر قدراتك في بيئة تعليمية لا تضاهى.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button 
                onClick={() => setActiveTab('wallet')}
                className="group relative px-6 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white font-black text-sm rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-4 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">رصيد الخزانة المعتمد</span>
                    <span className="block text-xl tracking-tight">{currentUser.walletBalance || 0} <span className="text-xs text-emerald-400">ج.م</span></span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
              </button>
              
              <button 
                onClick={() => setCurrentView('platforms')}
                className="px-6 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-0.5"
              >
                <BookOpen className="w-5 h-5" />
                <span>الاشتراك في المقررات والمراجعات</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bento Grid Analytics & Utilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Courses Bento */}
          <div 
            onClick={() => setActiveTab('my_courses')}
            className="col-span-1 lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-indigo-400/50 transition-all cursor-pointer group overflow-hidden relative"
          >
            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mt-10 -mr-10" />
            <div className="flex items-start justify-between relative z-10 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/50">
                <PlayCircle className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">المقررات الدراسية المفعلة</p>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white flex items-baseline gap-2">
                {enrolledCourses.length} <span className="text-sm font-bold text-indigo-500">مادة / كورس</span>
              </h3>
            </div>
          </div>

          {/* Exams Bento */}
          <div 
            onClick={() => {
              setActiveTab('exams');
              setExamSubTab('available');
            }}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-amber-400/50 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mt-10 -mr-10" />
            <div className="flex items-start justify-between relative z-10 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center border border-amber-100 dark:border-amber-800/50">
                <FileCheck className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">امتحانات متاحة للحل</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
                {availableExams.length} <span className="text-xs font-bold text-amber-500">اختبار</span>
              </h3>
            </div>
          </div>

          {/* Schedule Summary Bento */}
          <div 
            onClick={() => setActiveTab('schedule')}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-rose-400/50 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl -mt-10 -mr-10" />
            <div className="flex items-start justify-between relative z-10 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center border border-rose-100 dark:border-rose-800/50">
                <CalendarDays className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">مهام دراسية قيد الانتظار</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
                {myTasks.length} <span className="text-xs font-bold text-rose-500">مهمة</span>
              </h3>
            </div>
          </div>
        </div>

        {/* Utilities & Quick Access Strip */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Code & Recharging */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800/50 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white">الاسترداد السريع للأكواد والشحن</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">أدخل كارت التفعيل (المقرر) أو كارت شحن المحفظة.</p>
              </div>
            </div>
            <form onSubmit={handleQuickRedeem} className="flex flex-col sm:flex-row items-center gap-3">
              <input 
                type="text" 
                value={quickCode}
                onChange={(e) => setQuickCode(e.target.value)}
                placeholder="أدخل الكود هنا (مثال: KODE-2026-ENG)"
                className="flex-1 w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono uppercase focus:border-cyan-500 focus:outline-none transition-all"
              />
              <button 
                type="submit" 
                disabled={isRedeeming || !quickCode.trim()}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 text-white dark:text-slate-900 font-black text-sm transition-all shadow-md cursor-pointer whitespace-nowrap"
              >
                {isRedeeming ? 'يتم التحقق...' : 'تفعيل الكود'}
              </button>
            </form>
          </div>

          {/* Quick Notes Access */}
          <div 
            onClick={() => setActiveTab('notes')}
            className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-100 dark:border-emerald-800/30 flex flex-col justify-between shadow-sm cursor-pointer group hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <NotebookPen className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-300 dark:text-emerald-700 group-hover:-translate-x-1 transition-transform" />
            </div>
            <div className="relative z-10">
              <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1">ملاحظاتي</h4>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex justify-between items-center">
                <span>{myNotes.length} ملاحظة مدونة</span>
                <span className="text-[10px] bg-white/50 dark:bg-slate-900/50 px-2 py-1 rounded-md text-emerald-600 dark:text-emerald-400">فتح الدفتر</span>
              </p>
            </div>
          </div>
        </div>

        {/* Announcements if any */}
        {relevantAnnouncements.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BellRing className="w-5 h-5 text-amber-500" />
              لوحة إعلانات المؤسسة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relevantAnnouncements.slice(0, 3).map(anc => (
                <div key={anc.id} className="p-5 rounded-3xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-900/30 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-1 h-full bg-amber-400" />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-black text-amber-900 dark:text-amber-100 line-clamp-1 pl-4">{anc.title}</span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-500 font-mono bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full whitespace-nowrap">{anc.createdAt}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">{anc.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* My Subscribed Teachers Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            مدرسيّ المعتمدون في المنظومة
          </h3>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> معتمدون ومتاحون للتواصل
          </span>
        </div>

        {myTeachers.length === 0 ? (
          <div className="p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-900/50">
            <p className="text-xs text-slate-500 dark:text-slate-400">لم تشترك مع أي معلم بعد. تصفح المنصات لتفعيل المقررات.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTeachers.map((teacher, idx) => (
              <div 
                key={idx}
                onClick={() => handleOpenTeacher(teacher)}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-cyan-500 transition-all group flex items-center gap-4 shadow-sm"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md overflow-hidden shrink-0">
                  <img 
                    src={teacher.avatar} 
                    alt={teacher.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-slate-900 dark:text-white truncate group-hover:text-cyan-500 transition-colors">
                      {teacher.name}
                    </h4>
                    {teacher.isPrimary && (
                      <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 text-[9px] font-black shrink-0 border border-cyan-500/10">
                        رئيسي 👑
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{teacher.title}</p>
                  <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold mt-1">
                    📖 المادة: {teacher.subject} • {teacher.courseTitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Continue Learning Course Cards */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-indigo-500" />
            متابعة المذاكرة والمحاضرات
          </h3>
          <button 
            onClick={() => setActiveTab('my_courses')} 
            className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 flex items-center gap-1 transition-colors cursor-pointer"
          >
            عرض جميع كورساتي <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="p-10 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-900/50">
            <GraduationCap className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">أنت لست مشتركاً في أي كورس بعد</h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto mb-5 leading-relaxed">
              اشترك في كورسات المعلمين عبر رصيد محفظتك أو بإدخال كود المدرس للبدء فوراً.
            </p>
            <button 
              onClick={() => setCurrentView('platforms')} 
              className="px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-lg shadow-cyan-600/20 cursor-pointer"
            >
              تصفح منصات ومقررات المعلمين
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {enrolledCourses.slice(0, 3).map(course => (
              <div 
                key={course.id} 
                onClick={() => handleOpenCourse(course.id)} 
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-cyan-500 transition-all group flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="aspect-video rounded-2xl bg-slate-100 dark:bg-slate-800 mb-3 overflow-hidden relative">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-3">
                       <span className="px-2.5 py-1 bg-cyan-600 text-white text-[10px] font-black rounded-lg backdrop-blur-md">
                         دخول المحتوى الشامل 🚀
                       </span>
                       {course.participatingTeachers && course.participatingTeachers.length > 0 && (
                         <span className="px-2 py-0.5 bg-indigo-600/90 text-white text-[10px] font-bold rounded-lg backdrop-blur-md">
                           👨‍🏫 كادر تعليمي معتمد
                         </span>
                       )}
                    </div>
                  </div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-cyan-500 transition-colors">
                    {course.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{course.subject} • {course.gradeLevel}</p>

                  <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800">
                      🎬 فيديوهات HD
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                      📝 امتحانات ذكية
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                      📚 مذكرات PDF
                    </span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>{course.lessonsCount || 12} محتوى تفاعلي</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-1">
                    فتح المنهج <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
    );
  };

  // --- RENDER SCHEDULE TAB ---
  const renderSchedule = () => {
    const myTasks = studyTasks.filter(t => t.studentId === currentUser?.id).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    return (
      <div className="space-y-6 animate-fade-in text-right" dir="rtl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              جدول المذاكرة والمهام
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">نظم وقتك، تابع مهامك الدراسية، ولا تفوت أي التزامات.</p>
          </div>
          <button
            onClick={() => setIsAddingTask(!isAddingTask)}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-cyan-600/20"
          >
            {isAddingTask ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAddingTask ? 'إلغاء الإضافة' : 'إضافة مهمة جديدة'}</span>
          </button>
        </div>

        {isAddingTask && (
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">عنوان المهمة</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="مثال: مراجعة الفصل الأول في الفيزياء"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">تاريخ الإنجاز (الموعد)</label>
              <input
                type="date"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => {
                if (!newTaskTitle.trim() || !newTaskDate) {
                  addToast('warning', 'الرجاء إدخال عنوان وتاريخ المهمة');
                  return;
                }
                addStudyTask({
                  studentId: currentUser!.id,
                  title: newTaskTitle,
                  dueDate: newTaskDate,
                  status: 'pending',
                  priority: 'medium',
                });
                setNewTaskTitle('');
                setNewTaskDate('');
                setIsAddingTask(false);
              }}
              className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs transition-colors hover:bg-slate-800 dark:hover:bg-slate-100"
            >
              حفظ المهمة في الجدول
            </button>
          </div>
        )}

        {myTasks.length === 0 && !isAddingTask ? (
          <div className="p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <CalendarDays className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-2">لا توجد مهام مجدولة حالياً</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              ابدأ بإضافة مهامك الدراسية ومواعيد المذاكرة الخاصة بك لتنظيم وقتك بفعالية.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {myTasks.map(task => (
              <div key={task.id} className={`p-4 rounded-2xl border ${task.status === 'completed' ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-slate-900 border-cyan-100 dark:border-cyan-900/30'} flex items-center justify-between shadow-sm transition-all hover:shadow-md`}>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => updateStudyTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' })}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'completed' ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-slate-300 dark:border-slate-600 hover:border-cyan-400'}`}
                  >
                    {task.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <div>
                    <h4 className={`text-sm font-bold ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>{task.title}</h4>
                    <span className="text-xs text-cyan-600 dark:text-cyan-400 font-bold mt-1 inline-block" dir="ltr">{new Date(task.dueDate).toLocaleDateString('ar-EG', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteStudyTask(task.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // --- RENDER NOTES TAB ---
  const renderNotes = () => {
    const myNotes = generalNotes.filter(n => n.studentId === currentUser?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
      <div className="space-y-6 animate-fade-in text-right" dir="rtl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <NotebookPen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              ملاحظاتي الخاصة
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">دفتر إلكتروني خاص بك لتدوين الملاحظات، الأفكار، وأهم القواعد.</p>
          </div>
          <button
            onClick={() => setIsAddingNote(!isAddingNote)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-emerald-600/20"
          >
            {isAddingNote ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAddingNote ? 'إلغاء' : 'تدوين ملاحظة'}</span>
          </button>
        </div>

        {isAddingNote && (
          <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 shadow-xl space-y-4">
            <div>
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="عنوان الملاحظة (اختياري)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="اكتب ملاحظاتك هنا بحرية تامة..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm leading-relaxed focus:border-emerald-500 focus:outline-none resize-none"
              />
            </div>
            <button
              onClick={() => {
                if (!newNoteContent.trim()) {
                  addToast('warning', 'الرجاء كتابة محتوى للملاحظة أولاً');
                  return;
                }
                addGeneralNote({
                  studentId: currentUser!.id,
                  title: newNoteTitle.trim() || 'ملاحظة سريعة',
                  content: newNoteContent,
                  isPinned: false,
                });
                setNewNoteTitle('');
                setNewNoteContent('');
                setIsAddingNote(false);
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs transition-colors shadow-md shadow-emerald-600/20"
            >
              حفظ الملاحظة
            </button>
          </div>
        )}

        {myNotes.length === 0 && !isAddingNote ? (
          <div className="p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <NotebookPen className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-2">دفتر الملاحظات فارغ</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              لم تقم بتدوين أي ملاحظات حتى الآن. استخدم الدفتر لتلخيص القواعد وتدوين أفكارك المهمة.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myNotes.map(note => (
              <div key={note.id} className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/30 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-black text-slate-800 dark:text-amber-100 text-sm line-clamp-1">{note.title}</h3>
                    <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'text-rose-500 fill-rose-500' : 'text-slate-400'} shrink-0 cursor-pointer`} onClick={() => updateGeneralNote(note.id, { isPinned: !note.isPinned })} />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap line-clamp-6">{note.content}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-amber-200/50 dark:border-amber-800/50 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                  <span>{new Date(note.createdAt).toLocaleDateString('ar-EG')}</span>
                  <button onClick={() => deleteGeneralNote(note.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // --- RENDER MY COURSES TAB ---
  const renderMyCourses = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
         <div>
           <h2 className="text-2xl font-black text-slate-900 dark:text-white">المقررات والكورسات المفعلة</h2>
           <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">جميع المواد والمحاضرات المصرح لك بمشاهدتها والتفاعل معها.</p>
         </div>
         <div className="flex items-center gap-3">
           <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-black flex items-center gap-1">
             <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> مقرراتك المفعلة
           </span>
           <button 
             onClick={() => setCurrentView('platforms')}
             className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black transition-colors cursor-pointer"
           >
             + شراء أو تفعيل كورس جديد
           </button>
         </div>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="p-12 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center">
          <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">لا توجد كورسات مفعلة حالياً</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
            يمكنك تصفح سوق المنصات وشراء الكورس عبر محفظتك أو إدخال كود الحصة الممنوح لك من أستاذ المادة.
          </p>
          <button 
            onClick={() => setCurrentView('platforms')} 
            className="px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-lg shadow-cyan-600/20 cursor-pointer"
          >
            تصفح سوق المنصات المعتمدة
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map(course => (
            <div key={course.id} className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between hover:border-cyan-400 transition-all">
              <div>
                <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg shadow-sm">
                    مفعل ومشترك ✅
                  </div>
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-cyan-300 text-[10px] font-bold rounded-lg border border-cyan-500/30">
                    {course.subject}
                  </div>
                  {course.participatingTeachers && course.participatingTeachers.length > 0 && (
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-indigo-600/90 text-white text-[10px] font-bold rounded-lg backdrop-blur-md">
                      👨‍🏫 كادر تعليمي معتمد
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h4 className="font-black text-base text-slate-900 dark:text-white mb-1 line-clamp-1">{course.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{course.description}</p>

                  <div className="flex items-center gap-1.5 mb-3 flex-wrap text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800">
                      🎬 فيديوهات
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                      📝 امتحانات
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                      📚 مذكرات PDF
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>{course.modules?.length || 1} وحدات</span>
                    <span>•</span>
                    <span>{course.lessonsCount || 12} محتوى دراسي متكامل</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button 
                  onClick={() => handleOpenCourse(course.id)} 
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs rounded-2xl transition-all shadow-md shadow-indigo-900/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>دخول المقرر واستعراض كافة المحتويات</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // --- RENDER ASSIGNMENTS & CONCEPT SHEET TAB ---
  const renderAssignments = () => {
    // Show published assignments created by teachers
    const publishedAssignments = assignments.filter((a) => a.isPublished !== false && a.status !== 'draft');
    const relevantAssignments = publishedAssignments;

    return (
      <div className="space-y-6 animate-fade-in text-right" dir="rtl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-teal-500" />
              الواجبات والتكليفات التخصصية
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              واجبات مجهزة بورقة مفاهيم وقواعد استرشادية مرافقة وتصحيح إلكتروني ذكي فوري.
            </p>
          </div>
        </div>

        {relevantAssignments.length === 0 ? (
          <div className="p-12 rounded-[32px] border border-slate-200 dark:border-slate-800 text-center bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <FileText className="w-14 h-14 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">لا توجد واجبات معلنة حالياً</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">سيقوم مدرسوك بنشر التكليفات مصحوبة بأوراق المفاهيم هنا فور تجهيزها.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {relevantAssignments.map((asg) => {
              const relCourse = courses.find((c) => c.id === asg.courseId);
              const relModule = relCourse?.modules?.find((m) => m.id === asg.moduleId);
              
              // Check submission from global assignmentSubmissions or embedded
              const studentSubmission = (assignmentSubmissions || []).find(
                (s) => s.assignmentId === asg.id && (s.studentId === currentUser?.id || s.studentName === currentUser?.name)
              ) || asg.submissions?.find((s) => s.studentId === currentUser?.id);

              const isPassed = studentSubmission ? (studentSubmission.percentage >= (asg.passingPercentage || 50)) : false;

              return (
                <div
                  key={asg.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-teal-500 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold">
                        {relCourse ? relCourse.title : (asg.subject || 'كورس عام')}
                      </span>
                      {asg.allowConceptSheet && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] font-black border border-amber-500/20">
                          ورقة مفاهيم 📑
                        </span>
                      )}
                    </div>

                    {relModule && (
                      <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                        <span>الوحدة:</span>
                        <span className="text-slate-700 dark:text-slate-300">{relModule.title}</span>
                      </p>
                    )}

                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {asg.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {asg.description || 'واجب دوري للتطبيق على القواعد والمفاهيم الأساسية'}
                    </p>

                    <div className="pt-2 grid grid-cols-3 gap-1 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl text-[11px] text-slate-600 dark:text-slate-400 font-mono text-center">
                      <div>
                        <div className="text-[9px] text-slate-400 font-sans">الأسئلة</div>
                        <div className="font-bold">{asg.questions?.length || 0}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 font-sans">الدرجة</div>
                        <div className="font-bold">{asg.totalPoints || 0}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 font-sans">المدة</div>
                        <div className="font-bold">{asg.durationMinutes || 30} د</div>
                      </div>
                    </div>

                    {studentSubmission && (
                      <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                        isPassed 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                      }`}>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>{isPassed ? 'تم الاجتياز بنجاح ✅' : 'يحتاج مراجعة وإعادة ⚠️'}</span>
                        </div>
                        <span className="font-mono font-black text-sm">
                          {studentSubmission.score} / {asg.totalPoints} ({studentSubmission.percentage}%)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setActiveSolvingAssignmentId(asg.id)}
                      className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-teal-900/20 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{studentSubmission ? 'إعادة حل التكليف 🔄' : 'بدء حل التكليف الآن 🚀'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // --- RENDER EXAMS & RESULTS TAB ---
  const renderExams = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
         <div>
           <h2 className="text-2xl font-black text-slate-900 dark:text-white">منظومة الامتحانات الذكية SEA</h2>
           <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
             بيئة امتحانات مؤمنة بالكامل بملء الشاشة تضمن النزاهة والانضباط الأكاديمي.
           </p>
         </div>

         {/* Sub-tab Pill Switcher */}
         <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
           <button
             onClick={() => setExamSubTab('available')}
             className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
               examSubTab === 'available'
                 ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
                 : 'text-slate-600 dark:text-slate-400'
             }`}
           >
             الامتحانات المتاحة ({availableExams.length})
           </button>
           <button
             onClick={() => setExamSubTab('history')}
             className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
               examSubTab === 'history'
                 ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                 : 'text-slate-600 dark:text-slate-400'
             }`}
           >
             سجل نتائجي وشهاداتي ({myExamSubmissions.length})
           </button>
         </div>
      </div>

      {examSubTab === 'available' && (
        <>
          {availableExams.length === 0 ? (
            <div className="p-12 rounded-[32px] border border-slate-200 dark:border-slate-800 text-center bg-white dark:bg-slate-900 shadow-sm">
              <FileCheck className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">لا توجد امتحانات جديدة حالياً</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                بمجرد أن يطرح المعلم اختبارات جديدة للكورسات المشترك بها، ستظهر هنا فوراً للإجابة في البيئة المؤمنة.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableExams.map(exam => {
                const relatedCourse = courses.find(c => c.id === exam.courseId);
                const hasTaken = myExamSubmissions.some(s => s.examId === exam.id);

                return (
                  <div key={exam.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm hover:border-amber-400 transition-all space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-black text-base text-slate-900 dark:text-white">{exam.title}</h4>
                          {hasTaken && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                              تم الحل مسبقاً
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{relatedCourse?.title}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5" /> {exam.durationMinutes} دقيقة
                          </span>
                          <span className="flex items-center gap-1 text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-900/30 px-2.5 py-1 rounded-lg">
                            <Star className="w-3.5 h-3.5 text-amber-500" /> {exam.totalPoints || 10} درجة
                          </span>
                          <span className="flex items-center gap-1 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-2.5 py-1 rounded-lg">
                            <ShieldCheck className="w-3.5 h-3.5" /> بيئة مؤمنة 100%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {exam.allowRetake ? '🔄 يُسمح بإعادة المحاولة' : '🔒 محاولة واحدة فقط'}
                      </span>
                      <button 
                        onClick={() => handleStartExam(exam.id, exam.courseId)} 
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                      >
                        {hasTaken ? 'إعادة الاختبار' : 'بدء الاختبار الآن 🚀'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {examSubTab === 'history' && (
        <>
          {myExamSubmissions.length === 0 ? (
            <div className="p-12 rounded-[32px] border border-slate-200 dark:border-slate-800 text-center bg-white dark:bg-slate-900 shadow-sm">
              <Award className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">لا توجد امتحانات مكتملة بعد</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                عند قيامك بحل أي امتحان، سيتم حفظ درجتك وتفاصيل الإجابات والمخالفات في سجلك الأكاديمي الموثق هنا.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myExamSubmissions.map(sub => {
                const isCancelled = sub.isCancelledDueToViolation;
                const isPassed = sub.passed;

                return (
                  <div key={sub.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-base shrink-0 ${
                        isCancelled ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                        isPassed ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {sub.percentage}%
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-base text-slate-900 dark:text-white">{sub.examTitle}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            isCancelled ? 'bg-rose-500 text-white' :
                            isPassed ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                            'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}>
                            {isCancelled ? '⚠️ تم الإلغاء بسبب مخالفة أمنية' : isPassed ? 'ناجح ومجتاز ✅' : 'لم يحقق نسبة النجاح'}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span>الدرجة: <strong className="text-slate-900 dark:text-white">{sub.score}</strong> من {sub.totalPoints}</span>
                          <span>•</span>
                          <span>الوقت المستغرق: {Math.round(sub.timeSpentSeconds / 60)} دقيقة</span>
                          <span>•</span>
                          <span>تاريخ التسليم: {new Date(sub.submittedAt).toLocaleDateString('ar-EG')}</span>
                        </div>

                        {sub.violationReason && (
                          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-1">
                            سبب المخالفة: {sub.violationReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        مراقب برقم محاولة #{sub.id.slice(-5).toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );

  // --- RENDER DIGITAL WALLET & VOUCHERS TAB ---
  const renderWallet = () => {
    // Filter deposit requests to only show the ones submitted by the current student
    const myDeposits = depositRequests.filter(req => req.studentId === currentUser?.id || req.studentEmail?.toLowerCase() === currentUser?.email?.toLowerCase());

    return (
      <div className="space-y-6 animate-fade-in text-right" dir="rtl">
        <div className="px-1 text-right">
           <h2 className="text-2xl font-black text-slate-900 dark:text-white">المحفظة الإلكترونية والمعاملات الرسمية</h2>
           <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">شحن محفظتك، تقديم طلبات المراجعة الفنية، واسترداد كوبونات تفعيل المقررات.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Wallet Balance Display Card */}
          <div className="p-8 rounded-[32px] bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white shadow-xl flex flex-col justify-between relative overflow-hidden text-right">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-2 relative z-10">
              <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">الرصيد المتاح بالمحفظة</span>
              <div className="flex items-baseline gap-2 justify-start">
                <span className="text-5xl font-black">{currentUser?.walletBalance || 0}</span>
                <span className="text-lg font-bold text-emerald-200">جنيه مصري</span>
              </div>
            </div>

            <div className="pt-8 space-y-3 relative z-10">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-emerald-50 leading-relaxed text-right">
                💡 الرصيد محمي بالكامل ويخضع للرقابة المالية المركزية. يمكنك استخدام هذا الرصيد للاشتراك فوراً في الحصص والكورسات.
              </div>
              <div className="flex items-center justify-between text-xs text-emerald-200">
                <span>كود الطالب: {currentUser?.studentCode || `SEA-${currentUser?.id.slice(-6).toUpperCase()}`}</span>
                <span className="font-bold">الحساب: موثق ومفعل ✅</span>
              </div>
            </div>
          </div>

          {/* Code Voucher Redemption Box */}
          <div className="p-6 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between text-right">
            <div>
              <div className="flex items-center gap-2 mb-2 justify-start">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">تفعيل كود مقرر / حصة (16 حرف)</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 text-right">
                أدخل الكود المطبوع الصادر لك من المعلم أو السنتر لتفعيل المقرر الدراسي على حسابك فوراً وبشكل مشفر.
              </p>

              <form onSubmit={handleQuickRedeem} className="space-y-3">
                {courses.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      تحديد الكورس المراد تفعيله (اختياري للتحقق الدقيق):
                    </label>
                    <select
                      value={selectedTargetCourseIdForQuickCode}
                      onChange={(e) => setSelectedTargetCourseIdForQuickCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="">كشف الكورس تلقائياً من الكود 🎯</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} ({c.price} ج.م)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <input 
                    type="text" 
                    value={quickCode}
                    onChange={(e) => setQuickCode(e.target.value)}
                    placeholder="مثال: ABCD-EFGH-IJKL-MNOP"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono uppercase text-center text-slate-900 dark:text-white tracking-widest focus:border-cyan-500 focus:outline-none font-black"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isRedeeming || !quickCode.trim()}
                  className="w-full py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs transition-all shadow-md shadow-cyan-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isRedeeming ? 'جارِ التحقق وتفعيل الكود...' : 'تأكيد تفعيل الكود وفتح المقرر'}</span>
                </button>
              </form>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 text-right">
                🔒 الأكواد مؤمنة ومشفرة بدقة، وتعمل لمرة واحدة فقط ومخصصة لكورس المعلم المطبوع لأجله.
              </div>
            </div>
          </div>

          {/* Secure Real-World Wallet Recharge Request Form */}
          <div className="p-6 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-right">
            <div className="flex items-center gap-2 mb-2 justify-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">طلب شحن رصيد رسمي</h3>
            </div>

            {!(paymentSettings.vodafoneEnabled || paymentSettings.instapayEnabled || paymentSettings.fawryEnabled || paymentSettings.manualEnabled) ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 leading-relaxed text-right">
                ⚠️ عذراً، تم تعطيل استقبال طلبات الشحن مؤقتاً بواسطة الإدارة العليا للمنظومة لدواعي الصيانة المالية.
              </div>
            ) : (
              <form onSubmit={handleSubmitDeposit} className="space-y-3">
                
                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 text-right">اختر وسيلة التحويل المتاحة</label>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentSettings.vodafoneEnabled && (
                      <button
                        type="button"
                        onClick={() => setDepositMethod('vodafone')}
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                          depositMethod === 'vodafone' 
                            ? 'bg-rose-600 text-white shadow-sm font-black' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        فودافون كاش
                      </button>
                    )}
                    {paymentSettings.instapayEnabled && (
                      <button
                        type="button"
                        onClick={() => setDepositMethod('instapay')}
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                          depositMethod === 'instapay' 
                            ? 'bg-emerald-600 text-white shadow-sm font-black' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        إنستاباي (InstaPay)
                      </button>
                    )}
                    {paymentSettings.fawryEnabled && (
                      <button
                        type="button"
                        onClick={() => setDepositMethod('fawry')}
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                          depositMethod === 'fawry' 
                            ? 'bg-amber-500 text-white shadow-sm font-black' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        فوري (Fawry)
                      </button>
                    )}
                    {paymentSettings.manualEnabled && (
                      <button
                        type="button"
                        onClick={() => setDepositMethod('manual')}
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                          depositMethod === 'manual' 
                            ? 'bg-slate-800 text-white shadow-sm font-black' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        دفع يدوي بالسنتر
                      </button>
                    )}
                  </div>
                </div>

                {/* Instructions depending on method */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 text-[11px] leading-relaxed text-right space-y-1">
                  {depositMethod === 'vodafone' && (
                    <>
                      <p className="font-bold text-rose-600 dark:text-rose-400">📲 رقم المحفظة الرسمي:</p>
                      <p className="font-mono text-xs select-all text-slate-800 dark:text-slate-200 font-bold tracking-widest">{paymentSettings.vodafoneNumber}</p>
                      <p className="text-slate-500">قم بتحويل المبلغ المطلوب للرقم أعلاه، ثم املأ البيانات التالية بالأسفل لتأكيد المعاملة.</p>
                    </>
                  )}
                  {depositMethod === 'instapay' && (
                    <>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">💳 عنوان إنستاباي الرسمي:</p>
                      <p className="font-mono text-xs select-all text-slate-800 dark:text-slate-200 font-bold tracking-wider">{paymentSettings.instapayAddress}</p>
                      <p className="text-slate-500">حول عبر تطبيق InstaPay للعنوان المكتوب، واكتب كود العملية بالأسفل للمطابقة.</p>
                    </>
                  )}
                  {depositMethod === 'fawry' && (
                    <>
                      <p className="font-bold text-amber-600 dark:text-amber-500">🏪 كود خدمة فوري للتحصيل:</p>
                      <p className="font-mono text-xs select-all text-slate-800 dark:text-slate-200 font-bold tracking-wider">{paymentSettings.fawryCode}</p>
                      <p className="text-slate-500">ادفع في أي منفذ فوري على الكود المذكور، واكتب رقم الإيصال المرجعي بالأسفل.</p>
                    </>
                  )}
                  {depositMethod === 'manual' && (
                    <>
                      <p className="font-bold text-slate-700 dark:text-slate-300">🏛️ الدفع اليدوي بمقر السنتر:</p>
                      <p className="text-slate-500">توجه إلى السكرتارية في السنتر، ادفع نقدياً، واطلب إيداعاً بالمحفظة. سيمنحك الموظف إيصالاً يدوياً.</p>
                    </>
                  )}
                </div>

                {/* Amount input */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 text-right">المبلغ المراد شحنه (جنيه مصري)</label>
                  <input 
                    type="number" 
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="10"
                    placeholder="250"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-right text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Specific field depending on method */}
                {depositMethod === 'vodafone' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 text-right">رقم الهاتف المحوّل منه المعاملة</label>
                    <input 
                      type="text" 
                      value={depositSenderNumber}
                      onChange={(e) => setDepositSenderNumber(e.target.value)}
                      placeholder="مثال: 010XXXXXXXX"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-left focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                )}

                {(depositMethod === 'instapay' || depositMethod === 'fawry') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 text-right">رقم العملية / كود الإرجاع (Transaction ID)</label>
                    <input 
                      type="text" 
                      value={depositTransactionId}
                      onChange={(e) => setDepositTransactionId(e.target.value)}
                      placeholder="مثال: 94817294827"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-left focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                )}

                {/* Screenshot url / Receipt */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 text-right">صورة أو رابط إيصال الدفع (اختياري لسرعة التأكيد)</label>
                  <input 
                    type="text" 
                    value={depositScreenshot}
                    onChange={(e) => setDepositScreenshot(e.target.value)}
                    placeholder="رابط الصورة أو اكتب (تم التحويل بنجاح)"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-right text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmittingDeposit}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-xs transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {isSubmittingDeposit ? 'جارِ إرسال طلب الشحن الموثق...' : `تقديم طلب الشحن ومراجعة إيصال (${depositAmount} ج.م)`}
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Section 2: Real-world Transaction Ledger */}
        <div className="p-6 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-right">
          <div className="flex items-center gap-2 mb-4 justify-start">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">سجل طلبات شحن المحفظة (مراجعة مركزية آمنة)</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">يتم مراجعة عمليات الشحن يدوياً لمطابقة الحوالات المستلمة على الحسابات البنكية ومحافظ الكاش لضمان النزاهة وحظر الاحتيال.</p>
            </div>
          </div>

          {myDeposits.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-600 text-xs">
              لا توجد طلبات شحن حالية في سجل حسابك. يمكنك تقديم طلب شحن بالنموذج أعلاه لتبدأ دراستك.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] font-bold">
                    <th className="pb-3 text-right">رقم الطلب</th>
                    <th className="pb-3 text-right">تاريخ التقديم</th>
                    <th className="pb-3 text-right">المبلغ</th>
                    <th className="pb-3 text-right">طريقة الدفع</th>
                    <th className="pb-3 text-right">البيانات المرفقة</th>
                    <th className="pb-3 text-center">حالة الطلب</th>
                  </tr>
                </thead>
                <tbody>
                  {myDeposits.map((req, index) => {
                    const isPending = req.status === 'pending';
                    const isApproved = req.status === 'approved';
                    const isRejected = req.status === 'rejected';

                    return (
                      <tr key={req.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                        <td className="py-3 font-mono font-bold text-slate-700 dark:text-slate-300">#{req.id.slice(-6).toUpperCase()}</td>
                        <td className="py-3 text-slate-500">{new Date(req.createdAt).toLocaleDateString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="py-3 font-black text-slate-900 dark:text-white text-sm">{req.amount} ج.م</td>
                        <td className="py-3 font-bold text-slate-600 dark:text-slate-400">
                          {req.paymentMethod === 'vodafone' ? 'فودافون كاش' :
                           req.paymentMethod === 'instapay' ? 'إنستاباي (InstaPay)' :
                           req.paymentMethod === 'fawry' ? 'فوري (Fawry)' : 'دفع يدوي بالسنتر'}
                        </td>
                        <td className="py-3 text-slate-500 max-w-[200px] truncate">
                          {req.paymentMethod === 'vodafone' && `المرسل: ${req.senderNumber}`}
                          {(req.paymentMethod === 'instapay' || req.paymentMethod === 'fawry') && `عملية: ${req.transactionId}`}
                          {req.paymentMethod === 'manual' && `تسليم يدوي بالسنتر`}
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black inline-block ${
                            isPending ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse' :
                            isApproved ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                            'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}>
                            {isPending ? '⏳ قيد المراجعة الفنية' :
                             isApproved ? '✅ مقبول وتم الشحن' : '❌ مرفوض ومرفوض'}
                          </span>
                          
                          {isRejected && req.rejectionReason && (
                            <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-1 text-center">
                              السبب: {req.rejectionReason}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- RENDER OFFICIAL STUDENT IDENTITY / PROFILE TAB ---
  const renderProfile = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 shrink-0" />
        <span>وثيقة قيد رسمية موثقة • هذا الملف هو الهوية المعتمدة للطالب على المنظومة وتستخدم للتحقق في الامتحانات ومراكز السناتر.</span>
      </div>

      <div className="p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-2.5 bg-gradient-to-r from-cyan-500 via-indigo-600 to-emerald-500" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-500 shadow-inner shrink-0">
              <UserIcon className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                {currentUser.fourPartName || currentUser.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold font-mono">
                 <span className="text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-2.5 py-1 rounded-lg border border-cyan-200 dark:border-cyan-800">
                   كود الطالب: {currentUser.studentCode || `SEA-${currentUser.id.slice(-6).toUpperCase()}`}
                 </span>
                 <span className="text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                   تاريخ القيد: {currentUser.createdAt || new Date().toISOString().split('T')[0]}
                 </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center font-mono text-xs">
            <div className="font-black text-slate-900 dark:text-white tracking-widest">||| | | |||| | ||| |</div>
            <span className="text-[10px] text-slate-400">SEA-SECURE-BARCODE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">البريد الإلكتروني المعتمد</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{currentUser.email}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">الهاتف الشخصي (واتساب)</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono" dir="ltr">{currentUser.phone || 'غير مسجل'}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">المرحلة / الصف الدراسي</span>
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{currentUser.gradeLevel || 'الصف الثالث الثانوي'}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">المحافظة / المدينة</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.governorate || 'القاهرة'} - {currentUser.city || 'مدينة نصر'}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">حالة الحساب الأمني</span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">موثق ومعتمد رسمياً ✅</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">هاتف ولي الأمر للطوارئ</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono" dir="ltr">{currentUser.guardianPhone || 'غير مسجل'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // --- RENDER AUTHORIZED DEVICES TAB (2-Device Policy) ---
  const renderDevices = () => {
    const currentDevice = detectCurrentDevice();
    const primary = currentUser.primaryDevice;
    const secondary = currentUser.secondaryDevice;
    const isCurrentPrimary = currentDevice.id === currentUser.primaryDeviceId;
    const isCurrentSecondary = currentDevice.id === currentUser.secondaryDeviceId;
    const hasSecondary = Boolean(currentUser.secondaryDeviceId && secondary);

    const handleRemoveSecondaryDevice = () => {
      setIsRemovingSecondary(true);
      try {
        const res = removeSecondaryDevice();
        if (res.success) {
          setShowConfirmRemoveSecondary(false);
        }
      } finally {
        setIsRemovingSecondary(false);
      }
    };

    return (
      <div className="space-y-6 animate-fade-in text-right" dir="rtl">
        {/* Security Policy Header Card */}
        <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-l from-slate-900 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-black border border-cyan-500/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  منظومة الأمان والحد الأقصى للأجهزة (2 Devices)
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/30">
                  {hasSecondary ? '2 من 2 مستخدمة' : '1 من 2 مستخدم (يوجد مكان متاح)'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                الأجهزة المصرح لها بالدخول
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                تتيح المنظومة فتح حساب الطالب على <strong>جهازين فقط</strong> (جهاز أساسي دائم + جهاز إضافي قابل للاستبدال). يمنع تداول الحسابات ويتم حظر محاولة تسجيل الدخول من جهاز ثالث تلقائياً.
              </p>
            </div>

            {/* Current Active Device Tag */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-right space-y-1.5 shrink-0 min-w-[240px]">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>جهازك المتصل حالياً:</span>
              </div>
              <p className="text-sm font-black text-white">{currentDevice.name}</p>
              <p className="text-[11px] font-mono text-slate-300">{currentDevice.browser} • {currentDevice.os}</p>
              <div className="pt-1">
                {isCurrentPrimary ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                    أنت متصل من الجهاز الأساسي 🛡️
                  </span>
                ) : isCurrentSecondary ? (
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/30 text-cyan-300 text-[10px] font-black border border-cyan-500/30">
                    أنت متصل من الجهاز الإضافي 📱
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/30 text-amber-300 text-[10px] font-black border border-amber-500/30">
                    جهاز جديد (سيتم اعتماده كبديل إن وجد مكان) ⚠️
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2 Devices Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Primary Device (Immutable by Student) */}
          <div className="p-6 sm:p-7 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-emerald-500/30 dark:border-emerald-500/20 shadow-lg relative flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Monitor className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-black border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    الجهاز الأساسي (رئيسي دائم)
                  </span>
                  {isCurrentPrimary && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      الجهاز المستخدم حالياً
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                {primary?.name || 'جهاز الكمبيوتر / الهاتف الرئيسي'}
              </h3>
              
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">نظام التشغيل:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{primary?.os || currentDevice.os}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">متصفح الويب:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{primary?.browser || currentDevice.browser}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">تاريخ الاعتماد:</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {primary?.registeredAt ? new Date(primary.registeredAt).toLocaleDateString('ar-EG', { dateStyle: 'medium' }) : 'معتمد عند أول تسجيل'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">آخر تواجد نشط:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {primary?.lastActiveAt ? new Date(primary.lastActiveAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'نشط الآن'}
                  </span>
                </div>
              </div>
            </div>

            {/* Lock Info Notice & Disabled Button */}
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                🔒 <strong>محمي أمنياً:</strong> لا يمكن للطالب حذف الجهاز الأساسي مطلقاً لضمان استقرار هوية الطالب ومنع تداول الحساب مع أشخاص آخرين.
              </div>
              <button
                disabled
                className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-black text-xs cursor-not-allowed flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
              >
                <Lock className="w-4 h-4" />
                <span>الجهاز الأساسي محمي (غير مسموح بالحذف)</span>
              </button>
            </div>
          </div>

          {/* Card 2: Secondary Device (Replacable or Empty Slot) */}
          {hasSecondary ? (
            <div className="p-6 sm:p-7 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-cyan-500/30 dark:border-cyan-500/20 shadow-lg relative flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 text-xs font-black border border-cyan-200 dark:border-cyan-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      الجهاز الإضافي (بديل معتمد)
                    </span>
                    {isCurrentSecondary && (
                      <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-cyan-500" />
                        الجهاز المستخدم حالياً
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                  {secondary?.name || 'الهاتف الإضافي / التابلت'}
                </h3>
                
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">نظام التشغيل:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{secondary?.os || 'نظام غير معروف'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">متصفح الويب:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{secondary?.browser || 'متصفح الجوال'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">تاريخ الربط:</span>
                    <span className="font-mono text-slate-900 dark:text-white">
                      {secondary?.registeredAt ? new Date(secondary.registeredAt).toLocaleDateString('ar-EG', { dateStyle: 'medium' }) : 'معتمد'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">آخر تواجد:</span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                      {secondary?.lastActiveAt ? new Date(secondary.lastActiveAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'مسجل'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action: Delete / Replace Secondary Device */}
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed">
                  🔄 <strong>إمكانية الاستبدال:</strong> يحق لك حذف هذا الجهاز الإضافي في حال قمت بتغيير هاتفك، لفتح المجال لتسجيل جهاز جديد آخر مكانه.
                </div>
                
                {showConfirmRemoveSecondary ? (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-3 animate-fade-in">
                    <div className="flex items-center gap-2 text-xs font-black text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>هل أنت متأكد من حذف وإلغاء ربط الجهاز الإضافي؟</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      سيتم تحرير الخانة لتصبح شاغرة، وستتمكن من تسجيل الدخول من جهازك الجديد ليتم قيده تلقائياً.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleRemoveSecondaryDevice}
                        disabled={isRemovingSecondary}
                        className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-colors cursor-pointer"
                      >
                        {isRemovingSecondary ? 'جارِ الحذف...' : 'نعم، حذف الجهاز الآن'}
                      </button>
                      <button
                        onClick={() => setShowConfirmRemoveSecondary(false)}
                        className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirmRemoveSecondary(true)}
                    className="w-full py-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف وإلغاء ربط الجهاز الإضافي (استبدال بجهاز جديد)</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Empty Slot Card (Available Device) */
            <div className="p-6 sm:p-7 rounded-[32px] border-2 border-dashed border-cyan-400/60 dark:border-cyan-500/40 bg-gradient-to-br from-cyan-50/50 via-slate-50 to-indigo-50/30 dark:from-slate-900/80 dark:via-slate-900 dark:to-cyan-950/30 shadow-sm relative flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 animate-bounce">
                    <Sparkles className="w-3.5 h-3.5" />
                    مكان متاح وشاغر (1 متاح)
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                  مكان متاح لجهاز إضافي (هاتف أو تابلت)
                </h3>
                
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  لم تقم بتسجيل جهاز ثانٍ بعد. يمكنك تسجيل الدخول في أي وقت من هاتفك المحمول أو جهاز لوحي آخر (تابلت/لابتوب)، وسيقوم النظام بتسجيله واعتماده تلقائياً كجهازك الإضافي المعتمد.
                </p>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>يسمح بالدخول التلقائي فور كتابة كلمة المرور</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>يدعم هواتف أندرويد، آيفون، أجهزة الآيباد واللابتوب</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 text-xs font-black text-center">
                  ✨ خانة الجهاز الإضافي جاهزة للاستخدام عند تسجيل دخولك القادم من جهازك الآخر
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  };

  // --- RENDER SUPPORT TICKETS TAB ---
  const renderSupport = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="px-1">
         <h2 className="text-2xl font-black text-slate-900 dark:text-white">الدعم الفني والأكاديمي للطلاب</h2>
         <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">تواصل مباشرة مع إدارة المنصة أو المعلمين لحل المشاكل أو الاستفسار.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Support Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmitTicket} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <HeadphonesIcon className="w-5 h-5 text-indigo-500" /> فتح تذكرة جديدة
            </h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">نوع الاستفسار أو المشكلة</label>
              <select 
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:border-indigo-500 focus:outline-none dark:text-white"
              >
                <option value="technical">مشكلة تقنية (تشغيل الفيديو، سرعة الموقع)</option>
                <option value="billing">المدفوعات والمحفظة والأكواد</option>
                <option value="academic">استفسار أكاديمي للمدرس</option>
                <option value="other">أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">موضوع التذكرة</label>
              <input 
                type="text" 
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="مثال: واجهت صعوبة في تفعيل كود الحصة..."
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">شرح المشكلة بالتفصيل</label>
              <textarea 
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="اكتب رسالتك وسيتولى فريق الدعم أو مدرس المادة الرد عليك..."
                required
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none resize-none"
              />
            </div>

            <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-colors shadow-md shadow-indigo-600/20 cursor-pointer">
              إرسال التذكرة للإدارة 🚀
            </button>
          </form>
        </div>

        {/* Tickets History */}
        <div className="lg:col-span-3">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Ticket className="w-5 h-5 text-slate-500" /> سجل تذاكري ومتابعة الردود
            </h3>
            
            {myTickets.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <HelpCircle className="w-12 h-12 text-slate-200 dark:text-slate-800 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-xs">لم تقم بإرسال أي تذاكر دعم فني بعد.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto pr-1">
                {myTickets.map(ticket => (
                  <div key={ticket.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-right">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          ticket.status === 'pending' || ticket.status === 'open' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          ticket.status === 'in_progress' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' :
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}>
                          {ticket.status === 'pending' || ticket.status === 'open' ? 'قيد الانتظار' : ticket.status === 'in_progress' ? 'جارِ المراجعة' : 'تم الرد والحل'}
                        </span>
                        <span className="text-[10px] text-slate-500">{new Date(ticket.createdAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">#{ticket.id.slice(-6).toUpperCase()}</span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white mb-1">{ticket.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">{ticket.message}</p>
                    
                    {(ticket.adminResponse || ticket.adminReply) && (
                      <div className="mt-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 text-right">
                        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 mb-1">رد إدارة المنصة:</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{ticket.adminResponse || ticket.adminReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in" dir="rtl">
      
      {/* Platform Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-lg shadow-cyan-600/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                بوابة الطالب المركزية
              </h1>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                منظومة التعلم الذكية SEA • المقررات، الامتحانات المراقبة، والمحفظة.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner overflow-x-auto hide-scrollbar w-full md:w-auto">
          {[
            { id: 'dashboard', label: 'الرئيسية', icon: BookOpen },
            { id: 'my_courses', label: 'كورساتي', icon: PlayCircle },
            { id: 'assignments', label: 'الواجبات والتكليفات', icon: Layers },
            { id: 'question_bank', label: 'بنك الأسئلة والتدريبات', icon: HelpCircle },
            { id: 'schedule', label: 'جدول المذاكرة', icon: Calendar },
            { id: 'notes', label: 'ملاحظاتي', icon: NotebookPen },
            { id: 'exams', label: 'الامتحانات', icon: FileCheck },
            { id: 'wallet', label: 'المحفظة والأكواد', icon: Wallet },
            { id: 'devices', label: 'الأجهزة المصرحة (2)', icon: Laptop },
            { id: 'my_profile', label: 'وثيقة القيد', icon: ShieldCheck },
            { id: 'support', label: 'الدعم الفني', icon: HeadphonesIcon },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSolvingAssignmentId(null);
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200 dark:border-slate-700' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[500px]">
        {activeSolvingAssignmentId ? (
          <StudentAssignmentView
            assignmentId={activeSolvingAssignmentId}
            onBack={() => setActiveSolvingAssignmentId(null)}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'my_courses' && renderMyCourses()}
            {activeTab === 'assignments' && renderAssignments()}
            {activeTab === 'question_bank' && <StudentQuestionBankView />}
            {activeTab === 'schedule' && renderSchedule()}
            {activeTab === 'notes' && renderNotes()}
            {activeTab === 'exams' && renderExams()}
            {activeTab === 'wallet' && renderWallet()}
            {activeTab === 'devices' && renderDevices()}
            {activeTab === 'my_profile' && renderProfile()}
            {activeTab === 'support' && renderSupport()}
          </>
        )}
      </div>

      {/* Course Subscription / Code Redemption Modal */}
      {selectedCourseForModal && (
        <CourseSubscribeModal
          isOpen={Boolean(selectedCourseForModal)}
          onClose={() => setSelectedCourseForModal(null)}
          course={selectedCourseForModal}
        />
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EducationalPlatform, PlatformOrderRequest, User, PrintedCodesBatch } from '../types';
import { AdminTicketsPanel } from './admin/AdminTicketsPanel';
import { AdminSummaryCockpit } from './admin/AdminSummaryCockpit';
import {
  ShieldCheck,
  PlusCircle,
  Users,
  Layers,
  Sparkles,
  KeyRound,
  Lock,
  Unlock,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Server,
  Zap,
  Phone,
  Mail,
  Sliders,
  Bell,
  HardDrive,
  Tv,
  GraduationCap,
  IdCard,
  School,
  MessageSquare,
  PhoneCall,
  QrCode,
  CheckCircle2,
  UserCheck,
  Eye,
  Copy,
  Download,
  X,
  Printer,
  Camera,
  AlertCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const {
    currentUser,
    platforms,
    createPlatform,
    updatePlatform,
    deletePlatform,
    updateTeacherCredentials,
    orderRequests,
    updateOrderStatus,
    courses,
    setSelectedPlatformId,
    setCurrentView,
    addToast,
    supportTickets,
    updateSupportTicketStatus,
    deleteSupportTicket,
    userProfiles,
    updateUserAccountStatus,
    updateStudentAdmissionData,
    deleteUserProfile,
    depositRequests,
    paymentSettings,
    updateDepositRequestStatus,
    updatePaymentSettings,
    printedCodesBatches,
    settleCodesBatchByAdmin,
    theme,
  } = useApp();

  const isLight = theme === 'light';

  if (!currentUser || currentUser.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <ShieldCheck className="w-20 h-20 text-rose-500 mb-6" />
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">صلاحيات غير كافية</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">
          هذه الصفحة مخصصة لمدير النظام والسلطة العليا فقط.
        </p>
        <button 
          onClick={() => setCurrentView('home')}
          className="px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all"
        >
          العودة للصفحة الرئيسية
        </button>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<
    'summary' | 'platforms' | 'requests' | 'tickets' | 'registrants' | 'payments' | 'printed_batches'
  >('summary');
  const [searchTerm, setSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'pending_review' | 'all' | 'active' | 'suspended_banned'>('pending_review');
  const [studentGradeFilter, setStudentGradeFilter] = useState('all');
  const [studentGovFilter, setStudentGovFilter] = useState('all');
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<User | null>(null);
  const [inspectedStudentPhoto, setInspectedStudentPhoto] = useState<{ name: string; photoUrl: string; code?: string; nationalId?: string } | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<User | null>(null);
  const [statusReasonModal, setStatusReasonModal] = useState<{
    user: User;
    status: "suspended" | "banned" | "rejected" | "deleted";
  } | null>(null);
  const [statusReasonInput, setStatusReasonInput] = useState('');
  const [selectedBatchForInspection, setSelectedBatchForInspection] = useState<PrintedCodesBatch | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<EducationalPlatform | null>(null);
  const [credentialsModalPlatform, setCredentialsModalPlatform] = useState<EducationalPlatform | null>(null);

  // Admin Master Password States for Student Password Reveal
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [isPasswordUnlockedForStudent, setIsPasswordUnlockedForStudent] = useState(false);
  const [adminPasswordError, setAdminPasswordError] = useState(false);

  useEffect(() => {
    setIsPasswordUnlockedForStudent(false);
    setAdminPasswordInput('');
    setAdminPasswordError(false);
  }, [selectedStudentProfile?.id]);

  // Central Payment Settings Panel States
  const [vodafoneOn, setVodafoneOn] = useState(paymentSettings?.vodafoneEnabled ?? true);
  const [vodafoneNum, setVodafoneNum] = useState(paymentSettings?.vodafoneNumber ?? '01019876543');
  const [instapayOn, setInstapayOn] = useState(paymentSettings?.instapayEnabled ?? true);
  const [instapayAddr, setInstapayAddr] = useState(paymentSettings?.instapayAddress ?? 'sea@instapay');
  const [fawryOn, setFawryOn] = useState(paymentSettings?.fawryEnabled ?? true);
  const [fawryC, setFawryC] = useState(paymentSettings?.fawryCode ?? '78421');
  const [manualOn, setManualOn] = useState(paymentSettings?.manualEnabled ?? true);
  const [printedFeePct, setPrintedFeePct] = useState<number>(paymentSettings?.printedCodesFeePercentage ?? 15);

  // Deposit Actions States
  const [rejectingReqId, setRejectingReqId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // New Platform Form State
  const [newPlatformData, setNewPlatformData] = useState({
    name: '',
    slug: '',
    subject: 'اللغة الإنجليزية',
    subjectCategory: 'languages' as EducationalPlatform['subjectCategory'],
    teacherName: '',
    teacherTitle: 'معلم أول ومعد مناهج الثانوية العامة',
    teacherEmail: '',
    teacherPassword: '',
    teacherPhone: '',
    teacherBio: 'شرح متميز ومبسط للمنهج مع أحدث أساليب التقييم والامتحانات الإلكترونية.',
    teacherAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=200&q=80',
    themeColor: '#0ea5e9',
    status: 'active' as EducationalPlatform['status'],
    monthlyRentPrice: 650,
    annualRentPrice: 6500,
    subscriptionExpiresAt: '2027-01-01',
    features: [
      'مشغل فيديو مشفر عالي الحماية مع علامة مائية متحركة',
      'بنك أسئلة وتصحيح امتحانات إلكتروني فوري',
      'حظر تصوير الشاشة وتنزيل الفيديوهات',
      'مذكرات PDF تفاعلية',
    ],
    whatsappNumber: '',
  });

  // Credentials Edit State
  const [credTeacherName, setCredTeacherName] = useState('');
  const [credTeacherTitle, setCredTeacherTitle] = useState('');
  const [credEmail, setCredEmail] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [credStatus, setCredStatus] = useState<EducationalPlatform['status']>('active');

  const filteredPlatforms = (platforms || []).filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.teacherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStudentsAcrossAll = (platforms || []).reduce((acc, p) => acc + (p.totalStudentsCount || 0), 0);
  const totalCoursesAcrossAll = (courses || []).length;
  const activePlatformsCount = (platforms || []).filter((p) => p.status === 'active').length;
  const pendingRequestsCount = (orderRequests || []).filter((r) => r.status === 'pending').length;

  const handleCreatePlatformSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlatformData.name || !newPlatformData.teacherName || !newPlatformData.teacherEmail) {
      addToast('warning', 'يرجى إكمال الحقول الأساسية للمنصة');
      return;
    }

    createPlatform({
      ...newPlatformData,
      slug: newPlatformData.slug || 'platform-' + Date.now().toString(36),
      teacherPassword: newPlatformData.teacherPassword || 'Teacher@' + Math.floor(1000 + Math.random() * 9000),
    });

    setIsCreateModalOpen(false);
  };

  const openCredentialsModal = (plat: EducationalPlatform) => {
    setCredentialsModalPlatform(plat);
    setCredTeacherName(plat.teacherName || '');
    setCredTeacherTitle(plat.teacherTitle || '');
    setCredEmail(plat.teacherEmail);
    setCredPassword(plat.teacherPassword || '');
    setCredStatus(plat.status);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentialsModalPlatform) return;
    updateTeacherCredentials(
      credentialsModalPlatform.id,
      credEmail,
      credPassword,
      credTeacherName,
      credTeacherTitle,
      credStatus
    );
    setCredentialsModalPlatform(null);
  };

  const togglePlatformFreeze = (plat: EducationalPlatform) => {
    const nextStatus = plat.status === 'active' ? 'suspended' : 'active';
    updatePlatform(plat.id, { status: nextStatus });
    addToast(
      nextStatus === 'suspended' ? 'warning' : 'success',
      nextStatus === 'suspended' ? `تم تجميد وتعليق منصة "${plat.name}"` : `تم إعادة تفعيل منصة "${plat.name}"`
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 text-right">
      
      {/* Top Banner / Authority Branding */}
      <div className={`p-8 rounded-3xl border shadow-2xl relative overflow-hidden transition-all duration-300 ${
        isLight
          ? 'bg-gradient-to-r from-slate-50 via-white to-sky-50/80 border-slate-200 shadow-slate-200/50'
          : 'bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-slate-800 shadow-2xl'
      }`}>
        <div className="absolute -top-10 -left-10 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl shrink-0 p-1.5 overflow-hidden transition-all ${
              isLight
                ? 'bg-gradient-to-br from-rose-50 to-amber-50 border-2 border-rose-200 shadow-rose-200/50'
                : 'bg-gradient-to-br from-rose-500 via-red-600 to-amber-600 text-white shadow-red-950/60'
            }`}>
              <img
                src="/admin-logo.png"
                alt="SEA Administration Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                  const fallback = e.currentTarget.parentElement?.querySelector('.admin-banner-fallback');
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <ShieldCheck className="admin-banner-fallback hidden w-9 h-9 stroke-[2.5] text-rose-600 dark:text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-black border ${
                  isLight
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-rose-950 text-rose-400 border-rose-800/60'
                }`}>
                  لوحة الإدارة العليا والسيادة
                </span>
                <span className={`text-xs ${isLight ? 'text-slate-500 font-bold' : 'text-slate-400'}`}>
                  Smart Education Authority (SEA)
                </span>
              </div>
              <h1 className={`text-2xl sm:text-3xl font-black mt-1 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                مركز التحكم في المنصات التعليمية وحسابات المعلمين
              </h1>
              <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}>
                توليد المنصات، تعيين بيانات دخول المدرسين، التحكم في الصلاحيات والإيقاف الفوري، وإدارة الاشتراكات.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-admin-add-platform"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-lg shadow-cyan-950/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
              <span>إنشاء وتخصيص منصة جديدة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className={`p-5 rounded-2xl border transition-all ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
            : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-cyan-500 mb-2">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>المنصات المفعلة</span>
            <Layers className="w-5 h-5" />
          </div>
          <div className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {activePlatformsCount} <span className={`text-xs font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>من {platforms.length}</span>
          </div>
          <div className="text-[11px] text-emerald-500 font-semibold mt-1">
            • تعمل بنظام الحماية الفائق
          </div>
        </div>

        <div className={`p-5 rounded-2xl border transition-all ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
            : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-sky-500 mb-2">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>إجمالي الطلاب المسجلين</span>
            <Users className="w-5 h-5" />
          </div>
          <div className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {totalStudentsAcrossAll.toLocaleString()}
          </div>
          <div className="text-[11px] text-sky-500 font-semibold mt-1">
            • في كافة المواد والسنوات
          </div>
        </div>

        <div className={`p-5 rounded-2xl border transition-all ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
            : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-emerald-500 mb-2">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>بث الفيديو والباندويث الموفر</span>
            <HardDrive className="w-5 h-5" />
          </div>
          <div className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
            99.4%
          </div>
          <div className="text-[11px] text-emerald-500 font-semibold mt-1">
            • توفير استهلاك بفضل دمج يوتيوب المشفر
          </div>
        </div>

        <div className={`p-5 rounded-2xl border transition-all ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
            : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>طلبات إنشاء منصات جديدة</span>
            <Bell className="w-5 h-5" />
          </div>
          <div className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {pendingRequestsCount} <span className={`text-xs font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>طلبات معلقة</span>
          </div>
          <div className="text-[11px] text-amber-500 font-semibold mt-1">
            • من مدرسين يريدون بدء منصاتهم
          </div>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className={`flex flex-wrap items-center gap-2 p-1.5 rounded-2xl border w-fit transition-all ${
        isLight ? 'bg-slate-100 border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'summary'
              ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-slate-950 font-black shadow-md'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>الملخص الشامل ولوحة القيادة ⚡</span>
        </button>

        <button
          onClick={() => setActiveTab('platforms')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'platforms'
              ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-slate-950 font-black shadow-md'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>إدارة المنصات والمعلمين ({platforms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 relative ${
            activeTab === 'requests'
              ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-slate-950 font-black shadow-md'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>طلبات استئجار وشراء المنصات ({orderRequests.length})</span>
          {pendingRequestsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 relative ${
            activeTab === 'tickets'
              ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-slate-950 font-black shadow-md'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>تذاكر الدعم والطلبات المالية ({supportTickets.length})</span>
          {supportTickets.filter(t => t.status === 'pending').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-rose-600 text-white animate-pulse">
              {supportTickets.filter(t => t.status === 'pending').length} جديد
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('registrants')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 relative ${
            activeTab === 'registrants'
              ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-slate-950 font-black shadow-md'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>أعضاء المنصة والطلاب الجدد ({userProfiles?.length || 0})</span>
          {userProfiles?.filter(u => u.accountStatus === 'pending_review' || u.accountStatus === 'pending_verification').length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 animate-pulse border border-amber-300">
              {userProfiles.filter(u => u.accountStatus === 'pending_review' || u.accountStatus === 'pending_verification').length} طلب جديد
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('payments' as any)}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 relative ${
            activeTab === ('payments' as any)
              ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white font-black shadow-md'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>الخزينة ومراجعة شحن المحافظ ({depositRequests.length})</span>
          {depositRequests.filter(r => r.status === 'pending').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-rose-600 text-white animate-pulse">
              {depositRequests.filter(r => r.status === 'pending').length} معلق
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('printed_batches')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 relative ${
            activeTab === 'printed_batches'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black shadow-md'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>تسويات الأكواد المطبوعة 15% ({printedCodesBatches?.length || 0})</span>
          {printedCodesBatches?.some((b) => b.paymentStatus !== 'settled') && (
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-amber-500 text-slate-950">
              مستحقات
            </span>
          )}
        </button>
      </div>

      {/* Tab 0: Executive Summary Cockpit */}
      {activeTab === 'summary' && (
        <AdminSummaryCockpit
          onNavigateToTab={(tab, filter) => {
            setActiveTab(tab as any);
            if (tab === 'platforms' && filter) {
              setSearchTerm(filter);
            } else if (tab === 'registrants' && filter) {
              setStudentSearchTerm(filter);
            }
          }}
          onOpenCredentialsModal={(plat) => openCredentialsModal(plat)}
          onInspectBatch={(batch) => setSelectedBatchForInspection(batch)}
        />
      )}

      {/* Tab 1: Platforms Directory & Management */}
      {activeTab === 'platforms' && (
        <div className="space-y-6">
          
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="ابحث عن منصة أو اسم مدرس أو مادة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-2.5 pr-10 rounded-xl text-xs sm:text-sm focus:border-cyan-500 focus:outline-none transition-colors border ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                }`}
              />
              <Search className={`w-4 h-4 absolute right-3.5 top-3 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
            </div>

            <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              إجمالي النتائج: {filteredPlatforms.length} منصة
            </span>
          </div>

          {/* Platforms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlatforms.map((plat) => {
              const isSuspended = plat.status === 'suspended';
              const platCourses = (courses || []).filter((c) => c.platformId === plat.id);

              return (
                <div
                  key={plat.id}
                  className={`rounded-3xl border transition-all duration-300 p-6 flex flex-col justify-between relative overflow-hidden ${
                    isLight
                      ? isSuspended
                        ? 'bg-rose-50/60 border-rose-200 shadow-sm opacity-90'
                        : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
                      : isSuspended
                      ? 'bg-slate-950 border-rose-900/60 opacity-85 shadow-xl'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-xl'
                  }`}
                >
                  {/* Top Status & Subject Pill */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="text-xs font-black px-3 py-1 rounded-lg"
                        style={{ backgroundColor: `${plat.themeColor}20`, color: plat.themeColor }}
                      >
                        {plat.subject}
                      </span>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                          isSuspended
                            ? isLight
                              ? 'bg-rose-100 text-rose-700 border-rose-200'
                              : 'bg-rose-950 text-rose-400 border-rose-800'
                            : isLight
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        }`}
                      >
                        {isSuspended ? (
                          <>
                            <Lock className="w-3 h-3" />
                            موقوفة / مجمدة
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            نشطة ومفعلة
                          </>
                        )}
                      </span>
                    </div>

                    {/* Teacher Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={plat.teacherAvatar}
                        alt={plat.teacherName}
                        referrerPolicy="no-referrer"
                        className={`w-14 h-14 rounded-2xl object-cover border-2 shadow-md ${
                          isLight ? 'border-slate-200' : 'border-slate-700'
                        }`}
                      />
                      <div>
                        <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{plat.name}</h3>
                        <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">{plat.teacherName}</p>
                        <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{plat.teacherEmail}</p>
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed line-clamp-2 mb-4 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {plat.teacherBio}
                    </p>

                    {/* Quick Stats */}
                    <div className={`grid grid-cols-2 gap-2 p-3 rounded-2xl border text-center mb-5 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800/80'
                    }`}>
                      <div>
                        <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>عدد الطلاب</span>
                        <span className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {plat.totalStudentsCount.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>الكورسات المرفوعة</span>
                        <span className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{platCourses.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Controls for Admin */}
                  <div className={`space-y-2 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                    
                    {/* Enter / Preview Platform */}
                    <button
                      onClick={() => {
                        setSelectedPlatformId(plat.id);
                        setCurrentView('platform_detail');
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                          : 'bg-slate-950 hover:bg-slate-800 text-cyan-300 border-transparent'
                      }`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>فتح ومعاينة المنصة كطالب</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Set / Change Teacher Credentials */}
                      <button
                        onClick={() => openCredentialsModal(plat)}
                        className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                          isLight
                            ? 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200 text-cyan-800'
                            : 'bg-cyan-950/60 hover:bg-cyan-900/60 border-cyan-800/50 text-cyan-300'
                        }`}
                      >
                        <KeyRound className="w-3.5 h-3.5 text-cyan-500" />
                        <span>بيانات الدخول</span>
                      </button>

                      {/* Freeze / Suspend Access Toggle */}
                      <button
                        onClick={() => togglePlatformFreeze(plat)}
                        className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                          isSuspended
                            ? isLight
                              ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                              : 'bg-emerald-950/60 hover:bg-emerald-900/60 border-emerald-800/60 text-emerald-300'
                            : isLight
                            ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-800'
                            : 'bg-rose-950/60 hover:bg-rose-900/60 border-rose-800/60 text-rose-300'
                        }`}
                      >
                        {isSuspended ? (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>تفعيل المنصة</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>تجميد المنصة</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Delete Platform */}
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من رغبتك في حذف منصة "${plat.name}" نهائياً من النظام؟`)) {
                          deletePlatform(plat.id);
                        }
                      }}
                      className="w-full py-2 rounded-xl text-[11px] font-bold text-slate-500 hover:text-rose-500 transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>حذف المنصة نهائياً</span>
                    </button>

                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Tab 2: Incoming Rental / Platform Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              طلبات استئجار وتصميم المنصات من المعلمين
            </h3>
            <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              المعلمين المهتمين بالحصول على منصة SEA لمادتهم
            </span>
          </div>

          <div className="space-y-3">
            {orderRequests.map((req) => (
              <div
                key={req.id}
                className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                    : 'bg-slate-900 border-slate-800 shadow-xl'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h4 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{req.applicantName}</h4>
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                      isLight
                        ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                        : 'bg-cyan-950 text-cyan-400 border-cyan-800/60'
                    }`}>
                      {req.subject}
                    </span>
                    <span
                      className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                        req.status === 'approved'
                          ? isLight
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                          : req.status === 'rejected'
                          ? isLight
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-rose-950 text-rose-400 border border-rose-700'
                          : isLight
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-amber-950 text-amber-400 border border-amber-700'
                      }`}
                    >
                      {req.status === 'approved' ? 'موافق عليه' : req.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                    </span>
                  </div>

                  <p className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    الاسم المقترح للمنصة: <span className={isLight ? 'text-cyan-700 font-black' : 'text-cyan-300'}>{req.desiredPlatformName}</span> • الخطة المطلوبة: {req.planType === 'annual' ? 'اشتراك سنوي' : req.planType === 'monthly' ? 'اشتراك شهري' : 'شراء كامل وتخصيص'}
                  </p>

                  <p className={`text-xs p-3 rounded-xl border ${
                    isLight
                      ? 'bg-slate-50 text-slate-600 border-slate-200'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}>
                    ملاحظات المعلم: {req.notes || 'لا توجد ملاحظات إضافية.'}
                  </p>

                  <div className={`flex items-center gap-4 text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    <span className={`flex items-center gap-1 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      {req.applicantPhone}
                    </span>
                    <span className={`flex items-center gap-1 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                      <Mail className="w-3.5 h-3.5 text-sky-500" />
                      {req.applicantEmail}
                    </span>
                    <span>تاريخ الطلب: {req.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          updateOrderStatus(req.id, 'approved');
                          // Pre-fill create platform modal
                          setNewPlatformData((prev) => ({
                            ...prev,
                            name: req.desiredPlatformName,
                            teacherName: req.applicantName,
                            teacherEmail: req.applicantEmail,
                            teacherPhone: req.applicantPhone,
                            subject: req.subject,
                          }));
                          setIsCreateModalOpen(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>موافقة وإنشاء المنصة فوراً</span>
                      </button>

                      <button
                        onClick={() => updateOrderStatus(req.id, 'rejected')}
                        className={`px-4 py-2.5 rounded-xl border font-bold text-xs transition-colors ${
                          isLight
                            ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
                            : 'bg-rose-950/60 hover:bg-rose-900/60 border-rose-800/60 text-rose-300'
                        }`}
                      >
                        رفض
                      </button>
                    </>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Tickets & Financial Requests Management */}
      {activeTab === 'tickets' && (
        <div className="space-y-6 animate-fade-in text-right">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className={`text-lg font-black flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <ShieldCheck className="w-5 h-5 text-cyan-500" />
                تذاكر الدعم والطلبات الإدارية لـ SEA
              </h3>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                استقبل طلبات سحب الأموال والأرباح من المدرسين، طلبات ترقية الخوادم، حل مشاكل الطلاب، والرد عليها فورياً.
              </p>
            </div>
            
            <div className={`text-xs font-semibold px-3 py-1.5 rounded-xl border ${
              isLight
                ? 'bg-white text-slate-700 border-slate-200 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}>
              تحديث تلقائي مع خادم السحابة 💻
            </div>
          </div>

          <AdminTicketsPanel
            supportTickets={supportTickets}
            updateSupportTicketStatus={updateSupportTicketStatus}
            deleteSupportTicket={deleteSupportTicket}
          />
        </div>
      )}

      {/* Tab 4: Student Enrollment & Admissions Department (شؤون الطلاب والقبول المركزي) */}
      {activeTab === 'registrants' && (
        <div className="space-y-6 animate-fade-in text-right">
          {/* Header & Metrics */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black border mb-2 ${
                isLight
                  ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                  : 'bg-cyan-950/60 text-cyan-400 border-cyan-800/80'
              }`}>
                <School className="w-3.5 h-3.5" />
                الإدارة المركزية لشؤون الطلاب والقبول الموحد • SEA Admissions
              </div>
              <h3 className={`text-xl font-black flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Users className="w-6 h-6 text-cyan-500" />
                سجل الطلاب والمسجلين الجدد وكشوف القيد الرسمية
              </h3>
              <p className={`text-xs mt-1 max-w-2xl ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                قاعدة بيانات الطلاب المستقلة والمفصولة تماماً عن حسابات المدرسين. تتيح للإدارة الاطلاع الكامل على الهوية الوطنية، الأسماء الرباعية، أرقام هواتف أولياء الأمور، المحافظات، والمسارات التعليمية.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`text-xs font-black px-4 py-2.5 rounded-2xl flex items-center gap-2 border ${
                isLight
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                  : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80'
              }`}>
                <UserCheck className="w-4 h-4" />
                <span>إجمالي الطلاب المسجلين: <strong>{userProfiles?.length || 0}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}>
              <div>
                <span className={`text-[11px] font-bold block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>طلاب الثانوية العامة</span>
                <span className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {userProfiles?.filter((u) => u.gradeLevel?.includes('الثانوي') || u.role === 'student').length || 0}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}>
              <div>
                <span className={`text-[11px] font-bold block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>حسابات موثقة بالبريد (OTP)</span>
                <span className="text-lg font-black text-emerald-500">
                  {userProfiles?.filter((u) => u.isEmailVerified !== false).length || 0}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}>
              <div>
                <span className={`text-[11px] font-bold block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>أرقام هواتف مسجلة ومفعلة</span>
                <span className="text-lg font-black text-indigo-500">
                  {userProfiles?.filter((u) => u.phone).length || 0}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}>
              <div>
                <span className={`text-[11px] font-bold block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>المحافظات المغطاة</span>
                <span className="text-lg font-black text-amber-500">
                  {new Set(userProfiles?.map((u) => u.governorate || 'القاهرة')).size} محافظة
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <HardDrive className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
          }`}>
            {/* Status Filter Tabs */}
            <div className={`flex flex-wrap items-center gap-2 border-b pb-3 ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <button
                type="button"
                onClick={() => setStudentStatusFilter('pending_review')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  studentStatusFilter === 'pending_review'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/20 font-black'
                    : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>طلبات القيد الجديدة برسم الاعتماد</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-950 text-amber-300">
                  {userProfiles?.filter(u => u.accountStatus === 'pending_review' || u.accountStatus === 'pending_verification').length || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStudentStatusFilter('active')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  studentStatusFilter === 'active'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/20 font-black'
                    : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>الحسابات النشطة والمعتمدة</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-950 text-emerald-400">
                  {userProfiles?.filter(u => u.accountStatus === 'active' || u.accountStatus === 'verified' || !u.accountStatus).length || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStudentStatusFilter('suspended_banned')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  studentStatusFilter === 'suspended_banned'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/20 font-black'
                    : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>الحسابات الموقوفة والمحظورة</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-950 text-rose-300">
                  {userProfiles?.filter(u => u.accountStatus === 'suspended' || u.accountStatus === 'banned').length || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStudentStatusFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  studentStatusFilter === 'all'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/20 font-black'
                    : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>كافة الحسابات ({userProfiles?.length || 0})</span>
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="بحث بالاسم، كود الطالب (SEA-ID)، البريد، أو الهاتف..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  className={`w-full px-4 py-2.5 pr-10 rounded-xl text-xs focus:border-cyan-500 focus:outline-none border ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                  }`}
                />
                <Search className={`w-4 h-4 absolute right-3.5 top-3 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={studentGradeFilter}
                  onChange={(e) => setStudentGradeFilter(e.target.value)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold focus:border-cyan-500 focus:outline-none border ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                >
                  <option value="all">كافة الصفوف الدراسية</option>
                  <option value="الأول">الصف الأول الثانوي</option>
                  <option value="الثاني">الصف الثاني الثانوي</option>
                  <option value="الثالث">الصف الثالث الثانوي</option>
                </select>

                <select
                  value={studentGovFilter}
                  onChange={(e) => setStudentGovFilter(e.target.value)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold focus:border-cyan-500 focus:outline-none border ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                >
                  <option value="all">كافة المحافظات</option>
                  <option value="القاهرة">القاهرة</option>
                  <option value="الجيزة">الجيزة</option>
                  <option value="الإسكندرية">الإسكندرية</option>
                  <option value="الدقهلية">الدقهلية</option>
                  <option value="الغربية">الغربية</option>
                  <option value="الشرقية">الشرقية</option>
                </select>
              </div>
            </div>
          </div>

          {/* User profiles directory panel */}
          <div className={`p-6 rounded-3xl border space-y-6 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
          }`}>
            {/* Table or Cards of Registrants */}
            {(() => {
              const filteredUsers = (userProfiles || []).filter((user) => {
                const term = studentSearchTerm.trim().toLowerCase();
                const matchesSearch =
                  !term ||
                  user.name?.toLowerCase().includes(term) ||
                  user.email?.toLowerCase().includes(term) ||
                  user.phone?.includes(term) ||
                  user.studentCode?.toLowerCase().includes(term) ||
                  user.officialStudentId?.toLowerCase().includes(term) ||
                  user.fileRegistrationNumber?.toLowerCase().includes(term) ||
                  (user.seaSequenceNumber && String(user.seaSequenceNumber).includes(term)) ||
                  user.nationalId?.includes(term) ||
                  user.fourPartName?.toLowerCase().includes(term) ||
                  user.schoolName?.toLowerCase().includes(term);

                const matchesGrade =
                  studentGradeFilter === 'all' ||
                  user.gradeLevel?.includes(studentGradeFilter);

                const matchesGov =
                  studentGovFilter === 'all' ||
                  user.governorate === studentGovFilter ||
                  user.gradeLevel?.includes(studentGovFilter);

                const matchesStatus =
                  studentStatusFilter === 'all'
                    ? true
                    : studentStatusFilter === 'pending_review'
                    ? (user.accountStatus === 'pending_review' || user.accountStatus === 'pending_verification')
                    : studentStatusFilter === 'active'
                    ? (user.accountStatus === 'active' || user.accountStatus === 'verified' || !user.accountStatus)
                    : studentStatusFilter === 'suspended_banned'
                    ? (user.accountStatus === 'suspended' || user.accountStatus === 'banned')
                    : true;

                return matchesSearch && matchesGrade && matchesGov && matchesStatus;
              });

              if (filteredUsers.length === 0) {
                return (
                  <div className="py-12 text-center space-y-3">
                    <Users className="w-12 h-12 text-slate-400 mx-auto stroke-[1.5]" />
                    <p className={`text-sm font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                      {studentStatusFilter === 'pending_review'
                        ? 'لا يوجد طلاب جدد بانتظار المراجعة والاعتماد حالياً 👍'
                        : 'لا يوجد أي طلاب مطابقين لمعايير البحث في كشوف القيد.'}
                    </p>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>جرب تغيير كلمات البحث أو المرشحات بالأعلى.</p>
                  </div>
                );
              }

              return (
                <div className={`overflow-x-auto rounded-2xl border ${
                  isLight ? 'border-slate-200' : 'border-slate-800'
                }`}>
                  <table className="w-full text-right text-xs sm:text-sm">
                    <thead>
                      <tr className={`font-black border-b ${
                        isLight
                          ? 'bg-slate-50 text-slate-700 border-slate-200'
                          : 'bg-slate-950 text-slate-300 border-slate-800'
                      }`}>
                        <th className="p-4">كود الطالب & الاسم الرباعي</th>
                        <th className="p-4">البريد الإلكتروني</th>
                        <th className="p-4">هاتف الطالب (واتساب)</th>
                        <th className="p-4">هاتف ولي الأمر & الصلة</th>
                        <th className="p-4">المرحلة والمحافظة</th>
                        <th className="p-4 text-center">حالة القيد والاعتماد</th>
                        <th className="p-4 text-center">المحفظة</th>
                        <th className="p-4 text-center">الإجراءات والاعتماد</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${
                      isLight
                        ? 'divide-slate-200 text-slate-700'
                        : 'divide-slate-800/60 text-slate-200'
                    }`}>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className={`transition-colors ${
                          user.accountStatus === 'pending_review' || user.accountStatus === 'pending_verification'
                            ? (isLight ? 'bg-amber-50/50 hover:bg-amber-100/50' : 'bg-amber-950/20 hover:bg-amber-950/30')
                            : (isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-850')
                        }`}>
                          {/* Student Code & Name */}
                          <td className={`p-4 font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            <div className="flex items-center gap-2.5">
                              <div className="relative shrink-0">
                                {user.photoUrl || user.avatar ? (
                                  <button
                                    type="button"
                                    onClick={() => setInspectedStudentPhoto({
                                      name: user.fourPartName || user.name,
                                      photoUrl: user.photoUrl || user.avatar!,
                                      code: user.officialStudentId || user.studentCode,
                                      nationalId: user.nationalId,
                                    })}
                                    className="relative group cursor-pointer block"
                                    title="انقر لتكبير صورة الكاميرا الحية والتحقق من شخصية الطالب"
                                  >
                                    <img
                                      src={user.photoUrl || user.avatar}
                                      alt={user.name}
                                      className="w-12 h-12 rounded-xl object-cover border-2 border-cyan-500 shadow-md group-hover:scale-105 transition-transform"
                                    />
                                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-0.5 rounded-full border border-slate-900 shadow" title="صورة الكاميرا الحية متوفرة">
                                      <Camera className="w-3 h-3" />
                                    </span>
                                  </button>
                                ) : (
                                  <div className="relative">
                                    <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs flex items-center justify-center shadow-sm">
                                      {user.name.trim().substring(0, 2)}
                                    </span>
                                    <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full border border-slate-900 shadow" title="صورة حية غير مرفقة">
                                      <AlertCircle className="w-3 h-3" />
                                    </span>
                                  </div>
                                )}
                                {user.seaSequenceNumber && (
                                  <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[9px] font-black px-1 rounded-full border border-slate-900 shadow">
                                    #{String(user.seaSequenceNumber).padStart(4, '0')}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className={`font-black flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                                  <span>{user.fourPartName || user.name}</span>
                                  {user.isEmailVerified !== false && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                  <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border font-bold select-all ${
                                    isLight
                                      ? 'text-cyan-700 bg-cyan-50 border-cyan-200'
                                      : 'text-cyan-400 bg-cyan-950/60 border-cyan-800/80'
                                  }`}>
                                    {user.officialStudentId || user.studentCode || `SEA-${user.id.substring(0, 6).toUpperCase()}`}
                                  </span>
                                  {user.fileRegistrationNumber && (
                                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border font-bold bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-300 select-all">
                                      ملف: {user.fileRegistrationNumber}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td className={`p-4 font-mono select-all text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                            {user.email}
                          </td>

                          {/* Student Phone */}
                          <td className={`p-4 font-mono text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            {user.phone ? (
                              <div className="flex items-center gap-1.5">
                                <span className="select-all">{user.phone}</span>
                                <a
                                  href={`https://wa.me/2${user.phone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`p-1 rounded ${
                                    isLight ? 'text-emerald-600 hover:bg-slate-100' : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-800'
                                  }`}
                                  title="مراسلة واتساب فورية"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>

                          {/* Guardian Phone */}
                          <td className={`p-4 font-mono text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            {user.guardianPhone ? (
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className={`select-all ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{user.guardianPhone}</span>
                                  <a
                                    href={`tel:${user.guardianPhone}`}
                                    className={`p-1 rounded ${
                                      isLight ? 'text-cyan-600 hover:bg-slate-100' : 'text-cyan-400 hover:text-cyan-300 hover:bg-slate-800'
                                    }`}
                                    title="اتصال هاتفي"
                                  >
                                    <PhoneCall className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                                <span className={`text-[10px] font-sans block ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                                  صلة: {user.guardianRelation === 'mother' ? 'الأم' : 'ولي الأمر'} {user.guardianJob ? `(${user.guardianJob})` : ''}
                                </span>
                              </div>
                            ) : (
                              <span className={`font-sans text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>مسجل في التفاصيل</span>
                            )}
                          </td>

                          {/* Grade & Location */}
                          <td className={`p-4 font-semibold text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            <div className="space-y-0.5">
                              <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{user.gradeLevel?.split('|')[0]?.trim() || 'الصف الثالث الثانوي'}</div>
                              <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                📍 {user.governorate || 'القاهرة'} {user.city ? `• ${user.city}` : ''}
                              </div>
                              {user.schoolName && (
                                <div className="text-[10px] text-cyan-600 dark:text-cyan-400">🏫 {user.schoolName}</div>
                              )}
                            </div>
                          </td>

                          {/* Account Status Badge */}
                          <td className="p-4 text-center">
                            {user.accountStatus === 'pending_review' || user.accountStatus === 'pending_verification' ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-300 flex items-center gap-1 w-fit mx-auto animate-pulse">
                                <Clock className="w-3 h-3" />
                                <span>قيد المراجعة</span>
                              </span>
                            ) : user.accountStatus === 'rejected' ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:text-rose-400 flex items-center gap-1 w-fit mx-auto">
                                <XCircle className="w-3 h-3" />
                                <span>طلب مرفوض</span>
                              </span>
                            ) : user.accountStatus === 'banned' ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:text-rose-400 flex items-center gap-1 w-fit mx-auto">
                                <ShieldAlert className="w-3 h-3" />
                                <span>محظور نهائياً</span>
                              </span>
                            ) : user.accountStatus === 'suspended' ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-orange-500/10 text-orange-600 border border-orange-500/20 dark:text-orange-400 flex items-center gap-1 w-fit mx-auto">
                                <AlertCircle className="w-3 h-3" />
                                <span>موقوف مؤقتاً</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400 flex items-center gap-1 w-fit mx-auto">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>معتمد ونشط</span>
                              </span>
                            )}
                          </td>

                          {/* Wallet */}
                          <td className="p-4 text-center font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            {user.walletBalance !== undefined ? `${user.walletBalance} ج.م` : '0 ج.م'}
                          </td>

                          {/* Action Buttons */}
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {(user.accountStatus === 'pending_review' || user.accountStatus === 'pending_verification') && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateUserAccountStatus(user.id, 'active');
                                      addToast('success', `تم اعتماد وتفعيل قيد الطالب "${user.name}" بنجاح`);
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors shadow-sm cursor-pointer flex items-center gap-1"
                                    title="قبول واعتماد الطالب بنقرة واحدة"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>قبول</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateUserAccountStatus(user.id, 'rejected');
                                      addToast('error', `تم رفض طلب تسجيل الطالب "${user.name}"`);
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-black bg-rose-500/20 hover:bg-rose-600 text-rose-700 dark:text-rose-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 border border-rose-500/30"
                                    title="رفض طلب القيد ومنع تسجيل البيانات"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>رفض</span>
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedStudentProfile(user)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border ${
                                  isLight
                                    ? 'bg-slate-100 hover:bg-cyan-500 hover:text-slate-950 text-slate-800 border-slate-200'
                                    : 'bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border-slate-700'
                                }`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>الملف الشامل</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setStudentToDelete(user)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 border border-rose-500/20 transition-colors cursor-pointer"
                                title="حذف قيد الطالب نهائياً من القيد والمنظومة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Tab 5: Central Payments & Wallets Treasury */}
      {activeTab === ('payments' as any) && (
        <div className="space-y-6 animate-fade-in text-right" dir="rtl">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1: central toggle & settings */}
            <div className={`lg:col-span-1 p-6 rounded-[32px] border space-y-4 ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className={`flex items-center gap-2 justify-start border-b pb-3 ${
                isLight ? 'border-slate-100' : 'border-slate-800'
              }`}>
                <Sliders className="w-5 h-5 text-rose-500" />
                <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>إعدادات قنوات الدفع المركزية</h3>
              </div>
              
              <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                تتحكم هذه اللوحة في تفعيل وتعطيل وسائل التحويل المتاحة للطلاب، وتحديث أرقام وعناوين الإيداع فوراً لمنع أي تلاعب.
              </p>

              <form onSubmit={(e) => {
                e.preventDefault();
                updatePaymentSettings({
                  vodafoneEnabled: vodafoneOn,
                  vodafoneNumber: vodafoneNum.trim(),
                  instapayEnabled: instapayOn,
                  instapayAddress: instapayAddr.trim(),
                  fawryEnabled: fawryOn,
                  fawryCode: fawryC.trim(),
                  manualEnabled: manualOn,
                  printedCodesFeePercentage: printedFeePct
                });
              }} className="space-y-4 text-right">
              
                {/* Printed Codes Settings */}
                <div className={`p-3 rounded-2xl border space-y-2 ${
                  isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/10 border-amber-500/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-500">نسبة المنصة من الأكواد المطبوعة (%)</span>
                  </div>
                  <input 
                    type="number"
                    min={0}
                    max={100}
                    value={printedFeePct}
                    onChange={(e) => setPrintedFeePct(Number(e.target.value))}
                    className={`w-full px-3 py-1.5 text-xs font-mono rounded-lg border focus:border-amber-500 outline-none ${
                      isLight
                        ? 'bg-white border-amber-200 text-slate-900'
                        : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                  <p className={`text-[10px] ${isLight ? 'text-amber-800' : 'text-amber-300/70'}`}>
                    هذه النسبة (مثال: 15) ستُطبق تلقائياً على أي كود يطبعه المعلم من الآن فصاعداً.
                  </p>
                </div>
                
                {/* Vodafone settings */}
                <div className={`p-3 rounded-2xl border space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>فودافون كاش (Vodafone Cash)</span>
                    <input 
                      type="checkbox" 
                      checked={vodafoneOn} 
                      onChange={(e) => setVodafoneOn(e.target.checked)}
                      className="w-4 h-4 text-rose-600 bg-slate-900 border-slate-800 rounded focus:ring-rose-500"
                    />
                  </div>
                  {vodafoneOn && (
                    <input 
                      type="text"
                      value={vodafoneNum}
                      onChange={(e) => setVodafoneNum(e.target.value)}
                      placeholder="رقم المحفظة المستلمة"
                      className={`w-full px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-rose-500 text-left border ${
                        isLight
                          ? 'bg-white border-slate-200 text-slate-900'
                          : 'bg-slate-900 border-slate-800 text-white'
                      }`}
                    />
                  )}
                </div>

                {/* InstaPay settings */}
                <div className={`p-3 rounded-2xl border space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>إنستاباي (InstaPay IPN)</span>
                    <input 
                      type="checkbox" 
                      checked={instapayOn} 
                      onChange={(e) => setInstapayOn(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 bg-slate-900 border-slate-800 rounded focus:ring-emerald-500"
                    />
                  </div>
                  {instapayOn && (
                    <input 
                      type="text"
                      value={instapayAddr}
                      onChange={(e) => setInstapayAddr(e.target.value)}
                      placeholder="عنوان التحويل (مثال: user@instapay)"
                      className={`w-full px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-500 text-left border ${
                        isLight
                          ? 'bg-white border-slate-200 text-slate-900'
                          : 'bg-slate-900 border-slate-800 text-white'
                      }`}
                    />
                  )}
                </div>

                {/* Fawry settings */}
                <div className={`p-3 rounded-2xl border space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>فوري (Fawry Collect)</span>
                    <input 
                      type="checkbox" 
                      checked={fawryOn} 
                      onChange={(e) => setFawryOn(e.target.checked)}
                      className="w-4 h-4 text-amber-500 bg-slate-900 border-slate-800 rounded focus:ring-amber-500"
                    />
                  </div>
                  {fawryOn && (
                    <input 
                      type="text"
                      value={fawryC}
                      onChange={(e) => setFawryC(e.target.value)}
                      placeholder="كود الخدمة أو رقم الحساب"
                      className={`w-full px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-amber-500 text-left border ${
                        isLight
                          ? 'bg-white border-slate-200 text-slate-900'
                          : 'bg-slate-900 border-slate-800 text-white'
                      }`}
                    />
                  )}
                </div>

                {/* Manual settings */}
                <div className={`p-3 rounded-2xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}>
                  <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>الدفع اليدوي المباشر بالسنتر</span>
                  <input 
                    type="checkbox" 
                    checked={manualOn} 
                    onChange={(e) => setManualOn(e.target.checked)}
                    className="w-4 h-4 text-slate-500 bg-slate-900 border-slate-800 rounded focus:ring-slate-500"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all shadow-md shadow-rose-600/20 cursor-pointer"
                >
                  حفظ وتطبيق القنوات فوراً 🔒
                </button>
              </form>
            </div>

            {/* Column 2: deposit requests list */}
            <div className={`lg:col-span-2 p-6 rounded-[32px] border space-y-4 ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-3 ${
                isLight ? 'border-slate-100' : 'border-slate-800'
              }`}>
                <div className="flex items-center gap-2 justify-start">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>طلبات الإيداع والمراجعة المالية</h3>
                    <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>مطابقة مستندات الإيداع وتحويل الرصيد الحقيقي لمحفظة الطالب.</p>
                  </div>
                </div>
                
                {/* Filter Selector */}
                <div className={`flex items-center gap-1.5 p-1 rounded-xl border ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}>
                  {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setPaymentFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        paymentFilter === status 
                          ? 'bg-rose-600 text-white font-black' 
                          : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {status === 'all' ? 'الكل' :
                       status === 'pending' ? 'المعلقة' :
                       status === 'approved' ? 'المقبولة' : 'المرفوضة'}
                    </button>
                  ))}
                </div>
              </div>

              {depositRequests.filter(req => paymentFilter === 'all' || req.status === paymentFilter).length === 0 ? (
                <div className={`p-12 text-center text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                  لا توجد طلبات إيداع {paymentFilter === 'pending' ? 'معلقة' : paymentFilter === 'approved' ? 'مقبولة' : paymentFilter === 'rejected' ? 'مرفوضة' : ''} حالياً في الخزينة.
                </div>
              ) : (
                <div className="space-y-4">
                  {depositRequests
                    .filter(req => paymentFilter === 'all' || req.status === paymentFilter)
                    .map(req => {
                      const isPending = req.status === 'pending';
                      const isApproved = req.status === 'approved';
                      const isRejected = req.status === 'rejected';

                      return (
                        <div key={req.id} className={`p-5 rounded-2xl border space-y-3 ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                        }`}>
                          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-2 ${
                            isLight ? 'border-slate-200' : 'border-slate-900'
                          }`}>
                            <div className="space-y-0.5 text-right">
                              <span className="text-[10px] text-rose-500 font-mono font-bold">#REQ_{req.id.slice(-6).toUpperCase()}</span>
                              <h4 className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{req.studentName}</h4>
                              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{req.studentEmail} • {req.studentPhone}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{req.amount} ج.م</div>
                              <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{new Date(req.createdAt).toLocaleString('ar-EG')}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1">
                              <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>وسيلة الدفع والمطابقة:</span>
                              <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                                {req.paymentMethod === 'vodafone' ? 'فودافون كاش 📲' :
                                 req.paymentMethod === 'instapay' ? 'إنستاباي (InstaPay) 💳' :
                                 req.paymentMethod === 'fawry' ? 'فوري (Fawry) 🏪' : 'تسليم يدوي بمقر السنتر 🏛️'}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>بيانات إثبات الحوالة:</span>
                              <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 select-all">
                                {req.paymentMethod === 'vodafone' && `المرسل: ${req.senderNumber}`}
                                {(req.paymentMethod === 'instapay' || req.paymentMethod === 'fawry') && `كود المعاملة: ${req.transactionId}`}
                                {req.paymentMethod === 'manual' && 'إيصال مبيعات السنتر'}
                              </span>
                            </div>
                          </div>

                          {req.screenshotUrl && (
                            <div className={`p-2.5 rounded-xl border flex items-center justify-between text-[11px] ${
                              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                            }`}>
                              <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>ملحق الإثبات المكتوب/الرابط:</span>
                              <span className="font-mono text-cyan-600 dark:text-cyan-300 select-all font-bold">{req.screenshotUrl}</span>
                            </div>
                          )}

                          {isRejected && req.rejectionReason && (
                            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-500 leading-relaxed text-right">
                              ❌ تم الرفض بسبب: <span className="font-bold">{req.rejectionReason}</span> {req.updatedAt ? `• تاريخ القرار: ${new Date(req.updatedAt).toLocaleDateString('ar-EG')}` : ''}
                            </div>
                          )}

                          {isApproved && (
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 justify-start">
                              <span>✅ تم اعتماد التحويل بنجاح، وتم شحن الرصيد ومزامنة محفظة الطالب فوراً.</span>
                            </div>
                          )}

                          {isPending && (
                            <div className={`flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t ${
                              isLight ? 'border-slate-200' : 'border-slate-900'
                            }`}>
                              
                              {rejectingReqId === req.id ? (
                                <div className="w-full flex items-center gap-2">
                                  <input 
                                    type="text" 
                                    placeholder="اكتب سبب الرفض بالتفصيل للطالب..."
                                    value={rejectionReasonText}
                                    onChange={(e) => setRejectionReasonText(e.target.value)}
                                    className={`flex-1 px-3 py-2 rounded-xl border border-rose-500 text-xs focus:outline-none text-right ${
                                      isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
                                    }`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!rejectionReasonText.trim()) {
                                        addToast('warning', 'يرجى كتابة سبب الرفض لمساعدة الطالب.');
                                        return;
                                      }
                                      updateDepositRequestStatus(req.id, 'rejected', rejectionReasonText.trim());
                                      setRejectingReqId(null);
                                      setRejectionReasonText('');
                                    }}
                                    className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black cursor-pointer"
                                  >
                                    تأكيد الرفض
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRejectingReqId(null);
                                      setRejectionReasonText('');
                                    }}
                                    className={`px-3 py-2 rounded-xl text-[11px] cursor-pointer ${
                                      isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
                                    }`}
                                  >
                                    إلغاء
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setRejectingReqId(req.id)}
                                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 text-xs font-bold transition-all border border-rose-500/20 cursor-pointer"
                                  >
                                    رفض الإيصال والمطالبة بإعادة الإدخال ❌
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateDepositRequestStatus(req.id, 'approved')}
                                    className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
                                  >
                                    الموافقة والشحن الفوري للرصيد ✅
                                  </button>
                                </>
                              )}

                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Tab 6: Printed Codes Batches & 15% Settlement */}
      {activeTab === 'printed_batches' && (
        <div className="space-y-6 animate-fade-in text-right" dir="rtl">
          {/* Header info */}
          <div className={`p-6 rounded-[32px] border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <QrCode className="w-6 h-6" />
                </span>
                <h3 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  محاسبة وتسويات كروت الأكواد المطبوعة (نسبة المنصة 15%)
                </h3>
              </div>
              <p className={`text-xs max-w-2xl ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                عند قيام المعلم بطباعة أكواد (16 حرف) للدورات لبيعها بالمكتبات أو السناتر، يتم احتساب التزام مالي بنسبة 15% من سعر الدورة عن كل كود مطبوع. يمكنك متابعة التحصيل وتسوية المبالغ مع المعلمين من هنا.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-2xl border text-center ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <span className={`text-[10px] font-bold block ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>إجمالي الدفعات المطبوعة</span>
                <span className="text-lg font-black text-amber-500 font-mono">
                  {printedCodesBatches?.length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          {(() => {
            const totalCodes = (printedCodesBatches || []).reduce((acc, b) => acc + (b.quantity || 0), 0);
            const totalValue = (printedCodesBatches || []).reduce((acc, b) => acc + (b.totalCourseValue || 0), 0);
            const totalPlatformFee = (printedCodesBatches || []).reduce((acc, b) => acc + (b.totalPlatformFee || 0), 0);
            const totalPaid = (printedCodesBatches || []).reduce((acc, b) => acc + (b.settledAmount || 0), 0);
            const totalRemaining = (printedCodesBatches || []).reduce((acc, b) => acc + (b.remainingDueAmount || 0), 0);

            return (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
                }`}>
                  <span className={`text-xs font-bold block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>الأكواد المطبوعة</span>
                  <span className={`text-xl font-black font-mono mt-1 block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {totalCodes.toLocaleString()} كود
                  </span>
                </div>

                <div className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
                }`}>
                  <span className={`text-xs font-bold block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>القيمة الاسمية الإجمالية</span>
                  <span className="text-xl font-black text-sky-500 font-mono mt-1 block">
                    {totalValue.toLocaleString()} ج.م
                  </span>
                </div>

                <div className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
                }`}>
                  <span className={`text-xs font-bold block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>إجمالي عمولة المنصة (15%)</span>
                  <span className="text-xl font-black text-amber-500 font-mono mt-1 block">
                    {totalPlatformFee.toLocaleString()} ج.م
                  </span>
                </div>

                <div className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
                }`}>
                  <span className={`text-xs font-bold block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>المحصل من المعلمين</span>
                  <span className="text-xl font-black text-emerald-500 font-mono mt-1 block">
                    {totalPaid.toLocaleString()} ج.م
                  </span>
                </div>

                <div className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
                }`}>
                  <span className={`text-xs font-bold block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>المتبقي قيد التحصيل</span>
                  <span className="text-xl font-black text-rose-500 font-mono mt-1 block">
                    {totalRemaining.toLocaleString()} ج.م
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Batches List */}
          <div className={`p-6 rounded-[32px] border space-y-4 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
          }`}>
            <h4 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>سجل دفعات الأكواد ومطالبات السداد</h4>

            {(!printedCodesBatches || printedCodesBatches.length === 0) ? (
              <div className={`py-12 text-center space-y-2 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                <QrCode className={`w-12 h-12 mx-auto stroke-[1.5] ${isLight ? 'text-slate-400' : 'text-slate-700'}`} />
                <p className={`text-sm font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>لا توجد أي دفعات أكواد مطبوعة مسجلة بالنظام حتى الآن.</p>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-600'}`}>عند قيام المعلم بطباعة أكواد من لوحة تحكمه ستظهر الدفعة وعمولتها الـ 15% هنا تلقائياً.</p>
              </div>
            ) : (
              <div className={`overflow-x-auto rounded-2xl border ${
                isLight ? 'border-slate-200' : 'border-slate-800'
              }`}>
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead>
                    <tr className={`font-black border-b ${
                      isLight ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}>
                      <th className="p-4">رقم الدفعة & التاريخ</th>
                      <th className="p-4">المعلم والمنصة</th>
                      <th className="p-4">الكورس وسعر الكود</th>
                      <th className="p-4 text-center">الكمية</th>
                      <th className="p-4 text-center">القيمة الإجمالية</th>
                      <th className="p-4 text-center">نسبة المنصة (15%)</th>
                      <th className="p-4 text-center">المسدد / المتبقي</th>
                      <th className="p-4 text-center">حالة السداد</th>
                      <th className="p-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isLight ? 'divide-slate-200 text-slate-700' : 'divide-slate-800/60 text-slate-200'
                  }`}>
                    {printedCodesBatches.map((batch) => {
                      const teacherPlat = platforms.find((p) => p.teacherId === batch.teacherId);
                      return (
                        <tr key={batch.id} className={`transition-colors ${
                          isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-850'
                        }`}>
                          <td className={`p-4 font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            <div>#{batch.batchNumber}</div>
                            <div className={`text-[10px] font-sans mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                              {new Date(batch.createdAt).toLocaleDateString('ar-EG', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                          </td>

                          <td className={`p-4 font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                            <div>{batch.teacherName}</div>
                            <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-normal">
                              {teacherPlat?.name || 'منصة تعليمية'}
                            </div>
                          </td>

                          <td className="p-4">
                            <div className={`font-bold line-clamp-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{batch.courseTitle}</div>
                            <div className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              {batch.coursePrice} ج.م / للكود
                            </div>
                          </td>

                          <td className="p-4 text-center font-bold font-mono">
                            <span className={`px-2.5 py-1 rounded-lg border ${
                              isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800'
                            }`}>
                              {batch.quantity} كود
                            </span>
                          </td>

                          <td className="p-4 text-center font-mono font-bold text-sky-600 dark:text-sky-400">
                            {batch.totalCourseValue.toLocaleString()} ج.م
                          </td>

                          <td className="p-4 text-center font-mono font-black text-amber-600 dark:text-amber-400 bg-amber-500/5">
                            {batch.totalPlatformFee.toLocaleString()} ج.م
                          </td>

                          <td className="p-4 text-center font-mono text-xs">
                            <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                              مسدد: {batch.settledAmount.toLocaleString()} ج.م
                            </div>
                            <div className="text-rose-500 font-bold">
                              متبقي: {batch.remainingDueAmount.toLocaleString()} ج.م
                            </div>
                          </td>

                          <td className="p-4 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-black inline-block ${
                                batch.status === 'settled'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : batch.status === 'partially_paid'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              }`}
                            >
                              {batch.status === 'settled'
                                ? 'تم السداد بالكامل ✓'
                                : batch.status === 'partially_paid'
                                ? 'سداد جزئي'
                                : 'مستحق السداد'}
                            </span>
                          </td>

                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedBatchForInspection(batch)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                                  isLight
                                    ? 'bg-slate-100 hover:bg-slate-200 text-cyan-700 border-slate-200'
                                    : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border-slate-700'
                                }`}
                                title="عرض وفحص الأكواد المطبوعة"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>الأكواد ({batch.quantity})</span>
                              </button>

                              {batch.status !== 'settled' ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    settleCodesBatchByAdmin(
                                      batch.id,
                                      batch.quantity,
                                      'تم السداد بالكامل 100%'
                                    );
                                    addToast('success', `تم تسوية عمولة الدفعة #${batch.batchNumber} بالكامل بنجاح`);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                                >
                                  تسوية 15%
                                </button>
                              ) : (
                                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                                  مسددة ✓
                                </span>
                              )}
                            </div>
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
      )}

      {/* Modal: Super Admin Printed Codes Inspection Modal */}
      {selectedBatchForInspection && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto animate-fade-in ${
          isLight ? 'bg-slate-900/50' : 'bg-slate-950/90'
        }`}>
          <div className={`relative w-full max-w-4xl rounded-3xl border shadow-2xl p-6 sm:p-8 my-8 space-y-6 text-right ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`} dir="rtl">
            <div className={`flex items-center justify-between border-b pb-4 ${
              isLight ? 'border-slate-100' : 'border-slate-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 font-black">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      فحص أكواد الدفعة: [{selectedBatchForInspection.batchNumber}]
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      {selectedBatchForInspection.quantity} كود
                    </span>
                  </div>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    المعلم: <strong className={isLight ? 'text-slate-800' : 'text-white'}>{selectedBatchForInspection.teacherName}</strong> • الكورس: <strong className="text-cyan-600 dark:text-cyan-400">{selectedBatchForInspection.courseTitle}</strong> ({selectedBatchForInspection.coursePrice} ج.م/كود)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBatchForInspection(null)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Status Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className={`p-3.5 rounded-2xl border text-center ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <span className={`text-[11px] block mb-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>عدد الأكواد</span>
                <span className={`text-base font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedBatchForInspection.quantity} كود
                </span>
              </div>
              <div className={`p-3.5 rounded-2xl border text-center ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <span className={`text-[11px] block mb-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>إجمالي قيمة الكورس</span>
                <span className="text-base font-black font-mono text-sky-600 dark:text-sky-400">
                  {selectedBatchForInspection.totalCourseValue.toLocaleString()} ج.م
                </span>
              </div>
              <div className={`p-3.5 rounded-2xl border text-center ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <span className={`text-[11px] block mb-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>مستحق المنصة (15%)</span>
                <span className="text-base font-black font-mono text-rose-500">
                  {selectedBatchForInspection.totalPlatformFee.toLocaleString()} ج.م
                </span>
              </div>
              <div className={`p-3.5 rounded-2xl border text-center ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <span className={`text-[11px] block mb-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>المسدد / المتبقي</span>
                <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 block">
                  مسدد: {selectedBatchForInspection.settledAmount.toLocaleString()} ج.م
                </span>
                <span className="text-[10px] font-bold font-mono text-amber-600 dark:text-amber-400 block">
                  متبقي: {selectedBatchForInspection.remainingDueAmount.toLocaleString()} ج.م
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                قائمة الأكواد الـ 16 حرفاً المشفرة المنشأة والمحولة للإدارة:
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = selectedBatchForInspection.codes
                      .map((c, i) => `${i + 1}. [${c.code}] - ${c.courseTitle} - ${c.status === 'redeemed' ? 'تم التفعيل' : 'متاح'}`)
                      .join('\n');
                    navigator.clipboard.writeText(text);
                    addToast('success', 'تم نسخ جميع الأكواد إلى الحافظة بنجاح! 📋');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    isLight
                      ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الأكواد</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const headers = 'رقم الكود,حالة الكود,اسم الكورس,اسم المعلم,اسم الطالب المفعل,تاريخ التفعيل\n';
                    const rows = selectedBatchForInspection.codes
                      .map(
                        (c) =>
                          `"${c.code}","${c.status}","${c.courseTitle}","${c.teacherName}","${c.redeemedByStudentName || 'لم يستخدم'}","${c.redeemedAt || '-'}"`
                      )
                      .join('\n');
                    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `اكواد_دفعة_${selectedBatchForInspection.batchNumber}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    addToast('success', 'تم تنزيل ملف CSV بنجاح!');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تصدير CSV</span>
                </button>
              </div>
            </div>

            {/* Codes Grid / List */}
            <div className={`max-h-72 overflow-y-auto rounded-2xl border p-3 space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {selectedBatchForInspection.codes.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className={`p-3 rounded-xl border flex flex-col justify-between gap-1 text-xs ${
                      item.status === 'redeemed'
                        ? isLight
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                        : isLight
                          ? 'bg-white border-slate-200 text-slate-700'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>#{idx + 1}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          item.status === 'redeemed'
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : isLight
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.status === 'redeemed' ? 'تم التفعيل' : 'متاح للتفعيل'}
                      </span>
                    </div>

                    <div className={`font-mono font-black text-center py-1 tracking-wider text-sm select-all ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      {item.code}
                    </div>

                    {item.redeemedByStudentName ? (
                      <div className={`text-[10px] truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        الطالب: <strong className="text-cyan-600 dark:text-cyan-400">{item.redeemedByStudentName}</strong>
                      </div>
                    ) : (
                      <div className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                        لم يُستخدم بعد
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`flex items-center justify-between pt-2 border-t ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                ملاحظات المعلم: {selectedBatchForInspection.notes || 'لا توجد'}
              </div>
              <button
                type="button"
                onClick={() => setSelectedBatchForInspection(null)}
                className={`px-5 py-2 rounded-xl font-bold text-xs cursor-pointer ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Comprehensive Student 360° Profile Dossier */}
      {selectedStudentProfile && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto ${
          isLight ? 'bg-slate-900/50' : 'bg-slate-950/85'
        }`}>
          <div className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl p-6 sm:p-8 overflow-hidden text-right my-8 space-y-6 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'
          }`}>
            
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-600" />

            {/* Modal Header */}
            <div className={`flex items-center justify-between border-b pb-4 ${
              isLight ? 'border-slate-100' : 'border-slate-800'
            }`}>
              <div className="flex items-center gap-3">
                {selectedStudentProfile.photoUrl ? (
                  <img
                    src={selectedStudentProfile.photoUrl}
                    alt={selectedStudentProfile.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-500 shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-slate-950 flex items-center justify-center font-black text-lg">
                    {selectedStudentProfile.name.trim().substring(0, 2)}
                  </div>
                )}
                <div>
                  <h3 className={`text-lg font-black flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <span>{selectedStudentProfile.fourPartName || selectedStudentProfile.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-lg border font-bold ${
                      selectedStudentProfile.accountStatus === 'active' || selectedStudentProfile.accountStatus === 'verified'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : selectedStudentProfile.accountStatus === 'suspended'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }`}>
                      {selectedStudentProfile.accountStatus === 'active' || selectedStudentProfile.accountStatus === 'verified'
                        ? 'قيد معتمد ونشط'
                        : selectedStudentProfile.accountStatus === 'suspended'
                        ? 'حساب موقوف'
                        : 'قيد المراجعة والتدقيق'}
                    </span>
                  </h3>
                  <div className="text-xs text-cyan-600 dark:text-cyan-400 font-mono font-bold mt-0.5">
                    {selectedStudentProfile.studentCode || `SEA-${selectedStudentProfile.id.substring(0, 6).toUpperCase()}`}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudentProfile(null)}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                  isLight ? 'bg-slate-100 text-slate-500 hover:text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ✕
              </button>
            </div>

            {/* Live Camera Photo Verification Banner (if captured) */}
            {selectedStudentProfile.photoUrl || selectedStudentProfile.avatar ? (
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center gap-4 ${
                isLight ? 'bg-cyan-50/70 border-cyan-200' : 'bg-cyan-950/40 border-cyan-800/60'
              }`}>
                <div
                  className="relative group cursor-pointer shrink-0"
                  onClick={() => setInspectedStudentPhoto({
                    name: selectedStudentProfile.fourPartName || selectedStudentProfile.name,
                    photoUrl: selectedStudentProfile.photoUrl || selectedStudentProfile.avatar!,
                    code: selectedStudentProfile.officialStudentId || selectedStudentProfile.studentCode,
                    nationalId: selectedStudentProfile.nationalId,
                  })}
                  title="انقر لتكبير صورة وجه الطالب وفحص الهوية"
                >
                  <img
                    src={selectedStudentProfile.photoUrl || selectedStudentProfile.avatar}
                    alt="Live Capture"
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-cyan-400 shadow-xl group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white p-1 rounded-lg text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm">
                    <Eye className="w-3 h-3 text-cyan-400" />
                    <span>تكبير</span>
                  </span>
                </div>
                <div className="space-y-1.5 text-right flex-1">
                  <div className="text-xs font-black text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-cyan-500" />
                    <span>صورة التحقق الحية عبر الكاميرا (Live Identity Verification)</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    تم التقاط الصورة الحية لوجه الطالب أثناء استمارة التسجيل للتحقق من هويته ومطابقتها ومنع انتحال الشخصية. يمكنك النقر على الصورة لتكبيرها وفحصها بدقة.
                  </p>
                </div>
              </div>
            ) : (
              <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/30 border-amber-800 text-amber-200'
              }`}>
                <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                <div className="text-xs space-y-0.5">
                  <strong className="block font-black">تنبيـه إداري: لم يتم التقاط صورة حية للطالب أثناء التسجيل</strong>
                  <p className="text-[11px] opacity-90">قد يكون الطالب قد سجل قبل تفعيل كاميرا التحقق. يرجى التأكد من هويته قبل القبول.</p>
                </div>
              </div>
            )}

            {/* Official Admitted Student ID & Sequential File Card */}
            <div className={`p-4 rounded-2xl border space-y-2 ${
              isLight ? 'bg-amber-50/80 border-amber-200 text-slate-900' : 'bg-amber-950/30 border-amber-800/60 text-slate-100'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                    <IdCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs">كود واعتمادات ملف الطالب الموحد (SEA Sequential Dossier)</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">مرتبط بملف المحتوى الحساس والأرقام التسلسلية لحظر التسريب</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const currentSeq = selectedStudentProfile.seaSequenceNumber || 1;
                    const seqFormatted = String(currentSeq).padStart(4, '0');
                    updateStudentAdmissionData(selectedStudentProfile.id, {
                      seaSequenceNumber: currentSeq,
                      officialStudentId: `STU-2026-${seqFormatted}`,
                      fileRegistrationNumber: `FILE-2026-${seqFormatted}`,
                    });
                    setSelectedStudentProfile((prev) => prev ? {
                      ...prev,
                      seaSequenceNumber: currentSeq,
                      officialStudentId: `STU-2026-${seqFormatted}`,
                      fileRegistrationNumber: `FILE-2026-${seqFormatted}`,
                    } : null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-black cursor-pointer shadow-sm flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{selectedStudentProfile.officialStudentId ? 'تجديد التسلسل' : 'توليد الكود التسلسلي تلقائياً'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-xs">
                <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-amber-200' : 'bg-slate-900 border-slate-800'}`}>
                  <span className="block text-[9px] font-sans font-bold text-slate-500">الرقم التسلسلي الموحد:</span>
                  <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                    {selectedStudentProfile.seaSequenceNumber ? `#${String(selectedStudentProfile.seaSequenceNumber).padStart(4, '0')}` : 'غير مخصص بعد'}
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-amber-200' : 'bg-slate-900 border-slate-800'}`}>
                  <span className="block text-[9px] font-sans font-bold text-slate-500">الكود الرسمي المقبول (Official ID):</span>
                  <span className="font-black text-cyan-600 dark:text-cyan-400 select-all">
                    {selectedStudentProfile.officialStudentId || selectedStudentProfile.studentCode || 'قيد الاعتماد'}
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-amber-200' : 'bg-slate-900 border-slate-800'}`}>
                  <span className="block text-[9px] font-sans font-bold text-slate-500">رقم الملف التعليمي (Linked File ID):</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 select-all">
                    {selectedStudentProfile.fileRegistrationNumber || 'قيد الاعتماد'}
                  </span>
                </div>
              </div>
            </div>

            {/* Dossier Grid Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Student Identification & Enrollment Code */}
              <div className={`p-3.5 rounded-2xl border space-y-1 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <span className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>كود الطالب الموحد (SEA-ID):</span>
                <div className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-sm select-all">
                  {selectedStudentProfile.studentCode || `SEA-2026-${selectedStudentProfile.id.substring(0, 5)}`}
                </div>
                {selectedStudentProfile.nationalId && (
                  <div className={`text-[11px] font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    الرقم القومي: <span className="font-bold select-all">{selectedStudentProfile.nationalId}</span>
                  </div>
                )}
              </div>

              {/* Student WhatsApp Contact & Secure Password Card */}
              <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>هاتف الطالب الشخصي (واتساب):</span>
                  <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 font-mono">حماية بيانات الاعتماد</span>
                </div>
                <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm select-all">
                  {selectedStudentProfile.phone || '—'}
                </div>
                <div className={`text-[11px] font-mono select-all ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  البريد: {selectedStudentProfile.email}
                </div>

                {/* Secure Password Reveal via Master Admin Password */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      كلمة مرور الطالب المسجلة:
                    </span>
                  </div>

                  {isPasswordUnlockedForStudent ? (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 text-xs select-all">
                        {selectedStudentProfile.plainPassword || selectedStudentProfile.password || 'غير متوفرة'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsPasswordUnlockedForStudent(false)}
                        className="text-[10px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
                      >
                        إخفاء
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        لأمان بيانات الطلاب، يرجى إدخال كلمة سر المشرف الرئيسية لاعتماد الكشف عن كلمة المرور:
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          placeholder="كلمة مرور المشرف الرئيسية..."
                          value={adminPasswordInput}
                          onChange={(e) => {
                            setAdminPasswordInput(e.target.value);
                            setAdminPasswordError(false);
                          }}
                          className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (adminPasswordInput.trim() === 'dfg-paswrd-00&109phj') {
                              setIsPasswordUnlockedForStudent(true);
                              setAdminPasswordError(false);
                              setAdminPasswordInput('');
                            } else {
                              setAdminPasswordError(true);
                            }
                          }}
                          className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all cursor-pointer"
                        >
                          كشف
                        </button>
                      </div>
                      {adminPasswordError && (
                        <p className="text-[10px] text-rose-500 font-bold">
                          ❌ كلمة سر المشرف غير صحيحة (كلمة المرور المطلوبة: dfg-paswrd-00&109phj)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Guardian Information */}
              <div className={`p-3.5 rounded-2xl border space-y-1 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <span className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>بيانات ولي الأمر:</span>
                <div className={`font-mono font-bold text-sm select-all ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedStudentProfile.guardianPhone || '—'}
                </div>
                <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  صلة القرابة: {selectedStudentProfile.guardianRelation === 'mother' ? 'الأم' : 'ولي الأمر'} {selectedStudentProfile.guardianJob ? `• الوظيفة: ${selectedStudentProfile.guardianJob}` : ''}
                </div>
              </div>

              {/* Academic Track & Location */}
              <div className={`p-3.5 rounded-2xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <span className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>المسار الأكاديمي والمدرسة:</span>
                <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedStudentProfile.gradeLevel || 'الصف الثالث الثانوي'}
                </div>
                <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold">
                  🏫 {selectedStudentProfile.schoolName || 'ثانوية عامة'} • 📍 {selectedStudentProfile.governorate || 'القاهرة'} {selectedStudentProfile.city ? `(${selectedStudentProfile.city})` : ''}
                </div>
                {selectedStudentProfile.gpsLocation && (
                  <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      📍 موثق بـ GPS (دقة: ±{selectedStudentProfile.gpsLocation.accuracy || 10}م)
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${selectedStudentProfile.gpsLocation.lat},${selectedStudentProfile.gpsLocation.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 text-[11px] font-bold transition-all flex items-center gap-1"
                    >
                      <span>عرض موقع المدرسة بـ Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

            </div>

            {/* Account Status Control by Admin */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>التحكم الإداري بحالة قيد الطالب:</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400">STATUS_ADMIN_CONTROL</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateUserAccountStatus(selectedStudentProfile.id, 'active');
                    setSelectedStudentProfile((prev) => prev ? { ...prev, accountStatus: 'active' } : null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedStudentProfile.accountStatus === 'active' || selectedStudentProfile.accountStatus === 'verified'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-500/20'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>اعتماد وتفعيل القيد (Accept)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusReasonModal({ user: selectedStudentProfile, status: 'rejected' });
                    setStatusReasonInput(selectedStudentProfile.accountStatusReason || 'عدم استيفاء شروط القيد أو تقديم بيانات غير دقيقة عند التسجيل.');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedStudentProfile.accountStatus === 'rejected'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-500/20'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>رفض طلب القيد وتوضيح السبب (Reject)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusReasonModal({ user: selectedStudentProfile, status: 'suspended' });
                    setStatusReasonInput(selectedStudentProfile.accountStatusReason || 'تجميد الحساب وتكبيح الدخول بسبب تصوير المحتوى أو سلوك غير لائق.');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedStudentProfile.accountStatus === 'suspended'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-amber-500/10 text-amber-600 hover:bg-amber-600 hover:text-white border border-amber-500/20'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>تجميد وإيقاف مؤقت (Freeze / Suspend)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusReasonModal({ user: selectedStudentProfile, status: 'banned' });
                    setStatusReasonInput(selectedStudentProfile.accountStatusReason || 'حظر الحساب نهائياً لمخالفة شروط الاستخدام وحماية الملكية الفكرية.');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedStudentProfile.accountStatus === 'banned'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-500/20'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>حظر الحساب (Ban)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusReasonModal({ user: selectedStudentProfile, status: 'deleted' });
                    setStatusReasonInput(selectedStudentProfile.accountStatusReason || 'مسح وإلغاء قيد الحساب نهائياً مع إشعار الطالب بسبب الإلغاء.');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                  title="مسح الطالب وإبلاغه بسبب إلغاء القيد"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف وإلغاء القيد نهائياً</span>
                </button>
              </div>
            </div>

            {/* Central Authority Security Stamp */}
            <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
              isLight
                ? 'bg-cyan-50 border-cyan-200 text-slate-700'
                : 'bg-cyan-950/40 border-cyan-800/60 text-slate-300'
            }`}>
              <div className="space-y-0.5">
                <div className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>ملف موحد خاضع لسياسة الحساب المفرد والمراجعة المركزية</span>
                </div>
                <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  تم قيد الطالب بالسلطة التعليمية الموحدة ويتم منع مشاركة الحساب أو تكرار الجلسات.
                </div>
              </div>
              <div className={`font-mono text-[10px] px-2 py-1 rounded border ${
                isLight ? 'bg-white border-cyan-200 text-cyan-700' : 'bg-slate-950 text-cyan-400 border-slate-800'
              }`}>
                VERIFIED_STUDENT
              </div>
            </div>

            {/* Modal Actions */}
            <div className={`flex items-center justify-between pt-2 border-t ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <button
                type="button"
                onClick={() => setSelectedStudentProfile(null)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                إغلاق الكشف
              </button>

              <div className="flex items-center gap-2">
                {selectedStudentProfile.phone && (
                  <a
                    href={`https://wa.me/2${selectedStudentProfile.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>مراسلة واتساب</span>
                  </a>
                )}
                {selectedStudentProfile.guardianPhone && (
                  <a
                    href={`tel:${selectedStudentProfile.guardianPhone}`}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>الاتصال بولي الأمر</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Create New Platform */}
      {isCreateModalOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto ${
          isLight ? 'bg-slate-900/50' : 'bg-slate-950/80'
        }`}>
          <div className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl p-6 sm:p-8 overflow-hidden text-right my-8 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'
          }`}>
            <div className={`flex items-center justify-between pb-4 border-b mb-6 ${
              isLight ? 'border-slate-100' : 'border-slate-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>تخصيص منصة تعليمية جديدة للمعلم</h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>السلطة التعليمية الذكية SEA</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'
                }`}
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreatePlatformSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    اسم المنصة التعليمية
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أكاديمية النخبة في الكيمياء"
                    value={newPlatformData.name}
                    onChange={(e) => setNewPlatformData({ ...newPlatformData, name: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:border-cyan-500 focus:outline-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    المادة الدراسية
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: الكيمياء للثانوية العامة"
                    value={newPlatformData.subject}
                    onChange={(e) => setNewPlatformData({ ...newPlatformData, subject: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:border-cyan-500 focus:outline-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    اسم المعلم
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أ/ محمد رضوان"
                    value={newPlatformData.teacherName}
                    onChange={(e) => setNewPlatformData({ ...newPlatformData, teacherName: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:border-cyan-500 focus:outline-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    رقم هاتف المعلم / واتساب
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="010XXXXXXXX"
                    value={newPlatformData.teacherPhone}
                    onChange={(e) => setNewPlatformData({ ...newPlatformData, teacherPhone: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:border-cyan-500 focus:outline-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Teacher Login Credentials set by Admin */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                isLight ? 'bg-cyan-50 border-cyan-200' : 'bg-cyan-950/30 border-cyan-800/40'
              }`}>
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-300 font-bold text-xs">
                  <KeyRound className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>بيانات دخول المعلم الخاصة (تسليم الحساب)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      بريد تسجيل دخول المعلم
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="teacher@sea-platform.com"
                      value={newPlatformData.teacherEmail}
                      onChange={(e) => setNewPlatformData({ ...newPlatformData, teacherEmail: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:border-cyan-500 focus:outline-none ${
                        isLight
                          ? 'bg-white border-slate-200 text-slate-900'
                          : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      كلمة المرور الممنوحة للمعلم
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="كلمة مرور المعلم"
                      value={newPlatformData.teacherPassword}
                      onChange={(e) => setNewPlatformData({ ...newPlatformData, teacherPassword: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:border-cyan-500 focus:outline-none font-mono ${
                        isLight
                          ? 'bg-white border-slate-200 text-slate-900'
                          : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    اللون الرئيسي للثيم
                  </label>
                  <select
                    value={newPlatformData.themeColor}
                    onChange={(e) => setNewPlatformData({ ...newPlatformData, themeColor: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:border-cyan-500 focus:outline-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  >
                    <option value="#0ea5e9">أزرق سماوي (Sky)</option>
                    <option value="#10b981">أخضر زمردي (Emerald)</option>
                    <option value="#8b5cf6">بنفسجي ملكي (Violet)</option>
                    <option value="#f59e0b">كهرماني ذهبي (Amber)</option>
                    <option value="#ec4899">وردي فاقع (Pink)</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    سعر الاشتراك الشهري (ج.م)
                  </label>
                  <input
                    type="number"
                    value={newPlatformData.monthlyRentPrice}
                    onChange={(e) => setNewPlatformData({ ...newPlatformData, monthlyRentPrice: Number(e.target.value) })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:border-cyan-500 focus:outline-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    سعر الاشتراك السنوي (ج.م)
                  </label>
                  <input
                    type="number"
                    value={newPlatformData.annualRentPrice}
                    onChange={(e) => setNewPlatformData({ ...newPlatformData, annualRentPrice: Number(e.target.value) })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:border-cyan-500 focus:outline-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className={`pt-4 flex items-center justify-end gap-3 border-t ${
                isLight ? 'border-slate-200' : 'border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-950/20 cursor-pointer"
                >
                  تأكيد إنشاء المنصة وتسليم الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Teacher Credentials */}
      {credentialsModalPlatform && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md ${
          isLight ? 'bg-slate-900/50' : 'bg-slate-950/80'
        }`}>
          <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-8 text-right ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'
          }`}>
            <div className={`flex items-center justify-between pb-4 border-b mb-5 ${
              isLight ? 'border-slate-100' : 'border-slate-800'
            }`}>
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                <div>
                  <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>تعديل بيانات دخول المعلم</h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{credentialsModalPlatform.teacherName}</p>
                </div>
              </div>
              <button
                onClick={() => setCredentialsModalPlatform(null)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'
                }`}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  اسم المعلم المعتمد من الإدارة (يظهر في الترحيب والمنصة بدلاً من الإيميل) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أ/ محمد رضوان"
                  value={credTeacherName}
                  onChange={(e) => setCredTeacherName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:border-cyan-500 focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  اللقب والصفة الرسمية للمعلم
                </label>
                <input
                  type="text"
                  placeholder="مثال: معلم أول ومعد برامج الثانوية العامة"
                  value={credTeacherTitle}
                  onChange={(e) => setCredTeacherTitle(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:border-cyan-500 focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  البريد الإلكتروني لتسجيل الدخول *
                </label>
                <input
                  type="email"
                  required
                  value={credEmail}
                  onChange={(e) => setCredEmail(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:border-cyan-500 focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  كلمة المرور الجديدة *
                </label>
                <input
                  type="text"
                  required
                  value={credPassword}
                  onChange={(e) => setCredPassword(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:border-cyan-500 focus:outline-none font-mono ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  حالة الحساب والمنصة
                </label>
                <select
                  value={credStatus}
                  onChange={(e) => setCredStatus(e.target.value as EducationalPlatform['status'])}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:border-cyan-500 focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                >
                  <option value="active">نشطة ومفعلة (Active)</option>
                  <option value="suspended">موقوفة ومجمدة (Suspended)</option>
                  <option value="maintenance">تحت الصيانة (Maintenance)</option>
                </select>
              </div>

              <div className={`pt-4 flex items-center justify-end gap-3 border-t ${
                isLight ? 'border-slate-200' : 'border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setCredentialsModalPlatform(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  حفظ البيانات فوراً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Student Confirmation */}
      {studentToDelete && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md ${
          isLight ? 'bg-slate-900/60' : 'bg-slate-950/85'
        }`}>
          <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-6 text-right space-y-5 animate-scale-in ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                تأكيد حذف قيد الطالب نهائياً
              </h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                هل أنت متأكد تماماً من حذف وإلغاء قيد الطالب{' '}
                <strong className="text-rose-600 dark:text-rose-400 font-bold">{studentToDelete.fourPartName || studentToDelete.name}</strong>{' '}
                ({studentToDelete.officialStudentId || studentToDelete.studentCode || studentToDelete.email})؟
              </p>
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold text-right space-y-1">
                <span>⚠️ تنبيه سيادة الإدارة:</span>
                <p className="text-[11px] font-normal opacity-90">
                  هذا الإجراء مسح نهائي لبيانات وملف الطالب ومحفظته الإلكترونية من قواعد البيانات بالكامل، ولا يمكن التراجع عنه!
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs cursor-pointer ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                إلغاء الأمر
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteUserProfile(studentToDelete.id);
                  if (selectedStudentProfile?.id === studentToDelete.id) {
                    setSelectedStudentProfile(null);
                  }
                  setStudentToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer shadow-lg shadow-rose-600/20 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، حذف الطالب</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Full-Screen Live Student Photo Inspection */}
      {inspectedStudentPhoto && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md ${
          isLight ? 'bg-slate-900/70' : 'bg-slate-950/90'
        }`}>
          <div className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 text-right space-y-4 animate-scale-in ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-cyan-500" />
                <h3 className={`font-black text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  فحص الصورة الحية للطالب وربط الهوية
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedStudentPhoto(null)}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                  isLight ? 'bg-slate-100 text-slate-500 hover:text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ✕
              </button>
            </div>

            <div className="text-center space-y-3">
              <div className="relative inline-block mx-auto">
                <img
                  src={inspectedStudentPhoto.photoUrl}
                  alt={inspectedStudentPhoto.name}
                  className="max-h-[380px] w-auto max-w-full rounded-2xl object-contain border-4 border-cyan-500/80 shadow-2xl mx-auto"
                />
              </div>
              <div className="space-y-1">
                <div className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {inspectedStudentPhoto.name}
                </div>
                {inspectedStudentPhoto.code && (
                  <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                    الكود الرسمي: {inspectedStudentPhoto.code}
                  </div>
                )}
                {inspectedStudentPhoto.nationalId && (
                  <div className={`text-xs font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    الرقم القومي: {inspectedStudentPhoto.nationalId}
                  </div>
                )}
                <p className={`text-[11px] pt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  📸 تم التقاط هذا الخيار بالكاميرا الحية لتأكيد هوية الطالب المطابق ومنع انتحال الشخصية.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectedStudentPhoto(null)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
              >
                تأكيد مطابقة الهوية والإغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Account Status Reason Input Modal */}
      {statusReasonModal && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md ${
          isLight ? 'bg-slate-900/60' : 'bg-slate-950/85'
        }`}>
          <div className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 text-right space-y-4 animate-scale-in ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`} dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {statusReasonModal.status === 'suspended' && 'تجميد وإيقاف حساب الطالب'}
                    {statusReasonModal.status === 'banned' && 'حظر حساب الطالب نهائياً'}
                    {statusReasonModal.status === 'rejected' && 'رفض طلب القيد بقرار إداري'}
                    {statusReasonModal.status === 'deleted' && 'حذف وإلغاء قيد الطالب نهائياً'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    الطالب: <strong className="text-cyan-600 font-bold">{statusReasonModal.user.fourPartName || statusReasonModal.user.name}</strong> ({statusReasonModal.user.officialStudentId || statusReasonModal.user.studentCode})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStatusReasonModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className={`block text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                اكتب سبب {statusReasonModal.status === 'suspended' ? 'تجميد' : statusReasonModal.status === 'banned' ? 'حظر' : 'إلغاء'} الحساب يدوياً ليظهر للطالب عند محاولة الدخول: <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={statusReasonInput}
                onChange={(e) => setStatusReasonInput(e.target.value)}
                placeholder="مثال: تم تجميد حسابك بسبب تصوير وتداول المحتوى التعليمي بغير وجه حق، أو تقديم بيانات غير صحيحة عند التسجيل..."
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-xs font-medium focus:border-cyan-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500">نماذج أسباب سريعة جاهزة للاختيار:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "مخالفة قواعد الانضباط وتصوير وتداول المحتوى التعليمي",
                  "تقديم بيانات قيد ومستندات غير صحيحة عند التسجيل",
                  "محاولات دخول مشبوهة وتكرار فتح الحساب من أجهزة متعددة",
                  "عدم الالتزام بسداد المصروفات والرسوم الدراسية المستحقة",
                  "سلوك غير لائق وإساءة استخدام أدوات المنظومة"
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setStatusReasonInput(preset)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-600 text-[10px] font-medium transition-all text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStatusReasonModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  const finalReason = statusReasonInput.trim() || "تم تجميد/إلغاء الحساب بقرار إداري مباشر لمخالفة التعليمات.";
                  if (statusReasonModal.status === 'deleted') {
                    deleteUserProfile(statusReasonModal.user.id, finalReason);
                    if (selectedStudentProfile?.id === statusReasonModal.user.id) {
                      setSelectedStudentProfile(null);
                    }
                  } else {
                    updateUserAccountStatus(statusReasonModal.user.id, statusReasonModal.status, finalReason);
                    if (selectedStudentProfile?.id === statusReasonModal.user.id) {
                      setSelectedStudentProfile((prev) => prev ? { ...prev, accountStatus: statusReasonModal.status, accountStatusReason: finalReason } : null);
                    }
                  }
                  setStatusReasonModal(null);
                  setStatusReasonInput("");
                }}
                className={`px-5 py-2 rounded-xl text-xs font-black text-white shadow-lg flex items-center gap-1.5 cursor-pointer ${
                  statusReasonModal.status === 'suspended' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد الإجراء وتوثيق السبب للطالب</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

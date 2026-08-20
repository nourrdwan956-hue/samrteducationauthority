import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  EducationalPlatform,
  PrintedCodesBatch,
  Course,
  User,
  DepositRequest,
  SupportTicket,
  PlatformOrderRequest,
} from '../../types';
import {
  Database,
  RefreshCw,
  Zap,
  TrendingUp,
  QrCode,
  ShieldCheck,
  Smartphone,
  Users,
  BookOpen,
  DollarSign,
  Headphones,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ExternalLink,
  KeyRound,
  Eye,
  Lock,
  Unlock,
  Copy,
  Check,
  Search,
  Filter,
  Layers,
  Sparkles,
  Server,
  Activity,
  FileSpreadsheet,
} from 'lucide-react';

interface AdminSummaryCockpitProps {
  onNavigateToTab: (
    tab: 'platforms' | 'requests' | 'tickets' | 'registrants' | 'payments' | 'printed_batches',
    filterOrId?: string
  ) => void;
  onOpenCredentialsModal: (platform: EducationalPlatform) => void;
  onInspectBatch: (batch: PrintedCodesBatch) => void;
}

export const AdminSummaryCockpit: React.FC<AdminSummaryCockpitProps> = ({
  onNavigateToTab,
  onOpenCredentialsModal,
  onInspectBatch,
}) => {
  const {
    platforms,
    courses,
    printedCodesBatches,
    userProfiles,
    depositRequests,
    supportTickets,
    orderRequests,
    isSyncingData,
    lastDatabaseSyncTime,
    supabaseLatency,
    refreshAllAdministrativeData,
    updatePlatform,
    updateDepositRequestStatus,
    addToast,
    setSelectedPlatformId,
    setCurrentView,
    theme,
  } = useApp();

  const isLight = theme === 'light';
  const [courseSearch, setCourseSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // --- Aggregated Real-time Calculations ---
  const stats = useMemo(() => {
    // Platforms stats
    const totalPlatforms = platforms.length;
    const activePlatforms = platforms.filter((p) => p.status === 'active').length;
    const suspendedPlatforms = platforms.filter((p) => p.status === 'suspended').length;

    // Printed Codes stats
    const allBatches = printedCodesBatches || [];
    const totalBatchesCount = allBatches.length;
    let totalPrintedCodes = 0;
    let totalRedeemedCodes = 0;
    let totalAvailableCodes = 0;
    let totalGrossValue = 0;
    let totalPlatform15Fee = 0;
    let totalSettledFee = 0;
    let totalRemainingFee = 0;

    allBatches.forEach((b) => {
      const q = b.quantity || b.codes?.length || 0;
      totalPrintedCodes += q;
      const redeemedInBatch = b.codes ? b.codes.filter((c) => c.status === 'redeemed').length : 0;
      totalRedeemedCodes += redeemedInBatch;
      totalAvailableCodes += q - redeemedInBatch;
      totalGrossValue += b.totalCourseValue || 0;
      totalPlatform15Fee += b.totalPlatformFee || 0;
      totalSettledFee += b.settledAmount || 0;
      totalRemainingFee += b.remainingDueAmount || 0;
    });

    // Students & 2-Device security stats
    const studentsList = (userProfiles || []).filter((u) => u.role === 'student');
    const totalStudents = studentsList.length;
    const studentsWith1Device = studentsList.filter(
      (u) => u.deviceInfo?.primaryDeviceId && !u.deviceInfo?.secondaryDeviceId
    ).length;
    const studentsWith2Devices = studentsList.filter(
      (u) => u.deviceInfo?.primaryDeviceId && u.deviceInfo?.secondaryDeviceId
    ).length;

    // Financial & Treasury stats
    const pendingDeposits = (depositRequests || []).filter((d) => d.status === 'pending');
    const pendingDepositsSum = pendingDeposits.reduce((acc, d) => acc + d.amount, 0);
    const approvedDeposits = (depositRequests || []).filter((d) => d.status === 'approved');
    const approvedDepositsSum = approvedDeposits.reduce((acc, d) => acc + d.amount, 0);

    // Support & Requests stats
    const openTickets = (supportTickets || []).filter((t) => t.status === 'open');
    const urgentTickets = openTickets.filter((t) => t.priority === 'urgent');
    const pendingOrders = (orderRequests || []).filter((o) => o.status === 'pending');

    return {
      totalPlatforms,
      activePlatforms,
      suspendedPlatforms,
      totalBatchesCount,
      totalPrintedCodes,
      totalRedeemedCodes,
      totalAvailableCodes,
      totalGrossValue,
      totalPlatform15Fee,
      totalSettledFee,
      totalRemainingFee,
      totalStudents,
      studentsWith1Device,
      studentsWith2Devices,
      pendingDepositsCount: pendingDeposits.length,
      pendingDepositsSum,
      approvedDepositsSum,
      openTicketsCount: openTickets.length,
      urgentTicketsCount: urgentTickets.length,
      pendingOrdersCount: pendingOrders.length,
    };
  }, [platforms, printedCodesBatches, userProfiles, depositRequests, supportTickets, orderRequests]);

  // Group printed batches by course for comprehensive inspection
  const courseCodeLedger = useMemo(() => {
    const map = new Map<
      string,
      {
        courseId: string;
        courseTitle: string;
        coursePrice: number;
        platformId: string;
        platformName: string;
        teacherName: string;
        batches: PrintedCodesBatch[];
        totalCodesCount: number;
        redeemedCount: number;
        activeCount: number;
        totalValue: number;
        platformFee15: number;
        settledAmount: number;
        remainingDue: number;
      }
    >();

    (printedCodesBatches || []).forEach((batch) => {
      const course = courses.find((c) => c.id === batch.courseId);
      const plat = platforms.find((p) => p.id === batch.platformId || p.teacherId === batch.teacherId);
      const courseKey = batch.courseId || batch.courseTitle;

      const current = map.get(courseKey) || {
        courseId: batch.courseId,
        courseTitle: batch.courseTitle || course?.title || 'كورس غير محدد',
        coursePrice: batch.coursePrice || course?.price || 0,
        platformId: batch.platformId || plat?.id || '',
        platformName: plat?.name || 'منصة تعليمية',
        teacherName: batch.teacherName || plat?.teacherName || 'المعلم',
        batches: [],
        totalCodesCount: 0,
        redeemedCount: 0,
        activeCount: 0,
        totalValue: 0,
        platformFee15: 0,
        settledAmount: 0,
        remainingDue: 0,
      };

      current.batches.push(batch);
      const q = batch.quantity || batch.codes?.length || 0;
      current.totalCodesCount += q;
      const redeemed = batch.codes ? batch.codes.filter((c) => c.status === 'redeemed').length : 0;
      current.redeemedCount += redeemed;
      current.activeCount += q - redeemed;
      current.totalValue += batch.totalCourseValue || 0;
      current.platformFee15 += batch.totalPlatformFee || 0;
      current.settledAmount += batch.settledAmount || 0;
      current.remainingDue += batch.remainingDueAmount || 0;

      map.set(courseKey, current);
    });

    return Array.from(map.values()).filter((item) => {
      if (!courseSearch) return true;
      const q = courseSearch.toLowerCase();
      return (
        item.courseTitle.toLowerCase().includes(q) ||
        item.teacherName.toLowerCase().includes(q) ||
        item.platformName.toLowerCase().includes(q)
      );
    });
  }, [printedCodesBatches, courses, platforms, courseSearch]);

  return (
    <div className="space-y-8" dir="rtl">
      {/* Top Banner: Cloud Database Live Status & Fast Action Bar */}
      <div
        className={`p-6 rounded-[28px] border shadow-2xl relative overflow-hidden transition-all duration-300 ${
          isLight
            ? 'bg-gradient-to-r from-slate-100 via-white to-sky-50/50 border-slate-200 shadow-slate-200/50'
            : 'bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border-cyan-500/20 shadow-2xl'
        }`}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 shadow-sm ${
                  isLight
                    ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                    : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                قاعدة البيانات السحابية متصلة ولحظية
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1 ${
                  isLight
                    ? 'bg-white text-slate-700 border-slate-200'
                    : 'bg-slate-800/90 text-slate-300 border-slate-700/80'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                زمن الاستجابة: {supabaseLatency}ms
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                  isLight
                    ? 'bg-white text-slate-600 border-slate-200'
                    : 'bg-slate-800/90 text-slate-400 border-slate-700/80'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-cyan-500" />
                آخر مزامنة: {lastDatabaseSyncTime}
              </span>
            </div>

            <h2
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              وثيقة الملخص الشامل ولوحة قيادة المنظومة (SEA Executive Cockpit)
            </h2>
            <p
              className={`text-xs sm:text-sm max-w-3xl leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              تقرير إداري لحظي يربط جميع كروت الأكواد المطبوعة، المنصات التعليمية، أجهزة وأمان الطلاب (جهازين)، والخزينة المالية في شاشة واحدة فورية وسريعة الاستجابة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => refreshAllAdministrativeData()}
              disabled={isSyncingData}
              className="flex-1 lg:flex-none px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingData ? 'animate-spin' : ''}`} />
              <span>{isSyncingData ? 'جارِ جلب وتحديث البيانات...' : 'مزامنة وتحديث فوري ⚡'}</span>
            </button>
          </div>
        </div>

        {/* Live Notification Alerts Strip */}
        <div
          className={`mt-6 pt-5 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${
            isLight ? 'border-slate-200' : 'border-slate-800/80'
          }`}
        >
          {/* Alert: Printed Codes */}
          <div
            onClick={() => onNavigateToTab('printed_batches')}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
              isLight
                ? 'bg-amber-50 border-amber-200/80 hover:bg-amber-100/70 shadow-sm'
                : 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isLight ? 'bg-amber-200/60 text-amber-700' : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <span
                  className={`text-[11px] font-bold block ${
                    isLight ? 'text-amber-800' : 'text-amber-400'
                  }`}
                >
                  كروت الأكواد المطبوعة
                </span>
                <span
                  className={`text-xs font-black font-mono ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {stats.totalPrintedCodes} كود ({stats.totalBatchesCount} دفعة)
                </span>
              </div>
            </div>
            <ArrowRight
              className={`w-4 h-4 transform group-hover:-translate-x-1 transition-transform ${
                isLight ? 'text-amber-700' : 'text-amber-400'
              }`}
            />
          </div>

          {/* Alert: Students & 2-Device */}
          <div
            onClick={() => onNavigateToTab('registrants')}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
              isLight
                ? 'bg-cyan-50 border-cyan-200/80 hover:bg-cyan-100/70 shadow-sm'
                : 'bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/15'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isLight ? 'bg-cyan-200/60 text-cyan-700' : 'bg-cyan-500/20 text-cyan-400'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <span
                  className={`text-[11px] font-bold block ${
                    isLight ? 'text-cyan-800' : 'text-cyan-400'
                  }`}
                >
                  الطلاب وحماية الجهازين
                </span>
                <span
                  className={`text-xs font-black ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {stats.totalStudents} طالب ({stats.studentsWith1Device} متاح جهاز ثانٍ)
                </span>
              </div>
            </div>
            <ArrowRight
              className={`w-4 h-4 transform group-hover:-translate-x-1 transition-transform ${
                isLight ? 'text-cyan-700' : 'text-cyan-400'
              }`}
            />
          </div>

          {/* Alert: Pending Treasury Deposits */}
          <div
            onClick={() => onNavigateToTab('payments')}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
              isLight
                ? 'bg-emerald-50 border-emerald-200/80 hover:bg-emerald-100/70 shadow-sm'
                : 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isLight ? 'bg-emerald-200/60 text-emerald-700' : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <span
                  className={`text-[11px] font-bold block ${
                    isLight ? 'text-emerald-800' : 'text-emerald-400'
                  }`}
                >
                  طلبات شحن الخزينة
                </span>
                <span
                  className={`text-xs font-black ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {stats.pendingDepositsCount > 0 ? (
                    <span className={isLight ? 'text-emerald-700 font-black' : 'text-emerald-400'}>
                      {stats.pendingDepositsCount} طلب معلق ({stats.pendingDepositsSum} ج.م)
                    </span>
                  ) : (
                    'لا توجد طلبات معلقة'
                  )}
                </span>
              </div>
            </div>
            <ArrowRight
              className={`w-4 h-4 transform group-hover:-translate-x-1 transition-transform ${
                isLight ? 'text-emerald-700' : 'text-emerald-400'
              }`}
            />
          </div>

          {/* Alert: Support Tickets */}
          <div
            onClick={() => onNavigateToTab('tickets')}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
              isLight
                ? 'bg-purple-50 border-purple-200/80 hover:bg-purple-100/70 shadow-sm'
                : 'bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/15'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isLight ? 'bg-purple-200/60 text-purple-700' : 'bg-purple-500/20 text-purple-400'
                }`}
              >
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <span
                  className={`text-[11px] font-bold block ${
                    isLight ? 'text-purple-800' : 'text-purple-400'
                  }`}
                >
                  تذاكر الدعم والطلبات
                </span>
                <span
                  className={`text-xs font-black ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {stats.openTicketsCount > 0 ? (
                    <span className="text-rose-500 font-bold">
                      {stats.openTicketsCount} تذكرة مفتوحة {stats.urgentTicketsCount > 0 && `(🔥 ${stats.urgentTicketsCount} عاجلة)`}
                    </span>
                  ) : (
                    <span className={isLight ? 'text-slate-700' : 'text-white'}>
                      جميع التذاكر معالجة ✓
                    </span>
                  )}
                </span>
              </div>
            </div>
            <ArrowRight
              className={`w-4 h-4 transform group-hover:-translate-x-1 transition-transform ${
                isLight ? 'text-purple-700' : 'text-purple-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* 3 High-Density KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Printed Codes 16-Char Master */}
        <div
          className={`p-6 rounded-3xl border shadow-xl transition-all relative overflow-hidden group ${
            isLight
              ? 'bg-white border-slate-200 hover:border-amber-400/60 shadow-slate-200/40'
              : 'bg-slate-900/90 border-amber-500/30 hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold ${
                isLight
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}
            >
              <QrCode className="w-6 h-6" />
            </div>
            <button
              onClick={() => onNavigateToTab('printed_batches')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                isLight
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'
              }`}
            >
              <span>فتح السجل</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              إجمالي كروت الأكواد المطبوعة (16 حرف)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-3xl font-black font-mono ${
                  isLight ? 'text-amber-600' : 'text-amber-400'
                }`}
              >
                {stats.totalPrintedCodes.toLocaleString()}
              </span>
              <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                كود عبر {stats.totalBatchesCount} دفعة
              </span>
            </div>
          </div>

          <div
            className={`mt-4 pt-4 border-t grid grid-cols-2 gap-3 text-xs ${
              isLight ? 'border-slate-100' : 'border-slate-800/80'
            }`}
          >
            <div>
              <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                عمولة المنصة (15%)
              </span>
              <span
                className={`font-mono font-black ${
                  isLight ? 'text-amber-700' : 'text-amber-300'
                }`}
              >
                {stats.totalPlatform15Fee.toLocaleString()} ج.م
              </span>
            </div>
            <div>
              <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                المحصل / المتبقي
              </span>
              <span
                className={`font-mono font-bold ${
                  isLight ? 'text-emerald-700' : 'text-emerald-400'
                }`}
              >
                {stats.totalSettledFee.toLocaleString()} /{' '}
                <span className="text-rose-500">{stats.totalRemainingFee.toLocaleString()}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Platforms & Instructors */}
        <div
          className={`p-6 rounded-3xl border shadow-xl transition-all relative overflow-hidden group ${
            isLight
              ? 'bg-white border-slate-200 hover:border-cyan-400/60 shadow-slate-200/40'
              : 'bg-slate-900/90 border-cyan-500/30 hover:border-cyan-500/50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold ${
                isLight
                  ? 'bg-cyan-50 border-cyan-200 text-cyan-600'
                  : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
              }`}
            >
              <Layers className="w-6 h-6" />
            </div>
            <button
              onClick={() => onNavigateToTab('platforms')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                isLight
                  ? 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200'
                  : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400'
              }`}
            >
              <span>دليل المنصات</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              المنصات التعليمية المستضافة
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-3xl font-black font-mono ${
                  isLight ? 'text-cyan-600' : 'text-cyan-400'
                }`}
              >
                {stats.totalPlatforms}
              </span>
              <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                ({stats.activePlatforms} نشطة • {stats.suspendedPlatforms} مجمدة)
              </span>
            </div>
          </div>

          <div
            className={`mt-4 pt-4 border-t grid grid-cols-2 gap-3 text-xs ${
              isLight ? 'border-slate-100' : 'border-slate-800/80'
            }`}
          >
            <div>
              <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                إجمالي الكورسات المرفوعة
              </span>
              <span
                className={`font-mono font-black ${isLight ? 'text-slate-900' : 'text-white'}`}
              >
                {courses.length} كورس
              </span>
            </div>
            <div>
              <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                طلبات المنصات الجديدة
              </span>
              <span
                className={`font-mono font-bold ${isLight ? 'text-sky-600' : 'text-sky-400'}`}
              >
                {stats.pendingOrdersCount} طلب
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Students & 2-Device Security System */}
        <div
          className={`p-6 rounded-3xl border shadow-xl transition-all relative overflow-hidden group ${
            isLight
              ? 'bg-white border-slate-200 hover:border-emerald-400/60 shadow-slate-200/40'
              : 'bg-slate-900/90 border-emerald-500/30 hover:border-emerald-500/50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold ${
                isLight
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
            <button
              onClick={() => onNavigateToTab('registrants')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                isLight
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
              }`}
            >
              <span>فحص الأجهزة</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              الطلاب المسجلين وحماية الجهازين
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-3xl font-black font-mono ${
                  isLight ? 'text-emerald-600' : 'text-emerald-400'
                }`}
              >
                {stats.totalStudents}
              </span>
              <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                طالب مسجل
              </span>
            </div>
          </div>

          <div
            className={`mt-4 pt-4 border-t grid grid-cols-2 gap-3 text-xs ${
              isLight ? 'border-slate-100' : 'border-slate-800/80'
            }`}
          >
            <div>
              <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                جهاز أساسي (خانة 2 شاغرة)
              </span>
              <span
                className={`font-mono font-black ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}
              >
                {stats.studentsWith1Device} طالب
              </span>
            </div>
            <div>
              <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                جهازين كاملين (مكتمل)
              </span>
              <span
                className={`font-mono font-bold ${
                  isLight ? 'text-emerald-700' : 'text-emerald-400'
                }`}
              >
                {stats.studentsWith2Devices} طالب
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: COURSE-BY-COURSE PRINTED CODES MASTER REGISTRY */}
      <div
        className={`p-6 sm:p-8 rounded-[32px] border shadow-2xl space-y-6 ${
          isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className={`p-2 rounded-xl ${
                  isLight ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/10 text-amber-400'
                }`}
              >
                <QrCode className="w-5 h-5" />
              </span>
              <h3 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                خريطة وسجل كروت الأكواد المطبوعة الموزعة لكل كورس بالتفصيل
              </h3>
            </div>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              جدول تحليلي سريع يعرض كل كورس تم طباعة أكواد له، عدد الأكواد الصادرة، كود التفعيل المستهلك والمتاح، والعمولة المستحقة.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="بحث باسم الكورس أو المعلم..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className={`w-full px-4 py-2.5 pr-10 rounded-xl text-xs focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                    : 'bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500'
                }`}
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>

            <button
              onClick={() => onNavigateToTab('printed_batches')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-amber-700 border border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-400'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>إدارة وتوريد الدفعات</span>
            </button>
          </div>
        </div>

        {courseCodeLedger.length === 0 ? (
          <div
            className={`py-12 text-center space-y-3 rounded-2xl border ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-500'
                : 'bg-slate-950/50 border-slate-800/80 text-slate-500'
            }`}
          >
            <QrCode className={`w-12 h-12 mx-auto stroke-[1.5] ${isLight ? 'text-slate-400' : 'text-slate-700'}`} />
            <p className={`text-sm font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
              لا توجد أي سجلات أكواد مطبوعة مطابقة للبحث.
            </p>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-600'}`}>
              عند قيام أي معلم بطباعة أكواد (16 حرف) لكورساته ستظهر تفاصيلها وحساباتها هنا فوراً.
            </p>
          </div>
        ) : (
          <div
            className={`overflow-x-auto rounded-2xl border ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            <table className="w-full text-right text-xs sm:text-sm">
              <thead>
                <tr
                  className={`font-black border-b ${
                    isLight
                      ? 'bg-slate-100/80 text-slate-700 border-slate-200'
                      : 'bg-slate-950 text-slate-300 border-slate-800'
                  }`}
                >
                  <th className="p-4">الكورس والمعلم</th>
                  <th className="p-4 text-center">المنصة</th>
                  <th className="p-4 text-center">سعر الكود</th>
                  <th className="p-4 text-center">الأكواد الصادرة</th>
                  <th className="p-4 text-center">المفعل (المستخدم)</th>
                  <th className="p-4 text-center">المتاح للبيع</th>
                  <th className="p-4 text-center">إجمالي القيمة</th>
                  <th className="p-4 text-center">نسبة المنصة (15%)</th>
                  <th className="p-4 text-center">حالة السداد</th>
                  <th className="p-4 text-center">الوصول السريع</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isLight
                    ? 'divide-slate-200 text-slate-800'
                    : 'divide-slate-800/60 text-slate-200'
                }`}
              >
                {courseCodeLedger.map((item) => (
                  <tr
                    key={item.courseId || item.courseTitle}
                    className={`transition-colors ${
                      isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-850/50'
                    }`}
                  >
                    <td className="p-4 font-bold">
                      <div className={`text-sm line-clamp-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {item.courseTitle}
                      </div>
                      <div
                        className={`text-[11px] font-normal mt-0.5 ${
                          isLight ? 'text-cyan-700' : 'text-cyan-400'
                        }`}
                      >
                        المعلم: {item.teacherName}
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          isLight
                            ? 'bg-slate-100 border-slate-200 text-slate-700'
                            : 'bg-slate-950 border border-slate-800 text-slate-300'
                        }`}
                      >
                        {item.platformName}
                      </span>
                    </td>

                    <td className={`p-4 text-center font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {item.coursePrice} ج.م
                    </td>

                    <td className="p-4 text-center font-mono font-black">
                      <span
                        className={`px-3 py-1 rounded-xl border ${
                          isLight
                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}
                      >
                        {item.totalCodesCount} كود
                      </span>
                    </td>

                    <td className="p-4 text-center font-mono font-bold text-rose-500">
                      {item.redeemedCount} كود
                    </td>

                    <td className="p-4 text-center font-mono font-bold text-emerald-600">
                      {item.activeCount} كود
                    </td>

                    <td
                      className={`p-4 text-center font-mono font-bold ${
                        isLight ? 'text-sky-700' : 'text-sky-400'
                      }`}
                    >
                      {item.totalValue.toLocaleString()} ج.م
                    </td>

                    <td
                      className={`p-4 text-center font-mono font-black ${
                        isLight ? 'text-amber-700 bg-amber-50/60' : 'text-amber-400 bg-amber-500/5'
                      }`}
                    >
                      {item.platformFee15.toLocaleString()} ج.م
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-black inline-block border ${
                          item.remainingDue === 0
                            ? isLight
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : item.settledAmount > 0
                            ? isLight
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : isLight
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {item.remainingDue === 0
                          ? 'مسدد بالكامل ✓'
                          : `متبقي: ${item.remainingDue.toLocaleString()} ج.م`}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      {item.batches.length > 0 ? (
                        <button
                          onClick={() => onInspectBatch(item.batches[0])}
                          className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 mx-auto cursor-pointer shadow-sm hover:scale-105 ${
                            isLight
                              ? 'bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-800'
                              : 'bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-800/60 text-cyan-300'
                          }`}
                          title="فحص أكواد هذا الكورس فورا"
                        >
                          <Zap className="w-3.5 h-3.5 text-cyan-500" />
                          <span>⚡ فحص الأكواد</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: PLATFORMS FAST DIGEST */}
      <div
        className={`p-6 sm:p-8 rounded-[32px] border shadow-2xl space-y-6 ${
          isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`p-2 rounded-xl ${
                isLight ? 'bg-cyan-100 text-cyan-700' : 'bg-cyan-500/10 text-cyan-400'
              }`}
            >
              <Layers className="w-5 h-5" />
            </span>
            <h3 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              ملخص المنصات والمعلمين والوصول السريع
            </h3>
          </div>

          <button
            onClick={() => onNavigateToTab('platforms')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-cyan-700 border border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-cyan-400'
            }`}
          >
            <span>عرض كل المنصات ({platforms.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((plat) => {
            const platCourses = (courses || []).filter((c) => c.platformId === plat.id);
            const platBatches = (printedCodesBatches || []).filter(
              (b) => b.platformId === plat.id || b.teacherId === plat.teacherId
            );
            const totalPlatCodes = platBatches.reduce((s, b) => s + (b.quantity || b.codes?.length || 0), 0);
            const isSuspended = plat.status === 'suspended';

            return (
              <div
                key={plat.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                  isLight
                    ? 'bg-slate-50/80 border-slate-200 hover:border-cyan-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-xs font-black px-2.5 py-0.5 rounded-lg"
                      style={{ backgroundColor: `${plat.themeColor}20`, color: plat.themeColor }}
                    >
                      {plat.subject}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isSuspended
                          ? isLight
                            ? 'bg-rose-100 text-rose-700 border-rose-200'
                            : 'bg-rose-950 text-rose-400 border-rose-800'
                          : isLight
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {isSuspended ? 'موقوفة' : 'نشطة ومفعلة ✓'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src={plat.teacherAvatar}
                      alt={plat.teacherName}
                      referrerPolicy="no-referrer"
                      className={`w-11 h-11 rounded-xl object-cover border ${
                        isLight ? 'border-slate-300' : 'border-slate-700'
                      }`}
                    />
                    <div>
                      <h4 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {plat.name}
                      </h4>
                      <p className={`text-xs font-bold ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                        {plat.teacherName}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`grid grid-cols-3 gap-1.5 mt-4 p-2.5 rounded-xl border text-center text-xs ${
                      isLight
                        ? 'bg-white border-slate-200'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div>
                      <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        الكورسات
                      </span>
                      <span className={`font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {platCourses.length}
                      </span>
                    </div>
                    <div>
                      <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        الطلاب
                      </span>
                      <span className={`font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {plat.totalStudentsCount || 0}
                      </span>
                    </div>
                    <div>
                      <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        الأكواد
                      </span>
                      <span className="font-bold text-amber-500 font-mono">
                        {totalPlatCodes}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`grid grid-cols-2 gap-2 pt-3 border-t ${
                    isLight ? 'border-slate-200' : 'border-slate-850'
                  }`}
                >
                  <button
                    onClick={() => {
                      setSelectedPlatformId(plat.id);
                      setCurrentView('platform_detail');
                    }}
                    className={`py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                      isLight
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm'
                        : 'bg-slate-900 hover:bg-slate-800 text-cyan-300'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>معاينة</span>
                  </button>

                  <button
                    onClick={() => onOpenCredentialsModal(plat)}
                    className={`py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer border ${
                      isLight
                        ? 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200 text-cyan-800'
                        : 'bg-cyan-950/60 hover:bg-cyan-900/60 border-cyan-800/50 text-cyan-300'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>بيانات الدخول</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: STUDENTS & 2-DEVICE SECURITY RADAR */}
      <div
        className={`p-6 sm:p-8 rounded-[32px] border shadow-2xl space-y-6 ${
          isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`p-2 rounded-xl ${
                isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/10 text-emerald-400'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                رادار أجهزة الطلاب والأمان (نظام الحماية بجهازين)
              </h3>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                تأكيد حظر الدخول من أكثر من جهازين لكل طالب مع تثبيت الجهاز الأساسي وإمكانية استبدال الجهاز الثاني فقط.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('registrants')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-emerald-700 border border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-emerald-400'
            }`}
          >
            <span>إدارة كل الطلاب ({stats.totalStudents})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div
          className={`overflow-x-auto rounded-2xl border ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}
        >
          <table className="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr
                className={`font-black border-b ${
                  isLight
                    ? 'bg-slate-100/80 text-slate-700 border-slate-200'
                    : 'bg-slate-950 text-slate-300 border-slate-800'
                }`}
              >
                <th className="p-4">الطالب</th>
                <th className="p-4">المرحلة الدراسية</th>
                <th className="p-4">الجهاز الأساسي (🔒 غير قابل للحذف)</th>
                <th className="p-4">الجهاز الثاني (📱 بديل قابل للحذف)</th>
                <th className="p-4 text-center">الكورسات المسجلة</th>
                <th className="p-4 text-center">الرصيد بالمحفظة</th>
                <th className="p-4 text-center">حالة الأمان</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isLight
                  ? 'divide-slate-200 text-slate-800'
                  : 'divide-slate-800/60 text-slate-200'
              }`}
            >
              {userProfiles
                .filter((u) => u.role === 'student')
                .slice(0, 8)
                .map((student) => {
                  const primaryDev = student.deviceInfo?.primaryDeviceId;
                  const secondaryDev = student.deviceInfo?.secondaryDeviceId;

                  return (
                    <tr
                      key={student.id}
                      className={`transition-colors ${
                        isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-850/50'
                      }`}
                    >
                      <td className="p-4">
                        <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {student.name}
                        </div>
                        <div
                          className={`text-[11px] font-mono ${
                            isLight ? 'text-slate-500' : 'text-slate-400'
                          }`}
                        >
                          {student.email}
                        </div>
                      </td>

                      <td className={`p-4 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        {student.gradeLevel || 'الصف الثالث الثانوي'}
                      </td>

                      <td className="p-4">
                        {primaryDev ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-mono">
                            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="line-clamp-1">
                              {student.deviceInfo?.primaryDeviceName || primaryDev}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">لم يسجل بعد</span>
                        )}
                      </td>

                      <td className="p-4">
                        {secondaryDev ? (
                          <div className="flex items-center gap-1.5 text-xs text-cyan-600 font-mono">
                            <Smartphone className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                            <span className="line-clamp-1">
                              {student.deviceInfo?.secondaryDeviceName || secondaryDev}
                            </span>
                          </div>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                              isLight
                                ? 'bg-slate-100 text-slate-500 border-slate-200'
                                : 'bg-slate-950 text-slate-400 border-slate-800'
                            }`}
                          >
                            ➕ خانة فارغة متاحة
                          </span>
                        )}
                      </td>

                      <td
                        className={`p-4 text-center font-bold font-mono ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {student.enrolledCourseIds?.length || 0} كورس
                      </td>

                      <td className="p-4 text-center font-bold font-mono text-emerald-600">
                        {student.walletBalance || 0} ج.م
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-black border ${
                            isLight
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          محمي 100% ✓
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Printer,
  Plus,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Search,
  Copy,
  Download,
  Calendar,
  Layers,
  FileText,
  Clock,
  Eye,
  X,
  Sparkles,
  QrCode,
  CreditCard,
  UserCheck,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Course, PrintedCodesBatch, CourseAccessCode } from '../../types';

interface PrintedCodesManagerProps {
  course: Course;
}

export const PrintedCodesManager: React.FC<PrintedCodesManagerProps> = ({ course }) => {
  const {
    currentUser,
    courses,
    printedCodesBatches,
    createPrintedCodesBatch,
    addToast,
    paymentSettings,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatchForPrint, setSelectedBatchForPrint] = useState<PrintedCodesBatch | null>(null);
  const [selectedBatchForInspection, setSelectedBatchForInspection] = useState<PrintedCodesBatch | null>(null);

  // Available courses for this teacher/platform
  const availableCourses = courses.filter(
    (c) => c.platformId === course.platformId || c.instructor?.id === currentUser?.id || c.id === course.id
  );

  // New Batch Generation Modal
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(course.id);
  const [batchQuantity, setBatchQuantity] = useState<number>(11);
  const [batchNotes, setBatchNotes] = useState<string>('دفعة مطبوعة لسنتر التميز والأوائل');
  
  // Strict Confirmation Verification State
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [userInputVerification, setUserInputVerification] = useState<string>('');
  const [hasAgreedToLiability, setHasAgreedToLiability] = useState<boolean>(false);

  // Target course currently selected in generation modal
  const targetGenerationCourse = courses.find((c) => c.id === selectedCourseId) || course;

  // Filter batches for this teacher / course
  const teacherBatches = printedCodesBatches.filter(
    (b) => b.teacherId === currentUser?.id || b.courseId === course.id
  );

  const filteredBatches = teacherBatches.filter(
    (b) =>
      !searchQuery ||
      b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.notes && b.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Financial Aggregations
  const totalBatchesCount = teacherBatches.length;
  const totalCodesCount = teacherBatches.reduce((sum, b) => sum + b.quantity, 0);
  const totalGrossValue = teacherBatches.reduce((sum, b) => sum + b.totalCourseValue, 0);
  const totalPlatformFees = teacherBatches.reduce((sum, b) => sum + b.totalPlatformFee, 0);
  const totalPaidToAdmin = teacherBatches.reduce((sum, b) => sum + (b.settledAmount || 0), 0);
  const totalRemainingLiability = teacherBatches.reduce((sum, b) => sum + (b.remainingDueAmount || 0), 0);

  // Open Generation Modal & Generate random 4-digit code
  const openGenerateModal = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setVerificationCode(randomCode);
    setUserInputVerification('');
    setHasAgreedToLiability(false);
    setSelectedCourseId(course.id);
    setBatchQuantity(11);
    setBatchNotes(`دفعة مطبوعة لطلاب ${course.title}`);
    setIsGenerateModalOpen(true);
  };

  const handleGenerateBatch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourseId) {
      addToast('error', 'يجب تحديد الكورس المراد استخراج الأكواد له. لا يمكن استخراج أكواد عشوائية دون كورس.');
      return;
    }

    if (!hasAgreedToLiability) {
      addToast('error', `يرجى الإقرار والموافقة على مسؤولية استخراج الأكواد ونسبة المنصة ${currentFeePercentage}%.`);
      return;
    }

    if (userInputVerification.trim() !== verificationCode) {
      addToast('error', `رمز التحقق الأمني غير صحيح! يرجى إدخال الرقم: ${verificationCode}`);
      return;
    }

    if (batchQuantity < 1 || batchQuantity > 500) {
      addToast('error', 'العدد المسموح به للدفعة الواحدة يتراوح بين 1 و 500 كود.');
      return;
    }

    const newBatch = createPrintedCodesBatch(selectedCourseId, batchQuantity, batchNotes);
    if (newBatch) {
      setIsGenerateModalOpen(false);
      // Auto open print modal for convenience
      setSelectedBatchForPrint(newBatch);
    }
  };

  const handleCopyCodesList = (batch: PrintedCodesBatch) => {
    const textToCopy = batch.codes
      .map((c, idx) => `${idx + 1}. [${c.code}] - ${c.courseTitle} - ${c.status === 'redeemed' ? 'تم التفعيل' : 'متاح'}`)
      .join('\n');
    navigator.clipboard.writeText(textToCopy);
    addToast('success', `تم نسخ ${batch.codes.length} كود 16 حرف إلى الحافظة بنجاح! 📋`);
  };

  const handleDownloadCsv = (batch: PrintedCodesBatch) => {
    const headers = 'رقم الكود,حالة الكود,اسم الكورس,اسم المعلم,اسم الطالب المفعل,تاريخ التفعيل\n';
    const rows = batch.codes
      .map(
        (c) =>
          `"${c.code}","${c.status}","${c.courseTitle}","${c.teacherName}","${c.redeemedByStudentName || 'لم يستخدم'}","${c.redeemedAt || '-'}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `كروت_اكواد_${batch.batchNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'تم تنزيل ملف الإكسل/CSV بنجاح!');
  };

  // Preview Calculations for Generation Modal
  const currentFeePercentage = paymentSettings.printedCodesFeePercentage ?? 15;
  const calculatedTotalValue = batchQuantity * (targetGenerationCourse.price || 250);
  const calculatedPlatformFee = calculatedTotalValue * (currentFeePercentage / 100);

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900/60 border border-amber-500/30 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  طباعة أكواد الوصول (16 حرف) وحسابات المنصة 🖨️
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
                  نسبة المنصة 15%
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                توليد كروت مطبوعة مشفرة مكونة من 16 حرفاً لفتح الكورس كشراء حقيقي، مع تتبع دقيق للمستحقات والتسويات المالية.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={openGenerateModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/30"
        >
          <Plus className="w-4 h-4" />
          <span>استخراج دفعة كروت جديدة (16 حرف) ✨</span>
        </button>
      </div>

      {/* Financial Liability KPI Ledger */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Codes */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
            إجمالي الأكواد المستخرجة
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
            {totalCodesCount} كود
          </span>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">
            في {totalBatchesCount} دفعة مطبوعة
          </span>
        </div>

        {/* Total Gross Value */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
            إجمالي القيمة البيعية للكورسات
          </span>
          <span className="text-xl sm:text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
            {totalGrossValue.toLocaleString()} ج.م
          </span>
          <span className="text-[10px] text-slate-400 block">
            سعر الكورس الحالي: {course.price || 250} ج.م
          </span>
        </div>

        {/* Platform 15% Liability */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
            مستحقات المنصة (15%)
          </span>
          <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {totalPlatformFees.toLocaleString()} ج.م
          </span>
          <span className="text-[10px] text-rose-500 font-bold block">
            يتم سدادها لإدارة المنصة
          </span>
        </div>

        {/* Remaining / Settled Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
            المسدد / المتبقي للمنصة
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-emerald-500 font-mono">
              {totalPaidToAdmin.toLocaleString()} مسدد
            </span>
            <span className="text-slate-400">/</span>
            <span className="text-sm font-black text-amber-500 font-mono">
              {totalRemainingLiability.toLocaleString()} متبقي
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            يتم تصفية الحسابات مع الأدمن
          </span>
        </div>
      </div>

      {/* Strict Security Policy Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
          <span className="font-bold text-amber-800 dark:text-amber-300 block">
            قواعد وأمان استخراج الأكواد المطبوعة (16 حرف):
          </span>
          <p className="leading-relaxed">
            1. كل كود مستخرج يتكون من 16 حرفاً مشفراً ويمنح الطالب وصولاً كاملاً للكورس كشراء نقدي حقيقي.
            <br />
            2. يتحمل المعلم نسبة المنصة المقررة (15%) عن كل كود يتم استخراجه بمجرد الطباعة.
            <br />
            3. تم وضع نظام تأكيد أمني ذكي بأرقام عشوائية لضمان عدم استخراج أكواد عن طريق الخطأ.
          </p>
        </div>
      </div>

      {/* Batches Table & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم الدفعة، اسم الكورس، الملاحظات..."
              className="w-full pr-10 pl-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>النتائج:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
              {filteredBatches.length} دفعة
            </span>
          </div>
        </div>

        {/* Batches List */}
        {filteredBatches.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
              <Printer className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">لم تقم بطباعة دفعات أكواد بعد</h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              يمكنك استخراج وتوليد كروت أكواد 16 حرف جاهزة للطباعة والتوزيع في السناتر أو المدارس.
            </p>
            <button
              onClick={openGenerateModal}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
            >
              استخراج أول دفعة الآن
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBatches.map((batch) => {
              const redeemedCount = batch.codes.filter((c) => c.status === 'redeemed').length;
              const activeCount = batch.codes.filter((c) => c.status === 'active').length;
              const redemptionRate = Math.round((redeemedCount / batch.quantity) * 100);

              return (
                <div
                  key={batch.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono text-xs font-black">
                          {batch.batchNumber}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            batch.status === 'settled'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : batch.status === 'partially_paid'
                              ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {batch.status === 'settled'
                            ? 'تمت التسوية مع الأدمن ✓'
                            : batch.status === 'partially_paid'
                            ? 'تسوية جزئية ⏳'
                            : `مستحق السداد (${currentFeePercentage}%) ⚠️`}
                        </span>

                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(batch.createdAt).toLocaleDateString('ar-EG')}</span>
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {batch.courseTitle}
                      </h4>

                      {batch.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          ملاحظات الدفعة: {batch.notes}
                        </p>
                      )}

                      {/* Financial & Redemption Breakdown */}
                      <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                        <span className="text-slate-600 dark:text-slate-400">
                          العدد: <strong className="text-slate-900 dark:text-white font-mono">{batch.quantity} كود</strong>
                        </span>
                        <span>•</span>
                        <span className="text-slate-600 dark:text-slate-400">
                          القيمة الإجمالية: <strong className="text-cyan-600 dark:text-cyan-400 font-mono">{batch.totalCourseValue.toLocaleString()} ج.م</strong>
                        </span>
                        <span>•</span>
                        <span className="text-slate-600 dark:text-slate-400">
                          عمولة المنصة {currentFeePercentage}%: <strong className="text-rose-600 dark:text-rose-400 font-mono">{batch.totalPlatformFee.toLocaleString()} ج.م</strong>
                        </span>
                      </div>
                    </div>

                    {/* Progress & Actions */}
                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                      {/* Redemption Badge */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center min-w-[120px]">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                          نسبة التفعيل
                        </span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          {redeemedCount} / {batch.quantity} ({redemptionRate}%)
                        </span>
                        <span className="text-[10px] text-amber-500 font-semibold block">
                          متبقي: {activeCount} كود
                        </span>
                      </div>

                      {/* Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedBatchForPrint(batch)}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                          <span>معاينة وطباعة الكروت 🖨️</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedBatchForInspection(batch)}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="فحص حالة كل كود والطلاب المفعلين"
                        >
                          <Eye className="w-4 h-4" />
                          <span>فحص الأكواد</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyCodesList(batch)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                          title="نسخ جميع الأكواد الـ 16 حرف"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadCsv(batch)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-teal-600 dark:text-teal-400 transition-colors cursor-pointer"
                          title="تنزيل ملف إكسل CSV"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* STRICT VERIFICATION MODAL: Generate New 16-Char Batch */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg my-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-amber-500">
                <Printer className="w-6 h-6" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  استخراج دفعة كروت أكواد 16 حرف 🖨️
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGenerateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateBatch} className="space-y-4">
              {/* Mandatory Course Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تحديد الكورس الإلزامي لاستخراج الأكواد: <span className="text-rose-500">*</span>
                </label>
                {availableCourses.length > 1 ? (
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    required
                  >
                    {availableCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.price || 250} ج.م)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white flex items-center justify-between">
                    <span>{targetGenerationCourse.title}</span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                      {targetGenerationCourse.price || 250} ج.م / كود
                    </span>
                  </div>
                )}

                {/* Clear Course vs Unit Scope Clarification Banner */}
                <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2">
                  <Layers className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>نطاق تفعيل الكود:</strong> الكود المطبوع يخصص لـ <strong>الكورس بالكامل</strong> (وليس لوحدة أو محاضرة منفصلة داخل الكورس). عند إدخال الطالب للكود يفتح له كامل محتوى الكورس المختار.
                  </div>
                </div>
              </div>

              {/* Free Code Quantity Input & Visual Badges */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    عدد الأكواد المطلوبة: <span className="text-rose-500">*</span>
                  </label>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-xs font-mono">
                    العدد المحدد: {batchQuantity} كود
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 mb-2">
                  {[5, 10, 11, 20, 50, 100, 200].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setBatchQuantity(qty)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        batchQuantity === qty
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-500/50'
                      }`}
                    >
                      {qty}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    value={batchQuantity}
                    onChange={(e) => setBatchQuantity(Math.max(1, Number(e.target.value) || 1))}
                    min={1}
                    max={500}
                    placeholder="اكتب أي عدد تريده بحرية (مثال: 10 أو 11 كود)..."
                    className="w-full px-3.5 py-2.5 text-sm font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    كود مطبوع
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  يمكنك تحديد وكتابة أي رقم حر تحتاجه (مثلاً 10، 11، 25، إلخ).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ملاحظات أو اسم السنتر الموزع له:
                </label>
                <input
                  type="text"
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  placeholder="مثال: دفعة سنتر الأوائل - أكتوبر 2026"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Realtime Financial Calculation Breakdown */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                  <span>إجمالي سعر الكورس للكروت ({batchQuantity} × {targetGenerationCourse.price || 250} ج.م):</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    {calculatedTotalValue.toLocaleString()} ج.م
                  </span>
                </div>
                <div className="flex justify-between items-center text-amber-900 dark:text-amber-200 font-bold border-t border-amber-500/20 pt-2">
                  <span>عمولة المنصة المستحقة ({currentFeePercentage}%):</span>
                  <span className="font-black font-mono text-rose-600 dark:text-rose-400 text-sm">
                    {calculatedPlatformFee.toLocaleString()} ج.م
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 border-t border-amber-500/20 pt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>يتم إرسال بيانات الدفعة وقائمة الأكواد لإدارة المنصة تلقائياً فور الاستخراج.</span>
                </div>
              </div>

              {/* STRICT CONFIRMATION / LIABILITY CHECKBOX */}
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasAgreedToLiability}
                    onChange={(e) => setHasAgreedToLiability(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded text-rose-600 focus:ring-rose-500 cursor-pointer shrink-0"
                  />
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-200 leading-relaxed">
                    أقر وأتعهد أنا المعلم بصفتي بالمسؤولية الكاملة عن هذه الدفعة المطبوعة ({batchQuantity} كود لكورس {targetGenerationCourse.title})، وأوافق على استحقاق نسبة المنصة ({currentFeePercentage}% = {calculatedPlatformFee.toLocaleString()} ج.م) ويتم توريدها لإدارة المنصة.
                  </span>
                </label>

                {/* Random Verification Code Challenge */}
                <div className="pt-2 border-t border-rose-500/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      تأكيد أمني إجباري: يرجى كتابة هذا الرقم ({verificationCode}) في المربع:
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-rose-600 text-white font-mono font-black text-sm tracking-widest">
                      {verificationCode}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={userInputVerification}
                    onChange={(e) => setUserInputVerification(e.target.value)}
                    placeholder={`اكتب الرقم ${verificationCode} هنا للتأكيد`}
                    className="w-full px-3 py-2 text-center text-sm font-mono font-bold rounded-xl bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-700 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!hasAgreedToLiability || userInputVerification.trim() !== verificationCode}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg ${
                    hasAgreedToLiability && userInputVerification.trim() === verificationCode
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-amber-500/30 hover:opacity-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  استخراج وطباعة الدفعة الآن ({batchQuantity} كود)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE CARDS SHEET MODAL */}
      {selectedBatchForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-4xl my-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>معاينة كروت الدفعة للطباعة:</span>
                  <span className="text-amber-500 font-mono">[{selectedBatchForPrint.batchNumber}]</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  كروت مصممة بدقة عالية للطباعة الورقية وتوزيعها على الطلاب لفتح الكورس مباشرة.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة فورية (Print)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedBatchForPrint(null)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto p-2 border border-slate-100 dark:border-slate-800 rounded-2xl">
              {selectedBatchForPrint.codes.map((codeItem, idx) => (
                <div
                  key={codeItem.id}
                  className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border-2 border-dashed border-amber-500/40 text-white space-y-3 relative overflow-hidden shadow-md"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 font-bold block">
                        كارت دخول المنصة المعتمد • SEA
                      </span>
                      <h5 className="text-sm font-black text-white mt-0.5 line-clamp-1">
                        {codeItem.courseTitle}
                      </h5>
                      <span className="text-[11px] text-slate-300">
                        المعلم: {codeItem.teacherName}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                      <QrCode className="w-6 h-6" />
                    </div>
                  </div>

                  {/* 16-Character Code Box */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/50 text-center space-y-0.5">
                    <span className="text-[9px] text-amber-400 font-bold block uppercase tracking-wider">
                      كود التفعيل السري (16 حرف)
                    </span>
                    <span className="text-base sm:text-lg font-mono font-black text-amber-300 tracking-widest select-all">
                      {codeItem.code}
                    </span>
                  </div>

                  {/* Student Name Blank & Instructions */}
                  <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1 border-t border-slate-800">
                    <div>اسم الطالب: .................................</div>
                    <span className="text-amber-400 font-bold">صالح حتى: 2026/12/31</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INSPECTION MODAL: Code-by-Code Redemption Details */}
      {selectedBatchForInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-3xl my-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>فحص أكواد الدفعة:</span>
                  <span className="text-amber-500 font-mono">[{selectedBatchForInspection.batchNumber}]</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  قائمة الأكواد وحالة تفعيل كل كود واسم الطالب وتاريخ التفعيل.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBatchForInspection(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {selectedBatchForInspection.codes.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs ${
                    item.status === 'redeemed'
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400 font-bold w-6">#{idx + 1}</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white text-sm tracking-wider select-all">
                      {item.code}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.status === 'redeemed' ? (
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>فعلّه: {item.redeemedByStudentName || 'طالب مجهول'}</span>
                        <span className="text-slate-400 font-normal">
                          ({item.redeemedAt ? new Date(item.redeemedAt).toLocaleDateString('ar-EG') : ''})
                        </span>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold">
                        متاح للتفعيل ⏳
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(item.code);
                        addToast('success', `تم نسخ الكود ${item.code} بنجاح!`);
                      }}
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      title="نسخ الكود"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBatchForInspection(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

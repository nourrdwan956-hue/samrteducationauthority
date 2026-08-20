import React, { useState } from 'react';
import {
  Ticket,
  Plus,
  Copy,
  Check,
  Trash2,
  Calendar,
  Printer,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  QrCode,
  Sparkles,
  Zap,
  Layers,
  ShieldCheck,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { CouponCode, Course } from '../../types';

interface CourseCouponsTabProps {
  course: Course;
  coupons: CouponCode[];
  onCreateCoupon: (coupon: Omit<CouponCode, 'id' | 'currentUses'>) => void;
  onToggleStatus: (couponId: string) => void;
  onDeleteCoupon: (couponId: string) => void;
  onToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, msg?: string) => void;
  onLogAdminActivity: (action: string, details: string, courseName: string) => void;
}

export const CourseCouponsTab: React.FC<CourseCouponsTabProps> = ({
  course,
  coupons,
  onCreateCoupon,
  onToggleStatus,
  onDeleteCoupon,
  onToast,
  onLogAdminActivity,
}) => {
  const generateSecureCode = (prefix: string = '') => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking chars
    const randomArray = new Uint8Array(8);
    window.crypto.getRandomValues(randomArray);
    let generated = '';
    for (let i = 0; i < randomArray.length; i++) {
      generated += chars[randomArray[i] % chars.length];
    }
    return prefix ? `${prefix}${generated.substring(0, 4)}-${generated.substring(4, 8)}` : `${generated.substring(0, 4)}-${generated.substring(4, 8)}`;
  };

  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'center_100' | 'discount' | 'active' | 'used'>('all');

  // Single Form states
  const [code, setCode] = useState(generateSecureCode('CTR-'));
  const [discountPercentage, setDiscountPercentage] = useState(100);
  const [maxUses, setMaxUses] = useState(1);
  const [expiresAt, setExpiresAt] = useState('2026-08-31');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');

  // Bulk Generation Form states
  const [bulkPrefix, setBulkPrefix] = useState(`CENTER-${course.title.substring(0, 3).toUpperCase()}-`);
  const [bulkCount, setBulkCount] = useState(20);
  const [bulkDiscount, setBulkDiscount] = useState(100);
  const [bulkMaxUsesPerCode, setBulkMaxUsesPerCode] = useState(1);
  const [bulkExpiresAt, setBulkExpiresAt] = useState('2026-08-31');

  // Filter coupons related to this course or platform
  const courseCoupons = (coupons || []).filter(
    (c) => !c.courseId || c.courseId === course.id
  );

  const filteredCoupons = courseCoupons.filter((c) => {
    const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType === 'center_100') return c.discountPercentage === 100;
    if (filterType === 'discount') return c.discountPercentage < 100;
    if (filterType === 'active') return c.isActive && c.currentUses < c.maxUses;
    if (filterType === 'used') return c.currentUses >= c.maxUses;
    return true;
  });

  // KPI Calculations
  const totalCodes = courseCoupons.length;
  const totalCenterCards = courseCoupons.filter((c) => c.discountPercentage === 100).length;
  const activeCodes = courseCoupons.filter((c) => c.isActive && c.currentUses < c.maxUses).length;
  const totalRedeemed = courseCoupons.reduce((acc, c) => acc + c.currentUses, 0);

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    onToast('success', 'تم نسخ كود الكوبون!', couponCode);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    onCreateCoupon({
      code: code.trim().toUpperCase(),
      discountPercentage: Number(discountPercentage) || 100,
      maxUses: Number(maxUses) || 1,
      isActive: true,
      expiresAt,
      courseId: course.id,
    });

    onLogAdminActivity(
      'طباعة كود مفرد',
      `تم توليد كود خصم بنسبة ${discountPercentage}% (الكود: ${code}) صالح لعدد ${maxUses} استخدام(ات) حتى تاريخ ${expiresAt}.`,
      course.title
    );

    setIsSingleModalOpen(false);
    setCode(generateSecureCode('CTR-'));
    onToast('success', 'تم إنشاء كود الكارت بنجاح! 🎟️');
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const countToGenerate = Math.min(Math.max(Number(bulkCount) || 1, 1), 500);
    const prefix = bulkPrefix.trim().toUpperCase();

    for (let i = 0; i < countToGenerate; i++) {
      const generatedCode = generateSecureCode(prefix);

      onCreateCoupon({
        code: generatedCode,
        discountPercentage: Number(bulkDiscount) || 100,
        maxUses: Number(bulkMaxUsesPerCode) || 1,
        isActive: true,
        expiresAt: bulkExpiresAt,
        courseId: course.id,
      });
    }

    onLogAdminActivity(
      'طباعة أكواد بالجملة (Bulk)',
      `تم توليد دفعة كروت شحن بعدد (${countToGenerate}) كود، بخصم ${bulkDiscount}% وصلاحية لعدد ${bulkMaxUsesPerCode} استخدام(ات) لكل كود حتى تاريخ ${bulkExpiresAt}.`,
      course.title
    );

    setIsBulkModalOpen(false);
    onToast('success', `تم توليد دفعة كروت شحن بعدد (${countToGenerate}) كود بنجاح! ⚡`, 'يمكنك الآن طباعة الشيت أو تصديره لكادر السنتر.');
  };

  // Export CSV
  const handleExportCSV = () => {
    if (courseCoupons.length === 0) return;
    const headers = 'كود الكارت,نسبة الخصم,الاستخدام الحياتي,الحد الأقصى,الحالة,تاريخ الانتهاء\n';
    const rows = courseCoupons
      .map(
        (c) =>
          `"${c.code}",${c.discountPercentage}%,${c.currentUses},${c.maxUses},"${
            c.isActive ? 'نشط' : 'معطل'
          }","${c.expiresAt}"`
      )
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `كروت_شحن_سنتر_${course.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onToast('success', 'تم تحميل شيت الكروت بتنسيق CSV بنجاح! 📊');
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Banner & Action Buttons */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-amber-500" />

        <div>
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              منظومة كروت الشحن وأكواد السنتر والخصومات ({totalCodes})
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              طباعة كروت سنتر 100%
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed max-w-2xl">
            توليد كروت شحن فردية أو <strong>دفعة جملة (Bulk Batch)</strong> مخصصة لطلاب السناتر والمجموعات الخاصة. يمكن تصدير الأكواد كملف إكسل أو طباعة شيت كروت ورقي لشحن الحصص فوراً.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>توليد دفعة كروت جملة (Bulk)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSingleModalOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Plus className="w-4 h-4 text-amber-500" />
            <span>كارت مفرد</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            disabled={courseCoupons.length === 0}
            className="px-3.5 py-2.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="معاينة شيت كروت السنتر ورسميا للطباعة"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة كروت</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={courseCoupons.length === 0}
            className="p-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold transition-all cursor-pointer disabled:opacity-50"
            title="تصدير كملف إكسل CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-bold block">إجمالي الكروت والأكواد</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">{totalCodes} كارت</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Ticket className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-bold block">كروت سنتر مجانية (100%)</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{totalCenterCards} كارت</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-bold block">الأكواد الشغالة النشطة</span>
            <span className="text-lg font-black text-cyan-600 dark:text-cyan-400">{activeCodes} نشط</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-bold block">إجمالي عمليات الشحن</span>
            <span className="text-lg font-black text-purple-600 dark:text-purple-400">{totalRedeemed} طالب</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Toolbar & Filter Options */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بكود الكارت..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:border-amber-500 focus:outline-none shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0 shadow-xs">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'center_100', label: 'كروت 100%' },
            { id: 'discount', label: 'أكواد خصم' },
            { id: 'active', label: 'نشط' },
            { id: 'used', label: 'مستخدم بالكامل' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Cards Grid */}
      {filteredCoupons.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <Ticket className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">لا توجد أكواد خصم أو كروت شحن مطابقة للفلتر</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            اضغط زر "توليد دفعة كروت جملة" لإنشاء كروت شحن مطبوعة لطلاب السنتر دفعة واحدة.
          </p>
          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs cursor-pointer inline-flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>توليد دفعة كروت جديدة</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((coupon) => {
            const isFullyUsed = coupon.currentUses >= coupon.maxUses;

            return (
              <div
                key={coupon.id}
                className={`p-5 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between gap-4 shadow-sm ${
                  !coupon.isActive || isFullyUsed
                    ? 'bg-slate-100 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/50 opacity-70'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-500/50'
                }`}
              >
                {/* Coupon Header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        coupon.isActive && !isFullyUsed
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                          : isFullyUsed
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {isFullyUsed ? 'نفذت الاستخدامات' : coupon.isActive ? 'مفعّل وجاهز للشحن' : 'معطّل'}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-xs font-black">
                      {coupon.discountPercentage === 100 ? '🎟️ كارت شحن 100%' : `خصم ${coupon.discountPercentage}%`}
                    </span>
                  </div>

                  {/* Code Display Box */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mt-3">
                    <span className="font-mono text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 tracking-wider">
                      {coupon.code}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopy(coupon.code)}
                      className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      title="نسخ الكود"
                    >
                      {copiedCode === coupon.code ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Usage & Expiration */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <span>
                    الاستخدام: <strong className="text-slate-900 dark:text-white font-black">{coupon.currentUses}</strong> / {coupon.maxUses}
                  </span>

                  <span className="text-[11px] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {coupon.expiresAt}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(coupon.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    {coupon.isActive ? 'تعطيل' : 'تفعيل'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteCoupon(coupon.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="حذف الكود"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Single Coupon Generator */}
      {isSingleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-right relative">
            <button
              onClick={() => setIsSingleModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">إنشاء كارت شحن / كود مفرد</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">توليد كود واحد مخصص لطلاب السنتر</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 mb-4">
              <p className="text-xs font-bold text-rose-700 dark:text-rose-400 leading-relaxed">
                <strong className="text-sm block mb-1">⚠️ تحذير: خصم مالي 20%</strong>
                سيتم تصدير هذا الكود للوحة الإدارة ومحاسبتك عليه بخصم 20% من ثمن الكورس فور إنشائه، حتى وإن لم يُستخدم. يُرجى عدم توليد أكواد تزيد عن حاجتك الفعلية للطلاب.
              </p>
            </div>

            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  كود الخصم / الكارت *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-400 font-mono text-sm font-black focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نسبة الخصم (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">100% = مجاني بالكامل</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">أقصى عدد استخدامات</label>
                  <input
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">1 = استخدام لطالب واحد</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">تاريخ انتهاء الصلاحية</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSingleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  حفظ وتفعيل الكود
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Bulk Batch Generator (دفعة جملة للسنتر) */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-amber-500/30 p-6 shadow-2xl space-y-4 text-right relative">
            <button
              onClick={() => setIsBulkModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">توليد دفعة كروت شحن وسنتر بالجملة (Bulk)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">إنشاء عشرات الكروت الجاهزة للطباعة والتوزيع في كسر من الثانية</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 mb-4">
              <p className="text-xs font-bold text-rose-700 dark:text-rose-400 leading-relaxed">
                <strong className="text-sm block mb-1">⚠️ تحذير: خصم مالي 20% عن كل كود</strong>
                سيتم تصدير جميع هذه الأكواد للوحة الإدارة. سيتم محاسبتك مالياً بخصم 20% من ثمن الكورس <span className="underline">عن كل كود يتم إنشاؤه</span> بغض النظر عن استخدامه. الرجاء عدم توليد أعداد فائضة.
              </p>
            </div>

            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  بادئة الكود (Prefix) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: MATH-2026-"
                  value={bulkPrefix}
                  onChange={(e) => setBulkPrefix(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-400 font-mono text-xs sm:text-sm font-black focus:border-amber-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">سيُضاف رقم عشوائي فريد بعد هذه البادئة لكل كارت (مثل: {bulkPrefix || 'PREFIX-'}948210)</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عدد الكروت المطلوبة</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={bulkCount}
                    onChange={(e) => setBulkCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">الحد الأقصى للدفعة الواحدة 500 كارت</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نسبة الخصم (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={bulkDiscount}
                    onChange={(e) => setBulkDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">100% لكروت السنتر الكاملة</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">استخدامات كل كارت</label>
                  <input
                    type="number"
                    min="1"
                    value={bulkMaxUsesPerCode}
                    onChange={(e) => setBulkMaxUsesPerCode(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">تاريخ انقضاء الصلاحية</label>
                  <input
                    type="date"
                    value={bulkExpiresAt}
                    onChange={(e) => setBulkExpiresAt(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  توليد ({bulkCount}) كارت شحن الآن ⚡
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Print Cards Preview & Printing Layout */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-6 text-right relative my-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Printer className="w-5 h-5 text-indigo-500" />
                  <span>معاينة شيت كروت السنتر الورقي للطباعة ({courseCoupons.length} كارت)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">تنسيق مخصص لطباعة الكروت وقصها وتوزيعها في المراكز التعليمية</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الآن (Print / PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Container Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[550px] overflow-y-auto p-2">
              {courseCoupons.map((coupon, idx) => (
                <div
                  key={coupon.id}
                  className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between space-y-3 relative text-right shadow-xs"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                      🎟️ كارت شحن سنتر
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      SN-{(idx + 1001)}
                    </span>
                  </div>

                  {/* Course info */}
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{course.title}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">خصم كامل {coupon.discountPercentage}% على المحتوى</p>
                  </div>

                  {/* Code Area */}
                  <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-center">
                    <span className="font-mono text-xs sm:text-sm font-black text-amber-700 dark:text-amber-300 tracking-widest block">
                      {coupon.code}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">امسح كود الكارت وأدخله في المنصة</span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                    <span>صالح حتى: {coupon.expiresAt}</span>
                    <QrCode className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  CreditCard, 
  Wallet, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Copy, 
  Check, 
  Phone, 
  Send, 
  ShieldCheck,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Course } from '../types';

interface CourseSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onSuccess?: () => void;
}

export const CourseSubscribeModal: React.FC<CourseSubscribeModalProps> = ({
  isOpen,
  onClose,
  course,
  onSuccess,
}) => {
  const { 
    currentUser, 
    paymentSettings, 
    redeemCourseAccessCode, 
    enrollInCourse, 
    submitDepositRequest,
    setIsAuthModalOpen,
    addToast 
  } = useApp();

  const [activeMethod, setActiveMethod] = useState<'code' | 'transfer' | 'wallet'>('code');
  
  // Code Redemption State
  const [accessCode, setAccessCode] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeError, setCodeError] = useState('');

  // Transfer State
  const [transferType, setTransferType] = useState<'vodafone' | 'instapay' | 'fawry'>('vodafone');
  const [senderPhone, setSenderPhone] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const walletBalance = currentUser?.walletBalance || 0;
  const hasEnoughWalletBalance = walletBalance >= course.price;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast('info', 'تم النسخ بنجاح', text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const clean = accessCode.trim().toUpperCase();
    if (!clean) {
      setCodeError('يرجى إدخال كود الكورس المطبوع');
      return;
    }

    setCodeError('');
    setIsVerifyingCode(true);

    try {
      const res = redeemCourseAccessCode(clean, course.id);
      if (res.success) {
        setAccessCode('');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setCodeError(res.message);
      }
    } catch (err: any) {
      setCodeError(err?.message || 'حدث خطأ أثناء التحقق من الكود.');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleWalletEnroll = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const res = enrollInCourse(course.id);
    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  const handleDirectTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    if (transferType === 'vodafone' && !senderPhone.trim()) {
      addToast('warning', 'يرجى إدخال رقم الهاتف المحول منه');
      return;
    }

    if ((transferType === 'instapay' || transferType === 'fawry') && !transactionRef.trim()) {
      addToast('warning', 'يرجى إدخال كود أو رقم العملية');
      return;
    }

    setIsSubmittingTransfer(true);
    setTimeout(() => {
      submitDepositRequest({
        studentId: currentUser.id,
        studentName: currentUser.fourPartName || currentUser.name,
        studentEmail: currentUser.email,
        studentPhone: currentUser.phone || '',
        amount: course.price,
        paymentMethod: transferType,
        senderNumber: transferType === 'vodafone' ? senderPhone.trim() : undefined,
        transactionId: transferType !== 'vodafone' ? transactionRef.trim() : undefined,
        screenshotUrl: screenshotUrl.trim() || undefined,
      });

      addToast(
        'success',
        'تم إرسال إشعار التحويل بنجاح! ⏳',
        `سيتم تفعيل كورس "${course.title}" فور مراجعة العملية من الإدارة.`
      );

      setSenderPhone('');
      setTransactionRef('');
      setScreenshotUrl('');
      setIsSubmittingTransfer(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md animate-fade-in text-right" dir="rtl">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col max-h-[92vh]">
        
        {/* Header Ribbon */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-slate-100 via-indigo-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 left-5 p-2 rounded-xl bg-slate-200/60 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
              {course.subject}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-white/10">
              {course.gradeLevel}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{course.title}</h2>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{course.price}</span>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">جنيه مصري</span>
              {course.originalPrice && (
                <span className="text-xs line-through text-slate-400 dark:text-slate-500 mr-2">{course.originalPrice} ج.م</span>
              )}
            </div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>اشتراك مخصص ومعتمد</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/80 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveMethod('code')}
            className={`flex-1 py-3 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMethod === 'code'
                ? 'bg-cyan-600 dark:bg-gradient-to-l dark:from-cyan-500 dark:to-indigo-600 text-white shadow-lg shadow-cyan-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>كود الكورس المطبوع (16 رمز)</span>
          </button>

          <button
            onClick={() => setActiveMethod('transfer')}
            className={`flex-1 py-3 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMethod === 'transfer'
                ? 'bg-emerald-600 dark:bg-gradient-to-l dark:from-emerald-500 dark:to-teal-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>تحويل إلكتروني (فودافون / إنستاباي)</span>
          </button>

          {hasEnoughWalletBalance && (
            <button
              onClick={() => setActiveMethod('wallet')}
              className={`py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeMethod === 'wallet'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>المحفظة ({walletBalance} ج.م)</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* METHOD 1: 16-CHAR PRINTED ACCESS CODE */}
          {activeMethod === 'code' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  طريقة التفعيل بكارت السنتر أو المعلم:
                </p>
                <p className="text-slate-300">
                  قم بكشط الكارت وأدخل كود الكورس المكون من 16 حرفاً ورقم. الكود مخصص ومحمي حصرياً لكورس <strong>"{course.title}"</strong> وسيقوم بفتح كافة الدروس والامتحانات فوراً.
                </p>
              </div>

              <form onSubmit={handleRedeemCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    كود الكورس (16 حرف ورقم)
                  </label>
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => {
                      setAccessCode(e.target.value.toUpperCase());
                      setCodeError('');
                    }}
                    placeholder="E.g. A9B2-C8D3-E4F5-G6H7"
                    className="w-full px-4 py-4 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono text-center text-lg sm:text-xl font-black tracking-widest uppercase focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                  {codeError && (
                    <div className="mt-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{codeError}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingCode || !accessCode.trim()}
                  className="w-full py-4 rounded-2xl bg-gradient-to-l from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-sm transition-all shadow-xl shadow-cyan-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-5 h-5" />
                  <span>{isVerifyingCode ? 'جارِ التحقق وتفعيل الكورس...' : 'تفعيل الكورس والبدء فوراً'}</span>
                </button>
              </form>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-bold text-slate-300">🛡️ شروط الأمان والصلاحيات:</p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                  <li>الكود صالح للاستخدام مرة واحدة فقط للطالب المسجل.</li>
                  <li>لا يمكن استخدام الكود في أي كورس آخر غير هذا المقرر.</li>
                  <li>يتم ربط الكورس بحسابك وبأجهزتك المصرح بها (جهازين كحد أقصى).</li>
                </ul>
              </div>
            </div>
          )}

          {/* METHOD 2: DIRECT MONEY TRANSFER */}
          {activeMethod === 'transfer' && (
            <div className="space-y-6">
              
              {/* Payment Methods Cards */}
              <div className="grid grid-cols-3 gap-2">
                {paymentSettings.vodafoneEnabled && (
                  <button
                    type="button"
                    onClick={() => setTransferType('vodafone')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      transferType === 'vodafone'
                        ? 'bg-rose-500/10 border-rose-500 text-rose-300 ring-2 ring-rose-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="block font-black text-xs">فودافون كاش</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Vodafone Cash</span>
                  </button>
                )}

                {paymentSettings.instapayEnabled && (
                  <button
                    type="button"
                    onClick={() => setTransferType('instapay')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      transferType === 'instapay'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="block font-black text-xs">إنستاباي</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">InstaPay IPA</span>
                  </button>
                )}

                {paymentSettings.fawryEnabled && (
                  <button
                    type="button"
                    onClick={() => setTransferType('fawry')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      transferType === 'fawry'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="block font-black text-xs">فوري</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Fawry Pay</span>
                  </button>
                )}
              </div>

              {/* Transfer Details Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">المبلغ المطلوب تحويله:</span>
                  <span className="font-black text-emerald-400 text-base">{course.price} ج.م</span>
                </div>

                {transferType === 'vodafone' && (
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-rose-300 font-bold block">رقم فودافون كاش المعتمد:</span>
                      <span className="text-sm font-black text-white font-mono" dir="ltr">
                        {paymentSettings.vodafoneNumber || '01019876543'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(paymentSettings.vodafoneNumber || '01019876543', 'vodafone')}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'vodafone' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'vodafone' ? 'تم النسخ' : 'نسخ الرقم'}</span>
                    </button>
                  </div>
                )}

                {transferType === 'instapay' && (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-300 font-bold block">عنوان إنستاباي المعتمد (IPA):</span>
                      <span className="text-sm font-black text-white font-mono" dir="ltr">
                        {paymentSettings.instapayAddress || 'sea@instapay'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(paymentSettings.instapayAddress || 'sea@instapay', 'instapay')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'instapay' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'instapay' ? 'تم النسخ' : 'نسخ العنوان'}</span>
                    </button>
                  </div>
                )}

                {transferType === 'fawry' && (
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-amber-300 font-bold block">كود الخدمة بفوري:</span>
                      <span className="text-sm font-black text-white font-mono" dir="ltr">
                        {paymentSettings.fawryCode || '78421'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(paymentSettings.fawryCode || '78421', 'fawry')}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'fawry' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'fawry' ? 'تم النسخ' : 'نسخ الكود'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Transfer Confirmation Form */}
              <form onSubmit={handleDirectTransferSubmit} className="space-y-4">
                {transferType === 'vodafone' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      رقم الهاتف الذي قمت بالتحويل منه (فودافون كاش)
                    </label>
                    <input
                      type="text"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="مثال: 01012345678"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-rose-500 focus:outline-none"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      رقم العملية أو المرجع (Reference / Transaction ID)
                    </label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="مثال: 9842187654"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    رابط إيصال الدفع أو السكرين شوت (اختياري)
                  </label>
                  <input
                    type="url"
                    value={screenshotUrl}
                    onChange={(e) => setScreenshotUrl(e.target.value)}
                    placeholder="https://... رابط صورة الإيصال"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingTransfer}
                  className="w-full py-4 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white font-black text-sm transition-all shadow-xl shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingTransfer ? 'جارِ إرسال بيانات التحويل...' : 'تأكيد إرسال التحويل للإدارة'}</span>
                </button>
              </form>
            </div>
          )}

          {/* METHOD 3: WALLET BALANCE */}
          {activeMethod === 'wallet' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">الرصيد المتاح بمحفظتك:</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">{walletBalance} ج.م</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
                  <span className="text-xs text-slate-300">قيمة الاشتراك المطلوب:</span>
                  <span className="text-lg font-black text-white font-mono">{course.price} ج.م</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-amber-500/20 text-xs">
                  <span className="text-slate-400">الرصيد المتبقي بعد الاشتراك:</span>
                  <span className="font-bold text-cyan-300 font-mono">{walletBalance - course.price} ج.م</span>
                </div>
              </div>

              <button
                onClick={handleWalletEnroll}
                className="w-full py-4 rounded-2xl bg-gradient-to-l from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-sm transition-all shadow-xl shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>تأكيد الخصم والاشتراك الفوري</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

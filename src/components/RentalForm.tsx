import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Zap,
  TrendingUp,
  Send,
  Lock,
} from 'lucide-react';

export const RentalForm: React.FC = () => {
  const { requestPlatformOrder, addToast, theme } = useApp();
  const isLight = theme === 'light';

  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [subject, setSubject] = useState('اللغة الإنجليزية');
  const [desiredPlatformName, setDesiredPlatformName] = useState('');
  const [planType, setPlanType] = useState<'monthly' | 'annual' | 'custom_purchase'>('annual');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantEmail || !applicantPhone || !desiredPlatformName) {
      addToast('warning', 'يرجى تعبئة كافة الحقول المطلوبة');
      return;
    }

    requestPlatformOrder({
      applicantName,
      applicantEmail,
      applicantPhone,
      subject,
      desiredPlatformName,
      planType,
      notes,
    });

    setIsSubmitted(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 text-right">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold ${
            isLight
              ? 'bg-cyan-50 border-cyan-200 text-cyan-800'
              : 'bg-cyan-950/80 border-cyan-500/30 text-cyan-300'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-500" />
          <span>استئجار وتصميم منصة تعليمية ذكية باسمك وهويتك</span>
        </div>
        <h1 className={`text-3xl sm:text-4xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
          احصل على منصتك التعليمية المتكاملة لمادتك
        </h1>
        <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          مشغل فيديو فائق الأمان، حظر تصوير الشاشة، بنك أسئلة، امتحانات إلكترونية، وتحكم كامل بكل سهولة.
        </p>
      </div>

      {/* Pricing Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div
          onClick={() => setPlanType('monthly')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-4 ${
            planType === 'monthly'
              ? isLight
                ? 'bg-white border-cyan-500 shadow-xl ring-2 ring-cyan-500/20'
                : 'bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-950/30'
              : isLight
              ? 'bg-white border-slate-200 hover:border-slate-300'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>الباقة الشهرية</span>
          <div className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
            650 <span className={`text-xs font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>ج.م / شهرياً</span>
          </div>
          <ul className={`space-y-2 text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-500 shrink-0" />
              <span>منصة كاملة باسمك وشعارك الخاص</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-500 shrink-0" />
              <span>مشغل فيديو محمي بعلامة مائية</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-500 shrink-0" />
              <span>عدد غير محدود من الكورسات والطلاب</span>
            </li>
          </ul>
        </div>

        <div
          onClick={() => setPlanType('annual')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-4 relative ${
            planType === 'annual'
              ? isLight
                ? 'bg-white border-cyan-500 shadow-2xl ring-2 ring-cyan-500/30'
                : 'bg-slate-900 border-cyan-400 shadow-2xl shadow-cyan-950/50 ring-2 ring-cyan-500/20'
              : isLight
              ? 'bg-white border-slate-200 hover:border-slate-300'
              : 'bg-slate-950 border-slate-800'
          }`}
        >
          <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 text-[10px] font-black text-slate-950">
            الأكثر توفيراً واختياراً (خصم شهرين)
          </div>
          <span className="text-xs font-bold text-sky-600 dark:text-cyan-400">الباقة السنوية (الموصى بها)</span>
          <div className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
            6,500 <span className={`text-xs font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>ج.م / سنوياً</span>
          </div>
          <ul className={`space-y-2 text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>كل مميزات الباقة الشهرية</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>رابط مباشر وسريع للمنصة</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>دعم فني خاص 24/7 لمتابعة الطلاب</span>
            </li>
          </ul>
        </div>

        <div
          onClick={() => setPlanType('custom_purchase')}
          className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-4 ${
            planType === 'custom_purchase'
              ? isLight
                ? 'bg-white border-cyan-500 shadow-xl ring-2 ring-cyan-500/20'
                : 'bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-950/30'
              : isLight
              ? 'bg-white border-slate-200 hover:border-slate-300'
              : 'bg-slate-950 border-slate-800'
          }`}
        >
          <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>شراء مخصص وتملك كامل</span>
          <div className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
            طلب مخصص <span className={`text-xs font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>حسب المتطلبات</span>
          </div>
          <ul className={`space-y-2 text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-500 shrink-0" />
              <span>تطبيق موبايل مخصص للمعلم</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-500 shrink-0" />
              <span>بوابات دفع إلكتروني فورية للطلاب</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Form Container */}
      <div
        className={`p-8 rounded-3xl border shadow-2xl transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-slate-900 border-slate-800'
        }`}
      >
        {isSubmitted ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>تم استلام طلبك بنجاح!</h3>
            <p className={`text-xs sm:text-sm max-w-md mx-auto ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              سيقوم فريق إدارة المنظومة التعليمية (SEA) بمراجعة طلب منصة "{desiredPlatformName}" وتجهيز حساب المعلم فوراً.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs cursor-pointer shadow-md"
            >
              تقديم طلب آخر
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3
              className={`text-base font-black border-b pb-3 ${
                isLight ? 'text-slate-900 border-slate-200' : 'text-white border-slate-800'
              }`}
            >
              بيانات المعلم والمنصة المطلوبة
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  اسم المعلم ثلاثي
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أ/ محمد رضوان"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:border-cyan-500 focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
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
                  placeholder="مثال: مادة اللغة الإنجليزية للثانوية العامة"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:border-cyan-500 focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  الاسم المقترح لمنصتك
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: منصة الأسطورة في اللغة الإنجليزية"
                  value={desiredPlatformName}
                  onChange={(e) => setDesiredPlatformName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:border-cyan-500 focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  رقم الهاتف والواتساب
                </label>
                <input
                  type="tel"
                  required
                  placeholder="010XXXXXXXX"
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:border-cyan-500 focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                البريد الإلكتروني للمعلم
              </label>
              <input
                type="email"
                required
                placeholder="teacher@example.com"
                value={applicantEmail}
                onChange={(e) => setApplicantEmail(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm focus:border-cyan-500 focus:outline-none ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                ملاحظات أو ميزات خاصة ترغب في إضافتها
              </label>
              <textarea
                rows={3}
                placeholder="أخبرنا بأي تفاصيل إضافية مثل السنين الدراسية أو رغبتك في نقل محتواك الحالي..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`w-full p-3 rounded-xl border text-xs sm:text-sm focus:border-cyan-500 focus:outline-none ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-950/40 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>إرسال طلب تجهيز المنصة وتسليم الحساب فوراً</span>
            </button>
          </form>
        )}
      </div>

    </div>
  );
};

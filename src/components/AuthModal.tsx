import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SUPER_ADMIN_CREDENTIALS } from '../data/mockData';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowRight,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  CheckCircle2,
  Fingerprint,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, platforms, setCurrentView } = useApp();

  const [activeOption, setActiveOption] = useState<'login' | 'create_choice'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      if (!identifier.trim() || !password.trim()) {
        setErrorMessage('يرجى إدخال البريد الإلكتروني أو كود الطالب، وكلمة المرور.');
        setIsLoading(false);
        return;
      }
      const res = await login(identifier, password);
      if (!res.success) {
        setErrorMessage(res.message || 'بيانات الدخول غير صحيحة. تأكد من البريد أو كود الطالب وكلمة المرور.');
      }
    } catch {
      setErrorMessage('حدث خطأ غير متوقع أثناء تسجيل الدخول.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToComprehensiveSignup = () => {
    setIsAuthModalOpen(false);
    setCurrentView('student_signup');
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={() => setIsAuthModalOpen(false)}
    >
      <div
        id="auth-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-8 overflow-hidden text-right text-white"
      >
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="btn-close-auth-modal"
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 left-5 p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 overflow-hidden flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            <img
              src="/logo.png"
              alt="SEA Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">
              بوابة الوصول والاعتماد المركزي
            </h3>
            <p className="text-xs font-bold text-slate-400">
              Smart Education Authority • اختر وجهتك للمتابعة
            </p>
          </div>
        </div>

        {/* Main 2-Option Selector Tabs */}
        <div className="grid grid-cols-2 p-1.5 mb-6 rounded-2xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            id="tab-select-login"
            onClick={() => {
              setActiveOption('login');
              setErrorMessage('');
            }}
            className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeOption === 'login'
                ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>تسجيل الدخول</span>
          </button>

          <button
            type="button"
            id="tab-select-signup"
            onClick={() => {
              setActiveOption('create_choice');
              setErrorMessage('');
            }}
            className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeOption === 'create_choice'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>إنشاء حساب جديد</span>
          </button>
        </div>

        {/* OPTION 1: LOGIN (For Admins, Instructors, & Pre-registered Students Only) */}
        {activeOption === 'login' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-slate-300 space-y-2">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-cyan-300">تسجيل الدخول المعتمد:</span> متاح للطلاب المعتمدة حساباتهم بعد المراجعة الإدارية، والمعلمين، ومسؤولي الإدارة.
                </div>
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed border-t border-cyan-900/40 pt-2">
                ℹ️ <strong className="text-slate-200">تنويه هام:</strong> الحسابات الجديدة تظل قيد المراجعة الإدارية والتدقيق (خلال 1 - 48 ساعة). في حال رفض الحساب من قبل الإدارة لا يمكن تسجيل الدخول إليه نهائياً.
              </div>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs font-bold leading-relaxed">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  البريد الإلكتروني أو كود الطالب الموحد (SEA-ID)
                </label>
                <div className="relative">
                  <input
                    id="input-auth-identifier"
                    type="text"
                    required
                    placeholder="name@example.com أو SEA-2026-XXXXX"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:outline-none transition-all text-right font-medium"
                  />
                  <Mail className="w-5 h-5 text-slate-500 absolute right-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    id="input-auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-11 pl-11 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:outline-none transition-all text-right font-medium"
                  />
                  <Lock className="w-5 h-5 text-slate-500 absolute right-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-submit-auth-login"
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>تسجيل الدخول الآمن للمنظومة</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* OPTION 2: CREATE NEW ACCOUNT (Clear, Direct Registration Overview) */}
        {activeOption === 'create_choice' && (
          <div className="space-y-5 animate-fade-in text-right">
            <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">
                    إنشاء حساب طالب جديد
                  </h4>
                  <p className="text-xs text-slate-400">
                    خطوات سهلة ومباشرة لتقديم طلب الانضمام للمنظومة
                  </p>
                </div>
              </div>

              {/* Clear Straightforward Steps Overview */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                  <span><strong>البيانات الأساسية:</strong> كتابة الاسم الرباعي الرسمي، وأرقام هواتف التواصل (الطالب وولي الأمر).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                  <span><strong>البريد وكلمة المرور:</strong> إدخال بريد إلكتروني احتياطي (Gmail) وكلمة مرور قوية لتسجيل دخولك بأمان.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                  <span><strong>التحقق البشري:</strong> الإجابة عن سؤال بسيط للتأكد من بشرية المستخدم.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</span>
                  <span><strong>الصورة الشخصية:</strong> التقاط صورة واضحة لتأكيد هويتك وضمان استخدامك الشخصي وحماية المحتوى.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">5</span>
                  <span><strong>المراجعة والاعتماد:</strong> مراجعة يدوية من الإدارة (1 - 48 ساعة)، وعند القبول يصدر لك معرّف (ID) فريد وخاص بك.</span>
                </div>
              </div>

              <button
                type="button"
                id="btn-launch-full-signup"
                onClick={handleGoToComprehensiveSignup}
                className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>البدء في تسجيل البيانات الآن</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </div>

            <p className="text-[11px] text-center text-slate-400 font-semibold">
              هل لديك حساب بالفعل؟{' '}
              <button
                type="button"
                onClick={() => setActiveOption('login')}
                className="text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-4 cursor-pointer"
              >
                الرجوع لتسجيل الدخول
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

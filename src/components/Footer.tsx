import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  Heart,
  Zap,
  BookOpen,
  GraduationCap,
  Tv,
  MessageCircle,
  Code2,
} from 'lucide-react';
import { ThemeController } from './ThemeController';

export const Footer: React.FC = () => {
  const { setCurrentView, setSelectedPlatformId, platforms, theme } = useApp();
  const isLight = theme === 'light';

  return (
    <footer
      className={`mt-20 border-t relative overflow-hidden transition-colors duration-400 ${
        isLight
          ? 'border-slate-200 bg-white text-slate-600'
          : 'border-slate-800/90 bg-[#060913] text-slate-400'
      }`}
    >
      {/* Background glow accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Authority Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 overflow-hidden flex items-center justify-center text-white font-black shadow-[0_0_15px_rgba(14,165,233,0.4)]">
                <img
                  src="/logo.png"
                  alt="SEA Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-[10px]"
                />
              </div>
              <div>
                <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Smart Education Authority
                </h3>
                <p className="text-xs text-cyan-600 dark:text-cyan-400 font-bold">المنظومة التعليمية الذكية (SEA)</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              المظلة المركزية المتكاملة لإنشاء وتأجير المنصات التعليمية لكبار معلمي الجمهورية، مع توفير أفضل تجربة تعليمية للطلاب.
            </p>
            
            <div
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border ${
                isLight
                  ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                  : 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>متابعة تفاعلية للدرجات وامتحانات دورية للطلاب</span>
            </div>

            {/* Direct WhatsApp Contact Button for Booking Platforms */}
            <a
              href="https://wa.me/201151157100?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D9%80%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%AD%D8%AC%D8%B2%20%D9%85%D9%86%D8%B5%D8%A9%20%D8%AA%D8%B9%D9%84%D9%8A%D9%85%D9%8A%D8%A9%20%D8%AC%D8%AF%D9%8A%D8%AF%D8%A9"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>لحجز منصة للمعلمين: 01151157100</span>
            </a>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-4">
            <h4
              className={`text-sm font-black tracking-wide border-r-2 border-cyan-500 pr-2.5 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              روابط المنظومة
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => {
                    setSelectedPlatformId(null);
                    setCurrentView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-cyan-500 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-700" />
                  الصفحة الرئيسية للمنظومة
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (platforms[0]?.id) {
                      setSelectedPlatformId(platforms[0].id);
                      setCurrentView('platform_detail');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="hover:text-sky-500 transition-colors flex items-center gap-2 font-bold text-sky-600 dark:text-sky-400 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  منصة {platforms[0]?.teacherName || 'مستر محمد رضوان'} ({platforms[0]?.subject || 'اللغة الإنجليزية'})
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('platforms');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-cyan-500 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-700" />
                  دليل منصات المعلمين المتاحة
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('security_showcase');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-cyan-500 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-700" />
                  المشغل الآمن للمحاضرات
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('rental_form');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-500 transition-colors flex items-center gap-2 font-bold text-amber-600 dark:text-amber-300 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  طلب إنشاء منصة تعليمية لمعلم
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Sample Subject Platforms */}
          <div className="space-y-4">
            <h4
              className={`text-sm font-black tracking-wide border-r-2 border-sky-500 pr-2.5 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              منصات المواد الدراسية
            </h4>
            <ul className="space-y-2.5 text-sm">
              {platforms.slice(0, 4).map((plat) => (
                <li key={plat.id}>
                  <button
                    onClick={() => {
                      setSelectedPlatformId(plat.id);
                      setCurrentView('platform_detail');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`transition-colors flex items-center gap-2 text-right group cursor-pointer ${
                      isLight ? 'hover:text-slate-900' : 'hover:text-white'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: plat.themeColor }}
                    />
                    <span className="group-hover:translate-x-[-2px] transition-transform line-clamp-1">
                      {plat.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Platform Standards & Theme */}
          <div className="space-y-4">
            <h4
              className={`text-sm font-black tracking-wide border-r-2 border-indigo-500 pr-2.5 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              ميزات الحماية والمظهر
            </h4>
            <div className="space-y-2 text-xs">
              <div
                className={`flex items-center gap-2 p-2 rounded-lg border ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <Tv className="w-4 h-4 text-sky-500 shrink-0" />
                <span>تجربة تعليمية تفاعلية حديثة</span>
              </div>
              <div
                className={`flex items-center gap-2 p-2 rounded-lg border ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>علامة مائية لحفظ حقوق المحتوى</span>
              </div>
            </div>

            {/* Atmosphere theme selector */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-500 block mb-2">تخصيص مظهر الشاشة:</span>
              <ThemeController />
            </div>
          </div>

        </div>

        {/* Developer Signature & Copyright Area */}
        <div
          className={`mt-14 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-6 ${
            isLight ? 'border-slate-200' : 'border-slate-800/80'
          }`}
        >
          
          <div className="text-xs text-slate-500 text-center md:text-right">
            © {new Date().getFullYear()} Smart Education Authority (SEA). جميع الحقوق محفوظة لكافة المنصات والمناهج التعليمية.
          </div>

          {/* Prominent Developer Signature */}
          <div
            id="developer-signature-banner"
            className={`group relative px-6 py-3.5 rounded-2xl border shadow-xl transition-all duration-300 flex items-center gap-3.5 ${
              isLight
                ? 'bg-gradient-to-r from-white via-cyan-50/40 to-white border-cyan-200/80 hover:border-cyan-400 shadow-cyan-950/5'
                : 'bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border-cyan-500/30 hover:border-cyan-400/70 shadow-[0_4px_25px_rgba(6,182,212,0.12)]'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 flex items-center justify-center text-white font-black shadow-md shrink-0">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div className="text-right">
              <div
                className={`text-xs font-black tracking-wide flex items-center gap-1.5 ${
                  isLight ? 'text-slate-900' : 'text-slate-100 group-hover:text-white'
                }`}
              >
                <span>Built with passion & precision by</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-sky-400 font-black text-sm">
                  Nour El Saeed
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 inline" />
              </div>
              <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400 tracking-wide flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Developer & System Architect</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span>UI/UX Designer</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};


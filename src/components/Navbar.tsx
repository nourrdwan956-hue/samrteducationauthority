import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ThemeController } from './ThemeController';
import { ShieldAlert, BookOpen, LogOut, User as UserIcon, ShieldCheck, GraduationCap } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    theme, 
    currentUser, 
    logout, 
    setIsAuthModalOpen,
    platforms,
    selectedPlatformId
  } = useApp();

  const isLight = theme === 'light';
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = (totalScroll / windowHeight) * 100;
      if (windowHeight > 0) {
        setScrollProgress(Number(scroll));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activePlatform = platforms.find((p) => p.id === selectedPlatformId);

  return (
    <>
      <div
        id="page-scroll-progress-bar"
        className={`fixed top-0 left-0 right-0 h-1 z-50 transition-colors ${isLight ? 'bg-slate-200' : 'bg-slate-900'}`}
      >
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 transition-all duration-150 ease-out shadow-[0_0_12px_rgba(14,165,233,0.8)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <header
        className={`sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-all duration-300 ${
          isLight ? 'bg-white/80 border-slate-200 shadow-sm' : 'bg-[#060913]/80 border-slate-800 shadow-lg'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo Area */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <img src="/logo.png" alt="SEA Logo" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col items-start hidden sm:flex">
                  <span className={`text-base font-black tracking-tight leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    طاقم تدريس عالي
                  </span>
                  <span className="text-[10px] font-bold text-cyan-500 tracking-wider mt-1">
                    بالتعاون مع Smart Education Authority (SEA)
                  </span>
                </div>
              </button>

              {/* Contextual Platform Name */}
              {activePlatform && currentView === 'teacher_dashboard' && (
                <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800'}`}>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    {activePlatform.name}
                  </span>
                </div>
              )}
            </div>

            {/* Right Side: Theme & User */}
            <div className="flex items-center gap-3 sm:gap-4">
              <ThemeController />

              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex flex-col items-end mr-3">
                    <span className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider">
                      {currentUser.role === 'super_admin'
                        ? 'الإدارة العليا'
                        : currentUser.role === 'teacher'
                        ? 'لوحة المعلم'
                        : `${currentUser.officialStudentId || currentUser.studentCode || 'بوابة الطالب المعتمدة'} • ${currentUser.walletBalance || 0} ج.م`}
                    </span>
                  </div>
                  
                  {/* Dashboard Return Button */}
                  <button
                    onClick={() => {
                      if (currentUser.role === 'super_admin') setCurrentView('super_admin');
                      else if (currentUser.role === 'teacher') setCurrentView('teacher_dashboard');
                      else setCurrentView('student_portal');
                    }}
                    className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                      isLight 
                        ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-cyan-600 shadow-sm' 
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-cyan-400'
                    }`}
                    title={currentUser.role === 'super_admin' ? 'الإدارة العامة للمنظومة' : 'العودة للوحة التحكم'}
                  >
                    {currentUser.role === 'super_admin' ? (
                      <div className="w-6 h-6 rounded-lg overflow-hidden flex items-center justify-center bg-rose-500/10">
                        <img 
                          src="/admin-logo.png" 
                          alt="شعار الإدارة" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.nav-admin-icon');
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                        />
                        <ShieldCheck className="nav-admin-icon hidden w-5 h-5 text-rose-500 stroke-[2.5]" />
                      </div>
                    ) : currentUser.role === 'teacher' ? (
                      <div className="w-6 h-6 rounded-lg overflow-hidden flex items-center justify-center bg-indigo-500/10">
                        <img 
                          src="/teacher-logo.png" 
                          alt="شعار المعلمين" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.nav-teacher-icon');
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                        />
                        <BookOpen className="nav-teacher-icon hidden w-5 h-5 text-indigo-500 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-lg overflow-hidden flex items-center justify-center bg-cyan-500/10">
                        <img 
                          src="/student-logo.png" 
                          alt="شعار الطلاب" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.nav-student-icon');
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                        />
                        <GraduationCap className="nav-student-icon hidden w-5 h-5 text-cyan-500 stroke-[2.5]" />
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setCurrentView('home');
                    }}
                    className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all cursor-pointer"
                    title="تسجيل الخروج"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white text-xs sm:text-sm font-black shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>دخول النظام</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

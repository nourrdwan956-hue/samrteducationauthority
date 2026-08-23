import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  Layers,
  BookOpen,
  Lock,
  Sparkles,
  User,
  GraduationCap,
} from 'lucide-react';

export const BottomMobileBar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    platforms,
    selectedPlatformId,
    setSelectedPlatformId,
    currentUser,
    setIsAuthModalOpen,
    theme,
  } = useApp();

  const isLight = theme === 'light';
  const primaryPlatform = platforms[0];

  const navItems = [
    {
      id: 'home',
      label: 'الرئيسية',
      icon: Home,
      isActive: currentView === 'home' && !selectedPlatformId,
      onClick: () => {
        setSelectedPlatformId(null);
        setCurrentView('home');
      },
    },
    ...(primaryPlatform
      ? [
          {
            id: 'platform',
            label: 'المنصة',
            icon: BookOpen,
            isActive: selectedPlatformId === primaryPlatform.id,
            badge: 'متاح',
            onClick: () => {
              setSelectedPlatformId(primaryPlatform.id);
              setCurrentView('platform_detail');
            },
          },
        ]
      : []),
    {
      id: 'platforms',
      label: 'تصفح المنصات',
      icon: Layers,
      isActive: currentView === 'platforms',
      onClick: () => {
        setSelectedPlatformId(null);
        setCurrentView('platforms');
      },
    },
    {
      id: 'account',
      label: currentUser ? 'حسابي' : 'دخول',
      icon: currentUser ? GraduationCap : User,
      isActive: currentView === 'student_portal' || currentView === 'teacher_dashboard' || currentView === 'super_admin',
      onClick: () => {
        if (!currentUser) {
          setIsAuthModalOpen(true);
        } else if (currentUser.role === 'super_admin') {
          setCurrentView('super_admin');
        } else if (currentUser.role === 'teacher') {
          setCurrentView('teacher_dashboard');
        } else {
          setCurrentView('student_portal');
        }
      },
    },
  ];

  return (
    <div
      id="bottom-mobile-quick-bar"
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-xl transition-all duration-300 pb-safe ${
        isLight
          ? 'bg-white/95 border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] text-slate-800'
          : 'bg-[#060913]/95 border-slate-800/90 shadow-[0_-4px_25px_rgba(0,0,0,0.5)] text-slate-200'
      }`}
    >
      <div className="flex items-center justify-around px-1 py-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center min-w-[48px] py-0.5 px-1 rounded-lg transition-all relative cursor-pointer ${
                item.isActive
                  ? isLight
                    ? 'text-cyan-700 font-black'
                    : 'text-cyan-400 font-black'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.badge && (
                <span className="absolute -top-1 right-1 px-1 py-[0.5px] rounded-full text-[7px] font-black bg-emerald-500 text-slate-950">
                  {item.badge}
                </span>
              )}
              <div
                className={`p-0.5 rounded-md transition-colors ${
                  item.isActive
                    ? isLight
                      ? 'bg-cyan-50'
                      : 'bg-cyan-950/60 text-cyan-400'
                    : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] mt-0.5 whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

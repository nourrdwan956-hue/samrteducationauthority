import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Diamond, Gem, Compass, ShieldCheck } from 'lucide-react';

interface ThemeControllerProps {
  compact?: boolean;
  showLabels?: boolean;
  className?: string;
}

export const ThemeController: React.FC<ThemeControllerProps> = ({
  compact = false,
  showLabels = true,
  className = '',
}) => {
  const { theme, toggleTheme } = useApp();

  const isDark = theme === 'dark';

  if (compact) {
    return (
      <button
        id="btn-luxury-theme-toggle-compact"
        onClick={toggleTheme}
        title={isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
        className={`relative group overflow-hidden flex items-center gap-2 p-2 rounded-2xl transition-all duration-500 cursor-pointer ${
          isDark
            ? 'bg-slate-900/90 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
            : 'bg-white/95 border border-amber-500/30 text-amber-900 hover:border-amber-400 shadow-[0_4px_20px_rgba(245,158,11,0.15)]'
        } ${className}`}
      >
        {/* Prismatic Shimmer Aura Background */}
        <div
          className={`absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${
            isDark
              ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600'
              : 'bg-gradient-to-r from-amber-400 via-rose-300 to-sky-400'
          }`}
        />

        {/* Dynamic Gemstone Icon */}
        <div className="relative z-10 flex items-center justify-center">
          {isDark ? (
            <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-950 to-slate-900 border border-cyan-500/40">
              <Diamond className="w-4 h-4 text-cyan-400 animate-pulse stroke-[2.2]" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
            </div>
          ) : (
            <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/80 border border-amber-300">
              <Gem className="w-4 h-4 text-amber-700 stroke-[2.2]" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
            </div>
          )}
        </div>

        {showLabels && (
          <span className="relative z-10 text-xs font-black tracking-wide hidden sm:inline-block px-1">
            {isDark ? 'الوضع الداكن' : 'الوضع الفاتح'}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      id="luxury-theme-controller-panel"
      className={`relative inline-flex items-center p-1 rounded-2xl transition-all duration-500 select-none ${
        isDark
          ? 'bg-slate-950/90 border border-slate-800 shadow-[0_0_25px_rgba(0,0,0,0.5)]'
          : 'bg-slate-100/90 border border-slate-300/80 shadow-[0_4px_25px_rgba(0,0,0,0.06)]'
      } ${className}`}
    >
      {/* Background Animated Slider Track */}
      <div className="relative flex items-center gap-1">
        
        {/* Dark Mode Option */}
        <button
          id="btn-select-dark-mode"
          onClick={() => isDark || toggleTheme()}
          className={`relative z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer ${
            isDark
              ? 'text-cyan-300 bg-gradient-to-r from-slate-900 to-cyan-950 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Diamond className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400 stroke-[2.5]' : 'text-slate-400'}`} />
            {isDark && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
            )}
          </div>
          <span>الوضع الداكن</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold opacity-80 border border-current">
            Dark
          </span>
        </button>

        {/* Light Mode Option */}
        <button
          id="btn-select-light-mode"
          onClick={() => isDark && toggleTheme()}
          className={`relative z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer ${
            !isDark
              ? 'text-amber-900 bg-gradient-to-r from-amber-50 to-white border border-amber-300 shadow-[0_4px_15px_rgba(245,158,11,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Gem className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-600 stroke-[2.5]' : 'text-slate-500'}`} />
            {!isDark && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping opacity-75" />
            )}
          </div>
          <span>الوضع الفاتح</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold opacity-80 border border-current">
            Light
          </span>
        </button>

      </div>
    </div>
  );
};

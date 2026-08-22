import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Lock, ShieldCheck, FileText } from 'lucide-react';

interface AntiLeakWatermarkProps {
  /** Mode: 'video' for video player overlay, 'exam' for exam engine, 'document' for PDF/file view, 'global' */
  mode?: 'video' | 'exam' | 'document' | 'general';
  /** Custom overlay container class */
  className?: string;
  /** Disable pointer events or allow click-through */
  interactive?: boolean;
}

export const AntiLeakWatermark: React.FC<AntiLeakWatermarkProps> = ({
  mode = 'general',
  className = '',
}) => {
  const { currentUser } = useApp();

  // Position state for the dynamic moving watermark
  const [pos, setPos] = useState({ x: 20, y: 30, rotate: -12, opacity: 0.35 });
  const [sessionHash] = useState(() =>
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );

  // Focus & Security Lock State
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [isScreenCaptureAttempt, setIsScreenCaptureAttempt] = useState(false);

  // Dynamic movement timer
  useEffect(() => {
    const interval = setInterval(() => {
      const nextX = Math.floor(Math.random() * 65) + 10; // 10% to 75%
      const nextY = Math.floor(Math.random() * 65) + 10; // 10% to 75%
      const nextRotate = (Math.random() - 0.5) * 30; // -15deg to +15deg
      const nextOpacity = 0.28 + Math.random() * 0.2; // 0.28 to 0.48
      setPos({ x: nextX, y: nextY, rotate: nextRotate, opacity: nextOpacity });
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  // Screen Capture & PrintScreen Blocker Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen Key
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        setIsScreenCaptureAttempt(true);
        navigator.clipboard?.writeText(' [المحتوى مالي ومحمي بسلطة SEA - يمنع التقاط الشاشة] ');
        setTimeout(() => setIsScreenCaptureAttempt(false), 3500);
      }

      // DevTools & Inspector Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, Ctrl+P)
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.key === 'S' || e.key === 's' || e.key === 'P' || e.key === 'p'))
      ) {
        e.preventDefault();
        setIsScreenCaptureAttempt(true);
        setTimeout(() => setIsScreenCaptureAttempt(false), 3000);
      }
    };

    const handleWindowBlur = () => {
      if (mode === 'exam' || mode === 'video') {
        setIsWindowBlurred(true);
      }
    };

    const handleWindowFocus = () => {
      setIsWindowBlurred(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [mode]);

  // Format student details
  const studentName = currentUser?.fourPartName || currentUser?.name || 'طالب SEA المعتمد';
  const officialId = currentUser?.officialStudentId || 'STU-2026-0001';
  const sequenceNum = currentUser?.seaSequenceNumber
    ? `#${String(currentUser.seaSequenceNumber).padStart(4, '0')}`
    : '#0001';
  const fileId = currentUser?.fileRegistrationNumber || 'FILE-2026-0001';
  const studentCode = currentUser?.studentCode || 'SEA-2026-98421';
  const nationalId = currentUser?.nationalId
    ? `${currentUser.nationalId.slice(0, 4)}****${currentUser.nationalId.slice(-4)}`
    : '3050****01234';

  return (
    <div className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-20 ${className}`}>
      {/* 1. Micro-Grid Background Watermark Layer (Diagonally repeating text) */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] flex flex-wrap content-start gap-12 p-4 rotate-[-15deg] scale-125 overflow-hidden">
        {Array.from({ length: 48 }).map((_, i) => (
          <span key={i} className="text-[11px] font-mono font-black tracking-widest text-slate-900 dark:text-white whitespace-nowrap">
            {officialId} | {sequenceNum} | {fileId} | {studentName} | DO NOT LEAK
          </span>
        ))}
      </div>

      {/* 2. Floating Dynamic Primary Anti-Leak Watermark Badge (Continuously Moves Around Screen) */}
      <div
        style={{
          top: `${pos.y}%`,
          left: `${pos.x}%`,
          transform: `rotate(${pos.rotate}deg)`,
          opacity: pos.opacity,
          transition: 'all 2.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="absolute p-3 rounded-2xl bg-slate-950/85 text-cyan-300 border border-cyan-500/40 backdrop-blur-md shadow-2xl space-y-0.5 text-right font-mono"
        dir="rtl"
      >
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-white">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate max-w-[180px] text-cyan-200 font-sans">{studentName}</span>
          <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.2 rounded text-[9px]">
            {officialId}
          </span>
        </div>

        <div className="text-[9px] text-slate-300 flex items-center gap-2">
          <span>الكود: <strong className="text-amber-300">{officialId}</strong></span>
          <span>•</span>
          <span>الملف: <strong className="text-emerald-300">{fileId}</strong></span>
        </div>

        <div className="text-[8px] text-slate-400 flex items-center justify-between gap-1 pt-0.5 border-t border-slate-800">
          <span>القومي: {nationalId}</span>
          <span className="text-[7px] text-cyan-400/80 font-mono">TRACE-{sessionHash}</span>
        </div>
      </div>

      {/* 3. Screen Record / Blur High Security Lock Shield */}
      {(isWindowBlurred || isScreenCaptureAttempt) && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center text-white pointer-events-auto animate-fade-in" dir="rtl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 mb-3 animate-pulse shadow-2xl">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="px-3.5 py-1 rounded-full text-xs font-black bg-rose-500/30 text-rose-300 border border-rose-500/50 mb-2">
            🚨 تفعيل نظام حظر التسريب والتسجيل الموحد (Anti-Leak Content Shield)
          </span>

          <h3 className="text-lg font-black text-white mb-1.5">
            {isScreenCaptureAttempt
              ? 'تم اكتشاف محاولة التقاط شاشة أو فتح أدوات الفحص'
              : 'تم إيقاف عرض المحتوى مؤقتاً لمغادرة النافذة'}
          </h3>

          <p className="text-xs text-slate-300 max-w-md leading-relaxed mb-4">
            هذا المستند والفيديوهات والامتحانات مرتبطة بكود الطالب الرسمي المعتمد (<strong>{officialId}</strong>). يُحظر التسريب كلياً وسيتم تجميد وإغلاق الحساب وإتخاذ الإجراءات القانونية فوراً حال الاكتشاف.
          </p>

          <button
            onClick={() => {
              setIsWindowBlurred(false);
              setIsScreenCaptureAttempt(false);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black text-xs shadow-lg cursor-pointer flex items-center gap-1.5"
          >
            <Lock className="w-4 h-4" />
            <span>انقر هنا للعودة لمتابعة المحتوى الآمن</span>
          </button>
        </div>
      )}
    </div>
  );
};

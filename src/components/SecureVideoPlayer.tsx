import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Lesson, Course, StudentNote, LessonQuestion } from '../types';
import { extractYouTubeId } from '../lib/videoUtils';
import { decryptVideoUrl, resolveYouTubeId, getObfuscatedEmbedUrl } from '../lib/videoEncryption';
import { attachDRMHardwareProtection } from '../lib/videoDRM';
import {
  initScreenRecordingProtection,
  subscribeToScreenProtection,
  resetRecordingAlert,
  SecurityStatus,
} from '../lib/screenProtection';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Play,
  Pause,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Bookmark,
  Send,
  Trash2,
  HelpCircle,
  AlertOctagon,
  Settings,
  CheckCircle,
  Edit3,
  Check,
  X,
  MessageSquare,
  MessageCircle,
  Pin,
  Clock,
  UserCheck,
  CornerDownLeft,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

interface SecureVideoPlayerProps {
  lesson?: Lesson;
  course?: Course;
  onLessonComplete?: () => void;
  /** Optional override mode for teacher dashboard previewing */
  previewModeOverride?: 'platform' | 'youtube';
}

const NOTE_COLOR_STYLES: Record<
  NonNullable<StudentNote['color']>,
  {
    card: string;
    badge: string;
    pin: string;
    border: string;
    accent: string;
  }
> = {
  amber: {
    card: 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700/60 text-amber-950 dark:text-amber-100 shadow-amber-500/10',
    badge: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
    pin: 'bg-amber-400 dark:bg-amber-500',
    border: 'border-amber-400',
    accent: '#f59e0b',
  },
  cyan: {
    card: 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-300 dark:border-cyan-700/60 text-cyan-950 dark:text-cyan-100 shadow-cyan-500/10',
    badge: 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/30',
    pin: 'bg-cyan-400 dark:bg-cyan-500',
    border: 'border-cyan-400',
    accent: '#06b6d4',
  },
  rose: {
    card: 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700/60 text-rose-950 dark:text-rose-100 shadow-rose-500/10',
    badge: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30',
    pin: 'bg-rose-400 dark:bg-rose-500',
    border: 'border-rose-400',
    accent: '#f43f5e',
  },
  emerald: {
    card: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700/60 text-emerald-950 dark:text-emerald-100 shadow-emerald-500/10',
    badge: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
    pin: 'bg-emerald-400 dark:bg-emerald-500',
    border: 'border-emerald-400',
    accent: '#10b981',
  },
  purple: {
    card: 'bg-purple-50 dark:bg-purple-950/50 border-purple-300 dark:border-purple-700/60 text-purple-950 dark:text-purple-100 shadow-purple-500/10',
    badge: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30',
    pin: 'bg-purple-400 dark:bg-purple-500',
    border: 'border-purple-400',
    accent: '#a855f7',
  },
  sky: {
    card: 'bg-sky-50 dark:bg-sky-950/50 border-sky-300 dark:border-sky-700/60 text-sky-950 dark:text-sky-100 shadow-sky-500/10',
    badge: 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30',
    pin: 'bg-sky-400 dark:bg-sky-500',
    border: 'border-sky-400',
    accent: '#0ea5e9',
  },
  orange: {
    card: 'bg-orange-50 dark:bg-orange-950/50 border-orange-300 dark:border-orange-700/60 text-orange-950 dark:text-orange-100 shadow-orange-500/10',
    badge: 'bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30',
    pin: 'bg-orange-400 dark:bg-orange-500',
    border: 'border-orange-400',
    accent: '#f97316',
  },
};

const COLOR_OPTIONS: Array<NonNullable<StudentNote['color']>> = [
  'amber',
  'cyan',
  'rose',
  'emerald',
  'purple',
  'sky',
  'orange',
];

export const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({
  lesson: propLesson,
  course: propCourse,
  onLessonComplete,
}) => {
  const {
    currentLesson,
    currentCourse,
    currentUser,
    studentNotes,
    addStudentNote,
    updateStudentNote,
    deleteStudentNote,
    lessonQuestions,
    askLessonQuestion,
    replyToLessonQuestion,
    addToast,
    setCurrentView,
    enrollInCourse,
    setIsAuthModalOpen,
  } = useApp();

  const lesson = propLesson || currentLesson;
  const course = propCourse || currentCourse;

  if (!lesson || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-white rounded-2xl p-6 text-right">
        <AlertOctagon className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">تعذر تحميل المحاضرة</h2>
        <button
          onClick={() => setCurrentView('student_portal')}
          className="px-6 py-2.5 mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
        >
          العودة للبوابة
        </button>
      </div>
    );
  }

  // Strict Access Guard
  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'super_admin';
  const isEnrolled = currentUser?.enrolledCourseIds?.includes(course.id);
  const isFreePreview = Boolean(lesson.isFreePreview);
  const hasAccess = isEnrolled || isTeacherOrAdmin || isFreePreview;

  if (!hasAccess) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-4 text-right">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-xl animate-pulse">
              <Lock className="w-10 h-10" />
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
              🔒 محتوى محمي ومغلق للمشتركين فقط
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-white">
              عفواً! هذه المحاضرة غير متاحة للفتح بدون اشتراك
            </h2>

            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              تصل الآن إلى محاضرة <span className="font-bold text-cyan-400">"{lesson.title}"</span> ضمن كورس <span className="font-bold text-cyan-400">"{course.title}"</span>. رابط الفيديو ومحتويات الشرح مشفرة ومحمية تماماً ولا يمكن عرضها إلا للطلاب المشتركين.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                if (!currentUser) {
                  addToast('info', 'تسجيل الدخول مطلوب', 'يرجى تسجيل الدخول أولاً لتأكيد اشتراكك في الكورس.');
                  setIsAuthModalOpen(true);
                } else {
                  enrollInCourse(course.id);
                }
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-950/40 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              <span>
                {currentUser ? `الاشتراك بـ ${course.price} ج.م لفتح الكورس بالكامل` : 'تسجيل الدخول والاشتراك الآن'}
              </span>
            </button>

            <button
              onClick={() => setCurrentView('course_detail')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm border border-slate-700 transition-colors cursor-pointer text-center"
            >
              العودة لمعاينة فهرس الكورس
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Security & Screen Capture Protection State
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    isRecordingDetected: false,
    isWindowBlurred: false,
    isDevToolsOpen: false,
  });



  // Decrypted Video Link Resolution
  const resolvedDirectUrl = useMemo(() => {
    return decryptVideoUrl(lesson.videoUrl || '');
  }, [lesson.videoUrl]);

  // Determine media provider (Direct MP4 vs YouTube)
  const isDirectVideo =
    lesson.videoProvider === 'direct' ||
    (resolvedDirectUrl && (resolvedDirectUrl.endsWith('.mp4') || resolvedDirectUrl.endsWith('.webm') || resolvedDirectUrl.includes('commondatastorage')));

  const platformEmbedUrl = useMemo(() => {
    return getObfuscatedEmbedUrl(lesson.youtubeVideoId || lesson.videoUrl || 'dQw4w9WgXcQ');
  }, [lesson.youtubeVideoId, lesson.videoUrl]);

  // Initial duration
  const initialDuration =
    lesson.durationMinutes && lesson.durationMinutes > 0 ? lesson.durationMinutes * 60 : 1800;

  // Player State
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(initialDuration);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [scrubTime, setScrubTime] = useState<number>(0);

  // Volume State
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState<number>(80);

  // UI State
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [videoQuality, setVideoQuality] = useState<string>('auto');
  const [isTabInactive, setIsTabInactive] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'ask'>('notes');

  // Notes state
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedNoteColor, setSelectedNoteColor] = useState<NonNullable<StudentNote['color']>>('amber');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [editingNoteColor, setEditingNoteColor] = useState<NonNullable<StudentNote['color']>>('amber');

  // Questions state
  const [questionText, setQuestionText] = useState('');
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const directVideoRef = useRef<HTMLVideoElement>(null);

  const currentTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const durationRef = useRef<number>(duration);
  const volumeRef = useRef<number>(volume);
  const isMutedRef = useRef<boolean>(isMuted);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Robust PostMessage Dispatcher to YouTube IFrame
  const sendIframeCommand = useCallback((func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      } catch (err) {}
    }
  }, []);

  // Subscribe to YouTube Iframe postMessages
  useEffect(() => {
    if (isDirectVideo) return;

    const timer = setTimeout(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'listening', id: 1 }),
            '*'
          );
        } catch (e) {}
      }
    }, 1000);

    const handleMessage = (event: MessageEvent) => {
      try {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);

          if (data.event === 'initialDelivery' || data.event === 'infoDelivery') {
            if (data.info?.duration && typeof data.info.duration === 'number' && data.info.duration > 0) {
              setDuration(Math.round(data.info.duration));
            }
            if (typeof data.info?.currentTime === 'number' && !isScrubbing) {
              setCurrentTime(Math.round(data.info.currentTime));
            }
            if (data.info?.playerState === 1) {
              setIsPlaying(true);
            } else if (data.info?.playerState === 2 || data.info?.playerState === 0) {
              setIsPlaying(false);
            }
            if (data.info?.playbackQuality) {
              setVideoQuality(data.info.playbackQuality);
            }
          }
        }
      } catch (err) {}
    };

    window.addEventListener('message', handleMessage);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('message', handleMessage);
    };
  }, [isDirectVideo, isScrubbing]);

  // Local Timekeeper when playing to keep controls silky smooth
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && !isScrubbing) {
      interval = setInterval(() => {
        if (isDirectVideo && directVideoRef.current) {
          const vid = directVideoRef.current;
          setCurrentTime(Math.round(vid.currentTime));
          if (vid.duration && !isNaN(vid.duration) && vid.duration > 0) {
            setDuration(Math.round(vid.duration));
          }
        } else {
          setCurrentTime((prev) => {
            const next = prev + 1;
            const max = durationRef.current || 1800;
            return next > max ? max : next;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isScrubbing, isDirectVideo]);

  // Reset on lesson change
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(true);
    const estimated =
      lesson.durationMinutes && lesson.durationMinutes > 0 ? lesson.durationMinutes * 60 : 1800;
    setDuration(estimated);
  }, [lesson.id, lesson.youtubeVideoId, lesson.durationMinutes]);

  // Fast & Precise Seeking
  const handleSeek = (targetSecs: number) => {
    const maxDur = durationRef.current > 0 ? durationRef.current : 3600;
    const clamped = Math.max(0, Math.min(maxDur, Math.round(targetSecs)));
    setCurrentTime(clamped);

    if (isDirectVideo && directVideoRef.current) {
      directVideoRef.current.currentTime = clamped;
    } else {
      sendIframeCommand('seekTo', [clamped, true]);
    }
  };

  const handleScrubChange = (val: number) => {
    setIsScrubbing(true);
    setScrubTime(val);
    setCurrentTime(val);
  };

  const handleScrubEnd = (val: number) => {
    setIsScrubbing(false);
    handleSeek(val);
  };

  // Play / Pause Toggle
  const togglePlay = () => {
    if (isDirectVideo && directVideoRef.current) {
      if (directVideoRef.current.paused) {
        directVideoRef.current.play();
        setIsPlaying(true);
      } else {
        directVideoRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    if (isPlaying) {
      sendIframeCommand('pauseVideo');
      setIsPlaying(false);
    } else {
      sendIframeCommand('playVideo');
      setIsPlaying(true);
    }
  };

  // Gradual Volume Controller
  const handleVolumeChange = (newVol: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(newVol)));
    setVolume(clamped);

    if (clamped === 0) {
      setIsMuted(true);
      if (isDirectVideo && directVideoRef.current) {
        directVideoRef.current.muted = true;
      } else {
        sendIframeCommand('mute');
      }
    } else {
      if (isMuted) {
        setIsMuted(false);
        if (isDirectVideo && directVideoRef.current) {
          directVideoRef.current.muted = false;
        } else {
          sendIframeCommand('unMute');
        }
      }
      setPreviousVolume(clamped);

      if (isDirectVideo && directVideoRef.current) {
        directVideoRef.current.volume = clamped / 100;
      } else {
        sendIframeCommand('setVolume', [clamped]);
      }
    }
  };

  // Mute / Unmute Toggle
  const toggleMute = () => {
    if (isMuted || volume === 0) {
      const restored = previousVolume > 0 ? previousVolume : 80;
      setIsMuted(false);
      setVolume(restored);
      if (isDirectVideo && directVideoRef.current) {
        directVideoRef.current.muted = false;
        directVideoRef.current.volume = restored / 100;
      } else {
        sendIframeCommand('unMute');
        sendIframeCommand('setVolume', [restored]);
      }
    } else {
      setPreviousVolume(volume);
      setIsMuted(true);
      if (isDirectVideo && directVideoRef.current) {
        directVideoRef.current.muted = true;
      } else {
        sendIframeCommand('mute');
      }
    }
  };

  const handleSpeedChange = (spd: number) => {
    setPlaybackSpeed(spd);
    if (isDirectVideo && directVideoRef.current) {
      directVideoRef.current.playbackRate = spd;
    } else {
      sendIframeCommand('setPlaybackRate', [spd]);
    }
    setShowSpeedMenu(false);
  };

  const handleQualityChange = (qKey: string) => {
    setVideoQuality(qKey);
    sendIframeCommand('setPlaybackQuality', [qKey]);
    setShowQualityMenu(false);
  };

  // Confirm Completion Action
  const handleConfirmCompletion = () => {
    if (onLessonComplete) {
      onLessonComplete();
    }
    addToast(
      'success',
      'تم إكمال المحاضرة بنجاح! 🎓',
      `تم تسجيل إنجازك في محاضرة "${lesson.title}" والعودة لصفحة الكورس.`
    );
    setCurrentView('course_detail');
  };

  // Screen Protection Effect & Listeners
  useEffect(() => {
    const cleanupProtection = initScreenRecordingProtection();
    const unsubscribe = subscribeToScreenProtection((status) => {
      setSecurityStatus(status);
      if (status.isRecordingDetected || status.isDevToolsOpen || status.isWindowBlurred) {
        if (isDirectVideo && directVideoRef.current) {
          directVideoRef.current.pause();
        } else {
          sendIframeCommand('pauseVideo');
        }
        setIsPlaying(false);
      }
    });

    return () => {
      unsubscribe();
      cleanupProtection();
    };
  }, [isDirectVideo, sendIframeCommand]);

  // Keyboard Shortcuts & Security Protections
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const targetTag = target?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || target?.isContentEditable) {
        return;
      }

      // Security protection keys: Block View Source, Save, Inspect, Screenshots
      if (
        (e.ctrlKey &&
          (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === 'c' || e.key === 'C')) ||
        (e.ctrlKey &&
          e.shiftKey &&
          (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        e.key === 'F12' ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        return false;
      }

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        togglePlay();
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSeek(currentTimeRef.current + 10);
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(Math.max(0, currentTimeRef.current - 10));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const curVol = isMutedRef.current ? 0 : volumeRef.current || 80;
        handleVolumeChange(Math.min(100, curVol + 10));
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const curVol = isMutedRef.current ? 0 : volumeRef.current || 80;
        handleVolumeChange(Math.max(0, curVol - 10));
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullScreen();
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
        return;
      }

      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        handleQuickBookmark();
        return;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabInactive(true);
        if (isDirectVideo && directVideoRef.current) {
          directVideoRef.current.pause();
        } else {
          sendIframeCommand('pauseVideo');
        }
        setIsPlaying(false);
      } else {
        setIsTabInactive(false);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isDirectVideo]);

  // Notes & Questions collections
  const currentLessonNotes = (studentNotes || []).filter((n) => n.lessonId === lesson.id);
  const currentLessonQuestions = (lessonQuestions || []).filter(
    (q) => q.lessonId === lesson.id || (q.courseId === course.id && q.lessonId === lesson.id)
  );

  // Dedicated Timestamp Jumper & Player Synchronizer
  const handleJumpToTimestamp = (targetSecs: number, noteTitle?: string) => {
    const maxDur = durationRef.current > 0 ? durationRef.current : 3600;
    const clamped = Math.max(0, Math.min(maxDur, Math.round(targetSecs)));

    setCurrentTime(clamped);
    setIsPlaying(true);

    if (isDirectVideo && directVideoRef.current) {
      directVideoRef.current.currentTime = clamped;
      directVideoRef.current.play().catch(() => {});
    } else {
      sendIframeCommand('seekTo', [clamped, true]);
      sendIframeCommand('playVideo');
    }

    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    addToast(
      'info',
      `الانتقال إلى الدقيقة ${formatTime(clamped)} ⏱️`,
      noteTitle
        ? `الرجوع إلى: "${noteTitle.slice(0, 45)}${noteTitle.length > 45 ? '...' : ''}"`
        : 'تم بدء تشغيل الفيديو من هذه اللحظة بنجاح.'
    );
  };

  // Quick Bookmark at the current minute
  const handleQuickBookmark = () => {
    const bookmarkTime = effectiveCurrentTime;
    const defaultText = `علامة مرجعية عند الدقيقة [${formatTime(bookmarkTime)}]`;
    addStudentNote(lesson.id, course.id, bookmarkTime, defaultText, 'amber');
    addToast(
      'success',
      'تم تثبيت العلامة المرجعية 🔖',
      `تم حفظ الدقيقة ${formatTime(bookmarkTime)} في كشكول الملاحظات. يمكنك الرجوع إليها بنقرة واحدة دائماً!`
    );
    setActiveTab('notes');
  };

  // Handlers for Notes
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addStudentNote(lesson.id, course.id, currentTime, newNoteText.trim(), selectedNoteColor);
    setNewNoteText('');
    const nextColorIndex = (COLOR_OPTIONS.indexOf(selectedNoteColor) + 1) % COLOR_OPTIONS.length;
    setSelectedNoteColor(COLOR_OPTIONS[nextColorIndex]);
  };

  const handleStartEditNote = (note: StudentNote) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.noteText);
    setEditingNoteColor(note.color || 'amber');
  };

  const handleSaveEditNote = (noteId: string) => {
    if (!editingNoteText.trim()) return;
    updateStudentNote(noteId, editingNoteText.trim(), editingNoteColor);
    setEditingNoteId(null);
  };

  const handleCancelEditNote = () => {
    setEditingNoteId(null);
    setEditingNoteText('');
  };

  // Handlers for Questions
  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    setIsSubmittingQuestion(true);
    askLessonQuestion(
      lesson.id,
      course.id,
      questionText.trim(),
      includeTimestamp ? currentTime : undefined
    );
    setTimeout(() => {
      setIsSubmittingQuestion(false);
      setQuestionText('');
    }, 300);
  };

  const handleSendReply = (questionId: string) => {
    const text = replyInputs[questionId];
    if (!text || !text.trim()) return;
    replyToLessonQuestion(questionId, text.trim());
    setReplyInputs((prev) => ({ ...prev, [questionId]: '' }));
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) secs = 0;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
      setIsFullScreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullScreen(false);
    }
  };

  // Progress Calculations
  const effectiveCurrentTime = isScrubbing ? scrubTime : currentTime;
  const progressPercent =
    duration > 0 ? Math.min(100, Math.max(0, (effectiveCurrentTime / duration) * 100)) : 0;
  const effectiveVolume = isMuted ? 0 : volume;

  // Sound Icon dynamic rendering
  const renderSoundIcon = () => {
    if (isMuted || effectiveVolume === 0) {
      return <VolumeX className="w-4 h-4 text-rose-400" />;
    }
    if (effectiveVolume <= 33) {
      return <Volume className="w-4 h-4 text-cyan-400" />;
    }
    if (effectiveVolume <= 66) {
      return <Volume1 className="w-4 h-4 text-cyan-400" />;
    }
    return <Volume2 className="w-4 h-4 text-cyan-400" />;
  };

  // 5 Step Sound Wave Bars definition
  const soundBars = [
    { height: 6, threshold: 1, stepVal: 20 },
    { height: 9, threshold: 21, stepVal: 40 },
    { height: 12, threshold: 41, stepVal: 60 },
    { height: 15, threshold: 61, stepVal: 80 },
    { height: 18, threshold: 81, stepVal: 100 },
  ];

  const displayDurationText =
    duration > 0
      ? duration >= 3600
        ? `${Math.floor(duration / 3600)} ساعة و ${Math.round((duration % 3600) / 60)} دقيقة`
        : `${Math.ceil(duration / 60)} دقيقة`
      : lesson.durationMinutes && lesson.durationMinutes > 0
      ? `${lesson.durationMinutes} دقيقة`
      : 'جاري التحميل...';

  return (
    <div className="w-full space-y-6 text-right select-none" onContextMenu={(e) => e.preventDefault()}>
      {/* Top Breadcrumb & Return to Course Navigation */}
      <div className="flex items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-700 dark:text-slate-300">
          <button
            onClick={() => setCurrentView('course_detail')}
            className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{course.title}</span>
          </button>
          <ChevronRight className="w-4 h-4 text-slate-400 rotate-180" />
          <span className="text-slate-900 dark:text-white truncate max-w-xs">{lesson.title}</span>
        </div>

        <button
          onClick={() => setCurrentView('course_detail')}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة لصفحة الكورس</span>
        </button>
      </div>

      {/* Main Video Frame Container */}
      <div
        ref={containerRef}
        id="protected-video-container"
        className="relative w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group select-none aspect-video"
      >
        {/* VIDEO STREAM ENGINE: Direct MP4 or Secure Edge-Masked YouTube IFrame */}
        <div className="relative w-full h-full overflow-hidden bg-slate-950 flex items-center justify-center select-none">
          {securityStatus.isRecordingDetected || securityStatus.isDevToolsOpen || securityStatus.isWindowBlurred || isTabInactive ? (
            <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none z-10">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3 animate-pulse">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-slate-300">تم حجب بث الفيديو لحماية المحتوى الرقمي</p>
            </div>
          ) : isDirectVideo ? (
            resolvedDirectUrl ? (
              <video
                ref={directVideoRef}
                src={resolvedDirectUrl}
                autoPlay
                playsInline
                className="w-full h-full object-contain pointer-events-none select-none"
                onLoadedMetadata={(e) => {
                  const vid = e.currentTarget;
                  if (vid.duration && !isNaN(vid.duration) && vid.duration > 0) {
                    setDuration(Math.round(vid.duration));
                  }
                  attachDRMHardwareProtection(vid);
                }}
                onTimeUpdate={(e) => {
                  if (!isScrubbing) {
                    setCurrentTime(Math.round(e.currentTarget.currentTime));
                  }
                }}
                onEnded={() => setIsPlaying(false)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 space-y-3">
                <AlertOctagon className="w-10 h-10 text-rose-500" />
                <p className="text-sm font-bold">رابط الفيديو غير متوفر (Direct Video)</p>
              </div>
            )
          ) : (
            <iframe
              ref={iframeRef}
              src={platformEmbedUrl}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute w-[108%] h-[122%] -top-[11%] -left-[4%] border-0 pointer-events-none select-none transform origin-center scale-[1.03]"
            />
          )}
        </div>

        {/* Edge-Masking Shields to prevent any YouTube logo/overlay clicks */}
        <div className="absolute top-0 inset-x-0 h-6 bg-slate-950 z-10 pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-6 bg-slate-950 z-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-16 bg-transparent z-10 pointer-events-auto" />
        <div className="absolute bottom-0 inset-x-0 h-14 bg-transparent z-10 pointer-events-auto" />



        {/* Clickable Center Overlay to Toggle Play/Pause */}
        {!(securityStatus.isRecordingDetected || securityStatus.isDevToolsOpen || securityStatus.isWindowBlurred || isTabInactive) && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 z-20 cursor-pointer flex items-center justify-center group/centerplay"
          >
            {!isPlaying && (
              <div className="w-16 h-16 rounded-full bg-slate-950/85 border border-cyan-500/50 flex items-center justify-center text-cyan-400 backdrop-blur-md shadow-2xl group-hover/centerplay:scale-110 transition-transform">
                <Play className="w-8 h-8 fill-cyan-400 mr-1" />
              </div>
            )}
          </div>
        )}

        {/* Ultra-High Security Lock Screen Overlay (Anti-Screen Recording & DevTools & Loss of Focus) */}
        {(securityStatus.isRecordingDetected || securityStatus.isDevToolsOpen || securityStatus.isWindowBlurred || isTabInactive) && (
          <div
            onClick={() => {
              resetRecordingAlert();
              setIsTabInactive(false);
              togglePlay();
            }}
            className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center text-white cursor-pointer select-none animate-in fade-in transition-all"
          >
            <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 mb-4 animate-pulse shadow-2xl">
              <ShieldAlert className="w-10 h-10" />
            </div>

            <span className="px-3.5 py-1 rounded-full text-xs font-black bg-rose-500/30 text-rose-300 border border-rose-500/50 mb-3">
              🚨 تم تفعيل حماية حظر تسجيل الشاشة (Anti-Capture Defense)
            </span>

            <h3 className="text-xl font-black text-white mb-2">
              {securityStatus.reason || 'تم إيقاف تشغيل الفيديو تلقائياً لأغراض الأمان والخصوصية'}
            </h3>

            <p className="text-xs text-slate-300 max-w-md leading-relaxed mb-6">
              يمنع النظام تماماً التقاط الشاشة، تسجيل المقاطع، أو مشاركة النافذة عبر البرامج (مثل Zoom, Google Meet, OBS) للحفاظ على أمان المحتوى التعليمي.
            </p>

            <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-all">
              <Play className="w-4 h-4 fill-white" />
              <span>انقر هنا لإعادة استئناف تشغيل المحاضرة</span>
            </div>
          </div>
        )}

        {/* Custom Interactive Player Controls Overlay */}
        <div className="absolute inset-x-0 bottom-0 z-30 p-4 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2.5">
          {/* Timeline Progress Bar (Fast, High-Precision Seeking Everywhere) */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] font-mono text-cyan-400 font-bold min-w-[40px] text-center">
              {formatTime(effectiveCurrentTime)}
            </span>

            <div className="relative flex-1 flex items-center group/timeline">
              <input
                type="range"
                min={0}
                max={duration > 0 ? duration : 1800}
                step={1}
                value={effectiveCurrentTime}
                onChange={(e) => handleScrubChange(Number(e.target.value))}
                onMouseUp={(e) => handleScrubEnd(Number((e.target as HTMLInputElement).value))}
                onTouchEnd={(e) => handleScrubEnd(Number((e.target as HTMLInputElement).value))}
                dir="ltr"
                style={{
                  background: `linear-gradient(to right, #06b6d4 0%, #22d3ee ${progressPercent}%, #334155 ${progressPercent}%, #334155 100%)`,
                }}
                className="player-timeline-slider w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-cyan-300 hover:h-3.5 transition-all"
                title={`التقدم: ${formatTime(effectiveCurrentTime)} / ${formatTime(duration)}`}
              />

              {/* Visual Bookmark Pins on the Timeline */}
              {duration > 0 &&
                currentLessonNotes.map((note) => {
                  const notePercent = Math.min(
                    100,
                    Math.max(0, (note.timestampSeconds / duration) * 100)
                  );
                  return (
                    <button
                      key={note.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJumpToTimestamp(note.timestampSeconds, note.noteText);
                      }}
                      style={{ left: `${notePercent}%` }}
                      className="absolute -top-1.5 -translate-x-1/2 w-3 h-4 bg-amber-400 hover:bg-amber-300 border border-slate-950 rounded-sm shadow-lg hover:scale-130 transition-transform z-20 cursor-pointer flex items-center justify-center pointer-events-auto group/pin"
                      title={`علامة مرجعية: الدقيقة ${formatTime(note.timestampSeconds)} (انقر للقفز إليها)`}
                    >
                      <div className="w-0.5 h-2 bg-slate-950 rounded-full" />
                      {/* Floating tooltip */}
                      <div className="absolute bottom-full mb-1.5 hidden group-hover/pin:flex flex-col items-center bg-slate-950 text-white text-[10px] py-1 px-2.5 rounded-lg shadow-2xl border border-amber-500/50 whitespace-nowrap z-50 pointer-events-none">
                        <span className="font-mono text-amber-400 font-black flex items-center gap-1">
                          <span>⏱️</span>
                          <span>الدقيقة {formatTime(note.timestampSeconds)}</span>
                        </span>
                        <span className="max-w-[130px] truncate text-slate-300 text-[9px]">
                          {note.noteText}
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>

            <span className="text-[11px] font-mono text-slate-400 min-w-[40px] text-center">
              {formatTime(duration)}
            </span>
          </div>

          {/* Control Buttons Bar */}
          <div className="flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-2.5">
              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black transition-transform active:scale-95 cursor-pointer"
                title={isPlaying ? 'إيقاف مؤقت (المسافة)' : 'تشغيل (المسافة)'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
              </button>

              {/* Rewind 10s */}
              <button
                onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold cursor-pointer border border-slate-800 flex items-center gap-1 active:scale-95 transition-all"
                title="رجوع 10 ثوان (السهم الأيسر)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono font-bold hidden sm:inline">10-</span>
              </button>

              {/* Forward 10s */}
              <button
                onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold cursor-pointer border border-slate-800 flex items-center gap-1 active:scale-95 transition-all"
                title="تقديم 10 ثوان (السهم الأيمن)"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono font-bold hidden sm:inline">10+</span>
              </button>

              {/* GRADUAL VOLUME CONTROLLER WITH DYNAMIC SOUND BARS & ICON */}
              <div
                className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl group/volume relative"
                title={`مستوى الصوت: ${effectiveVolume}% (انقر للتبديل أو اسحب لتعديل الدرجة)`}
              >
                {/* Dynamic Sound Icon */}
                <button
                  onClick={toggleMute}
                  className="text-slate-300 hover:text-cyan-400 transition-transform active:scale-90 cursor-pointer flex items-center justify-center"
                  title={isMuted || effectiveVolume === 0 ? 'إلغاء الكتم' : 'كتم الصوت'}
                >
                  {renderSoundIcon()}
                </button>

                {/* Gradual 5-Segment Sound Bars */}
                <div className="flex items-end gap-1 h-5 px-1 py-0.5 cursor-pointer">
                  {soundBars.map((bar, idx) => {
                    const isBarFilled = !isMuted && effectiveVolume >= bar.threshold;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleVolumeChange(bar.stepVal)}
                        style={{ height: `${bar.height}px` }}
                        className={`w-1.5 rounded-full transition-all duration-150 cursor-pointer ${
                          isBarFilled
                            ? 'bg-gradient-to-t from-cyan-500 to-teal-400 shadow-sm shadow-cyan-500/50 scale-y-105'
                            : 'bg-slate-700/60 hover:bg-slate-600 opacity-40'
                        }`}
                        title={`ضبط الصوت إلى ${bar.stepVal}%`}
                      />
                    );
                  })}
                </div>

                {/* Smooth Gradual Slider */}
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={effectiveVolume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  dir="ltr"
                  style={{
                    background: `linear-gradient(to right, #06b6d4 0%, #22d3ee ${effectiveVolume}%, #334155 ${effectiveVolume}%, #334155 100%)`,
                  }}
                  className="w-14 sm:w-16 h-1.5 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />

                {/* Live Volume Percentage / Muted Indicator */}
                <span className="text-[10px] font-mono font-bold min-w-[28px] text-center text-slate-400">
                  {isMuted || effectiveVolume === 0 ? (
                    <span className="text-rose-400 font-black">X</span>
                  ) : (
                    `${effectiveVolume}%`
                  )}
                </span>
              </div>

              {/* Time readout */}
              <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-300">
                <span>{formatTime(effectiveCurrentTime)}</span>
                <span className="text-slate-500">/</span>
                <span className="text-slate-400">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Side Quality, Speed, Bookmark & Fullscreen Controls */}
            <div className="flex items-center gap-2">
              {/* Quick Bookmark Moment Button */}
              <button
                onClick={handleQuickBookmark}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-amber-200 font-black text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm shadow-amber-500/10"
                title={`حفظ هذه الدقيقة (${formatTime(effectiveCurrentTime)}) كعلامة مرجعية للرجوع إليها لاحقاً (اختصار: B)`}
              >
                <Bookmark className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="hidden md:inline">حفظ الدقيقة</span>
                <span className="text-[10px] font-mono font-bold text-amber-300">
                  {formatTime(effectiveCurrentTime)}
                </span>
              </button>

              {/* Playback Speed Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSpeedMenu(!showSpeedMenu);
                    setShowQualityMenu(false);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>{playbackSpeed}x</span>
                </button>

                {showSpeedMenu && (
                  <div className="absolute bottom-10 right-0 w-24 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1 z-50 flex flex-col gap-0.5 animate-in fade-in">
                    {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => handleSpeedChange(spd)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold text-right transition-colors cursor-pointer ${
                          playbackSpeed === spd ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {spd === 1 ? 'عادي (1x)' : `${spd}x`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Quality Selector Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowQualityMenu(!showQualityMenu);
                    setShowSpeedMenu(false);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Settings className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="uppercase">{videoQuality === 'auto' ? 'تلقائي' : videoQuality}</span>
                </button>

                {showQualityMenu && (
                  <div className="absolute bottom-10 right-0 w-32 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1 z-50 flex flex-col gap-0.5 animate-in fade-in">
                    {[
                      { key: 'auto', label: 'تلقائي (Auto)' },
                      { key: 'hd1080', label: '1080p HD' },
                      { key: 'hd720', label: '720p HD' },
                      { key: 'large', label: '480p' },
                      { key: 'medium', label: '360p' },
                    ].map((q) => (
                      <button
                        key={q.key}
                        onClick={() => handleQualityChange(q.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold text-right transition-colors cursor-pointer ${
                          videoQuality === q.key ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Full Screen Toggle */}
              <button
                onClick={toggleFullScreen}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
                title={isFullScreen ? 'تصغير' : 'ملء الشاشة'}
              >
                {isFullScreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Details & Study Workstation */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        {/* Header Title & Action Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
                {course.subject || 'المادة الدراسية'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {course.gradeLevel || 'المرحلة الثانوية'}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
              {lesson.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">
              {course.title} • مدة المحاضرة: {displayDurationText}
            </p>
          </div>

          {/* Action Button: Confirm completion and return to course */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleConfirmCompletion}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2.5 cursor-pointer active:scale-95"
              title="تأكيد إنهاء المحاضرة والعودة لصفحة الكورس"
            >
              <CheckCircle className="w-5 h-5" />
              <span>تأكيد إكمال المحاضرة</span>
            </button>
          </div>
        </div>

        {/* Interactive Tabs Header (Notes & Teacher Discussions Only) */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Pin className="w-4 h-4 text-amber-500" />
            <span>بطاقات الملاحظات الملونة ({currentLessonNotes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ask')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'ask'
                ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-sky-500" />
            <span>اسأل المعلم سؤالاً ({currentLessonQuestions.length})</span>
          </button>
        </div>

        {/* TAB 1: STICKY SQUARE SKETCH NOTES & BOOKMARKS */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            {/* Quick Bookmarked Minutes Bar (One-click Instant Jump to any saved minute) */}
            {currentLessonNotes.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-black text-amber-900 dark:text-amber-300">
                      العلامات المرجعية والدقائق المحفوظة ({currentLessonNotes.length}):
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold hidden sm:inline">
                    انقر على أي دقيقة للرجوع وتشغيل الفيديو فوراً 🎬
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {currentLessonNotes.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleJumpToTimestamp(n.timestampSeconds, n.noteText)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/30 text-slate-800 dark:text-slate-200 text-xs font-bold whitespace-nowrap transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 group/chip shrink-0"
                      title={`القفز إلى الدقيقة ${formatTime(n.timestampSeconds)} - ${n.noteText}`}
                    >
                      <span className="font-mono text-amber-600 dark:text-amber-400 group-hover/chip:text-slate-950 font-black">
                        ⏱️ {formatTime(n.timestampSeconds)}
                      </span>
                      <span className="max-w-[120px] truncate text-[11px] font-normal opacity-80">
                        {n.noteText}
                      </span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={handleQuickBookmark}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 font-black text-xs whitespace-nowrap transition-all shadow-sm flex items-center gap-1 cursor-pointer shrink-0 active:scale-95"
                    title="حفظ الدقيقة الحالية كعلامة جديدة"
                  >
                    <span>+ حفظ الدقيقة {formatTime(currentTime)}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Create Note Box */}
            <form onSubmit={handleAddNote} className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    تسجيل ملاحظة / علامة مرجعية جديدة عند:
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-mono text-xs font-black border border-cyan-500/30">
                    ⏱️ {formatTime(currentTime)}
                  </span>
                </div>

                {/* Color Picker selection */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">اختر لون البطاقة:</span>
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedNoteColor(c)}
                      style={{ backgroundColor: NOTE_COLOR_STYLES[c].accent }}
                      className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                        selectedNoteColor === c ? 'scale-125 ring-2 ring-white dark:ring-slate-950 shadow-md' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="اكتب فكرة سريعة، قانون مهم، أو تذكرة تريد مراجعتها قبل الامتحان..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:border-amber-500 focus:outline-none shadow-sm"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shrink-0 transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Pin className="w-4 h-4" />
                  <span>تثبيت الملاحظة</span>
                </button>
              </div>
            </form>

            {/* Notes Grid (Square Colored Sketch Notes) */}
            {currentLessonNotes.length === 0 ? (
              <div className="p-10 text-center rounded-3xl bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800">
                <Bookmark className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">لا توجد ملاحظات أو علامات مرجعية بعد</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  قم بتثبيت أي دقيقة أثناء مشاهدة الفيديو للرجوع إليها لاحقاً بنقرة زر واحدة أو اضغط على (حفظ الدقيقة) في شريط التحكم!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentLessonNotes.map((note, index) => {
                  const colorKey = (note.color || COLOR_OPTIONS[index % COLOR_OPTIONS.length]) as NonNullable<
                    StudentNote['color']
                  >;
                  const styles = NOTE_COLOR_STYLES[colorKey] || NOTE_COLOR_STYLES.amber;
                  const isEditing = editingNoteId === note.id;

                  return (
                    <div
                      key={note.id}
                      className={`relative p-5 rounded-2xl border-2 transition-all shadow-md flex flex-col justify-between group ${styles.card} min-h-[170px]`}
                    >
                      {/* Top Pin / Sticky Marker */}
                      <div className="flex items-center justify-between mb-3">
                        <button
                          type="button"
                          onClick={() => handleJumpToTimestamp(note.timestampSeconds, note.noteText)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-black border flex items-center gap-1 cursor-pointer hover:scale-105 transition-transform ${styles.badge}`}
                          title="الرجوع إلى هذه الدقيقة وتشغيل الفيديو فوراً"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>الدقيقة {formatTime(note.timestampSeconds)}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {!isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEditNote(note)}
                                className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                title="تعديل الملاحظة"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteStudentNote(note.id)}
                                className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                                title="حذف الملاحظة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleSaveEditNote(note.id)}
                                className="p-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors cursor-pointer"
                                title="حفظ التعديل"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEditNote}
                                className="p-1 rounded-lg bg-slate-400 text-white hover:bg-slate-500 transition-colors cursor-pointer"
                                title="إلغاء"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content or Edit Textarea */}
                      {isEditing ? (
                        <div className="space-y-2 my-1">
                          <textarea
                            rows={3}
                            value={editingNoteText}
                            onChange={(e) => setEditingNoteText(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none resize-none"
                          />
                          <div className="flex items-center gap-1 pt-1">
                            {COLOR_OPTIONS.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setEditingNoteColor(c)}
                                style={{ backgroundColor: NOTE_COLOR_STYLES[c].accent }}
                                className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                                  editingNoteColor === c ? 'scale-125 ring-2 ring-black dark:ring-white' : 'opacity-60'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm font-bold leading-relaxed whitespace-pre-wrap flex-1 my-1">
                          {note.noteText}
                        </p>
                      )}

                      {/* Footer Info with Direct Jump Action */}
                      <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px] opacity-85 font-semibold">
                        <button
                          type="button"
                          onClick={() => handleJumpToTimestamp(note.timestampSeconds, note.noteText)}
                          className="hover:underline text-cyan-800 dark:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>🎬 تشغيل من هذه اللحظة</span>
                        </button>
                        <span>{new Date(note.createdAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TWO-WAY INTERACTIVE Q&A (Ask Teacher) */}
        {activeTab === 'ask' && (
          <div className="space-y-6">
            {/* Ask Question Form */}
            <form onSubmit={handleAskQuestion} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-sky-500" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    طرح سؤال أو استفسار على المعلم
                  </h3>
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTimestamp}
                    onChange={(e) => setIncludeTimestamp(e.target.checked)}
                    className="rounded accent-sky-500 cursor-pointer"
                  />
                  <span>تضمين الدقيقة الحالية من الشرح (⏱️ {formatTime(currentTime)})</span>
                </label>
              </div>

              <textarea
                rows={3}
                required
                placeholder="اكتب سؤالك بالتفصيل هنا... سيصل مباشرة إلى لوحة تحكم المعلم ويظهر رده في هذه المحادثة فوراً."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:border-sky-500 focus:outline-none text-right shadow-inner"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  يصل السؤال باسمك: <span className="font-bold text-sky-600 dark:text-sky-400">{currentUser?.name || 'طالب مسجل'}</span>
                </span>

                <button
                  type="submit"
                  disabled={isSubmittingQuestion}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-sky-500/20"
                >
                  {isSubmittingQuestion ? (
                    <span>جارٍ الإرسال...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 rotate-180" />
                      <span>إرسال السؤال للمعلم</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Questions Thread List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-sky-500" />
                  <span>المناقشات والأسئلة المطروحة حول هذا الفيديو ({currentLessonQuestions.length})</span>
                </h4>
              </div>

              {currentLessonQuestions.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
                  <HelpCircle className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    لم يتم طرح أي أسئلة حول هذه المحاضرة بعد. كن أول من يسأل المعلم!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentLessonQuestions.map((q) => {
                    const isAnswered = q.status === 'answered';
                    const activeReplyText = replyInputs[q.id] || '';

                    return (
                      <div
                        key={q.id}
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                      >
                        {/* Question Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                q.studentAvatar ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                              }
                              alt={q.studentName}
                              className="w-9 h-9 rounded-xl object-cover border border-cyan-500/40"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-900 dark:text-white">
                                  {q.studentName}
                                </span>
                                {q.studentCode && (
                                  <span className="px-2 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
                                    {q.studentCode}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                {new Date(q.createdAt).toLocaleDateString('ar-EG')} • {new Date(q.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {q.timestampSeconds !== undefined && q.timestampSeconds > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleJumpToTimestamp(q.timestampSeconds || 0, q.questionText)
                                }
                                className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-mono text-[11px] font-bold border border-sky-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                                title="الانتقال إلى هذه الدقيقة وتشغيل الفيديو فوراً"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>الدقيقة {formatTime(q.timestampSeconds)}</span>
                              </button>
                            )}

                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${
                                isAnswered
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                              }`}
                            >
                              {isAnswered ? 'تم رد المعلم 👨‍🏫' : 'بانتظار رد المعلم ⏳'}
                            </span>
                          </div>
                        </div>

                        {/* Question Text */}
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                          {q.questionText}
                        </div>

                        {/* Replies Thread History */}
                        {q.replies && q.replies.length > 0 && (
                          <div className="space-y-2.5 pr-3 sm:pr-6 border-r-2 border-cyan-500/30">
                            {q.replies.map((rep) => {
                              const isTeacherReply = rep.authorRole === 'teacher' || rep.authorRole === 'super_admin';

                              return (
                                <div
                                  key={rep.id}
                                  className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                                    isTeacherReply
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/50 text-emerald-950 dark:text-emerald-100 shadow-sm'
                                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {isTeacherReply ? (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center gap-1">
                                          <UserCheck className="w-3 h-3" />
                                          <span>رد المعلم الرسمي 👨‍🏫</span>
                                        </span>
                                      ) : (
                                        <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                                          {rep.authorName}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {new Date(rep.createdAt).toLocaleTimeString('ar-EG', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>
                                  <p className="font-semibold leading-relaxed whitespace-pre-wrap">
                                    {rep.message}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Reply Input Form inside Thread */}
                        <div className="pt-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="اكتب ردك أو استفسار متابعة للمعلم..."
                              value={activeReplyText}
                              onChange={(e) =>
                                setReplyInputs((prev) => ({ ...prev, [q.id]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSendReply(q.id);
                                }
                              }}
                              className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:border-sky-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSendReply(q.id)}
                              disabled={!activeReplyText.trim()}
                              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <CornerDownLeft className="w-3.5 h-3.5" />
                              <span>إرسال الرد</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

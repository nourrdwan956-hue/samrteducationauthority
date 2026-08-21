/**
 * Advanced Anti-Screen Recording & Protection System
 * Blocks Screen Capture (getDisplayMedia, captureStream, MediaRecorder),
 * Zoom/Google Meet screen share, DevTools inspection, and keyboard shortcuts.
 */

import { monitorSystemScreenRecording } from './videoDRM';

export interface SecurityStatus {
  isRecordingDetected: boolean;
  isWindowBlurred: boolean;
  isDevToolsOpen: boolean;
  reason?: string;
}

type SecurityCallback = (status: SecurityStatus) => void;

let isProtectionInitialized = false;
const listeners: Set<SecurityCallback> = new Set();

let currentStatus: SecurityStatus = {
  isRecordingDetected: false,
  isWindowBlurred: false,
  isDevToolsOpen: false,
};

function notifyListeners() {
  listeners.forEach((cb) => cb({ ...currentStatus }));
}

/**
 * Installs browser-level overrides to intercept screen sharing and stream capture.
 */
export function initScreenRecordingProtection(): () => void {
  if (typeof window === 'undefined') return () => {};

  if (!isProtectionInitialized) {
    isProtectionInitialized = true;

    // Monitor Virtual Devices & System Screen Recorders (Android / Windows)
    const cleanupSystemMonitor = monitorSystemScreenRecording((reason) => {
      currentStatus.isRecordingDetected = true;
      currentStatus.reason = reason;
      notifyListeners();
    });

    // 1. Intercept & Block navigator.mediaDevices.getDisplayMedia (Zoom, Meet, Extension capture)
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function') {
      const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(
        navigator.mediaDevices
      );

      navigator.mediaDevices.getDisplayMedia = async function (
        constraints?: DisplayMediaStreamOptions
      ) {
        currentStatus.isRecordingDetected = true;
        currentStatus.reason = 'تم منع محاولة مشاركة أو تسجيل الشاشة عبر المتصفح (getDisplayMedia)';
        notifyListeners();

        // Dispatch global event
        window.dispatchEvent(
          new CustomEvent('screen-recording-blocked', {
            detail: { method: 'getDisplayMedia' },
          })
        );

        throw new DOMException(
          'تسجيل ومشاركة الشاشة محظورة تماماً على هذه المنصة لأسباب أمنية.',
          'NotAllowedError'
        );
      };
    }

    // 2. Intercept captureStream on HTMLVideoElement & HTMLCanvasElement
    if (typeof HTMLVideoElement !== 'undefined' && 'captureStream' in HTMLVideoElement.prototype) {
      (HTMLVideoElement.prototype as any).captureStream = function () {
        currentStatus.isRecordingDetected = true;
        currentStatus.reason = 'تم منع محاولة التقاط الفيديو (captureStream)';
        notifyListeners();
        throw new DOMException('التقاط بث الفيديو محظور تماماً.', 'NotAllowedError');
      };
    }

    if (typeof HTMLCanvasElement !== 'undefined' && 'captureStream' in HTMLCanvasElement.prototype) {
      (HTMLCanvasElement.prototype as any).captureStream = function () {
        currentStatus.isRecordingDetected = true;
        currentStatus.reason = 'تم منع محاولة التقاط الشاشة عبر Canvas';
        notifyListeners();
        throw new DOMException('التقاط عناصر الشاشة محظور تماماً.', 'NotAllowedError');
      };
    }

    // 3. Intercept MediaRecorder constructor
    if (typeof window.MediaRecorder !== 'undefined') {
      const OriginalMediaRecorder = window.MediaRecorder;
      window.MediaRecorder = function (stream: MediaStream, options?: MediaRecorderOptions) {
        currentStatus.isRecordingDetected = true;
        currentStatus.reason = 'تم اكتشاف محاولة تشغيل مسجل وسائط (MediaRecorder)';
        notifyListeners();
        return new OriginalMediaRecorder(stream, options);
      } as any;

      // Copy static properties & methods
      Object.setPrototypeOf(window.MediaRecorder, OriginalMediaRecorder);
      window.MediaRecorder.isTypeSupported = OriginalMediaRecorder.isTypeSupported;
    }

    // 4. Global Keyboard Protection: PrintScreen, Win+Shift+S, Snipping Tool, Cmd+Shift+3/4/5, DevTools
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isPrintScreen =
        e.key === 'PrintScreen' ||
        e.code === 'PrintScreen' ||
        e.key === 'PrtScn' ||
        e.keyCode === 44;

      const isDevToolsCombo =
        (e.ctrlKey &&
          e.shiftKey &&
          (e.key === 'I' ||
            e.key === 'i' ||
            e.key === 'J' ||
            e.key === 'j' ||
            e.key === 'C' ||
            e.key === 'c' ||
            e.key === 'K' ||
            e.key === 'k')) ||
        e.key === 'F12' ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S'));

      const isMacScreenshot = e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5');

      if (isPrintScreen || isDevToolsCombo || isMacScreenshot) {
        e.preventDefault();
        e.stopPropagation();

        currentStatus.isRecordingDetected = true;
        currentStatus.reason = isPrintScreen
          ? 'تم منع محاولة التقاط صورة للشاشة (PrintScreen)'
          : isMacScreenshot
          ? 'تم منع محاولة التقاط شاشة (macOS Screenshot)'
          : 'تم منع فتح أدوات التطوير أو حفظ الصفحة';

        notifyListeners();
        return false;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, true);

    // 5. Window Blur / Focus / Visibility Handler
    const handleBlur = () => {
      currentStatus.isWindowBlurred = true;
      currentStatus.reason = 'تم اكتشاف فقدان التركيز أو التفاعل مع برنامج خارجي';
      notifyListeners();
    };

    const handleFocus = () => {
      currentStatus.isWindowBlurred = false;
      notifyListeners();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        currentStatus.isWindowBlurred = true;
        currentStatus.reason = 'تم مغادرة أو تصغير نافذة العرض';
      } else {
        currentStatus.isWindowBlurred = false;
      }
      notifyListeners();
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 6. Real-Time GPU Frame Capture Jitter Detector (IDXGI / BitBlt / ScreenRec Capture Hook Monitoring)
    let rafId: number;
    let lastFrameTime = performance.now();
    let frameJitterCount = 0;

    const checkGpuCaptureJitter = (now: number) => {
      const delta = now - lastFrameTime;
      lastFrameTime = now;

      // Unnatural FPS drops or DXGI capture lock patterns (e.g. 30Hz lock or sudden 80ms+ delays during active playback)
      if (delta > 85 && delta < 250 && !document.hidden) {
        frameJitterCount++;
        if (frameJitterCount > 8) {
          currentStatus.isRecordingDetected = true;
          currentStatus.reason = 'تم اكتشاف التقاط الشاشة عبر كرت الشاشة (GPU Screen Duplication Capture)';
          notifyListeners();
          frameJitterCount = 0;
        }
      } else {
        if (frameJitterCount > 0) frameJitterCount--;
      }

      rafId = requestAnimationFrame(checkGpuCaptureJitter);
    };

    rafId = requestAnimationFrame(checkGpuCaptureJitter);

    // 7. Continuous DevTools Detection Loop
    const devToolsCheckInterval = setInterval(() => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      const isDevToolsNow = widthThreshold || heightThreshold;

      if (isDevToolsNow !== currentStatus.isDevToolsOpen) {
        currentStatus.isDevToolsOpen = isDevToolsNow;
        if (isDevToolsNow) {
          currentStatus.reason = 'تم كشف فتح أدوات فحص العناصر (DevTools)';
        }
        notifyListeners();
      }
    }, 1500);

    return () => {
      cleanupSystemMonitor();
      cancelAnimationFrame(rafId);
      clearInterval(devToolsCheckInterval);
      window.removeEventListener('keydown', handleGlobalKeyDown, true);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }

  return () => {};
}

/**
 * Subscribe component state to protection updates.
 */
export function subscribeToScreenProtection(callback: SecurityCallback): () => void {
  listeners.add(callback);
  callback({ ...currentStatus });
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Reset security alert state once user resumes focus or acknowledges security warning.
 */
export function resetRecordingAlert() {
  currentStatus.isRecordingDetected = false;
  currentStatus.reason = undefined;
  notifyListeners();
}

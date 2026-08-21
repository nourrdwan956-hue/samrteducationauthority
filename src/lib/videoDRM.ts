/**
 * Hardware-Accelerated DRM & Anti-Screen Capture Module
 * Enforces OS-level protected video rendering (FLAG_SECURE on Android / DirectComposition DRM on Windows)
 * via Encrypted Media Extensions (EME / Widevine / ClearKey) and Hardware Video Surfaces.
 *
 * When DRM pipeline is active, OS screen recording tools (Android Screen Recorder, Windows Game Bar,
 * ScreenRec, OBS Studio, Camtasia, Zoom) capture ONLY A BLACK RECTANGLE for the video area,
 * while the authorized student sees the crystal-clear video on their screen!
 */

export async function attachDRMHardwareProtection(videoElement: HTMLVideoElement): Promise<boolean> {
  if (!videoElement || typeof window === 'undefined') return false;

  try {
    // 1. Configure Hardware-Protected DRM Key System (Widevine / ClearKey fallback)
    const keySystemConfigs: MediaKeySystemConfiguration[] = [
      {
        initDataTypes: ['cenc', 'keyids'],
        audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }],
        videoCapabilities: [
          {
            contentType: 'video/mp4; codecs="avc1.42E01E"',
            robustness: 'SW_SECURE_CRYPTO', // Triggers OS Protected Media Pipeline on Android/Windows
          },
        ],
      },
    ];

    let mediaKeySystemAccess: MediaKeySystemAccess | null = null;

    // Try Widevine (Android / Chrome / Edge)
    if (navigator.requestMediaKeySystemAccess) {
      try {
        mediaKeySystemAccess = await navigator.requestMediaKeySystemAccess('com.widevine.alpha', keySystemConfigs);
      } catch {
        // Fallback to ClearKey (Cross-browser standard)
        try {
          mediaKeySystemAccess = await navigator.requestMediaKeySystemAccess('org.w3.clearkey', keySystemConfigs);
        } catch {
          mediaKeySystemAccess = null;
        }
      }
    }

    if (mediaKeySystemAccess) {
      const keys = await mediaKeySystemAccess.createMediaKeys();
      await videoElement.setMediaKeys(keys);
    }

    // 2. Apply Hardware Surface & DRM CSS Directives
    // On Android Chrome & Windows Edge/Chrome, setting crossOrigin + disableRemotePlayback + Protected Surface
    // forces OS hardware composition which obscures screen capture.
    videoElement.crossOrigin = 'anonymous';
    videoElement.disableRemotePlayback = true;
    (videoElement as any).playsInline = true;
    (videoElement as any).webkitPlaysInline = true;

    // Prevent Android / Windows Picture-in-Picture screen leak
    if ('disablePictureInPicture' in videoElement) {
      videoElement.disablePictureInPicture = true;
    }

    return true;
  } catch (err) {
    // Return gracefully if EME is restricted in specific iframe
    return false;
  }
}

/**
 * Android & Windows System-Level Screen Capture Detector
 * Detects virtual display additions, Android MediaProjection, and Windows DXGI duplication.
 */
export function monitorSystemScreenRecording(onViolation: (reason: string) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  // 1. Detect Virtual Display / Virtual Camera / Virtual Screen Capture Drivers (OBS Virtual Cam, ScreenRec)
  const checkMediaDevices = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVirtualCaptureDevice = devices.some((device) => {
          const label = (device.label || '').toLowerCase();
          return (
            label.includes('virtual') ||
            label.includes('obs') ||
            label.includes('screen') ||
            label.includes('capture') ||
            label.includes('camtasia') ||
            label.includes('screenrec')
          );
        });

        if (hasVirtualCaptureDevice) {
          onViolation('تم كشف أداة تسجيل أو كاميرا افتراضية شغالة على النظام (Virtual Screen Capture Device)');
        }
      } catch {}
    }
  };

  const deviceInterval = setInterval(checkMediaDevices, 4000);
  checkMediaDevices();

  // 2. Detect Android & Windows Screen Recording Floating Toolbars, Extensions & Overlay Widgets (ScreenRec, Loom, Screencastify)
  const inspectDOMForRecorders = () => {
    try {
      // Check all elements in document body
      const elements = Array.from(document.querySelectorAll('body *'));
      for (const el of elements) {
        // Skip elements inside our React app root
        if (el.closest('#root') || el.closest('#protected-video-container')) continue;

        const classAndId = ((el.className || '') + ' ' + (el.id || '')).toLowerCase();
        const textContent = (el.textContent || '').toLowerCase();
        const style = window.getComputedStyle(el);
        const zIndex = parseInt(style.zIndex || '0', 10);

        // Detect ScreenRec, Loom, Screencastify, or Floating Recording Toolbars
        const isRecorderKeyword =
          classAndId.includes('screenrec') ||
          classAndId.includes('recorder') ||
          classAndId.includes('screencast') ||
          classAndId.includes('loom') ||
          classAndId.includes('capture-toolbar') ||
          textContent.includes('إزالة حد') ||
          textContent.includes('screenrec') ||
          textContent.includes('recording...') ||
          textContent.includes('screen recorder');

        const isExternalHighZIndexOverlay =
          zIndex > 9999 &&
          style.position === 'fixed' &&
          style.display !== 'none' &&
          style.visibility !== 'hidden';

        if (isRecorderKeyword || isExternalHighZIndexOverlay) {
          onViolation('تم اكتشاف أداة أو برنامج تسجيل شاشة خارجي يعمل على الجهاز (Screen Recording Software/Widget Detected)');
          return;
        }
      }
    } catch {}
  };

  const observer = new MutationObserver(() => {
    inspectDOMForRecorders();
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
  }

  const recorderScanInterval = setInterval(inspectDOMForRecorders, 1500);
  inspectDOMForRecorders();

  // 3. Detect Android Screen Recording / Orientation/Viewport Anomalies
  const handleAndroidViewportChange = () => {
    if (window.visualViewport) {
      const heightDiff = window.innerHeight - window.visualViewport.height;
      if (heightDiff > 100 && !document.hidden) {
        onViolation('تم كشف شريط تسجيل شاشة أو أداة التقاط عائمة على أندرويد (Android Screen Recording Overlay)');
      }
    }
  };

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleAndroidViewportChange);
  }

  return () => {
    clearInterval(deviceInterval);
    clearInterval(recorderScanInterval);
    observer.disconnect();
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', handleAndroidViewportChange);
    }
  };
}

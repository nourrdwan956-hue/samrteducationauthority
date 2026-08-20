import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

export interface DeviceInfo {
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  orientation: Orientation;
  width: number;
  height: number;
  isSmallScreen: boolean; // < 640px
  isMediumScreen: boolean; // 640px - 1024px
  isLargeScreen: boolean; // > 1024px
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        deviceType: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
        orientation: 'landscape',
        width: 1280,
        height: 800,
        isSmallScreen: false,
        isMediumScreen: false,
        isLargeScreen: true,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as unknown as { msMaxTouchPoints?: number }).msMaxTouchPoints! > 0;

    let deviceType: DeviceType = 'desktop';
    if (width < 768) {
      deviceType = 'mobile';
    } else if (width < 1024) {
      deviceType = 'tablet';
    } else {
      deviceType = 'desktop';
    }

    return {
      deviceType,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
      isTouchDevice: isTouch,
      orientation: width > height ? 'landscape' : 'portrait',
      width,
      height,
      isSmallScreen: width < 640,
      isMediumScreen: width >= 640 && width < 1024,
      isLargeScreen: width >= 1024,
    };
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isTouch =
          'ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          (navigator as unknown as { msMaxTouchPoints?: number }).msMaxTouchPoints! > 0;

        let deviceType: DeviceType = 'desktop';
        if (width < 768) {
          deviceType = 'mobile';
        } else if (width < 1024) {
          deviceType = 'tablet';
        } else {
          deviceType = 'desktop';
        }

        setDeviceInfo({
          deviceType,
          isMobile: deviceType === 'mobile',
          isTablet: deviceType === 'tablet',
          isDesktop: deviceType === 'desktop',
          isTouchDevice: isTouch,
          orientation: width > height ? 'landscape' : 'portrait',
          width,
          height,
          isSmallScreen: width < 640,
          isMediumScreen: width >= 640 && width < 1024,
          isLargeScreen: width >= 1024,
        });
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return deviceInfo;
}

export interface DeviceDetails {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  userAgent: string;
}

export function detectCurrentDevice(): DeviceDetails {
  let deviceId = localStorage.getItem('sea_device_id');
  if (!deviceId) {
    deviceId = `DEV-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    localStorage.setItem('sea_device_id', deviceId);
  }

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  
  // OS Detection
  let os = 'نظام غير معروف';
  if (/windows/i.test(ua)) os = 'Windows PC';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS (Apple)';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS (iPhone / iPad)';
  else if (/linux/i.test(ua)) os = 'Linux';

  // Browser Detection
  let browser = 'متصفح ويب';
  if (/edg/i.test(ua)) browser = 'Microsoft Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Google Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Apple Safari';
  else if (/opr\//i.test(ua)) browser = 'Opera';

  // Device Type
  let type: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (/tablet|ipad/i.test(ua)) {
    type = 'tablet';
  } else if (/mobile|iphone|android/i.test(ua)) {
    type = 'mobile';
  }

  const name = `${os} • ${browser}`;

  return {
    id: deviceId,
    name,
    type,
    browser,
    os,
    userAgent: ua,
  };
}

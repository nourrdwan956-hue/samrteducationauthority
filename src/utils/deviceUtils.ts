import { User } from '../types';

export interface ComprehensiveDeviceInfo {
  id: string;
  fingerprint: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  userAgent: string;
  screenResolution: string;
  language: string;
  timeZone: string;
  registeredAt: string;
}

/**
 * Computes a deterministic pseudo-hash string from device attributes
 */
function computeDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'DEV-SERVER-NODE';
  const nav = window.navigator;
  const screen = window.screen;

  const rawAttributes = [
    nav.userAgent || '',
    nav.language || '',
    (nav.languages || []).join(','),
    screen.width + 'x' + screen.height + 'x' + (screen.colorDepth || 24),
    nav.hardwareConcurrency || 4,
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    'touch:' + (Boolean(nav.maxTouchPoints && nav.maxTouchPoints > 0)),
  ].join('###');

  let hash = 0;
  for (let i = 0; i < rawAttributes.length; i++) {
    const char = rawAttributes.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const cleanHex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `FP-${cleanHex}`;
}

export function detectCurrentDevice(): ComprehensiveDeviceInfo {
  let deviceId = '';
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      deviceId = localStorage.getItem('sea_device_uuid') || localStorage.getItem('sea_device_id') || '';
      if (!deviceId) {
        deviceId = `DEV-SEA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        localStorage.setItem('sea_device_uuid', deviceId);
        localStorage.setItem('sea_device_id', deviceId);
      }
    } catch (e) {
      deviceId = `DEV-SEA-TEMP-${Date.now().toString(36).toUpperCase()}`;
    }
  } else {
    deviceId = `DEV-SEA-STATIC-${Date.now()}`;
  }

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const fingerprint = computeDeviceFingerprint();

  // OS Detection
  let os = 'نظام غير محدد';
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

  const screenRes = typeof window !== 'undefined' && window.screen
    ? `${window.screen.width}x${window.screen.height}`
    : '1920x1080';

  const timeZone = typeof Intl !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Cairo'
    : 'Africa/Cairo';

  const language = typeof navigator !== 'undefined' ? navigator.language : 'ar-EG';

  const name = `${os} • ${browser}`;

  return {
    id: deviceId,
    fingerprint,
    name,
    type,
    browser,
    os,
    userAgent: ua,
    screenResolution: screenRes,
    language,
    timeZone,
    registeredAt: new Date().toISOString(),
  };
}

/**
 * Check if the device is currently restricted from creating a new registration
 * Rule: No device can register with more than one email until the first email/account is accepted/activated by admin.
 */
export function checkDeviceRegistrationStatus(
  currentDeviceId: string,
  currentFingerprint: string,
  newEmail: string,
  userProfiles: User[]
): {
  allowed: boolean;
  blockedReason?: string;
  pendingAccount?: {
    email: string;
    name: string;
    studentCode?: string;
    registeredAt?: string;
  };
} {
  const cleanNewEmail = newEmail.trim().toLowerCase();

  // Find if there is an existing student user on this device
  const existingPendingOnDevice = userProfiles.find((u) => {
    if (u.role !== 'student') return false;
    const isSameDevice =
      (u.primaryDeviceId && u.primaryDeviceId === currentDeviceId) ||
      (u.deviceFingerprint && u.deviceFingerprint === currentFingerprint);

    const isDifferentEmail = u.email.trim().toLowerCase() !== cleanNewEmail;
    const isPending =
      u.accountStatus === 'pending_review' ||
      u.accountStatus === 'pending_verification';

    return isSameDevice && isDifferentEmail && isPending;
  });

  if (existingPendingOnDevice) {
    const pendingName = existingPendingOnDevice.fourPartName || existingPendingOnDevice.name;
    const pendingEmail = existingPendingOnDevice.email;
    const pendingCode = existingPendingOnDevice.officialStudentId || existingPendingOnDevice.studentCode || '';

    return {
      allowed: false,
      blockedReason: `تنبيه أمني مشدد: يوجد طلب تسجيل سابق تم إرساله من هذا الجهاز للطالب (${pendingName} - ${pendingEmail}) وما زال قيد المراجعة والتدقيق الإداري. تنص لوائح المنظومة على منع تسجيل أي حساب جديد أو بريد إلكتروني إضافي من نفس الجهاز حتى يتم قبول واعتماد الحساب الأول رسمياً من قبل إدارة المنظومة.`,
      pendingAccount: {
        email: pendingEmail,
        name: pendingName,
        studentCode: pendingCode,
        registeredAt: existingPendingOnDevice.createdAt,
      },
    };
  }

  return { allowed: true };
}

/**
 * Check if a candidate password is already in use by any other student in the database
 */
export function isPasswordAlreadyUsed(
  candidatePassword: string,
  userProfiles: User[],
  currentUserId?: string
): boolean {
  const cleanPass = candidatePassword.trim();
  if (!cleanPass || cleanPass.length < 4) return false;

  return userProfiles.some((u) => {
    if (currentUserId && u.id === currentUserId) return false;
    const userPass = (u.plainPassword || u.password || '').trim();
    return userPass === cleanPass;
  });
}

/**
 * Generates an intelligent, high-entropy unique alternative password
 * derived from user's attempted password or name.
 */
export function generateUniquePasswordSuggestion(
  basePassword: string,
  studentName: string,
  userProfiles: User[]
): string {
  const cleanBase = basePassword.trim() || 'SeaStudent';
  const symbols = ['#', '@', '$', '!', '&', '_'];
  const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
  const random3Digits = Math.floor(100 + Math.random() * 900);
  const currentYear = new Date().getFullYear();

  // Try multiple permutations until finding one not in use
  const candidates: string[] = [
    `${cleanBase}${randomSymbol}${random3Digits}`,
    `${cleanBase}#${currentYear}!`,
    `${cleanBase}_${random3Digits}`,
    `Sea${randomSymbol}${cleanBase}${random3Digits}`,
  ];

  if (studentName) {
    const firstEnglishOrClean = studentName.trim().split(/\s+/)[0].replace(/[^a-zA-Z0-9\u0621-\u064A]/g, '');
    candidates.push(`${firstEnglishOrClean}${randomSymbol}${random3Digits}@${currentYear}`);
  }

  for (const cand of candidates) {
    if (!isPasswordAlreadyUsed(cand, userProfiles)) {
      return cand;
    }
  }

  // Fallback guaranteed unique
  return `${cleanBase}${randomSymbol}${Date.now().toString().slice(-4)}`;
}

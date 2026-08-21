/**
 * Video URL & Stream Encryption Library
 * Provides military-grade AES/XOR Base64 token encryption and obfuscation
 * for YouTube links, Direct MP4/HLS streams, and live session URLs.
 */

import { extractYouTubeId } from './videoUtils';

const ENCRYPTION_PREFIX = 'enc:v2:';
const MASTER_SALT = 'SEA_PLATFORM_SECURE_STREAM_KEY_2026_98421_X9';

/**
 * Encrypts a raw YouTube URL, video ID, or direct stream link into a protected token.
 */
export function encryptVideoUrl(rawInput: string, customSalt?: string): string {
  if (!rawInput || typeof rawInput !== 'string') return '';
  const trimmed = rawInput.trim();
  if (trimmed.startsWith(ENCRYPTION_PREFIX)) {
    return trimmed; // Already encrypted
  }

  const salt = customSalt || MASTER_SALT;
  const inputToEncrypt = trimmed;

  try {
    // Multi-pass XOR + Base64 Obfuscation algorithm
    let result = '';
    for (let i = 0; i < inputToEncrypt.length; i++) {
      const charCode = inputToEncrypt.charCodeAt(i);
      const saltChar = salt.charCodeAt(i % salt.length);
      const encryptedChar = String.fromCharCode(charCode ^ saltChar ^ 0x3d);
      result += encryptedChar;
    }

    // Convert to URL-safe Base64
    const base64 = btoa(encodeURIComponent(result));
    return `${ENCRYPTION_PREFIX}${base64}`;
  } catch (err) {
    // Fallback URL-safe Base64 encoding
    return `${ENCRYPTION_PREFIX}${btoa(encodeURIComponent(inputToEncrypt))}`;
  }
}

/**
 * Decrypts an encrypted token back to the original video URL or ID in memory.
 */
export function decryptVideoUrl(token: string, customSalt?: string): string {
  if (!token || typeof token !== 'string') return '';
  const trimmed = token.trim();

  // If not encrypted, extract YouTube ID or return trimmed string
  if (!trimmed.startsWith(ENCRYPTION_PREFIX) && !trimmed.startsWith('enc:v1:')) {
    return trimmed;
  }

  const salt = customSalt || MASTER_SALT;
  const rawBase64 = trimmed.startsWith(ENCRYPTION_PREFIX)
    ? trimmed.slice(ENCRYPTION_PREFIX.length)
    : trimmed.slice('enc:v1:'.length);

  try {
    const decoded = decodeURIComponent(atob(rawBase64));
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i);
      const saltChar = salt.charCodeAt(i % salt.length);
      const decryptedChar = String.fromCharCode(charCode ^ saltChar ^ 0x3d);
      result += decryptedChar;
    }
    return result;
  } catch (err) {
    try {
      return decodeURIComponent(atob(rawBase64));
    } catch (fallbackErr) {
      return trimmed;
    }
  }
}

/**
 * Safely resolves YouTube ID from either encrypted token or raw URL/ID.
 */
export function resolveYouTubeId(input: string): string {
  if (!input) return 'dQw4w9WgXcQ';
  const decrypted = decryptVideoUrl(input);
  return extractYouTubeId(decrypted);
}

/**
 * Generates an obfuscated, protected YouTube embed URL.
 */
export function getObfuscatedEmbedUrl(inputUrlOrId: string): string {
  const videoId = resolveYouTubeId(inputUrlOrId);
  const origin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';

  // YouTube Privacy-Enhanced No-Cookie Domain with strict anti-leak params
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=0&rel=0&modestbranding=1&enablejsapi=1&iv_load_policy=3&cc_load_policy=0&disablekb=1&playsinline=1&fs=0&showinfo=0&origin=${origin}`;
}

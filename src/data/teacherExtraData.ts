import { BankQuestion, Assignment, PrintedCodesBatch, CourseAccessCode } from '../types';

/**
 * Generate a cryptographically strong, non-guessable 16-character code
 * Format: XXXX-XXXX-XXXX-XXXX using unambiguous base32 uppercase characters
 */
export const generate16CharCode = (): string => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excludes 0, 1, I, O for optical clarity
  let raw = '';
  const randomValues = new Uint32Array(16);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < 16; i++) {
    raw += chars.charAt(randomValues[i] % chars.length);
  }
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}`;
};

export const INITIAL_BANK_QUESTIONS: BankQuestion[] = [];

export const INITIAL_ASSIGNMENTS: Assignment[] = [];

export const INITIAL_PRINTED_BATCHES: PrintedCodesBatch[] = [];

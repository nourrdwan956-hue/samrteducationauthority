/**
 * Language & Direction Utilities for SEA Platform
 * Ensures English questions, options, passages, and math/science expressions render LTR (Left-To-Right).
 */

export function isEnglishText(text?: string, subject?: string): boolean {
  if (subject && /english|إنجليزي|لغة إنجليزية|lang|ig_sat|sat|act|ielts|toefl/i.test(subject)) {
    return true;
  }
  if (!text) return false;

  // Remove numbers, punctuation, spaces
  const clean = text.replace(/[0-9\s\p{P}]/gu, '');
  if (!clean) return false;

  const arabicChars = (clean.match(/[\u0600-\u06FF]/g) || []).length;
  const englishChars = (clean.match(/[a-zA-Z]/g) || []).length;

  // If English character count exceeds Arabic character count
  return englishChars > arabicChars;
}

export function getQuestionLayoutProps(promptText?: string, subject?: string) {
  const isLtr = isEnglishText(promptText, subject);
  return {
    isLtr,
    dir: isLtr ? ('ltr' as const) : ('rtl' as const),
    textAlignClass: isLtr ? 'text-left' : 'text-right',
    flexDirectionClass: isLtr ? 'flex-row' : 'flex-row-reverse',
    badgePosClass: isLtr ? 'right-4' : 'left-4',
    alignSelfClass: isLtr ? 'items-start' : 'items-end',
    justifyClass: isLtr ? 'justify-start' : 'justify-end',
  };
}

export function getOptionPrefix(index: number, isLtr: boolean): string {
  if (isLtr) {
    return String.fromCharCode(65 + index); // A, B, C, D
  }
  // Arabic option letter prefixes (أ، ب، ج، د)
  const arabicLetters = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'];
  return arabicLetters[index] || String(index + 1);
}

/**
 * Extracts standard 11-character YouTube video ID from various YouTube URL formats or raw IDs.
 */
export function extractYouTubeId(input: string): string {
  if (!input) return 'dQw4w9WgXcQ';
  const trimmed = input.trim();

  // If it's already an 11-character video ID
  if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('.') && !trimmed.includes('?')) {
    return trimmed;
  }

  // Regex match for various youtube url formats (watch?v=, embed/, youtu.be/, shorts/, live/, etc.)
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|live\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);

  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }

  return trimmed;
}

export const AUTHOR_TIMEZONE = 'America/New_York';

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    timeZone: AUTHOR_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString('en-US', {
    timeZone: AUTHOR_TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDatetimeAttr(date: Date): string {
  return date.toLocaleDateString('sv-SE', { timeZone: AUTHOR_TIMEZONE });
}

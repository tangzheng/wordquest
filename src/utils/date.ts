/**
 * Get today's date as YYYY-MM-DD string
 */
export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Check if a date string is today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === todayStr();
}

/**
 * Check if a date string is yesterday
 */
export function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().split('T')[0];
}

/**
 * Check if a date string was N days before today
 */
export function isDaysBefore(dateStr: string, days: number): boolean {
  const target = new Date();
  target.setDate(target.getDate() - days);
  return dateStr === target.toISOString().split('T')[0];
}

/**
 * Add days to a date string
 */
export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

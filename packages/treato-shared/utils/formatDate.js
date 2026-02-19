/**
 * @treato/shared — Date Formatter
 *
 * Consistent date/time formatting across all apps.
 */

/**
 * Formats a date as a readable time string.
 * @example formatTime(new Date()) // "03:45 PM"
 */
export function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats a date as a short date string.
 * @example formatDate(new Date()) // "18 Feb"
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Formats a date as a full datetime string.
 * @example formatDateTime(new Date()) // "18 Feb, 03:45 PM"
 */
export function formatDateTime(date) {
  return `${formatDate(date)}, ${formatTime(date)}`;
}

/**
 * Returns a relative time label — "Today", "Yesterday", or the formatted date.
 * Useful for grouping order history.
 */
export function formatRelativeDate(date) {
  const d = new Date(date);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (d >= startOfToday) return 'Today';
  if (d >= startOfYesterday) return 'Yesterday';
  return formatDate(date);
}

/**
 * Returns the short weekday name for a date.
 * Used in weekly earnings bar charts.
 * @example formatWeekday(new Date()) // "Tue"
 */
export function formatWeekday(date) {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
}

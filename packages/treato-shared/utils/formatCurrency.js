/**
 * @treato/shared — Currency Formatter
 *
 * Formats a number as Indian Rupees. Consistent across all apps.
 *
 * @example
 * formatCurrency(1234.5)  // "₹1,234.50"
 * formatCurrency(40)      // "₹40.00"
 */
export function formatCurrency(amount, options = {}) {
  const {
    locale = 'en-IN',
    currency = 'INR',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

/**
 * Formats a number as a compact currency string (no symbol).
 * Useful for chart labels and compact displays.
 *
 * @example
 * formatAmount(1234.5)  // "1,234.50"
 */
export function formatAmount(amount) {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

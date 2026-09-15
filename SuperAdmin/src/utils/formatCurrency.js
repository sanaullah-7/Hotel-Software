/**
 * Format a number as Pakistani Rupees.
 * @param {number} amount
 * @param {object} [options]
 * @returns {string}
 */
export function formatCurrency(amount, options = {}) {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }).format(amount);
}

/**
 * Format a large number with K/M/B suffixes.
 * @param {number} num
 * @returns {string}
 */
export function formatCompact(num) {
  if (num === null || num === undefined) return '—';
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000)     return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000)         return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

/**
 * Format a percentage value.
 * @param {number} value
 * @param {number} [decimals=1]
 * @returns {string}
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

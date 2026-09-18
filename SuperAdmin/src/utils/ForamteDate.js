/**
 * Format a date string or Date object for display.
 * @param {string|Date} date
 * @param {object} [options]
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d)) return '—';
  const defaults = { year: 'numeric', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-PK', { ...defaults, ...options });
}

/**
 * Format a date + time.
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDateTime(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d)) return '—';
  return d.toLocaleString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/**
 * Return a relative time string (e.g., "3 hours ago").
 * @param {string|Date} date
 * @returns {string}
 */
export function timeAgo(date) {
  if (!date) return '—';
  const d = new Date(date);
  const now = new Date();
  const diff = now - d; // ms
  const secs = Math.floor(diff / 1000);
  const mins = Math.floor(secs / 60);
  const hrs  = Math.floor(mins / 60);
  const days = Math.floor(hrs  / 24);
  const wks  = Math.floor(days / 7);
  const mos  = Math.floor(days / 30);
  const yrs  = Math.floor(days / 365);

  if (secs < 60)  return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hrs  < 24)  return `${hrs}h ago`;
  if (days < 7)   return `${days}d ago`;
  if (wks  < 4)   return `${wks}w ago`;
  if (mos  < 12)  return `${mos}mo ago`;
  return `${yrs}y ago`;
}

/**
 * Format a date range.
 * @param {string|Date} from
 * @param {string|Date} to
 * @returns {string}
 */
export function formatDateRange(from, to) {
  return `${formatDate(from)} – ${formatDate(to)}`;
}

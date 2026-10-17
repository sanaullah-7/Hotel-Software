/**
 * Calendar date arithmetic and formatting utilities for the Room Tape Chart.
 *
 * Implements strict calendar-date operations via UTC to prevent shifts
 * caused by browser local timezones or daylight saving transitions.
 */

/**
 * Parses a YYYY-MM-DD string into year, month, day integers.
 * @param {string} dateStr
 * @returns {{year: number, month: number, day: number} | null}
 */
export function parseYMD(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!match) return null;
  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
    day: parseInt(match[3], 10),
  };
}

/**
 * Formats year, month, day into YYYY-MM-DD.
 * @param {number} year
 * @param {number} month (1-12)
 * @param {number} day (1-31)
 * @returns {string}
 */
export function formatYMD(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Adds or subtracts calendar days from a YYYY-MM-DD date string.
 * @param {string} dateStr
 * @param {number} days
 * @returns {string}
 */
export function addDaysYMD(dateStr, days) {
  const parsed = parseYMD(dateStr);
  if (!parsed) return '';
  const d = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day + days));
  return formatYMD(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

/**
 * Calculates the number of calendar days between two YYYY-MM-DD strings (end - start).
 * @param {string} startDateStr
 * @param {string} endDateStr
 * @returns {number}
 */
export function diffDaysYMD(startDateStr, endDateStr) {
  const p1 = parseYMD(startDateStr);
  const p2 = parseYMD(endDateStr);
  if (!p1 || !p2) return 0;
  const t1 = Date.UTC(p1.year, p1.month - 1, p1.day);
  const t2 = Date.UTC(p2.year, p2.month - 1, p2.day);
  return Math.round((t2 - t1) / (1000 * 60 * 60 * 24));
}

/**
 * Returns today's calendar date as YYYY-MM-DD in local time.
 * @returns {string}
 */
export function getTodayYMD() {
  const now = new Date();
  return formatYMD(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/**
 * Formats a Date/string into YYYY-MM-DD safely.
 * @param {string|Date} value
 * @returns {string}
 */
export function toYMD(value) {
  if (!value) return '';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    // Extract YYYY-MM-DD from ISO timestamp
    const isoMatch = /^(\d{4}-\d{2}-\d{2})/.exec(trimmed);
    if (isoMatch) return isoMatch[1];
  }
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return formatYMD(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

/**
 * Generates an array of date objects representing each visible column on the Tape Chart.
 * @param {string} startDateStr - YYYY-MM-DD
 * @param {number} totalDays - 7, 14, or 30
 * @returns {Array<{dateStr: string, dayNumber: number, dayOfWeek: string, monthName: string, isToday: boolean}>}
 */
export function getVisibleDates(startDateStr, totalDays) {
  const todayStr = getTodayYMD();
  const dates = [];

  for (let i = 0; i < totalDays; i++) {
    const ymd = addDaysYMD(startDateStr, i);
    const parsed = parseYMD(ymd);
    if (!parsed) continue;

    const d = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day));
    const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
    const monthName = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });

    dates.push({
      dateStr: ymd,
      dayNumber: parsed.day,
      dayOfWeek,
      monthName,
      isToday: ymd === todayStr,
    });
  }

  return dates;
}

/**
 * Formats a date range into a readable human display label (e.g. "Nov 10 – Nov 16, 2026 (7 nights)").
 * @param {string} startDateStr - YYYY-MM-DD
 * @param {number} totalDays
 * @returns {string}
 */
export function formatRangeDisplay(startDateStr, totalDays) {
  const pStart = parseYMD(startDateStr);
  if (!pStart) return '';

  const lastVisibleDateStr = addDaysYMD(startDateStr, totalDays - 1);
  const pEnd = parseYMD(lastVisibleDateStr);
  if (!pEnd) return '';

  const dStart = new Date(Date.UTC(pStart.year, pStart.month - 1, pStart.day));
  const dEnd = new Date(Date.UTC(pEnd.year, pEnd.month - 1, pEnd.day));

  const startMonth = dStart.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  const endMonth = dEnd.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });

  if (pStart.year === pEnd.year) {
    if (startMonth === endMonth) {
      return `${startMonth} ${pStart.day} – ${pEnd.day}, ${pStart.year} (${totalDays} nights)`;
    }
    return `${startMonth} ${pStart.day} – ${endMonth} ${pEnd.day}, ${pStart.year} (${totalDays} nights)`;
  }
  return `${startMonth} ${pStart.day}, ${pStart.year} – ${endMonth} ${pEnd.day}, ${pEnd.year} (${totalDays} nights)`;
}

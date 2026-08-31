/**
 * Date generation and temporal calculation utilities for Bi-Temporal Analysis
 */

/**
 * Formats a Date object to YYYY-MM-DD string
 * @param {Date} date 
 * @returns {string}
 */
export function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats a date string (YYYY-MM-DD or ISO) into a human readable format
 * e.g., "Oct 14, 2022"
 * @param {string} dateStr 
 * @returns {string}
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr || dateStr === 'Date unavailable') return 'Date unavailable';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Returns a random integer between min and max (inclusive)
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a pair of random realistic satellite acquisition dates:
 * - Date A (Old / Reference): 2 to 6 years in the past (e.g. 2020 - 2023)
 * - Date B (New / Comparison): 15 days to 1.5 years in the past (e.g. 2024 - 2026)
 * Guaranteed: Date B is chronologically after Date A by at least 1-4 years.
 * 
 * @returns {{ dateA: string, dateB: string, displayA: string, displayB: string, delta: string }}
 */
export function generateBiTemporalDatePair() {
  const now = new Date();
  
  // Date A (Old): 730 to 2190 days ago (~2 to 6 years ago)
  const daysAgoA = getRandomInt(730, 2190);
  const dateObjA = new Date(now.getTime() - daysAgoA * 24 * 60 * 60 * 1000);
  
  // Date B (New): 15 to 365 days ago (~2 weeks to 1 year ago)
  // Ensure at least 300 days gap between A and B
  const maxDaysAgoB = Math.min(daysAgoA - 300, 365);
  const minDaysAgoB = 15;
  const daysAgoB = getRandomInt(minDaysAgoB, Math.max(minDaysAgoB + 10, maxDaysAgoB));
  const dateObjB = new Date(now.getTime() - daysAgoB * 24 * 60 * 60 * 1000);

  const dateA = formatDateISO(dateObjA);
  const dateB = formatDateISO(dateObjB);

  return {
    dateA,
    dateB,
    displayA: formatDisplayDate(dateA),
    displayB: formatDisplayDate(dateB),
    delta: calculateTemporalDelta(dateA, dateB)
  };
}

/**
 * Calculates human readable temporal difference between two dates
 * @param {string} dateAStr - Older date (YYYY-MM-DD)
 * @param {string} dateBStr - Newer date (YYYY-MM-DD)
 * @returns {string} e.g. "3 years, 2 months (~1,150 days)"
 */
export function calculateTemporalDelta(dateAStr, dateBStr) {
  if (!dateAStr || !dateBStr) return 'Unknown interval';
  
  try {
    const dA = new Date(dateAStr);
    const dB = new Date(dateBStr);
    
    if (isNaN(dA.getTime()) || isNaN(dB.getTime())) return 'Unknown interval';

    let diffMs = dB.getTime() - dA.getTime();
    if (diffMs < 0) {
      // Swapped
      diffMs = Math.abs(diffMs);
    }

    const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    if (totalDays < 30) {
      return `${totalDays} day${totalDays === 1 ? '' : 's'}`;
    }

    const years = Math.floor(totalDays / 365);
    const remainingDays = totalDays % 365;
    const months = Math.floor(remainingDays / 30);

    const parts = [];
    if (years > 0) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} mo${months > 1 ? 's' : ''}`);

    const durationStr = parts.length > 0 ? parts.join(', ') : `${totalDays} days`;
    return `${durationStr} (~${totalDays.toLocaleString()} days)`;
  } catch {
    return 'Unknown interval';
  }
}

export default {
  formatDateISO,
  formatDisplayDate,
  generateBiTemporalDatePair,
  calculateTemporalDelta
};

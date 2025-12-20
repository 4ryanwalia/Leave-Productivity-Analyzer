/**
 * Business Rules for Leave & Productivity Analyzer
 * 
 * Working Hours:
 * - Monday-Friday: 10:00 AM - 6:30 PM (8.5 hours)
 * - Saturday: 10:00 AM - 2:00 PM (4 hours)
 * - Sunday: Off (0 hours)
 * 
 * Leave Rules:
 * - Missing in-time OR out-time on a working day = LEAVE
 * - Each employee is allowed 2 leaves per month
 * 
 * Productivity:
 * - Productivity = (Total Actual Worked Hours / Total Expected Working Hours) × 100
 */

/**
 * Get expected working hours for a given date
 * @param {Date} date - The date to check
 * @returns {Number} Expected working hours (0, 4, or 8.5)
 */
function getExpectedHours(date) {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  if (dayOfWeek === 0) {
    // Sunday - Off
    return 0;
  } else if (dayOfWeek === 6) {
    // Saturday - 4 hours (10:00 AM - 2:00 PM)
    return 4;
  } else {
    // Monday-Friday - 8.5 hours (10:00 AM - 6:30 PM)
    return 8.5;
  }
}

/**
 * Check if a date is a working day
 * @param {Date} date - The date to check
 * @returns {Boolean} True if working day, false otherwise
 */
function isWorkingDay(date) {
  const dayOfWeek = date.getDay();
  return dayOfWeek !== 0; // Sunday is off
}

/**
 * Calculate worked hours from in-time and out-time
 * @param {String} inTime - In-time in HH:mm format
 * @param {String} outTime - Out-time in HH:mm format
 * @returns {Number} Worked hours (rounded to 2 decimals)
 */
function calculateWorkedHours(inTime, outTime) {
  if (!inTime || !outTime) {
    return 0;
  }

  try {
    // Parse time strings (HH:mm format)
    const [inHours, inMinutes] = inTime.split(':').map(Number);
    const [outHours, outMinutes] = outTime.split(':').map(Number);

    // Convert to minutes for easier calculation
    const inTotalMinutes = inHours * 60 + inMinutes;
    const outTotalMinutes = outHours * 60 + outMinutes;

    // Calculate difference in minutes
    let diffMinutes = outTotalMinutes - inTotalMinutes;

    // Handle case where out-time is next day (shouldn't happen in normal cases)
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60; // Add 24 hours
    }

    // Convert to hours and round to 2 decimals
    const workedHours = diffMinutes / 60;
    return Math.round(workedHours * 100) / 100;
  } catch (error) {
    console.error('Error calculating worked hours:', error);
    return 0;
  }
}

/**
 * Determine if a record is a leave
 * @param {String} inTime - In-time in HH:mm format or null
 * @param {String} outTime - Out-time in HH:mm format or null
 * @param {Date} date - The date of the record
 * @returns {Boolean} True if it's a leave, false otherwise
 */
function isLeave(inTime, outTime, date) {
  // If it's not a working day (Sunday), it's not a leave
  if (!isWorkingDay(date)) {
    return false;
  }

  // If either in-time or out-time is missing, it's a leave
  if (!inTime || !outTime) {
    return true;
  }

  return false;
}

/**
 * Calculate total expected hours for a month
 * @param {Number} year - Year (e.g., 2024)
 * @param {Number} month - Month (0-11, where 0 = January)
 * @returns {Number} Total expected hours for the month
 */
function getTotalExpectedHoursForMonth(year, month) {
  const date = new Date(year, month, 1);
  let totalHours = 0;

  // Iterate through all days in the month
  while (date.getMonth() === month) {
    totalHours += getExpectedHours(date);
    date.setDate(date.getDate() + 1);
  }

  return totalHours;
}

module.exports = {
  getExpectedHours,
  isWorkingDay,
  calculateWorkedHours,
  isLeave,
  getTotalExpectedHoursForMonth
};


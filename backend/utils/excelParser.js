const XLSX = require('xlsx');
const { getExpectedHours, calculateWorkedHours, isLeave, isWorkingDay } = require('./businessRules');

/**
 * Parse Excel file and extract attendance data
 * Expected columns:
 * - Employee Name or ID
 * - Date (YYYY-MM-DD)
 * - In-Time (HH:mm)
 * - Out-Time (HH:mm)
 * 
 * @param {String} filePath - Path to the Excel file
 * @returns {Array} Array of attendance records
 */
function parseExcelFile(filePath) {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Get first sheet
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      throw new Error('Excel file is empty');
    }

    // Get column names (case-insensitive)
    const firstRow = data[0];
    const columns = Object.keys(firstRow);
    
    // Find column indices (case-insensitive matching)
    const employeeCol = columns.find(col => 
      col.toLowerCase().includes('employee') || 
      col.toLowerCase().includes('name') || 
      col.toLowerCase().includes('id')
    );
    
    const dateCol = columns.find(col => 
      col.toLowerCase().includes('date')
    );
    
    const inTimeCol = columns.find(col => 
      col.toLowerCase().includes('in') && 
      (col.toLowerCase().includes('time') || col.toLowerCase().includes('in-time'))
    );
    
    const outTimeCol = columns.find(col => 
      col.toLowerCase().includes('out') && 
      (col.toLowerCase().includes('time') || col.toLowerCase().includes('out-time'))
    );

    if (!employeeCol || !dateCol || !inTimeCol || !outTimeCol) {
      throw new Error('Required columns not found. Expected: Employee Name/ID, Date, In-Time, Out-Time');
    }

    // Parse each row
    const attendanceRecords = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      const employeeName = String(row[employeeCol] || '').trim();
      const dateStr = String(row[dateCol] || '').trim();
      const inTimeStr = row[inTimeCol] ? String(row[inTimeCol]).trim() : '';
      const outTimeStr = row[outTimeCol] ? String(row[outTimeCol]).trim() : '';

      // Skip empty rows
      if (!employeeName || !dateStr) {
        continue;
      }

      // Parse date
      let date;
      try {
        // Try parsing as Excel date number first
        if (!isNaN(dateStr)) {
          date = XLSX.SSF.parse_date_code(parseFloat(dateStr));
          if (date) {
            date = new Date(date.y, date.m - 1, date.d);
          } else {
            date = new Date(dateStr);
          }
        } else {
          date = new Date(dateStr);
        }

        if (isNaN(date.getTime())) {
          console.warn(`Invalid date in row ${i + 2}: ${dateStr}`);
          continue;
        }
      } catch (error) {
        console.warn(`Error parsing date in row ${i + 2}: ${dateStr}`, error);
        continue;
      }

      // Parse time strings (handle various formats)
      let inTime = null;
      let outTime = null;

      if (inTimeStr) {
        inTime = parseTimeString(inTimeStr);
      }

      if (outTimeStr) {
        outTime = parseTimeString(outTimeStr);
      }

      // Calculate expected hours for this date
      const expectedHours = getExpectedHours(date);

      // Calculate worked hours
      const workedHours = calculateWorkedHours(inTime, outTime);

      // Determine if it's a leave
      const leaveStatus = isLeave(inTime, outTime, date);

      // Determine status
      let status = 'present';
      if (!isWorkingDay(date)) {
        status = 'holiday';
      } else if (leaveStatus) {
        status = 'leave';
      }

      attendanceRecords.push({
        employeeName,
        date,
        inTime,
        outTime,
        expectedHours,
        workedHours,
        isLeave: leaveStatus,
        status
      });
    }

    return attendanceRecords;
  } catch (error) {
    throw new Error(`Error parsing Excel file: ${error.message}`);
  }
}

/**
 * Parse time string to HH:mm format
 * Handles various formats: HH:mm, HH:mm:ss, Excel time numbers, etc.
 * @param {String} timeStr - Time string in various formats
 * @returns {String|null} Time in HH:mm format or null
 */
function parseTimeString(timeStr) {
  if (!timeStr) return null;

  try {
    // If it's a number (Excel time format)
    if (!isNaN(timeStr)) {
      const timeValue = parseFloat(timeStr);
      // Excel time is a fraction of a day
      const totalSeconds = Math.round(timeValue * 24 * 60 * 60);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    // If it's already in HH:mm or HH:mm:ss format
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    return null;
  } catch (error) {
    console.warn(`Error parsing time string: ${timeStr}`, error);
    return null;
  }
}

module.exports = {
  parseExcelFile
};


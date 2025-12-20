const express = require('express');
const Attendance = require('../models/Attendance');
const { getTotalExpectedHoursForMonth } = require('../utils/businessRules');

const router = express.Router();

/**
 * GET /api/attendance/monthly-summary
 * Get monthly summary for an employee
 * Query params: employeeName, year, month (0-11)
 */
router.get('/monthly-summary', async (req, res) => {
  try {
    const { employeeName, year, month } = req.query;

    if (!employeeName || year === undefined || month === undefined) {
      return res.status(400).json({ 
        error: 'Missing required parameters: employeeName, year, month' 
      });
    }

    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 0 || monthNum > 11) {
      return res.status(400).json({ 
        error: 'Invalid year or month. Month must be 0-11 (0 = January)' 
      });
    }

    // Get start and end dates for the month
    const startDate = new Date(yearNum, monthNum, 1);
    const endDate = new Date(yearNum, monthNum + 1, 0, 23, 59, 59);

    // Fetch all attendance records for the month
    const records = await Attendance.find({
      employeeName: employeeName,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });

    // Calculate totals
    const totalExpectedHours = getTotalExpectedHoursForMonth(yearNum, monthNum);
    const totalActualHours = records.reduce((sum, record) => sum + (record.workedHours || 0), 0);
    const leavesUsed = records.filter(record => record.isLeave === true).length;
    const maxLeavesAllowed = 2;

    // Calculate productivity percentage
    const productivity = totalExpectedHours > 0 
      ? Math.round((totalActualHours / totalExpectedHours) * 100 * 100) / 100 
      : 0;

    res.json({
      employeeName,
      year: yearNum,
      month: monthNum,
      totalExpectedHours,
      totalActualHours: Math.round(totalActualHours * 100) / 100,
      leavesUsed,
      maxLeavesAllowed,
      productivity,
      recordCount: records.length
    });
  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    res.status(500).json({ error: error.message || 'Error fetching monthly summary' });
  }
});

/**
 * GET /api/attendance/daily-breakdown
 * Get daily breakdown for an employee in a month
 * Query params: employeeName, year, month (0-11)
 */
router.get('/daily-breakdown', async (req, res) => {
  try {
    const { employeeName, year, month } = req.query;

    if (!employeeName || year === undefined || month === undefined) {
      return res.status(400).json({ 
        error: 'Missing required parameters: employeeName, year, month' 
      });
    }

    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 0 || monthNum > 11) {
      return res.status(400).json({ 
        error: 'Invalid year or month. Month must be 0-11 (0 = January)' 
      });
    }

    // Get start and end dates for the month
    const startDate = new Date(yearNum, monthNum, 1);
    const endDate = new Date(yearNum, monthNum + 1, 0, 23, 59, 59);

    // Fetch all attendance records for the month
    const records = await Attendance.find({
      employeeName: employeeName,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });

    // Create a map of existing records by date (YYYY-MM-DD)
    const recordsMap = new Map();
    records.forEach(record => {
      const dateKey = record.date.toISOString().split('T')[0];
      recordsMap.set(dateKey, record);
    });

    // Generate daily breakdown for ALL calendar days in the month
    const { getExpectedHours, isWorkingDay, isLeave } = require('../utils/businessRules');
    const dailyBreakdown = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const existingRecord = recordsMap.get(dateKey);
      
      // Calculate expected hours for this date
      const expectedHours = getExpectedHours(currentDate);
      
      if (existingRecord) {
        // Use existing record data, ensuring numbers
        const workedHours = typeof existingRecord.workedHours === 'number' 
          ? Math.round(existingRecord.workedHours * 100) / 100 
          : 0;
        const expHours = typeof existingRecord.expectedHours === 'number' 
          ? existingRecord.expectedHours 
          : expectedHours;
        
        // Determine status
        let status = existingRecord.status || 'present';
        if (!isWorkingDay(currentDate)) {
          status = 'holiday';
        } else if (isLeave(existingRecord.inTime, existingRecord.outTime, currentDate)) {
          status = 'leave';
        } else if (!status || status === 'present') {
          status = 'present';
        }
        
        dailyBreakdown.push({
          date: dateKey,
          expectedHours: expHours,
          workedHours: workedHours,
          status: status,
          inTime: existingRecord.inTime || null,
          outTime: existingRecord.outTime || null,
          isLeave: existingRecord.isLeave || false
        });
      } else {
        // Generate record for missing day
        const isWorking = isWorkingDay(currentDate);
        const leaveStatus = isWorking && expectedHours > 0; // Missing record on working day = leave
        
        dailyBreakdown.push({
          date: dateKey,
          expectedHours: expectedHours,
          workedHours: 0,
          status: !isWorking ? 'holiday' : (leaveStatus ? 'leave' : 'present'),
          inTime: null,
          outTime: null,
          isLeave: leaveStatus
        });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      employeeName,
      year: yearNum,
      month: monthNum,
      dailyBreakdown
    });
  } catch (error) {
    console.error('Error fetching daily breakdown:', error);
    res.status(500).json({ error: error.message || 'Error fetching daily breakdown' });
  }
});

/**
 * GET /api/attendance/employees
 * Get list of all employees
 */
router.get('/employees', async (req, res) => {
  try {
    const employees = await Attendance.distinct('employeeName');
    res.json({ employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: error.message || 'Error fetching employees' });
  }
});

module.exports = router;


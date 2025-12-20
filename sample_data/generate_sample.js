/**
 * Script to generate a sample Excel file for testing
 * Run: node generate_sample.js
 */
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Create sample data for January 2024
const employeeName = 'John Doe';
const year = 2024;
const month = 0; // January (0-indexed)

const data = [];
const headers = ['Employee Name', 'Date', 'In-Time', 'Out-Time'];
data.push(headers);

// Generate dates for January 2024
const startDate = new Date(year, month, 1);
const endDate = new Date(year, month + 1, 0);

let currentDate = new Date(startDate);
let leaveCount = 0;

while (currentDate <= endDate) {
  const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Skip Sundays
  if (dayOfWeek !== 0) {
    let inTime = '';
    let outTime = '';
    
    // Create 2 leaves in the month (on 5th and 15th)
    const isLeave = currentDate.getDate() === 5 || currentDate.getDate() === 15;
    
    if (isLeave) {
      // Leave: missing either in-time or out-time
      if (currentDate.getDate() === 5) {
        inTime = ''; // Missing in-time
        outTime = dayOfWeek === 6 ? '14:00' : '18:30';
      } else {
        inTime = dayOfWeek === 6 ? '10:00' : '10:00';
        outTime = ''; // Missing out-time
      }
    } else {
      // Normal attendance
      if (dayOfWeek === 6) {
        // Saturday: 10:00 - 14:00 (4 hours)
        inTime = '10:00';
        outTime = '14:00';
      } else {
        // Monday-Friday: 10:00 - 18:30 (8.5 hours)
        inTime = '10:00';
        outTime = '18:30';
      }
      
      // Add some variation (±15 minutes)
      const inMinutes = parseInt(inTime.split(':')[1]);
      const inVariation = Math.floor(Math.random() * 31) - 15; // -15 to +15
      const newInMinutes = inMinutes + inVariation;
      if (newInMinutes >= 0 && newInMinutes < 60) {
        inTime = `10:${String(newInMinutes).padStart(2, '0')}`;
      }
      
      const outMinutes = parseInt(outTime.split(':')[1]);
      const outVariation = Math.floor(Math.random() * 31) - 15; // -15 to +15
      const newOutMinutes = outMinutes + outVariation;
      if (newOutMinutes >= 0 && newOutMinutes < 60) {
        outTime = dayOfWeek === 6 
          ? `14:${String(newOutMinutes).padStart(2, '0')}`
          : `18:${String(newOutMinutes).padStart(2, '0')}`;
      }
    }
    
    // Format date as YYYY-MM-DD
    const dateStr = currentDate.toISOString().split('T')[0];
    
    data.push([
      employeeName,
      dateStr,
      inTime,
      outTime
    ]);
  }
  
  // Move to next day
  currentDate.setDate(currentDate.getDate() + 1);
}

// Create workbook and worksheet
const ws = XLSX.utils.aoa_to_sheet(data);

// Set column widths
ws['!cols'] = [
  { wch: 20 }, // Employee Name
  { wch: 12 }, // Date
  { wch: 10 }, // In-Time
  { wch: 10 }  // Out-Time
];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

// Write file
const outputPath = path.join(__dirname, 'sample_attendance.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`Sample Excel file created: ${outputPath}`);
console.log(`Total records: ${data.length - 1}`); // Subtract header row


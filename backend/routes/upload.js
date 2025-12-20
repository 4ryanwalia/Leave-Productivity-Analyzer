const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseExcelFile } = require('../utils/excelParser');
const Attendance = require('../models/Attendance');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'attendance-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * POST /api/upload
 * Upload and process Excel file
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;

    // Parse Excel file
    const attendanceRecords = parseExcelFile(filePath);

    if (attendanceRecords.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'No valid attendance records found in the file' });
    }

    // Save records to database (upsert to avoid duplicates)
    // Ensure workedHours and expectedHours are always numbers
    const savedRecords = [];
    for (const record of attendanceRecords) {
      // Ensure numeric values
      const workedHours = typeof record.workedHours === 'number' 
        ? record.workedHours 
        : parseFloat(record.workedHours) || 0;
      const expectedHours = typeof record.expectedHours === 'number' 
        ? record.expectedHours 
        : parseFloat(record.expectedHours) || 0;
      
      const saved = await Attendance.findOneAndUpdate(
        {
          employeeName: record.employeeName,
          date: record.date
        },
        {
          ...record,
          date: new Date(record.date.setHours(0, 0, 0, 0)), // Normalize date to start of day
          workedHours: Math.round(workedHours * 100) / 100, // Round to 2 decimals
          expectedHours: expectedHours // Ensure it's a number
        },
        {
          upsert: true,
          new: true
        }
      );
      savedRecords.push(saved);
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      message: 'File uploaded and processed successfully',
      recordsProcessed: savedRecords.length,
      records: savedRecords
    });
  } catch (error) {
    // Clean up uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Error processing file' });
  }
});

module.exports = router;


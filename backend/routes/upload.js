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
 * Multer error handler middleware
 * Catches Multer errors (file size, file type, etc.) and returns JSON
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer errors (file size limit, etc.)
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds the 10MB limit' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field. Expected field name: "file"' });
    }
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }
  
  if (err) {
    // File filter errors and other errors
    return res.status(400).json({ error: err.message || 'File upload error' });
  }
  
  next();
};

/**
 * POST /api/upload
 * Upload and process Excel file
 */
router.post('/', upload.single('file'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please ensure the field name is "file"' });
    }

    const filePath = req.file.path;

    // Parse Excel file - wrap in try-catch to handle parsing errors
    let attendanceRecords;
    try {
      attendanceRecords = parseExcelFile(filePath);
    } catch (parseError) {
      // Clean up uploaded file on parse error
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
      return res.status(400).json({ error: parseError.message || 'Error parsing Excel file' });
    }

    if (attendanceRecords.length === 0) {
      // Clean up uploaded file
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
      return res.status(400).json({ error: 'No valid attendance records found in the file' });
    }

    // Save records to database (upsert to avoid duplicates)
    // Ensure workedHours and expectedHours are always numbers
    const savedRecords = [];
    try {
      for (const record of attendanceRecords) {
        // Ensure numeric values
        const workedHours = typeof record.workedHours === 'number' 
          ? record.workedHours 
          : parseFloat(record.workedHours) || 0;
        const expectedHours = typeof record.expectedHours === 'number' 
          ? record.expectedHours 
          : parseFloat(record.expectedHours) || 0;
        
        // Create a new date object to avoid mutating the original
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        
        const saved = await Attendance.findOneAndUpdate(
          {
            employeeName: record.employeeName,
            date: recordDate
          },
          {
            ...record,
            date: recordDate, // Normalize date to start of day
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
    } catch (dbError) {
      // Clean up uploaded file on database error
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
      console.error('Database error:', dbError);
      return res.status(500).json({ error: 'Error saving records to database: ' + (dbError.message || 'Unknown error') });
    }

    // Clean up uploaded file
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.error('Error deleting uploaded file:', unlinkError);
    }

    return res.json({
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
    return res.status(500).json({ error: error.message || 'Error processing file' });
  }
});

module.exports = router;


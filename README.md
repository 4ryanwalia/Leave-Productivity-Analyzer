Leave & Productivity Analyzer

A full-stack web application to analyze employee attendance, leaves, and productivity using Excel-based attendance data.

📌 Overview

The Leave & Productivity Analyzer helps organizations transform raw attendance Excel files into actionable insights.
It automatically calculates working hours, identifies leaves, and generates productivity metrics for each employee.

✨ Key Features

Upload Excel attendance files

Automatic leave detection

Monthly productivity calculation

Daily attendance breakdown

Employee-wise analytics

Clean and responsive web UI

Deployed with cloud-ready architecture

🛠 Tech Stack
Frontend

Flutter Web

Material Design 3

HTTP package

File Picker

Backend

Node.js

Express.js

MongoDB (Mongoose)

Multer (file uploads)

XLSX (Excel parsing)

Deployment

Frontend: Vercel / Netlify

Backend: Render

Database: MongoDB Atlas (Free Tier)

📊 Business Rules
Working Hours
Day	Expected Hours
Monday–Friday	8.5 hrs (10:00–18:30)
Saturday	4 hrs (10:00–14:00)
Sunday	0 hrs (Off)
Leave Rules

Missing In-Time or Out-Time on a working day → Leave

Each employee is allowed 2 leaves per month

Productivity Formula
Productivity (%) = (Total Actual Hours / Total Expected Hours) × 100


Rounded to 2 decimal places

📂 Project Structure
.
├── backend/
│   ├── models/
│   │   └── Attendance.js
│   ├── routes/
│   │   ├── upload.js
│   │   └── attendance.js
│   ├── utils/
│   │   ├── businessRules.js
│   │   └── excelParser.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── lib/
│   │   ├── models/
│   │   ├── screens/
│   │   ├── services/
│   │   └── main.dart
│   └── pubspec.yaml
│
├── sample_data/
│   └── generate_sample.py
│
└── README.md

📥 Excel File Format

Required columns:

Column Name	Format	Required
Employee Name / ID	Text	Yes
Date	YYYY-MM-DD	Yes
In-Time	HH:mm	Optional*
Out-Time	HH:mm	Optional*

* Missing In-Time or Out-Time on a working day is treated as Leave.

🔌 API Endpoints
Upload Attendance File
POST /upload
Content-Type: multipart/form-data
Body: file

Monthly Summary
GET /attendance/monthly-summary


Query Params:

employeeName

year

month (0–11)

Daily Breakdown
GET /attendance/daily-breakdown

Get Employees
GET /attendance/employees

⚙️ Local Setup
Prerequisites

Node.js (v16+)

MongoDB (local or Atlas)

Flutter SDK

Backend Setup
cd backend
npm install
npm start


Environment variables:

MONGODB_URI=your_connection_string
PORT=3000
NODE_ENV=development

Frontend Setup
cd frontend
flutter pub get
flutter run -d chrome


Update API base URL:

static const String baseUrl = 'http://localhost:3000';

🚀 Deployment
Backend (Render)

Build command: npm install

Start command: npm start

Environment variables:

MONGODB_URI

PORT

NODE_ENV=production

Frontend (Vercel)

Root directory: frontend

Framework preset: Other

Build command:

flutter build web --release


Output directory:

build/web

🌐 Live Demo

Frontend: Vercel / Netlify

Backend: Render

Database: MongoDB Atlas (Free Tier)

⚠️ Note: Render free tier may have cold-start delays (30–60 seconds).

📌 Known Limitations

Analytics are currently monthly-based

Date picker does not affect aggregation logic (future enhancement)

Free-tier hosting may cause cold starts

✅ Status

Excel upload working

Backend APIs stable

MongoDB connected

Frontend deployed

End-to-end flow functional

📄 License

ISC

📬 Support

For questions or issues, please refer to the code comments or raise an issue in the repository.

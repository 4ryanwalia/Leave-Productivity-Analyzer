# Leave & Productivity Analyzer

A complete full-stack application for analyzing employee attendance, leaves, and productivity from Excel-based attendance data.

## Project Overview

This application allows organizations to:
- Upload Excel files containing employee attendance data
- Automatically calculate expected vs actual working hours
- Track leaves used by employees
- Calculate productivity percentages
- View detailed daily attendance breakdowns

## Tech Stack

### Frontend
- **Flutter Web** - Modern, responsive web application
- **Material Design 3** - Clean, minimal UI
- **HTTP** - API communication
- **File Picker** - Excel file upload

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (via Mongoose)
- **Multer** - File upload handling
- **XLSX** - Excel file parsing

### Deployment
- **Frontend**: Netlify or Vercel
- **Backend**: Vercel or Render

## Business Rules

### Working Hours
- **Monday-Friday**: 8.5 hours (10:00 AM - 6:30 PM)
- **Saturday**: 4 hours (10:00 AM - 2:00 PM)
- **Sunday**: Off (0 expected hours)

### Leave Rules
- Missing **In-Time** OR **Out-Time** on a working day = **LEAVE**
- Each employee is allowed **2 leaves per month**

### Productivity Calculation
```
Productivity = (Total Actual Worked Hours / Total Expected Working Hours) × 100
```
- Rounded to 2 decimal places
- Displayed as percentage

## Project Structure

```
.
├── backend/
│   ├── models/
│   │   └── Attendance.js          # MongoDB attendance model
│   ├── routes/
│   │   ├── upload.js              # File upload endpoint
│   │   └── attendance.js          # Attendance data endpoints
│   ├── utils/
│   │   ├── businessRules.js       # Business logic implementation
│   │   └── excelParser.js         # Excel file parsing
│   ├── uploads/                   # Temporary file storage
│   ├── server.js                  # Express server
│   └── package.json
├── frontend/
│   ├── lib/
│   │   ├── models/
│   │   │   └── attendance_data.dart
│   │   ├── screens/
│   │   │   ├── upload_screen.dart
│   │   │   └── dashboard_screen.dart
│   │   ├── services/
│   │   │   └── api_service.dart
│   │   └── main.dart
│   └── pubspec.yaml
├── sample_data/
│   ├── generate_sample.py         # Script to generate sample Excel
│   └── README.md
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- Flutter SDK (for frontend development)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your MongoDB connection string:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/leave-productivity-analyzer
   NODE_ENV=development
   ```

   For MongoDB Atlas:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/leave-productivity-analyzer
   ```

5. Start the server:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Flutter dependencies:
   ```bash
   flutter pub get
   ```

3. Update API URL:
   - Open `lib/services/api_service.dart`
   - Update the `baseUrl` constant:
     ```dart
     static const String baseUrl = 'http://localhost:3000/api';
     ```

4. Run the Flutter web app:
   ```bash
   flutter run -d chrome
   ```

## API Endpoints

### Upload Excel File
```
POST /api/upload
Content-Type: multipart/form-data
Body: file (Excel file)
```

### Get Monthly Summary
```
GET /api/attendance/monthly-summary?employeeName=John Doe&year=2024&month=0
```
- `month`: 0-11 (0 = January, 11 = December)

### Get Daily Breakdown
```
GET /api/attendance/daily-breakdown?employeeName=John Doe&year=2024&month=0
```

### Get All Employees
```
GET /api/attendance/employees
```

## Excel File Format

The Excel file must contain the following columns:

| Column Name | Format | Example | Required |
|-------------|--------|---------|----------|
| Employee Name or ID | Text | "John Doe" | Yes |
| Date | YYYY-MM-DD | "2024-01-15" | Yes |
| In-Time | HH:mm | "10:00" | No* |
| Out-Time | HH:mm | "18:30" | No* |

*Missing In-Time or Out-Time on a working day indicates a LEAVE.

### Sample Excel File

See `sample_data/` directory for a sample Excel file generator script.

## Live Demo

The application is deployed on:
- **Frontend**: Vercel (Flutter Web) - Fast, global CDN
- **Backend**: Render (Node.js + Express) - Free tier available
- **Database**: MongoDB Atlas - Free tier (M0) available

**Note**: Render free tier may experience cold starts (first request after inactivity can take 30-60 seconds).

## Deployment

### Backend Deployment (Render)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Create `vercel.json` in backend directory:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server.js"
       }
     ],
     "env": {
       "MONGODB_URI": "@mongodb-uri"
     }
   }
   ```

3. Deploy:
   ```bash
   cd backend
   vercel
   ```

4. Set environment variables in Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: production

### Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect your Git repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: production
   - `PORT`: 10000 (or Render's assigned port)

### Frontend Deployment (Vercel)

1. **Create Vercel Account**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub/GitLab

2. **Install Vercel CLI** (optional, can use dashboard):
   ```bash
   npm i -g vercel
   ```

3. **Build Flutter Web App**:
   ```bash
   cd frontend
   flutter build web --release
   ```

4. **Deploy via Dashboard**:
   - Go to Vercel dashboard
   - Click "Add New" → "Project"
   - Import your Git repository
   - **Root Directory**: `frontend`
   - **Framework Preset**: Other
   - **Build Command**: `flutter build web --release`
   - **Output Directory**: `build/web`
   - Click "Deploy"

5. **Deploy via CLI** (alternative):
   ```bash
   cd frontend
   vercel --prod
   ```

6. **Update API URL**:
   - After deployment, update `frontend/lib/services/api_service.dart`
   - Set `baseUrl` to your Render backend URL
   - Redeploy frontend

### MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**:
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free tier (M0)

2. **Create Cluster**:
   - Choose free tier
   - Select region closest to your Render backend

3. **Database Access**:
   - Create database user
   - Set username and password
   - Save credentials securely

4. **Network Access**:
   - Add IP address: `0.0.0.0/0` (allows all IPs)
   - Or add Render's IP ranges

5. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

6. **Add to Render**:
   - Paste connection string as `MONGODB_URI` environment variable

### Post-Deployment Checklist

- [ ] Backend deployed on Render and accessible
- [ ] MongoDB Atlas cluster created and accessible
- [ ] Environment variables set in Render
- [ ] Frontend API URL updated to Render backend
- [ ] Frontend deployed on Vercel
- [ ] Test file upload functionality
- [ ] Test dashboard data loading
- [ ] Verify all features work end-to-end

## Usage

1. **Upload Attendance Data**:
   - Navigate to the Upload screen
   - Click "Choose File" and select an Excel file
   - Wait for upload confirmation

2. **View Dashboard**:
   - Navigate to the Dashboard screen
   - Select an employee from the dropdown
   - Select a month using the date picker
   - View:
     - Total Expected Hours
     - Total Actual Worked Hours
     - Leaves Used (out of 2)
     - Productivity Percentage
     - Daily attendance breakdown table

## Features

- ✅ Excel file upload and parsing
- ✅ Automatic leave detection
- ✅ Monthly productivity calculation
- ✅ Daily attendance breakdown
- ✅ Responsive web interface
- ✅ Clean, minimal UI design
- ✅ Real-time data updates

## Code Quality

- Clean folder structure
- Separation of concerns (frontend/backend)
- Reusable utility functions
- Meaningful variable names
- Comprehensive comments for business logic
- Error handling throughout

## License

ISC

## Support

For issues or questions, please check the code comments or create an issue in the repository.

#   L e a v e - P r o d u c t i v i t y - A n a l y z e r  
 
# Backend API

Node.js + Express backend for Leave & Productivity Analyzer.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your MongoDB URI:
   ```
   MONGODB_URI=mongodb://localhost:27017/leave-productivity-analyzer
   PORT=3000
   ```

4. Start server:
   ```bash
   npm start
   ```

## API Endpoints

- `POST /api/upload` - Upload Excel file
- `GET /api/attendance/monthly-summary` - Get monthly summary
- `GET /api/attendance/daily-breakdown` - Get daily breakdown
- `GET /api/attendance/employees` - Get all employees
- `GET /api/health` - Health check

## Environment Variables

- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production)



"""
Script to generate a sample Excel file for testing
Run: python generate_sample.py
"""
import openpyxl
from datetime import datetime, timedelta
import random

# Create a new workbook
wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Attendance"

# Add headers
headers = ["Employee Name", "Date", "In-Time", "Out-Time"]
ws.append(headers)

# Generate sample data for January 2024
employee_name = "John Doe"
start_date = datetime(2024, 1, 1)
end_date = datetime(2024, 1, 31)

current_date = start_date
while current_date <= end_date:
    day_of_week = current_date.weekday()  # 0 = Monday, 6 = Sunday
    
    # Skip Sundays (day 6)
    if day_of_week != 6:
        # Saturday: 10:00 - 14:00 (4 hours)
        if day_of_week == 5:
            in_time = "10:00"
            out_time = "14:00"
        else:
            # Monday-Friday: 10:00 - 18:30 (8.5 hours)
            in_time = "10:00"
            out_time = "18:30"
        
        # Randomly create some leaves (missing in-time or out-time)
        # Create 2 leaves in the month
        is_leave = False
        if current_date.day in [5, 15]:  # Leave on 5th and 15th
            is_leave = True
        
        if is_leave:
            # Leave: missing either in-time or out-time
            if random.choice([True, False]):
                in_time = ""  # Missing in-time
                out_time = "18:30"
            else:
                in_time = "10:00"
                out_time = ""  # Missing out-time
        else:
            # Add some variation to in-time and out-time (±30 minutes)
            in_hour, in_min = map(int, in_time.split(":"))
            in_min += random.randint(-30, 30)
            if in_min < 0:
                in_hour -= 1
                in_min += 60
            elif in_min >= 60:
                in_hour += 1
                in_min -= 60
            in_time = f"{in_hour:02d}:{in_min:02d}"
            
            out_hour, out_min = map(int, out_time.split(":"))
            out_min += random.randint(-30, 30)
            if out_min < 0:
                out_hour -= 1
                out_min += 60
            elif out_min >= 60:
                out_hour += 1
                out_min -= 60
            out_time = f"{out_hour:02d}:{out_min:02d}"
        
        # Add row
        ws.append([
            employee_name,
            current_date.strftime("%Y-%m-%d"),
            in_time,
            out_time
        ])
    
    current_date += timedelta(days=1)

# Save the file
output_file = "sample_attendance.xlsx"
wb.save(output_file)
print(f"Sample Excel file created: {output_file}")



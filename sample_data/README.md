# Sample Data

This directory contains sample Excel files for testing the application.

## Generate Sample File

To generate a sample Excel file, you can use the Python script:

```bash
pip install openpyxl
python generate_sample.py
```

This will create `sample_attendance.xlsx` with sample attendance data for January 2024.

## Excel File Format

The Excel file must have the following columns:

1. **Employee Name or ID** - Name or identifier of the employee
2. **Date** - Date in YYYY-MM-DD format (e.g., 2024-01-15)
3. **In-Time** - Time in HH:mm format (e.g., 10:00)
4. **Out-Time** - Time in HH:mm format (e.g., 18:30)

### Example:

| Employee Name | Date       | In-Time | Out-Time |
|---------------|------------|---------|----------|
| John Doe      | 2024-01-01 | 10:00   | 18:30    |
| John Doe      | 2024-01-02 | 10:15   | 18:45    |
| John Doe      | 2024-01-03 |         | 18:30    |

**Note:** Missing In-Time or Out-Time on a working day indicates a LEAVE.


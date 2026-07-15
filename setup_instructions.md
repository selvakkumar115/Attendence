# Attendance Management System - Setup Instructions

## Prerequisites
- Python 3.7 or higher
- pip (Python package installer)

## Installation Steps

### 1. Create a Virtual Environment (Recommended)
```bash
# Create virtual environment
python -m venv attendance_env

# Activate it (Windows)
attendance_env\Scripts\activate

# Activate it (macOS/Linux)
source attendance_env/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Initialize the Database
The database will be created automatically when you first run the application.

### 4. Run the Application
```bash
python app.py
```

The application will start on `http://localhost:5000`

## Default Access
- Open your web browser and go to `http://localhost:5000`
- The system will create sample students automatically on first run

## Features

### 1. Student Registration
- Register new students with name, roll number, and email
- View all registered students
- Delete students (with confirmation)

### 2. Attendance Marking
- Mark daily attendance for all students
- Quick actions: Mark All Present/Absent, Clear All
- Search and filter students
- Real-time attendance summary

### 3. Reports and Analytics
- Generate attendance reports for custom date ranges
- View attendance percentages
- Export data to CSV
- Visual charts and statistics
- Identify students with low attendance

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Change port in app.py
   app.run(debug=True, port=5001)
   ```

2. **Database Errors**
   ```bash
   # Delete database and restart
   rm database.db
   python app.py
   ```

3. **Missing Dependencies**
   ```bash
   # Reinstall requirements
   pip install -r requirements.txt --force-reinstall
   ```

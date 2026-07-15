from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date

db = SQLAlchemy()

class Student(db.Model):
    """Model for storing student information"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    roll_number = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship with attendance
    attendances = db.relationship('Attendance', backref='student', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Student {self.name} - {self.roll_number}>'

    def get_attendance_percentage(self, start_date=None, end_date=None):
        """Calculate attendance percentage for a date range"""
        query = Attendance.query.filter_by(student_id=self.id)

        if start_date:
            query = query.filter(Attendance.date >= start_date)
        if end_date:
            query = query.filter(Attendance.date <= end_date)

        total_days = query.count()
        present_days = query.filter_by(status='Present').count()

        if total_days == 0:
            return 0
        return (present_days / total_days) * 100

class Attendance(db.Model):
    """Model for storing daily attendance records"""
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    date = db.Column(db.Date, nullable=False, default=date.today)
    status = db.Column(db.String(20), nullable=False)  # 'Present' or 'Absent'
    marked_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Ensure one attendance record per student per date
    __table_args__ = (db.UniqueConstraint('student_id', 'date', name='unique_student_date'),)

    def __repr__(self):
        return f'<Attendance {self.student.name} - {self.date} - {self.status}>'

# Helper function to initialize the database
def init_database(app):
    """Initialize the database with sample data if empty"""
    with app.app_context():
        db.create_all()

        # Check if we need to add sample data
        if Student.query.count() == 0:
            # Add sample students
            sample_students = [
                Student(name="John Doe", roll_number="2021001", email="john@example.com"),
                Student(name="Jane Smith", roll_number="2021002", email="jane@example.com"),
                Student(name="Bob Johnson", roll_number="2021003", email="bob@example.com"),
                Student(name="Alice Brown", roll_number="2021004", email="alice@example.com"),
                Student(name="Charlie Wilson", roll_number="2021005", email="charlie@example.com")
            ]

            for student in sample_students:
                db.session.add(student)

            db.session.commit()
            print("Sample students added to database")

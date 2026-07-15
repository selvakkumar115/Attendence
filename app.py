from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from models import db, Student, Attendance
from datetime import datetime, date
from sqlalchemy import func

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database
db.init_app(app)

@app.before_first_request
def create_tables():
    db.create_all()

@app.route('/')
@app.route('/')
def index():
    """Home page showing dashboard with recent stats"""
    total_students = Student.query.count()
    today_attendance = Attendance.query.filter_by(date=date.today()).count()

    # Get recent registrations
    recent_students = Student.query.order_by(Student.id.desc()).limit(5).all()

    return render_template(
        'index.html',
        total_students=total_students,
        today_attendance=today_attendance,
        recent_students=recent_students,
        today_date=date.today().strftime("%b %d")
    )

@app.route('/register', methods=['GET', 'POST'])
def register_student():
    """Register a new student"""
    if request.method == 'POST':
        name = request.form['name']
        roll_number = request.form['roll_number']
        email = request.form.get('email', '')

        # Check if student already exists
        existing_student = Student.query.filter_by(roll_number=roll_number).first()
        if existing_student:
            flash('Student with this roll number already exists!', 'error')
            return render_template('register.html')

        # Create new student
        student = Student(name=name, roll_number=roll_number, email=email)
        db.session.add(student)
        db.session.commit()

        flash(f'Student {name} registered successfully!', 'success')
        return redirect(url_for('register_student'))

    # Get all students for display
    students = Student.query.all()
    return render_template('register.html', students=students)

@app.route('/attendance', methods=['GET', 'POST'])
def mark_attendance():
    """Mark attendance for students"""
    if request.method == 'POST':
        attendance_data = request.json
        attendance_date = datetime.strptime(attendance_data['date'], '%Y-%m-%d').date()

        # Clear existing attendance for this date
        Attendance.query.filter_by(date=attendance_date).delete()

        # Add new attendance records
        for student_id, status in attendance_data['attendance'].items():
            attendance = Attendance(
                student_id=int(student_id),
                date=attendance_date,
                status=status
            )
            db.session.add(attendance)

        db.session.commit()
        return jsonify({'success': True, 'message': 'Attendance marked successfully!'})

    # GET request - show attendance form
    students = Student.query.all()
    today_date = date.today().strftime('%Y-%m-%d')

    # Get existing attendance for today
    existing_attendance = {}
    today_records = Attendance.query.filter_by(date=date.today()).all()
    for record in today_records:
        existing_attendance[record.student_id] = record.status

    return render_template('attendance.html', 
                         students=students, 
                         today_date=today_date,
                         existing_attendance=existing_attendance)

@app.route('/reports')
def reports():
    """View attendance reports"""
    # Get date range from query parameters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    if not start_date or not end_date:
        # Default to current month
        today = date.today()
        start_date = today.replace(day=1).strftime('%Y-%m-%d')
        end_date = today.strftime('%Y-%m-%d')

    # Convert to date objects
    start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
    end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()

    # Calculate total working days
    total_days = (end_date_obj - start_date_obj).days + 1

    # Get attendance data
    students = Student.query.all()
    report_data = []

    for student in students:
        present_count = Attendance.query.filter(
            Attendance.student_id == student.id,
            Attendance.date >= start_date_obj,
            Attendance.date <= end_date_obj,
            Attendance.status == 'Present'
        ).count()

        total_marked_days = Attendance.query.filter(
            Attendance.student_id == student.id,
            Attendance.date >= start_date_obj,
            Attendance.date <= end_date_obj
        ).count()

        if total_marked_days > 0:
            percentage = (present_count / total_marked_days) * 100
        else:
            percentage = 0

        report_data.append({
            'student': student,
            'present_days': present_count,
            'total_days': total_marked_days,
            'percentage': round(percentage, 2)
        })

    return render_template('reports.html', 
                         report_data=report_data,
                         start_date=start_date,
                         end_date=end_date,
                         total_days=total_days)

@app.route('/student/<int:student_id>/delete', methods=['POST'])
def delete_student(student_id):
    """Delete a student and all their attendance records"""
    student = Student.query.get_or_404(student_id)

    # Delete associated attendance records first
    Attendance.query.filter_by(student_id=student_id).delete()

    # Delete the student
    db.session.delete(student)
    db.session.commit()

    flash(f'Student {student.name} deleted successfully!', 'success')
    return redirect(url_for('register_student'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

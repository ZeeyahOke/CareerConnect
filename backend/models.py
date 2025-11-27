from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone_number = db.Column(db.String(20))
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # student, mentor, admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    student_profile = db.relationship('Student', backref='user', uselist=False, cascade='all, delete-orphan')
    mentor_profile = db.relationship('Mentor', backref='user', uselist=False, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'email': self.email,
            'phone_number': self.phone_number,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Student(db.Model):
    __tablename__ = 'students'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    educational_background = db.Column(db.Text)
    career_interests = db.Column(db.Text)
    goals = db.Column(db.Text)
    
    # Relationships
    assessments = db.relationship('CareerAssessment', backref='student', cascade='all, delete-orphan')
    progress_trackers = db.relationship('ProgressTracker', backref='student', cascade='all, delete-orphan')
    sent_messages = db.relationship('Message', foreign_keys='Message.sender_id', backref='sender', cascade='all, delete-orphan')
    sessions_as_student = db.relationship('Session', foreign_keys='Session.student_id', backref='student', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'educational_background': self.educational_background,
            'career_interests': self.career_interests,
            'goals': self.goals
        }

class Mentor(db.Model):
    __tablename__ = 'mentors'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    professional_title = db.Column(db.String(100))
    industry = db.Column(db.String(100))
    verification_status = db.Column(db.String(20), default='pending')  # pending, verified, rejected
    bio = db.Column(db.Text)
    expertise = db.Column(db.Text)
    
    # Relationships
    resources = db.relationship('Resource', backref='mentor', cascade='all, delete-orphan')
    received_messages = db.relationship('Message', foreign_keys='Message.receiver_id', backref='receiver', cascade='all, delete-orphan')
    sessions_as_mentor = db.relationship('Session', foreign_keys='Session.mentor_id', backref='mentor', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'professional_title': self.professional_title,
            'industry': self.industry,
            'verification_status': self.verification_status,
            'bio': self.bio,
            'expertise': self.expertise
        }

class CareerAssessment(db.Model):
    __tablename__ = 'career_assessments'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    assessment_id = db.Column(db.String(50), unique=True, nullable=False)
    questionnaire = db.Column(db.Text)
    results = db.Column(db.Text)
    recommendations = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'assessment_id': self.assessment_id,
            'questionnaire': self.questionnaire,
            'results': self.results,
            'recommendations': self.recommendations,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ProgressTracker(db.Model):
    __tablename__ = 'progress_trackers'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    tracker_id = db.Column(db.String(50), unique=True, nullable=False)
    goals = db.Column(db.Text)
    milestones = db.Column(db.Text)
    mentor_feedback = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'tracker_id': self.tracker_id,
            'goals': self.goals,
            'milestones': self.milestones,
            'mentor_feedback': self.mentor_feedback,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    message_id = db.Column(db.String(50), unique=True, nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('mentors.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    read = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'message_id': self.message_id,
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'content': self.content,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'read': self.read
        }

class Session(db.Model):
    __tablename__ = 'sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(50), unique=True, nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    mentor_id = db.Column(db.Integer, db.ForeignKey('mentors.id'), nullable=False)
    date_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, scheduled, completed, cancelled
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'student_id': self.student_id,
            'mentor_id': self.mentor_id,
            'date_time': self.date_time.isoformat() if self.date_time else None,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Resource(db.Model):
    __tablename__ = 'resources'
    
    id = db.Column(db.Integer, primary_key=True)
    resource_id = db.Column(db.String(50), unique=True, nullable=False)
    mentor_id = db.Column(db.Integer, db.ForeignKey('mentors.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    file_type = db.Column(db.String(50))
    description = db.Column(db.Text)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    file_url = db.Column(db.String(500))
    
    def to_dict(self):
        return {
            'id': self.id,
            'resource_id': self.resource_id,
            'mentor_id': self.mentor_id,
            'title': self.title,
            'file_type': self.file_type,
            'description': self.description,
            'upload_date': self.upload_date.isoformat() if self.upload_date else None,
            'file_url': self.file_url
        }

class MentorshipRequest(db.Model):
    __tablename__ = 'mentorship_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    mentor_id = db.Column(db.Integer, db.ForeignKey('mentors.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    student = db.relationship('Student', backref='mentorship_requests')
    mentor = db.relationship('Mentor', backref='mentorship_requests')
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'mentor_id': self.mentor_id,
            'status': self.status,
            'message': self.message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

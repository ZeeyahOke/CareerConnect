from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Student, CareerAssessment, ProgressTracker, Mentor, MentorshipRequest
import uuid
import json

students_bp = Blueprint('students', __name__)

@students_bp.route('/profile', methods=['GET', 'PUT'])
@jwt_required()
def student_profile():
    try:
        user_id = get_jwt_identity()
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid token identity'}), 422
        user = User.query.get(user_id)
        
        if not user or user.role != 'student':
            return jsonify({'error': 'Unauthorized'}), 403
        
        if request.method == 'GET':
            if not user.student_profile:
                return jsonify({'error': 'Profile not found'}), 404
            
            return jsonify({
                'user': user.to_dict(),
                'profile': user.student_profile.to_dict()
            }), 200
        
        elif request.method == 'PUT':
            data = request.get_json()
            
            if not user.student_profile:
                student = Student(user_id=user.id)
                db.session.add(student)
            else:
                student = user.student_profile
            
            # Update fields
            if 'educational_background' in data:
                student.educational_background = data['educational_background']
            if 'career_interests' in data:
                student.career_interests = data['career_interests']
            if 'goals' in data:
                student.goals = data['goals']
            
            # Update user fields
            if 'name' in data:
                user.name = data['name']
            if 'phone_number' in data:
                user.phone_number = data['phone_number']
            
            db.session.commit()
            
            return jsonify({
                'message': 'Profile updated successfully',
                'user': user.to_dict(),
                'profile': student.to_dict()
            }), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@students_bp.route('/assessment', methods=['POST'])
@jwt_required()
def create_assessment():
    try:
        user_id = get_jwt_identity()
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid token identity'}), 422
        user = User.query.get(user_id)
        
        if not user or user.role != 'student':
            return jsonify({'error': 'Unauthorized'}), 403
        
        if not user.student_profile:
            return jsonify({'error': 'Student profile not found'}), 404
        
        data = request.get_json()
        
        # Create assessment
        assessment = CareerAssessment(
            student_id=user.student_profile.id,
            assessment_id=str(uuid.uuid4()),
            questionnaire=json.dumps(data.get('questionnaire', {})),
            results=json.dumps(data.get('results', {})),
            recommendations=json.dumps(data.get('recommendations', []))
        )
        
        db.session.add(assessment)
        db.session.commit()
        
        return jsonify({
            'message': 'Assessment completed successfully',
            'assessment': assessment.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@students_bp.route('/assessments', methods=['GET'])
@jwt_required()
def get_assessments():
    try:
        user_id = get_jwt_identity()
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid token identity'}), 422
        user = User.query.get(user_id)
        
        if not user or user.role != 'student':
            return jsonify({'error': 'Unauthorized'}), 403
        
        if not user.student_profile:
            return jsonify({'error': 'Student profile not found'}), 404
        
        assessments = CareerAssessment.query.filter_by(
            student_id=user.student_profile.id
        ).order_by(CareerAssessment.created_at.desc()).all()
        
        return jsonify({
            'assessments': [a.to_dict() for a in assessments]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@students_bp.route('/progress', methods=['GET', 'POST'])
@jwt_required()
def progress_tracker():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'student':
            return jsonify({'error': 'Unauthorized'}), 403
        
        if not user.student_profile:
            return jsonify({'error': 'Student profile not found'}), 404
        
        if request.method == 'GET':
            trackers = ProgressTracker.query.filter_by(
                student_id=user.student_profile.id
            ).order_by(ProgressTracker.updated_at.desc()).all()
            
            return jsonify({
                'trackers': [t.to_dict() for t in trackers]
            }), 200
        
        elif request.method == 'POST':
            data = request.get_json()
            
            tracker = ProgressTracker(
                student_id=user.student_profile.id,
                tracker_id=str(uuid.uuid4()),
                goals=json.dumps(data.get('goals', [])),
                milestones=json.dumps(data.get('milestones', []))
            )
            
            db.session.add(tracker)
            db.session.commit()
            
            return jsonify({
                'message': 'Progress tracker created',
                'tracker': tracker.to_dict()
            }), 201
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@students_bp.route('/progress/<tracker_id>', methods=['PUT'])
@jwt_required()
def update_progress(tracker_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'student':
            return jsonify({'error': 'Unauthorized'}), 403
        
        tracker = ProgressTracker.query.filter_by(tracker_id=tracker_id).first()
        
        if not tracker:
            return jsonify({'error': 'Tracker not found'}), 404
        
        if tracker.student_id != user.student_profile.id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        if 'goals' in data:
            tracker.goals = json.dumps(data['goals'])
        if 'milestones' in data:
            tracker.milestones = json.dumps(data['milestones'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Progress updated',
            'tracker': tracker.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

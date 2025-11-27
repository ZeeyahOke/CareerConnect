from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Mentor, Student, Resource, MentorshipRequest
from sqlalchemy import or_
import uuid

mentors_bp = Blueprint('mentors', __name__)

@mentors_bp.route('/profile', methods=['GET', 'PUT'])
@jwt_required()
def mentor_profile():
    try:
        user_id = get_jwt_identity()
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid token identity'}), 422
        user = User.query.get(user_id)
        
        if not user or user.role != 'mentor':
            return jsonify({'error': 'Unauthorized'}), 403
        
        if request.method == 'GET':
            if not user.mentor_profile:
                return jsonify({'error': 'Profile not found'}), 404
            
            return jsonify({
                'user': user.to_dict(),
                'profile': user.mentor_profile.to_dict()
            }), 200
        
        elif request.method == 'PUT':
            data = request.get_json()
            
            if not user.mentor_profile:
                mentor = Mentor(user_id=user.id)
                db.session.add(mentor)
            else:
                mentor = user.mentor_profile
            
            # Update fields
            if 'professional_title' in data:
                mentor.professional_title = data['professional_title']
            if 'industry' in data:
                mentor.industry = data['industry']
            if 'bio' in data:
                mentor.bio = data['bio']
            if 'expertise' in data:
                mentor.expertise = data['expertise']
            
            # Update user fields
            if 'name' in data:
                user.name = data['name']
            if 'phone_number' in data:
                user.phone_number = data['phone_number']
            
            db.session.commit()
            
            return jsonify({
                'message': 'Profile updated successfully',
                'user': user.to_dict(),
                'profile': mentor.to_dict()
            }), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@mentors_bp.route('/search', methods=['GET'])
@jwt_required()
def search_mentors():
    try:
        # Get query parameters
        industry = request.args.get('industry')
        expertise = request.args.get('expertise')
        
        # Build query
        query = Mentor.query.filter_by(verification_status='verified')
        
        if industry:
            query = query.filter(Mentor.industry.ilike(f'%{industry}%'))
        if expertise:
            query = query.filter(Mentor.expertise.ilike(f'%{expertise}%'))
        
        mentors = query.all()
        
        # Get user data for each mentor
        result = []
        for mentor in mentors:
            mentor_data = mentor.to_dict()
            mentor_data['user'] = mentor.user.to_dict()
            result.append(mentor_data)
        
        return jsonify({'mentors': result}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@mentors_bp.route('/<int:mentor_id>', methods=['GET'])
@jwt_required()
def get_mentor(mentor_id):
    try:
        mentor = Mentor.query.get(mentor_id)
        
        if not mentor:
            return jsonify({'error': 'Mentor not found'}), 404
        
        mentor_data = mentor.to_dict()
        mentor_data['user'] = mentor.user.to_dict()
        
        return jsonify({'mentor': mentor_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@mentors_bp.route('/request', methods=['POST'])
@jwt_required()
def request_mentorship():
    try:
        user_id = get_jwt_identity()
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid token identity'}), 422
        user = User.query.get(user_id)
        
        if not user or user.role != 'student':
            return jsonify({'error': 'Only students can request mentorship'}), 403
        
        if not user.student_profile:
            return jsonify({'error': 'Student profile not found'}), 404
        
        data = request.get_json()
        mentor_id = data.get('mentor_id')
        message = data.get('message', '')
        
        if not mentor_id:
            return jsonify({'error': 'Mentor ID required'}), 400
        
        # Check if mentor exists and is verified
        mentor = Mentor.query.get(mentor_id)
        if not mentor:
            return jsonify({'error': 'Mentor not found'}), 404
        
        if mentor.verification_status != 'verified':
            return jsonify({'error': 'Mentor is not verified'}), 400
        
        # Check if request already exists
        existing = MentorshipRequest.query.filter_by(
            student_id=user.student_profile.id,
            mentor_id=mentor_id,
            status='pending'
        ).first()
        
        if existing:
            return jsonify({'error': 'Request already pending'}), 400
        
        # Create request
        mentorship_request = MentorshipRequest(
            student_id=user.student_profile.id,
            mentor_id=mentor_id,
            message=message,
            status='pending'
        )
        
        db.session.add(mentorship_request)
        db.session.commit()
        
        return jsonify({
            'message': 'Mentorship request sent',
            'request': mentorship_request.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@mentors_bp.route('/requests', methods=['GET'])
@jwt_required()
def get_mentorship_requests():
    try:
        user_id = get_jwt_identity()
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid token identity'}), 422
        user = User.query.get(user_id)
        
        if not user or user.role != 'mentor':
            return jsonify({'error': 'Unauthorized'}), 403
        
        if not user.mentor_profile:
            return jsonify({'error': 'Mentor profile not found'}), 404
        
        requests = MentorshipRequest.query.filter_by(
            mentor_id=user.mentor_profile.id
        ).order_by(MentorshipRequest.created_at.desc()).all()
        
        result = []
        for req in requests:
            req_data = req.to_dict()
            req_data['student_user'] = req.student.user.to_dict()
            req_data['student_profile'] = req.student.to_dict()
            result.append(req_data)
        
        return jsonify({'requests': result}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@mentors_bp.route('/requests/<int:request_id>', methods=['PUT'])
@jwt_required()
def respond_to_request(request_id):
    try:
        user_id = get_jwt_identity()
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid token identity'}), 422
        user = User.query.get(user_id)
        
        if not user or user.role != 'mentor':
            return jsonify({'error': 'Unauthorized'}), 403
        
        mentorship_request = MentorshipRequest.query.get(request_id)
        
        if not mentorship_request:
            return jsonify({'error': 'Request not found'}), 404
        
        if mentorship_request.mentor_id != user.mentor_profile.id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        status = data.get('status')
        
        if status not in ['approved', 'rejected']:
            return jsonify({'error': 'Invalid status'}), 400
        
        mentorship_request.status = status
        db.session.commit()
        
        return jsonify({
            'message': f'Request {status}',
            'request': mentorship_request.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@mentors_bp.route('/resources', methods=['GET', 'POST'])
@jwt_required()
def mentor_resources():
    try:
        user_id = get_jwt_identity()
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid token identity'}), 422
        user = User.query.get(user_id)
        
        if not user or user.role != 'mentor':
            return jsonify({'error': 'Unauthorized'}), 403
        
        if not user.mentor_profile:
            return jsonify({'error': 'Mentor profile not found'}), 404
        
        if request.method == 'GET':
            resources = Resource.query.filter_by(
                mentor_id=user.mentor_profile.id
            ).order_by(Resource.upload_date.desc()).all()
            
            return jsonify({
                'resources': [r.to_dict() for r in resources]
            }), 200
        
        elif request.method == 'POST':
            data = request.get_json()
            
            resource = Resource(
                resource_id=str(uuid.uuid4()),
                mentor_id=user.mentor_profile.id,
                title=data.get('title'),
                file_type=data.get('file_type'),
                description=data.get('description'),
                file_url=data.get('file_url')
            )
            
            db.session.add(resource)
            db.session.commit()
            
            return jsonify({
                'message': 'Resource uploaded',
                'resource': resource.to_dict()
            }), 201
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

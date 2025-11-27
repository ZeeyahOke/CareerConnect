from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Mentor, Student, Session, Message, MentorshipRequest
from sqlalchemy import func

admin_bp = Blueprint('admin', __name__)

def admin_required():
    # Convert JWT identity (string) back to int and validate admin role
    user_id = get_jwt_identity()
    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return None
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return None
    return user

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    try:
        user = admin_required()
        if not user:
            return jsonify({'error': 'Unauthorized - Admin access required'}), 403
        
        role = request.args.get('role')
        
        query = User.query
        if role:
            query = query.filter_by(role=role)
        
        users = query.order_by(User.created_at.desc()).all()
        
        result = []
        for u in users:
            user_data = u.to_dict()
            if u.role == 'student' and u.student_profile:
                user_data['profile'] = u.student_profile.to_dict()
            elif u.role == 'mentor' and u.mentor_profile:
                user_data['profile'] = u.mentor_profile.to_dict()
            result.append(user_data)
        
        return jsonify({'users': result}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    try:
        admin = admin_required()
        if not admin:
            return jsonify({'error': 'Unauthorized - Admin access required'}), 403
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.role == 'admin':
            return jsonify({'error': 'Cannot delete admin users'}), 400
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/mentors/verify/<int:mentor_id>', methods=['PUT'])
@jwt_required()
def verify_mentor(mentor_id):
    try:
        user = admin_required()
        if not user:
            return jsonify({'error': 'Unauthorized - Admin access required'}), 403
        
        mentor = Mentor.query.get(mentor_id)
        
        if not mentor:
            return jsonify({'error': 'Mentor not found'}), 404
        
        data = request.get_json()
        status = data.get('status')
        
        if status not in ['verified', 'rejected']:
            return jsonify({'error': 'Invalid status'}), 400
        
        mentor.verification_status = status
        db.session.commit()
        
        return jsonify({
            'message': f'Mentor {status}',
            'mentor': mentor.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/mentors/pending', methods=['GET'])
@jwt_required()
def get_pending_mentors():
    try:
        user = admin_required()
        if not user:
            return jsonify({'error': 'Unauthorized - Admin access required'}), 403
        
        mentors = Mentor.query.filter_by(verification_status='pending').all()
        
        result = []
        for mentor in mentors:
            mentor_data = mentor.to_dict()
            mentor_data['user'] = mentor.user.to_dict()
            result.append(mentor_data)
        
        return jsonify({'mentors': result}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    try:
        user = admin_required()
        if not user:
            return jsonify({'error': 'Unauthorized - Admin access required'}), 403
        
        # Get counts
        total_users = User.query.count()
        total_students = User.query.filter_by(role='student').count()
        total_mentors = User.query.filter_by(role='mentor').count()
        verified_mentors = Mentor.query.filter_by(verification_status='verified').count()
        pending_mentors = Mentor.query.filter_by(verification_status='pending').count()
        total_sessions = Session.query.count()
        completed_sessions = Session.query.filter_by(status='completed').count()
        total_messages = Message.query.count()
        pending_requests = MentorshipRequest.query.filter_by(status='pending').count()
        
        return jsonify({
            'stats': {
                'total_users': total_users,
                'total_students': total_students,
                'total_mentors': total_mentors,
                'verified_mentors': verified_mentors,
                'pending_mentors': pending_mentors,
                'total_sessions': total_sessions,
                'completed_sessions': completed_sessions,
                'total_messages': total_messages,
                'pending_requests': pending_requests
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/reports/sessions', methods=['GET'])
@jwt_required()
def get_session_report():
    try:
        user = admin_required()
        if not user:
            return jsonify({'error': 'Unauthorized - Admin access required'}), 403
        
        sessions = Session.query.order_by(Session.date_time.desc()).limit(100).all()
        
        result = []
        for session in sessions:
            session_data = session.to_dict()
            session_data['student_name'] = session.student.user.name
            session_data['mentor_name'] = session.mentor.user.name
            result.append(session_data)
        
        return jsonify({'sessions': result}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_admin_profile():
    try:
        admin = admin_required()
        if not admin:
            return jsonify({'error': 'Unauthorized - Admin access required'}), 403

        data = request.get_json() or {}

        # Allow updating basic user fields: name, phone_number, email (with uniqueness check)
        if 'name' in data:
            admin.name = data.get('name')

        if 'phone_number' in data:
            admin.phone_number = data.get('phone_number')

        if 'email' in data:
            new_email = data.get('email')
            if new_email and new_email != admin.email:
                # Ensure email is not used by another user
                existing = User.query.filter_by(email=new_email).first()
                if existing:
                    return jsonify({'error': 'Email already in use'}), 400
                admin.email = new_email

        db.session.commit()

        return jsonify({'message': 'Profile updated', 'user': admin.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

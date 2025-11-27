from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User, Student, Mentor
import uuid

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'password', 'role']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create user
        user = User(
            user_id=str(uuid.uuid4()),
            name=data['name'],
            email=data['email'],
            phone_number=data.get('phone_number'),
            role=data['role']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.flush()
        
        # Create role-specific profile
        if data['role'] == 'student':
            student = Student(
                user_id=user.id,
                educational_background=data.get('educational_background'),
                career_interests=data.get('career_interests'),
                goals=data.get('goals')
            )
            db.session.add(student)
        elif data['role'] == 'mentor':
            mentor = Mentor(
                user_id=user.id,
                professional_title=data.get('professional_title'),
                industry=data.get('industry'),
                bio=data.get('bio'),
                expertise=data.get('expertise'),
                verification_status='pending'
            )
            db.session.add(mentor)
        
        db.session.commit()
        
        # Create access token (identity must be a string for JWT 'sub')
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        access_token = create_access_token(identity=str(user.id))
        
        # Get profile data
        profile = None
        if user.role == 'student' and user.student_profile:
            profile = user.student_profile.to_dict()
        elif user.role == 'mentor' and user.mentor_profile:
            profile = user.mentor_profile.to_dict()
        
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict(),
            'profile': profile
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        # JWT identity is stored as a string; convert back to int for DB lookup
        user_id = get_jwt_identity()
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid token identity'}), 422
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get profile data
        profile = None
        if user.role == 'student' and user.student_profile:
            profile = user.student_profile.to_dict()
        elif user.role == 'mentor' and user.mentor_profile:
            profile = user.mentor_profile.to_dict()
        
        return jsonify({
            'user': user.to_dict(),
            'profile': profile
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/password-reset', methods=['POST'])
def password_reset():
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email required'}), 400
        
        user = User.query.filter_by(email=email).first()
        
        if not user:
            # Don't reveal if email exists
            return jsonify({'message': 'If the email exists, a reset link has been sent'}), 200
        
        # TODO: Implement email sending logic
        # For now, just return success
        return jsonify({'message': 'Password reset email sent'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Message, Session, Student, Mentor
from datetime import datetime
import uuid

communications_bp = Blueprint('communications', __name__)

@communications_bp.route('/messages', methods=['GET', 'POST'])
@jwt_required()
def messages():
    try:
        user_id = get_jwt_identity()
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid token identity'}), 422
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if request.method == 'GET':
            # Get messages for the user
            if user.role == 'student':
                if not user.student_profile:
                    return jsonify({'messages': []}), 200
                
                messages = Message.query.filter_by(
                    sender_id=user.student_profile.id
                ).order_by(Message.timestamp.desc()).all()
                
            elif user.role == 'mentor':
                if not user.mentor_profile:
                    return jsonify({'messages': []}), 200
                
                messages = Message.query.filter_by(
                    receiver_id=user.mentor_profile.id
                ).order_by(Message.timestamp.desc()).all()
            else:
                return jsonify({'messages': []}), 200
            
            result = []
            for msg in messages:
                msg_data = msg.to_dict()
                msg_data['sender_name'] = msg.sender.user.name
                msg_data['receiver_name'] = msg.receiver.user.name
                result.append(msg_data)
            
            return jsonify({'messages': result}), 200
        
        elif request.method == 'POST':
            # Send a message (student to mentor)
            if user.role != 'student':
                return jsonify({'error': 'Only students can send messages'}), 403
            
            if not user.student_profile:
                return jsonify({'error': 'Student profile not found'}), 404
            
            data = request.get_json()
            receiver_id = data.get('receiver_id')
            content = data.get('content')
            
            if not receiver_id or not content:
                return jsonify({'error': 'Receiver ID and content required'}), 400
            
            # Verify receiver is a mentor
            mentor = Mentor.query.get(receiver_id)
            if not mentor:
                return jsonify({'error': 'Mentor not found'}), 404
            
            message = Message(
                message_id=str(uuid.uuid4()),
                sender_id=user.student_profile.id,
                receiver_id=receiver_id,
                content=content
            )
            
            db.session.add(message)
            db.session.commit()
            
            return jsonify({
                'message': 'Message sent',
                'data': message.to_dict()
            }), 201
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@communications_bp.route('/messages/<int:message_id>/read', methods=['PUT'])
@jwt_required()
def mark_message_read(message_id):
    try:
        user_id = get_jwt_identity()
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid token identity'}), 422
        user = User.query.get(user_id)
        
        if not user or user.role != 'mentor':
            return jsonify({'error': 'Unauthorized'}), 403
        
        message = Message.query.get(message_id)
        
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        if message.receiver_id != user.mentor_profile.id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        message.read = True
        db.session.commit()
        
        return jsonify({'message': 'Message marked as read'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@communications_bp.route('/sessions', methods=['GET', 'POST'])
@jwt_required()
def sessions():
    try:
        user_id = get_jwt_identity()
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid token identity'}), 422
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if request.method == 'GET':
            # Get sessions for the user
            if user.role == 'student':
                if not user.student_profile:
                    return jsonify({'sessions': []}), 200
                
                sessions = Session.query.filter_by(
                    student_id=user.student_profile.id
                ).order_by(Session.date_time.desc()).all()
                
            elif user.role == 'mentor':
                if not user.mentor_profile:
                    return jsonify({'sessions': []}), 200
                
                sessions = Session.query.filter_by(
                    mentor_id=user.mentor_profile.id
                ).order_by(Session.date_time.desc()).all()
            else:
                return jsonify({'sessions': []}), 200
            
            result = []
            for session in sessions:
                session_data = session.to_dict()
                session_data['student_name'] = session.student.user.name
                session_data['mentor_name'] = session.mentor.user.name
                result.append(session_data)
            
            return jsonify({'sessions': result}), 200
        
        elif request.method == 'POST':
            # Create a session (student requests)
            if user.role != 'student':
                return jsonify({'error': 'Only students can request sessions'}), 403
            
            if not user.student_profile:
                return jsonify({'error': 'Student profile not found'}), 404
            
            data = request.get_json()
            mentor_id = data.get('mentor_id')
            date_time_str = data.get('date_time')
            
            if not mentor_id or not date_time_str:
                return jsonify({'error': 'Mentor ID and date_time required'}), 400
            
            # Verify mentor exists
            mentor = Mentor.query.get(mentor_id)
            if not mentor:
                return jsonify({'error': 'Mentor not found'}), 404
            
            # Parse datetime
            try:
                date_time = datetime.fromisoformat(date_time_str.replace('Z', '+00:00'))
            except:
                return jsonify({'error': 'Invalid date_time format'}), 400
            
            session = Session(
                session_id=str(uuid.uuid4()),
                student_id=user.student_profile.id,
                mentor_id=mentor_id,
                date_time=date_time,
                status='pending'
            )
            
            db.session.add(session)
            db.session.commit()
            
            return jsonify({
                'message': 'Session requested',
                'session': session.to_dict()
            }), 201
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@communications_bp.route('/sessions/<int:session_id>', methods=['PUT'])
@jwt_required()
def update_session(session_id):
    try:
        user_id = get_jwt_identity()
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid token identity'}), 422
        user = User.query.get(user_id)
        
        session = Session.query.get(session_id)
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        data = request.get_json()
        
        # Mentor can approve/reject or add notes
        if user.role == 'mentor':
            if session.mentor_id != user.mentor_profile.id:
                return jsonify({'error': 'Unauthorized'}), 403
            
            if 'status' in data:
                if data['status'] in ['scheduled', 'completed', 'cancelled']:
                    session.status = data['status']
            
            if 'notes' in data:
                session.notes = data['notes']
        
        # Student can cancel
        elif user.role == 'student':
            if session.student_id != user.student_profile.id:
                return jsonify({'error': 'Unauthorized'}), 403
            
            if 'status' in data and data['status'] == 'cancelled':
                session.status = 'cancelled'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Session updated',
            'session': session.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

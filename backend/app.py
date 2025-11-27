from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db
import os

def create_app():
    app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
    app.config.from_object(Config)
    
    # Initialize extensions
    CORS(app)
    db.init_app(app)
    JWTManager(app)
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.students import students_bp
    from routes.mentors import mentors_bp
    from routes.communications import communications_bp
    from routes.admin import admin_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(students_bp, url_prefix='/api/students')
    app.register_blueprint(mentors_bp, url_prefix='/api/mentors')
    app.register_blueprint(communications_bp, url_prefix='/api/communications')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'CareerConnect API is running'}), 200
    
    # Serve React app
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')
    
    # Create tables
    with app.app_context():
        db.create_all()
        
        # Create default admin user if not exists
        from models import User
        admin = User.query.filter_by(email='admin@careerconnect.com').first()
        if not admin:
            admin = User(
                user_id='admin-001',
                name='Admin User',
                email='admin@careerconnect.com',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print('Default admin user created: admin@careerconnect.com / admin123')
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)

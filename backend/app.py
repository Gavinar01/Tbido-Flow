from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from datetime import timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.test')

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, origins=["http://localhost:3000", "http://localhost:5173"])

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///tbido_flow.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'tbido-flow-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()

# Import models after db initialization
from models_new import User, Venue, Reservation, KeyValueStore, db

# Initialize extensions with app
db.init_app(app)
jwt.init_app(app)

# Create tables and ensure default venues exist
with app.app_context():
    db.create_all()
    
    # Default venues
    DEFAULT_VENUES = [
        {'id': '1', 'name': 'Conference Room A', 'capacity': 20},
        {'id': '2', 'name': 'Conference Room B', 'capacity': 15},
        {'id': '3', 'name': 'Meeting Room 1', 'capacity': 8},
        {'id': '4', 'name': 'Meeting Room 2', 'capacity': 6},
        {'id': '5', 'name': 'Main Hall', 'capacity': 20}
    ]
    
    # Ensure default venues exist
    for venue_data in DEFAULT_VENUES:
        venue = Venue.query.filter_by(id=venue_data['id']).first()
        if not venue:
            venue = Venue(
                id=venue_data['id'],
                name=venue_data['name'],
                capacity=venue_data['capacity']
            )
            db.session.add(venue)
    db.session.commit()

# Routes
@app.route('/make-server-1bbfbc2f/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name', '')
        is_admin = data.get('isAdmin', False)
        
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'User already exists'}), 400
        
        # Create new user
        user = User(
            email=email,
            name=name,
            is_admin=is_admin
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'user': {
                'id': user.id,
                'email': user.email,
                'user_metadata': {
                    'name': user.name,
                    'isAdmin': user.is_admin
                }
            },
            'access_token': access_token
        }), 200
        
    except Exception as e:
        print(f"Signup error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/make-server-1bbfbc2f/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'user': {
                'id': user.id,
                'email': user.email,
                'user_metadata': {
                    'name': user.name,
                    'isAdmin': user.is_admin
                }
            },
            'access_token': access_token
        }), 200
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/make-server-1bbfbc2f/venues', methods=['GET'])
def get_venues():
    try:
        venues = Venue.query.all()
        venues_data = []
        
        for venue in venues:
            venues_data.append({
                'id': venue.id,
                'name': venue.name,
                'capacity': venue.capacity
            })
        
        # Store in key-value store to match original behavior
        kv_data = KeyValueStore(key='venues', value=venues_data)
        existing_kv = KeyValueStore.query.filter_by(key='venues').first()
        if existing_kv:
            existing_kv.value = venues_data
        else:
            db.session.add(kv_data)
        db.session.commit()
        
        return jsonify(venues_data), 200
        
    except Exception as e:
        print(f"Error fetching venues: {str(e)}")
        return jsonify({'error': 'Failed to fetch venues'}), 500

@app.route('/make-server-1bbfbc2f/reservations', methods=['POST'])
@jwt_required()
def create_reservation():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
        
        data = request.get_json()
        
        # Validate time range (8 AM to 5 PM)
        start_hour = int(data['startTime'].split(':')[0])
        end_hour = int(data['endTime'].split(':')[0])
        
        if start_hour < 8 or end_hour > 17 or start_hour >= end_hour:
            return jsonify({'error': 'Invalid time range. Reservations must be between 8:00 AM and 5:00 PM.'}), 400

        if data.get('maxParticipants', 0) > 20:
            return jsonify({'error': 'Maximum participants cannot exceed 20 people.'}), 400
        
        # Check for conflicts
        existing_reservations = Reservation.query.filter_by(
            venue=data['venue'],
            date=data['date']
        ).all()
        
        for reservation in existing_reservations:
            # Check time conflicts
            if ((data['startTime'] >= reservation.start_time and data['startTime'] < reservation.end_time) or
                (data['endTime'] > reservation.start_time and data['endTime'] <= reservation.end_time) or
                (data['startTime'] <= reservation.start_time and data['endTime'] >= reservation.end_time)):
                return jsonify({'error': 'Time slot conflicts with existing reservation'}), 400
        
        # Create reservation
        reservation = Reservation(
            user_id=current_user_id,
            venue=data['venue'],
            purpose=data['purpose'],
            date=data['date'],
            start_time=data['startTime'],
            end_time=data['endTime'],
            name=data['name'],
            organization=data.get('organization', ''),
            max_participants=data.get('maxParticipants', 0),
            status='confirmed'
        )
        
        db.session.add(reservation)
        db.session.commit()
        
        # Add to key-value store
        reservations = KeyValueStore.query.filter_by(key='reservations').first()
        if reservations:
            reservations_list = reservations.value if isinstance(reservations.value, list) else []
        else:
            reservations_list = []
        
        reservation_data = {
            'id': reservation.id,
            'userId': reservation.user_id,
            'userEmail': user.email,
            'userName': user.name,
            'venue': reservation.venue,
            'purpose': reservation.purpose,
            'date': reservation.date,
            'startTime': reservation.start_time,
            'endTime': reservation.end_time,
            'name': reservation.name,
            'organization': reservation.organization,
            'maxParticipants': reservation.max_participants,
            'status': reservation.status,
            'createdAt': reservation.created_at.isoformat()
        }
        
        reservations_list.append(reservation_data)
        
        if reservations:
            reservations.value = reservations_list
        else:
            reservations = KeyValueStore(key='reservations', value=reservations_list)
            db.session.add(reservations)
        
        db.session.commit()
        
        # Mock email notification
        print(f"Email notification sent to {user.email}: Venue reservation confirmed for {reservation.date} from {reservation.start_time} to {reservation.end_time}")
        
        return jsonify({'reservation': reservation_data}), 200
        
    except Exception as e:
        print(f"Error creating reservation: {str(e)}")
        return jsonify({'error': 'Failed to create reservation'}), 500

@app.route('/make-server-1bbfbc2f/reservations', methods=['GET'])
@jwt_required()
def get_reservations():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Get from key-value store
        reservations_kv = KeyValueStore.query.filter_by(key='reservations').first()
        if reservations_kv:
            reservations_list = reservations_kv.value if isinstance(reservations_kv.value, list) else []
        else:
            reservations_list = []
        
        # If admin, return all reservations, otherwise only user's reservations
        if user.is_admin:
            filtered_reservations = reservations_list
        else:
            filtered_reservations = [r for r in reservations_list if r.get('userId') == current_user_id]
        
        return jsonify(filtered_reservations), 200
        
    except Exception as e:
        print(f"Error fetching reservations: {str(e)}")
        return jsonify({'error': 'Failed to fetch reservations'}), 500

@app.route('/make-server-1bbfbc2f/reservations/<reservation_id>/attendance', methods=['PUT'])
@jwt_required()
def update_attendance(reservation_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 401
        
        data = request.get_json()
        attendance = data.get('attendance', [])
        
        # Update in key-value store
        reservations_kv = KeyValueStore.query.filter_by(key='reservations').first()
        if reservations_kv:
            reservations_list = reservations_kv.value if isinstance(reservations_kv.value, list) else []
            
            for i, reservation in enumerate(reservations_list):
                if str(reservation.get('id')) == str(reservation_id):
                    reservations_list[i]['attendance'] = attendance
                    break
            
            reservations_kv.value = reservations_list
            db.session.commit()
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        print(f"Error updating attendance: {str(e)}")
        return jsonify({'error': 'Failed to update attendance'}), 500

@app.route('/make-server-1bbfbc2f/reservations/<reservation_id>', methods=['DELETE'])
@jwt_required()
def delete_reservation(reservation_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Update in key-value store
        reservations_kv = KeyValueStore.query.filter_by(key='reservations').first()
        if reservations_kv:
            reservations_list = reservations_kv.value if isinstance(reservations_kv.value, list) else []
            
            reservation_to_delete = None
            for i, reservation in enumerate(reservations_list):
                if str(reservation.get('id')) == str(reservation_id):
                    reservation_to_delete = reservation
                    # Allow deletion by reservation owner or admin
                    if reservation.get('userId') != current_user_id and not user.is_admin:
                        return jsonify({'error': 'Unauthorized to delete this reservation'}), 403
                    reservations_list.pop(i)
                    break
            
            if not reservation_to_delete:
                return jsonify({'error': 'Reservation not found'}), 404
            
            reservations_kv.value = reservations_list
            db.session.commit()
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        print(f"Error deleting reservation: {str(e)}")
        return jsonify({'error': 'Failed to delete reservation'}), 500

# JWT user loader
@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return User.query.filter_by(id=identity).first()

if __name__ == '__main__':
    app.run(debug=True, port=5000)

from app import app, db
from models import User, Venue, Reservation, KeyValueStore

# Default venues
DEFAULT_VENUES = [
    {'id': '1', 'name': 'Conference Room A', 'capacity': 20},
    {'id': '2', 'name': 'Conference Room B', 'capacity': 15},
    {'id': '3', 'name': 'Meeting Room 1', 'capacity': 8},
    {'id': '4', 'name': 'Meeting Room 2', 'capacity': 6},
    {'id': '5', 'name': 'Main Hall', 'capacity': 20}
]

def init_database():
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Add default venues if they don't exist
        for venue_data in DEFAULT_VENUES:
            venue = Venue.query.filter_by(id=venue_data['id']).first()
            if not venue:
                venue = Venue(
                    id=venue_data['id'],
                    name=venue_data['name'],
                    capacity=venue_data['capacity']
                )
                db.session.add(venue)
        
        # Commit changes
        db.session.commit()
        print("Database initialized successfully!")

if __name__ == '__main__':
    init_database()

from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Date, func, JSON

# Create a global db instance
db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.current_timestamp())
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.email}>'

class Venue(db.Model):
    __tablename__ = 'venues'
    
    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    capacity = Column(Integer, nullable=False)
    
    def __repr__(self):
        return f'<Venue {self.name}>'

class Reservation(db.Model):
    __tablename__ = 'reservations'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    venue = Column(String(50), nullable=False)
    purpose = Column(Text, nullable=False)
    date = Column(Date, nullable=False)
    start_time = Column(String(10), nullable=False)
    end_time = Column(String(10), nullable=False)
    name = Column(String(100), nullable=False)
    organization = Column(String(100), nullable=True)
    max_participants = Column(Integer, nullable=False, default=0)
    status = Column(String(20), nullable=False, default='confirmed')
    created_at = Column(DateTime, default=func.current_timestamp())
    
    def __repr__(self):
        return f'<Reservation {self.purpose} on {self.date}>'

class KeyValueStore(db.Model):
    __tablename__ = 'kv_store_1bbfbc2f'
    
    key = Column(Text, primary_key=True)
    value = Column(JSON, nullable=False)
    
    def __repr__(self):
        return f'<KeyValueStore {self.key}>'

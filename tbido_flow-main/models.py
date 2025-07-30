from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class SessionLog(db.Model):
    __tablename__ = 'session_logs'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=False, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    position = db.Column(db.String(100), nullable=True)
    terms = db.Column(db.Boolean, nullable=False, default=False)
    timein = db.Column(db.DateTime, nullable=True)
    timeout = db.Column(db.DateTime, nullable=True)
    login = db.Column(db.Boolean, nullable=True)     # Fixed: lowercase `boolean` → `Boolean`
    logout = db.Column(db.Boolean, nullable=True)
    resources = db.Column(db.Text, nullable=True)
    feedback = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f"<SessionLog {self.email}>"

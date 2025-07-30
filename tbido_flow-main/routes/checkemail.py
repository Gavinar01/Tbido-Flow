from flask import Blueprint, request, jsonify
from models import SessionLog, db
from datetime import datetime

checkemail = Blueprint('checkemail', __name__)

@checkemail.route('/check-login-status', methods=['POST'])
def check_login_status():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    today = datetime.now().date()

    # Get the latest session for today by email
    session = SessionLog.query.filter(
        SessionLog.email == email,
        db.func.date(SessionLog.timein) == today
    ).order_by(SessionLog.timein.desc()).first()

    if session:
        if session.login is True and session.logout is None:
            return jsonify({
                "status": "email_already_logged_in",
                "next_modal": "logout",
                "message": "You are already logged in today. Please proceed to log out.",
                "session_id": session.id,
                "timein": session.timein.isoformat()
            })
        else:
            logout_time = session.timeout.strftime('%I:%M %p') if session.timeout else "N/A"
            return jsonify({
                "status": "logged_out",
                "next_modal": "login",
                "message": f"You are logged out. Last logout was at {logout_time}. You may log in again.",
                "session_id": session.id,
                "logout_time": session.timeout.isoformat() if session.timeout else None
            })
    else:
        return jsonify({
            "status": "not_existing",
            "next_modal": "login",
            "message": "No session found for today. Please log in to start your session."
        })

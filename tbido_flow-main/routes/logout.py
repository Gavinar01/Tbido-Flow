from flask import Blueprint, request, jsonify
from models import SessionLog, db
from datetime import datetime

logout_api = Blueprint('logout_api', __name__)

@logout_api.route('/logout', methods=['POST'])
def logout_user():
    data = request.get_json()

    email = data.get("email")
    resources = data.get("resources")
    feedback = data.get("feedback")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    today = datetime.now().date()

    # Check if session already logged out today (latest logout = True)
    already_logged_out = SessionLog.query.filter(
        SessionLog.email == email,
        db.func.date(SessionLog.timein) == today,
        SessionLog.logout == True
    ).order_by(SessionLog.timeout.desc()).first()

    # Check if there is an active session not yet logged out
    active_session = SessionLog.query.filter(
        SessionLog.email == email,
        db.func.date(SessionLog.timein) == today,
        SessionLog.login == True,
        SessionLog.logout == None
    ).order_by(SessionLog.timein.desc()).first()

    if not active_session:
        if already_logged_out:
            formatted_timeout = already_logged_out.timeout.strftime('%I:%M %p') if already_logged_out.timeout else "unknown time"
            return jsonify({
                "status": "already_logged_out",
                "message": f"You have already logged out today at {formatted_timeout}.",
                "session_id": already_logged_out.id,
                "timeout": already_logged_out.timeout.isoformat() if already_logged_out.timeout else None
            }), 200
        else:
            return jsonify({
                "status": "error",
                "message": "No active login session found for today."
            }), 404

    # Perform logout update
    active_session.resources = resources
    active_session.feedback = feedback
    active_session.logout = True
    active_session.timeout = datetime.now()

    try:
        db.session.commit()
        return jsonify({
            "status": "success",
            "message": "User logged out successfully.",
            "session_id": active_session.id,
            "timeout": active_session.timeout.isoformat()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Logout failed.",
            "error": str(e)
        }), 500

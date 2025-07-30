from flask import Blueprint, request, jsonify
from models import SessionLog, db
from datetime import datetime

login_api = Blueprint('login_api', __name__)

@login_api.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()

    email = data.get("email")
    name = data.get("name")
    position = data.get("position")
    terms = data.get("terms")

    if not all([email, name, position, terms is not None]):
        return jsonify({"error": "Missing required fields"}), 400

    today = datetime.now().date()

    # ✅ Check if still logged in (login=True and logout=None)
    existing_session = SessionLog.query.filter(
        SessionLog.email == email,
        db.func.date(SessionLog.timein) == today,
        SessionLog.login == True,
        SessionLog.logout == None
    ).first()

    if existing_session:
        formatted_timein = existing_session.timein.strftime('%I:%M %p')
        return jsonify({
            "status": "already_logged_in",
            "message": f"User already logged in today at {formatted_timein}. Please log out first.",
            "session_id": existing_session.id,
            "timein": existing_session.timein.isoformat()
        }), 200

    # ✅ Allow login (new session) if no active login
    new_session = SessionLog(
        email=email,
        name=name,
        position=position,
        terms=bool(terms),
        timein=datetime.now(),
        login=True,
        logout=None,
        timeout=None
    )

    try:
        db.session.add(new_session)
        db.session.commit()
        return jsonify({
            "status": "success",
            "message": "User login recorded.",
            "session_id": new_session.id
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Could not create login session.",
            "error": str(e)
        }), 500

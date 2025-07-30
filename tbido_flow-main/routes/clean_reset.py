from flask import Blueprint, jsonify
from models import db
from sqlalchemy import text

clean_reset_api = Blueprint('clean_reset_api', __name__)

@clean_reset_api.route('/reset-session-logs', methods=['POST'])
def reset_session_logs():
    try:
        # Delete all rows
        db.session.execute(text("DELETE FROM session_logs"))

        # Reset the ID sequence
        db.session.execute(text("ALTER SEQUENCE session_logs_id_seq RESTART WITH 1"))

        db.session.commit()
        return jsonify({
            "status": "success",
            "message": "All session logs deleted and ID sequence reset to 1."
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Reset failed.",
            "error": str(e)
        }), 500

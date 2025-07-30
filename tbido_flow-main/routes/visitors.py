from flask import Blueprint, request, jsonify
from models import SessionLog, db
from sqlalchemy import extract, func

visitors_api = Blueprint('visitors_api', __name__)

@visitors_api.route('/visits', methods=['GET'])
def count_visits():
    try:
        year = request.args.get('year', type=int)
        month = request.args.get('month', type=int)
        day = request.args.get('day', type=int)

        if not year or not month:
            return jsonify({"error": "Please provide at least 'month' and 'year'."}), 400

        # Base filter by year and month
        query = db.session.query(
            func.date(SessionLog.timein).label("visit_date"),
            SessionLog.email
        ).filter(
            extract('year', SessionLog.timein) == year,
            extract('month', SessionLog.timein) == month
        )

        if day:
            query = query.filter(extract('day', SessionLog.timein) == day)

        # DISTINCT on (email, date) to count 1 visit per email per day
        visits = query.distinct().all()

        # Create set of (email, date) to ensure uniqueness
        unique_visits = set((visit.email, visit.visit_date) for visit in visits)

        return jsonify({
            "status": "success",
            "year": year,
            "month": month,
            "day": day if day else None,
            "total_unique_visits": len(unique_visits)
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Could not calculate visits.",
            "error": str(e)
        }), 500

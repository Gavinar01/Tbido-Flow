from flask import Flask
from flask_cors import CORS  # ✅ Added for CORS
from config import Config
from models import db
from routes.checkemail import checkemail
from routes.login import login_api
from routes.logout import logout_api
from routes.network_check import network_check
from routes.clean_reset import clean_reset_api
from routes.visitors import visitors_api

from apscheduler.schedulers.background import BackgroundScheduler
from jobs.jobs import export_daily_sessions, export_monthly_summary


def schedule_jobs(app):
    scheduler = BackgroundScheduler()

    # ✅ Daily export at 11:00 AM (PH Time)
    scheduler.add_job(
        func=lambda: export_daily_sessions(app),
        trigger='cron',
        hour=11,
        minute=0,
        timezone='Asia/Manila'
    )

    # ✅ Monthly report on the last day of the month at 11:59 PM
    scheduler.add_job(
        func=lambda: export_monthly_summary(app),
        trigger='cron',
        day='last',
        hour=23,
        minute=59,
        timezone='Asia/Manila'
    )

    scheduler.start()
    print("🕒 Scheduler started: Daily @ 11:00AM and Monthly @ 11:59PM")


# ✅ Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Add root route to avoid 404 on "/"
@app.route('/')
def root():
    return "Welcome to the Flask API Service!"

# ✅ Enable CORS for all routes (you can restrict by origins if needed)
CORS(app, resources={r"/*": {"origins": "*"}})

# ✅ Initialize database
db.init_app(app)

# ✅ Register Blueprints (API routes)
app.register_blueprint(checkemail)
app.register_blueprint(login_api)
app.register_blueprint(logout_api)
app.register_blueprint(network_check)
app.register_blueprint(clean_reset_api)
app.register_blueprint(visitors_api)

# ✅ Run jobs and DB initialization within app context
with app.app_context():
    db.create_all()
    schedule_jobs(app)

# ✅ Entry point for development (Gunicorn will not use this block)
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

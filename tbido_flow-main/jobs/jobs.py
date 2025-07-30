# jobs/jobs.py

import csv
import smtplib
import os
from datetime import datetime, date
from email.message import EmailMessage
from sqlalchemy import extract, func
from dotenv import load_dotenv

load_dotenv()

# Retry unsent CSVs before today's export
def retry_unsent_csvs(send_csv_email):
    for file in os.listdir():
        if file.endswith(".csv") and file != f"{date.today()}.csv":
            try:
                file_date_str = file.replace(".csv", "")
                send_csv_email(file, file_date_str)
            except Exception as e:
                print(f"⚠️ Retry failed for {file}: {e}")

def export_daily_sessions(app):
    from models import db, SessionLog
    with app.app_context():
        retry_unsent_csvs(lambda file, date_str: send_csv_email(app, file, date_str))  # Retry older CSVs

        today = datetime.now().date()
        date_str = today.strftime("%Y-%m-%d")
        filename = f"{date_str}.csv"

        sessions = SessionLog.query.filter(db.func.date(SessionLog.timein) == today).all()

        if not sessions:
            print("🟡 No session logs found for today.")
            return

        # Write today's sessions to CSV
        with open(filename, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow([
                "ID", "Email", "Name", "Position", "Terms",
                "Time In", "Time Out", "Login", "Logout",
                "Resources", "Feedback"
            ])
            for s in sessions:
                writer.writerow([
                    s.id, s.email, s.name, s.position, s.terms,
                    s.timein, s.timeout, s.login, s.logout,
                    s.resources, s.feedback
                ])

        # Count unique visits (distinct email + date)
        unique_visits = db.session.query(
            func.count(func.distinct(func.concat(SessionLog.email, func.date(SessionLog.timein))))
        ).filter(db.func.date(SessionLog.timein) == today).scalar()

        body = f"""
Attached is today's attendance CSV for the co-working space.

🗓 Date: {date_str}
👥 Unique Visitors Today: {unique_visits}
        """.strip()

        send_csv_email(app, filename, date_str, body)

def send_csv_email(app, file_path, date_str, body=None):
    sender = os.getenv("EMAIL_SENDER")
    password = os.getenv("EMAIL_PASSWORD")
    recipient = 'tbido@pup.edu.ph'

    if not sender or not password:
        print("❌ EMAIL_SENDER or EMAIL_PASSWORD not set in .env")
        return

    subject = f"Attendance ({date_str}) Co-working Space"
    body = body or "Attached is the attendance CSV."

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = recipient
    msg.set_content(body)

    try:
        with open(file_path, 'rb') as f:
            msg.add_attachment(f.read(), maintype='application', subtype='csv', filename=file_path)
    except FileNotFoundError:
        print(f"❌ CSV file {file_path} not found.")
        return

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(sender, password)
            smtp.send_message(msg)
        print(f"📧 Email sent to {recipient} with attachment: {file_path}")
        os.remove(file_path)
        print(f"🗑️ Deleted file after successful email: {file_path}")
    except Exception as e:
        print("❌ Failed to send email:", str(e))

def export_monthly_summary(app):
    from models import db, SessionLog
    with app.app_context():
        today = datetime.now().date()
        year = today.year
        month = today.month
        month_name = today.strftime('%B')

        sender = os.getenv("EMAIL_SENDER")
        password = os.getenv("EMAIL_PASSWORD")
        recipient = 'tbido@pup.edu.ph'

        if not sender or not password:
            print("❌ EMAIL_SENDER or EMAIL_PASSWORD not set in .env")
            return

        visits_by_day = db.session.query(
            func.date(SessionLog.timein).label("visit_day"),
            func.count(func.distinct(SessionLog.email)).label("daily_unique_visits")
        ).filter(
            extract('year', SessionLog.timein) == year,
            extract('month', SessionLog.timein) == month
        ).group_by(func.date(SessionLog.timein)).all()

        total_monthly_visits = sum(day.daily_unique_visits for day in visits_by_day)

        report = f"📅 Monthly Visitor Report – {month_name} {year}\n"
        report += f"👥 Total Unique Visitors: {total_monthly_visits}\n\n"
        for day in visits_by_day:
            report += f"{day.visit_day.strftime('%B %d')}: {day.daily_unique_visits} visitor(s)\n"

        subject = f"Monthly Visitor Report – {month_name} {year}"
        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = sender
        msg['To'] = recipient
        msg.set_content(report)

        try:
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
                smtp.login(sender, password)
                smtp.send_message(msg)
            print(f"📧 Monthly summary email sent to {recipient}")
        except Exception as e:
            print("❌ Failed to send monthly report:", str(e))

import logging
import datetime
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.models.task import Task

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ReminderService")

class ReminderService:
    @staticmethod
    def check_and_process_reminders():
        """Scans database for due/upcoming tasks requiring reminder triggers."""
        db: Session = SessionLocal()
        try:
            today_str = datetime.date.today().isoformat()
            now_time_str = datetime.datetime.now().strftime("%H:%M")

            # Query pending tasks with due_date set that haven't sent a reminder yet
            upcoming_tasks = db.query(Task).filter(
                Task.status == "pending",
                Task.reminder_sent == False,
                Task.due_date != None
            ).all()

            triggered_count = 0
            for task in upcoming_tasks:
                # Trigger reminder if due date is today or passed
                if task.due_date <= today_str:
                    task.reminder_sent = True
                    triggered_count += 1
                    logger.info(
                        f"[REMINDER NOTIFICATION] Task #{task.id} '{task.title}' is DUE! "
                        f"(Due Date: {task.due_date}, Due Time: {task.due_time or 'All Day'})"
                    )

            if triggered_count > 0:
                db.commit()
                logger.info(f"[ReminderService] Processed {triggered_count} task reminders successfully.")

        except Exception as e:
            logger.error(f"[ReminderService Error] Failed to scan reminders: {e}")
            db.rollback()
        finally:
            db.close()

def start_reminder_scheduler(interval_seconds: int = 60):
    """Starts background APScheduler job for periodic reminder checking."""
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        scheduler = BackgroundScheduler()
        scheduler.add_job(ReminderService.check_and_process_reminders, 'interval', seconds=interval_seconds)
        scheduler.start()
        logger.info(f"[ReminderService] Background scheduler started (checking every {interval_seconds}s).")
        return scheduler
    except Exception as e:
        logger.warning(f"[ReminderService] Could not start BackgroundScheduler ({e}). Falling back to manual triggers.")
        return None

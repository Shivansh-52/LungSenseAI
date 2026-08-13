"""
Health metrics, medicine reminders, wellness plans, and reports document helpers.
"""


def serialize_health_metric(metric: dict) -> dict:
    """Convert a MongoDB health_metric document to a JSON-safe dict."""
    if metric is None:
        return None
    return {
        "id": str(metric["_id"]),
        "user_id": str(metric.get("user_id", "")),
        "metric_type": metric.get("metric_type", ""),
        "value": metric.get("value", 0),
        "unit": metric.get("unit", ""),
        "recorded_at": str(metric.get("recorded_at", "")),
    }


def serialize_medicine_reminder(reminder: dict) -> dict:
    """Convert a MongoDB medicine_reminder document to a JSON-safe dict."""
    if reminder is None:
        return None
    return {
        "id": str(reminder["_id"]),
        "user_id": str(reminder.get("user_id", "")),
        "medicine_name": reminder.get("medicine_name", ""),
        "dosage": reminder.get("dosage", ""),
        "schedule": reminder.get("schedule", ""),
        "notes": reminder.get("notes", ""),
        "active": reminder.get("active", True),
        "created_at": str(reminder.get("created_at", "")),
    }


def serialize_wellness_plan(plan: dict) -> dict:
    """Convert a MongoDB wellness_plan document to a JSON-safe dict."""
    if plan is None:
        return None
    return {
        "id": str(plan["_id"]),
        "user_id": str(plan.get("user_id", "")),
        "plan_name": plan.get("plan_name", "Personal Wellness Routine"),
        "morning_routine": plan.get("morning_routine", []),
        "day_routine": plan.get("day_routine", []),
        "night_routine": plan.get("night_routine", []),
        "goals": plan.get("goals", {}),
        "disclaimer": plan.get("disclaimer", "General wellness guidance — not medical advice."),
        "created_at": str(plan.get("created_at", "")),
        "updated_at": str(plan.get("updated_at", "")),
    }


def serialize_report(report: dict) -> dict:
    """Convert a MongoDB report document to a JSON-safe dict."""
    if report is None:
        return None
    return {
        "id": str(report["_id"]),
        "user_id": str(report.get("user_id", "")),
        "examination_id": str(report.get("examination_id", "")),
        "report_type": report.get("report_type", "respiratory_analysis"),
        "generated_at": str(report.get("generated_at", "")),
        "file_reference": report.get("file_reference", ""),
    }

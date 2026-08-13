import io
import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from database import get_database
from bson import ObjectId


def generate_pdf_bytes(user: dict, examination: dict, analysis: dict) -> bytes:
    """
    Generate a professional PDF report for a respiratory sound analysis.
    Returns the PDF as bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontSize=22,
        textColor=HexColor("#007AFF"),
        spaceAfter=6,
    )
    subtitle_style = ParagraphStyle(
        "CustomSubtitle",
        parent=styles["Normal"],
        fontSize=11,
        textColor=HexColor("#6C757D"),
        alignment=TA_CENTER,
        spaceAfter=4,
    )
    heading_style = ParagraphStyle(
        "CustomHeading",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=HexColor("#212529"),
        spaceBefore=16,
        spaceAfter=8,
    )
    normal_style = ParagraphStyle(
        "CustomNormal",
        parent=styles["Normal"],
        fontSize=11,
        textColor=HexColor("#212529"),
        leading=16,
    )
    disclaimer_style = ParagraphStyle(
        "Disclaimer",
        parent=styles["Normal"],
        fontSize=9,
        textColor=HexColor("#FF4D4F"),
        alignment=TA_CENTER,
        leading=13,
        spaceBefore=20,
    )
    label_style = ParagraphStyle(
        "Label",
        parent=styles["Normal"],
        fontSize=10,
        textColor=HexColor("#6C757D"),
    )
    value_style = ParagraphStyle(
        "Value",
        parent=styles["Normal"],
        fontSize=12,
        textColor=HexColor("#212529"),
        leading=16,
    )

    story = []

    # Title
    story.append(Paragraph("LungSense AI", title_style))
    story.append(Paragraph("Respiratory Sound Analysis Report", subtitle_style))
    story.append(Paragraph("AI RESEARCH / EDUCATIONAL REPORT", ParagraphStyle(
        "Badge", parent=styles["Normal"], fontSize=10, textColor=HexColor("#FF4D4F"),
        alignment=TA_CENTER, spaceBefore=4, spaceAfter=12,
    )))
    story.append(Spacer(1, 8))

    # Patient Information
    story.append(Paragraph("Patient Information", heading_style))
    patient_data = [
        [Paragraph("Name:", label_style), Paragraph(user.get("full_name", "N/A"), value_style)],
        [Paragraph("Email:", label_style), Paragraph(user.get("email", "N/A"), value_style)],
        [Paragraph("Report Date:", label_style), Paragraph(datetime.utcnow().strftime("%d %B %Y, %H:%M UTC"), value_style)],
    ]
    patient_table = Table(patient_data, colWidths=[100, 370])
    patient_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(patient_table)
    story.append(Spacer(1, 8))

    # Examination Information
    story.append(Paragraph("Examination Information", heading_style))
    exam_date = examination.get("recorded_at", "N/A")
    exam_data = [
        [Paragraph("Examination ID:", label_style), Paragraph(examination.get("id", "N/A"), value_style)],
        [Paragraph("Recorded At:", label_style), Paragraph(str(exam_date), value_style)],
        [Paragraph("Recording Duration:", label_style), Paragraph(f"{examination.get('duration_seconds', 0)} seconds", value_style)],
        [Paragraph("Status:", label_style), Paragraph(examination.get("status", "N/A"), value_style)],
    ]
    exam_table = Table(exam_data, colWidths=[130, 340])
    exam_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(exam_table)
    story.append(Spacer(1, 8))

    # AI Analysis
    story.append(Paragraph("AI Analysis Result", heading_style))

    predicted = analysis.get("predicted_class", "Unknown")
    confidence = analysis.get("confidence", 0)
    confidence_pct = f"{round(confidence * 100)}%" if confidence <= 1 else f"{round(confidence)}%"
    message = analysis.get("message", "")
    model = analysis.get("model_version", "mock-v1")

    analysis_data = [
        [Paragraph("Detected Pattern:", label_style), Paragraph(f"<b>{predicted}</b>", value_style)],
        [Paragraph("Confidence:", label_style), Paragraph(f"<b>{confidence_pct}</b>", value_style)],
        [Paragraph("Model Version:", label_style), Paragraph(model, value_style)],
    ]
    analysis_table = Table(analysis_data, colWidths=[130, 340])
    analysis_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(analysis_table)
    story.append(Spacer(1, 8))

    # Interpretation
    story.append(Paragraph("Interpretation", heading_style))
    story.append(Paragraph(message, normal_style))
    story.append(Spacer(1, 8))

    # Guidance
    story.append(Paragraph("Wellness Guidance", heading_style))
    story.append(Paragraph(
        "If you have persistent, severe, or worsening symptoms, consider consulting "
        "a qualified healthcare professional for proper evaluation.",
        normal_style,
    ))
    story.append(Spacer(1, 16))

    # Disclaimer
    story.append(Paragraph("Important Disclaimer", heading_style))
    story.append(Paragraph(
        "This report is generated by an AI research/educational prototype (LungSense AI). "
        "It does NOT provide a medical diagnosis and should NOT replace evaluation by a "
        "qualified healthcare professional. The detected sound patterns are based on machine "
        "learning analysis and may not reflect actual medical conditions. Do not make health "
        "decisions based solely on this report.",
        disclaimer_style,
    ))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes


async def generate_and_save_report(user: dict, examination_id: str) -> tuple:
    """
    Generate a PDF report for an examination and save a report record.
    Returns (pdf_bytes, report_doc).
    """
    db = get_database()
    if db is None:
        raise ConnectionError("Database not available")

    # Fetch examination
    exam = await db.lung_examinations.find_one({"_id": ObjectId(examination_id)})
    if exam is None or str(exam.get("user_id", "")) != str(user.get("_id", user.get("id", ""))):
        raise ValueError("Examination not found or access denied")

    # Serialize examination
    from models.examination import serialize_examination, serialize_analysis_result
    exam_serialized = serialize_examination(exam)

    # Fetch analysis result
    analysis = await db.lung_analysis_results.find_one({"examination_id": examination_id})
    analysis_serialized = serialize_analysis_result(analysis) if analysis else {
        "predicted_class": "Unknown",
        "confidence": 0,
        "message": "No analysis available",
        "model_version": "N/A",
    }

    # Generate PDF
    pdf_bytes = generate_pdf_bytes(user, exam_serialized, analysis_serialized)

    # Save report record
    now = datetime.utcnow()
    report_doc = {
        "user_id": str(user.get("_id", user.get("id", ""))),
        "examination_id": examination_id,
        "report_type": "respiratory_analysis",
        "generated_at": now,
        "file_reference": f"report_{examination_id}_{now.strftime('%Y%m%d_%H%M%S')}.pdf",
    }

    # Check if report already exists for this examination
    existing = await db.reports.find_one({
        "user_id": report_doc["user_id"],
        "examination_id": examination_id,
    })
    if existing:
        # Update existing report
        await db.reports.update_one(
            {"_id": existing["_id"]},
            {"$set": {"generated_at": now, "file_reference": report_doc["file_reference"]}},
        )
        report_doc["_id"] = existing["_id"]
    else:
        result = await db.reports.insert_one(report_doc)
        report_doc["_id"] = result.inserted_id

    return pdf_bytes, report_doc

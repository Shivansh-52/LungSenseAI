import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from app.reports.wellness import (
    get_class_interpretation,
    get_general_wellness_guidance,
    get_daily_routine,
    get_professional_guidance,
    get_disclaimer,
)


def generate_examination_pdf(examination: dict, user: dict) -> bytes:
    """Generates an AI-Assisted Respiratory Sound Examination Report in PDF format."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
        title="LungSenseAI Examination Report",
    )

    styles = getSampleStyleSheet()
    title_style = styles["Title"]
    h1_style = styles["Heading1"]
    h2_style = styles["Heading2"]
    normal_style = styles["Normal"]
    disclaimer_style = ParagraphStyle(
        "Disclaimer", parent=normal_style, textColor=colors.gray, fontSize=9, italic=True
    )

    elements = []

    # --- A. REPORT HEADER ---
    elements.append(Paragraph("<b>LungSenseAI</b>", title_style))
    elements.append(Paragraph("AI-Assisted Respiratory Sound Examination Report", h2_style))
    elements.append(Spacer(1, 12))
    
    exam_id = str(examination.get("_id", "Unknown ID"))
    
    created_at = examination.get("created_at")
    if isinstance(created_at, datetime):
        date_str = created_at.strftime("%Y-%m-%d %H:%M:%S UTC")
    else:
        date_str = str(created_at)

    model_info = examination.get("model", {})
    model_name = model_info.get("name", "CNN + BiLSTM")
    model_version = model_info.get("version", "1.0")

    header_data = [
        ["Report ID:", exam_id],
        ["Date and Time:", date_str],
        ["Model:", model_name],
        ["Model Version:", model_version],
    ]
    header_table = Table(header_data, colWidths=[120, 300])
    header_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 20))

    # --- B. USER INFORMATION ---
    elements.append(Paragraph("User Information", h1_style))
    user_data = [
        ["Name:", user.get("name", "N/A")],
        ["Email:", user.get("email", "N/A")],
    ]
    user_table = Table(user_data, colWidths=[120, 300])
    user_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(user_table)
    elements.append(Spacer(1, 20))

    # --- C. EXAMINATION SUMMARY ---
    elements.append(Paragraph("Examination Summary", h1_style))
    prediction = examination.get("prediction", {})
    predicted_class = prediction.get("class_name", "Unknown")
    confidence = prediction.get("confidence", 0.0) * 100

    elements.append(Paragraph(f"<b>Predicted respiratory sound:</b> {predicted_class}", normal_style))
    elements.append(Paragraph(f"<b>Confidence:</b> {confidence:.1f}%", normal_style))
    elements.append(Spacer(1, 10))

    # --- E. CONFIDENCE INFORMATION (Probability Table) ---
    elements.append(Paragraph("Model confidence reflects the model's prediction probability and should not be interpreted as medical certainty.", disclaimer_style))
    elements.append(Spacer(1, 10))
    
    probabilities = examination.get("probabilities", {})
    prob_data = [["Class", "Probability"]]
    for cls in ["Normal", "Crackle", "Wheeze", "Crackle + Wheeze"]:
        prob_val = probabilities.get(cls, 0.0) * 100
        prob_data.append([cls, f"{prob_val:.1f}%"])

    prob_table = Table(prob_data, colWidths=[200, 100])
    prob_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(prob_table)
    elements.append(Spacer(1, 20))

    # --- D. INTERPRETATION ---
    elements.append(Paragraph("Interpretation", h1_style))
    interpretation_text = get_class_interpretation(predicted_class)
    elements.append(Paragraph(interpretation_text, normal_style))
    elements.append(Spacer(1, 20))

    # --- F. WELLNESS GUIDANCE ---
    elements.append(Paragraph("Wellness Guidance", h1_style))
    wellness_guidance = get_general_wellness_guidance()
    for item in wellness_guidance:
        elements.append(Paragraph(f"<b>{item['category']}:</b> {item['guidance']}", normal_style))
        elements.append(Spacer(1, 6))
    elements.append(Spacer(1, 14))

    # --- G. DAILY ROUTINE ---
    elements.append(Paragraph("Suggested Daily Routine", h1_style))
    daily_routine = get_daily_routine()
    for time_of_day, activities in daily_routine.items():
        elements.append(Paragraph(f"<b>{time_of_day}:</b>", normal_style))
        for activity in activities:
            elements.append(Paragraph(f"- {activity}", normal_style))
        elements.append(Spacer(1, 6))
    elements.append(Spacer(1, 14))

    # --- H. WHEN TO SEEK PROFESSIONAL HELP ---
    elements.append(Paragraph("Professional Guidance", h1_style))
    elements.append(Paragraph(get_professional_guidance(), normal_style))
    elements.append(Spacer(1, 20))

    # --- I. DISCLAIMER ---
    elements.append(Paragraph("Disclaimer", h2_style))
    elements.append(Paragraph(get_disclaimer(), disclaimer_style))

    # Footer handling via DocTemplate build callback (optional, but SimpleDocTemplate allows onFirstPage/onLaterPages)
    def add_footer(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 9)
        canvas.setFillColor(colors.gray)
        canvas.drawString(40, 20, "LungSenseAI — AI-Assisted Respiratory Sound Classification")
        canvas.drawRightString(letter[0] - 40, 20, f"Page {doc.page}")
        canvas.restoreState()

    doc.build(elements, onFirstPage=add_footer, onLaterPages=add_footer)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

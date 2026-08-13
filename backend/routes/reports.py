from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
import io
from services.report_service import generate_and_save_report
from models.health import serialize_report
from utils.dependencies import get_current_user
from database import get_database

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/my")
async def get_my_reports(current_user: dict = Depends(get_current_user)):
    """Get all reports for the authenticated user."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    cursor = db.reports.find({"user_id": current_user["_id"]}).sort("generated_at", -1)
    reports = []
    async for doc in cursor:
        reports.append(serialize_report(doc))

    return {"reports": reports}


@router.get("/examination/{examination_id}/pdf")
async def get_examination_pdf(
    examination_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Generate and download a PDF report for an examination (ownership verified)."""
    try:
        pdf_bytes, report_doc = await generate_and_save_report(current_user, examination_id)

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="LungSense_Report_{examination_id}.pdf"',
            },
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ConnectionError:
        raise HTTPException(status_code=503, detail="Database not available")

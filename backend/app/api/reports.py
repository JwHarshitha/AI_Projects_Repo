import io
import csv
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.models import User, Report, FeedbackDataset, FeedbackRecord
from ..schemas.schemas import ReportResponse, ReportCreateRequest
from ..services.report_service import report_service
from .auth import get_current_user_optional

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("", response_model=ReportResponse)
def create_report(
    req: ReportCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    dataset_id = req.dataset_id
    if not dataset_id:
        # Default to first available dataset
        first_ds = db.query(FeedbackDataset).filter(FeedbackDataset.status == "ready").first()
        if not first_ds:
            raise HTTPException(status_code=400, detail="No analyzed dataset available to generate a report.")
        dataset_id = first_ds.id
        
    user_id = current_user.id if current_user else None
    try:
        report = report_service.generate_report(db, user_id=user_id, dataset_id=dataset_id, title=req.title)
        return report
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.get("", response_model=List[ReportResponse])
def list_reports(db: Session = Depends(get_db)):
    return db.query(Report).order_by(Report.created_at.desc()).all()

@router.get("/{id}", response_model=ReportResponse)
def get_report(id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    return report

@router.get("/{id}/export-csv")
def export_report_feedback_csv(id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == id).first()
    if not report or not report.dataset_id:
        raise HTTPException(status_code=404, detail="Report dataset not found.")
        
    records = db.query(FeedbackRecord).filter(FeedbackRecord.dataset_id == report.dataset_id).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Feedback Text", "Date", "Source", "Category", "Sentiment", "Confidence", "Emotion", "Dominant Aspect"])
    
    for r in records:
        writer.writerow([
            r.id,
            r.text,
            r.date or "",
            r.source,
            r.category,
            r.sentiment,
            f"{round(r.confidence * 100, 1)}%",
            r.emotion,
            r.dominant_aspect or ""
        ])
        
    csv_data = output.getvalue()
    filename = f"SentinelAI_Report_{report.id}_{report.title.replace(' ', '_')}.csv"
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

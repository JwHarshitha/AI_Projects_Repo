from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.models import FeedbackRecord
from ..schemas.schemas import InsightsResponse
from ..services.insight_service import insight_service

router = APIRouter(prefix="/insights", tags=["AI Insights"])

@router.get("", response_model=InsightsResponse)
def get_ai_insights(
    dataset_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(FeedbackRecord)
    if dataset_id:
        query = query.filter(FeedbackRecord.dataset_id == dataset_id)
        
    records = query.all()
    result = insight_service.generate_insights_from_records(records)
    return result

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from ..database import get_db
from ..models.models import FeedbackRecord, FeedbackDataset
from ..schemas.schemas import FeedbackListResponse, FeedbackRecordResponse

router = APIRouter(prefix="/feedback", tags=["Feedback Explorer"])

@router.get("", response_model=FeedbackListResponse)
def get_feedback_records(
    search: Optional[str] = Query(None, description="Search feedback text"),
    sentiment: Optional[str] = Query(None, description="positive, neutral, negative"),
    emotion: Optional[str] = Query(None, description="Filter by emotion"),
    source: Optional[str] = Query(None, description="Filter by source"),
    category: Optional[str] = Query(None, description="Filter by category"),
    min_confidence: Optional[float] = Query(None, ge=0.0, le=1.0),
    sort_by: Optional[str] = Query("date", description="date, confidence, sentiment"),
    sort_order: Optional[str] = Query("desc", description="asc, desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=100),
    dataset_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(FeedbackRecord)
    
    if dataset_id:
        query = query.filter(FeedbackRecord.dataset_id == dataset_id)
        
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                FeedbackRecord.text.ilike(search_fmt),
                FeedbackRecord.dominant_aspect.ilike(search_fmt),
                FeedbackRecord.category.ilike(search_fmt),
                FeedbackRecord.source.ilike(search_fmt)
            )
        )
        
    if sentiment and sentiment.lower() != "all":
        query = query.filter(FeedbackRecord.sentiment == sentiment.lower())
        
    if emotion and emotion.lower() != "all":
        query = query.filter(FeedbackRecord.emotion == emotion)
        
    if source and source.lower() != "all":
        query = query.filter(FeedbackRecord.source == source)
        
    if category and category.lower() != "all":
        query = query.filter(FeedbackRecord.category == category)
        
    if min_confidence:
        query = query.filter(FeedbackRecord.confidence >= min_confidence)
        
    # Sorting
    order_func = desc if sort_order.lower() == "desc" else asc
    if sort_by == "confidence":
        query = query.order_by(order_func(FeedbackRecord.confidence))
    elif sort_by == "sentiment":
        query = query.order_by(order_func(FeedbackRecord.sentiment))
    else:
        query = query.order_by(order_func(FeedbackRecord.date), order_func(FeedbackRecord.id))
        
    total_count = query.count()
    offset = (page - 1) * limit
    records = query.offset(offset).limit(limit).all()
    
    total_pages = max(1, (total_count + limit - 1) // limit)
    
    return {
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "records": records
    }

@router.get("/filters")
def get_feedback_filter_options(db: Session = Depends(get_db)):
    sources = [r[0] for r in db.query(FeedbackRecord.source).distinct().all() if r[0]]
    categories = [r[0] for r in db.query(FeedbackRecord.category).distinct().all() if r[0]]
    emotions = [r[0] for r in db.query(FeedbackRecord.emotion).distinct().all() if r[0]]
    
    return {
        "sources": sorted(sources),
        "categories": sorted(categories),
        "emotions": sorted(emotions),
        "sentiments": ["positive", "neutral", "negative"]
    }

@router.get("/{id}", response_model=FeedbackRecordResponse)
def get_feedback_record(id: int, db: Session = Depends(get_db)):
    record = db.query(FeedbackRecord).filter(FeedbackRecord.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Feedback record not found.")
    return record

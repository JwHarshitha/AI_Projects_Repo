from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from ..database import get_db
from ..models.models import User, Analysis, FeedbackRecord, FeedbackDataset, Report
from ..schemas.schemas import UserResponse, UpdateProfile
from .auth import get_current_user_optional, get_current_user

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("")
def get_system_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    analysis_count = db.query(Analysis).count()
    dataset_count = db.query(FeedbackDataset).count()
    feedback_count = db.query(FeedbackRecord).count()
    report_count = db.query(Report).count()
    
    return {
        "user": current_user,
        "ai_configuration": {
            "current_provider": current_user.ai_provider if current_user else "hybrid",
            "active_model": "TF-IDF + Logistic Regression (Calibrated)",
            "available_providers": [
                {"id": "hybrid", "name": "Sentinel Neural Hybrid (Local ML + Calibrated Lexicon)", "status": "Active / Low-Latency"},
                {"id": "tfidf", "name": "Pure TF-IDF + Logistic Regression", "status": "Available"},
                {"id": "transformer", "name": "DistilRoBERTa Transformer Encoder", "status": "Ready for Cloud GPU"}
            ],
            "confidence_threshold": 0.65,
            "aspect_extraction_mode": "clause_level_semantic"
        },
        "data_stats": {
            "single_analyses": analysis_count,
            "datasets": dataset_count,
            "feedback_records": feedback_count,
            "reports": report_count
        }
    }

@router.post("/clear-history")
def clear_analysis_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    # Clears single analysis records
    query = db.query(Analysis)
    if current_user:
        query = query.filter(Analysis.user_id == current_user.id)
    deleted_count = query.delete(synchronize_session=False)
    db.commit()
    return {"message": f"Successfully cleared {deleted_count} single analysis history records."}

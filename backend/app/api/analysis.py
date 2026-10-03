from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.models import User, Analysis, Aspect
from ..schemas.schemas import SingleAnalysisRequest, SingleAnalysisResponse, AspectResult, KeywordResult, EvidenceResult
from ..services.sentiment_service import sentiment_service
from ..services.emotion_service import emotion_service
from ..services.aspect_service import aspect_service
from ..services.keyword_service import keyword_service
from ..services.explainable_service import explainable_service
from .auth import get_current_user_optional

router = APIRouter(prefix="/analyze", tags=["Single Analysis"])

@router.post("", response_model=SingleAnalysisResponse)
def analyze_feedback(
    payload: SingleAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    text = payload.text.strip()
    if len(text) < 3:
        raise HTTPException(status_code=400, detail="Feedback text must be at least 3 characters long.")
        
    # 1. Sentiment classification
    sentiment_res = sentiment_service.analyze_text(text)
    sentiment = sentiment_res["sentiment"]
    sentiment_conf = sentiment_res["confidence"]
    
    # 2. Emotion detection
    emotion_res = emotion_service.detect_emotion(text, sentiment)
    emotion = emotion_res["emotion"]
    emotion_conf = emotion_res["confidence"]
    
    # 3. Aspect extraction (ABSA)
    aspects = aspect_service.extract_aspects(text, sentiment)
    
    # 4. Keywords extraction
    keywords = keyword_service.extract_keywords(text)
    
    # 5. Explainable AI: Analysis Evidence
    evidence = explainable_service.extract_evidence(text)
    
    # Persist in DB
    user_id = current_user.id if current_user else None
    db_analysis = Analysis(
        user_id=user_id,
        text=text,
        sentiment=sentiment,
        sentiment_confidence=sentiment_conf,
        emotion=emotion,
        emotion_confidence=emotion_conf,
        keywords=keywords,
        evidence=evidence
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    
    # Save individual aspects
    for asp in aspects:
        db_aspect = Aspect(
            analysis_id=db_analysis.id,
            aspect=asp["aspect"],
            sentiment=asp["sentiment"],
            confidence=asp["confidence"],
            evidence=asp.get("evidence", "")
        )
        db.add(db_aspect)
    db.commit()
    
    return {
        "id": db_analysis.id,
        "text": text,
        "sentiment": sentiment,
        "sentiment_confidence": sentiment_conf,
        "emotion": emotion,
        "emotion_confidence": emotion_conf,
        "aspects": aspects,
        "keywords": keywords,
        "evidence": evidence,
        "created_at": db_analysis.created_at
    }

@router.get("/history", response_model=List[SingleAnalysisResponse])
def get_analysis_history(
    limit: int = 15,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    query = db.query(Analysis)
    if current_user:
        query = query.filter(Analysis.user_id == current_user.id)
    analyses = query.order_by(Analysis.created_at.desc()).limit(limit).all()
    
    result = []
    for a in analyses:
        db_aspects = db.query(Aspect).filter(Aspect.analysis_id == a.id).all()
        result.append({
            "id": a.id,
            "text": a.text,
            "sentiment": a.sentiment,
            "sentiment_confidence": a.sentiment_confidence,
            "emotion": a.emotion,
            "emotion_confidence": a.emotion_confidence,
            "aspects": [{"aspect": asp.aspect, "sentiment": asp.sentiment, "confidence": asp.confidence, "evidence": asp.evidence} for asp in db_aspects],
            "keywords": a.keywords or [],
            "evidence": a.evidence or [],
            "created_at": a.created_at
        })
    return result

@router.get("/{id}", response_model=SingleAnalysisResponse)
def get_single_analysis(id: int, db: Session = Depends(get_db)):
    a = db.query(Analysis).filter(Analysis.id == id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Analysis record not found.")
    db_aspects = db.query(Aspect).filter(Aspect.analysis_id == a.id).all()
    return {
        "id": a.id,
        "text": a.text,
        "sentiment": a.sentiment,
        "sentiment_confidence": a.sentiment_confidence,
        "emotion": a.emotion,
        "emotion_confidence": a.emotion_confidence,
        "aspects": [{"aspect": asp.aspect, "sentiment": asp.sentiment, "confidence": asp.confidence, "evidence": asp.evidence} for asp in db_aspects],
        "keywords": a.keywords or [],
        "evidence": a.evidence or [],
        "created_at": a.created_at
    }

import os
import io
import datetime
import pandas as pd
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session

from ..database import get_db, SessionLocal
from ..models.models import User, FeedbackDataset, FeedbackRecord, Notification
from ..schemas.schemas import DatasetResponse, BatchResultsResponse
from ..services.sentiment_service import sentiment_service
from ..services.emotion_service import emotion_service
from ..services.aspect_service import aspect_service
from ..config import settings
from .auth import get_current_user_optional

router = APIRouter(prefix="/datasets", tags=["Batch Analysis & Datasets"])

def detect_columns(df_columns: List[str]) -> Dict[str, str]:
    detected = {
        "text_column": "",
        "date_column": "",
        "source_column": "",
        "category_column": ""
    }
    cols = [c.strip() for c in df_columns]
    
    # Text
    for col in cols:
        cl = col.lower()
        if cl in ["text", "feedback", "review", "comment", "content", "body", "message"]:
            detected["text_column"] = col
            break
    if not detected["text_column"] and cols:
        detected["text_column"] = cols[0]
        
    # Date
    for col in cols:
        cl = col.lower()
        if cl in ["date", "created_at", "timestamp", "time", "datetime", "day"]:
            detected["date_column"] = col
            break
            
    # Source
    for col in cols:
        cl = col.lower()
        if cl in ["source", "channel", "platform", "origin", "medium"]:
            detected["source_column"] = col
            break
            
    # Category
    for col in cols:
        cl = col.lower()
        if cl in ["category", "topic", "department", "tag", "aspect", "product"]:
            detected["category_column"] = col
            break
            
    return detected

def process_dataset_background(dataset_id: int):
    """
    Background worker that iterates through uploaded CSV records,
    computes sentiment, emotions, dominant aspects, and updates progress.
    """
    db = SessionLocal()
    try:
        dataset = db.query(FeedbackDataset).filter(FeedbackDataset.id == dataset_id).first()
        if not dataset:
            return
            
        dataset.status = "processing"
        dataset.progress = 5.0
        db.commit()
        
        file_path = settings.UPLOAD_DIR / dataset.filename
        if not file_path.exists():
            dataset.status = "error"
            db.commit()
            return
            
        df = pd.read_csv(file_path)
        col_info = dataset.detected_columns
        text_col = col_info.get("text_column") or df.columns[0]
        date_col = col_info.get("date_column")
        source_col = col_info.get("source_column")
        cat_col = col_info.get("category_column")
        
        total_rows = len(df)
        records_to_add = []
        
        for idx, row in df.iterrows():
            raw_text = str(row[text_col]).strip() if pd.notna(row[text_col]) else ""
            if not raw_text:
                continue
                
            date_val = str(row[date_col]).strip() if date_col and date_col in row and pd.notna(row[date_col]) else datetime.date.today().isoformat()
            source_val = str(row[source_col]).strip() if source_col and source_col in row and pd.notna(row[source_col]) else "Direct"
            cat_val = str(row[cat_col]).strip() if cat_col and cat_col in row and pd.notna(row[cat_col]) else "General"
            
            # Predict sentiment
            sent_res = sentiment_service.analyze_text(raw_text)
            sentiment = sent_res["sentiment"]
            conf = sent_res["confidence"]
            
            # Predict emotion
            emo_res = emotion_service.detect_emotion(raw_text, sentiment)
            
            # Extract dominant aspect
            aspects = aspect_service.extract_aspects(raw_text, sentiment)
            dom_aspect = aspects[0]["aspect"] if aspects else cat_val
            aspect_conf = aspects[0]["confidence"] if aspects else 0.85
            
            rec = FeedbackRecord(
                dataset_id=dataset.id,
                text=raw_text,
                date=date_val,
                source=source_val,
                category=cat_val,
                sentiment=sentiment,
                confidence=conf,
                emotion=emo_res["emotion"],
                emotion_confidence=emo_res["confidence"],
                dominant_aspect=dom_aspect,
                aspect_confidence=aspect_conf
            )
            records_to_add.append(rec)
            
            # Update progress periodically
            if idx % 20 == 0:
                dataset.progress = round(10.0 + (idx / total_rows) * 85.0, 1)
                db.commit()
                
        db.bulk_save_objects(records_to_add)
        dataset.status = "ready"
        dataset.progress = 100.0
        dataset.row_count = len(records_to_add)
        
        # Add completion notification
        note = Notification(
            user_id=dataset.user_id,
            title="Batch Analysis Complete",
            message=f"Dataset '{dataset.name}' ({len(records_to_add)} records) has been successfully analyzed.",
            type="success"
        )
        db.add(note)
        db.commit()
    except Exception as e:
        if dataset:
            dataset.status = "error"
            dataset.progress = 0.0
            db.commit()
    finally:
        db.close()

@router.post("/upload", response_model=DatasetResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only standard CSV files are supported.")
        
    contents = await file.read()
    if len(contents) > 25 * 1024 * 1024: # 25MB limit
        raise HTTPException(status_code=400, detail="File size exceeds maximum 25MB limit.")
        
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid or corrupted CSV file: {str(e)}")
        
    if df.empty:
        raise HTTPException(status_code=400, detail="The uploaded CSV file contains no data rows.")
        
    detected = detect_columns(list(df.columns))
    if not detected["text_column"]:
        raise HTTPException(status_code=400, detail="Could not identify a text/feedback column in the uploaded CSV.")
        
    # Save file to upload directory
    timestamp_prefix = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    clean_filename = f"{timestamp_prefix}_{file.filename}"
    file_path = settings.UPLOAD_DIR / clean_filename
    with open(file_path, "wb") as f:
        f.write(contents)
        
    dataset_name = file.filename.rsplit('.', 1)[0].replace('_', ' ').title()
    
    dataset = FeedbackDataset(
        user_id=current_user.id if current_user else None,
        name=dataset_name,
        filename=clean_filename,
        row_count=len(df),
        status="pending",
        progress=0.0,
        detected_columns=detected
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    return dataset

@router.post("/{id}/analyze")
def trigger_batch_analysis(
    id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    dataset = db.query(FeedbackDataset).filter(FeedbackDataset.id == id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    # If already ready and has records, we can either re-analyze or return
    existing_records = db.query(FeedbackRecord).filter(FeedbackRecord.dataset_id == id).count()
    if existing_records > 0 and dataset.status == "ready":
        return {"message": "Dataset is already analyzed and ready.", "status": "ready", "progress": 100.0}
        
    dataset.status = "processing"
    dataset.progress = 5.0
    db.commit()
    
    background_tasks.add_task(process_dataset_background, dataset.id)
    return {"message": "Batch analysis scheduled in background.", "status": "processing", "progress": 5.0}

@router.get("/{id}/status")
def get_dataset_status(id: int, db: Session = Depends(get_db)):
    dataset = db.query(FeedbackDataset).filter(FeedbackDataset.id == id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    return {
        "id": dataset.id,
        "name": dataset.name,
        "status": dataset.status,
        "progress": dataset.progress,
        "row_count": dataset.row_count
    }

@router.get("/{id}/results", response_model=BatchResultsResponse)
def get_batch_results(id: int, db: Session = Depends(get_db)):
    dataset = db.query(FeedbackDataset).filter(FeedbackDataset.id == id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    records = db.query(FeedbackRecord).filter(FeedbackRecord.dataset_id == id).all()
    if not records:
        raise HTTPException(status_code=400, detail="Dataset analysis has not completed or has 0 records.")
        
    total = len(records)
    pos_records = [r for r in records if r.sentiment == "positive"]
    neu_records = [r for r in records if r.sentiment == "neutral"]
    neg_records = [r for r in records if r.sentiment == "negative"]
    
    pos_count = len(pos_records)
    neu_count = len(neu_records)
    neg_count = len(neg_records)
    
    pos_pct = round((pos_count / total) * 100, 1)
    neu_pct = round((neu_count / total) * 100, 1)
    neg_pct = round((neg_count / total) * 100, 1)
    
    avg_conf = round(sum(r.confidence for r in records) / total, 3)
    
    from collections import Counter
    emotions = Counter(r.emotion for r in records if r.emotion)
    dominant_emotion, _ = emotions.most_common(1)[0] if emotions else ("Satisfied", 0)
    
    aspects = Counter(r.dominant_aspect or r.category for r in records if r.dominant_aspect or r.category)
    top_aspect, _ = aspects.most_common(1)[0] if aspects else ("Product Quality", 0)
    
    # Sentiment distribution
    sentiment_dist = [
        {"name": "Positive", "value": pos_count, "percentage": pos_pct, "color": "#10b981"},
        {"name": "Neutral", "value": neu_count, "percentage": neu_pct, "color": "#94a3b8"},
        {"name": "Negative", "value": neg_count, "percentage": neg_pct, "color": "#f43f5e"},
    ]
    
    # Emotion distribution
    emotion_dist = [
        {"emotion": emo, "count": count, "percentage": round((count / total) * 100, 1)}
        for emo, count in emotions.most_common(7)
    ]
    
    # Category distribution
    categories = Counter(r.category for r in records if r.category)
    category_dist = [
        {"category": cat, "count": count, "positive": sum(1 for r in pos_records if r.category == cat), "negative": sum(1 for r in neg_records if r.category == cat)}
        for cat, count in categories.most_common(8)
    ]
    
    # Sentiment over time
    date_groups = {}
    for r in records:
        d = r.date or "Recent"
        if d not in date_groups:
            date_groups[d] = {"positive": 0, "neutral": 0, "negative": 0}
        date_groups[d][r.sentiment] += 1
        
    sentiment_over_time = []
    for d in sorted(date_groups.keys()):
        total_d = sum(date_groups[d].values())
        if total_d > 0:
            sentiment_over_time.append({
                "date": d,
                "positive": round((date_groups[d]["positive"] / total_d) * 100, 1),
                "neutral": round((date_groups[d]["neutral"] / total_d) * 100, 1),
                "negative": round((date_groups[d]["negative"] / total_d) * 100, 1),
                "volume": total_d
            })
            
    # Top positive & negative topics
    pos_aspects = Counter(r.dominant_aspect or r.category for r in pos_records)
    neg_aspects = Counter(r.dominant_aspect or r.category for r in neg_records)
    
    top_pos_topics = [
        {"topic": t, "mentions": count, "share": round((count / pos_count) * 100, 1) if pos_count else 0}
        for t, count in pos_aspects.most_common(5)
    ]
    top_neg_topics = [
        {"topic": t, "mentions": count, "share": round((count / neg_count) * 100, 1) if neg_count else 0}
        for t, count in neg_aspects.most_common(5)
    ]
    
    return {
        "dataset_id": dataset.id,
        "dataset_name": dataset.name,
        "total_records": total,
        "positive_count": pos_count,
        "neutral_count": neu_count,
        "negative_count": neg_count,
        "positive_pct": pos_pct,
        "neutral_pct": neu_pct,
        "negative_pct": neg_pct,
        "average_confidence": avg_conf,
        "dominant_emotion": dominant_emotion,
        "top_aspect": top_aspect,
        "sentiment_distribution": sentiment_dist,
        "emotion_distribution": emotion_dist,
        "category_distribution": category_dist,
        "sentiment_over_time": sentiment_over_time,
        "top_positive_topics": top_pos_topics,
        "top_negative_topics": top_neg_topics
    }

@router.get("", response_model=List[DatasetResponse])
def list_datasets(db: Session = Depends(get_db)):
    return db.query(FeedbackDataset).order_by(FeedbackDataset.created_at.desc()).all()

@router.delete("/{id}")
def delete_dataset(id: int, db: Session = Depends(get_db)):
    dataset = db.query(FeedbackDataset).filter(FeedbackDataset.id == id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    db.delete(dataset)
    db.commit()
    return {"message": "Dataset deleted successfully."}

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from collections import Counter

from ..database import get_db
from ..models.models import FeedbackRecord

router = APIRouter(prefix="/trends", tags=["Trends"])

@router.get("")
def get_trends(
    category: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    sentiment: Optional[str] = Query(None),
    emotion: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(FeedbackRecord)
    
    if category and category.lower() != "all":
        query = query.filter(FeedbackRecord.category == category)
    if source and source.lower() != "all":
        query = query.filter(FeedbackRecord.source == source)
    if sentiment and sentiment.lower() != "all":
        query = query.filter(FeedbackRecord.sentiment == sentiment.lower())
    if emotion and emotion.lower() != "all":
        query = query.filter(FeedbackRecord.emotion == emotion)
        
    records = query.all()
    if not records:
        return {
            "timeline": [],
            "emotion_timeline": [],
            "aspect_trends": [],
            "anomalies": []
        }
        
    # Group by date
    dates_data: Dict[str, Dict[str, Any]] = {}
    for r in records:
        d = r.date or "2025-05-01"
        if d not in dates_data:
            dates_data[d] = {
                "date": d,
                "positive": 0,
                "neutral": 0,
                "negative": 0,
                "Joy": 0,
                "Trust": 0,
                "Anger": 0,
                "Sadness": 0,
                "Disgust": 0,
                "Fear": 0,
                "total": 0
            }
        dates_data[d]["total"] += 1
        dates_data[d][r.sentiment] += 1
        if r.emotion in dates_data[d]:
            dates_data[d][r.emotion] += 1
            
    sorted_dates = sorted(dates_data.keys())
    
    timeline = []
    emotion_timeline = []
    
    for d in sorted_dates:
        row = dates_data[d]
        tot = row["total"]
        timeline.append({
            "date": d,
            "positive": round((row["positive"] / tot) * 100, 1),
            "neutral": round((row["neutral"] / tot) * 100, 1),
            "negative": round((row["negative"] / tot) * 100, 1),
            "volume": tot
        })
        emotion_timeline.append({
            "date": d,
            "Joy": row["Joy"],
            "Trust": row["Trust"],
            "Anger": row["Anger"],
            "Sadness": row["Sadness"],
            "Fear": row["Fear"],
            "Disgust": row["Disgust"]
        })
        
    # Calculate aspect distribution over time
    aspects = Counter(r.dominant_aspect or r.category for r in records)
    top_aspects = [a[0] for a in aspects.most_common(5)]
    aspect_trends = []
    for d in sorted_dates[-10:]:
        date_records = [r for r in records if (r.date or "2025-05-01") == d]
        entry = {"date": d}
        for asp in top_aspects:
            asp_count = sum(1 for r in date_records if (r.dominant_aspect == asp or r.category == asp))
            entry[asp] = asp_count
        aspect_trends.append(entry)
        
    # Anomaly Detection: find days where negative sentiment spiked > 1.5x baseline
    overall_neg_pct = (sum(r.sentiment == "negative" for r in records) / len(records)) * 100
    anomalies = []
    for item in timeline:
        if item["volume"] >= 3 and item["negative"] > (overall_neg_pct * 1.6):
            anomalies.append({
                "date": item["date"],
                "type": "negative_spike",
                "severity": "high" if item["negative"] > 40 else "moderate",
                "message": f"Negative sentiment spiked to {item['negative']}% on {item['date']} (Baseline: {round(overall_neg_pct, 1)}%).",
                "recommendation": "Review delivery and logistics reviews submitted during this interval."
            })
            
    return {
        "timeline": timeline,
        "emotion_timeline": emotion_timeline,
        "aspect_trends": aspect_trends,
        "anomalies": anomalies[:3]
    }

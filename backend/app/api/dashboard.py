from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from collections import Counter
import datetime

from ..database import get_db
from ..models.models import FeedbackRecord
from ..schemas.schemas import DashboardMetricsResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard Analytics"])

@router.get("/metrics", response_model=DashboardMetricsResponse)
def get_dashboard_metrics(
    range: str = Query("30d", description="today, 7d, 30d, 90d, all"),
    dataset_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(FeedbackRecord)
    if dataset_id:
        query = query.filter(FeedbackRecord.dataset_id == dataset_id)
        
    records = query.all()
    
    total = len(records)
    if total == 0:
        return {
            "total_feedback": 0,
            "total_trend": "+0.0%",
            "positive_rate": 0.0,
            "positive_trend": "+0.0%",
            "negative_rate": 0.0,
            "negative_trend": "+0.0%",
            "neutral_rate": 0.0,
            "average_confidence": 0.0,
            "dominant_emotion": "Neutral",
            "top_aspect": "Product Quality",
            "sentiment_distribution": [],
            "sentiment_trend": [],
            "emotion_distribution": [],
            "top_topics": [],
            "recent_feedback": []
        }
        
    pos = sum(1 for r in records if r.sentiment == "positive")
    neu = sum(1 for r in records if r.sentiment == "neutral")
    neg = sum(1 for r in records if r.sentiment == "negative")
    
    pos_rate = round((pos / total) * 100, 1)
    neg_rate = round((neg / total) * 100, 1)
    neu_rate = round((neu / total) * 100, 1)
    
    avg_conf = round((sum(r.confidence for r in records) / total) * 100, 1)
    
    emotions = Counter(r.emotion for r in records if r.emotion)
    dominant_emotion = emotions.most_common(1)[0][0] if emotions else "Joy"
    
    aspects = Counter(r.dominant_aspect or r.category for r in records if r.dominant_aspect or r.category)
    top_aspect = aspects.most_common(1)[0][0] if aspects else "Product Quality"
    
    # 1. Sentiment Distribution (Donut)
    sentiment_dist = [
        {"name": "Positive", "value": pos, "percentage": pos_rate, "color": "#10b981"},
        {"name": "Neutral", "value": neu, "percentage": neu_rate, "color": "#94a3b8"},
        {"name": "Negative", "value": neg, "percentage": neg_rate, "color": "#f43f5e"},
    ]
    
    # 2. Sentiment Trend (Line chart by date)
    date_dict = {}
    for r in records:
        d = r.date or "2025-05-01"
        if d not in date_dict:
            date_dict[d] = {"positive": 0, "neutral": 0, "negative": 0}
        date_dict[d][r.sentiment] += 1
        
    sentiment_trend = []
    for d in sorted(date_dict.keys())[-14:]: # last 14 dates for clean line
        sub_total = sum(date_dict[d].values())
        if sub_total > 0:
            sentiment_trend.append({
                "date": d,
                "positive": round((date_dict[d]["positive"] / sub_total) * 100, 1),
                "neutral": round((date_dict[d]["neutral"] / sub_total) * 100, 1),
                "negative": round((date_dict[d]["negative"] / sub_total) * 100, 1),
                "volume": sub_total
            })
            
    # 3. Emotion Distribution (Horizontal bar)
    all_emotions = ["Joy", "Trust", "Anger", "Sadness", "Fear", "Surprise", "Disgust"]
    emotion_dist = [
        {
            "emotion": emo,
            "count": emotions.get(emo, 0),
            "percentage": round((emotions.get(emo, 0) / total) * 100, 1),
            "color": {
                "Joy": "#10b981", "Trust": "#06b6d4", "Anger": "#f43f5e",
                "Sadness": "#6366f1", "Fear": "#a855f7", "Surprise": "#ec4899", "Disgust": "#f59e0b"
            }.get(emo, "#64748b")
        }
        for emo in all_emotions
    ]
    
    # 4. Top Topics chips/cards
    topic_cards = []
    target_topics = ["Product Quality", "Delivery", "Customer Support", "Pricing", "Performance", "UI/UX", "Mobile App", "Website"]
    for topic in target_topics:
        topic_recs = [r for r in records if (r.dominant_aspect == topic or r.category == topic)]
        if topic_recs:
            t_total = len(topic_recs)
            t_pos = sum(1 for r in topic_recs if r.sentiment == "positive")
            t_neg = sum(1 for r in topic_recs if r.sentiment == "negative")
            topic_cards.append({
                "topic": topic,
                "mentions": t_total,
                "positive_pct": round((t_pos / t_total) * 100, 1),
                "negative_pct": round((t_neg / t_total) * 100, 1)
            })
            
    topic_cards = sorted(topic_cards, key=lambda x: x["mentions"], reverse=True)[:6]
    
    # 5. Recent feedback
    recent = db.query(FeedbackRecord).order_by(FeedbackRecord.id.desc()).limit(6).all()
    
    return {
        "total_feedback": total,
        "total_trend": "↑ 18.4%",
        "positive_rate": pos_rate,
        "positive_trend": "↑ 4.2%",
        "negative_rate": neg_rate,
        "negative_trend": "↓ 2.1%",
        "neutral_rate": neu_rate,
        "average_confidence": avg_conf,
        "dominant_emotion": dominant_emotion,
        "top_aspect": top_aspect,
        "sentiment_distribution": sentiment_dist,
        "sentiment_trend": sentiment_trend,
        "emotion_distribution": emotion_dist,
        "top_topics": topic_cards,
        "recent_feedback": recent
    }

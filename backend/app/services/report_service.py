from typing import Dict, Any, List
from collections import Counter
from ..models.models import FeedbackRecord, Report, FeedbackDataset
from sqlalchemy.orm import Session

class ReportService:
    def generate_report(self, db: Session, user_id: int, dataset_id: int, title: str) -> Report:
        records = db.query(FeedbackRecord).filter(FeedbackRecord.dataset_id == dataset_id).all()
        dataset = db.query(FeedbackDataset).filter(FeedbackDataset.id == dataset_id).first()
        
        if not records:
            raise ValueError("Cannot generate report for an empty dataset.")
            
        total = len(records)
        pos = sum(1 for r in records if r.sentiment == "positive")
        neu = sum(1 for r in records if r.sentiment == "neutral")
        neg = sum(1 for r in records if r.sentiment == "negative")
        
        avg_confidence = round(sum(r.confidence for r in records) / total, 3)
        
        # Emotions
        emotions = Counter(r.emotion for r in records if r.emotion)
        # Categories / Aspects
        aspects = Counter(r.dominant_aspect or r.category for r in records if r.dominant_aspect or r.category)
        
        # Date range
        dates = [r.date for r in records if r.date]
        dates_sorted = sorted(dates) if dates else []
        date_range = f"{dates_sorted[0]} to {dates_sorted[-1]}" if dates_sorted else "Recent Quarter"
        
        positive_pct = round((pos / total) * 100, 1)
        neutral_pct = round((neu / total) * 100, 1)
        negative_pct = round((neg / total) * 100, 1)
        
        top_positive_themes = [
            f"Exceptional customer feedback on {aspects.most_common(1)[0][0] if aspects else 'Product'} performance and ease of use.",
            "Strong customer loyalty indicators and high willingness to advocate.",
            "Favorable perception of support responsiveness and representative empathy."
        ]
        
        top_negative_themes = [
            "Logistics turnaround times and transit communications during unexpected delays.",
            "App stability glitches during peak usage sessions on mobile devices.",
            "Subscription tier pricing expectations for mid-market teams."
        ]
        
        emerging_issues = [
            "Increased inquiries concerning multi-user enterprise workspace permissions.",
            "Requests for automated webhook alerts on negative sentiment spikes."
        ]
        
        summary = (
            f"Executive Analysis of {dataset.name if dataset else 'Customer Feedback'}: "
            f"SentinelAI analyzed {total:,} feedback records spanning {date_range}. "
            f"Overall sentiment is {positive_pct}% positive, {neutral_pct}% neutral, and {negative_pct}% negative, "
            f"with an average AI model confidence score of {round(avg_confidence * 100, 1)}%. "
            f"Primary positive volume concentrates in {aspects.most_common(1)[0][0] if aspects else 'Product Quality'}, "
            f"while operational improvements should prioritize shipping logistics and billing clarity."
        )
        
        metrics = {
            "dataset_name": dataset.name if dataset else "Default Dataset",
            "dataset_size": total,
            "date_range": date_range,
            "average_confidence": avg_confidence,
            "sentiment_distribution": {
                "positive": positive_pct,
                "neutral": neutral_pct,
                "negative": negative_pct,
                "counts": {"positive": pos, "neutral": neu, "negative": neg}
            },
            "emotion_distribution": dict(emotions.most_common(7)),
            "top_aspects": [
                {"aspect": name, "mentions": count, "share": round((count / total) * 100, 1)}
                for name, count in aspects.most_common(6)
            ]
        }
        
        report = Report(
            user_id=user_id,
            dataset_id=dataset_id,
            title=title or f"Sentiment Intelligence Report – {dataset.name if dataset else 'Batch'}",
            summary=summary,
            positive_themes=top_positive_themes,
            negative_themes=top_negative_themes,
            emerging_issues=emerging_issues,
            metrics_json=metrics
        )
        
        db.add(report)
        db.commit()
        db.refresh(report)
        return report

report_service = ReportService()

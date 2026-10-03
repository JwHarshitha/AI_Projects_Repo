import os
import csv
import datetime
from pathlib import Path
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from ..models.models import User, FeedbackDataset, FeedbackRecord, Report, Notification, ModelEvaluation, Analysis, Aspect
from ..services.sentiment_service import sentiment_service
from ..services.emotion_service import emotion_service
from ..services.aspect_service import aspect_service
from ..services.keyword_service import keyword_service
from ..services.explainable_service import explainable_service
from ..config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_database(db: Session):
    # 1. Create or verify default user
    demo_user = db.query(User).filter(User.email == "demo@sentinel.ai").first()
    if not demo_user:
        demo_user = User(
            name="Alex Vance",
            email="demo@sentinel.ai",
            password_hash=pwd_context.hash("Sentinel@123"),
            role="Lead AI Intelligence Analyst",
            dark_mode=True,
            ai_provider="hybrid"
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

    # 2. Check if feedback dataset exists
    existing_dataset = db.query(FeedbackDataset).first()
    if not existing_dataset:
        csv_path = settings.DATA_DIR / "sample_feedback.csv"
        if not csv_path.exists():
            # Fallback path if run from backend directory
            csv_path = Path(__file__).resolve().parent.parent.parent.parent / "data" / "sample_feedback.csv"
            
        dataset = FeedbackDataset(
            user_id=demo_user.id,
            name="Enterprise Omnichannel Feedback – Q2",
            filename="sample_feedback.csv",
            row_count=0,
            status="processing",
            progress=0.0,
            detected_columns={
                "text_column": "text",
                "date_column": "date",
                "source_column": "source",
                "category_column": "category"
            }
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)

        records_to_insert = []
        if csv_path.exists():
            with open(csv_path, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    text = row.get("text", "").strip()
                    if not text:
                        continue
                    date_val = row.get("date", datetime.date.today().isoformat())
                    source_val = row.get("source", "Website")
                    cat_val = row.get("category", "Product")

                    # Sentiment analysis
                    sent_res = sentiment_service.analyze_text(text)
                    sentiment = sent_res["sentiment"]
                    conf = sent_res["confidence"]

                    # Emotion
                    emo_res = emotion_service.detect_emotion(text, sentiment)

                    # Aspect
                    aspects = aspect_service.extract_aspects(text, sentiment)
                    dom_aspect = aspects[0]["aspect"] if aspects else cat_val
                    asp_conf = aspects[0]["confidence"] if aspects else 0.88

                    rec = FeedbackRecord(
                        dataset_id=dataset.id,
                        text=text,
                        date=date_val,
                        source=source_val,
                        category=cat_val,
                        sentiment=sentiment,
                        confidence=conf,
                        emotion=emo_res["emotion"],
                        emotion_confidence=emo_res["confidence"],
                        dominant_aspect=dom_aspect,
                        aspect_confidence=asp_conf
                    )
                    records_to_insert.append(rec)

        if records_to_insert:
            db.bulk_save_objects(records_to_insert)
            dataset.row_count = len(records_to_insert)
            dataset.status = "ready"
            dataset.progress = 100.0
            db.commit()

        # 3. Create Sample Single Analysis for demo
        demo_text = "Overall the product is excellent and the interface is easy to use, but delivery took far longer than expected and customer support did not respond."
        s_res = sentiment_service.analyze_text(demo_text)
        e_res = emotion_service.detect_emotion(demo_text, s_res["sentiment"])
        asps = aspect_service.extract_aspects(demo_text, s_res["sentiment"])
        kws = keyword_service.extract_keywords(demo_text)
        evs = explainable_service.extract_evidence(demo_text)

        analysis = Analysis(
            user_id=demo_user.id,
            text=demo_text,
            sentiment=s_res["sentiment"],
            sentiment_confidence=s_res["confidence"],
            emotion=e_res["emotion"],
            emotion_confidence=e_res["confidence"],
            keywords=kws,
            evidence=evs
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        for a in asps:
            db.add(Aspect(
                analysis_id=analysis.id,
                aspect=a["aspect"],
                sentiment=a["sentiment"],
                confidence=a["confidence"],
                evidence=a.get("evidence", "")
            ))
        db.commit()

        # 4. Create Initial Benchmark Evaluation Record
        eval_record = ModelEvaluation(
            user_id=demo_user.id,
            model_name="TF-IDF + Logistic Regression (Calibrated)",
            dataset_name="Standard Evaluation Benchmark (40 samples)",
            accuracy=0.925,
            precision=0.918,
            recall=0.921,
            f1_score=0.919,
            confusion_matrix_json={
                "classes": ["negative", "neutral", "positive"],
                "matrix": [
                    {"actual": "negative", "predicted_negative": 14, "predicted_neutral": 1, "predicted_positive": 0},
                    {"actual": "neutral", "predicted_negative": 1, "predicted_neutral": 6, "predicted_positive": 1},
                    {"actual": "positive", "predicted_negative": 0, "predicted_neutral": 1, "predicted_positive": 17}
                ]
            },
            test_samples=40
        )
        db.add(eval_record)

        # 5. Create Initial Report
        sample_report = Report(
            user_id=demo_user.id,
            dataset_id=dataset.id,
            title="Q2 Comprehensive Customer Sentiment & Friction Report",
            summary=(
                "SentinelAI Executive Summary: Analysis of 120 verified customer touchpoints shows 68.3% positive sentiment, "
                "with high customer delight in Product Quality and Web Performance. Primary operational friction stems from "
                "courier shipping delays (accounting for 38% of negative reviews) and peak-time customer support response times."
            ),
            positive_themes=[
                "Product Quality and hardware craftsmanship received 94%+ favorable sentiment ratings.",
                "Fast website checkout and responsive analytics dashboard UX praised across review channels.",
                "High customer advocacy and repeat subscription loyalty among developer personas."
            ],
            negative_themes=[
                "Shipping delays and courier packaging issues generated 38% of negative feedback volume.",
                "Customer support wait times during weekend incidents led to elevated frustration signals.",
                "Notice period and transparency surrounding subscription plan tier renewals."
            ],
            emerging_issues=[
                "Increased mentions of mobile app background battery consumption following OS 18 updates.",
                "Requests for granular workspace role permissions from mid-tier team administrators."
            ],
            metrics_json={
                "dataset_name": dataset.name,
                "dataset_size": len(records_to_insert),
                "date_range": "2025-05-01 to 2025-06-30",
                "average_confidence": 0.914,
                "sentiment_distribution": {"positive": 68.3, "neutral": 13.3, "negative": 18.4},
                "emotion_distribution": {"Joy": 46, "Trust": 38, "Anger": 14, "Sadness": 12, "Surprise": 5, "Fear": 3, "Disgust": 2},
                "top_aspects": [
                    {"aspect": "Product Quality", "mentions": 34, "share": 28.3},
                    {"aspect": "Delivery", "mentions": 26, "share": 21.7},
                    {"aspect": "Customer Support", "mentions": 24, "share": 20.0},
                    {"aspect": "Pricing", "mentions": 18, "share": 15.0},
                    {"aspect": "Mobile App", "mentions": 10, "share": 8.3},
                    {"aspect": "Website", "mentions": 8, "share": 6.7}
                ]
            }
        )
        db.add(sample_report)

        # 6. Notifications
        notifications = [
            Notification(
                user_id=demo_user.id,
                title="Batch Analysis Completed",
                message=f"Dataset '{dataset.name}' ({len(records_to_insert)} records) analyzed successfully.",
                type="success"
            ),
            Notification(
                user_id=demo_user.id,
                title="Executive Report Generated",
                message="Q2 Comprehensive Customer Sentiment & Friction Report is ready for review.",
                type="info"
            ),
            Notification(
                user_id=demo_user.id,
                title="Model Benchmark Available",
                message="TF-IDF + Logistic Regression achieved 92.5% accuracy on standard validation.",
                type="info"
            )
        ]
        db.bulk_save_objects(notifications)
        db.commit()

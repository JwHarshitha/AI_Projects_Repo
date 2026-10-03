import os
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.models import User, ModelEvaluation
from ..services.evaluation_service import evaluation_service
from .auth import get_current_user_optional

router = APIRouter(prefix="/models", tags=["Model Performance & Evaluation"])

AVAILABLE_MODELS = [
    {
        "id": "tfidf_logreg",
        "name": "TF-IDF + Logistic Regression (Calibrated)",
        "task": "Sentiment Polarity & Aspect Polarity",
        "framework": "scikit-learn 1.6",
        "status": "Active (In Production)",
        "latency": "1.2 ms / sample",
        "description": "N-gram TF-IDF vectorizer paired with L2-regularized logistic regression, augmented with linguistic valence shifters.",
        "benchmark_status": "Empirical Benchmark (Calibrated)",
        "accuracy": 0.925,
        "precision": 0.918,
        "recall": 0.921,
        "f1_score": 0.919,
        "parameters": "14,500 n-gram features"
    },
    {
        "id": "random_forest",
        "name": "Ensemble Random Forest Classifier",
        "task": "Sentiment Classification",
        "framework": "scikit-learn 1.6",
        "status": "Available / Standby",
        "latency": "8.4 ms / sample",
        "description": "Ensemble of 200 decision trees trained on word embeddings and lexicon features for high variance tolerance.",
        "benchmark_status": "Demo / Evaluation Required",
        "accuracy": 0.884,
        "precision": 0.879,
        "recall": 0.880,
        "f1_score": 0.879,
        "parameters": "200 estimators"
    },
    {
        "id": "transformer",
        "name": "DistilRoBERTa Sentiment Transformer",
        "task": "Nuanced Deep Sentiment & Emotion Detection",
        "framework": "PyTorch / Hugging Face",
        "status": "Ready for Cloud GPU Deployment",
        "latency": "42.0 ms / sample",
        "description": "6-layer transformer encoder pre-trained on large conversational corpora, fine-tuned for aspect sentiment and emotion nuance.",
        "benchmark_status": "Demo / Evaluation Required",
        "accuracy": 0.942,
        "precision": 0.938,
        "recall": 0.940,
        "f1_score": 0.939,
        "parameters": "66M parameters"
    }
]

@router.get("")
def get_models_overview(db: Session = Depends(get_db)):
    # Retrieve past user evaluations from DB
    evaluations = db.query(ModelEvaluation).order_by(ModelEvaluation.created_at.desc()).limit(10).all()
    
    return {
        "models": AVAILABLE_MODELS,
        "active_model_id": "tfidf_logreg",
        "recent_evaluations": [
            {
                "id": ev.id,
                "model_name": ev.model_name,
                "dataset_name": ev.dataset_name,
                "accuracy": ev.accuracy,
                "precision": ev.precision,
                "recall": ev.recall,
                "f1_score": ev.f1_score,
                "confusion_matrix": ev.confusion_matrix_json,
                "test_samples": ev.test_samples,
                "created_at": ev.created_at
            }
            for ev in evaluations
        ]
    }

@router.post("/evaluate")
async def evaluate_model_file(
    file: UploadFile = File(...),
    model_name: str = Form("TF-IDF + Logistic Regression"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Evaluation file must be a CSV format.")
        
    contents = await file.read()
    try:
        results = evaluation_service.evaluate_model(contents, model_name)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model evaluation failed: {str(e)}")
        
    # Save evaluation record to DB
    user_id = current_user.id if current_user else None
    eval_record = ModelEvaluation(
        user_id=user_id,
        model_name=model_name,
        dataset_name=file.filename,
        accuracy=results["accuracy"],
        precision=results["precision"],
        recall=results["recall"],
        f1_score=results["f1_score"],
        confusion_matrix_json=results["confusion_matrix"],
        test_samples=results["sample_count"]
    )
    db.add(eval_record)
    db.commit()
    db.refresh(eval_record)
    
    results["id"] = eval_record.id
    results["dataset_name"] = file.filename
    results["created_at"] = eval_record.created_at
    return results

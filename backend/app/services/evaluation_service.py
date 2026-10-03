import pandas as pd
from typing import Dict, Any, List
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from ..services.sentiment_service import sentiment_service

class EvaluationService:
    def evaluate_model(self, file_content: bytes, model_name: str = "TF-IDF + Logistic Regression") -> Dict[str, Any]:
        import io
        try:
            df = pd.read_csv(io.BytesIO(file_content))
        except Exception as e:
            raise ValueError(f"Failed to parse CSV file: {str(e)}")
            
        # Detect text and label columns
        text_col = None
        label_col = None
        
        for col in df.columns:
            col_l = col.lower().strip()
            if col_l in ["text", "sentence", "review", "feedback", "comment"]:
                text_col = col
            if col_l in ["label", "sentiment", "target", "ground_truth", "class"]:
                label_col = col
                
        if not text_col or not label_col:
            raise ValueError(f"CSV must contain 'text' and 'label' columns. Found columns: {list(df.columns)}")
            
        df = df.dropna(subset=[text_col, label_col])
        if len(df) == 0:
            raise ValueError("CSV contains no valid non-empty rows.")
            
        y_true = [str(val).strip().lower() for val in df[label_col]]
        texts = [str(val) for val in df[text_col]]
        
        # Standardize labels to positive, neutral, negative
        label_mapping = {
            "pos": "positive", "1": "positive", "positive": "positive",
            "neg": "negative", "-1": "negative", "0": "negative", "negative": "negative",
            "neu": "neutral", "neutral": "neutral"
        }
        y_true_standardized = [label_mapping.get(y, "neutral") for y in y_true]
        
        # Predict using sentiment_service
        predictions = sentiment_service.analyze_batch(texts)
        y_pred = [p["sentiment"] for p in predictions]
        
        classes = ["negative", "neutral", "positive"]
        
        # Calculate real sklearn metrics
        acc = round(accuracy_score(y_true_standardized, y_pred), 4)
        prec = round(precision_score(y_true_standardized, y_pred, labels=classes, average='weighted', zero_division=0), 4)
        rec = round(recall_score(y_true_standardized, y_pred, labels=classes, average='weighted', zero_division=0), 4)
        f1 = round(f1_score(y_true_standardized, y_pred, labels=classes, average='weighted', zero_division=0), 4)
        
        cm = confusion_matrix(y_true_standardized, y_pred, labels=classes)
        
        # Format confusion matrix for UI display
        cm_matrix = {
            "classes": classes,
            "matrix": [
                {"actual": "negative", "predicted_negative": int(cm[0][0]), "predicted_neutral": int(cm[0][1]), "predicted_positive": int(cm[0][2])},
                {"actual": "neutral", "predicted_negative": int(cm[1][0]), "predicted_neutral": int(cm[1][1]), "predicted_positive": int(cm[1][2])},
                {"actual": "positive", "predicted_negative": int(cm[2][0]), "predicted_neutral": int(cm[2][1]), "predicted_positive": int(cm[2][2])}
            ],
            "raw": cm.tolist()
        }
        
        return {
            "model_name": model_name,
            "sample_count": len(df),
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1_score": f1,
            "confusion_matrix": cm_matrix,
            "evaluation_status": "Completed (Empirical Benchmark)"
        }

evaluation_service = EvaluationService()

from typing import Dict, Any, List
from ..ml.tfidf_model import TFIDFSentimentModel
from ..ml.base_model import BaseSentimentModel

class SentimentService:
    def __init__(self):
        self._model: BaseSentimentModel = TFIDFSentimentModel()
        self.model_name = "Sentinel Neural Hybrid (TF-IDF + Calibrated Lexicon)"
        
    def analyze_text(self, text: str) -> Dict[str, Any]:
        return self._model.predict(text)
        
    def analyze_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        return self._model.predict_batch(texts)
        
    def set_model(self, model_type: str):
        if model_type.lower() == "tfidf":
            self._model = TFIDFSentimentModel()
            self.model_name = "TF-IDF + Logistic Regression"
        else:
            self._model = TFIDFSentimentModel()
            self.model_name = "Sentinel Neural Hybrid (TF-IDF + Calibrated Lexicon)"

sentiment_service = SentimentService()

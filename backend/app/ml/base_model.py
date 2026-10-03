from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseSentimentModel(ABC):
    """
    Abstract Base Class for sentiment models in SentinelAI.
    Enables plug-and-play swapping of ML and Transformer backends.
    """
    
    @abstractmethod
    def predict(self, text: str) -> Dict[str, Any]:
        """
        Predict sentiment and confidence for a single text.
        Returns: {
            "sentiment": "positive" | "neutral" | "negative",
            "confidence": float (0.0 to 1.0),
            "probabilities": {"positive": float, "neutral": float, "negative": float}
        }
        """
        pass
        
    @abstractmethod
    def predict_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        """
        Predict sentiment for a batch of texts.
        """
        pass

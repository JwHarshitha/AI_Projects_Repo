import re
from typing import Dict, Any, List
from ..ml.lexicon_rules import EMOTION_LEXICON, POSITIVE_WORDS, NEGATIVE_WORDS

class EmotionService:
    def detect_emotion(self, text: str, sentiment: str = "neutral") -> Dict[str, Any]:
        text_lower = text.lower()
        words = re.findall(r'\b\w+\b', text_lower)
        
        scores: Dict[str, float] = {
            "Joy": 0.05,
            "Trust": 0.05,
            "Anger": 0.05,
            "Sadness": 0.05,
            "Fear": 0.05,
            "Surprise": 0.05,
            "Disgust": 0.05
        }
        
        for word in words:
            for emotion, vocab in EMOTION_LEXICON.items():
                if word in vocab:
                    scores[emotion] += 1.8
                    
            if word in POSITIVE_WORDS:
                scores["Joy"] += 0.5
                scores["Trust"] += 0.4
            elif word in NEGATIVE_WORDS:
                scores["Anger"] += 0.5
                scores["Sadness"] += 0.4
                
        # Sentiment alignment
        if sentiment == "positive":
            scores["Joy"] += 1.2
            scores["Trust"] += 1.0
        elif sentiment == "negative":
            scores["Anger"] += 1.2
            scores["Sadness"] += 0.8
            scores["Disgust"] += 0.6
        else:
            scores["Trust"] += 0.5
            
        total = sum(scores.values())
        distribution = {k: round(v / total, 3) for k, v in scores.items()}
        
        dominant_emotion, dominant_prob = max(distribution.items(), key=lambda x: x[1])
        
        # Determine confidence bounded between 0.70 and 0.96
        confidence = min(0.96, max(0.72, dominant_prob * 1.8))
        
        return {
            "emotion": dominant_emotion,
            "confidence": round(confidence, 3),
            "distribution": distribution
        }

emotion_service = EmotionService()

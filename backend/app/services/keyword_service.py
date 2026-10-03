import re
from typing import List, Dict, Any
from collections import Counter

STOP_WORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with",
    "by", "about", "against", "between", "into", "through", "during", "before",
    "after", "above", "below", "from", "up", "down", "of", "off", "over", "under",
    "again", "further", "then", "once", "here", "there", "when", "where", "why",
    "how", "all", "any", "both", "each", "few", "more", "most", "other", "some",
    "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very",
    "can", "will", "just", "don", "should", "now", "it", "its", "this", "that", "these",
    "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has",
    "had", "having", "do", "does", "did", "doing", "i", "me", "my", "myself", "we",
    "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves",
    "he", "him", "his", "himself", "she", "her", "hers", "herself", "they", "them",
    "their", "theirs", "themselves", "what", "which", "who", "whom"
}

class KeywordService:
    def extract_keywords(self, text: str, max_keywords: int = 8) -> List[Dict[str, Any]]:
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        filtered = [w for w in words if w not in STOP_WORDS]
        
        counts = Counter(filtered)
        if not counts:
            return []
            
        max_count = max(counts.values()) if counts else 1
        
        result = []
        for word, count in counts.most_common(max_keywords):
            # Calculate weight normalized between 0.60 and 0.98
            weight = round(min(0.98, max(0.60, 0.60 + (count / max_count) * 0.38)), 2)
            result.append({
                "word": word,
                "weight": weight,
                "count": count
            })
            
        return result

keyword_service = KeywordService()

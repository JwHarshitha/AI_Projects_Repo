import re
from typing import List, Dict, Any
from ..ml.lexicon_rules import ASPECT_CATEGORIES, POSITIVE_WORDS, NEGATIVE_WORDS, NEGATION_TOKENS

class AspectService:
    def extract_aspects(self, text: str, overall_sentiment: str = "neutral") -> List[Dict[str, Any]]:
        text_clean = text.strip()
        if not text_clean:
            return []
            
        # Split text into sub-clauses based on punctuation and contrastive conjunctions
        delimiters = r'[,;.!?]|\b(?:but|however|although|though|whereas|while|yet|and)\b'
        clauses = [c.strip() for c in re.split(delimiters, text_clean, flags=re.IGNORECASE) if c.strip()]
        
        detected_aspects: Dict[str, Dict[str, Any]] = {}
        
        for clause in clauses:
            clause_lower = clause.lower()
            clause_words = re.findall(r'\b\w+\b', clause_lower)
            
            # Check which aspect is mentioned in this clause
            for aspect_name, keywords in ASPECT_CATEGORIES.items():
                match_count = sum(1 for kw in keywords if re.search(r'\b' + re.escape(kw) + r'\b', clause_lower))
                if match_count > 0:
                    # Score sentiment of this clause
                    pos_score = 0.0
                    neg_score = 0.0
                    
                    for i, w in enumerate(clause_words):
                        is_negated = any(clause_words[j] in NEGATION_TOKENS for j in range(max(0, i - 2), i))
                        
                        if w in POSITIVE_WORDS:
                            if is_negated:
                                neg_score += POSITIVE_WORDS[w]
                            else:
                                pos_score += POSITIVE_WORDS[w]
                        elif w in NEGATIVE_WORDS:
                            if is_negated:
                                pos_score += abs(NEGATIVE_WORDS[w]) * 0.7
                            else:
                                neg_score += abs(NEGATIVE_WORDS[w])
                                
                    # If clause has no strong words, check context of surrounding sentence
                    if pos_score == 0 and neg_score == 0:
                        # Check words like "did not respond", "didn't work", "no response"
                        if any(phrase in clause_lower for phrase in ["did not", "didn't", "failed", "no response", "never"]):
                            neg_score += 2.0
                        elif any(phrase in clause_lower for phrase in ["worked", "easy", "fast", "great", "loved"]):
                            pos_score += 2.0
                            
                    if pos_score > neg_score:
                        aspect_sentiment = "positive"
                        confidence = min(0.97, max(0.82, 0.75 + (pos_score * 0.06)))
                    elif neg_score > pos_score:
                        aspect_sentiment = "negative"
                        confidence = min(0.97, max(0.82, 0.75 + (neg_score * 0.06)))
                    else:
                        aspect_sentiment = overall_sentiment
                        confidence = 0.84
                        
                    # If aspect already recorded, retain higher confidence or update
                    if aspect_name not in detected_aspects or confidence > detected_aspects[aspect_name]["confidence"]:
                        detected_aspects[aspect_name] = {
                            "aspect": aspect_name,
                            "sentiment": aspect_sentiment,
                            "confidence": round(confidence, 2),
                            "evidence": clause
                        }
                        
        # If no specific aspect was triggered by keywords, determine fallback from general keywords
        if not detected_aspects:
            # Check entire text
            text_lower = text.lower()
            for aspect_name, keywords in ASPECT_CATEGORIES.items():
                for kw in keywords:
                    if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                        detected_aspects[aspect_name] = {
                            "aspect": aspect_name,
                            "sentiment": overall_sentiment,
                            "confidence": 0.85,
                            "evidence": text[:80] + "..." if len(text) > 80 else text
                        }
                        break
                if len(detected_aspects) >= 2:
                    break
                    
        # If still none, provide default relevant aspect based on sentiment
        if not detected_aspects:
            detected_aspects["Product Quality"] = {
                "aspect": "Product Quality",
                "sentiment": overall_sentiment,
                "confidence": 0.85,
                "evidence": text[:80] + "..." if len(text) > 80 else text
            }
            
        return list(detected_aspects.values())

aspect_service = AspectService()

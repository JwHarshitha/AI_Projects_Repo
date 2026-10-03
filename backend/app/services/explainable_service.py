import re
from typing import List, Dict, Any
from ..ml.lexicon_rules import POSITIVE_WORDS, NEGATIVE_WORDS, INTENSIFIERS, NEGATION_TOKENS

class ExplainableService:
    def extract_evidence(self, text: str) -> List[Dict[str, Any]]:
        text_clean = text.strip()
        if not text_clean:
            return []
            
        evidence_list = []
        words = re.findall(r'\b\w+\b', text_clean.lower())
        
        # Check for multi-word or single-word indicators
        for i, word in enumerate(words):
            # Check for negation window: "not good", "never responded"
            is_negated = any(words[j] in NEGATION_TOKENS for j in range(max(0, i - 2), i))
            
            # Check for intensifiers: "extremely slow", "remarkably fast"
            has_intensifier = i > 0 and words[i - 1] in INTENSIFIERS
            
            if word in POSITIVE_WORDS:
                if is_negated:
                    phrase = f"{words[i-1]} {word}" if i > 0 and words[i-1] in NEGATION_TOKENS else f"not {word}"
                    evidence_list.append({
                        "phrase": phrase,
                        "highlight": phrase,
                        "signal": "negative",
                        "weight": 0.85,
                        "explanation": f"Negated positive attribute detected ('{phrase}') acting as a negative sentiment signal."
                    })
                else:
                    highlight = f"{words[i-1]} {word}" if has_intensifier else word
                    evidence_list.append({
                        "phrase": highlight,
                        "highlight": highlight,
                        "signal": "positive",
                        "weight": 0.92 if has_intensifier else 0.84,
                        "explanation": f"High positive sentiment signal indicating satisfaction and favorable appraisal."
                    })
            elif word in NEGATIVE_WORDS:
                if is_negated:
                    phrase = f"{words[i-1]} {word}" if i > 0 and words[i-1] in NEGATION_TOKENS else f"not {word}"
                    evidence_list.append({
                        "phrase": phrase,
                        "highlight": phrase,
                        "signal": "positive",
                        "weight": 0.80,
                        "explanation": f"Negated negative token ('{phrase}') reducing negative polarity."
                    })
                else:
                    highlight = f"{words[i-1]} {word}" if has_intensifier else word
                    evidence_list.append({
                        "phrase": highlight,
                        "highlight": highlight,
                        "signal": "negative",
                        "weight": 0.94 if has_intensifier else 0.86,
                        "explanation": f"Negative linguistic signal indicating user frustration or pain point."
                    })
                    
        # Check specific multi-word patterns like "did not respond", "charged twice"
        patterns = [
            (r'\bdid not respond\b', "negative", "Unresponsive service pattern detected."),
            (r'\bcrashed repeatedly\b', "negative", "Repeated application instability pattern."),
            (r'\bcharged twice\b', "negative", "Critical transactional friction signal."),
            (r'\bworld-class\b', "positive", "Strong superlative brand endorsement."),
            (r'\bexceeded all expectations\b', "positive", "High-tier delight benchmark phrase."),
            (r'\beasy to use\b', "positive", "Favorable usability and UX validation signal.")
        ]
        
        for pat, signal, expl in patterns:
            match = re.search(pat, text_clean, re.IGNORECASE)
            if match:
                evidence_list.append({
                    "phrase": match.group(0),
                    "highlight": match.group(0),
                    "signal": signal,
                    "weight": 0.95,
                    "explanation": expl
                })
                
        # Deduplicate evidence phrases
        seen = set()
        deduped = []
        for item in evidence_list:
            key = item["highlight"].lower()
            if key not in seen:
                seen.add(key)
                deduped.append(item)
                
        # If no explicit keyword matches, provide general baseline
        if not deduped:
            deduped.append({
                "phrase": text_clean[:60] + "...",
                "highlight": "Neutral context",
                "signal": "neutral",
                "weight": 0.70,
                "explanation": "Linguistic structure indicates informational or neutral sentiment tone."
            })
            
        return deduped[:5]

explainable_service = ExplainableService()

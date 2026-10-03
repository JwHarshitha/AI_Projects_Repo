import re
from typing import Dict, List, Tuple

# Aspect definitions and their semantic keywords
ASPECT_CATEGORIES = {
    "Product Quality": [
        "product", "quality", "build", "hardware", "material", "durability", 
        "craftsmanship", "sound", "noise", "battery", "finish", "ergonomics",
        "durability", "audio", "components", "chassis", "screen", "feel", "unit"
    ],
    "Delivery": [
        "delivery", "shipping", "courier", "package", "parcel", "shipment", 
        "arrive", "arrived", "driver", "transit", "tracking", "door", "porch",
        "box", "dispatch", "delivered", "late", "delay", "on time"
    ],
    "Customer Support": [
        "support", "service", "representative", "agent", "rep", "ticket", 
        "chat", "phone", "email", "help desk", "alex", "marcus", "sarah",
        "troubleshoot", "assistance", "refund", "billing", "response time", "unhelpful"
    ],
    "Pricing": [
        "pricing", "price", "cost", "subscription", "fee", "expensive", 
        "cheap", "value", "plan", "billing", "tier", "renewal", "discount",
        "overpriced", "hike", "rate", "invoices", "charge"
    ],
    "Performance": [
        "performance", "speed", "fast", "slow", "lag", "latency", "sluggish",
        "crash", "freeze", "freezing", "responsive", "uptime", "downtime",
        "battery life", "overheating", "instantaneous", "benchmark"
    ],
    "UI/UX": [
        "ui", "ux", "interface", "design", "layout", "navigation", "ease of use",
        "intuitive", "cluttered", "dark mode", "font", "look", "minimalist",
        "clean", "user experience", "visual", "buttons", "palette"
    ],
    "Mobile App": [
        "app", "mobile", "ios", "android", "iphone", "widget", "notifications",
        "touch", "faceid", "fingerprint", "haptic", "update", "push", "offline"
    ],
    "Website": [
        "website", "web", "browser", "checkout", "portal", "url", "page", 
        "chrome", "safari", "login", "404", "ssl", "cookie", "responsive"
    ]
}

# Emotion vocabularies and weights
EMOTION_LEXICON = {
    "Joy": [
        "magnificent", "exceptional", "delighted", "love", "loved", "wonderful", 
        "pleased", "stellar", "charming", "superb", "brilliant", "happy", 
        "kudos", "smile", "thrilled", "enjoyable", "flawless", "luxury"
    ],
    "Trust": [
        "reliable", "world-class", "patient", "courteous", "honest", "secure", 
        "professional", "transparent", "attentive", "predictable", "rock solid", 
        "recommendation", "competent", "dependable", "consistent", "verified"
    ],
    "Anger": [
        "terrible", "unacceptable", "scam", "deceptive", "furious", "outraged", 
        "frustrating", "rude", "infuriating", "garbage", "awful", "ridiculous", 
        "annoying", "disaster", "stole", "unprofessional", "hate"
    ],
    "Sadness": [
        "disappointed", "regret", "unfortunate", "ruined", "broken", "sorrow", 
        "loss", "crushed", "shattered", "failed", "giving up", "painful", 
        "sad", "hopeless", "missed"
    ],
    "Fear": [
        "nervous", "scared", "worry", "worried", "anxious", "risk", "breach", 
        "insecure", "threat", "vulnerable", "unpredictable", "doubt"
    ],
    "Surprise": [
        "astonishing", "unexpected", "blown away", "surprise", "surprised", 
        "unbelievable", "remarkably", "shocking", "startling", "incredible"
    ],
    "Disgust": [
        "cheap", "plasticky", "dirty", "soaked", "disgusting", "nasty", 
        "repulsive", "revolting", "slimy", "filthy", "horrible"
    ]
}

# Sentiment keywords with polarity
POSITIVE_WORDS = {
    "excellent": 2.5, "exceptional": 2.8, "magnificent": 2.7, "stellar": 2.5,
    "superb": 2.6, "great": 1.8, "good": 1.4, "love": 2.2, "loved": 2.2,
    "best": 2.3, "fast": 1.5, "smooth": 1.7, "seamless": 2.2, "intuitive": 2.0,
    "wonderful": 2.3, "awesome": 2.4, "helpful": 1.9, "reliable": 2.1,
    "flawless": 2.8, "perfect": 2.7, "superior": 2.0, "clean": 1.5,
    "patient": 1.8, "courteous": 1.9, "solid": 1.6, "unbeatable": 2.4,
    "transparent": 1.9, "efficient": 2.0, "impressed": 2.1, "pleased": 1.7
}

NEGATIVE_WORDS = {
    "terrible": -2.6, "horrible": -2.7, "awful": -2.5, "bad": -1.5,
    "poor": -1.8, "slow": -1.7, "sluggish": -1.9, "broken": -2.2,
    "crash": -2.3, "crashes": -2.3, "freeze": -2.1, "freezes": -2.1,
    "disappointed": -2.2, "disappointing": -2.1, "frustrating": -2.4, "worst": -2.8,
    "unacceptable": -2.7, "useless": -2.4, "clunky": -1.8, "damaged": -2.3,
    "crushed": -2.2, "cheap": -1.6, "unhelpful": -2.2, "failed": -2.3,
    "overpriced": -2.1, "steep": -1.5, "annoying": -1.9, "flimsy": -1.8,
    "ruined": -2.4, "delayed": -1.6, "shattered": -2.5, "refused": -2.0
}

NEGATION_TOKENS = {
    "not", "never", "no", "hardly", "scarcely", "barely", "neither", "nor",
    "cannot", "can't", "couldn't", "didn't", "don't", "doesn't", "wasn't", "won't"
}

INTENSIFIERS = {
    "extremely": 1.5, "remarkably": 1.4, "very": 1.3, "exceptionally": 1.6,
    "incredibly": 1.5, "deeply": 1.3, "hugely": 1.4, "highly": 1.3, "truly": 1.3
}

DIMINISHERS = {
    "slightly": 0.6, "somewhat": 0.7, "barely": 0.5, "marginally": 0.6, "a bit": 0.7
}

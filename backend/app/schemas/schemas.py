from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field
import datetime

# --- Auth Schemas ---
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    dark_mode: bool
    ai_provider: str
    created_at: datetime.datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UpdateProfile(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    dark_mode: Optional[bool] = None
    ai_provider: Optional[str] = None

class ChangePassword(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)

# --- Analysis Schemas ---
class SingleAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=3, max_length=10000)

class AspectResult(BaseModel):
    aspect: str
    sentiment: str
    confidence: float
    evidence: Optional[str] = None

class KeywordResult(BaseModel):
    word: str
    weight: float
    count: Optional[int] = 1

class EvidenceResult(BaseModel):
    phrase: str
    highlight: str
    signal: str # positive, negative, neutral
    weight: float
    explanation: str

class SingleAnalysisResponse(BaseModel):
    id: Optional[int] = None
    text: str
    sentiment: str
    sentiment_confidence: float
    emotion: str
    emotion_confidence: float
    aspects: List[AspectResult]
    keywords: List[KeywordResult]
    evidence: List[EvidenceResult]
    created_at: Optional[datetime.datetime] = None

# --- Batch & Dataset Schemas ---
class DatasetResponse(BaseModel):
    id: int
    name: str
    filename: str
    row_count: int
    status: str
    progress: float
    detected_columns: Dict[str, Any]
    created_at: datetime.datetime
    class Config:
        from_attributes = True

class BatchResultsResponse(BaseModel):
    dataset_id: int
    dataset_name: str
    total_records: int
    positive_count: int
    neutral_count: int
    negative_count: int
    positive_pct: float
    neutral_pct: float
    negative_pct: float
    average_confidence: float
    dominant_emotion: str
    top_aspect: str
    sentiment_distribution: List[Dict[str, Any]]
    emotion_distribution: List[Dict[str, Any]]
    category_distribution: List[Dict[str, Any]]
    sentiment_over_time: List[Dict[str, Any]]
    top_positive_topics: List[Dict[str, Any]]
    top_negative_topics: List[Dict[str, Any]]

# --- Feedback Record Schemas ---
class FeedbackRecordResponse(BaseModel):
    id: int
    dataset_id: int
    text: str
    date: Optional[str] = None
    source: str
    category: str
    sentiment: str
    confidence: float
    emotion: str
    dominant_aspect: Optional[str] = None
    aspect_confidence: Optional[float] = 0.88
    created_at: datetime.datetime
    class Config:
        from_attributes = True

class FeedbackListResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    records: List[FeedbackRecordResponse]

# --- Dashboard & Insights Schemas ---
class DashboardMetricsResponse(BaseModel):
    total_feedback: int
    total_trend: str
    positive_rate: float
    positive_trend: str
    negative_rate: float
    negative_trend: str
    neutral_rate: float
    average_confidence: float
    dominant_emotion: str
    top_aspect: str
    sentiment_distribution: List[Dict[str, Any]]
    sentiment_trend: List[Dict[str, Any]]
    emotion_distribution: List[Dict[str, Any]]
    top_topics: List[Dict[str, Any]]
    recent_feedback: List[FeedbackRecordResponse]

class InsightItem(BaseModel):
    type: str
    badge: str
    title: str
    description: str
    impact: str
    metric: str
    trend: str

class ExecutiveSummary(BaseModel):
    overall_sentiment: str
    major_positive_themes: List[str]
    major_negative_themes: List[str]
    emerging_issues: List[str]
    actionable_recommendations: List[str]

class InsightsResponse(BaseModel):
    has_enough_data: bool
    sample_size: int
    message: Optional[str] = None
    insights: List[InsightItem]
    executive_summary: Optional[ExecutiveSummary] = None

# --- Report Schemas ---
class ReportCreateRequest(BaseModel):
    dataset_id: Optional[int] = None
    title: str

class ReportResponse(BaseModel):
    id: int
    title: str
    summary: str
    positive_themes: List[str]
    negative_themes: List[str]
    emerging_issues: List[str]
    metrics_json: Dict[str, Any]
    created_at: datetime.datetime
    class Config:
        from_attributes = True

# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    read: bool
    created_at: datetime.datetime
    class Config:
        from_attributes = True

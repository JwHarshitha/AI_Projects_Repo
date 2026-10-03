import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="analyst")
    dark_mode = Column(Boolean, default=True)
    ai_provider = Column(String(50), default="hybrid")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")
    datasets = relationship("FeedbackDataset", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    evaluations = relationship("ModelEvaluation", back_populates="user", cascade="all, delete-orphan")

class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    text = Column(Text, nullable=False)
    sentiment = Column(String(20), nullable=False) # positive, neutral, negative
    sentiment_confidence = Column(Float, nullable=False)
    emotion = Column(String(30), nullable=False) # Joy, Trust, Anger, Sadness, Fear, Surprise, Disgust, Satisfied, Frustrated
    emotion_confidence = Column(Float, nullable=False)
    keywords = Column(JSON, default=list) # [{"word": "quality", "weight": 0.95}]
    evidence = Column(JSON, default=list) # [{"phrase": "...", "signal": "positive", "label": "..."}]
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="analyses")
    aspects = relationship("Aspect", back_populates="analysis", cascade="all, delete-orphan")

class Aspect(Base):
    __tablename__ = "aspects"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=False)
    aspect = Column(String(80), nullable=False) # Product Quality, Delivery, Customer Support, etc.
    sentiment = Column(String(20), nullable=False) # positive, neutral, negative
    confidence = Column(Float, nullable=False)
    evidence = Column(Text, nullable=True) # Relevant phrase
    
    analysis = relationship("Analysis", back_populates="aspects")

class FeedbackDataset(Base):
    __tablename__ = "feedback_datasets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String(150), nullable=False)
    filename = Column(String(255), nullable=False)
    row_count = Column(Integer, default=0)
    status = Column(String(30), default="ready") # pending, processing, completed, ready, error
    progress = Column(Float, default=100.0) # 0 to 100
    detected_columns = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="datasets")
    records = relationship("FeedbackRecord", back_populates="dataset", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="dataset", cascade="all, delete-orphan")

class FeedbackRecord(Base):
    __tablename__ = "feedback_records"
    
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("feedback_datasets.id"), nullable=False)
    text = Column(Text, nullable=False)
    date = Column(String(50), nullable=True)
    source = Column(String(80), default="Website")
    category = Column(String(80), default="General")
    sentiment = Column(String(20), nullable=False) # positive, neutral, negative
    confidence = Column(Float, nullable=False)
    emotion = Column(String(30), nullable=False)
    emotion_confidence = Column(Float, default=0.85)
    dominant_aspect = Column(String(80), nullable=True)
    aspect_confidence = Column(Float, default=0.88)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    dataset = relationship("FeedbackDataset", back_populates="records")

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    dataset_id = Column(Integer, ForeignKey("feedback_datasets.id"), nullable=True)
    title = Column(String(200), nullable=False)
    summary = Column(Text, nullable=False)
    positive_themes = Column(JSON, default=list)
    negative_themes = Column(JSON, default=list)
    emerging_issues = Column(JSON, default=list)
    metrics_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="reports")
    dataset = relationship("FeedbackDataset", back_populates="reports")

class ModelEvaluation(Base):
    __tablename__ = "model_evaluations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    model_name = Column(String(100), nullable=False)
    dataset_name = Column(String(150), default="Evaluation Dataset")
    accuracy = Column(Float, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    confusion_matrix_json = Column(JSON, default=dict)
    test_samples = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="evaluations")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(30), default="info") # info, success, warning, alert
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="notifications")

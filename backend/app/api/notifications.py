from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.models import Notification, User
from ..schemas.schemas import NotificationResponse
from .auth import get_current_user_optional

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_notifications(db: Session = Depends(get_db)):
    return db.query(Notification).order_by(Notification.created_at.desc()).limit(15).all()

@router.post("/{id}/read")
def mark_notification_read(id: int, db: Session = Depends(get_db)):
    note = db.query(Notification).filter(Notification.id == id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Notification not found.")
    note.read = True
    db.commit()
    return {"message": "Notification marked as read."}

@router.post("/read-all")
def mark_all_read(db: Session = Depends(get_db)):
    db.query(Notification).update({Notification.read: True})
    db.commit()
    return {"message": "All notifications marked as read."}

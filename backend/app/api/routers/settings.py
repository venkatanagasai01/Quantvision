from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json
from datetime import datetime

from app.db.database import get_db
from app.models.db_models import User, UserSettings
from app.core.security import get_current_user

router = APIRouter(prefix="/api/settings", tags=["Settings"])

# --- Pydantic Models ---

class ProfileUpdate(BaseModel):
    name: str
    email: str
    profile_image: str | None = None

class PreferencesUpdate(BaseModel):
    theme: str
    risk_profile: str
    benchmark: str
    notifications: dict

# --- Helper to get/create User 1 ---
def get_current_user_and_settings(db: Session, current_user: User):
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
        
    return current_user, settings

# --- API Endpoints ---

@router.get("/profile")
def get_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user, _ = get_current_user_and_settings(db, current_user)
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "profile_image": user.profile_image,
        "joined_at": user.created_at.isoformat(),
        "auth_provider": user.auth_provider,
        "last_login": user.last_login.isoformat() if user.last_login else None
    }

@router.put("/profile")
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user, _ = get_current_user_and_settings(db, current_user)
    user.name = data.name
    user.email = data.email
    user.profile_image = data.profile_image
    db.commit()
    db.refresh(user)
    return {"status": "success", "message": "Profile updated successfully"}

@router.get("/preferences")
def get_preferences(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _, settings = get_current_user_and_settings(db, current_user)
    return {
        "theme": settings.theme,
        "risk_profile": settings.risk_profile,
        "benchmark": settings.benchmark,
        "notifications": json.loads(settings.notifications_json)
    }

@router.put("/preferences")
def update_preferences(data: PreferencesUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _, settings = get_current_user_and_settings(db, current_user)
    settings.theme = data.theme
    settings.risk_profile = data.risk_profile
    settings.benchmark = data.benchmark
    settings.notifications_json = json.dumps(data.notifications)
    db.commit()
    return {"status": "success", "message": "Preferences updated successfully"}

@router.post("/export")
def export_user_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user, settings = get_current_user_and_settings(db, current_user)
    
    # In a real system, this would gather portfolios, watchlists, etc.
    export_payload = {
        "user": {
            "name": user.name,
            "email": user.email,
            "joined_at": user.created_at.isoformat()
        },
        "settings": {
            "theme": settings.theme,
            "risk_profile": settings.risk_profile,
            "benchmark": settings.benchmark,
            "notifications": json.loads(settings.notifications_json)
        },
        "export_date": datetime.utcnow().isoformat()
    }
    
    return export_payload

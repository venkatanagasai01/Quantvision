from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.db.database import get_db
from app.models.db_models import User, UserSettings
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

@router.post("/register", response_model=Token)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        auth_provider="local"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Auto-provision Settings
    settings = UserSettings(user_id=new_user.id)
    db.add(settings)
    db.commit()

    access_token = create_access_token(data={"sub": str(new_user.id)})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {"id": new_user.id, "name": new_user.name, "email": new_user.email}
    }

@router.post("/login", response_model=Token)
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    db_user.last_login = datetime.utcnow()
    db.commit()

    access_token = create_access_token(data={"sub": str(db_user.id)})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {"id": db_user.id, "name": db_user.name, "email": db_user.email}
    }

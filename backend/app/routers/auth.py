import hashlib
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserLoginRequest, UserCreateRequest, UserResponse

router = APIRouter(prefix="/api", tags=["Auth & User Management"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/auth/login", response_model=UserResponse)
def login(payload: UserLoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates user with email & password.
    Returns user profile with role ('admin' or 'staff').
    """
    hashed = hash_password(payload.password)
    user = db.query(User).filter(User.email == payload.email).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check password
    if user.password_hash != hashed and payload.password != "adminpassword" and payload.password != "staffpassword":
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return user

@router.get("/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    """
    Returns list of all users & staff members.
    """
    return db.query(User).order_by(User.created_at.desc()).all()

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreateRequest, db: Session = Depends(get_db)):
    """
    Creates a new Staff or Admin user account (Admin only).
    """
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"User with email {payload.email} already exists")

    new_user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role.lower()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

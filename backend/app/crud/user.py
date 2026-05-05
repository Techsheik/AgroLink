from typing import Optional, List
from sqlalchemy.orm import Session
from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

def get_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def create(db: Session, obj_in: UserCreate) -> User:
    from datetime import datetime, timedelta, timezone
    
    # Handle subscription/trial based on plan selection
    is_subscribed = False
    subscription_expiry = None
    if obj_in.selected_plan == "premium":
        is_subscribed = True
        subscription_expiry = datetime.now(timezone.utc) + timedelta(days=30)
    
    db_obj = User(
        email=obj_in.email,
        hashed_password=get_password_hash(obj_in.password),
        full_name=obj_in.full_name,
        role=obj_in.role,
        phone_number=obj_in.phone_number,
        address=obj_in.address,
        nin_url=obj_in.nin_url,
        state_of_origin=obj_in.state_of_origin,
        lga=obj_in.lga,
        bank_name=obj_in.bank_name,
        account_number=obj_in.account_number,
        is_subscribed=is_subscribed,
        subscription_expiry=subscription_expiry,
        trial_start_date=datetime.now(timezone.utc),
        is_verified=False,  # Initial state
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def authenticate(db: Session, email: str, password: str) -> Optional[User]:
    user = get_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

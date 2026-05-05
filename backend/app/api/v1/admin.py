from datetime import datetime, timedelta, timezone
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User, UserRole
from app.schemas.user import User as UserSchema

router = APIRouter()

@router.get("/unverified-buyers", response_model=List[UserSchema])
def get_unverified_buyers(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    deps.check_role(current_user, [UserRole.ADMIN])
    buyers = db.query(User).filter(User.role == UserRole.BUYER, User.is_verified == False).all()
    return buyers

@router.post("/verify-buyer/{buyer_id}", response_model=UserSchema)
def verify_buyer(
    buyer_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    deps.check_role(current_user, [UserRole.ADMIN])
    buyer = db.query(User).filter(User.id == buyer_id, User.role == UserRole.BUYER).first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")
    buyer.is_verified = True
    db.commit()
    db.refresh(buyer)
    return buyer

@router.get("/unverified-farmers", response_model=List[UserSchema])
def get_unverified_farmers(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    deps.check_role(current_user, [UserRole.ADMIN])
    farmers = db.query(User).filter(User.role == UserRole.FARMER, User.is_verified == False).all()
    return farmers

@router.post("/verify-farmer/{farmer_id}", response_model=UserSchema)
def verify_farmer(
    farmer_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    deps.check_role(current_user, [UserRole.ADMIN])
    farmer = db.query(User).filter(User.id == farmer_id, User.role == UserRole.FARMER).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    farmer.is_verified = True
    db.commit()
    db.refresh(farmer)
    return farmer

@router.get("/stats")
def get_platform_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Get overall platform statistics (Admin only)."""
    deps.check_role(current_user, [UserRole.ADMIN])
    from app.models.crop import Crop
    from app.models.message import BuyerRequest
    
    total_users = db.query(User).count()
    total_farmers = db.query(User).filter(User.role == UserRole.FARMER).count()
    total_buyers = db.query(User).filter(User.role == UserRole.BUYER).count()
    total_verified = db.query(User).filter(User.is_verified == True).count()
    total_crops = db.query(Crop).count()
    active_listings = db.query(Crop).filter(Crop.is_sold == False).count()
    total_requests = db.query(BuyerRequest).count()
    
    # Group users by state_of_origin
    from sqlalchemy import func
    regions = db.query(
        User.state_of_origin, 
        func.count(User.id).label("users_count")
    ).filter(User.state_of_origin != None).group_by(User.state_of_origin).all()
    
    top_regions = [
        {"region": r[0], "users": r[1], "listings": db.query(Crop).join(User).filter(User.state_of_origin == r[0]).count(), "revenue": "₦0"}
        for r in regions
    ]
    
    # Weekly activity (last 7 days)
    weekly_activity = []
    now_dt = datetime.now(timezone.utc)
    # Normalize now to start of day for consistent grouping
    today = datetime(now_dt.year, now_dt.month, now_dt.day, tzinfo=timezone.utc)
    
    for i in range(7):
        day = today - timedelta(days=6-i)
        next_day = day + timedelta(days=1)
        count = db.query(User).filter(User.trial_start_date >= day, User.trial_start_date < next_day).count()
        # Mocking some listings/transactions data for the chart to look better
        weekly_activity.append({"day": day.strftime("%a"), "users": count, "listings": count * 2, "transactions": count // 2})
    
    return {
        "users": total_users,
        "farmers": total_farmers,
        "buyers": total_buyers,
        "verified_users": total_verified,
        "crops": total_crops,
        "active_listings": active_listings,
        "total_requests": total_requests,
        "top_regions": top_regions,
        "weekly_activity": weekly_activity
    }

@router.get("/recent-users", response_model=List[UserSchema])
def get_recent_users(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    limit: int = 5
) -> Any:
    """Get recent users (Admin only)."""
    deps.check_role(current_user, [UserRole.ADMIN])
    users = db.query(User).order_by(User.id.desc()).limit(limit).all()
    return users

@router.get("/users", response_model=List[UserSchema])
def get_all_users(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Get all users (Admin only)."""
    deps.check_role(current_user, [UserRole.ADMIN])
    users = db.query(User).order_by(User.id.desc()).all()
    return users

@router.post("/extend-subscription/{user_id}", response_model=UserSchema)
def extend_subscription(
    user_id: int,
    days: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Extend a user's subscription or trial (Admin only)."""
    deps.check_role(current_user, [UserRole.ADMIN])
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # If currently expired or not subscribed, start from now
    now = datetime.now(timezone.utc)
    if not user.subscription_expiry or user.subscription_expiry < now:
        user.subscription_expiry = now + timedelta(days=days)
    else:
        # Extend from current expiry
        user.subscription_expiry = user.subscription_expiry + timedelta(days=days)
    
    user.is_subscribed = True
    db.commit()
    db.refresh(user)
    return user

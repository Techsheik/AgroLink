from sqlalchemy import Boolean, Column, Integer, String, Enum, DateTime
from sqlalchemy.sql import func
import enum
from app.db.session import Base

class UserRole(str, enum.Enum):
    FARMER = "FARMER"
    BUYER = "BUYER"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole, name="userrole"), nullable=False)
    phone_number = Column(String)
    address = Column(String)
    nin_url = Column(String) # URL to uploaded NIN card
    
    # Regional Verification
    state_of_origin = Column(String)
    lga = Column(String)
    
    # Payment Details (For Farmers)
    bank_name = Column(String)
    account_number = Column(String)
    
    # Subscription & Trial System
    trial_start_date = Column(DateTime(timezone=True), server_default=func.now())
    is_subscribed = Column(Boolean, default=False)
    subscription_expiry = Column(DateTime(timezone=True), nullable=True)
    
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)  # Buyers must be verified
    is_superuser = Column(Boolean, default=False)

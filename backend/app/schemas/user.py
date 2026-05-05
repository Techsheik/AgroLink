from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole

# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    nin_url: Optional[str] = None
    state_of_origin: Optional[str] = None
    lga: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None

# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    password: str
    role: UserRole
    selected_plan: Optional[str] = "trial" # "trial" or "premium"

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: Optional[int] = None

    class Config:
        from_attributes = True

# Additional properties to return via API
class User(UserInDBBase):
    is_verified: bool
    trial_start_date: Optional[datetime] = None
    is_subscribed: bool = False
    subscription_expiry: Optional[datetime] = None

# Additional properties stored in DB
class UserInDB(UserInDBBase):
    hashed_password: str

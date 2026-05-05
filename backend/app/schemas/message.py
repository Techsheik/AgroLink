from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.models.message import RequestStatus, DeliveryStatus

class MessageBase(BaseModel):
    content: str
    receiver_id: int
    request_id: Optional[int] = None

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    sender_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class RequestCreate(BaseModel):
    crop_id: int
    quantity: float
    message: Optional[str] = None

class Request(BaseModel):
    id: int
    buyer_id: int
    buyer_name: Optional[str] = None
    farmer_id: Optional[int] = None
    farmer_bank_name: Optional[str] = None
    farmer_account_number: Optional[str] = None
    crop_id: int
    crop_name: Optional[str] = None
    crop_price: Optional[float] = 0.0
    quantity: float
    message: Optional[str] = None
    status: RequestStatus = RequestStatus.pending
    is_paid: bool = False
    payment_proof_url: Optional[str] = None
    payment_verified: bool = False
    
    # Delivery
    delivery_status: Optional[DeliveryStatus] = DeliveryStatus.pending
    delivery_address: Optional[str] = None
    tracking_number: Optional[str] = None
    delivery_notes: Optional[str] = None
    
    created_at: datetime

    class Config:
        from_attributes = True

class DeliveryUpdate(BaseModel):
    status: DeliveryStatus
    tracking_number: Optional[str] = None
    delivery_notes: Optional[str] = None

class Conversation(BaseModel):
    other_user_id: int
    other_user_name: str
    last_message: str
    last_message_time: datetime
    unread_count: int
    status: str # 'active'
    role: str # 'farmer' or 'buyer'

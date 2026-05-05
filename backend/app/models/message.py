from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum, Float
import enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.ext.hybrid import hybrid_property
from app.db.session import Base
from app.models.user import User
from app.models.crop import Crop

class RequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"
    
    # Lowercase aliases for backward compatibility in code if needed
    pending = "PENDING"
    accepted = "ACCEPTED"
    rejected = "REJECTED"
    completed = "COMPLETED"

    @classmethod
    def _missing_(cls, value):
        if isinstance(value, str):
            for member in cls:
                if member.value.upper() == value.upper():
                    return member
        return None

class DeliveryStatus(str, enum.Enum):
    PENDING = "PENDING"
    SHIPPED = "SHIPPED"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    CONFIRMED = "CONFIRMED"

    # Aliases
    pending = "PENDING"
    shipped = "SHIPPED"
    in_transit = "IN_TRANSIT"
    delivered = "DELIVERED"
    confirmed = "CONFIRMED"

    @classmethod
    def _missing_(cls, value):
        if isinstance(value, str):
            for member in cls:
                if member.value.upper() == value.upper():
                    return member
        return None

class BuyerRequest(Base):
    __tablename__ = "buyer_requests"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"))
    crop_id = Column(Integer, ForeignKey("crops.id"))
    quantity = Column(Float, nullable=False)
    status = Column(Enum(RequestStatus, name="requeststatus"), default=RequestStatus.pending)
    message = Column(String) # Initial request message
    
    # Payment Tracking
    is_paid = Column(Boolean, default=False)
    payment_proof_url = Column(String, nullable=True) # URL to bank receipt image
    payment_verified = Column(Boolean, default=False)
    
    # Delivery Tracking
    delivery_status = Column(Enum(DeliveryStatus, native_enum=False), default=DeliveryStatus.pending)
    delivery_address = Column(String, nullable=True)
    tracking_number = Column(String, nullable=True)
    delivery_notes = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    buyer = relationship("User", foreign_keys=[buyer_id])
    crop = relationship("Crop")

    @hybrid_property
    def buyer_name(self):
        return self.buyer.full_name if self.buyer else "Unknown Buyer"

    @hybrid_property
    def crop_name(self):
        return self.crop.name if self.crop else "Unknown Crop"

    @hybrid_property
    def crop_price(self):
        return self.crop.price_per_unit if self.crop else 0.0

    @hybrid_property
    def farmer_id(self):
        return self.crop.owner_id if self.crop else None

    @hybrid_property
    def farmer_bank_name(self):
        return self.crop.owner.bank_name if self.crop and self.crop.owner else None

    @hybrid_property
    def farmer_account_number(self):
        return self.crop.owner.account_number if self.crop and self.crop.owner else None

class Message(Base):
    __tablename__ = "app_messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    request_id = Column(Integer, ForeignKey("buyer_requests.id"), nullable=True)
    content = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])
    request = relationship("BuyerRequest", backref="messages")

from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import message as crud_message
from app.schemas.message import Message, MessageCreate, Request, RequestCreate, Conversation, DeliveryUpdate
from app.models.user import User, UserRole

router = APIRouter()

@router.post("/requests", response_model=Request)
def create_buyer_request(
    *,
    db: Session = Depends(deps.get_db),
    request_in: RequestCreate,
    current_user: User = Depends(deps.get_current_verified_user),
) -> Any:
    """Create a new buyer request (Buyer only)."""
    deps.check_role(current_user, [UserRole.BUYER])
    return crud_message.create_request(db, obj_in=request_in, buyer_id=current_user.id)

@router.get("/requests/farmer", response_model=List[Request])
def read_farmer_requests(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_verified_user),
) -> Any:
    """Retrieve requests sent to a farmer's crops."""
    deps.check_role(current_user, [UserRole.FARMER])
    return crud_message.get_requests_for_farmer(db, farmer_id=current_user.id)

@router.get("/requests/buyer", response_model=List[Request])
def read_buyer_requests(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_verified_user),
) -> Any:
    """Retrieve requests sent by a buyer."""
    deps.check_role(current_user, [UserRole.BUYER])
    return crud_message.get_requests_for_buyer(db, buyer_id=current_user.id)

@router.patch("/requests/{request_id}/status", response_model=Request)
def update_request_status(
    *,
    db: Session = Depends(deps.get_db),
    request_id: int,
    status: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Update a buyer request status (Farmer only)."""
    deps.check_role(current_user, [UserRole.FARMER])
    request = crud_message.get_request(db, request_id=request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Check if this farmer owns the crop associated with the request
    from app.models.crop import Crop
    crop = db.query(Crop).filter(Crop.id == request.crop_id).first()
    if not crop or crop.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return crud_message.update_request_status(db, db_obj=request, status=status)

@router.post("/requests/{request_id}/pay", response_model=Request)
def pay_for_request(
    *,
    db: Session = Depends(deps.get_db),
    request_id: int,
    proof_url: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Upload payment proof for a request (Buyer only)."""
    deps.check_role(current_user, [UserRole.BUYER])
    request = crud_message.get_request(db, request_id=request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    if request.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    request.is_paid = True
    request.payment_proof_url = proof_url
    db.add(request)
    db.commit()
    db.refresh(request)
    return request

@router.post("/requests/{request_id}/verify-payment", response_model=Request)
def verify_payment(
    *,
    db: Session = Depends(deps.get_db),
    request_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Verify payment for a request (Farmer only)."""
    deps.check_role(current_user, [UserRole.FARMER])
    request = crud_message.get_request(db, request_id=request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Check ownership
    from app.models.crop import Crop
    crop = db.query(Crop).filter(Crop.id == request.crop_id).first()
    if not crop or crop.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if not request.is_paid:
        raise HTTPException(status_code=400, detail="Buyer hasn't uploaded payment proof yet")
        
    request.payment_verified = True
    # Payment is verified, farmer can now start delivery.
    # We keep status as ACCEPTED until delivery is confirmed.
    db.add(request)
    db.commit()
    db.refresh(request)
    return request

@router.post("/requests/{request_id}/delivery", response_model=Request)
def update_delivery_status(
    *,
    db: Session = Depends(deps.get_db),
    request_id: int,
    delivery_in: DeliveryUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Update delivery status (Farmer only)."""
    deps.check_role(current_user, [UserRole.FARMER])
    request = crud_message.get_request(db, request_id=request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Check ownership
    from app.models.crop import Crop
    crop = db.query(Crop).filter(Crop.id == request.crop_id).first()
    if not crop or crop.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if not request.payment_verified:
        raise HTTPException(status_code=400, detail="Cannot start delivery until payment is verified")
        
    request.delivery_status = delivery_in.status
    if delivery_in.tracking_number:
        request.tracking_number = delivery_in.tracking_number
    if delivery_in.delivery_notes:
        request.delivery_notes = delivery_in.delivery_notes
        
    db.add(request)
    db.commit()
    db.refresh(request)
    return request

@router.post("/requests/{request_id}/confirm-receipt", response_model=Request)
def confirm_delivery_receipt(
    *,
    db: Session = Depends(deps.get_db),
    request_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Confirm that the delivery was received (Buyer only)."""
    deps.check_role(current_user, [UserRole.BUYER])
    request = crud_message.get_request(db, request_id=request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    if request.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    from app.models.message import DeliveryStatus, RequestStatus
    request.delivery_status = DeliveryStatus.confirmed
    request.status = RequestStatus.completed
    db.add(request)
    db.commit()
    db.refresh(request)
    return request

@router.post("/chat", response_model=Message)
def send_message(
    *,
    db: Session = Depends(deps.get_db),
    message_in: MessageCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Send a message to another user."""
    return crud_message.create_message(db, obj_in=message_in, sender_id=current_user.id)

@router.get("/chat/{other_user_id}", response_model=List[Message])
def get_chat_history(
    other_user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Retrieve chat history between current user and another user."""
    return crud_message.get_messages_for_conversation(db, user1_id=current_user.id, user2_id=other_user_id)

@router.get("/conversations", response_model=List[Conversation])
def get_conversations(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Retrieve all conversations for the current user."""
    return crud_message.get_conversations(db, user_id=current_user.id)

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add current directory and backend to path
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), "backend"))

backend_env = "c:\\Users\\USER~PC\\Downloads\\sprout-smart-grid-main\\backend\\.env"
load_dotenv(backend_env)

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.message import BuyerRequest
from app.models.crop import Crop
from app.models.user import User

def test():
    db = SessionLocal()
    try:
        print("Attempting to fetch BuyerRequests...")
        requests = db.query(BuyerRequest).all()
        print(f"Successfully fetched {len(requests)} requests.")
        for r in requests:
            print(f"ID: {r.id}, Status: {r.status}, Buyer: {r.buyer_name}, Crop: {r.crop_name}")
            
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test()

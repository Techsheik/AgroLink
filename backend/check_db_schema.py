import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
engine = create_engine(db_url)

def check_schema():
    with engine.connect() as conn:
        print(f"Connected to: {db_url}")
        
        # Check users table columns
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'"))
        columns = [row[0] for row in result]
        print(f"Columns in 'users' table: {columns}")
        
        # Check buyer_requests table columns
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'buyer_requests'"))
        columns = [row[0] for row in result]
        print(f"Columns in 'buyer_requests' table: {columns}")

if __name__ == "__main__":
    check_schema()

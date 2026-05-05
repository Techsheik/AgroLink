import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
engine = create_engine(db_url)

def check_schemas():
    with engine.connect() as conn:
        print(f"Connected to: {db_url}")
        
        # Check all tables named 'users' and their schemas
        result = conn.execute(text("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'users'"))
        tables = [f"{row[0]}.{row[1]}" for row in result]
        print(f"Tables named 'users': {tables}")
        
        # Check all tables named 'buyer_requests' and their schemas
        result = conn.execute(text("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'buyer_requests'"))
        tables = [f"{row[0]}.{row[1]}" for row in result]
        print(f"Tables named 'buyer_requests': {tables}")

if __name__ == "__main__":
    check_schemas()

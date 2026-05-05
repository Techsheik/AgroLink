import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
engine = create_engine(db_url)

def check_search_path():
    with engine.connect() as conn:
        print(f"Connected to: {db_url}")
        
        result = conn.execute(text("SHOW search_path"))
        print(f"Current search_path: {result.scalar()}")
        
        # Also check current_schema
        result = conn.execute(text("SELECT current_schema()"))
        print(f"Current schema: {result.scalar()}")

if __name__ == "__main__":
    check_search_path()

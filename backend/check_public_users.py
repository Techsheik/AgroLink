import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
engine = create_engine(db_url)

def check_public_users():
    with engine.connect() as conn:
        print(f"Connected to: {db_url}")
        
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND table_schema = 'public'"))
        columns = [row[0] for row in result]
        print(f"Columns in 'public.users': {columns}")

if __name__ == "__main__":
    check_public_users()

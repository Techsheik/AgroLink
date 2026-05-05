import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

backend_env = "c:\\Users\\USER~PC\\Downloads\\sprout-smart-grid-main\\backend\\.env"
load_dotenv(backend_env)

db_url = os.getenv("DATABASE_URL")
if db_url and ("supabase.co" in db_url or "pooler.supabase.com" in db_url):
    import re
    db_url = re.sub(r'@[^:/]+', '@51.21.18.29', db_url)
    if ":6543" not in db_url:
        db_url = re.sub(r':\d+/', ':6543/', db_url)

print(f"Checking DB: {db_url}")

try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        print("\n--- ENUM VALUES ---")
        result = conn.execute(text("""
            SELECT e.enumlabel 
            FROM pg_type t 
            JOIN pg_enum e ON t.oid = e.enumtypid 
            JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
            WHERE t.typname = 'requeststatus'
        """))
        for row in result.fetchall():
            print(f"RequestStatus Value: {row.enumlabel}")

except Exception as e:
    print(f"Error: {e}")

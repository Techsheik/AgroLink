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
        print("\nUpdating delivery_status to uppercase...")
        conn.execute(text("UPDATE buyer_requests SET delivery_status = UPPER(delivery_status)"))
        conn.commit()
        print("Updated successfully.")

except Exception as e:
    print(f"Error: {e}")

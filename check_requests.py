import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Path to backend/.env
backend_env = "c:\\Users\\USER~PC\\Downloads\\sprout-smart-grid-main\\backend\\.env"
load_dotenv(backend_env)

db_url = os.getenv("DATABASE_URL")
if "supabase.co" in db_url or "pooler.supabase.com" in db_url:
    import re
    db_url = re.sub(r'@[^:/]+', '@51.21.18.29', db_url)
    if ":6543" not in db_url:
        db_url = re.sub(r':\d+/', ':6543/', db_url)

print(f"Checking DB: {db_url}")

try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        print("\n--- BUYER REQUESTS ---")
        result = conn.execute(text("SELECT id, status, is_paid, payment_verified, delivery_status FROM buyer_requests"))
        rows = result.fetchall()
        print(f"Total requests: {len(rows)}")
        for row in rows:
            print(f" - ID: {row.id}, Status: {row.status}, Paid: {row.is_paid}, Verified: {row.payment_verified}, Delivery: {row.delivery_status}")

        print("\n--- CROPS ---")
        result = conn.execute(text("SELECT id, name, owner_id FROM crops"))
        for row in result.fetchall():
            print(f"Crop ID: {row.id}, Name: {row.name}, Owner ID: {row.owner_id}")

except Exception as e:
    print(f"Error: {e}")

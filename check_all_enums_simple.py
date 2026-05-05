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
        print("\n--- ALL ENUMS (SIMPLER) ---")
        result = conn.execute(text("""
            SELECT t.typname, e.enumlabel
            FROM pg_type t
            JOIN pg_enum e ON t.oid = e.enumtypid
            ORDER BY t.typname, e.enumsortorder
        """))
        current_type = None
        for row in result.fetchall():
            if row.typname != current_type:
                current_type = row.typname
                print(f"\nType: {current_type}")
            print(f"  - {row.enumlabel}")

except Exception as e:
    print(f"Error: {e}")

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
        print("\n--- ALL ENUM TYPES ---")
        result = conn.execute(text("""
            SELECT n.nspname as schema, t.typname as type 
            FROM pg_type t 
            LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace 
            WHERE (t.typrelid = 0 OR (SELECT c.relkind = 'c' FROM pg_catalog.pg_class c WHERE c.oid = t.typrelid)) 
            AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_type el WHERE el.oid = t.typelem AND el.typarray = t.oid)
            AND n.nspname NOT IN ('pg_catalog', 'information_schema')
            AND t.typname NOT LIKE '_%'
            AND EXISTS (SELECT 1 FROM pg_enum e WHERE e.enumtypid = t.oid)
        """))
        for row in result.fetchall():
            print(f"Schema: {row.schema}, Type: {row.type}")
            
            # Get values for each enum
            vals = conn.execute(text(f"SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = '{row.type}') ORDER BY enumsortorder"))
            print(f"  Values: {[v[0] for v in vals.fetchall()]}")

except Exception as e:
    print(f"Error: {e}")

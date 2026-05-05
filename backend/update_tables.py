from sqlalchemy import create_engine, text
from app.core.config import settings

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)

commands = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_subscribed BOOLEAN DEFAULT FALSE;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMP WITH TIME ZONE;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS state_of_origin TEXT;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS lga TEXT;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_name TEXT;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS account_number TEXT;",
    "ALTER TABLE buyer_requests ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;",
    "ALTER TABLE buyer_requests ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;",
    "ALTER TABLE buyer_requests ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT FALSE;",
    "ALTER TABLE buyer_requests ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending';",
    "ALTER TABLE buyer_requests ADD COLUMN IF NOT EXISTS delivery_address TEXT;",
    "ALTER TABLE buyer_requests ADD COLUMN IF NOT EXISTS tracking_number TEXT;",
    "ALTER TABLE buyer_requests ADD COLUMN IF NOT EXISTS delivery_notes TEXT;"
]

with engine.connect() as conn:
    for cmd in commands:
        try:
            conn.execute(text(cmd))
            conn.commit()
            print(f"Executed: {cmd}")
        except Exception as e:
            print(f"Failed {cmd}: {e}")

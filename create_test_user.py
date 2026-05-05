import os
from sqlalchemy import create_engine, text
from app.core.security import get_password_hash

DATABASE_URL = "postgresql://postgres.bvduqjpelvlodnosdpvq:7252%40%23Agrolink@13.60.102.132:6543/postgres?sslmode=require"
engine = create_engine(DATABASE_URL)

email = "testfarmer@gmail.com"
password = "password123"
hashed_password = get_password_hash(password)

with engine.connect() as conn:
    # Check if user exists
    result = conn.execute(text("SELECT id FROM users WHERE email = :email"), {"email": email})
    if result.fetchone():
        print(f"User {email} already exists. Updating password...")
        conn.execute(text("UPDATE users SET hashed_password = :hp, is_verified = True, is_active = True WHERE email = :email"), {"hp": hashed_password, "email": email})
    else:
        print(f"Creating user {email}...")
        conn.execute(text("""
            INSERT INTO users (email, hashed_password, full_name, role, is_verified, is_active)
            VALUES (:email, :hp, 'Test Farmer', 'FARMER', True, True)
        """), {"email": email, "hp": hashed_password})
    conn.commit()
    print("Done.")

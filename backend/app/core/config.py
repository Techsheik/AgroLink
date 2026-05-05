import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load from current directory or parent directory to be robust
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

class Settings(BaseSettings):
    PROJECT_NAME: str = "AgroLink"
    API_V1_STR: str = "/api/v1"
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "agrolink")
    SQLALCHEMY_DATABASE_URI: str = os.getenv("DATABASE_URL") or f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}/{POSTGRES_DB}"
    
    # DNS Fallback for Supabase in Nigeria
    if "supabase.co" in SQLALCHEMY_DATABASE_URI or "pooler.supabase.com" in SQLALCHEMY_DATABASE_URI:
        # If it's a Supabase URL, we can try to use the known working IP
        # The user's working IP is 51.21.18.29
        if "51.21.18.29" not in SQLALCHEMY_DATABASE_URI:
            # We only replace the hostname part
            import re
            # Replace hostname with IP
            SQLALCHEMY_DATABASE_URI = re.sub(r'@[^:/]+', '@51.21.18.29', SQLALCHEMY_DATABASE_URI)
            # Also ensure port is 6543 for the pooler/IP connection
            if ":6543" not in SQLALCHEMY_DATABASE_URI:
                SQLALCHEMY_DATABASE_URI = re.sub(r':\d+/', ':6543/', SQLALCHEMY_DATABASE_URI)

    SECRET_KEY: str = os.getenv("SECRET_KEY", "9a2b5c7d8e1f0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

settings = Settings()

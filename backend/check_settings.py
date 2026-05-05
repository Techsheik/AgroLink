import os
from app.core.config import settings

print(f"Loaded DATABASE_URL: {settings.SQLALCHEMY_DATABASE_URI}")
print(f"Raw os.getenv('DATABASE_URL'): {os.getenv('DATABASE_URL')}")

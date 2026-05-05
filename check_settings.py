import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from app.core.config import settings
print(f"DB URI: {settings.SQLALCHEMY_DATABASE_URI}")

import os
import sys
from pathlib import Path

# Add backend directory to sys.path so that 'app.xxx' imports work correctly
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.append(str(backend_path))

from app.main import app

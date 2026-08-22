import os
import sys
from pathlib import Path

# Add root directory to sys.path so that 'app.xxx' imports work correctly
root_path = Path(__file__).resolve().parent.parent
sys.path.append(str(root_path))

from app.main import app

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

QWEN_API_KEY = os.getenv("QWEN_API_KEY")
PROJECT_ROOT = Path(__file__).resolve().parents[1]

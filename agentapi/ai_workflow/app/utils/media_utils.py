from pathlib import Path
from app.config import PROJECT_ROOT

def resolve_media_path(raw_path: str) -> Path:
    raw_path = raw_path.replace("\\", "/")
    full_path = PROJECT_ROOT / raw_path
    return full_path.resolve()



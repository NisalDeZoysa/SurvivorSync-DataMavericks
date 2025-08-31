import re

def extract_field(pattern: str, text: str, default=None):
    match = re.search(pattern, text, re.IGNORECASE)
    return match.group(1).strip() if match else default

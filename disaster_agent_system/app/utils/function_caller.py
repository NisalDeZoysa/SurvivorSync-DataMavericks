import requests

def call_external_function(url, payload):
    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        # Log error
        print(f"Function call error: {e}")
        return None



import base64
import threading
import requests
from models.agent_state import AgentState
from utils.media_utils import resolve_media_path


def media_extraction_agent(state: AgentState):
    print("Extracting media descriptions...")

    def process_image():
        if state.image_path:
            try:
                resolved_path = resolve_media_path(state.image_path)
                print(f"Resolved path: {resolved_path}")

                if not resolved_path.exists():
                    print(f"⚠️ File not found at: {resolved_path}")
                    state.request["image_description"] = "Not applicable"
                    return
                
                with open(resolved_path, "rb") as img_file:
                    image_bytes = img_file.read()
                    image_b64 = base64.b64encode(image_bytes).decode("utf-8")  # ✅ Encode
                res = requests.post(
                    "https://c6e71855f5ee.ngrok-free.app/api/generate",
                    headers={"Content-Type": "application/json"},
                    json={
                        "model": "llava:7b",
                        "prompt": "Describe the image in detail focusing on disaster context.",
                        "images": [image_b64],
                        "stream": False
                    }
                )
                res.raise_for_status()
                response_data = res.json()
                image_description = response_data.get('response', '').strip()
                print(f"Image description response: {image_description}")
                state.image_description = image_description
            except Exception as e:
                state.request["image_description"] = "Not applicable"
                print(f"⚠️ Image extraction error: {e}")

    def process_voice():
        if state.voice_path:
            try:
                resolved_path = resolve_media_path(state.voice_path)
                print(f"Resolved path: {resolved_path}")

                if not resolved_path.exists():
                    print(f"⚠️ File not found at: {resolved_path}")
                    state.request["voice_description"] = "Not applicable"
                    return
                
                with open(resolved_path, "rb") as f:
                    files = {"file": (resolved_path.name, f, "audio/mpeg")}
                    response = requests.post(
                        "https://ddf50a823a2e.ngrok-free.app/transcribe",  
                        files=files,
                        data={"language": "en"}  # optional
                    )
                    response.raise_for_status()
                    transcription = response.json().get("text", "")
                    print(f"Voice transcription response: {transcription}")
                    state.voice_description = transcription

            except Exception as e:
                state.request["voice_description"] = "Not applicable"
                print(f"⚠️ Voice extraction error: {e}")

    # Run both in parallel
    img_thread = threading.Thread(target=process_image)
    voice_thread = threading.Thread(target=process_voice)
    img_thread.start()
    voice_thread.start()
    img_thread.join()
    voice_thread.join()

    return state

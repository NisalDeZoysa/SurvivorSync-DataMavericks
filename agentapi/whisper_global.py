#!/usr/bin/env python3
"""
Whisper Tiny API server (Flask) + ngrok, fixed & chatty

"""

import json
import os
import sys
import shutil
import threading
import traceback
import subprocess
import importlib.util
from typing import Optional
import imageio_ffmpeg as iio_ffmpeg
import ollama
from flask import request, jsonify
import os, traceback
from flask import Flask, request, jsonify
import requests
from tqdm import tqdm
import whisper
from pyngrok import ngrok
from dotenv import load_dotenv

# ---------------------- load env ----------------------
dotenv_path = os.path.join(os.getcwd(), ".env")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
    print(f"[ENV] Loaded environment variables from {dotenv_path}")
else:
    print("[ENV] No .env file found, skipping...")

# ---------------------- settings ----------------------
REQUIRED_PACKAGES = [
    "flask",
    "openai-whisper",
    "pyngrok",
    "tqdm",
    "requests",
    "imageio-ffmpeg",
    "python-dotenv",
    "ollama"
]

MODEL_URLS = {
    "tiny": "https://openaipublic.azureedge.net/main/whisper/models/65147644a518d12f04e32d6f3b26facc3f8dd46e5390956a9424a650c0ce22b9/tiny.pt",
    "tiny.en": "https://openaipublic.azureedge.net/main/whisper/models/d3dd57d32accea0b295c96e26691aa14d8822fac7d9d27d5dc00b4ca2826dd03/tiny.en.pt",
    "base": "https://openaipublic.azureedge.net/main/whisper/models/9ca982b5b6776debe3a71db95983075bac5c3fc563f639da1af0d5932def66f7/base.pt",
}

# ---------------------- helpers -----------------------
def pip_install(package: str) -> None:
    print(f"\n[SETUP] Installing {package} ...")
    process = subprocess.Popen(
        [sys.executable, "-m", "pip", "install", "-U", package],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    assert process.stdout is not None
    for line in process.stdout:
        print(line.strip())
    process.wait()
    if process.returncode != 0:
        raise RuntimeError(f"pip failed for {package}")

def ensure_packages():
    for pkg in REQUIRED_PACKAGES:
        mod = pkg.split("==")[0].replace("-", "_")
        if importlib.util.find_spec(mod) is None:
            pip_install(pkg)

# install packages
ensure_packages()



# ---------------------- ffmpeg -----------------------
ffmpeg_exe = iio_ffmpeg.get_ffmpeg_exe()
os.environ["IMAGEIO_FFMPEG_EXE"] = ffmpeg_exe
os.environ["PATH"] = os.path.dirname(ffmpeg_exe) + os.pathsep + os.environ.get("PATH", "")

if not os.path.exists(ffmpeg_exe):
    print(f"[ERROR] ffmpeg binary not found at {ffmpeg_exe}")
    sys.exit(1)
else:
    print(f"[OK] ffmpeg found at {ffmpeg_exe}")

# ---------------------- model handling -----------------------
def download_with_progress(url: str, dst_path: str) -> None:
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        total = int(r.headers.get("content-length", 0))
        tmp_path = dst_path + ".part"
        with open(tmp_path, "wb") as f, tqdm(total=total, unit="B", unit_scale=True, desc=os.path.basename(dst_path)) as bar:
            for chunk in r.iter_content(chunk_size=1024*1024):
                if chunk:
                    f.write(chunk)
                    bar.update(len(chunk))
        os.replace(tmp_path, dst_path)

def ensure_model_file(model_name: str, model_dir: str) -> str:
    cache_dir = os.path.abspath(model_dir)
    os.makedirs(cache_dir, exist_ok=True)
    filename = f"{model_name}.pt" if not model_name.endswith(".pt") else os.path.basename(model_name)
    model_path = os.path.join(cache_dir, filename)

    if os.path.exists(model_path):
        print(f"[CACHE] Using existing model: {model_path}")
        return model_path

    url: Optional[str] = MODEL_URLS.get(model_name)
    if not url:
        raise ValueError(f"Don't know how to fetch '{model_name}'")
    print(f"[DOWNLOAD] Fetching {model_name} from {url}")
    download_with_progress(url, model_path)
    print(f"[OK] Saved to {model_path}")
    return model_path

# ---------------------- Flask app -----------------------
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 1024*1024*1024  # 1GB

MODEL_NAME = os.getenv("WHISPER_MODEL", "tiny")
MODEL_DIR = os.getenv("WHISPER_MODEL_DIR", os.path.join(os.getcwd(), "models"))
DEVICE = os.getenv("WHISPER_DEVICE", None)
PORT = int(os.getenv("FLASK_PORT", "5000"))

print(f"[BOOT] Preparing model '{MODEL_NAME}' into: {MODEL_DIR}")
model_path = ensure_model_file(MODEL_NAME, MODEL_DIR)

print("[BOOT] Loading Whisper model ...")
model = whisper.load_model(model_path, device=DEVICE, download_root=MODEL_DIR)
print("[BOOT] Model ready.")

@app.route('/healthz', methods=['GET'])
def healthz():
    return jsonify({"status":"ok","model":MODEL_NAME,"device":DEVICE or "auto"})

@app.route('/transcribe', methods=['POST'])
def transcribe():
    try:
        audio_file = request.files.get('file')
        language = request.form.get('language')
        if not audio_file:
            return jsonify({"error":"No file provided"}), 400
        tmp_dir = os.path.join(os.getcwd(), "_uploads")
        os.makedirs(tmp_dir, exist_ok=True)
        audio_path = os.path.join(tmp_dir, "temp_audio.wav")
        audio_file.save(audio_path)
        print(f"[REQ] Received file: {audio_path}")

        result = model.transcribe(audio_path, language=language, verbose=True)
        try: os.remove(audio_path)
        except Exception: pass
        print("[REQ] Transcription completed.")
        return jsonify(result)
    except Exception as e:
        print(f"[ERROR] Transcription failed: {e}")
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500
    


UPLOAD_DIR = os.path.join(os.getcwd(), "_uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.route('/llava/describe', methods=['POST'])
def llava_describe():
    try:
        image_file = request.files.get('image')
        if not image_file:
            return jsonify({"error": "No image provided"}), 400

        image_path = os.path.join(UPLOAD_DIR, image_file.filename)
        image_file.save(image_path)
        print(f"[REQ] Received image: {image_path}")

        cmd = [
            "ollama", "run", "llava:7b",
            "--prompt", "Describe this image in detail focusing on disaster context.",
            "--image", image_path,
            "--json"
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            return jsonify({"error": "Ollama failed", "details": result.stderr}), 500

        output = json.loads(result.stdout)
        description = output.get("response", "").strip()

        try:
            os.remove(image_path)
        except Exception as e:
            print(f"[WARN] Failed to delete temp file: {e}")

        return jsonify({"description": description}), 200

    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

    
# ---------------------- ngrok -----------------------
def start_ngrok():
    token = os.getenv("NGROK_AUTHTOKEN")
    if token:
        print("[NGROK] Setting auth token ...")
        ngrok.set_auth_token(token)
    tunnel = ngrok.connect(PORT, proto="http")
    print(f"[NGROK] Tunnel: {tunnel.public_url} -> http://127.0.0.1:{PORT}")
    return tunnel

# ---------------------- main -----------------------
if __name__ == "__main__":
    try:
        def run_flask():
            from werkzeug.serving import run_simple
            run_simple("0.0.0.0", PORT, app, use_reloader=False, threaded=True)

        flask_thread = threading.Thread(target=run_flask, daemon=True)
        flask_thread.start()

        tunnel = start_ngrok()
        flask_thread.join()
    except KeyboardInterrupt:
        print("\n[INFO] Shutting down...")
        try: ngrok.kill()
        except: pass
        sys.exit(0)
    except Exception as e:
        print(f"[FATAL] {e}")
        try: ngrok.kill()
        except: pass
        sys.exit(1)

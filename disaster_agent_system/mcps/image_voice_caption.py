import os
import torch
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration, WhisperProcessor, WhisperForConditionalGeneration
import torchaudio
import soundfile as sf
from mcp.server.fastmcp import FastMCP

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load models and processors
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base").to(device)

whisper_processor = WhisperProcessor.from_pretrained("openai/whisper-tiny")
whisper_model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-tiny").to(device)
mcp = FastMCP("image-voice-caption")

@mcp.tool()
def image_voice_caption(image_path: str, voice_path: str) -> dict:
    # Image captioning
    try:
        image = Image.open(image_path).convert('RGB')
        inputs = processor(image, return_tensors="pt").to(device)
        output = blip_model.generate(**inputs)
        image_caption = processor.decode(output[0], skip_special_tokens=True)
    except Exception as e:
        return {"error": f"Error captioning image: {e}"}

    # Voice transcription
    try:
        # Read audio file
        speech_array, sampling_rate = sf.read(voice_path)
        
        # Convert to tensor with proper shape [channels, samples]
        speech_tensor = torch.tensor(speech_array).T.float()  # Transpose to [channels, samples]
        
        # Convert stereo to mono
        if speech_tensor.ndim > 1 and speech_tensor.shape[0] > 1:
            speech_tensor = torch.mean(speech_tensor, dim=0, keepdim=True)
            
        # Resample if needed
        if sampling_rate != 16000:
            resampler = torchaudio.transforms.Resample(
                orig_freq=sampling_rate, 
                new_freq=16000
            )
            speech_tensor = resampler(speech_tensor)
        
        # Normalize audio
        speech_tensor /= torch.max(torch.abs(speech_tensor))
        
        # Process audio (requires shape [samples] for mono)
        input_features = whisper_processor(
            speech_tensor.squeeze().numpy(),  # Convert to 1D numpy array
            sampling_rate=16000,
            return_tensors="pt",
            language="en"
        ).input_features.to(device)
        
        # Generate transcription
        predicted_ids = whisper_model.generate(input_features)
        voice_transcript = whisper_processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
    
    except Exception as e:
        return {"error": f"Error transcribing voice: {e}"}

    return {
        "image_caption": image_caption,
        "voice_transcript": voice_transcript
    }

if __name__ == "__main__":
    mcp.run(transport="stdio")
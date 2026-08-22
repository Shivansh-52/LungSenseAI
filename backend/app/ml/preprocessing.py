import librosa
import numpy as np
import torch
import json
import os

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "models", "final_model_config.json")

def load_config():
    with open(CONFIG_PATH, "r") as f:
        return json.load(f)

def pad_or_crop_audio(audio, target_length):
    if len(audio) > target_length:
        return audio[:target_length]
    elif len(audio) < target_length:
        padding = target_length - len(audio)
        return np.pad(audio, (0, padding), 'constant')
    return audio

import subprocess
import tempfile

def preprocess_audio(file_path):
    config = load_config()
    
    sr = config.get("sample_rate", 16000)
    duration = config.get("duration", 4.6)
    target_length = int(sr * duration)
    
    n_mels = config.get("n_mels", 64)
    n_fft = config.get("n_fft", 400)
    hop_length = config.get("hop_length", 160)
    win_length = config.get("win_length", 400)
    f_min = config.get("f_min", 50)
    f_max = config.get("f_max", 4000)
    
    # 1. Ensure file is WAV format for librosa (soundfile doesn't support mp4)
    wav_path = file_path
    temp_wav = None
    if not file_path.lower().endswith('.wav'):
        fd, temp_wav = tempfile.mkstemp(suffix='.wav')
        os.close(fd)
        try:
            subprocess.run(["ffmpeg", "-y", "-i", file_path, temp_wav], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            wav_path = temp_wav
        except Exception as e:
            if temp_wav and os.path.exists(temp_wav):
                os.remove(temp_wav)
            raise ValueError(f"FFmpeg conversion failed: {e}")

    try:
        # Load and resample
        audio, _ = librosa.load(wav_path, sr=sr)
    finally:
        if temp_wav and os.path.exists(temp_wav):
            try:
                os.remove(temp_wav)
            except Exception:
                pass
    
    # 2. Peak amplitude normalization
    max_amp = np.max(np.abs(audio))
    if max_amp > 0:
        audio = audio / max_amp
        
    # 3. 4.6 second crop/padding
    audio = pad_or_crop_audio(audio, target_length)
    
    # 4. Log-Mel spectrogram
    mel_spec = librosa.feature.melspectrogram(
        y=audio,
        sr=sr,
        n_mels=n_mels,
        n_fft=n_fft,
        hop_length=hop_length,
        win_length=win_length,
        fmin=f_min,
        fmax=f_max
    )
    
    log_mel_spec = librosa.power_to_db(mel_spec, ref=np.max)
    
    # 5. Expected shape [1, 1, 64, 461]
    # log_mel_spec shape is (n_mels, time_steps)
    # Convert to tensor and add batch and channel dims
    tensor = torch.tensor(log_mel_spec, dtype=torch.float32)
    tensor = tensor.unsqueeze(0).unsqueeze(0)
    
    return tensor

import os
import json
import torch
import torch.nn as nn
import numpy as np
import librosa
import soundfile as sf
from pathlib import Path

# Disease Model Architecture
class DiseaseCNNLSTM(nn.Module):
    def __init__(self, num_classes=2):
        super().__init__()
        
        # Validated baseline CNN architecture
        self.cnn = nn.Sequential(
            nn.Conv2d(1, 16, kernel_size=3, padding=1),
            nn.BatchNorm2d(16),
            nn.ReLU(),
            nn.MaxPool2d(2),
            
            nn.Conv2d(16, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2),
            
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2),
            
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(2)
        )
        
        self.lstm = nn.LSTM(
            input_size=128 * 4,
            hidden_size=128,
            num_layers=1,
            batch_first=True,
            bidirectional=True
        )
        
        self.fc = nn.Sequential(
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(128, num_classes)
        )
        
    def forward(self, x):
        features = self.cnn(x)
        
        B, C, H, W = features.size()
        features = features.permute(0, 3, 1, 2).contiguous() 
        features = features.view(B, W, C * H) 
        
        lstm_out, _ = self.lstm(features) 
        last_out = lstm_out[:, -1, :] 
        
        out = self.fc(last_out) 
        return out

_disease_model = None
_disease_config = None
_inf_config = None
_device = None
_disclaimer = "This is an AI research prediction based on respiratory audio. It is not a medical diagnosis and has not been clinically validated. A qualified healthcare professional should interpret symptoms and test results."

def load_disease_model():
    global _disease_model, _disease_config, _inf_config, _device
    try:
        model_dir = Path(__file__).parent.parent.parent / "models" / "final_copd_model"
        
        with open(model_dir / "model_config.json", "r") as f:
            _disease_config = json.load(f)
            
        with open(model_dir / "inference_config.json", "r") as f:
            _inf_config = json.load(f)
            
        _device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        model = DiseaseCNNLSTM(num_classes=2).to(_device)
        model.load_state_dict(torch.load(model_dir / _disease_config["checkpoint"], map_location=_device))
        model.eval()
        _disease_model = model
        print("Disease model loaded successfully.")
    except Exception as e:
        print(f"Error loading disease model: {e}")
        _disease_model = None

def is_disease_model_loaded():
    return _disease_model is not None

def _preprocess_audio(y):
    # Peak normalization
    if np.max(np.abs(y)) > 0:
        y = y / np.max(np.abs(y))
    
    # Log-Mel Spectrogram
    melspec = librosa.feature.melspectrogram(
        y=y,
        sr=_disease_config["sample_rate"],
        n_fft=_disease_config["n_fft"],
        hop_length=_disease_config["hop_length"],
        win_length=_disease_config["win_length"],
        n_mels=_disease_config["n_mels"],
        fmin=_disease_config["f_min"],
        fmax=_disease_config["f_max"]
    )
    log_melspec = librosa.power_to_db(melspec, ref=np.max)
    
    # Ensure exact shape (64, 461)
    expected_frames = _disease_config["input_shape"][2]
    if log_melspec.shape[1] < expected_frames:
        pad_width = expected_frames - log_melspec.shape[1]
        log_melspec = np.pad(log_melspec, ((0, 0), (0, pad_width)), mode='constant')
    else:
        log_melspec = log_melspec[:, :expected_frames]
        
    return torch.tensor(log_melspec, dtype=torch.float32).unsqueeze(0)

def predict_disease(audio_path, segments=None):
    if not is_disease_model_loaded():
        raise RuntimeError("Disease model is not loaded.")
        
    if not os.path.exists(audio_path):
        return {"status": "error", "message": "File not found."}
        
    try:
        y, sr = librosa.load(audio_path, sr=_disease_config["sample_rate"])
    except Exception as e:
        return {"status": "insufficient_audio", "message": "Audio could not be decoded."}
        
    if len(y) == 0 or np.max(np.abs(y)) < 1e-4:
        return {"status": "insufficient_audio", "message": "Audio is empty or silent."}
        
    if np.isnan(y).any() or np.isinf(y).any():
        return {"status": "insufficient_audio", "message": "Audio contains invalid values."}
        
    duration_sec = len(y) / _disease_config["sample_rate"]
    
    if duration_sec < 1.0:
        return {"status": "insufficient_audio", "message": "Audio duration is too short for reliable analysis."}
        
    target_sr = _disease_config["sample_rate"]
    target_length = int(target_sr * _disease_config["duration"])
    
    if segments is not None and len(segments) > 0:
        segment_audio = []
        for start, end in segments:
            s_idx = int(start * target_sr)
            e_idx = int(end * target_sr)
            seg = y[s_idx:e_idx]
            
            if len(seg) < target_length:
                seg = np.pad(seg, (0, target_length - len(seg)), mode='constant')
            else:
                seg = seg[:target_length]
            segment_audio.append(seg)
    else:
        segment_audio = []
        stride = int(target_length * 0.5)
        
        if len(y) < target_length:
            seg = np.pad(y, (0, target_length - len(y)), mode='constant')
            segment_audio.append(seg)
        else:
            for start_idx in range(0, len(y) - target_length + 1, stride):
                seg = y[start_idx:start_idx + target_length]
                segment_audio.append(seg)
            
            last_end = len(segment_audio) * stride if segment_audio else 0
            if len(y) - last_end > target_sr:
                seg = y[-target_length:]
                segment_audio.append(seg)
                
    if not segment_audio:
         return {"status": "insufficient_audio", "message": "No valid segments could be extracted."}
         
    probs = []
    with torch.no_grad():
        for seg in segment_audio:
            x = _preprocess_audio(seg).unsqueeze(0).to(_device)
            out = _disease_model(x)
            prob = torch.nn.functional.softmax(out, dim=1)[0, 1].item()
            probs.append(prob)
            
    mean_prob = float(np.mean(probs))
    threshold = _inf_config["threshold"]
    
    if mean_prob >= threshold:
        pred = "COPD-associated pattern detected"
    else:
        pred = "No COPD-associated pattern detected"
        
    return {
        "status": "success",
        "model_version": _inf_config.get("model_version", "LungSenseAI-COPD-v1.0"),
        "prediction": pred,
        "copd_probability": mean_prob,
        "threshold": threshold,
        "aggregation": _inf_config.get("aggregation_method", "Mean"),
        "segments_analyzed": len(probs),
        "audio_duration": duration_sec,
        "disclaimer": _disclaimer
    }

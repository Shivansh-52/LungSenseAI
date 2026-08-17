import torch
import numpy as np
import torch.nn as nn
import os
import json
from ml.preprocessing import preprocess_audio

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "final_model_config.json")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "cnn_lstm_best.pth")

class CNN_BiLSTM(nn.Module):
    def __init__(self, num_classes=4, in_channels=1, hidden_size=128, num_layers=1, dropout=0.5):
        super(CNN_BiLSTM, self).__init__()
        
        # CNN Feature Extractor
        self.cnn = nn.Sequential(
            # Block 1
            nn.Conv2d(in_channels, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            # Block 2
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            # Block 3
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU()
        )
        
        self.lstm_input_size = 128 * 16
        
        lstm_dropout = dropout if num_layers > 1 else 0.0
        self.lstm = nn.LSTM(
            input_size=self.lstm_input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=lstm_dropout
        )
        
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_size * 2, num_classes)
        
    def forward(self, x):
        x = self.cnn(x)
        batch, channels, freq, time = x.size()
        x = x.view(batch, channels * freq, time)
        x = x.permute(0, 2, 1)
        lstm_out, (hn, cn) = self.lstm(x)
        x = torch.mean(lstm_out, dim=1)
        x = self.dropout(x)
        x = self.fc(x)
        return x

_model = None
_class_mapping = None
_inverse_mapping = {
    0: "Normal",
    1: "Crackle",
    2: "Wheeze",
    3: "Crackle + Wheeze"
}

def get_class_name(class_id):
    return _inverse_mapping.get(class_id, "Unknown")

def load_model():
    global _model, _class_mapping, _inverse_mapping
    try:
        with open(CONFIG_PATH, "r") as f:
            config = json.load(f)
            _class_mapping = config.get("class_mapping", {})
            if _class_mapping:
                _inverse_mapping = {v: k for k, v in _class_mapping.items()}
                
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        model = CNN_BiLSTM(num_classes=4, in_channels=1, hidden_size=128, num_layers=1, dropout=0.5)
        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        model.to(device)
        model.eval()
        _model = model
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")
        _model = None

def is_model_loaded():
    return _model is not None

def predict_audio(audio_path):
    if not is_model_loaded():
        raise RuntimeError("Model is not loaded.")
        
    try:
        input_tensor = preprocess_audio(audio_path)
    except Exception as e:
        raise ValueError(f"Preprocessing failed: {e}")
        
    device = next(_model.parameters()).device
    input_tensor = input_tensor.to(device)
    
    with torch.no_grad():
        logits = _model(input_tensor)
        probs = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()
        
    class_id = int(np.argmax(probs))
    confidence = float(probs[class_id])
    class_name = get_class_name(class_id)
    
    probabilities = {
        get_class_name(i): float(probs[i]) for i in range(len(probs))
    }
    
    return {
        "class_id": class_id,
        "class_name": class_name,
        "confidence": confidence,
        "probabilities": probabilities
    }

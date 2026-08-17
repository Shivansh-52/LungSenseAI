import sys
import os
from fastapi.testclient import TestClient

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app
from ml.model import load_model

# Load model manually for the TestClient environment
load_model()

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    print("Health check passed.")

def test_predict():
    test_wav = r"C:\Users\Shivansh\Desktop\Medos\LungSenseAI-ML\data\raw\ICBHI\101_1b1_Al_sc_Meditron.wav"
    
    if not os.path.exists(test_wav):
        print(f"Skipping prediction test. Could not find test file at {test_wav}")
        return
        
    with open(test_wav, "rb") as f:
        response = client.post("/predict", files={"audio": ("test.wav", f, "audio/wav")})
        
    assert response.status_code == 200
    data = response.json()
    
    assert data["success"] is True
    assert "prediction" in data
    assert "class_name" in data["prediction"]
    assert "probabilities" in data
    
    probs = data["probabilities"]
    assert len(probs) == 4
    assert "Normal" in probs
    assert "Crackle" in probs
    assert "Wheeze" in probs
    assert "Crackle + Wheeze" in probs
    
    # Check probabilities sum to approx 1
    total_prob = sum(probs.values())
    assert 0.99 <= total_prob <= 1.01
    
    print("Predict API test passed.")
    print("Prediction:", data["prediction"]["class_name"])
    print("Confidence:", data["prediction"]["confidence"])

if __name__ == "__main__":
    test_health()
    test_predict()

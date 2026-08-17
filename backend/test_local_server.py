import requests
import json
import time
import os

BASE_URL = "http://localhost:8000"

def run_tests():
    print("Testing /health")
    res = requests.get(f"{BASE_URL}/health")
    print(res.status_code, res.json())
    assert res.status_code == 200
    
    print("\nTesting /auth/register")
    res = requests.post(f"{BASE_URL}/auth/register", json={
        "name": "Local Prod User",
        "email": "localprod@lungsenseai.local",
        "password": "Password123!"
    })
    print(res.status_code, res.json())
    
    print("\nTesting /auth/login")
    res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "localprod@lungsenseai.local",
        "password": "Password123!"
    })
    print(res.status_code)
    token = res.json()["access_token"]
    
    print("\nTesting Authenticated /predict")
    # Generate dummy wav
    import numpy as np
    import soundfile as sf
    sf.write("dummy.wav", np.zeros(16000), 16000)
    
    with open("dummy.wav", "rb") as f:
        res = requests.post(
            f"{BASE_URL}/predict",
            files={"audio": ("dummy.wav", f, "audio/wav")},
            headers={"Authorization": f"Bearer {token}"}
        )
    print(res.status_code)
    exam_id = res.json()["examination"]["id"]
    print("Exam ID:", exam_id)
    
    print("\nTesting /examinations")
    res = requests.get(f"{BASE_URL}/examinations", headers={"Authorization": f"Bearer {token}"})
    print(res.status_code, "Items:", len(res.json()["items"]))
    
    print("\nTesting /examinations/{id}/report")
    res = requests.get(f"{BASE_URL}/examinations/{exam_id}/report", headers={"Authorization": f"Bearer {token}"})
    print(res.status_code, "Headers:", res.headers.get("content-type"))
    
    os.remove("dummy.wav")
    print("All tests passed locally!")

if __name__ == "__main__":
    run_tests()

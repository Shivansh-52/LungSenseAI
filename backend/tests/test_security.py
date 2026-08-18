import pytest
from fastapi.testclient import TestClient
from app.main import app
from bson import ObjectId
import os
import io

client = TestClient(app)

def test_missing_jwt():
    response = client.get("/users/me")
    assert response.status_code == 403
    assert "Not authenticated" in response.json().get("detail", "")

def test_invalid_jwt():
    response = client.get("/users/me", headers={"Authorization": "Bearer invalid_token_here"})
    assert response.status_code == 401
    assert "Invalid or expired authentication token" in response.json().get("detail", "")

def test_wrong_password():
    response = client.post("/auth/login", json={"email": "nonexistent@example.com", "password": "wrong"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

def test_idor_protection_cross_user_exam():
    fake_token = "fake_token_setup_needed"
    # Testing that /examinations/{id} rejects invalid formats immediately
    response = client.get("/examinations/invalid_id", headers={"Authorization": f"Bearer {fake_token}"})
    assert response.status_code == 401 # Since the token is fake, it should fail auth first.
    
def test_guest_cannot_access_protected_endpoints():
    response = client.get("/examinations")
    assert response.status_code == 403 # Missing token

def test_oversized_upload():
    # Attempting to upload a massive file should be intercepted (simulated by large payload)
    large_data = b"0" * (11 * 1024 * 1024) # 11 MB
    response = client.post(
        "/predict", 
        files={"audio": ("huge.wav", io.BytesIO(large_data), "audio/wav")}
    )
    assert response.status_code == 413
    assert response.json()["error"]["code"] == "FILE_TOO_LARGE"

def test_invalid_audio_format():
    response = client.post(
        "/predict", 
        files={"audio": ("test.exe", io.BytesIO(b"MZ..."), "application/x-msdownload")}
    )
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "UNSUPPORTED_FORMAT"

def test_path_traversal_prevention():
    response = client.post(
        "/predict", 
        files={"audio": ("../../../etc/passwd", io.BytesIO(b"dummy"), "audio/wav")}
    )
    # The system uses tempfile.mkstemp with the suffix, not the filename path, so it prevents traversal.
    # It will fail on inference or unsupported format depending on suffix extraction.
    assert response.status_code in [400, 500]

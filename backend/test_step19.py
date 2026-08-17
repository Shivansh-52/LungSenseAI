import pytest
from fastapi.testclient import TestClient
from mongomock_motor import AsyncMongoMockClient
import os
import io

import app.db.mongodb as mongodb_module
mock_client = AsyncMongoMockClient()
mongodb_module.client = mock_client
mongodb_module.db = mock_client["lungsenseai"]

from main import app as fastapi_app
from app.ml.model import load_model

client = TestClient(fastapi_app)

@pytest.fixture(autouse=True, scope="session")
def setup_env():
    mongodb_module.client = mock_client
    mongodb_module.db = mock_client["lungsenseai"]
    load_model()
    
    import numpy as np
    import soundfile as sf
    sample_rate = 16000
    duration = 4.6
    audio = np.zeros(int(sample_rate * duration))
    sf.write("dummy_step19.wav", audio, sample_rate)
    yield
    if os.path.exists("dummy_step19.wav"):
        os.remove("dummy_step19.wav")

def test_register_and_login():
    response = client.post("/auth/register", json={
        "name": "Report User",
        "email": "report@lungsenseai.local",
        "password": "TestPassword123!"
    })
    assert response.status_code == 200, response.json()
    
    response = client.post("/auth/login", json={
        "email": "report@lungsenseai.local",
        "password": "TestPassword123!"
    })
    assert response.status_code == 200
    global token
    token = response.json()["access_token"]

def test_authenticated_predict():
    with open("dummy_step19.wav", "rb") as f:
        response = client.post(
            "/predict", 
            files={"audio": ("test.wav", f, "audio/wav")},
            headers={"Authorization": f"Bearer {token}"}
        )
    assert response.status_code == 200
    global exam_id
    exam_id = response.json()["examination"]["id"]

def test_report_data_endpoint():
    response = client.get(f"/examinations/{exam_id}/report-data", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["report_title"] == "AI-Assisted Respiratory Sound Examination Report"
    assert "wellness_guidance" in data
    assert "disclaimer" in data

def test_report_pdf_endpoint():
    response = client.get(f"/examinations/{exam_id}/report", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "attachment" in response.headers["content-disposition"]
    
    pdf_bytes = response.content
    assert len(pdf_bytes) > 0
    assert pdf_bytes.startswith(b"%PDF")
    
    with open("test_report.pdf", "wb") as f:
        f.write(pdf_bytes)

def test_unauthorized_report_generation():
    # Another user
    client.post("/auth/register", json={
        "name": "Other User",
        "email": "other@lungsenseai.local",
        "password": "TestPassword123!"
    })
    response = client.post("/auth/login", json={
        "email": "other@lungsenseai.local",
        "password": "TestPassword123!"
    })
    other_token = response.json()["access_token"]
    
    res = client.get(f"/examinations/{exam_id}/report", headers={"Authorization": f"Bearer {other_token}"})
    assert res.status_code == 404

def test_guest_report_denied():
    res = client.get(f"/examinations/{exam_id}/report")
    assert res.status_code == 401

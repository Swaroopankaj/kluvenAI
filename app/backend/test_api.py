from fastapi.testclient import TestClient
from main import app
import sys
import traceback

client = TestClient(app)

try:
    with open("../../test-vab-sample.txt", "rb") as f:
        response = client.post(
            "/api/process",
            data={"config_id": "vablogger"},
            files={"file": f}
        )
    print("STATUS:", response.status_code)
    print("BODY:", response.text)
except Exception as e:
    traceback.print_exc()

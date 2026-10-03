import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="SentinelRASP Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    api_key=os.getenv("KIMI_API_KEY"),
    base_url=os.getenv("KIMI_BASE_URL", "https://rookery.dropcode.in/v1")
)

class SecurityPayload(BaseModel):
    integrity: bool = False
    hook: bool = False
    syscall: bool = False
    overlay: bool = False
    adb: bool = False
    developer: bool = False

# Global state to sync terminal input directly to frontend
latest_telemetry = {
    "score": 0,
    "status": "ALLOWED",
    "policy": "Device environment clean. No AI remediation required.",
    "signals": {
        "integrity": False, "hook": False, "syscall": False,
        "overlay": False, "adb": False, "developer": False
    }
}

@app.get("/api/latest-telemetry")
def get_latest_telemetry():
    return latest_telemetry

@app.post("/api/risk-score")
def calculate_risk(payload: SecurityPayload):
    global latest_telemetry
    
    # Base scoring logic
    score = 0
    if payload.integrity: score += 35
    if payload.hook: score += 25
    if payload.syscall: score += 20
    if payload.overlay: score += 10
    if payload.adb: score += 5
    if payload.developer: score += 5

    status = "ALLOWED" if score < 40 else "RESTRICTED" if score < 70 else "HIGH RISK"

    # Call Kimi AI for dynamic remediation
    ai_remediation = "Environment safe."
    try:
        response = client.chat.completions.create(
            model=os.getenv("KIMI_MODEL_NAME", "Kimi K3"),
            messages=[
                {"role": "system", "content": "You are SentinelRASP AI. Generate concise 1-sentence mitigation policy based on risk factors."},
                {"role": "user", "content": f"Score: {score}, Status: {status}, Signals: {payload.model_dump()}"}
            ],
            temperature=0.3
        )
        ai_remediation = response.choices[0].message.content
    except Exception:
        ai_remediation = f"Enforce {status} policy immediately based on threat vectors."

    result = {
        "score": score,
        "status": status,
        "policy": ai_remediation,
        "signals": payload.model_dump()
    }
    
    latest_telemetry = result
    return result

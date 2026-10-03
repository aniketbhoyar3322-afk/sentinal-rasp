import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="SentinelRASP Security Engine",
    description="Backend API for Runtime Application Self-Protection",
    version="1.0.0"
)

# Enable CORS for GitHub Pages and local test tools
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client pointed to Kimi LLM endpoint
KIMI_API_KEY = os.getenv("KIMI_API_KEY", "")
KIMI_BASE_URL = os.getenv("KIMI_BASE_URL", "https://rookery.dropcode.in/v1")
KIMI_MODEL_NAME = os.getenv("KIMI_MODEL_NAME", "Kimi K3")

kimi_client = None
if KIMI_API_KEY:
    try:
        kimi_client = OpenAI(
            api_key=KIMI_API_KEY,
            base_url=KIMI_BASE_URL
        )
    except Exception as e:
        print(f"[Warning] Could not initialize Kimi LLM client: {e}")


class SecurityPayload(BaseModel):
    integrity: bool = False
    hook: bool = False
    syscall: bool = False
    overlay: bool = False
    adb: bool = False
    developer: bool = False


@app.get("/")
@app.get("/health")
def health_check():
    """Health check endpoint to verify backend status."""
    return {
        "status": "online",
        "service": "SentinelRASP Security Engine",
        "version": "1.0.0"
    }


@app.post("/api/risk-score")
@app.post("/evaluate")
def evaluate_risk(payload: SecurityPayload):
    """Calculates risk score and generates AI mitigation via Kimi LLM."""
    score = 0
    detected_threats = []

    if payload.integrity:
        score += 40
        detected_threats.append("Package Integrity Tampering")
    if payload.hook:
        score += 35
        detected_threats.append("Dynamic Hooking Framework (Frida/Xposed)")
    if payload.syscall:
        score += 30
        detected_threats.append("Unauthorized Syscall Anomaly")
    if payload.overlay:
        score += 25
        detected_threats.append("Screen Overlay / Tapjacking Detected")
    if payload.adb:
        score += 10
        detected_threats.append("ADB Debugging Mode Active")
    if payload.developer:
        score += 5
        detected_threats.append("Developer Options Enabled")

    score = min(score, 100)

    # Determine security status tier
    if score < 40:
        status = "ALLOWED"
        ai_remediation = "Device environment clean. Standard access granted."
    elif score < 70:
        status = "RESTRICTED"
        ai_remediation = "Suspicious environment detected. Restricting high-risk app operations."
    else:
        status = "HIGH RISK"
        ai_remediation = "Critical compromise detected. Immediate session revocation enforced."

    # Query Kimi AI LLM for dynamic threat mitigation strategy when threats are triggered
    if score >= 40 and kimi_client:
        try:
            threat_str = ", ".join(detected_threats)
            prompt = (
                f"A mobile app RASP system detected these active threat vectors: {threat_str}. "
                f"The overall Risk Score is {score}/100. Provide a 2-sentence technical remediation and defense policy."
            )
            response = kimi_client.chat.completions.create(
                model=KIMI_MODEL_NAME,
                messages=[
                    {
                        "role": "system",
                        "content": "You are SentinelRASP, an automated cybersecurity response engine. Output direct, 2-sentence remediation instructions."
                    },
                    {"role": "user", "content": prompt}
                ],
                max_tokens=120,
                temperature=0.2
            )
            ai_remediation = response.choices[0].message.content.strip()
        except Exception as err:
            print(f"[Error] Kimi LLM API error: {err}")
            ai_remediation = f"Threats detected: {', '.join(detected_threats)}. Automated protection enforced."

    return {
        "score": score,
        "status": status,
        "policy": ai_remediation,
        "signals": payload.model_dump()
    }
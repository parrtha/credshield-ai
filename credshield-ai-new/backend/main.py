from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import os, re
import httpx

app = FastAPI(title="CredShield AI API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class PasswordMetrics(BaseModel):
    score: int = Field(ge=0, le=100)
    label: str
    length: int = 0
    upper: bool = False
    lower: bool = False
    number: bool = False
    special: bool = False
    common: bool = False

class AssessRequest(BaseModel):
    email: str
    password_metrics: PasswordMetrics
    mfa_enabled: bool = True

# Controlled demo indicators only. No real breach data is queried.
DEMO = {
    "user@example.com": {"exposure": "HIGH", "reuse": "MEDIUM"},
    "reused.demo@example.com": {"exposure": "HIGH", "reuse": "HIGH"},
    "safe.demo@example.com": {"exposure": "LOW", "reuse": "LOW"},
}

def exposure_for(email: str):
    return DEMO.get(email.strip().lower(), {"exposure": "MEDIUM", "reuse": "LOW"})

def risk_score(pm: PasswordMetrics, exposure: str, reuse: str, mfa: bool):
    # Transparent defensive scoring for the prototype.
    score = 100
    score -= {"STRONG": 0, "MEDIUM": 12, "WEAK": 28}.get(pm.label.upper(), 20)
    score -= {"LOW": 0, "MEDIUM": 12, "HIGH": 22}.get(exposure, 12)
    score -= {"LOW": 0, "MEDIUM": 12, "HIGH": 20}.get(reuse, 0)
    score += 2 if mfa else 0
    return max(0, min(100, round(score)))

def risk_level(score: int):
    if score >= 75: return "LOW"
    if score >= 50: return "MEDIUM"
    return "HIGH"

def fallback_advisor(email, score, level, strength, exposure, reuse, mfa):
    parts=[]
    if exposure == "HIGH": parts.append("an authorized exposure indicator is high")
    elif exposure == "MEDIUM": parts.append("the exposure signal needs attention")
    if reuse == "HIGH": parts.append("reuse risk is high")
    elif reuse == "MEDIUM": parts.append("reuse risk is moderate")
    if strength != "STRONG": parts.append("the password can be strengthened")
    if not mfa: parts.append("MFA is not enabled")
    if not parts: return "The credential profile shows a relatively low risk. Continue using unique passwords and keep MFA enabled."
    return "CredShield AI identified " + ", ".join(parts) + ". Prioritize the recommended actions below and avoid reusing passwords across accounts."

async def ollama_advisor(prompt: str):
    if os.getenv("CRED_SHIELD_OLLAMA", "1") != "1": return None
    base=os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
    model=os.getenv("OLLAMA_MODEL", "qwen3:4b")
    payload={"model":model,"prompt":prompt,"stream":False}
    try:
        async with httpx.AsyncClient(timeout=12) as client:
            r=await client.post(f"{base}/api/generate",json=payload)
            r.raise_for_status()
            data=r.json()
            text=(data.get("response") or "").strip()
            return text[:700] if text else None
    except Exception:
        return None

@app.get("/api/health")
def health():
    return {"status":"ok","service":"CredShield AI","mode":"defensive-prototype"}

@app.post("/api/assess")
async def assess(req: AssessRequest):
    signals=exposure_for(req.email)
    exposure, reuse=signals["exposure"], signals["reuse"]
    score=risk_score(req.password_metrics, exposure, reuse, req.mfa_enabled)
    level=risk_level(score)
    actions=[]
    if req.password_metrics.label.upper() != "STRONG":
        actions.append({"title":"Strengthen the password","detail":"Use a longer, unique passphrase with mixed character types."})
    if reuse in ("MEDIUM","HIGH"):
        actions.append({"title":"Replace reused credentials","detail":"Use a different password for every important account."})
    if exposure in ("MEDIUM","HIGH"):
        actions.append({"title":"Change the exposed credential","detail":"Rotate the password and review recent account activity."})
    if not req.mfa_enabled:
        actions.append({"title":"Enable MFA","detail":"Add a second authentication factor to reduce account takeover risk."})
    actions.append({"title":"Review active sessions","detail":"Sign out unknown sessions and verify recovery settings."})
    actions=actions[:4]
    prompt=f"You are a defensive cybersecurity advisor. Explain this credential-risk assessment in 2-3 concise sentences. Never request or reveal passwords. Account: {req.email}. Score: {score}/100. Password strength: {req.password_metrics.label}. Exposure: {exposure}. Reuse: {reuse}. MFA: {'enabled' if req.mfa_enabled else 'disabled'}."
    ai=await ollama_advisor(prompt)
    if not ai: ai=fallback_advisor(req.email,score,level,req.password_metrics.label,exposure,reuse,req.mfa_enabled)
    return {"email":req.email,"score":score,"risk_level":level,"password_strength":req.password_metrics.label.upper(),"exposure_risk":exposure,"reuse_risk":reuse,"mfa_enabled":req.mfa_enabled,"summary":f"{level.title()} risk profile based on strength, exposure, reuse and MFA signals.","ai_explanation":ai,"actions":actions}

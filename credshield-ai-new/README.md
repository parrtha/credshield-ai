# CredShield AI — Async'26 Prototype

Prototype aligned with the 13-slide CredShield AI PPT: password strength, authorized/controlled exposure indicators, reuse risk, overall score, AI explanation, prioritized actions, privacy-first processing, React/Vite + FastAPI architecture, and optional Ollama Qwen3 advisor.

## Run

### Backend
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
Open another terminal:
```powershell
cd frontend
npm install
npm run dev
```
Open the Vite URL, normally http://localhost:5173.

## Optional Ollama
If Ollama is running on http://127.0.0.1:11434 and `qwen3:4b` is installed, the backend will try it automatically. Otherwise it uses a deterministic local advisor fallback.

Environment variables:
- `OLLAMA_URL=http://127.0.0.1:11434`
- `OLLAMA_MODEL=qwen3:4b`
- `CRED_SHIELD_OLLAMA=1` or `0`

## Demo accounts
- user@example.com → controlled HIGH exposure + MEDIUM reuse; with the default strong password and MFA this produces the PPT's 68/100 example.
- reused.demo@example.com → HIGH exposure + HIGH reuse.
- safe.demo@example.com → LOW exposure + LOW reuse.

These are controlled demo indicators, not real breach lookups.

## Security note
The raw password is analyzed in the browser and is not sent to the FastAPI endpoint. Do not enter a real password into a prototype or demo environment. No credential theft or unauthorized access is implemented.

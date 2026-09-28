import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ShieldCheck, LockKeyhole, AlertTriangle, CheckCircle2, BrainCircuit, ArrowRight, Eye, EyeOff, RefreshCw, Server, Database, Sparkles, Download, Activity, ShieldAlert } from 'lucide-react';
import './styles.css';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function analyzePassword(password) {
  const length = password.length;
  const upper = /[A-Z]/.test(password);
  const lower = /[a-z]/.test(password);
  const number = /\d/.test(password);
  const special = /[^A-Za-z0-9]/.test(password);
  const common = ['password','123456','qwerty','admin','welcome','letmein','password123'].includes(password.toLowerCase());
  let score = 0;
  score += Math.min(length * 4, 40);
  score += upper ? 15 : 0;
  score += lower ? 10 : 0;
  score += number ? 15 : 0;
  score += special ? 20 : 0;
  if (common) score = Math.min(score, 25);
  score = Math.min(100, score);
  let label = score >= 75 ? 'STRONG' : score >= 50 ? 'MEDIUM' : 'WEAK';
  return { score, label, length, upper, lower, number, special, common };
}

function App() {
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('SecureDemo@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [mfa, setMfa] = useState(true);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordAnalysis = useMemo(() => analyzePassword(password), [password]);

  async function assess() {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/api/assess`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, password_metrics: passwordAnalysis, mfa_enabled: mfa })
      });
      if (!res.ok) throw new Error('Assessment request failed');
      setResult(await res.json());
    } catch (e) {
      setError('Backend is not running. Start FastAPI on port 8000 and try again.');
    } finally { setLoading(false); }
  }

  function demo(emailValue) {
    setEmail(emailValue); setResult(null);
    if (emailValue === 'user@example.com') { setPassword('SecureDemo@2026'); setMfa(true); }
    if (emailValue === 'reused.demo@example.com') { setPassword('Password123'); setMfa(false); }
    if (emailValue === 'safe.demo@example.com') { setPassword('Violet!River#92Moon'); setMfa(true); }
  }

  return <div className="app">
    <header className="topbar">
      <div className="brand"><div className="brandIcon"><ShieldCheck size={25}/></div><div><strong>CredShield <span>AI</span></strong><small>Credential Risk Intelligence</small></div></div>
      <div className="status"><span className="dot"/> Defensive mode <span className="divider"/> Prototype</div>
    </header>

    <main className="shell">
      <section className="hero">
        <div><div className="eyebrow"><Sparkles size={14}/> CYBERSECURITY & DEFENSE · TRACK 3</div><h1>Detect. Protect. <span>Strengthen</span> Every Credential.</h1><p>Analyze password strength, authorized exposure indicators and reuse risk — then turn the findings into clear security actions.</p></div>
        <div className="heroShield"><ShieldCheck size={94} strokeWidth={1.1}/><span>PRIVACY-FIRST</span></div>
      </section>

      <section className="grid">
        <div className="panel inputPanel">
          <div className="panelTitle"><div><h2>Credential Risk Assessment</h2><p>Passwords are analyzed locally in this prototype.</p></div><LockKeyhole size={22}/></div>
          <label>Account identifier</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="user@example.com"/>
          <label>Password for local analysis</label>
          <div className="passwordBox"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter a demo password"/><button onClick={()=>setShowPassword(v=>!v)}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>
          <div className="strength"><div><span>Password strength</span><b className={passwordAnalysis.label.toLowerCase()}>{passwordAnalysis.label}</b></div><div className="bar"><i style={{width:`${passwordAnalysis.score}%`}}/></div><small>{passwordAnalysis.score}/100 local strength score</small></div>
          <div className="checks"><span className={passwordAnalysis.length>=12?'ok':''}>{passwordAnalysis.length>=12?'✓':'○'} 12+ characters</span><span className={passwordAnalysis.number?'ok':''}>{passwordAnalysis.number?'✓':'○'} Number</span><span className={passwordAnalysis.special?'ok':''}>{passwordAnalysis.special?'✓':'○'} Special character</span><span className={passwordAnalysis.upper?'ok':''}>{passwordAnalysis.upper?'✓':'○'} Uppercase</span></div>
          <div className="toggleRow"><div><b>MFA protection</b><small>Use this as a controlled demo signal.</small></div><button className={`toggle ${mfa?'on':''}`} onClick={()=>setMfa(v=>!v)}><i/></button></div>
          <button className="assess" onClick={assess} disabled={loading}>{loading?<><RefreshCw className="spin" size={18}/> Analyzing...</>:<>Analyze Credential Risk <ArrowRight size={18}/></>}</button>
          <div className="demo"><span>Demo inputs:</span><button onClick={()=>demo('user@example.com')}>68/100 example</button><button onClick={()=>demo('reused.demo@example.com')}>High risk</button><button onClick={()=>demo('safe.demo@example.com')}>Low risk</button></div>
        </div>

        <div className="panel resultPanel">
          {!result ? <div className="empty"><div className="emptyIcon"><BrainCircuit size={36}/></div><h2>Ready to analyze</h2><p>Run an assessment to see the overall risk score, exposure signals, AI explanation and prioritized actions.</p><div className="flow"><span>Analyze</span><b>→</b><span>Score</span><b>→</b><span>Explain</span><b>→</b><span>Protect</span></div></div> : <Result result={result}/>} 
        </div>
      </section>

      <section className="architecture">
        <div className="sectionHead"><div><div className="eyebrow">BASIC TECHNICAL ARCHITECTURE</div><h2>How CredShield AI works</h2></div><p>Aligned with the Async'26 project proposal.</p></div>
        <div className="archGrid"><Arch icon={<LockKeyhole/>} title="React + Vite" text="Web dashboard / user interface"/><Arch icon={<Server/>} title="FastAPI" text="REST API and request handling"/><Arch icon={<ShieldCheck/>} title="Security Engine" text="Password strength + exposure + risk logic"/><Arch icon={<BrainCircuit/>} title="AI Advisor" text="Natural-language explanation and recommendations"/><Arch icon={<Database/>} title="MongoDB" text="Optional non-sensitive application metadata / reports"/></div>
      </section>

      <footer><span>CredShield AI · Detect → Analyze → Explain → Protect</span><span>Defensive cybersecurity prototype · No credential theft</span></footer>
    </main>
  </div>
}

function Arch({icon,title,text}) { return <div className="arch"><div className="archIcon">{icon}</div><div><b>{title}</b><p>{text}</p></div></div> }

function downloadReport(result) {
  const text = [
    'CRED SHIELD AI',
    'Credential Risk Assessment',
    '==========================',
    '',
    `Account: ${result.email}`,
    `Overall Security Risk: ${result.score}/100`,
    `Risk Level: ${result.risk_level}`,
    `Password Strength: ${result.password_strength}`,
    `Exposure Risk: ${result.exposure_risk}`,
    `Reuse Risk: ${result.reuse_risk}`,
    `MFA Protection: ${result.mfa_enabled ? 'ENABLED' : 'DISABLED'}`,
    '',
    'AI Security Advisor:',
    result.ai_explanation,
    '',
    'Prioritized Actions:',
    ...result.actions.map((a, i) => `${i + 1}. ${a.title} — ${a.detail}`),
    '',
    'Defensive cybersecurity prototype.',
    'No real credential theft or unauthorized access is performed.'
  ].join('\n');
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CredShield_AI_Report_${result.email.replace(/[^a-z0-9]+/gi, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function signalWidth(type, value) {
  const maps = {
    strength: { STRONG: 100, MEDIUM: 65, WEAK: 30 },
    exposure: { LOW: 25, MEDIUM: 60, HIGH: 90 },
    reuse: { LOW: 20, MEDIUM: 60, HIGH: 90 },
    mfa: { ENABLED: 100, DISABLED: 25 }
  };
  return maps[type]?.[value] ?? 50;
}

function Result({result}) {
  const tone = result.risk_level.toLowerCase();
  return <div className="result"><div className="resultTop"><div><div className="eyebrow">ASSESSMENT RESULT</div><h2>{result.email}</h2></div><span className={`riskBadge ${tone}`}>{result.risk_level} RISK</span></div>
    <div className="scoreRow"><div className="scoreCircle"><strong>{result.score}</strong><span>/100</span></div><div><h3>Overall Security Risk</h3><p>{result.summary}</p></div></div>
    <div className="metricGrid"><Metric title="Password Strength" value={result.password_strength} icon={<LockKeyhole/>}/><Metric title="Exposure Risk" value={result.exposure_risk} icon={<AlertTriangle/>}/><Metric title="Reuse Risk" value={result.reuse_risk} icon={<RefreshCw/>}/><Metric title="MFA Protection" value={result.mfa_enabled?'ENABLED':'DISABLED'} icon={result.mfa_enabled?<CheckCircle2/>:<AlertTriangle/>}/></div>
    <div className="signalPanel">
      <div className="signalHead"><div><div className="eyebrow">RISK SIGNAL BREAKDOWN</div><h3>What is driving the score?</h3></div><Activity size={19}/></div>
      <Signal label="Password strength" value={result.password_strength} width={signalWidth('strength', result.password_strength)} />
      <Signal label="Exposure indicator" value={result.exposure_risk} width={signalWidth('exposure', result.exposure_risk)} />
      <Signal label="Reuse risk" value={result.reuse_risk} width={signalWidth('reuse', result.reuse_risk)} />
      <Signal label="MFA protection" value={result.mfa_enabled ? 'ENABLED' : 'DISABLED'} width={signalWidth('mfa', result.mfa_enabled ? 'ENABLED' : 'DISABLED')} />
    </div>
    <div className="advisor"><div className="advisorTitle"><BrainCircuit size={20}/><b>AI Security Advisor</b><span>Ollama-ready</span></div><p>{result.ai_explanation}</p></div>
    <div className="actions"><div className="actionsHead"><h3>Prioritized Actions</h3><button className="reportBtn" onClick={()=>downloadReport(result)}><Download size={15}/> Download Report</button></div>{result.actions.map((a,i)=><div className="action" key={i}><span>{i+1}</span><div><b>{a.title}</b><p>{a.detail}</p></div></div>)}</div>
    <div className="privacyNote"><ShieldCheck size={17}/><span>Privacy by design: the raw password is not sent to the backend. Exposure data in this prototype comes from controlled demo indicators.</span></div>
  </div>
}
function Metric({title,value,icon}) { return <div className="metric"><div className="metricIcon">{icon}</div><small>{title}</small><b>{value}</b></div> }
function Signal({ label, value, width }) {
  return (
    <div className="signal">
      <div className="signalMeta">
        <span>{label}</span>
        <b>{value}</b>
      </div>

      <div className="signalTrack">
        <i style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App/>);

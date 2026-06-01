import { useState, useEffect } from "react";

const COLORS = {
  cream: "#F5F0E8",
  terracotta: "#C4704A",
  moss: "#6B7F5E",
  sand: "#D4C5A9",
  charcoal: "#2C2C2C",
  blush: "#E8C4B0",
  deepTerra: "#8B4A2E",
  lightMoss: "#A8B89E",
};

const preguntas = [
  { id: "cuando", label: "¿Cuándo ocurrió?", placeholder: "Ej: Anoche después del trabajo...", type: "text" },
  { id: "que_comiste", label: "¿Qué comiste o quisiste comer?", placeholder: "Ej: Chocolates, papas fritas...", type: "text" },
  { id: "antes", label: "¿Qué estaba pasando justo antes?", placeholder: "Ej: Tuve una discusión, estaba sola...", type: "textarea" },
  { id: "cuerpo", label: "¿Qué sentías en el cuerpo?", placeholder: "Ej: Tensión en el pecho, vacío...", type: "text" },
  { id: "emocion", label: "¿Qué emoción estabas sintiendo?", placeholder: "Ej: Ansiedad, tristeza, o simplemente 'no sé'", type: "text" },
  { id: "despues", label: "¿Cómo te sentiste después de comer?", placeholder: "Ej: Culpa, alivio momentáneo...", type: "text" },
];

function QuestionBlock({ pregunta, onAnswer }) {
  const [value, setValue] = useState("");
  const submit = () => { if (value.trim()) onAnswer(value.trim()); };
  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } };
  return (
    <div>
      <label style={{ display: "block", fontSize: "1rem", color: COLORS.charcoal, marginBottom: "1rem", lineHeight: 1.5, fontStyle: "italic" }}>{pregunta.label}</label>
      {pregunta.type === "textarea" ? (
        <textarea autoFocus value={value} onChange={e => setValue(e.target.value)} onKeyDown={handleKey} placeholder={pregunta.placeholder} rows={4}
          style={{ width: "100%", padding: "0.9rem", border: `1px solid ${COLORS.sand}`, fontSize: "0.9rem", fontFamily: "inherit", resize: "vertical", outline: "none", color: COLORS.charcoal, backgroundColor: COLORS.cream, boxSizing: "border-box" }}
          onFocus={e => e.target.style.borderColor = COLORS.terracotta} onBlur={e => e.target.style.borderColor = COLORS.sand} />
      ) : (
        <input autoFocus type="text" value={value} onChange={e => setValue(e.target.value)} onKeyDown={handleKey} placeholder={pregunta.placeholder}
          style={{ width: "100%", padding: "0.9rem", border: `1px solid ${COLORS.sand}`, fontSize: "0.9rem", fontFamily: "inherit", outline: "none", color: COLORS.charcoal, backgroundColor: COLORS.cream, boxSizing: "border-box" }}
          onFocus={e => e.target.style.borderColor = COLORS.terracotta} onBlur={e => e.target.style.borderColor = COLORS.sand} />
      )}
      <div style={{ textAlign: "right", marginTop: "1rem" }}>
        <button onClick={submit} disabled={!value.trim()}
          style={{ backgroundColor: value.trim() ? COLORS.terracotta : COLORS.sand, color: value.trim() ? "white" : "#aaa", border: "none", padding: "0.75rem 2rem", fontSize: "0.85rem", cursor: value.trim() ? "pointer" : "not-allowed", borderRadius: "1px", fontFamily: "inherit" }}>
          Continuar →
        </button>
      </div>
      <p style={{ fontSize: "0.75rem", color: "#bbb", marginTop: "0.5rem" }}>Presiona Enter para continuar</p>
    </div>
  );
}

export default function AnalizadorHambre() {
  const [step, setStep] = useState("bienvenida");
  const [form, setForm] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [analysis, setAnalysis] = useState("");
  const [error, setError] = useState("");
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (step === "analizando") {
      const interval = setInterval(() => { setDots(d => d.length >= 3 ? "" : d + "."); }, 500);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleAnswer = (value) => {
    const updated = { ...form, [preguntas[currentQ].id]: value };
    setForm(updated);
    if (currentQ < preguntas.length - 1) { setCurrentQ(currentQ + 1); }
    else { analyzeEpisode(updated); }
  };

  const analyzeEpisode = async (data) => {
    setStep("analizando");
    setError("");
    const prompt = `Eres una psicóloga especialista en conducta alimentaria y hambre emocional. Tu enfoque es cálido, sin juicios, orientado a la autoconciencia. Hablas en español, segunda persona (tú), tono cercano pero profesional.\n\nAnaliza este episodio e identifica: el disparador emocional, la función que cumplió la comida, un patrón importante, una pregunta reflexiva, y un mensaje de cierre compasivo.\n\nDatos:\n- Momento: ${data.cuando}\n- Qué comió: ${data.que_comiste}\n- Qué pasaba antes: ${data.antes}\n- Sensaciones: ${data.cuerpo}\n- Emoción: ${data.emocion}\n- Después: ${data.despues}\n\nUsa encabezados en negrita: **Lo que pudo estar pasando:**, **Para qué sirvió la comida:**, **Algo que vale observar:**, **Una pregunta para ti:**, **Para cerrar:**. Máximo 350 palabras.`;
    try {
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
      const result = await response.json();
      setAnalysis(result.text || "");
      setStep("resultado");
    } catch (err) {
      setError("Hubo un error al conectar. Intenta de nuevo.");
      setStep("formulario");
    }
  };

  const restart = () => { setForm({}); setCurrentQ(0); setAnalysis(""); setStep("bienvenida"); };
  const formatAnalysis = (text) => text.split("\n").map((line, i) => (
    <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} style={{ marginBottom: "1rem", lineHeight: 1.7 }} />
  ));

  return (
    <div style={{ minHeight: "100vh", backgroundColor: COLORS.cream, fontFamily: "'Georgia', serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", backgroundImage: `radial-gradient(ellipse at 20% 80%, ${COLORS.blush}55 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, ${COLORS.sand}88 0%, transparent 50%)` }}>
      <div style={{ maxWidth: "600px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "0.75rem", letterSpacing: "0.2em", color: COLORS.moss, textTransform: "uppercase", marginBottom: "0.5rem" }}>Psicología de la Alimentación</div>
          <h1 style={{ fontSize: "1.9rem", color: COLORS.charcoal, fontWeight: "normal", margin: 0 }}>Analizador de<br /><em style={{ color: COLORS.terracotta }}>Hambre Emocional</em></h1>
        </div>
        <div style={{ backgroundColor: "white", borderRadius: "2px", padding: "2.5rem", boxShadow: `0 2px 40px ${COLORS.sand}88`, border: `1px solid ${COLORS.sand}` }}>
          {step === "bienvenida" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌿</div>
              <h2 style={{ fontSize: "1.3rem", color: COLORS.charcoal, fontWeight: "normal", marginBottom: "1rem" }}>Un espacio para entenderte, no para juzgarte</h2>
              <p style={{ color: "#666", lineHeight: 1.8, marginBottom: "2rem", fontSize: "0.95rem" }}>Responderás 6 preguntas y recibirás un análisis compasivo basado en psicología de la conducta alimentaria.</p>
              <button onClick={() => setStep("formulario")} style={{ backgroundColor: COLORS.terracotta, color: "white", border: "none", padding: "0.9rem 2.5rem", fontSize: "0.9rem", cursor: "pointer", borderRadius: "1px", fontFamily: "inherit" }}>Comenzar →</button>
            </div>
          )}
          {step === "formulario" && (
            <div>
              <div style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.75rem", color: COLORS.moss }}>PREGUNTA {currentQ + 1} DE {preguntas.length}</span>
                  <span style={{ fontSize: "0.75rem", color: COLORS.moss }}>{Math.round((currentQ / preguntas.length) * 100)}%</span>
                </div>
                <div style={{ height: "2px", backgroundColor: COLORS.sand }}>
                  <div style={{ height: "100%", backgroundColor: COLORS.terracotta, width: `${(currentQ / preguntas.length) * 100}%`, transition: "width 0.4s ease" }} />
                </div>
              </div>
              <QuestionBlock pregunta={preguntas[currentQ]} onAnswer={handleAnswer} key={currentQ} />
              {error && <p style={{ color: "red", fontSize: "0.85rem", marginTop: "1rem" }}>{error}</p>}
            </div>
          )}
          {step === "analizando" && (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1.5rem" }}>🌿</div>
              <p style={{ color: COLORS.charcoal, fontSize: "1.1rem" }}>Analizando tu episodio{dots}</p>
              <p style={{ color: "#999", fontSize: "0.85rem" }}>Esto toma unos segundos</p>
            </div>
          )}
          {step === "resultado" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div style={{ width: "3px", height: "2rem", backgroundColor: COLORS.terracotta }} />
                <h2 style={{ fontSize: "1.1rem", color: COLORS.charcoal, fontWeight: "normal", margin: 0 }}>Tu análisis</h2>
              </div>
              <div style={{ backgroundColor: COLORS.cream, padding: "1.5rem", borderLeft: `3px solid ${COLORS.lightMoss}`, marginBottom: "2rem", fontSize: "0.92rem", color: COLORS.charcoal }}>{formatAnalysis(analysis)}</div>
              <div style={{ textAlign: "center" }}>
                <button onClick={restart} style={{ backgroundColor: "transparent", color: COLORS.terracotta, border: `1px solid ${COLORS.terracotta}`, padding: "0.75rem 1.75rem", fontSize: "0.85rem", cursor: "pointer", borderRadius: "1px", fontFamily: "inherit" }}>Registrar otro episodio</button>
              </div>
              <p style={{ textAlign: "center", color: "#aaa", fontSize: "0.75rem", marginTop: "1.5rem" }}>Este análisis es psicoeducativo y no reemplaza la atención clínica.</p>
            </div>
          )}
        </div>
        <p style={{ textAlign: "center", color: COLORS.moss, fontSize: "0.7rem", marginTop: "1.5rem", letterSpacing: "0.1em" }}>PSICOLOGÍA DE LA ALIMENTACIÓN · HERRAMIENTA DE AUTOCONOCIMIENTO</p>
      </div>
    </div>
  );
}
//prueba
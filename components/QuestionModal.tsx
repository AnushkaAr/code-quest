"use client";
import { useState } from "react";
import { Question } from "@/lib/data";
import { useAuthStore } from "@/lib/store";

interface Props {
  question: Question;
  onClose: () => void;
  alreadyCompleted: boolean;
}

export default function QuestionModal({ question, onClose, alreadyCompleted }: Props) {
  const { completeQuestion } = useAuthStore();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answer, setAnswer] = useState(question.starterCode || "");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  const handleTheorySubmit = () => {
    if (selectedOption === null) return;
    if (selectedOption === question.correctOption) {
      setResult("correct");
      if (!alreadyCompleted) { completeQuestion(question.id, question.xpReward); setXpGained(question.xpReward); }
    } else {
      setResult("wrong");
    }
  };

  const handleCodingSubmit = () => {
    const trimmed = answer.trim();
    if (!trimmed) return;
    const sol = question.solution || "";
    const keywords = sol.match(/\b(return|for|while|if|print|def|class|range|append|input|else|elif|pass|len|in)\b/gi) || [];
    const userKw = trimmed.match(/\b(return|for|while|if|print|def|class|range|append|input|else|elif|pass|len|in)\b/gi) || [];
    const matchCount = keywords.filter(k => userKw.some(u => u.toLowerCase() === k.toLowerCase())).length;
    const isCorrect = trimmed.length > 15 && (matchCount >= Math.floor(keywords.length * 0.5) || matchCount >= 2);
    if (isCorrect) {
      setResult("correct");
      if (!alreadyCompleted) { completeQuestion(question.id, question.xpReward); setXpGained(question.xpReward); }
    } else {
      setResult("wrong");
    }
  };

  const diffColor = question.difficulty === "easy" ? "#00ff88" : question.difficulty === "medium" ? "#ffd700" : "#ff6b6b";
  const clsColor = "var(--accent)";

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: "720px", maxHeight: "90vh", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.6rem" }}>
              <span style={{ background: `${clsColor}22`, color: clsColor, border: `1px solid ${clsColor}44`, padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "700" }}>
                🐍 Python
              </span>
              <span style={{ background: question.type === "theory" ? "rgba(0,212,255,0.1)" : "rgba(139,124,248,0.1)", color: question.type === "theory" ? "var(--accent2)" : "var(--accent)", border: `1px solid ${question.type === "theory" ? "rgba(0,212,255,0.3)" : "rgba(139,124,248,0.3)"}`, padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "700" }}>
                {question.type === "theory" ? "📖 MCQ Theory" : "🐍 Python Coding"}
              </span>
              <span style={{ background: `${diffColor}18`, color: diffColor, padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "700" }}>
                {question.difficulty === "easy" ? "🟢" : question.difficulty === "medium" ? "🟡" : "🔴"} {question.difficulty}
              </span>
              <span style={{ background: "rgba(255,215,0,0.1)", color: "#ffd700", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "700" }}>
                +{question.xpReward} XP
              </span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>{question.topic}</div>
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700" }}>{question.title}</h3>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-muted)", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", flexShrink: 0, marginLeft: "1rem" }}>✕</button>
        </div>

        {/* Already done banner */}
        {alreadyCompleted && (
          <div style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", color: "#00ff88", fontSize: "0.85rem" }}>
            ✅ You already completed this quest and earned XP!
          </div>
        )}

        {/* Description */}
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "1rem", marginBottom: "1.25rem", border: "1px solid var(--border)" }}>
          <pre style={{ margin: 0, fontFamily: "inherit", fontSize: "0.9rem", whiteSpace: "pre-wrap", color: "var(--text)" }}>{question.description}</pre>
        </div>

        {/* THEORY MCQ */}
        {question.type === "theory" && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.25rem" }}>
              {(question.options || []).map((opt, i) => {
                let bg = "rgba(255,255,255,0.03)";
                let border = "var(--border)";
                let color = "var(--text)";
                if (result && i === question.correctOption) { bg = "rgba(0,255,136,0.1)"; border = "#00ff88"; color = "#00ff88"; }
                else if (result === "wrong" && i === selectedOption) { bg = "rgba(255,107,107,0.1)"; border = "#ff6b6b"; color = "#ff6b6b"; }
                else if (selectedOption === i && !result) { bg = "rgba(108,99,255,0.12)"; border = "var(--accent)"; color = "var(--text)"; }
                return (
                  <button key={i} onClick={() => !result && setSelectedOption(i)}
                    style={{ background: bg, border: `1px solid ${border}`, borderRadius: "10px", padding: "0.85rem 1rem", textAlign: "left", cursor: result ? "default" : "pointer", color, transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: selectedOption === i ? "var(--accent)" : "rgba(255,255,255,0.06)", border: `1px solid ${selectedOption === i ? "var(--accent)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: "700", flexShrink: 0, color: selectedOption === i ? "white" : "var(--text-muted)" }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span style={{ fontSize: "0.9rem" }}>{opt}</span>
                    {result && i === question.correctOption && <span style={{ marginLeft: "auto" }}>✓</span>}
                    {result === "wrong" && i === selectedOption && i !== question.correctOption && <span style={{ marginLeft: "auto" }}>✗</span>}
                  </button>
                );
              })}
            </div>

            {result === "wrong" && question.explanation && (
              <div style={{ background: "rgba(0,212,255,0.07)", border: "1px solid rgba(0,212,255,0.25)", borderRadius: "8px", padding: "0.9rem 1rem", marginBottom: "1rem", fontSize: "0.88rem", color: "var(--text-muted)" }}>
                <span style={{ color: "var(--accent2)", fontWeight: "700" }}>💡 Explanation: </span>{question.explanation}
              </div>
            )}

            {!result && (
              <button onClick={handleTheorySubmit} className="btn-primary" disabled={selectedOption === null} style={{ width: "100%", justifyContent: "center" }}>
                ✅ Submit Answer
              </button>
            )}
          </div>
        )}

        {/* CODING — PYTHON */}
        {question.type === "coding" && (
          <div>
            <div style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "600" }}>🐍 Python Solution</label>
              {question.hint && (
                <button onClick={() => setShowHint(!showHint)} style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", color: "#ffd700", padding: "0.3rem 0.7rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.78rem" }}>
                  💡 {showHint ? "Hide Hint" : "Show Hint"}
                </button>
              )}
            </div>

            {showHint && question.hint && (
              <div style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "0.75rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                💡 {question.hint}
              </div>
            )}

            <textarea
              className="code-area"
              rows={10}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="# Write your Python solution here..."
              style={{ width: "100%", resize: "vertical", marginBottom: "1rem", fontSize: "0.875rem", boxSizing: "border-box" }}
            />

            {/* Test Cases */}
            {question.testCases && question.testCases.length > 0 && (
              <div style={{ marginBottom: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.75rem" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: "600" }}>TEST CASES</div>
                {question.testCases.map((tc, i) => (
                  <div key={i} style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                    <span style={{ color: "var(--accent2)" }}>#{i+1}</span> {tc.description} — Expected: <code style={{ color: "#00ff88" }}>{tc.expected}</code>
                  </div>
                ))}
              </div>
            )}

            {!result && (
              <button onClick={handleCodingSubmit} className="btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: "0.75rem" }}>
                🚀 Submit Solution
              </button>
            )}

            {!result && (
              <button onClick={() => setShowSolution(!showSolution)} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--text-muted)", padding: "0.6rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                {showSolution ? "🙈 Hide Solution" : "👁️ View Model Solution"}
              </button>
            )}

            {showSolution && question.solution && (
              <div style={{ marginTop: "0.75rem" }}>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>Model Solution:</div>
                <pre style={{ background: "rgba(0,0,0,0.4)", border: "1px solid var(--border)", borderRadius: "8px", padding: "1rem", fontSize: "0.85rem", overflowX: "auto", color: "#00ff88" }}>
                  {question.solution}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ marginTop: "1.25rem", padding: "1.25rem", borderRadius: "10px", textAlign: "center", background: result === "correct" ? "rgba(0,255,136,0.08)" : "rgba(255,107,107,0.08)", border: `1px solid ${result === "correct" ? "rgba(0,255,136,0.3)" : "rgba(255,107,107,0.3)"}` }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{result === "correct" ? "🎉" : "😅"}</div>
            <div style={{ fontWeight: "700", fontSize: "1.1rem", color: result === "correct" ? "#00ff88" : "#ff6b6b", marginBottom: "0.3rem" }}>
              {result === "correct" ? "Correct!" : "Not quite right"}
            </div>
            {result === "correct" && xpGained > 0 && (
              <div style={{ color: "#ffd700", fontWeight: "600" }}>+{xpGained} XP earned! ⭐</div>
            )}
            {result === "correct" && alreadyCompleted && (
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Already completed — no extra XP</div>
            )}
            {result === "wrong" && question.type === "coding" && (
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.4rem" }}>Check your solution and try again, or view the model solution above.</div>
            )}
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1rem" }}>
              {result === "wrong" && (
                <button onClick={() => setResult(null)} className="btn-primary">Try Again</button>
              )}
              <button onClick={onClose} className="btn-secondary">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

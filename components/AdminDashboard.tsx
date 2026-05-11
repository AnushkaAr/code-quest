"use client";
import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { Question, QuestionType, Difficulty, ClassLevel, CLASS_TOPICS } from "@/lib/data";
import Navbar from "./Navbar";

type Tab = "overview" | "questions" | "users";

const EMPTY_Q: Omit<Question, "id"> = {
  type: "theory", difficulty: "easy", classLevel: "python",
  topic: "Python Basics", title: "", description: "",
  xpReward: 50, options: ["", "", "", ""], correctOption: 0,
  explanation: "", starterCode: "", solution: "", hint: "",
};

const labelStyle: React.CSSProperties = { display: "block", marginBottom: "0.35rem", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", letterSpacing: "0.04em" };

export default function AdminDashboard() {
  const { users, questions, updateUserXP, deleteUser, getLeaderboard, getActiveUsers, updateQuestion, deleteQuestion, addQuestion } = useAuthStore();
  const [tab, setTab] = useState<Tab>("overview");
  const [editQ, setEditQ] = useState<Question | null>(null);
  const [addMode, setAddMode] = useState(false);
  const [formQ, setFormQ] = useState<Omit<Question, "id">>(EMPTY_Q);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [editXP, setEditXP] = useState<{ userId: string; xp: number } | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const saveQuestions = (qs: Question[]) => {
    // Update each changed question through the store (syncs to Supabase)
    qs.forEach(q => updateQuestion(q.id, q));
  };

  const flash = (text: string, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const handleSaveEdit = () => {
    if (!editQ) return;
    updateQuestion(editQ.id, editQ);
    setEditQ(null);
    flash("✅ Question updated!");
  };

  const handleAdd = () => {
    if (!formQ.title.trim() || !formQ.description.trim()) { flash("Title and description required", "error"); return; }
    const newQ: Question = { ...formQ, id: Math.max(0, ...questions.map(q => q.id)) + 1 };
    addQuestion(newQ);
    setAddMode(false);
    setFormQ(EMPTY_Q);
    flash("✅ Question added!");
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this question?")) return;
    deleteQuestion(id);
    flash("🗑️ Question deleted");
  };

  const handleSaveXP = () => {
    if (!editXP) return;
    updateUserXP(editXP.userId, editXP.xp);
    setEditXP(null);
    flash("✅ XP updated!");
  };

  const handleDeleteUser = (userId: string) => {
    deleteUser(userId);
    setConfirmDelete(null);
    flash("🗑️ User removed");
  };

  const leaderboard = getLeaderboard();
  const activeUsers = getActiveUsers();
  const normalUsers = users.filter(u => u.role === "user");
  const totalDone = normalUsers.reduce((s, u) => s + u.completedQuestions.length, 0);

  const filteredQs = questions.filter(q =>
    (filterType === "all" || q.type === filterType) &&
    (!search || q.title.toLowerCase().includes(search.toLowerCase()) || q.topic.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredUsers = normalUsers.filter(u =>
    !userSearch || u.username.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Format lastActive date
  const formatActive = (dateStr?: string) => {
    if (!dateStr) return "Never";
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 2) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const QForm = ({ q, setQ }: { q: Omit<Question, "id"> & { id?: number }; setQ: (q: any) => void }) => {
    const topics = CLASS_TOPICS["python"] || [];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
          <div>
            <label style={labelStyle}>Topic</label>
            <select className="input-field" value={q.topic} onChange={e => setQ({ ...q, topic: e.target.value })}>
              {topics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Type</label>
            <select className="input-field" value={q.type} onChange={e => setQ({ ...q, type: e.target.value as QuestionType, options: e.target.value === "theory" ? ["","","",""] : [], correctOption: 0 })}>
              <option value="theory">📖 MCQ</option>
              <option value="coding">🐍 Coding</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Difficulty</label>
            <select className="input-field" value={q.difficulty} onChange={e => setQ({ ...q, difficulty: e.target.value as Difficulty })}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.75rem" }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input className="input-field" value={q.title} onChange={e => setQ({ ...q, title: e.target.value })} placeholder="Question title" />
          </div>
          <div>
            <label style={labelStyle}>XP Reward</label>
            <input className="input-field" type="number" value={q.xpReward} onChange={e => setQ({ ...q, xpReward: +e.target.value })} style={{ width: "90px" }} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Description / Problem Statement</label>
          <textarea className="input-field" rows={4} value={q.description} onChange={e => setQ({ ...q, description: e.target.value })} placeholder="Question description..." style={{ resize: "vertical" }} />
        </div>

        {/* MCQ fields */}
        {q.type === "theory" && (
          <>
            <div>
              <label style={labelStyle}>Options — click radio to mark correct answer</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {(q.options || ["", "", "", ""]).map((opt: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input type="radio" checked={q.correctOption === i} onChange={() => setQ({ ...q, correctOption: i })} style={{ accentColor: "var(--accent)", width: "16px", height: "16px", cursor: "pointer" }} />
                    <input className="input-field" value={opt} onChange={e => {
                      const opts = [...(q.options || ["", "", "", ""])];
                      opts[i] = e.target.value;
                      setQ({ ...q, options: opts });
                    }} placeholder={`Option ${i + 1}${q.correctOption === i ? " ✓ correct" : ""}`} style={{ padding: "0.5rem 0.75rem" }} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Explanation</label>
              <textarea className="input-field" rows={2} value={q.explanation || ""} onChange={e => setQ({ ...q, explanation: e.target.value })} placeholder="Explain the correct answer..." style={{ resize: "vertical" }} />
            </div>
          </>
        )}

        {/* Coding fields */}
        {q.type === "coding" && (
          <>
            <div>
              <label style={labelStyle}>Hint (optional)</label>
              <input className="input-field" value={q.hint || ""} onChange={e => setQ({ ...q, hint: e.target.value })} placeholder="Optional hint for students" />
            </div>
            <div>
              <label style={labelStyle}>Starter Code</label>
              <textarea className="code-area" rows={4} value={q.starterCode || ""} onChange={e => setQ({ ...q, starterCode: e.target.value })} placeholder="# Starter code shown to student..." />
            </div>
            <div>
              <label style={labelStyle}>Solution Code</label>
              <textarea className="code-area" rows={4} value={q.solution || ""} onChange={e => setQ({ ...q, solution: e.target.value })} placeholder="# Correct solution..." />
            </div>
            <div>
              <label style={labelStyle}>Test Cases (JSON)</label>
              <textarea className="code-area" rows={3}
                value={q.testCases ? JSON.stringify(q.testCases, null, 2) : ""}
                onChange={e => {
                  try { setQ({ ...q, testCases: JSON.parse(e.target.value) }); } catch {}
                }}
                placeholder={'[\n  {"input": "5", "expected": "25", "description": "5 squared"}\n]'} />
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="grid-bg" />
      <div className="stars-bg" />
      <Navbar title="Code Quest Admin" />

      {/* Flash message */}
      {msg.text && (
        <div style={{ position: "fixed", top: "80px", right: "1.5rem", zIndex: 999, background: msg.type === "error" ? "rgba(255,107,107,0.95)" : "rgba(0,200,100,0.95)", color: "white", padding: "0.75rem 1.25rem", borderRadius: "10px", fontWeight: "600", fontSize: "0.88rem", boxShadow: "0 4px 20px rgba(0,0,0,0.4)", backdropFilter: "blur(10px)" }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: "flex", position: "relative", zIndex: 1 }}>
        {/* Sidebar */}
        <aside className="sidebar">
          <div style={{ padding: "1rem", background: "linear-gradient(135deg, rgba(255,107,107,0.12), rgba(108,99,255,0.08))", borderRadius: "12px", border: "1px solid rgba(255,107,107,0.25)", marginBottom: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.3rem" }}>🛡️</div>
            <div style={{ fontWeight: "700", fontSize: "0.85rem" }}>Admin Panel</div>
            <div style={{ fontSize: "0.7rem", color: "var(--accent3)", marginTop: "0.2rem" }}>Full Control Mode</div>
          </div>

          {([["overview", "📊", "Overview"], ["questions", "📝", "Questions"], ["users", "👥", "Users"]] as const).map(([id, icon, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`sidebar-item${tab === id ? " active" : ""}`}>
              <span>{icon}</span><span>{label}</span>
            </button>
          ))}

          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              { label: "Questions", value: questions.length, color: "var(--accent)" },
              { label: "Total Users", value: normalUsers.length, color: "var(--accent2)" },
              { label: "Active (7d)", value: activeUsers.length, color: "var(--green)" },
              { label: "Completions", value: totalDone, color: "var(--gold)" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{s.label}</span>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </aside>

        <main style={{ flex: 1, padding: "2rem" }}>

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: "1.6rem", fontWeight: "800", margin: "0 0 1.5rem" }}>📊 Admin Overview</h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                {[
                  { label: "Total Questions", value: questions.length, icon: "📝", color: "var(--accent)", sub: `${questions.filter(q => q.type === "theory").length} MCQ · ${questions.filter(q => q.type === "coding").length} Coding` },
                  { label: "Total Users", value: normalUsers.length, icon: "👥", color: "var(--accent2)", sub: "Registered learners" },
                  { label: "Active (7 days)", value: activeUsers.length, icon: "🟢", color: "var(--green)", sub: `${normalUsers.length > 0 ? Math.round(activeUsers.length / normalUsers.length * 100) : 0}% of total` },
                  { label: "Total Completions", value: totalDone, icon: "✅", color: "var(--gold)", sub: normalUsers.length > 0 ? `${(totalDone / normalUsers.length).toFixed(1)} avg per user` : "No users yet" },
                  { label: "MCQ Questions", value: questions.filter(q => q.type === "theory").length, icon: "📖", color: "#a78bfa", sub: "Multiple choice" },
                  { label: "Coding Questions", value: questions.filter(q => q.type === "coding").length, icon: "🐍", color: "#34d399", sub: "Code challenges" },
                ].map(s => (
                  <div key={s.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "1.5rem", transition: "all 0.2s" }}
                    onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.borderColor = s.color; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                    onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}>
                    <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>{s.icon}</div>
                    <div style={{ fontSize: "2rem", fontWeight: "900", color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: "0.88rem", fontWeight: "600", marginTop: "0.2rem" }}>{s.label}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Recently active users */}
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", margin: "0 0 1rem" }}>🟢 Recently Active Players</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "2rem" }}>
                {activeUsers.slice(0, 5).map(u => (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.85rem 1.1rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px" }}>
                    <div style={{ fontSize: "1.4rem" }}>{u.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>{u.username}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{u.completedQuestions.length} quests · Lv.{u.level}</div>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--green)", fontWeight: "600" }}>{formatActive(u.lastActive)}</div>
                    <div style={{ fontWeight: "800", color: "var(--gold)", fontSize: "0.88rem" }}>{u.xp.toLocaleString()} XP</div>
                  </div>
                ))}
                {activeUsers.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>No active players in last 7 days.</p>}
              </div>

              {/* Leaderboard */}
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", margin: "0 0 1rem" }}>🏆 Top Players</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {leaderboard.slice(0, 5).map((u, i) => (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.85rem 1.1rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px" }}>
                    <div style={{ fontSize: "1.3rem", minWidth: "2rem", textAlign: "center" }}>{["🥇", "🥈", "🥉", "4️⃣", "5️⃣"][i]}</div>
                    <div style={{ fontSize: "1.4rem" }}>{u.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>{u.username}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{u.completedQuestions.length} quests · Lv.{u.level}</div>
                    </div>
                    <div style={{ fontWeight: "800", color: "var(--gold)" }}>{u.xp.toLocaleString()} XP</div>
                  </div>
                ))}
                {leaderboard.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>No players yet.</p>}
              </div>
            </div>
          )}

          {/* ── QUESTIONS ── */}
          {tab === "questions" && (
            <div className="animate-fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <h2 style={{ fontSize: "1.6rem", fontWeight: "800", margin: 0 }}>📝 Manage Questions</h2>
                <button className="btn-primary" onClick={() => { setAddMode(true); setEditQ(null); }}>+ Add Question</button>
              </div>

              {/* Filters */}
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                <input placeholder="Search by title or topic..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ flex: 1, minWidth: "140px", padding: "0.5rem 0.75rem", fontSize: "0.85rem" }} />
                <select className="input-field" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ fontSize: "0.85rem", width: "auto" }}>
                  <option value="all">All Types</option>
                  <option value="theory">📖 MCQ</option>
                  <option value="coding">🐍 Coding</option>
                </select>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>{filteredQs.length} questions</div>
              </div>

              {/* Add form */}
              {addMode && (
                <div style={{ background: "var(--bg-card)", border: "1px solid rgba(0,212,255,0.3)", borderRadius: "14px", padding: "1.5rem", marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                    <h3 style={{ margin: 0, color: "var(--accent2)" }}>+ New Question</h3>
                    <button onClick={() => setAddMode(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
                  </div>
                  <QForm q={formQ} setQ={setFormQ} />
                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                    <button className="btn-primary" onClick={handleAdd}>✅ Save Question</button>
                    <button className="btn-secondary" onClick={() => setAddMode(false)}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Questions list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {filteredQs.map(q => (
                  <div key={q.id}>
                    {editQ?.id === q.id ? (
                      <div style={{ background: "var(--bg-card)", border: "1px solid rgba(108,99,255,0.4)", borderRadius: "14px", padding: "1.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                          <h3 style={{ margin: 0, color: "var(--accent)" }}>Edit: {q.title}</h3>
                          <button onClick={() => setEditQ(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
                        </div>
                        <QForm q={editQ} setQ={setEditQ} />
                        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                          <button className="btn-primary" onClick={handleSaveEdit}>✅ Save Changes</button>
                          <button className="btn-secondary" onClick={() => setEditQ(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", transition: "all 0.2s" }}
                        onMouseOver={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(108,99,255,0.4)"}
                        onMouseOut={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"}>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", minWidth: "28px", fontFamily: "monospace" }}>#{q.id}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "600", fontSize: "0.9rem", marginBottom: "0.2rem" }}>{q.title}</div>
                          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                            <span className={`badge badge-${q.type}`} style={{ fontSize: "0.65rem" }}>{q.type === "theory" ? "MCQ" : "Code"}</span>
                            <span className={`badge badge-${q.difficulty}`} style={{ fontSize: "0.65rem" }}>{q.difficulty}</span>
                            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{q.topic}</span>
                          </div>
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "var(--gold)", fontWeight: "700", marginRight: "0.5rem" }}>{q.xpReward} XP</div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button onClick={() => { setEditQ(q); setAddMode(false); }} style={{ background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)", color: "var(--accent)", padding: "0.35rem 0.7rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.78rem" }}>Edit</button>
                          <button onClick={() => handleDelete(q.id)} className="btn-danger btn-sm">Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {tab === "users" && (
            <div className="animate-fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <h2 style={{ fontSize: "1.6rem", fontWeight: "800", margin: 0 }}>👥 Manage Users</h2>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <div style={{ fontSize: "0.82rem", padding: "0.35rem 0.75rem", background: "rgba(0,200,100,0.1)", border: "1px solid rgba(0,200,100,0.3)", borderRadius: "8px", color: "var(--green)" }}>
                    🟢 {activeUsers.length} active
                  </div>
                  <div style={{ fontSize: "0.82rem", padding: "0.35rem 0.75rem", background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.3)", borderRadius: "8px", color: "var(--accent)" }}>
                    👥 {normalUsers.length} total
                  </div>
                </div>
              </div>

              {/* Search */}
              <input placeholder="Search by username or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="input-field" style={{ width: "100%", marginBottom: "1.25rem", padding: "0.5rem 0.75rem", fontSize: "0.85rem" }} />

              {filteredUsers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>👥</div>
                  <p>{normalUsers.length === 0 ? "No registered users yet." : "No users match your search."}</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {filteredUsers.map(u => {
                    const isActive = activeUsers.find(a => a.id === u.id);
                    return (
                      <div key={u.id} style={{ padding: "1.1rem 1.25rem", background: "var(--bg-card)", border: `1px solid ${isActive ? "rgba(0,200,100,0.2)" : "var(--border)"}`, borderRadius: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          <div style={{ fontSize: "1.8rem" }}>{u.avatar}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              {u.username}
                              {isActive && <span style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem", background: "rgba(0,200,100,0.15)", border: "1px solid rgba(0,200,100,0.35)", borderRadius: "20px", color: "var(--green)", fontWeight: "600" }}>ACTIVE</span>}
                            </div>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{u.email} · Lv.{u.level} · {u.completedQuestions.length} quests · Last: {formatActive(u.lastActive)}</div>
                          </div>

                          {editXP?.userId === u.id ? (
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                              <input type="number" value={editXP.xp} onChange={e => setEditXP({ ...editXP, xp: +e.target.value })}
                                className="input-field" style={{ width: "100px", padding: "0.4rem 0.6rem", fontSize: "0.85rem" }} />
                              <button className="btn-primary btn-sm" onClick={handleSaveXP}>Save</button>
                              <button className="btn-secondary btn-sm" onClick={() => setEditXP(null)}>Cancel</button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span style={{ fontWeight: "800", color: "var(--gold)" }}>{u.xp.toLocaleString()} XP</span>
                              <button onClick={() => setEditXP({ userId: u.id, xp: u.xp })} style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", color: "var(--gold)", padding: "0.3rem 0.6rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem" }}>Edit XP</button>
                              <button onClick={() => setConfirmDelete(u.id)} style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", color: "var(--accent3)", padding: "0.3rem 0.6rem", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem" }}>Remove</button>
                            </div>
                          )}
                        </div>

                        {/* Confirm delete */}
                        {confirmDelete === u.id && (
                          <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <span style={{ flex: 1, fontSize: "0.85rem", color: "var(--accent3)" }}>⚠️ Remove <strong>{u.username}</strong>? This cannot be undone.</span>
                            <button onClick={() => handleDeleteUser(u.id)} className="btn-danger btn-sm">Yes, Remove</button>
                            <button onClick={() => setConfirmDelete(null)} className="btn-secondary btn-sm">Cancel</button>
                          </div>
                        )}

                        {/* Progress bar */}
                        <div style={{ marginTop: "0.75rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                            <span>Progress</span>
                            <span>{u.completedQuestions.length}/{questions.length} questions</span>
                          </div>
                          <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${questions.length > 0 ? (u.completedQuestions.length / questions.length * 100) : 0}%`, background: "linear-gradient(90deg, var(--accent), var(--accent2))", borderRadius: "2px", transition: "width 0.4s" }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

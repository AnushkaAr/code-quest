"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { QUESTIONS, Question, xpForNextLevel, CLASS_TOPICS } from "@/lib/data";
import Navbar from "./Navbar";
import QuestionModal from "./QuestionModal";

type Tab = "quests" | "leaderboard" | "profile";
type FilterType = "all" | "theory" | "coding";
type FilterDiff = "all" | "easy" | "medium" | "hard";

const diffColors = { easy: "#00ff88", medium: "#ffd700", hard: "#ff6b6b" };

export default function UserDashboard() {
  const { currentUser, getLeaderboard } = useAuthStore();
  const [tab, setTab] = useState<Tab>("quests");
  const [activeQ, setActiveQ] = useState<Question | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterDiff, setFilterDiff] = useState<FilterDiff>("all");
  const [filterTopic, setFilterTopic] = useState("all");
  const [search, setSearch] = useState("");
  const [questions, setQuestions] = useState<Question[]>(QUESTIONS);

  useEffect(() => {
    const saved = localStorage.getItem("cq_questions");
    setQuestions(saved ? JSON.parse(saved) : QUESTIONS);
  }, [tab, activeQ]);

  if (!currentUser) return null;

  const completed = currentUser.completedQuestions;
  const nextLevelXP = xpForNextLevel(currentUser.level);
  const prevLevelXP = xpForNextLevel(currentUser.level - 1);
  const progress = Math.min(100, ((currentUser.xp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100);
  const leaderboard = getLeaderboard();
  const myRank = leaderboard.findIndex(u => u.id === currentUser.id) + 1;

  const allTopics = ["all", ...Array.from(new Set(questions.map(q => q.topic)))];
  const filtered = questions.filter(q =>
    (filterType === "all" || q.type === filterType) &&
    (filterDiff === "all" || q.difficulty === filterDiff) &&
    (filterTopic === "all" || q.topic === filterTopic) &&
    (!search || q.title.toLowerCase().includes(search.toLowerCase()) || q.topic.toLowerCase().includes(search.toLowerCase()))
  );

  const heroTitles = ["Novice Coder", "Bug Squasher", "Loop Master", "Array Knight", "Recursion Wizard", "Grand Architect"];
  const heroTitle = heroTitles[Math.min(currentUser.level - 1, heroTitles.length - 1)];

  const topicStats = CLASS_TOPICS["python"].map(topic => {
    const topicQs = questions.filter(q => q.topic === topic);
    const done = topicQs.filter(q => completed.includes(q.id)).length;
    return { topic, total: topicQs.length, done };
  });

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="grid-bg" />
      <div className="stars-bg" />
      <Navbar />
      <div style={{ display: "flex", position: "relative", zIndex: 1 }}>

        {/* Sidebar */}
        <aside className="sidebar">
          <div style={{ marginBottom: "1rem", padding: "1.1rem", background: "linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,212,255,0.06))", borderRadius: "12px", border: "1px solid rgba(108,99,255,0.25)", textAlign: "center" }}>
            <div style={{ fontSize: "2.2rem", marginBottom: "0.4rem", filter: "drop-shadow(0 0 8px rgba(108,99,255,0.6))" }}>{currentUser.avatar}</div>
            <div style={{ fontWeight: "700", marginBottom: "0.2rem", fontSize: "0.9rem" }}>{currentUser.username}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--accent)", marginBottom: "0.6rem" }}>{heroTitle}</div>
            <div className="xp-bar" style={{ marginBottom: "0.3rem" }}>
              <div className="xp-fill" style={{ width: `${progress}%` }} />
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Lv.{currentUser.level} · {currentUser.xp} XP</div>
          </div>

          {([["quests", "⚔️", "Quests"], ["leaderboard", "🏆", "Leaderboard"], ["profile", "🧙", "My Profile"]] as const).map(([id, icon, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`sidebar-item${tab === id ? " active" : ""}`}>
              <span>{icon}</span><span>{label}</span>
            </button>
          ))}

          <div style={{ marginTop: "auto", padding: "0.85rem", background: "rgba(255,215,0,0.05)", borderRadius: "10px", border: "1px solid rgba(255,215,0,0.2)" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: "0.4rem", letterSpacing: "0.05em" }}>PROGRESS</div>
            <div style={{ fontSize: "0.88rem", fontWeight: "700" }}>{completed.length}/{questions.length} Quests</div>
            {myRank > 0 && <div style={{ fontSize: "0.8rem", color: "var(--gold)", marginTop: "0.25rem" }}>🏆 Rank #{myRank}</div>}
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: "2rem", maxWidth: "1100px" }}>

          {/* ── QUESTS ── */}
          {tab === "quests" && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.6rem", fontWeight: "800", margin: "0 0 0.3rem" }}>🐍 Python Quest Board</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: 0 }}>10 MCQ + 10 Coding challenges — all Python, all levels</p>
              </div>

              {/* Filters */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.5rem", background: "rgba(13,21,37,0.6)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <input placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)}
                  className="input-field" style={{ flex: "1", minWidth: "160px", padding: "0.5rem 0.75rem", fontSize: "0.85rem" }} />
                <select className="input-field" value={filterType} onChange={e => setFilterType(e.target.value as FilterType)} style={{ fontSize: "0.85rem", width: "auto" }}>
                  <option value="all">All Types</option>
                  <option value="theory">📖 MCQ</option>
                  <option value="coding">🐍 Coding</option>
                </select>
                <select className="input-field" value={filterDiff} onChange={e => setFilterDiff(e.target.value as FilterDiff)} style={{ fontSize: "0.85rem", width: "auto" }}>
                  <option value="all">All Levels</option>
                  <option value="easy">🟢 Easy</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="hard">🔴 Hard</option>
                </select>
                <select className="input-field" value={filterTopic} onChange={e => setFilterTopic(e.target.value)} style={{ fontSize: "0.85rem", width: "auto" }}>
                  {allTopics.map(t => <option key={t} value={t}>{t === "all" ? "All Topics" : t}</option>)}
                </select>
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                {[
                  { label: "Total", value: questions.length, color: "var(--accent)" },
                  { label: "Completed", value: completed.length, color: "var(--green)" },
                  { label: "MCQ", value: questions.filter(q => q.type === "theory").length, color: "var(--accent2)" },
                  { label: "Coding", value: questions.filter(q => q.type === "coding").length, color: "var(--gold)" },
                ].map(s => (
                  <div key={s.label} className="stat-card" style={{ flex: 1, minWidth: "80px" }}>
                    <div style={{ fontSize: "1.5rem", fontWeight: "800", color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Quest grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                {filtered.map(q => {
                  const done = completed.includes(q.id);
                  return (
                    <div key={q.id} onClick={() => setActiveQ(q)} className="quest-card"
                      style={{ opacity: done ? 0.72 : 1, cursor: "pointer", position: "relative" }}>
                      {done && (
                        <div style={{ position: "absolute", top: "0.7rem", right: "0.7rem", background: "#00ff8818", border: "1px solid #00ff88", borderRadius: "20px", padding: "0.15rem 0.55rem", fontSize: "0.65rem", color: "#00ff88", fontWeight: "700" }}>✓ DONE</div>
                      )}
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.7rem" }}>
                        <span className={`badge badge-${q.difficulty}`}>{q.difficulty}</span>
                        <span className={`badge badge-${q.type}`}>{q.type === "theory" ? "📖 MCQ" : "🐍 Code"}</span>
                      </div>
                      <div style={{ fontWeight: "700", fontSize: "0.95rem", marginBottom: "0.3rem" }}>{q.title}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>{q.topic}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>#{q.id}</span>
                        <span style={{ fontSize: "0.82rem", color: "var(--gold)", fontWeight: "700" }}>+{q.xpReward} XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🔍</div>
                  <p>No questions match your filters.</p>
                </div>
              )}
            </div>
          )}

          {/* ── LEADERBOARD ── */}
          {tab === "leaderboard" && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: "1.6rem", fontWeight: "800", margin: "0 0 1.5rem" }}>🏆 Leaderboard</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {leaderboard.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🏆</div>
                    <p>No players yet. Be the first!</p>
                  </div>
                ) : leaderboard.map((u, i) => {
                  const isMe = u.id === currentUser.id;
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", background: isMe ? "rgba(108,99,255,0.12)" : "var(--bg-card)", border: `1px solid ${isMe ? "rgba(108,99,255,0.4)" : "var(--border)"}`, borderRadius: "12px", transition: "all 0.2s" }}>
                      <div style={{ fontSize: "1.5rem", minWidth: "2rem", textAlign: "center" }}>{i < 3 ? medals[i] : `#${i + 1}`}</div>
                      <div style={{ fontSize: "1.6rem" }}>{u.avatar}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>{u.username}{isMe && <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", color: "var(--accent)", fontWeight: "600" }}>YOU</span>}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{u.completedQuestions.length} quests completed</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: "800", color: "var(--gold)", fontSize: "1rem" }}>{u.xp.toLocaleString()} XP</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Level {u.level}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── PROFILE ── */}
          {tab === "profile" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", maxWidth: "680px", margin: "0 auto" }}>
              {/* Main profile card */}
              <div className="profile-card" style={{ width: "100%" }}>
                <div className="profile-avatar-ring animate-float">
                  {currentUser.avatar}
                  <div style={{ position: "absolute", bottom: "-4px", right: "-4px", background: "var(--gold)", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: "800", color: "#000" }}>
                    {currentUser.level}
                  </div>
                </div>
                <h2 style={{ fontSize: "1.8rem", fontWeight: "900", margin: "0 0 0.3rem" }}>{currentUser.username}</h2>
                <p style={{ color: "var(--accent)", fontWeight: "600", fontSize: "1rem", margin: "0 0 0.5rem" }}>{heroTitle}</p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 1.5rem" }}>{currentUser.email}</p>

                {/* XP Progress */}
                <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Level {currentUser.level}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--accent2)" }}>{currentUser.xp} / {nextLevelXP} XP</span>
                  </div>
                  <div className="xp-bar" style={{ height: "12px" }}>
                    <div className="xp-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem", textAlign: "center" }}>
                    {Math.round(nextLevelXP - currentUser.xp)} XP to Level {currentUser.level + 1}
                  </div>
                </div>

                {/* Stats grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
                  {[
                    { label: "Quests Done", value: completed.length, icon: "⚔️", color: "var(--accent)" },
                    { label: "Total XP", value: currentUser.xp.toLocaleString(), icon: "⭐", color: "var(--gold)" },
                    { label: "Rank", value: myRank > 0 ? `#${myRank}` : "—", icon: "🏆", color: "var(--accent2)" },
                  ].map(s => (
                    <div key={s.label} className="stat-card">
                      <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>{s.icon}</div>
                      <div style={{ fontSize: "1.3rem", fontWeight: "800", color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topic Progress */}
              <div style={{ width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "1.5rem" }}>
                <h3 style={{ margin: "0 0 1.25rem", fontSize: "1.05rem", fontWeight: "700" }}>📊 Topic Progress</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {topicStats.map(({ topic, total, done }) => {
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                    return (
                      <div key={topic}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{topic}</span>
                          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{done}/{total}</span>
                        </div>
                        <div className="xp-bar">
                          <div style={{ height: "100%", borderRadius: "4px", background: pct === 100 ? "linear-gradient(90deg, var(--green), #00cc6a)" : "linear-gradient(90deg, var(--accent), var(--accent2))", width: `${pct}%`, transition: "width 0.6s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Member since */}
              <div style={{ width: "100%", background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: "12px", padding: "1rem 1.25rem", textAlign: "center" }}>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Member since</div>
                <div style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--gold)", marginTop: "0.25rem" }}>
                  {new Date(currentUser.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {activeQ && <QuestionModal question={activeQ} onClose={() => setActiveQ(null)} alreadyCompleted={completed.includes(activeQ.id)} />}
    </div>
  );
}

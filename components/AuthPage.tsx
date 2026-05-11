"use client";
import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { AVATARS } from "@/lib/data";

type MainMode = "user" | "admin";

export default function AuthPage() {
  const { login, register } = useAuthStore();
  const [mainMode, setMainMode] = useState<MainMode>("user");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("🧙");
  const [error, setError] = useState("");

  const resetFields = () => {
    setEmail(""); setPassword(""); setUsername(""); setError("");
  };

  const handleSubmit = async () => {
    setError("");
    if (mainMode === "admin") {
      const r = await login(email, password);
      if (!r.success) { setError(r.error || "Login failed"); return; }
      if (r.role !== "admin") { setError("Access denied. Admin accounts only."); return; }
      return;
    }
    if (mode === "login") {
      const r = await login(email, password);
      if (!r.success) { setError(r.error || "Login failed"); return; }
      if (r.role === "admin") { setError("Use the Admin panel to log in as admin."); return; }
    } else {
      if (!username.trim()) { setError("Username is required"); return; }
      const r = await register(username, email, password, avatar);
      if (!r.success) setError(r.error || "Registration failed");
    }
  };

  const switchMain = (m: MainMode) => {
    setMainMode(m);
    setMode("login");
    resetFields();
  };

  const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.4rem", fontWeight: "600" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <div className="grid-bg" />
      <div className="stars-bg" />
      <div style={{ position: "fixed", top: "15%", left: "8%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)", pointerEvents: "none", animation: "float 6s ease-in-out infinite" }} />
      <div style={{ position: "fixed", bottom: "20%", right: "10%", width: "250px", height: "250px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)", pointerEvents: "none", animation: "float 8s ease-in-out infinite reverse" }} />
      <div style={{ position: "fixed", top: "60%", left: "5%", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,107,0.08) 0%, transparent 70%)", pointerEvents: "none", animation: "float 7s ease-in-out infinite" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "460px", padding: "1.5rem" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "linear-gradient(135deg, var(--accent), var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", margin: "0 auto 1.25rem", boxShadow: "0 0 40px rgba(108,99,255,0.5)", animation: "pulse-glow 2s infinite" }}>🐍</div>
          <h1 className="shimmer-text" style={{ fontSize: "2.2rem", fontWeight: "900", margin: "0 0 0.4rem" }}>Code Quest</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: 0 }}>Master Python. Level Up. Conquer Challenges.</p>
        </div>

        {/* Main mode switcher */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <button onClick={() => switchMain("user")}
            style={{ flex: 1, padding: "0.7rem", borderRadius: "12px", border: `2px solid ${mainMode === "user" ? "var(--accent)" : "var(--border)"}`, background: mainMode === "user" ? "rgba(108,99,255,0.15)" : "rgba(255,255,255,0.03)", color: mainMode === "user" ? "var(--accent)" : "var(--text-muted)", fontWeight: "700", fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            🎮 Player Login
          </button>
          <button onClick={() => switchMain("admin")}
            style={{ flex: 1, padding: "0.7rem", borderRadius: "12px", border: `2px solid ${mainMode === "admin" ? "var(--accent3)" : "var(--border)"}`, background: mainMode === "admin" ? "rgba(255,107,107,0.12)" : "rgba(255,255,255,0.03)", color: mainMode === "admin" ? "var(--accent3)" : "var(--text-muted)", fontWeight: "700", fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            🛡️ Admin Panel
          </button>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(13,21,37,0.85)", border: `1px solid ${mainMode === "admin" ? "rgba(255,107,107,0.35)" : "rgba(108,99,255,0.3)"}`, borderRadius: "20px", padding: "2rem", backdropFilter: "blur(20px)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", transition: "border-color 0.3s" }}>

          {/* Admin badge */}
          {mainMode === "admin" && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1rem", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: "10px", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "1.4rem" }}>🔐</span>
              <div>
                <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--accent3)" }}>Admin Access Only</div>
                <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>Enter your admin credentials to continue</div>
              </div>
            </div>
          )}

          {/* User tabs */}
          {mainMode === "user" && (
            <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "3px", marginBottom: "1.75rem" }}>
              {(["login", "register"] as const).map(m => (
                <button key={m} onClick={() => { setMode(m); setError(""); }}
                  style={{ flex: 1, padding: "0.55rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "0.88rem", transition: "all 0.2s", background: mode === m ? "linear-gradient(135deg, var(--accent), #8b7cf8)" : "transparent", color: mode === m ? "white" : "var(--text-muted)" }}>
                  {m === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {mainMode === "user" && mode === "register" && (
              <div>
                <label style={labelStyle}>USERNAME</label>
                <input className="input-field" placeholder="Choose a username" value={username} onChange={e => setUsername(e.target.value)} />
              </div>
            )}
            <div>
              <label style={labelStyle}>EMAIL</label>
              <input className="input-field" type="email" placeholder={mainMode === "admin" ? "admin@codequest.com" : "your@email.com"} value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>
            <div>
              <label style={labelStyle}>PASSWORD</label>
              <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>

            {mainMode === "user" && mode === "register" && (
              <div>
                <label style={labelStyle}>CHOOSE AVATAR</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {AVATARS.map(a => (
                    <button key={a} onClick={() => setAvatar(a)}
                      style={{ width: "44px", height: "44px", borderRadius: "10px", border: `2px solid ${avatar === a ? "var(--accent)" : "var(--border)"}`, background: avatar === a ? "rgba(108,99,255,0.2)" : "rgba(255,255,255,0.03)", cursor: "pointer", fontSize: "1.4rem", transition: "all 0.2s", transform: avatar === a ? "scale(1.15)" : "scale(1)" }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "8px", padding: "0.7rem 1rem", color: "var(--accent3)", fontSize: "0.85rem" }}>
                {error}
              </div>
            )}

            <button className="btn-primary" onClick={handleSubmit}
              style={{ width: "100%", justifyContent: "center", marginTop: "0.25rem", padding: "0.85rem", background: mainMode === "admin" ? "linear-gradient(135deg, #ff6b6b, #ee5a24)" : undefined }}>
              {mainMode === "admin" ? "🔐 Admin Sign In" : mode === "login" ? "🚀 Sign In" : "⚔️ Start Quest"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

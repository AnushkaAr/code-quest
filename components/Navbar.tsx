"use client";
import { useAuthStore } from "@/lib/store";
import { xpForNextLevel } from "@/lib/data";

export default function Navbar({ title = "Code Quest" }: { title?: string }) {
  const { currentUser, logout } = useAuthStore();
  if (!currentUser) return null;

  const nextLevelXP = xpForNextLevel(currentUser.level);
  const prevLevelXP = xpForNextLevel(currentUser.level - 1);
  const progress = Math.min(100, ((currentUser.xp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100);

  return (
    <nav className="nav">
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 1.5rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, var(--accent), var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", boxShadow: "0 0 15px rgba(108,99,255,0.4)" }}>🐍</div>
          <span style={{ fontWeight: "800", fontSize: "1.15rem", background: "linear-gradient(135deg, var(--accent), var(--accent2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {title}
          </span>
          {currentUser.role === "admin" && (
            <span style={{ background: "rgba(255,107,107,0.15)", color: "var(--accent3)", border: "1px solid rgba(255,107,107,0.3)", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "700" }}>
              ADMIN
            </span>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {currentUser.role === "user" && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Level {currentUser.level}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--accent)" }}>{currentUser.xp} XP</div>
              </div>
              <div style={{ width: "90px" }}>
                <div className="xp-bar">
                  <div className="xp-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg, rgba(108,99,255,0.3), rgba(0,212,255,0.2))", border: "2px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
              {currentUser.avatar}
            </div>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>{currentUser.username}</div>
            </div>
          </div>
          <button onClick={logout} style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", color: "var(--accent3)", padding: "0.4rem 0.9rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600", transition: "all 0.2s" }}
            onMouseOver={e => (e.currentTarget.style.background = "rgba(255,107,107,0.2)")}
            onMouseOut={e => (e.currentTarget.style.background = "rgba(255,107,107,0.1)")}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

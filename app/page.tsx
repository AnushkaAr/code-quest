"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import AuthPage from "@/components/AuthPage";
import UserDashboard from "@/components/UserDashboard";
import AdminDashboard from "@/components/AdminDashboard";

export default function Home() {
  const { currentUser, initStore, loading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initStore().then(() => setMounted(true));
  }, []);

  if (!mounted || loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem", animation: "pulse-glow 2s infinite" }}>🐍</div>
          <p style={{ color: "var(--text-muted)" }}>Loading Code Quest...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <AuthPage />;
  if (currentUser.role === "admin") return <AdminDashboard />;
  return <UserDashboard />;
}

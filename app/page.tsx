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
    initStore().finally(() => setMounted(true));
  }, []);

  if (!mounted || loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem", animation: "spin 1s linear infinite" }}>⚔️</div>
          <p style={{ color: "var(--text-muted)" }}>Loading Code Quest...</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.5rem" }}>Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <AuthPage />;
  // Strict role-based routing — admin can ONLY see AdminDashboard, users can NEVER see it
  if (currentUser.role === "admin") return <AdminDashboard />;
  return <UserDashboard />;
}

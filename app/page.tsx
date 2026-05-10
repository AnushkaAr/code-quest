"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import AuthPage from "@/components/AuthPage";
import UserDashboard from "@/components/UserDashboard";
import AdminDashboard from "@/components/AdminDashboard";

export default function Home() {
  const { currentUser, initStore } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initStore();
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚔️</div>
          <p style={{ color: "var(--text-muted)" }}>Loading Code Quest...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <AuthPage />;
  if (currentUser.role === "admin") return <AdminDashboard />;
  return <UserDashboard />;
}

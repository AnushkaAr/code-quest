"use client";
import { create } from "zustand";
import { User, xpToLevel, QUESTIONS, Question } from "./data";
import { supabase } from "./supabase";

interface AuthStore {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  logout: () => void;
  register: (username: string, email: string, password: string, avatar: string) => Promise<{ success: boolean; error?: string }>;
  completeQuestion: (questionId: number, xpEarned: number) => Promise<void>;
  updateUserXP: (userId: string, xp: number) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  fetchUsers: () => Promise<void>;
  getLeaderboard: () => User[];
  getActiveUsers: () => User[];
  initStore: () => Promise<void>;
}

const dbToUser = (row: any): User => ({
  id: row.id,
  username: row.username,
  email: row.email,
  password: row.password,
  role: row.role,
  avatar: row.avatar,
  level: row.level,
  xp: row.xp,
  completedQuestions: row.completed_questions || [],
  createdAt: row.created_at,
  lastActive: row.last_active,
});

export const useAuthStore = create<AuthStore>((set, get) => ({
  currentUser: null,
  users: [],
  loading: false,

  initStore: async () => {
    set({ loading: true });
    // Check localStorage for current user session
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cq_current_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Refresh from DB
        const { data } = await supabase.from("users").select("*").eq("id", parsed.id).single();
        if (data) set({ currentUser: dbToUser(data) });
        else localStorage.removeItem("cq_current_user");
      }
    }
    await get().fetchUsers();
    set({ loading: false });
  },

  fetchUsers: async () => {
    const { data } = await supabase.from("users").select("*");
    if (data) set({ users: data.map(dbToUser) });
  },

  login: async (email, password) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error || !data) return { success: false, error: "Invalid email or password" };

    const user = dbToUser(data);
    // Update lastActive
    await supabase.from("users").update({ last_active: new Date().toISOString() }).eq("id", user.id);
    const updatedUser = { ...user, lastActive: new Date().toISOString() };

    set(state => ({
      currentUser: updatedUser,
      users: state.users.map(u => u.id === user.id ? updatedUser : u)
    }));
    if (typeof window !== "undefined") {
      localStorage.setItem("cq_current_user", JSON.stringify(updatedUser));
    }
    return { success: true, role: user.role };
  },

  logout: () => {
    set({ currentUser: null });
    if (typeof window !== "undefined") localStorage.removeItem("cq_current_user");
  },

  register: async (username, email, password, avatar) => {
    const { data: existing } = await supabase.from("users").select("id").eq("email", email).single();
    if (existing) return { success: false, error: "Email already in use" };

    const { data: existingUser } = await supabase.from("users").select("id").eq("username", username).single();
    if (existingUser) return { success: false, error: "Username already taken" };

    const newUser = {
      id: `user-${Date.now()}`,
      username, email, password,
      role: "user", avatar, level: 1, xp: 0,
      completed_questions: [],
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("users").insert(newUser).select().single();
    if (error || !data) return { success: false, error: "Registration failed" };

    const user = dbToUser(data);
    set(state => ({ currentUser: user, users: [...state.users, user] }));
    if (typeof window !== "undefined") localStorage.setItem("cq_current_user", JSON.stringify(user));
    return { success: true };
  },

  completeQuestion: async (questionId, xpEarned) => {
    const { currentUser } = get();
    if (!currentUser) return;
    if (currentUser.completedQuestions.includes(questionId)) return;

    const newXP = currentUser.xp + xpEarned;
    const newLevel = xpToLevel(newXP);
    const newCompleted = [...currentUser.completedQuestions, questionId];

    await supabase.from("users").update({
      xp: newXP, level: newLevel,
      completed_questions: newCompleted,
      last_active: new Date().toISOString()
    }).eq("id", currentUser.id);

    const updated = { ...currentUser, xp: newXP, level: newLevel, completedQuestions: newCompleted, lastActive: new Date().toISOString() };
    set(state => ({
      currentUser: updated,
      users: state.users.map(u => u.id === currentUser.id ? updated : u)
    }));
    if (typeof window !== "undefined") localStorage.setItem("cq_current_user", JSON.stringify(updated));
  },

  updateUserXP: async (userId, xp) => {
    const newLevel = xpToLevel(xp);
    await supabase.from("users").update({ xp, level: newLevel }).eq("id", userId);
    set(state => ({
      users: state.users.map(u => u.id === userId ? { ...u, xp, level: newLevel } : u),
      currentUser: state.currentUser?.id === userId ? { ...state.currentUser, xp, level: newLevel } : state.currentUser
    }));
  },

  deleteUser: async (userId) => {
    await supabase.from("users").delete().eq("id", userId);
    set(state => ({ users: state.users.filter(u => u.id !== userId) }));
  },

  getLeaderboard: () => get().users.filter(u => u.role === "user").sort((a, b) => b.xp - a.xp).slice(0, 10),

  getActiveUsers: () => {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    return get().users.filter(u => u.role === "user" && u.lastActive && u.lastActive > cutoff);
  },
}));

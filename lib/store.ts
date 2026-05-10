"use client";
import { create } from "zustand";
import { User, DEFAULT_USERS, xpToLevel, QUESTIONS } from "./data";

interface AuthStore {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => { success: boolean; error?: string; role?: string };
  logout: () => void;
  register: (username: string, email: string, password: string, avatar: string) => { success: boolean; error?: string };
  completeQuestion: (questionId: number, xpEarned: number) => void;
  updateQuestion: (id: number, updates: Partial<import("./data").Question>) => void;
  deleteQuestion: (id: number) => void;
  updateUserXP: (userId: string, xp: number) => void;
  deleteUser: (userId: string) => void;
  getLeaderboard: () => User[];
  getActiveUsers: () => User[];
  initStore: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  currentUser: null,
  users: [],

  initStore: () => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("cq_users");
    const savedUser = localStorage.getItem("cq_current_user");
    let users: User[];
    if (saved) {
      users = JSON.parse(saved);
    } else {
      users = DEFAULT_USERS;
      localStorage.setItem("cq_users", JSON.stringify(users));
    }
    let currentUser: User | null = null;
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      currentUser = users.find(u => u.id === parsed.id) || null;
    }
    set({ users, currentUser });
  },

  login: (email, password) => {
    const { users } = get();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { success: false, error: "Invalid email or password" };
    // Mark lastActive
    const now = new Date().toISOString();
    const updatedUser = { ...user, lastActive: now };
    const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
    set({ currentUser: updatedUser, users: updatedUsers });
    localStorage.setItem("cq_users", JSON.stringify(updatedUsers));
    localStorage.setItem("cq_current_user", JSON.stringify(updatedUser));
    return { success: true, role: user.role };
  },

  logout: () => {
    set({ currentUser: null });
    localStorage.removeItem("cq_current_user");
  },

  register: (username, email, password, avatar) => {
    const { users } = get();
    if (users.find(u => u.email === email)) return { success: false, error: "Email already in use" };
    if (users.find(u => u.username === username)) return { success: false, error: "Username already taken" };
    const newUser: User = {
      id: `user-${Date.now()}`, username, email, password,
      role: "user", avatar, level: 1, xp: 0,
      completedQuestions: [], createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
    const updated = [...users, newUser];
    set({ users: updated, currentUser: newUser });
    localStorage.setItem("cq_users", JSON.stringify(updated));
    localStorage.setItem("cq_current_user", JSON.stringify(newUser));
    return { success: true };
  },

  completeQuestion: (questionId, xpEarned) => {
    const { currentUser, users } = get();
    if (!currentUser) return;
    if (currentUser.completedQuestions.includes(questionId)) return;
    const newXP = currentUser.xp + xpEarned;
    const newLevel = xpToLevel(newXP);
    const updated = { ...currentUser, xp: newXP, level: newLevel, completedQuestions: [...currentUser.completedQuestions, questionId], lastActive: new Date().toISOString() };
    const updatedUsers = users.map(u => u.id === currentUser.id ? updated : u);
    set({ currentUser: updated, users: updatedUsers });
    localStorage.setItem("cq_users", JSON.stringify(updatedUsers));
    localStorage.setItem("cq_current_user", JSON.stringify(updated));
  },

  updateUserXP: (userId, xp) => {
    const { users, currentUser } = get();
    const updatedUsers = users.map(u => u.id === userId ? { ...u, xp, level: xpToLevel(xp) } : u);
    const updatedCurrent = currentUser?.id === userId ? { ...currentUser, xp, level: xpToLevel(xp) } : currentUser;
    set({ users: updatedUsers, currentUser: updatedCurrent });
    localStorage.setItem("cq_users", JSON.stringify(updatedUsers));
    if (updatedCurrent) localStorage.setItem("cq_current_user", JSON.stringify(updatedCurrent));
  },

  deleteUser: (userId) => {
    const { users } = get();
    const updated = users.filter(u => u.id !== userId);
    set({ users: updated });
    localStorage.setItem("cq_users", JSON.stringify(updated));
  },

  updateQuestion: (id, updates) => {
    const saved = localStorage.getItem("cq_questions");
    const questions = saved ? JSON.parse(saved) : QUESTIONS;
    const updated = questions.map((q: import("./data").Question) => q.id === id ? { ...q, ...updates } : q);
    localStorage.setItem("cq_questions", JSON.stringify(updated));
  },

  deleteQuestion: (id) => {
    const saved = localStorage.getItem("cq_questions");
    const questions = saved ? JSON.parse(saved) : QUESTIONS;
    const updated = questions.filter((q: import("./data").Question) => q.id !== id);
    localStorage.setItem("cq_questions", JSON.stringify(updated));
  },

  getLeaderboard: () => get().users.filter(u => u.role === "user").sort((a, b) => b.xp - a.xp).slice(0, 10),

  // Active = logged in within last 7 days
  getActiveUsers: () => {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    return get().users.filter(u => u.role === "user" && u.lastActive && u.lastActive > cutoff);
  },
}));

"use client";
import { create } from "zustand";
import { User, DEFAULT_USERS, xpToLevel, QUESTIONS, Question } from "./data";

async function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url === "YOUR_SUPABASE_URL" || url === "") return null;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    return createClient(url, key);
  } catch { return null; }
}

interface AuthStore {
  currentUser: User | null;
  users: User[];
  questions: Question[];
  theme: "dark" | "light";
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  logout: () => void;
  register: (username: string, email: string, password: string, avatar: string) => Promise<{ success: boolean; error?: string }>;
  completeQuestion: (questionId: number, xpEarned: number) => void;
  updateQuestion: (id: number, updates: Partial<Question>) => void;
  deleteQuestion: (id: number) => void;
  addQuestion: (q: Question) => void;
  updateUserXP: (userId: string, xp: number) => void;
  deleteUser: (userId: string) => void;
  getLeaderboard: () => User[];
  getActiveUsers: () => User[];
  initStore: () => Promise<void>;
  toggleTheme: () => void;
}

const LS = {
  getUsers: (): User[] => { try { const s = localStorage.getItem("cq_users"); return s ? JSON.parse(s) : [...DEFAULT_USERS]; } catch { return [...DEFAULT_USERS]; } },
  setUsers: (u: User[]) => { try { localStorage.setItem("cq_users", JSON.stringify(u)); } catch {} },
  getCurrentUser: (): User | null => { try { const s = localStorage.getItem("cq_current_user"); return s ? JSON.parse(s) : null; } catch { return null; } },
  setCurrentUser: (u: User | null) => { try { if (u) localStorage.setItem("cq_current_user", JSON.stringify(u)); else localStorage.removeItem("cq_current_user"); } catch {} },
  getQuestions: (): Question[] => { try { const s = localStorage.getItem("cq_questions"); return s ? JSON.parse(s) : QUESTIONS; } catch { return QUESTIONS; } },
  setQuestions: (q: Question[]) => { try { localStorage.setItem("cq_questions", JSON.stringify(q)); } catch {} },
  getTheme: (): "dark" | "light" => { try { return (localStorage.getItem("cq_theme") as "dark" | "light") || "dark"; } catch { return "dark"; } },
  setTheme: (t: "dark" | "light") => { try { localStorage.setItem("cq_theme", t); } catch {} },
};

async function sbFetch(table: string) {
  const sb = await getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from(table).select("*");
  if (error) { console.warn("Supabase fetch " + table + ":", error.message); return null; }
  return data;
}
async function sbUpsert(table: string, row: object, key = "id") {
  const sb = await getSupabase();
  if (!sb) return;
  const { error } = await sb.from(table).upsert(row, { onConflict: key });
  if (error) console.warn("Supabase upsert " + table + ":", error.message);
}
async function sbDelete(table: string, field: string, value: string | number) {
  const sb = await getSupabase();
  if (!sb) return;
  const { error } = await sb.from(table).delete().eq(field, value);
  if (error) console.warn("Supabase delete " + table + ":", error.message);
}

function applyTheme(t: "dark" | "light") {
  document.documentElement.setAttribute("data-theme", t);
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  currentUser: null,
  users: [],
  questions: QUESTIONS,
  theme: "dark",
  loading: false,

  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    set({ theme: next });
    if (typeof window !== "undefined") { LS.setTheme(next); applyTheme(next); }
  },

  initStore: async () => {
    if (typeof window === "undefined") return;
    set({ loading: true });
    const savedTheme = LS.getTheme();
    set({ theme: savedTheme });
    applyTheme(savedTheme);

    const [sbUsers, sbQuestions] = await Promise.all([sbFetch("users"), sbFetch("questions")]);

    let users: User[];
    if (sbUsers && sbUsers.length > 0) {
      users = sbUsers as User[];
      LS.setUsers(users);
    } else {
      users = LS.getUsers();
      if (users.length === 0) {
        users = [...DEFAULT_USERS];
        LS.setUsers(users);
        for (const u of users) await sbUpsert("users", u);
      }
    }

    let questions: Question[];
    if (sbQuestions && sbQuestions.length > 0) {
      questions = sbQuestions as Question[];
      LS.setQuestions(questions);
    } else {
      questions = LS.getQuestions();
    }

    const saved = LS.getCurrentUser();
    let currentUser: User | null = null;
    if (saved) {
      currentUser = users.find(u => u.id === saved.id) || null;
      if (currentUser) LS.setCurrentUser(currentUser);
    }

    set({ users, questions, currentUser, loading: false });
  },

  login: async (email, password) => {
    // Always re-fetch from Supabase so any device sees the latest users
    const sbUsers = await sbFetch("users");
    let users = sbUsers && sbUsers.length > 0 ? (sbUsers as User[]) : LS.getUsers();
    LS.setUsers(users);
    set({ users });

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) return { success: false, error: "Invalid email or password. Make sure you registered on this website." };

    const now = new Date().toISOString();
    const updated = { ...user, lastActive: now };
    const updatedUsers = users.map(u => u.id === user.id ? updated : u);
    set({ currentUser: updated, users: updatedUsers });
    LS.setUsers(updatedUsers);
    LS.setCurrentUser(updated);
    await sbUpsert("users", updated);
    return { success: true, role: user.role };
  },

  logout: () => { set({ currentUser: null }); LS.setCurrentUser(null); },

  register: async (username, email, password, avatar) => {
    const sbUsers = await sbFetch("users");
    let users = sbUsers && sbUsers.length > 0 ? (sbUsers as User[]) : LS.getUsers();
    set({ users });

    if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
      return { success: false, error: "Email already in use" };
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase()))
      return { success: false, error: "Username already taken" };

    const newUser: User = {
      id: `user-${Date.now()}`, username, email, password,
      role: "user", avatar, level: 1, xp: 0,
      completedQuestions: [], createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
    const updated = [...users, newUser];
    set({ users: updated, currentUser: newUser });
    LS.setUsers(updated);
    LS.setCurrentUser(newUser);
    await sbUpsert("users", newUser);
    return { success: true };
  },

  completeQuestion: async (questionId, xpEarned) => {
    const { currentUser, users } = get();
    if (!currentUser || currentUser.completedQuestions.includes(questionId)) return;
    const newXP = currentUser.xp + xpEarned;
    const updated = { ...currentUser, xp: newXP, level: xpToLevel(newXP), completedQuestions: [...currentUser.completedQuestions, questionId], lastActive: new Date().toISOString() };
    const updatedUsers = users.map(u => u.id === currentUser.id ? updated : u);
    set({ currentUser: updated, users: updatedUsers });
    LS.setUsers(updatedUsers); LS.setCurrentUser(updated);
    await sbUpsert("users", updated);
  },

  updateUserXP: async (userId, xp) => {
    const { users, currentUser } = get();
    const updatedUsers = users.map(u => u.id === userId ? { ...u, xp, level: xpToLevel(xp) } : u);
    const target = updatedUsers.find(u => u.id === userId);
    const updatedCurrent = currentUser?.id === userId ? { ...currentUser, xp, level: xpToLevel(xp) } : currentUser;
    set({ users: updatedUsers, currentUser: updatedCurrent });
    LS.setUsers(updatedUsers);
    if (updatedCurrent) LS.setCurrentUser(updatedCurrent);
    if (target) await sbUpsert("users", target);
  },

  deleteUser: async (userId) => {
    const updated = get().users.filter(u => u.id !== userId);
    set({ users: updated }); LS.setUsers(updated);
    await sbDelete("users", "id", userId);
  },

  updateQuestion: async (id, updates) => {
    const updated = get().questions.map(q => q.id === id ? { ...q, ...updates } : q);
    set({ questions: updated }); LS.setQuestions(updated);
    const target = updated.find(q => q.id === id);
    if (target) await sbUpsert("questions", target);
  },

  deleteQuestion: async (id) => {
    const updated = get().questions.filter(q => q.id !== id);
    set({ questions: updated }); LS.setQuestions(updated);
    await sbDeleteQuestion(id);
  },

  addQuestion: async (q) => {
    const updated = [...get().questions, q];
    set({ questions: updated }); LS.setQuestions(updated);
    await sbUpsert("questions", q);
  },

  getLeaderboard: () => get().users.filter(u => u.role === "user").sort((a, b) => b.xp - a.xp).slice(0, 10),
  getActiveUsers: () => {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    return get().users.filter(u => u.role === "user" && u.lastActive && u.lastActive > cutoff);
  },
}));

async function sbDeleteQuestion(id: number) { await sbDelete("questions", "id", id); }

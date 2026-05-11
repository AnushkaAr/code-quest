"use client";
import { create } from "zustand";
import { User, xpToLevel, QUESTIONS, Question } from "./data";

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
  logout: () => Promise<void>;
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

    // Load questions
    const sbQuestions = await sbFetch("questions");
    let questions: Question[];
    if (sbQuestions && sbQuestions.length > 0) {
      questions = sbQuestions as Question[];
      LS.setQuestions(questions);
    } else {
      questions = LS.getQuestions();
    }

    // Load all users for leaderboard/admin
    const sbUsers = await sbFetch("users");
    const users: User[] = sbUsers ? (sbUsers as User[]) : [];

    // Check if user is already logged in via Supabase Auth session
    const sb = await getSupabase();
    let currentUser: User | null = null;

    if (sb) {
      const { data: { session } } = await sb.auth.getSession();
      if (session?.user) {
        // FIX: Use toString() to match text id in public.users
        const { data: profile } = await sb.from("users").select("*").eq("id", session.user.id.toString()).single();
        if (profile) {
          currentUser = profile as User;
          LS.setCurrentUser(currentUser);
        }
      }
    }

    // Fallback to localStorage if no session
    if (!currentUser) {
      const saved = LS.getCurrentUser();
      if (saved) {
        currentUser = users.find(u => u.id === saved.id) || null;
      }
    }

    set({ users, questions, currentUser, loading: false });
  },

  login: async (email, password) => {
    const sb = await getSupabase();
    if (!sb) return { success: false, error: "Connection error. Please try again." };

    // Sign in with Supabase Auth
    const { data, error } = await sb.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return { success: false, error: "Invalid email or password." };
    }

    // FIX: Use toString() to match text id in public.users
    const { data: profile, error: profileError } = await sb
      .from("users")
      .select("*")
      .eq("id", data.user.id.toString())
      .single();

    if (profileError || !profile) {
      // FIX: Auto-create profile if missing instead of failing
      const newUser: User = {
        id: data.user.id.toString(),
        username: data.user.email?.split("@")[0] || "user",
        email: data.user.email || email,
        role: "user",
        avatar: "",
        level: 1,
        xp: 0,
        completedQuestions: [],
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
      await sbUpsert("users", newUser);
      const { users } = get();
      set({ currentUser: newUser, users: [...users, newUser] });
      LS.setCurrentUser(newUser);
      return { success: true, role: "user" };
    }

    const user = profile as User;

    // Update lastActive
    const now = new Date().toISOString();
    const updated = { ...user, lastActive: now };
    await sbUpsert("users", updated);

    // Update users list
    const { users } = get();
    const updatedUsers = users.map(u => u.id === updated.id ? updated : u);
    if (!updatedUsers.find(u => u.id === updated.id)) updatedUsers.push(updated);

    set({ currentUser: updated, users: updatedUsers });
    LS.setCurrentUser(updated);

    return { success: true, role: user.role };
  },

  logout: async () => {
    const sb = await getSupabase();
    if (sb) await sb.auth.signOut();
    set({ currentUser: null });
    LS.setCurrentUser(null);
  },

  register: async (username, email, password, avatar) => {
    const sb = await getSupabase();
    if (!sb) return { success: false, error: "Connection error. Please try again." };

    // Check if username already taken
    const { data: existingUsername } = await sb.from("users").select("id").eq("username", username).single();
    if (existingUsername) return { success: false, error: "Username already taken" };

    // Sign up with Supabase Auth
    const { data, error } = await sb.auth.signUp({ email, password });

    if (error) {
      if (error.message.includes("already registered")) {
        return { success: false, error: "Email already in use" };
      }
      return { success: false, error: error.message };
    }

    if (!data.user) return { success: false, error: "Registration failed. Please try again." };

    // FIX: Use toString() to ensure id is text type matching public.users
    const newUser: User = {
      id: data.user.id.toString(),
      username,
      email,
      role: "user",
      avatar,
      level: 1,
      xp: 0,
      completedQuestions: [],
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    await sbUpsert("users", newUser);

    const { users } = get();
    const updatedUsers = [...users, newUser];
    set({ users: updatedUsers, currentUser: newUser });
    LS.setCurrentUser(newUser);

    return { success: true };
  },

  completeQuestion: async (questionId, xpEarned) => {
    const { currentUser, users } = get();
    if (!currentUser || currentUser.completedQuestions.includes(questionId)) return;

    const newXP = currentUser.xp + xpEarned;
    const updated = {
      ...currentUser,
      xp: newXP,
      level: xpToLevel(newXP),
      completedQuestions: [...currentUser.completedQuestions, questionId],
      lastActive: new Date().toISOString(),
    };
    const updatedUsers = users.map(u => u.id === currentUser.id ? updated : u);
    set({ currentUser: updated, users: updatedUsers });
    LS.setCurrentUser(updated);
    await sbUpsert("users", updated);
  },

  updateUserXP: async (userId, xp) => {
    const { users, currentUser } = get();
    const updatedUsers = users.map(u => u.id === userId ? { ...u, xp, level: xpToLevel(xp) } : u);
    const target = updatedUsers.find(u => u.id === userId);
    const updatedCurrent = currentUser?.id === userId ? { ...currentUser, xp, level: xpToLevel(xp) } : currentUser;
    set({ users: updatedUsers, currentUser: updatedCurrent });
    if (updatedCurrent) LS.setCurrentUser(updatedCurrent);
    if (target) await sbUpsert("users", target);
  },

  deleteUser: async (userId) => {
    const updated = get().users.filter(u => u.id !== userId);
    set({ users: updated });
    await sbDelete("users", "id", userId);
  },

  updateQuestion: async (id, updates) => {
    const updated = get().questions.map(q => q.id === id ? { ...q, ...updates } : q);
    set({ questions: updated });
    LS.setQuestions(updated);
    const target = updated.find(q => q.id === id);
    if (target) await sbUpsert("questions", target);
  },

  deleteQuestion: async (id) => {
    const updated = get().questions.filter(q => q.id !== id);
    set({ questions: updated });
    LS.setQuestions(updated);
    await sbDelete("questions", "id", id);
  },

  addQuestion: async (q) => {
    const updated = [...get().questions, q];
    set({ questions: updated });
    LS.setQuestions(updated);
    await sbUpsert("questions", q);
  },

  getLeaderboard: () => get().users.filter(u => u.role === "user").sort((a, b) => b.xp - a.xp).slice(0, 10),

  getActiveUsers: () => {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    return get().users.filter(u => u.role === "user" && u.lastActive && u.lastActive > cutoff);
  },
}));

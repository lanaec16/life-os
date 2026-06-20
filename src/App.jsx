import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase connection ──────────────────────────────────────
const supabaseUrl = "https://pdaxkxbtcohfbgdcdgiy.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkYXhreGJ0Y29oZmJnZGNkZ2l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MDE2MTQsImV4cCI6MjA5NzQ3NzYxNH0.qzFctVbkq5I0vYX-5ZADGteBJx5foP6iWaOr6_Kt0OA";
const supabase = createClient(supabaseUrl, supabaseKey);

// ── Palette ──────────────────────────────────────────────────
const p = {
  lavBg:    "#EDE6F7",
  lavMid:   "#D4C8ED",
  lavDeep:  "#BBA8E0",
  lavCard:  "#F5F0FC",
  lavSoft:  "#EEE8F8",
  surface:  "#F9F6FE",
  border:   "#D8CEEE",
  purple:   "#9B7FCC",
  deep:     "#6B4FA0",
  text:     "#4A3660",
  muted:    "#9A85B8",
  pink:     "#D4889A",
  pinkSoft: "#F9EEF2",
  mint:     "#7ABFB0",
  mintSoft: "#E4F4F1",
  gold:     "#C4964A",
  goldSoft: "#FAF0DC",
  white:    "#FFFFFF",
};

function getWeekStart(d = new Date()) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ── AUTH SCREEN ───────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) { setError(error.message); return; }
      if (data?.user && !data?.session) {
        setInfo("Check your email to confirm your account, then sign in.");
        setMode("signin");
        return;
      }
      onLogin(data.session);
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { setError(error.message); return; }
      onLogin(data.session);
    }
  }

  return (
    <div style={{
      background: p.lavBg, minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", padding: 20,
    }}>
      <div style={{
        background: p.lavCard, border: `1.5px solid ${p.border}`,
        borderRadius: 20, padding: "36px 32px", maxWidth: 380, width: "100%",
        boxShadow: "0 8px 32px rgba(155,127,204,0.15)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 38, marginBottom: 8 }}>🧬</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: p.deep, letterSpacing: "-0.02em" }}>Life OS</div>
          <div style={{ fontSize: 12, color: p.muted, marginTop: 4 }}>
            {mode === "signin" ? "Welcome back ✦" : "Let's set up your space 🌙"}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: p.muted, display: "block", marginBottom: 5 }}>Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              style={{
                width: "100%", background: p.lavSoft, border: `1.5px solid ${p.lavMid}`,
                borderRadius: 10, padding: "10px 14px", fontSize: 13, color: p.text,
                fontFamily: "inherit", outline: "none",
              }}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: p.muted, display: "block", marginBottom: 5 }}>Password</label>
            <input
              type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
              style={{
                width: "100%", background: p.lavSoft, border: `1.5px solid ${p.lavMid}`,
                borderRadius: 10, padding: "10px 14px", fontSize: 13, color: p.text,
                fontFamily: "inherit", outline: "none",
              }}
            />
          </div>

          {error && (
            <div style={{ background: p.pinkSoft, border: `1px solid #D4889A55`, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#A05060", marginBottom: 14 }}>
              {error}
            </div>
          )}
          {info && (
            <div style={{ background: p.mintSoft, border: `1px solid ${p.mint}55`, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#3A7A6A", marginBottom: 14 }}>
              {info}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "11px", borderRadius: 10, border: "none",
            background: p.purple, color: p.white, fontSize: 13, fontWeight: 700,
            cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 12, color: p.muted }}>
          {mode === "signin" ? (
            <>New here? <button onClick={() => { setMode("signup"); setError(""); setInfo(""); }} style={{ background: "none", border: "none", color: p.purple, fontWeight: 700, cursor: "pointer", fontSize: 12 }}>Create an account</button></>
          ) : (
            <>Already have one? <button onClick={() => { setMode("signin"); setError(""); setInfo(""); }} style={{ background: "none", border: "none", color: p.purple, fontWeight: 700, cursor: "pointer", fontSize: 12 }}>Sign in</button></>
          )}
        </div>
      </div>
    </div>
  );
}

// ── HOME DASHBOARD ────────────────────────────────────────────
function HomeDashboard({ session, onLogout }) {
  const userId = session.user.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const [daily, setDaily] = useState({ health_win: "", work_win: "", future_win: "", energy_level: 2, completed: false });
  const [weekly, setWeekly] = useState({ big3_1: "", big3_2: "", big3_3: "", completion_score: "" });
  const [quarterGoals, setQuarterGoals] = useState([]);

  const today = todayStr();
  const weekStart = getWeekStart();

  // Load everything on mount
  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: d } = await supabase.from("daily_entries").select("*").eq("user_id", userId).eq("entry_date", today).maybeSingle();
      if (d) setDaily(d);

      const { data: w } = await supabase.from("weekly_plans").select("*").eq("user_id", userId).eq("week_start", weekStart).maybeSingle();
      if (w) setWeekly(w);

      const { data: q } = await supabase.from("quarterly_goals").select("*").eq("user_id", userId).order("created_at", { ascending: true });
      setQuarterGoals(q || []);

      setLoading(false);
    }
    load();
  }, [userId, today, weekStart]);

  async function saveDaily(patch) {
    const next = { ...daily, ...patch };
    setDaily(next);
    setSaving(true);
    await supabase.from("daily_entries").upsert({
      user_id: userId,
      entry_date: today,
      health_win: next.health_win,
      work_win: next.work_win,
      future_win: next.future_win,
      energy_level: next.energy_level,
      completed: next.completed,
    }, { onConflict: "user_id,entry_date" });
    setSaving(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  }

  async function saveWeekly(patch) {
    const next = { ...weekly, ...patch };
    setWeekly(next);
    setSaving(true);
    await supabase.from("weekly_plans").upsert({
      user_id: userId,
      week_start: weekStart,
      big3_1: next.big3_1,
      big3_2: next.big3_2,
      big3_3: next.big3_3,
      completion_score: next.completion_score,
    }, { onConflict: "user_id,week_start" });
    setSaving(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  }

  async function ensureQuarterGoals() {
    // Create 4 blank goals for this quarter if none exist
    const quarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`;
    const cats = [
      { category: "Health", icon: "💪" },
      { category: "Career", icon: "🚀" },
      { category: "Wealth", icon: "💰" },
      { category: "Life", icon: "🌱" },
    ];
    const rows = cats.map(c => ({
      user_id: userId,
      quarter_label: quarter,
      category: c.category,
      goal: "",
      progress_pct: 0,
      status: "Not Started",
    }));
    const { data } = await supabase.from("quarterly_goals").insert(rows).select();
    setQuarterGoals(data || []);
  }

  async function updateGoal(id, patch) {
    setQuarterGoals(prev => prev.map(g => g.id === id ? { ...g, ...patch } : g));
    await supabase.from("quarterly_goals").update(patch).eq("id", id);
  }

  if (loading) {
    return (
      <div style={{ background: p.lavBg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter,sans-serif" }}>
        <div style={{ textAlign: "center", color: p.muted }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🌙</div>
          <div style={{ fontSize: 13 }}>Loading your space...</div>
        </div>
      </div>
    );
  }

  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ background: p.lavBg, minHeight: "100vh", color: p.text, fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: ${p.lavDeep}; }
        input, textarea { outline: none; font-family: inherit; }
      `}</style>

      {/* Header */}
      <div style={{ background: p.surface, borderBottom: `1.5px solid ${p.border}`, padding: "16px 20px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: p.deep }}>🧬 {greeting} ✦</div>
            <div style={{ fontSize: 11, color: p.muted, marginTop: 2 }}>{session.user.email}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {savedFlash && <span style={{ fontSize: 11, color: p.mint, fontWeight: 700 }}>✓ saved</span>}
            <button onClick={() => supabase.auth.signOut().then(onLogout)} style={{
              padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${p.border}`,
              background: "transparent", color: p.muted, fontSize: 11, fontWeight: 600, cursor: "pointer",
            }}>Sign out</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 20px 60px" }}>

        {/* Today's Big 3 */}
        <div style={{ background: p.lavCard, border: `1.5px solid ${p.border}`, borderRadius: 18, padding: "20px 22px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
            <span style={{ fontSize: 15 }}>☀️</span>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: p.gold }}>Today's Big 3</span>
          </div>

          {[
            { key: "health_win", icon: "💪", label: "Health Win", color: p.pink },
            { key: "work_win", icon: "🚀", label: "Work Win", color: p.purple },
            { key: "future_win", icon: "✨", label: "Future Win", color: p.gold },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: f.color, marginBottom: 4 }}>{f.icon} {f.label}</div>
              <input
                value={daily[f.key] || ""}
                onChange={e => setDaily(d => ({ ...d, [f.key]: e.target.value }))}
                onBlur={() => saveDaily({ [f.key]: daily[f.key] })}
                placeholder="What's one thing..."
                style={{
                  width: "100%", background: p.lavSoft, border: `1.5px solid ${p.lavMid}`,
                  borderRadius: 10, padding: "8px 12px", fontSize: 13, color: p.text,
                }}
              />
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: p.muted, fontWeight: 600 }}>Energy</span>
              {[1, 2, 3].map(n => (
                <button key={n} onClick={() => saveDaily({ energy_level: n })} style={{
                  width: 24, height: 24, borderRadius: "50%", border: "none", cursor: "pointer", fontSize: 11,
                  background: (daily.energy_level || 0) >= n ? p.lavDeep : p.lavMid,
                  transition: "all 0.2s",
                }}>🔋</button>
              ))}
            </div>
            <button onClick={() => saveDaily({ completed: !daily.completed })} style={{
              padding: "6px 16px", borderRadius: 20, border: "none", cursor: "pointer",
              background: daily.completed ? p.purple : p.lavMid,
              color: daily.completed ? p.white : p.muted,
              fontSize: 11, fontWeight: 700, transition: "all 0.2s",
            }}>{daily.completed ? "✓ Done today!" : "Mark done"}</button>
          </div>
        </div>

        {/* This Week's Big 3 */}
        <div style={{ background: p.lavCard, border: `1.5px solid ${p.border}`, borderRadius: 18, padding: "20px 22px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
            <span style={{ fontSize: 15 }}>📋</span>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: p.purple }}>This Week's Big 3</span>
          </div>
          {["big3_1", "big3_2", "big3_3"].map((key, i) => (
            <input
              key={key}
              value={weekly[key] || ""}
              onChange={e => setWeekly(w => ({ ...w, [key]: e.target.value }))}
              onBlur={() => saveWeekly({ [key]: weekly[key] })}
              placeholder={`Big 3 #${i + 1}...`}
              style={{
                width: "100%", background: p.lavSoft, border: `1.5px solid ${p.lavMid}`,
                borderRadius: 10, padding: "8px 12px", fontSize: 13, color: p.text, marginBottom: 8,
              }}
            />
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            {[["🟢 Full", "full"], ["🟡 Partial", "partial"], ["🔴 Low", "low"]].map(([label, val]) => (
              <button key={val} onClick={() => saveWeekly({ completion_score: val })} style={{
                padding: "5px 12px", borderRadius: 14, fontSize: 10, fontWeight: 600, cursor: "pointer",
                background: weekly.completion_score === val ? p.mint + "55" : "transparent",
                border: `1.5px solid ${weekly.completion_score === val ? p.mint : p.lavMid}`,
                color: weekly.completion_score === val ? "#3A7A6A" : p.muted,
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Quarterly Goals */}
        <div style={{ background: p.lavCard, border: `1.5px solid ${p.border}`, borderRadius: 18, padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
            <span style={{ fontSize: 15 }}>🎯</span>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: p.deep }}>This Quarter</span>
          </div>

          {quarterGoals.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 12, color: p.muted, marginBottom: 12 }}>No goals set for this quarter yet.</div>
              <button onClick={ensureQuarterGoals} style={{
                padding: "8px 18px", borderRadius: 10, border: "none",
                background: p.purple, color: p.white, fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>Set up this quarter</button>
            </div>
          ) : (
            quarterGoals.map(g => {
              const colorMap = { Health: p.pink, Career: p.purple, Wealth: p.gold, Life: p.mint };
              const color = colorMap[g.category] || p.purple;
              return (
                <div key={g.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color }}>{g.category}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color }}>{g.progress_pct}%</span>
                  </div>
                  <input
                    value={g.goal || ""}
                    onChange={e => setQuarterGoals(prev => prev.map(x => x.id === g.id ? { ...x, goal: e.target.value } : x))}
                    onBlur={() => updateGoal(g.id, { goal: g.goal })}
                    placeholder={`${g.category} goal...`}
                    style={{ width: "100%", background: p.lavSoft, border: `1.5px solid ${p.lavMid}`, borderRadius: 8, padding: "6px 10px", fontSize: 12, color: p.text, marginBottom: 6 }}
                  />
                  <input
                    type="range" min="0" max="100" value={g.progress_pct || 0}
                    onChange={e => updateGoal(g.id, { progress_pct: parseInt(e.target.value) })}
                    style={{ width: "100%", accentColor: color }}
                  />
                </div>
              );
            })
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: p.muted }}>
          🐱 More hubs (Health, Career, Wealth, Future Vision, Relationships, Wins) coming next ✦
        </div>
      </div>
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <div style={{ background: p.lavBg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 28 }}>🌙</div>
      </div>
    );
  }

  if (!session) return <AuthScreen onLogin={setSession} />;
  return <HomeDashboard session={session} onLogout={() => setSession(null)} />;
}

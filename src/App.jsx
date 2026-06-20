import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase connection ──────────────────────────────────────
const supabaseUrl = "https://pdaxkxbtcohfbgdcdgiy.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkYXhreGJ0Y29oZmJnZGNkZ2l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MDE2MTQsImV4cCI6MjA5NzQ3NzYxNH0.qzFctVbkq5I0vYX-5ZADGteBJx5foP6iWaOr6_Kt0OA";
const supabase = createClient(supabaseUrl, supabaseKey);

// ── Palette ──────────────────────────────────────────────────
const p = {
  lavBg: "#EDE6F7", lavMid: "#D4C8ED", lavDeep: "#BBA8E0", lavCard: "#F5F0FC",
  lavSoft: "#EEE8F8", surface: "#F9F6FE", border: "#D8CEEE",
  purple: "#9B7FCC", deep: "#6B4FA0", text: "#4A3660", muted: "#9A85B8",
  pink: "#D4889A", pinkSoft: "#F9EEF2", mint: "#7ABFB0", mintSoft: "#E4F4F1",
  gold: "#C4964A", goldSoft: "#FAF0DC", rose: "#C86B7A", sky: "#7AAFD4",
  skySoft: "#E4F0FA", white: "#FFFFFF",
};

function getWeekStart(d = new Date()) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}
function todayStr() { return new Date().toISOString().slice(0, 10); }
function monthLabel(d = new Date()) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }
function quarterLabel(d = new Date()) { return `Q${Math.ceil((d.getMonth() + 1) / 3)} ${d.getFullYear()}`; }

// ── shared bits ───────────────────────────────────────────────
function Card({ children, style = {} }) {
  return <div style={{ background: p.lavCard, border: `1.5px solid ${p.border}`, borderRadius: 18, padding: "20px 22px", marginBottom: 16, ...style }}>{children}</div>;
}
function Label({ icon, text, color = p.purple }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color }}>{text}</span>
    </div>
  );
}
function TextField({ value, onChange, onBlur, onKeyDown, placeholder, style = {} }) {
  return (
    <input
      value={value || ""} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} placeholder={placeholder}
      style={{ boxSizing: "border-box", width: "100%", background: p.lavSoft, border: `1.5px solid ${p.lavMid}`, borderRadius: 10, padding: "9px 13px", fontSize: 13, color: p.text, fontFamily: "inherit", outline: "none", ...style }}
    />
  );
}
function NumField({ value, onChange, onBlur, placeholder, style = {} }) {
  return (
    <input
      type="number" value={value ?? ""} onChange={onChange} onBlur={onBlur} placeholder={placeholder}
      style={{ boxSizing: "border-box", width: "100%", background: p.lavSoft, border: `1.5px solid ${p.lavMid}`, borderRadius: 10, padding: "9px 13px", fontSize: 13, color: p.text, fontFamily: "inherit", outline: "none", ...style }}
    />
  );
}
function Pill({ color, bg, active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer",
      border: `1.5px solid ${active ? color : p.border}`,
      background: active ? (bg || color + "22") : p.lavCard,
      color: active ? color : p.muted, transition: "all 0.15s",
    }}>{children}</button>
  );
}
function SaveFlash({ show }) {
  if (!show) return null;
  return <span style={{ fontSize: 11, color: p.mint, fontWeight: 700 }}>✓ saved</span>;
}
function Loading() {
  return <div style={{ textAlign: "center", padding: "60px 0", color: p.muted }}><div style={{ fontSize: 28, marginBottom: 8 }}>🌙</div>Loading...</div>;
}
function Empty({ text }) {
  return <div style={{ textAlign: "center", padding: "30px 0", color: p.muted, fontSize: 12 }}>{text}</div>;
}

// ════════════════════════════════════════════════════════════
// AUTH SCREEN
// ════════════════════════════════════════════════════════════
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setInfo(""); setLoading(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) { setError(error.message); return; }
      if (data?.user && !data?.session) { setInfo("Check your email to confirm your account, then sign in."); setMode("signin"); return; }
      onLogin(data.session);
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { setError(error.message); return; }
      onLogin(data.session);
    }
  }

  return (
    <div style={{ background: p.lavBg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", padding: 20 }}>
      <div style={{ background: p.lavCard, border: `1.5px solid ${p.border}`, borderRadius: 24, padding: "48px 48px", maxWidth: 440, width: "100%", boxShadow: "0 8px 32px rgba(155,127,204,0.15)", boxSizing: "border-box" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8, lineHeight: 1 }}>🧬</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: p.deep, letterSpacing: "-0.02em", lineHeight: 1.2 }}>Life OS</div>
          <div style={{ fontSize: 13, color: p.muted, marginTop: 5 }}>{mode === "signin" ? "Welcome back ✦" : "Let's set up your space 🌙"}</div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: p.muted, display: "block", marginBottom: 6 }}>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ boxSizing: "border-box", display: "block", width: "100%", background: p.lavSoft, border: `1.5px solid ${p.lavMid}`, borderRadius: 10, padding: "0 16px", fontSize: 14, color: p.text, fontFamily: "inherit", outline: "none", height: 42 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: p.muted, display: "block", marginBottom: 6 }}>Password</label>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} style={{ boxSizing: "border-box", display: "block", width: "100%", background: p.lavSoft, border: `1.5px solid ${p.lavMid}`, borderRadius: 10, padding: "0 16px", fontSize: 14, color: p.text, fontFamily: "inherit", outline: "none", height: 42 }} />
          </div>
          {error && <div style={{ background: p.pinkSoft, border: `1px solid #D4889A55`, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#A05060" }}>{error}</div>}
          {info && <div style={{ background: p.mintSoft, border: `1px solid ${p.mint}55`, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#3A7A6A" }}>{info}</div>}
          <button type="submit" disabled={loading} style={{ boxSizing: "border-box", width: "100%", borderRadius: 10, border: "none", background: p.purple, color: p.white, fontSize: 14, fontWeight: 700, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, height: 44, marginTop: 6 }}>
            {loading ? "..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: p.muted }}>
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

// ════════════════════════════════════════════════════════════
// HOME HUB
// ════════════════════════════════════════════════════════════
function HomeHub({ userId, flash }) {
  const [loading, setLoading] = useState(true);
  const [daily, setDaily] = useState({ health_win: "", work_win: "", future_win: "", energy_level: 2, completed: false });
  const [weekly, setWeekly] = useState({ big3_1: "", big3_2: "", big3_3: "", completion_score: "" });
  const [quarterGoals, setQuarterGoals] = useState([]);
  const today = todayStr();
  const weekStart = getWeekStart();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: d } = await supabase.from("daily_entries").select("*").eq("user_id", userId).eq("entry_date", today).maybeSingle();
      if (d) setDaily(d);
      const { data: w } = await supabase.from("weekly_plans").select("*").eq("user_id", userId).eq("week_start", weekStart).maybeSingle();
      if (w) setWeekly(w);
      const { data: q } = await supabase.from("quarterly_goals").select("*").eq("user_id", userId).eq("quarter_label", quarterLabel()).order("created_at", { ascending: true });
      setQuarterGoals(q || []);
      setLoading(false);
    }
    load();
  }, [userId]);

  async function saveDaily(patch) {
    const next = { ...daily, ...patch };
    setDaily(next);
    await supabase.from("daily_entries").upsert({ user_id: userId, entry_date: today, health_win: next.health_win, work_win: next.work_win, future_win: next.future_win, energy_level: next.energy_level, completed: next.completed }, { onConflict: "user_id,entry_date" });
    flash();
  }
  async function saveWeekly(patch) {
    const next = { ...weekly, ...patch };
    setWeekly(next);
    await supabase.from("weekly_plans").upsert({ user_id: userId, week_start: weekStart, big3_1: next.big3_1, big3_2: next.big3_2, big3_3: next.big3_3, completion_score: next.completion_score }, { onConflict: "user_id,week_start" });
    flash();
  }
  async function ensureQuarterGoals() {
    const cats = ["Health", "Career", "Wealth", "Life"];
    const rows = cats.map(c => ({ user_id: userId, quarter_label: quarterLabel(), category: c, goal: "", progress_pct: 0, status: "Not Started" }));
    const { data } = await supabase.from("quarterly_goals").insert(rows).select();
    setQuarterGoals(data || []);
  }
  async function updateGoal(id, patch) {
    setQuarterGoals(prev => prev.map(g => g.id === id ? { ...g, ...patch } : g));
    await supabase.from("quarterly_goals").update(patch).eq("id", id);
    flash();
  }

  if (loading) return <Loading />;

  return (
    <div>
      <Card>
        <Label icon="☀️" text="Today's Big 3" color={p.gold} />
        {[
          { key: "health_win", icon: "💪", label: "Health Win", color: p.pink },
          { key: "work_win", icon: "🚀", label: "Work Win", color: p.purple },
          { key: "future_win", icon: "✨", label: "Future Win", color: p.gold },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: f.color, marginBottom: 4 }}>{f.icon} {f.label}</div>
            <TextField value={daily[f.key]} onChange={e => setDaily(d => ({ ...d, [f.key]: e.target.value }))} onBlur={() => saveDaily({ [f.key]: daily[f.key] })} placeholder="What's one thing..." />
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: p.muted, fontWeight: 600 }}>Energy</span>
            {[1, 2, 3].map(n => (
              <button key={n} onClick={() => saveDaily({ energy_level: n })} style={{ width: 24, height: 24, borderRadius: "50%", border: "none", cursor: "pointer", fontSize: 11, background: (daily.energy_level || 0) >= n ? p.lavDeep : p.lavMid }}>🔋</button>
            ))}
          </div>
          <button onClick={() => saveDaily({ completed: !daily.completed })} style={{ padding: "6px 16px", borderRadius: 20, border: "none", cursor: "pointer", background: daily.completed ? p.purple : p.lavMid, color: daily.completed ? p.white : p.muted, fontSize: 11, fontWeight: 700 }}>{daily.completed ? "✓ Done today!" : "Mark done"}</button>
        </div>
      </Card>

      <Card>
        <Label icon="📋" text="This Week's Big 3" color={p.purple} />
        {["big3_1", "big3_2", "big3_3"].map((key, i) => (
          <div key={key} style={{ marginBottom: 8 }}>
            <TextField value={weekly[key]} onChange={e => setWeekly(w => ({ ...w, [key]: e.target.value }))} onBlur={() => saveWeekly({ [key]: weekly[key] })} placeholder={`Big 3 #${i + 1}...`} />
          </div>
        ))}
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          {[["🟢 Full", "full"], ["🟡 Partial", "partial"], ["🔴 Low", "low"]].map(([label, val]) => (
            <Pill key={val} color={p.mint} bg={p.mintSoft} active={weekly.completion_score === val} onClick={() => saveWeekly({ completion_score: val })}>{label}</Pill>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: 0 }}>
        <Label icon="🎯" text="This Quarter" color={p.deep} />
        {quarterGoals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 12, color: p.muted, marginBottom: 12 }}>No goals set for this quarter yet.</div>
            <button onClick={ensureQuarterGoals} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: p.purple, color: p.white, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Set up this quarter</button>
          </div>
        ) : quarterGoals.map(g => {
          const colorMap = { Health: p.pink, Career: p.purple, Wealth: p.gold, Life: p.mint };
          const color = colorMap[g.category] || p.purple;
          return (
            <div key={g.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color }}>{g.category}</span>
                <span style={{ fontSize: 10, fontWeight: 800, color }}>{g.progress_pct}%</span>
              </div>
              <TextField value={g.goal} onChange={e => setQuarterGoals(prev => prev.map(x => x.id === g.id ? { ...x, goal: e.target.value } : x))} onBlur={() => updateGoal(g.id, { goal: g.goal })} placeholder={`${g.category} goal...`} style={{ marginBottom: 6 }} />
              <input type="range" min="0" max="100" value={g.progress_pct || 0} onChange={e => updateGoal(g.id, { progress_pct: parseInt(e.target.value) })} style={{ width: "100%", accentColor: color }} />
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// HEALTH HUB
// ════════════════════════════════════════════════════════════
function HealthHub({ userId, flash }) {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ weight: "", waist: "", avg_steps: "", sleep_hours: "", protein_g: "", strength_session: false, notes: "" });

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("health_metrics").select("*").eq("user_id", userId).order("week_of", { ascending: false }).limit(12);
      setEntries(data || []);
      setLoading(false);
    }
    load();
  }, [userId]);

  async function addEntry() {
    const week_of = getWeekStart();
    const { data, error } = await supabase.from("health_metrics").insert({ user_id: userId, week_of, ...form }).select().single();
    if (!error && data) {
      setEntries(prev => [data, ...prev]);
      setForm({ weight: "", waist: "", avg_steps: "", sleep_hours: "", protein_g: "", strength_session: false, notes: "" });
      flash();
    }
  }
  async function removeEntry(id) {
    await supabase.from("health_metrics").delete().eq("id", id);
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  if (loading) return <Loading />;

  const latest = entries[0];
  const prev = entries[1];
  const trend = (key) => latest && prev && latest[key] != null && prev[key] != null ? (latest[key] - prev[key]) : null;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { key: "weight", icon: "⚖️", label: "Weight", unit: "lbs" },
          { key: "waist", icon: "📏", label: "Waist", unit: "in" },
          { key: "avg_steps", icon: "👟", label: "Steps", unit: "/day" },
          { key: "protein_g", icon: "🥩", label: "Protein", unit: "g" },
        ].map(s => {
          const t = trend(s.key);
          return (
            <Card key={s.key} style={{ background: p.pinkSoft, marginBottom: 0, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: p.muted, fontWeight: 600 }}>{s.icon} {s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: p.deep }}>{latest?.[s.key] ?? "—"}</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 9, color: p.muted }}>{s.unit}</span>
                {t != null && <span style={{ fontSize: 9, fontWeight: 700, color: t <= 0 ? "#5C9E7A" : "#C06060" }}>{t > 0 ? "↑" : "↓"}{Math.abs(t).toFixed(1)}</span>}
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <Label icon="💪" text="Log This Week" color={p.pink} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <NumField value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="Weight (lbs)" />
          <NumField value={form.waist} onChange={e => setForm(f => ({ ...f, waist: e.target.value }))} placeholder="Waist (in)" />
          <NumField value={form.avg_steps} onChange={e => setForm(f => ({ ...f, avg_steps: e.target.value }))} placeholder="Avg daily steps" />
          <NumField value={form.sleep_hours} onChange={e => setForm(f => ({ ...f, sleep_hours: e.target.value }))} placeholder="Sleep (hrs)" />
          <NumField value={form.protein_g} onChange={e => setForm(f => ({ ...f, protein_g: e.target.value }))} placeholder="Protein (g)" />
          <button onClick={() => setForm(f => ({ ...f, strength_session: !f.strength_session }))} style={{ borderRadius: 10, border: `1.5px solid ${form.strength_session ? p.pink : p.lavMid}`, background: form.strength_session ? p.pinkSoft : p.lavSoft, color: form.strength_session ? p.pink : p.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🏋️ Strength session</button>
        </div>
        <TextField value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes (optional)" style={{ marginBottom: 10 }} />
        <button onClick={addEntry} style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: p.pink, color: p.white, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Save this week</button>
      </Card>

      <Card style={{ marginBottom: 0 }}>
        <Label icon="📊" text="History" color={p.deep} />
        {entries.length === 0 ? <Empty text="No entries yet — log your first week above." /> : entries.map(e => (
          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${p.border}` }}>
            <div style={{ fontSize: 12, color: p.text }}>
              <strong>{e.week_of}</strong> · {e.weight}lbs · {e.waist}in · {e.avg_steps} steps · {e.protein_g}g protein {e.strength_session && "🏋️"}
            </div>
            <button onClick={() => removeEntry(e.id)} style={{ background: "none", border: "none", color: p.muted, cursor: "pointer" }}>×</button>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// CAREER HUB
// ════════════════════════════════════════════════════════════
const CAREER_CATS = ["Leadership", "Delivery", "Strategy", "Relationship", "Learning"];
function CareerHub({ userId, flash }) {
  const [loading, setLoading] = useState(true);
  const [wins, setWins] = useState([]);
  const [text, setText] = useState("");
  const [cat, setCat] = useState("Delivery");
  const [resumeWorthy, setResumeWorthy] = useState(false);
  const [leadership, setLeadership] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("career_wins").select("*").eq("user_id", userId).order("win_date", { ascending: false });
      setWins(data || []);
      setLoading(false);
    }
    load();
  }, [userId]);

  async function addWin() {
    if (!text.trim()) return;
    const { data } = await supabase.from("career_wins").insert({ user_id: userId, achievement: text.trim(), category: cat, win_date: todayStr(), resume_worthy: resumeWorthy, leadership_example: leadership }).select().single();
    if (data) { setWins(prev => [data, ...prev]); setText(""); setResumeWorthy(false); setLeadership(false); flash(); }
  }
  async function removeWin(id) { await supabase.from("career_wins").delete().eq("id", id); setWins(prev => prev.filter(w => w.id !== id)); }

  if (loading) return <Loading />;
  let shown = wins;
  if (filter === "resume") shown = wins.filter(w => w.resume_worthy);
  if (filter === "leadership") shown = wins.filter(w => w.leadership_example);

  return (
    <div>
      <Card>
        <Label icon="🚀" text="Log a win" color={p.sky} />
        <TextField value={text} onChange={e => setText(e.target.value)} placeholder="What did you accomplish?" style={{ marginBottom: 10 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {CAREER_CATS.map(c => <Pill key={c} color={p.sky} bg={p.skySoft} active={cat === c} onClick={() => setCat(c)}>{c}</Pill>)}
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          <Pill color={p.gold} bg={p.goldSoft} active={resumeWorthy} onClick={() => setResumeWorthy(r => !r)}>⭐ Resume worthy</Pill>
          <Pill color={p.purple} bg={p.lavSoft} active={leadership} onClick={() => setLeadership(l => !l)}>🤝 Leadership example</Pill>
        </div>
        <button onClick={addWin} style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: p.sky, color: p.white, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Add win</button>
      </Card>

      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <Pill color={p.sky} active={filter === "all"} onClick={() => setFilter("all")}>All</Pill>
        <Pill color={p.gold} active={filter === "resume"} onClick={() => setFilter("resume")}>⭐ Resume Ready</Pill>
        <Pill color={p.purple} active={filter === "leadership"} onClick={() => setFilter("leadership")}>🤝 Leadership</Pill>
      </div>

      {shown.length === 0 ? <Empty text="No wins logged yet." /> : shown.map(w => (
        <Card key={w.id} style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: p.text, marginBottom: 6 }}>{w.achievement}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, color: p.sky, fontWeight: 700, background: p.skySoft, padding: "2px 8px", borderRadius: 10 }}>{w.category}</span>
                {w.resume_worthy && <span style={{ fontSize: 10, color: p.gold, fontWeight: 700, background: p.goldSoft, padding: "2px 8px", borderRadius: 10 }}>⭐ resume</span>}
                {w.leadership_example && <span style={{ fontSize: 10, color: p.purple, fontWeight: 700, background: p.lavSoft, padding: "2px 8px", borderRadius: 10 }}>🤝 leadership</span>}
                <span style={{ fontSize: 10, color: p.muted }}>{w.win_date}</span>
              </div>
            </div>
            <button onClick={() => removeWin(w.id)} style={{ background: "none", border: "none", color: p.muted, cursor: "pointer" }}>×</button>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// WEALTH HUB
// ════════════════════════════════════════════════════════════
function WealthHub({ userId, flash }) {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ checking: "", savings: "", investments: "", total_debt: "", monthly_savings_added: "", debt_reduced: "", side_income: "", notes: "" });

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("wealth_entries").select("*").eq("user_id", userId).order("month_label", { ascending: false });
      setEntries(data || []);
      setLoading(false);
    }
    load();
  }, [userId]);

  async function save() {
    const month_label = monthLabel();
    const payload = { user_id: userId, month_label, ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === "" ? 0 : v])) };
    const { data } = await supabase.from("wealth_entries").upsert(payload, { onConflict: "user_id,month_label" }).select().single();
    if (data) {
      setEntries(prev => {
        const filtered = prev.filter(e => e.month_label !== month_label);
        return [data, ...filtered].sort((a, b) => b.month_label.localeCompare(a.month_label));
      });
      flash();
    }
  }

  if (loading) return <Loading />;
  const latest = entries[0];
  const netWorth = latest ? (Number(latest.checking || 0) + Number(latest.savings || 0) + Number(latest.investments || 0) - Number(latest.total_debt || 0)) : 0;

  return (
    <div>
      <Card style={{ background: p.goldSoft }}>
        <Label icon="💰" text="Net Worth" color={p.gold} />
        <div style={{ fontSize: 32, fontWeight: 900, color: p.deep }}>${netWorth.toLocaleString()}</div>
        <div style={{ fontSize: 11, color: p.muted, marginTop: 4 }}>as of {latest?.month_label || "no entries yet"}</div>
      </Card>

      <Card>
        <Label icon="📝" text={`Update ${monthLabel()}`} color={p.gold} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <NumField value={form.checking} onChange={e => setForm(f => ({ ...f, checking: e.target.value }))} placeholder="Checking $" />
          <NumField value={form.savings} onChange={e => setForm(f => ({ ...f, savings: e.target.value }))} placeholder="Savings $" />
          <NumField value={form.investments} onChange={e => setForm(f => ({ ...f, investments: e.target.value }))} placeholder="Investments $" />
          <NumField value={form.total_debt} onChange={e => setForm(f => ({ ...f, total_debt: e.target.value }))} placeholder="Total Debt $" />
          <NumField value={form.monthly_savings_added} onChange={e => setForm(f => ({ ...f, monthly_savings_added: e.target.value }))} placeholder="Savings Added $" />
          <NumField value={form.debt_reduced} onChange={e => setForm(f => ({ ...f, debt_reduced: e.target.value }))} placeholder="Debt Reduced $" />
          <NumField value={form.side_income} onChange={e => setForm(f => ({ ...f, side_income: e.target.value }))} placeholder="Side Income $" />
        </div>
        <button onClick={save} style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: p.gold, color: p.white, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Save this month</button>
      </Card>

      <Card style={{ marginBottom: 0 }}>
        <Label icon="📊" text="History" color={p.deep} />
        {entries.length === 0 ? <Empty text="No entries yet." /> : entries.map(e => {
          const nw = Number(e.checking || 0) + Number(e.savings || 0) + Number(e.investments || 0) - Number(e.total_debt || 0);
          return (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${p.border}`, fontSize: 12, color: p.text }}>
              <span><strong>{e.month_label}</strong> · Net worth ${nw.toLocaleString()}</span>
              <span style={{ color: p.muted }}>+${Number(e.monthly_savings_added || 0).toLocaleString()} saved</span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// FUTURE VISION HUB
// ════════════════════════════════════════════════════════════
const VISION_DEFAULTS = [
  { area_key: "consulting", label: "Consulting Business", icon: "🏢", color: p.purple, bg: p.lavSoft },
  { area_key: "spanish", label: "Spanish", icon: "🇪🇸", color: p.gold, bg: p.goldSoft },
  { area_key: "korean", label: "Korean", icon: "🇰🇷", color: p.rose, bg: p.pinkSoft },
  { area_key: "compound", label: "Family Compound", icon: "🏡", color: p.mint, bg: p.mintSoft },
];
function FutureVisionHub({ userId, flash }) {
  const [loading, setLoading] = useState(true);
  const [areas, setAreas] = useState({});
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const [milestoneDraft, setMilestoneDraft] = useState({});

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("vision_areas").select("*").eq("user_id", userId);
      const map = {};
      (data || []).forEach(a => { map[a.area_key] = a; });
      for (const def of VISION_DEFAULTS) {
        if (!map[def.area_key]) {
          const { data: created } = await supabase.from("vision_areas").insert({ user_id: userId, area_key: def.area_key, label: def.label, status: "Just starting", next_action: "", milestones: [] }).select().single();
          map[def.area_key] = created;
        }
      }
      setAreas(map);
      setLoading(false);
    }
    load();
  }, [userId]);

  async function saveNextAction(key) {
    const updated = { ...areas[key], next_action: draft };
    setAreas(a => ({ ...a, [key]: updated }));
    await supabase.from("vision_areas").update({ next_action: draft }).eq("id", updated.id);
    setEditing(null);
    flash();
  }
  async function addMilestone(key) {
    const text = milestoneDraft[key];
    if (!text?.trim()) return;
    const area = areas[key];
    const next = [...(area.milestones || []), { text: text.trim(), done: false }];
    setAreas(a => ({ ...a, [key]: { ...area, milestones: next } }));
    await supabase.from("vision_areas").update({ milestones: next }).eq("id", area.id);
    setMilestoneDraft(m => ({ ...m, [key]: "" }));
    flash();
  }
  async function toggleMilestone(key, idx) {
    const area = areas[key];
    const next = area.milestones.map((m, i) => i === idx ? { ...m, done: !m.done } : m);
    setAreas(a => ({ ...a, [key]: { ...area, milestones: next } }));
    await supabase.from("vision_areas").update({ milestones: next }).eq("id", area.id);
  }

  if (loading) return <Loading />;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {VISION_DEFAULTS.map(def => {
          const area = areas[def.area_key];
          if (!area) return null;
          const milestones = area.milestones || [];
          const done = milestones.filter(m => m.done).length;
          return (
            <Card key={def.area_key} style={{ background: def.bg, marginBottom: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>{def.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: p.text }}>{def.label}</div>
                  <div style={{ fontSize: 10, color: def.color, fontWeight: 600 }}>{done}/{milestones.length} milestones</div>
                </div>
              </div>

              <div style={{ background: p.white, border: `1.5px solid ${def.color}55`, borderRadius: 10, padding: "8px 12px", marginBottom: 10 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: def.color, marginBottom: 4 }}>⚡ NEXT ACTION</div>
                {editing === def.area_key ? (
                  <div style={{ display: "flex", gap: 4 }}>
                    <input value={draft} onChange={e => setDraft(e.target.value)} style={{ flex: 1, fontSize: 11, padding: "5px 8px", borderRadius: 6, border: `1px solid ${p.lavMid}`, background: p.lavSoft, outline: "none" }} />
                    <button onClick={() => saveNextAction(def.area_key)} style={{ background: def.color, color: "#fff", border: "none", borderRadius: 6, padding: "0 10px", fontSize: 10, cursor: "pointer" }}>Save</button>
                  </div>
                ) : (
                  <div onClick={() => { setEditing(def.area_key); setDraft(area.next_action || ""); }} style={{ fontSize: 12, color: p.text, cursor: "pointer" }}>
                    {area.next_action || <span style={{ color: p.muted }}>tap to set next action</span>}
                  </div>
                )}
              </div>

              {milestones.map((m, i) => (
                <div key={i} onClick={() => toggleMilestone(def.area_key, i)} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer", opacity: m.done ? 0.5 : 1 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 5, border: `2px solid ${def.color}`, background: m.done ? def.color : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff" }}>{m.done ? "✓" : ""}</div>
                  <span style={{ fontSize: 11, color: p.text, textDecoration: m.done ? "line-through" : "none" }}>{m.text}</span>
                </div>
              ))}
              <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                <input value={milestoneDraft[def.area_key] || ""} onChange={e => setMilestoneDraft(m => ({ ...m, [def.area_key]: e.target.value }))} onKeyDown={e => e.key === "Enter" && addMilestone(def.area_key)} placeholder="+ milestone" style={{ flex: 1, fontSize: 11, padding: "5px 8px", borderRadius: 6, border: `1px solid ${p.lavMid}`, background: p.lavSoft, outline: "none" }} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// WINS ARCHIVE
// ════════════════════════════════════════════════════════════
const WIN_CATS = [
  { id: "health", label: "Health", icon: "💪", color: p.pink, bg: p.pinkSoft },
  { id: "career", label: "Career", icon: "🚀", color: p.sky, bg: p.skySoft },
  { id: "personal", label: "Personal", icon: "💜", color: p.rose, bg: p.pinkSoft },
  { id: "wealth", label: "Wealth", icon: "💰", color: p.gold, bg: p.goldSoft },
  { id: "language", label: "Language", icon: "🌍", color: p.mint, bg: p.mintSoft },
  { id: "future", label: "Future", icon: "✨", color: p.lavDeep, bg: p.lavSoft },
];
function WinsHub({ userId, flash }) {
  const [loading, setLoading] = useState(true);
  const [wins, setWins] = useState([]);
  const [text, setText] = useState("");
  const [cat, setCat] = useState("personal");
  const [big, setBig] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("wins_archive").select("*").eq("user_id", userId).order("win_date", { ascending: false });
      setWins(data || []);
      setLoading(false);
    }
    load();
  }, [userId]);

  async function addWin() {
    if (!text.trim()) return;
    const { data } = await supabase.from("wins_archive").insert({ user_id: userId, win_text: text.trim(), category: cat, win_date: todayStr(), is_big: big }).select().single();
    if (data) { setWins(prev => [data, ...prev]); setText(""); setBig(false); flash(); }
  }
  async function removeWin(id) { await supabase.from("wins_archive").delete().eq("id", id); setWins(prev => prev.filter(w => w.id !== id)); }

  if (loading) return <Loading />;
  const shown = filter === "all" ? wins : wins.filter(w => w.category === filter);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
        <Card style={{ background: p.lavSoft, marginBottom: 0, padding: "12px 14px" }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: p.purple }}>TOTAL WINS</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: p.deep }}>{wins.length}</div>
        </Card>
        <Card style={{ background: p.goldSoft, marginBottom: 0, padding: "12px 14px" }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: p.gold }}>BIG MOMENTS</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: p.deep }}>{wins.filter(w => w.is_big).length}</div>
        </Card>
        <Card style={{ background: p.mintSoft, marginBottom: 0, padding: "12px 14px" }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: p.mint }}>THIS YEAR</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: p.deep }}>{wins.filter(w => w.win_date?.startsWith(String(new Date().getFullYear()))).length}</div>
        </Card>
      </div>

      <Card>
        <Label icon="⭐" text="Log a win" color={p.gold} />
        <TextField value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && addWin()} placeholder="What are you proud of?" style={{ marginBottom: 10 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
          {WIN_CATS.map(c => <Pill key={c.id} color={c.color} bg={c.bg} active={cat === c.id} onClick={() => setCat(c.id)}>{c.icon} {c.label}</Pill>)}
          <Pill color={p.gold} bg={p.goldSoft} active={big} onClick={() => setBig(b => !b)}>⭐ Big moment</Pill>
        </div>
        <button onClick={addWin} style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: p.purple, color: p.white, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Add win</button>
      </Card>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        <Pill color={p.purple} active={filter === "all"} onClick={() => setFilter("all")}>All</Pill>
        {WIN_CATS.map(c => <Pill key={c.id} color={c.color} bg={c.bg} active={filter === c.id} onClick={() => setFilter(c.id)}>{c.icon}</Pill>)}
      </div>

      {shown.length === 0 ? <Empty text="No wins yet — add your first above." /> : shown.map(w => {
        const meta = WIN_CATS.find(c => c.id === w.category) || WIN_CATS[2];
        return (
          <Card key={w.id} style={{ background: w.is_big ? meta.bg : p.lavCard, padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: 16 }}>{w.is_big ? "⭐" : meta.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: p.text }}>{w.win_text}</div>
                <div style={{ fontSize: 10, color: p.muted, marginTop: 3 }}>{meta.label} · {w.win_date}</div>
              </div>
              <button onClick={() => removeWin(w.id)} style={{ background: "none", border: "none", color: p.muted, cursor: "pointer" }}>×</button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// RELATIONSHIPS HUB
// ════════════════════════════════════════════════════════════
const REL_CATS = [
  { id: "Mentor", icon: "🌟", color: p.gold, bg: p.goldSoft },
  { id: "Collaborator", icon: "🚀", color: p.sky, bg: p.skySoft },
  { id: "Friend", icon: "💜", color: p.pink, bg: p.pinkSoft },
  { id: "Network", icon: "🌱", color: p.mint, bg: p.mintSoft },
  { id: "Family", icon: "🏡", color: p.rose, bg: p.pinkSoft },
];
function daysAgo(dateStr) {
  if (!dateStr) return "never";
  const diff = Math.floor((new Date() - new Date(dateStr)) / 86400000);
  if (diff < 30) return `${diff}d ago`;
  if (diff < 365) return `${Math.floor(diff / 30)}mo ago`;
  return `${Math.floor(diff / 365)}y ago`;
}
function RelationshipsHub({ userId, flash }) {
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState([]);
  const [adding, setAdding] = useState(false);
  const [newP, setNewP] = useState({ name: "", category: "Friend", how_known: "", next_touch: "" });
  const [editId, setEditId] = useState(null);
  const [editDraft, setEditDraft] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("relationships").select("*").eq("user_id", userId).order("last_touch", { ascending: true });
      setPeople(data || []);
      setLoading(false);
    }
    load();
  }, [userId]);

  async function addPerson() {
    if (!newP.name.trim()) return;
    const { data } = await supabase.from("relationships").insert({ user_id: userId, ...newP, last_touch: todayStr() }).select().single();
    if (data) { setPeople(prev => [...prev, data]); setNewP({ name: "", category: "Friend", how_known: "", next_touch: "" }); setAdding(false); flash(); }
  }
  async function markTouched(id) {
    const { data } = await supabase.from("relationships").update({ last_touch: todayStr() }).eq("id", id).select().single();
    setPeople(prev => prev.map(p2 => p2.id === id ? data : p2));
    flash();
  }
  async function saveNextTouch(id) {
    await supabase.from("relationships").update({ next_touch: editDraft }).eq("id", id);
    setPeople(prev => prev.map(p2 => p2.id === id ? { ...p2, next_touch: editDraft } : p2));
    setEditId(null);
    flash();
  }
  async function removePerson(id) { await supabase.from("relationships").delete().eq("id", id); setPeople(prev => prev.filter(p2 => p2.id !== id)); }

  if (loading) return <Loading />;
  const overdue = people.filter(p2 => !p2.last_touch || (new Date() - new Date(p2.last_touch)) / 86400000 > 45);

  return (
    <div>
      {overdue.length > 0 && (
        <div style={{ background: p.pinkSoft, border: `1.5px solid ${p.rose}55`, borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: p.rose }}>🌧 {overdue.length} connection{overdue.length > 1 ? "s" : ""} need attention</div>
        </div>
      )}

      {people.map(person => {
        const meta = REL_CATS.find(c => c.id === person.category) || REL_CATS[2];
        const isOverdue = overdue.some(o => o.id === person.id);
        return (
          <Card key={person.id} style={{ background: isOverdue ? p.pinkSoft : p.lavCard, padding: "14px 16px" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: meta.bg, border: `2px solid ${meta.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{meta.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: p.text }}>{person.name}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: meta.color, background: meta.bg, padding: "1px 7px", borderRadius: 10 }}>{person.category}</span>
                </div>
                <div style={{ fontSize: 11, color: p.muted, marginBottom: 6 }}>{person.how_known} · last: {daysAgo(person.last_touch)}</div>
                {editId === person.id ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    <input value={editDraft} onChange={e => setEditDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && saveNextTouch(person.id)} autoFocus style={{ flex: 1, fontSize: 11, padding: "5px 8px", borderRadius: 6, border: `1px solid ${p.lavMid}`, background: p.lavSoft, outline: "none" }} />
                    <button onClick={() => saveNextTouch(person.id)} style={{ background: meta.color, color: "#fff", border: "none", borderRadius: 6, padding: "0 10px", fontSize: 10, cursor: "pointer" }}>Save</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <div onClick={() => { setEditId(person.id); setEditDraft(person.next_touch || ""); }} style={{ flex: 1, fontSize: 11, color: p.text, background: meta.bg, padding: "5px 10px", borderRadius: 8, cursor: "pointer" }}>⚡ {person.next_touch || "tap to set next action"}</div>
                    <button onClick={() => markTouched(person.id)} style={{ fontSize: 10, fontWeight: 700, color: meta.color, background: meta.bg, border: `1px solid ${meta.color}66`, borderRadius: 8, padding: "5px 10px", cursor: "pointer" }}>✓ touched</button>
                    <button onClick={() => removePerson(person.id)} style={{ background: "none", border: "none", color: p.muted, cursor: "pointer" }}>×</button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}

      {adding ? (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <TextField value={newP.name} onChange={e => setNewP(n => ({ ...n, name: e.target.value }))} placeholder="Name" />
            <TextField value={newP.how_known} onChange={e => setNewP(n => ({ ...n, how_known: e.target.value }))} placeholder="How you know them" />
            <TextField value={newP.next_touch} onChange={e => setNewP(n => ({ ...n, next_touch: e.target.value }))} placeholder="Next action" />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {REL_CATS.map(c => <Pill key={c.id} color={c.color} bg={c.bg} active={newP.category === c.id} onClick={() => setNewP(n => ({ ...n, category: c.id }))}>{c.icon} {c.id}</Pill>)}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addPerson} style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: p.purple, color: p.white, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Add</button>
              <button onClick={() => setAdding(false)} style={{ padding: "9px 16px", borderRadius: 10, border: `1.5px solid ${p.border}`, background: "transparent", color: p.muted, fontSize: 12, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </Card>
      ) : (
        <button onClick={() => setAdding(true)} style={{ width: "100%", padding: 12, borderRadius: 12, border: `1.5px dashed ${p.lavDeep}`, background: "transparent", color: p.muted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Add someone</button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MONTHLY REVIEW HUB
// ════════════════════════════════════════════════════════════
function MonthlyHub({ userId, flash }) {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});
  const month = monthLabel();

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("monthly_reviews").select("*").eq("user_id", userId).eq("month_label", month).maybeSingle();
      setForm(data || {});
      setLoading(false);
    }
    load();
  }, [userId]);

  async function save(patch) {
    const next = { ...form, ...patch };
    setForm(next);
    await supabase.from("monthly_reviews").upsert({ user_id: userId, month_label: month, ...next }, { onConflict: "user_id,month_label" });
    flash();
  }

  if (loading) return <Loading />;
  const energyColors = ["#C86B7A", "#C4904A", "#B8A040", "#7ABFB0", "#7AAFD4", "#9B7FCC", "#C4964A", "#D4889A", "#7ABFB0", "#9B7FCC"];

  return (
    <div>
      <Card style={{ background: p.lavSoft }}>
        <Label icon="🔋" text="Monthly Energy Score" color={p.deep} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <button key={n} onClick={() => save({ energy_score: n })} style={{
              width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 800,
              background: form.energy_score === n ? energyColors[n-1] : p.lavMid,
              color: form.energy_score === n ? "#fff" : p.muted,
            }}>{n}</button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: p.muted }}>1 = depleted · 10 = peak energy this month</div>
      </Card>

      <Card>
        <Label icon="📊" text="Health" color={p.pink} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <NumField value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} onBlur={() => save({ weight: form.weight })} placeholder="Weight (lbs)" />
          <NumField value={form.waist} onChange={e => setForm(f => ({ ...f, waist: e.target.value }))} onBlur={() => save({ waist: form.waist })} placeholder="Waist (in)" />
          <NumField value={form.avg_steps} onChange={e => setForm(f => ({ ...f, avg_steps: e.target.value }))} onBlur={() => save({ avg_steps: form.avg_steps })} placeholder="Avg steps" />
          <NumField value={form.protein_consistency} onChange={e => setForm(f => ({ ...f, protein_consistency: e.target.value }))} onBlur={() => save({ protein_consistency: form.protein_consistency })} placeholder="Protein consistency %" />
        </div>
      </Card>

      <Card>
        <Label icon="🚀" text="Career & Wealth" color={p.sky} />
        <TextField value={form.career_wins} onChange={e => setForm(f => ({ ...f, career_wins: e.target.value }))} onBlur={() => save({ career_wins: form.career_wins })} placeholder="Career wins this month" style={{ marginBottom: 8 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <NumField value={form.savings_added} onChange={e => setForm(f => ({ ...f, savings_added: e.target.value }))} onBlur={() => save({ savings_added: form.savings_added })} placeholder="Savings $" />
          <NumField value={form.debt_reduced} onChange={e => setForm(f => ({ ...f, debt_reduced: e.target.value }))} onBlur={() => save({ debt_reduced: form.debt_reduced })} placeholder="Debt reduced $" />
          <NumField value={form.side_income} onChange={e => setForm(f => ({ ...f, side_income: e.target.value }))} onBlur={() => save({ side_income: form.side_income })} placeholder="Side income $" />
        </div>
      </Card>

      <Card style={{ marginBottom: 0 }}>
        <Label icon="🪞" text="Reflection" color={p.deep} />
        {[
          { key: "what_worked", label: "What worked?" },
          { key: "what_drained", label: "What drained me?" },
          { key: "stop_doing", label: "What should I stop?" },
          { key: "automate_this", label: "What should I automate?" },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: p.muted, marginBottom: 3 }}>{f.label}</div>
            <TextField value={form[f.key]} onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))} onBlur={() => save({ [f.key]: form[f.key] })} />
          </div>
        ))}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// BRAIN DUMP HUB
// ════════════════════════════════════════════════════════════
const DUMP_CATS = [
  { id: "idea", label: "Idea", icon: "💡", color: p.gold, bg: p.goldSoft },
  { id: "task", label: "To Do", icon: "📌", color: p.purple, bg: p.lavSoft },
  { id: "worry", label: "Worry", icon: "🌧", color: p.rose, bg: p.pinkSoft },
  { id: "later", label: "Someday", icon: "🌙", color: p.lavDeep, bg: p.lavSoft },
  { id: "learn", label: "Learn", icon: "📚", color: p.sky, bg: p.skySoft },
  { id: "feeling", label: "Feeling", icon: "💜", color: p.pink, bg: p.pinkSoft },
];
function BrainDumpHub({ userId, flash }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  const [cat, setCat] = useState("idea");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("brain_dump").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      setItems(data || []);
      setLoading(false);
    }
    load();
  }, [userId]);

  async function addItem() {
    if (!text.trim()) return;
    const { data } = await supabase.from("brain_dump").insert({ user_id: userId, item_text: text.trim(), category: cat }).select().single();
    if (data) { setItems(prev => [data, ...prev]); setText(""); flash(); }
  }
  async function toggleDone(id, current) {
    await supabase.from("brain_dump").update({ is_done: !current }).eq("id", id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_done: !current } : i));
  }
  async function removeItem(id) { await supabase.from("brain_dump").delete().eq("id", id); setItems(prev => prev.filter(i => i.id !== id)); }

  if (loading) return <Loading />;
  const shown = filter === "all" ? items : items.filter(i => i.category === filter);
  const undone = shown.filter(i => !i.is_done);
  const done = shown.filter(i => i.is_done);

  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        <Pill color={p.purple} active={filter === "all"} onClick={() => setFilter("all")}>All</Pill>
        {DUMP_CATS.map(c => <Pill key={c.id} color={c.color} bg={c.bg} active={filter === c.id} onClick={() => setFilter(c.id)}>{c.icon} {c.label}</Pill>)}
      </div>

      <Card>
        <Label icon="⚡" text="Quick capture" color={p.gold} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <TextField value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && addItem()} placeholder="What's on your mind?" />
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {DUMP_CATS.map(c => (
              <button key={c.id} onClick={() => setCat(c.id)} title={c.label} style={{ width: 34, height: 34, borderRadius: 10, border: `1.5px solid ${cat === c.id ? c.color : p.border}`, background: cat === c.id ? c.bg : p.lavCard, fontSize: 16, cursor: "pointer" }}>{c.icon}</button>
            ))}
          </div>
          <button onClick={addItem} style={{ padding: "0 18px", borderRadius: 10, border: "none", background: p.purple, color: p.white, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Add</button>
        </div>
      </Card>

      {undone.length === 0 && done.length === 0 ? <Empty text="Your mind is clear. 🌸" /> : (
        <>
          {undone.map(it => {
            const meta = DUMP_CATS.find(c => c.id === it.category) || DUMP_CATS[0];
            return (
              <div key={it.id} style={{ display: "flex", gap: 10, background: meta.bg, border: `1.5px solid ${meta.color}33`, borderRadius: 12, padding: "11px 14px", marginBottom: 7 }}>
                <button onClick={() => toggleDone(it.id, it.is_done)} style={{ width: 18, height: 18, borderRadius: 6, border: `2px solid ${meta.color}`, background: "transparent", cursor: "pointer", flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color: p.text }}>{it.item_text}</span>
                <span style={{ fontSize: 12 }}>{meta.icon}</span>
                <button onClick={() => removeItem(it.id)} style={{ background: "none", border: "none", color: p.muted, cursor: "pointer" }}>×</button>
              </div>
            );
          })}
          {done.map(it => {
            const meta = DUMP_CATS.find(c => c.id === it.category) || DUMP_CATS[0];
            return (
              <div key={it.id} style={{ display: "flex", gap: 10, background: p.lavCard, border: `1px solid ${p.border}`, borderRadius: 12, padding: "9px 14px", marginBottom: 6, opacity: 0.6 }}>
                <button onClick={() => toggleDone(it.id, it.is_done)} style={{ width: 18, height: 18, borderRadius: 6, border: `2px solid ${meta.color}`, background: meta.color, cursor: "pointer", flexShrink: 0, color: "#fff", fontSize: 10 }}>✓</button>
                <span style={{ flex: 1, fontSize: 12, color: p.muted, textDecoration: "line-through" }}>{it.item_text}</span>
                <button onClick={() => removeItem(it.id)} style={{ background: "none", border: "none", color: p.muted, cursor: "pointer" }}>×</button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN APP SHELL (sidebar nav)
// ════════════════════════════════════════════════════════════
const NAV = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "health", icon: "💪", label: "Health" },
  { id: "career", icon: "🚀", label: "Career" },
  { id: "wealth", icon: "💰", label: "Wealth" },
  { id: "future", icon: "✨", label: "Future Vision" },
  { id: "wins", icon: "⭐", label: "Wins Archive" },
  { id: "relationships", icon: "🤝", label: "Relationships" },
  { id: "monthly", icon: "📆", label: "Monthly Review" },
  { id: "brain", icon: "🧠", label: "Brain Dump" },
];

function AppShell({ session, onLogout }) {
  const [tab, setTab] = useState("home");
  const [savedFlash, setSavedFlash] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const userId = session.user.id;

  function flash() { setSavedFlash(true); setTimeout(() => setSavedFlash(false), 1200); }

  const HUBS = {
    home: <HomeHub userId={userId} flash={flash} />,
    health: <HealthHub userId={userId} flash={flash} />,
    career: <CareerHub userId={userId} flash={flash} />,
    wealth: <WealthHub userId={userId} flash={flash} />,
    future: <FutureVisionHub userId={userId} flash={flash} />,
    wins: <WinsHub userId={userId} flash={flash} />,
    relationships: <RelationshipsHub userId={userId} flash={flash} />,
    monthly: <MonthlyHub userId={userId} flash={flash} />,
    brain: <BrainDumpHub userId={userId} flash={flash} />,
  };

  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ background: p.lavBg, minHeight: "100vh", color: p.text, fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", display: "flex" }}>
      <style>{`
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: ${p.lavDeep}; }
        input, textarea { outline: none; font-family: inherit; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${p.lavDeep}; border-radius: 4px; }
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .mobile-nav-toggle { display: flex !important; }
        }
      `}</style>

      {/* Sidebar */}
      <div className="sidebar" style={{ width: 220, background: p.surface, borderRight: `1.5px solid ${p.border}`, padding: "20px 14px", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, padding: "0 8px" }}>
          <span style={{ fontSize: 22 }}>🧬</span>
          <span style={{ fontWeight: 800, fontSize: 16, color: p.deep }}>Life OS</span>
        </div>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", borderRadius: 10, border: "none", cursor: "pointer",
            background: tab === n.id ? p.lavCard : "transparent",
            color: tab === n.id ? p.purple : p.muted,
            fontWeight: tab === n.id ? 700 : 500, fontSize: 13, marginBottom: 3,
            textAlign: "left",
          }}>
            <span style={{ fontSize: 16 }}>{n.icon}</span>{n.label}
          </button>
        ))}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${p.border}` }}>
          <div style={{ fontSize: 10, color: p.muted, padding: "0 8px", marginBottom: 8, wordBreak: "break-all" }}>{session.user.email}</div>
          <button onClick={() => supabase.auth.signOut().then(onLogout)} style={{ width: "100%", padding: "8px 12px", borderRadius: 10, border: `1.5px solid ${p.border}`, background: "transparent", color: p.muted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Sign out</button>
        </div>
      </div>

      {/* Mobile nav toggle */}
      <div className="mobile-nav-toggle" style={{ display: "none", position: "fixed", top: 14, left: 14, zIndex: 100 }}>
        <button onClick={() => setMobileNavOpen(o => !o)} style={{ width: 40, height: 40, borderRadius: 12, border: `1.5px solid ${p.border}`, background: p.lavCard, fontSize: 18, cursor: "pointer" }}>{mobileNavOpen ? "✕" : "☰"}</button>
      </div>
      {mobileNavOpen && (
        <div style={{ position: "fixed", inset: 0, background: p.lavBg, zIndex: 99, padding: "70px 20px 20px", overflowY: "auto" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => { setTab(n.id); setMobileNavOpen(false); }} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "12px 14px", borderRadius: 12, border: "none", cursor: "pointer",
              background: tab === n.id ? p.lavCard : "transparent",
              color: tab === n.id ? p.purple : p.muted,
              fontWeight: tab === n.id ? 700 : 500, fontSize: 15, marginBottom: 6,
              textAlign: "left",
            }}><span style={{ fontSize: 18 }}>{n.icon}</span>{n.label}</button>
          ))}
          <button onClick={() => supabase.auth.signOut().then(onLogout)} style={{ width: "100%", marginTop: 16, padding: "10px 14px", borderRadius: 12, border: `1.5px solid ${p.border}`, background: "transparent", color: p.muted, fontSize: 13, cursor: "pointer" }}>Sign out</button>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ background: p.surface, borderBottom: `1.5px solid ${p.border}`, padding: "16px 24px" }}>
          <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: p.deep }}>{NAV.find(n => n.id === tab)?.icon} {tab === "home" ? `${greeting} ✦` : NAV.find(n => n.id === tab)?.label}</div>
            </div>
            <SaveFlash show={savedFlash} />
          </div>
        </div>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 20px 60px" }}>
          {HUBS[tab]}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// APP ROOT
// ════════════════════════════════════════════════════════════
export default function App() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setChecking(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (checking) return <div style={{ background: p.lavBg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ fontSize: 28 }}>🌙</div></div>;
  if (!session) return <AuthScreen onLogin={setSession} />;
  return <AppShell session={session} onLogout={() => setSession(null)} />;
}

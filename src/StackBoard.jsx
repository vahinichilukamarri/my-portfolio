import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "motion/react";
import { PROJECTS, STACK } from "./data";
import { isHighlighted, orderStack } from "./profiles";
import { Decode, Reveal } from "./motion";

/* (05) Stack — a split-flap departures board. Each category is a "flight
   list" of tools: where each one was used, and whether it has shipped in a
   public build. Characters flap through glyphs before settling; pages
   advance on their own until the visitor picks a category. */

const ROWS = 8;
const CYCLE_MS = 7000;
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#+-&/.";
const TAB = { "Languages": "Lang", "AI & LLMs": "AI", "Testing & Automation": "Test", "Backend & Web": "Web", "Data & Tools": "Data", "Core Concepts": "Core" };
const SHORT = {
  "MCP (Model Context Protocol)": "MCP",
  "AI-Assisted Test Generation": "AI Test Generation",
  "LLM-as-a-Judge Evaluation": "LLM-as-a-Judge",
  "Object-Oriented Programming": "OOP",
  "Data Structures & Algorithms": "DSA",
  "Distributed Systems & Observability": "Distributed Systems",
  "API & Integration Tests": "API Integration Tests",
};
const PROJECT_SHORT = { "Microservice Health Orchestrator": "Health Orch", "AgentShield AI": "AgentShield" };

const norm = s => s.toLowerCase().replace(/[^a-z0-9+#]/g, "");
// Project stack labels spelled differently from the STACK list.
const ALIAS = { groqllm: "Groq", mcp: "MCP (Model Context Protocol)", visiontransformer: "Vision Transformers" };
// Tools a project demonstrably uses (per its description) but doesn't list in its stack chips.
const EXTRA = {
  MORPH: ["LLM Agents", "AI-Assisted Test Generation", "REST APIs"],
  TRACE: ["LLM Agents", "REST APIs"],
  LedgerGuard: ["Property-Based Testing", "Fault Injection", "Idempotency", "JUnit"],
  "AgentShield AI": ["LLM Agents"],
  "Microservice Health Orchestrator": ["Distributed Systems & Observability", "Data Structures & Algorithms"],
  EvalEngine: ["LLM-as-a-Judge Evaluation"],
  AskBI: ["REST APIs"],
};

function useUsage() {
  return useMemo(() => {
    const byNorm = Object.fromEntries(STACK.flatMap(s => s.items).map(it => [norm(it), it]));
    const usedIn = {};
    PROJECTS.forEach(p => {
      const names = new Set();
      [...p.stack, ...(EXTRA[p.title] || [])].forEach(raw => {
        const hit = byNorm[norm(raw)] || ALIAS[norm(raw)];
        if (hit) names.add(hit);
      });
      names.forEach(t => { (usedIn[t] ||= []).push(p.title); });
    });
    return usedIn;
  }, []);
}

function useIsWide() {
  const q = "(min-width: 768px)";
  const [is, setIs] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setIs(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return is;
}

const fit = (s, n) => {
  const u = s.toUpperCase();
  return (u.length > n ? `${u.slice(0, n - 1)}.` : u).padEnd(n, " ");
};

/* Flaps every changed cell through a few random glyphs, cascading left to
   right and top to bottom, then settles on the target text. */
function useFlaps(target) {
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const plan = target.map((row, r) => [...row].map((ch, c) =>
      ch === shownRef.current[r]?.[c] ? null : { wait: Math.round(c * 0.35 + r * 1.2), flips: still ? 0 : 3 + ((Math.random() * 5) | 0) }));
    const id = setInterval(() => {
      let busy = false;
      const next = target.map((row, r) => [...row].map((ch, c) => {
        const p = plan[r][c];
        if (!p) return ch;
        if (p.wait > 0) { p.wait--; busy = true; return shownRef.current[r]?.[c] ?? " "; }
        if (p.flips > 0) { p.flips--; busy = true; return CHARSET[(Math.random() * CHARSET.length) | 0]; }
        return ch;
      }).join(""));
      shownRef.current = next;
      setShown(next);
      if (!busy) clearInterval(id);
    }, 42);
    return () => clearInterval(id);
  }, [target]);

  return shown;
}

function Flaps({ text, tone = "" }) {
  return [...text].map((ch, i) => (
    <span key={i} className="flap">
      <span key={ch} className={`flap-ch ${tone}`}>{ch === " " ? " " : ch}</span>
    </span>
  ));
}

export default function StackBoard({ num = "05", Head }) {
  const usedIn = useUsage();
  const wide = useIsWide();
  const boardRef = useRef(null);
  const inView = useInView(boardRef, { margin: "-15% 0px" });
  const cats = useMemo(() => orderStack(STACK), []);

  // Every (category, page) the board can show, tools sorted by how many builds use them.
  const pages = useMemo(() => cats.flatMap((s, ci) => {
    const tools = [...s.items].sort((a, b) => (usedIn[b]?.length || 0) - (usedIn[a]?.length || 0));
    const n = Math.ceil(tools.length / ROWS);
    return Array.from({ length: n }, (_, pi) => ({ ci, pi, n, cat: s.cat, tools: tools.slice(pi * ROWS, pi * ROWS + ROWS) }));
  }), [cats, usedIn]);

  const [at, setAt] = useState(0);
  const [auto, setAuto] = useState(true);
  const [hover, setHover] = useState(null);
  const page = pages[at];

  useEffect(() => {
    if (!auto || !inView || hover) return;
    const t = setTimeout(() => setAt(i => (i + 1) % pages.length), CYCLE_MS);
    return () => clearTimeout(t);
  }, [auto, inView, hover, at, pages.length]);

  const cols = useMemo(() => (wide
    ? [{ k: "no", w: 2, label: "No" }, { k: "tool", w: 21, label: "Tool" }, { k: "used", w: 15, label: "Used in", tone: "text-[var(--amber)]" }, { k: "status", w: 7, label: "Status" }]
    : [{ k: "tool", w: 17, label: "Tool" }, { k: "status", w: 7, label: "Status" }]), [wide]);
  const cells = cols.reduce((n, c) => n + c.w, 0);

  const rows = useMemo(() => Array.from({ length: ROWS }, (_, r) => {
    const tool = page.tools[r];
    const used = tool ? usedIn[tool] || [] : [];
    const val = {
      no: tool ? String(page.pi * ROWS + r + 1).padStart(2, "0") : "",
      tool: tool ? SHORT[tool] || tool : "",
      used: used.length ? `${PROJECT_SHORT[used[0]] || used[0]}${used.length > 1 ? ` +${used.length - 1}` : ""}` : tool ? "-" : "",
      status: tool ? (used.length ? "SHIPPED" : "STANDBY") : "",
    };
    return { tool, used, text: cols.map(c => fit(val[c.k], c.w)).join("") };
  }), [page, usedIn, cols]);

  const target = useMemo(() => rows.map(r => r.text), [rows]);
  const shown = useFlaps(target);

  const pick = i => { setAuto(false); setAt(i); };
  const info = hover && (usedIn[hover]?.length
    ? `${hover} — used in ${usedIn[hover].join(", ")}`
    : `${hover} — in the toolbox, not yet in a public build`);

  return (
    <section id="stack" className="relative py-28 sm:py-40">
      <div className="wrap">
        <Head num={num} label="Stack" aside="Departures board" a="What runs" b="underneath" />
        <Reveal delay={0.1}><p className="mt-6 max-w-2xl text-lg text-[var(--muted)]">Every tool I use, and the builds it shipped in. Pick a category, or let the board run.</p></Reveal>

        <Reveal delay={0.15} className="mt-14">
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Stack categories">
            {cats.map((s, ci) => {
              const on = page.ci === ci;
              return (
                <button
                  key={s.cat}
                  role="tab"
                  aria-selected={on}
                  onClick={() => pick(pages.findIndex(p => p.ci === ci))}
                  className={`rounded-full border px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${on ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]" : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-hi)] hover:text-[var(--ink)]"}`}
                >
                  <span className="sm:hidden">{TAB[s.cat] || s.cat}</span>
                  <span className="hidden sm:inline">{s.cat}</span>
                </button>
              );
            })}
          </div>

          <div ref={boardRef} className="board mt-5 rounded-2xl border border-[var(--border-hi)] bg-[#0c0c0d] p-3 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] sm:p-5" style={{ "--n": cells }}>
            <div className="flex items-center justify-between px-1 pb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] sm:text-[11px]">
              <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> Departures — {page.cat}</span>
              <span>{page.n > 1 ? `Page ${page.pi + 1}/${page.n}` : `Gate ${num}`}</span>
            </div>

            <div className="flex pb-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted-2)] sm:text-[10px]">
              {cols.map(c => <span key={c.k} style={{ flex: `${c.w} 1 0` }} className="px-[0.6cqw]">{c.label}</span>)}
            </div>

            <div className="space-y-[3px]" onMouseLeave={() => setHover(null)}>
              {rows.map((row, r) => {
                let off = 0;
                return (
                  <div
                    key={r}
                    onMouseEnter={() => row.tool && setHover(row.tool)}
                    onClick={() => row.tool && setHover(h => (h === row.tool ? null : row.tool))}
                    className={`flex rounded-[4px] transition-[background-color] duration-200 ${row.tool ? "cursor-pointer" : ""} ${hover && hover === row.tool ? "bg-white/[0.06]" : ""}`}
                  >
                    {cols.map(c => {
                      const seg = (shown[r] || "").slice(off, off + c.w).padEnd(c.w, " ");
                      off += c.w;
                      const tone = c.k === "status"
                        ? (row.used.length ? "text-[var(--accent)]" : "text-[var(--muted)]")
                        : c.k === "tool" && row.tool && isHighlighted(row.tool) ? "text-[var(--accent)]" : c.tone || "";
                      return <span key={c.k} className="flex gap-[2px] px-[0.6cqw]" style={{ flex: `${c.w} 1 0` }}><Flaps text={seg} tone={tone} /></span>;
                    })}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex min-h-[1.6em] items-center gap-3 border-t border-[var(--border)] px-1 pt-3 font-mono text-[11px] text-[var(--muted)]">
              <span className="text-[var(--accent)]">▸</span>
              {info ? <Decode key={info} text={info} speed={2.5} /> : <span className="text-[var(--muted-2)]">Hover or tap a row to see where it shipped</span>}
            </div>
            <div className="mt-3 h-px overflow-hidden bg-white/[0.06]">
              {auto && inView && !hover && <div key={at} className="board-progress h-full origin-left bg-[var(--accent)]" style={{ animationDuration: `${CYCLE_MS}ms` }} />}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

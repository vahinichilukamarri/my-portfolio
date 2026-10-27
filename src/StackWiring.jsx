import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "motion/react";
import { PROJECTS, STACK } from "./data";
import { isHighlighted, orderStack } from "./profiles";
import { Decode, Reveal } from "./motion";

/* (05) Stack — "the wiring". Every tool on one side, every build on the
   other. Point at a tool and live wires run to each project that uses it;
   point at a project and they run back to its tools. When nobody is
   pointing, it cycles through the most-used tools on its own. */

const accent = a => `var(--${a})`;
const norm = s => s.toLowerCase().replace(/[^a-z0-9+#]/g, "");

// Project stack labels that are spelled differently from the STACK list.
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

function useWiring() {
  return useMemo(() => {
    const byNorm = Object.fromEntries(STACK.flatMap(s => s.items).map(it => [norm(it), it]));
    const toolsOf = {};
    const projectsOf = {};
    PROJECTS.forEach(p => {
      const names = new Set();
      [...p.stack, ...(EXTRA[p.title] || [])].forEach(raw => {
        const hit = byNorm[norm(raw)] || ALIAS[norm(raw)];
        if (hit) names.add(hit);
      });
      toolsOf[p.no] = names;
      names.forEach(t => { (projectsOf[t] ||= []).push(p.no); });
    });
    const busiest = Object.keys(projectsOf).sort((a, b) => projectsOf[b].length - projectsOf[a].length);
    return { toolsOf, projectsOf, busiest };
  }, []);
}

const SIZE = [
  "text-[clamp(0.95rem,1.3vw,1.15rem)] text-[var(--muted-2)]",
  "text-[clamp(1.15rem,1.9vw,1.65rem)] text-[var(--ink)]/85",
  "text-[clamp(1.5rem,2.8vw,2.5rem)] text-[var(--ink)]",
];
const sizeFor = n => SIZE[n >= 3 ? 2 : n >= 1 ? 1 : 0];

export default function StackWiring({ num = "05", Head }) {
  const { toolsOf, projectsOf, busiest } = useWiring();
  const box = useRef(null);
  const toolEls = useRef({});
  const socketEls = useRef({});
  const inView = useInView(box, { margin: "-20% 0px" });
  const [active, setActive] = useState(null); // { kind: "tool" | "project", id, auto? }
  const [wires, setWires] = useState([]);
  const [pinned, setPinned] = useState(false);
  const autoIdx = useRef(0);

  const tools = active?.kind === "tool" ? [active.id] : active ? [...toolsOf[active.id]] : [];
  const projects = active?.kind === "tool" ? projectsOf[active.id] || [] : active ? [active.id] : [];
  const litTools = new Set(tools);
  const litProjects = new Set(projects);

  // Idle autoplay through the most-connected tools.
  useEffect(() => {
    if (!inView || (active && !active.auto) || pinned) return;
    const step = () => {
      const id = busiest[autoIdx.current++ % Math.min(busiest.length, 10)];
      setActive({ kind: "tool", id, auto: true });
    };
    const t = setTimeout(step, active ? 2600 : 400);
    return () => clearTimeout(t);
  }, [inView, active, pinned, busiest]);

  const measure = useCallback(() => {
    const c = box.current?.getBoundingClientRect();
    if (!c || !active || window.innerWidth < 1024) { setWires([]); return; }
    const pairs = active.kind === "tool"
      ? (projectsOf[active.id] || []).map(no => [active.id, no])
      : [...toolsOf[active.id]].map(t => [t, active.id]);
    setWires(pairs.flatMap(([t, no]) => {
      const a = toolEls.current[t]?.getBoundingClientRect();
      const b = socketEls.current[no]?.getBoundingClientRect();
      if (!a || !b) return [];
      const x1 = a.right - c.left + 6, y1 = a.top + a.height / 2 - c.top;
      const x2 = b.left - c.left - 4, y2 = b.top + b.height / 2 - c.top;
      const dx = Math.max(60, (x2 - x1) * 0.5);
      const p = PROJECTS.find(q => q.no === no);
      return [{ key: `${t}>${no}`, d: `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`, color: accent(p.accent), x1, y1, x2, y2 }];
    }));
  }, [active, projectsOf, toolsOf]);

  // ResizeObserver also fires once on observe, so this re-measures on every change of `active`.
  useEffect(() => {
    const ro = new ResizeObserver(measure);
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, [measure]);

  const hover = (kind, id) => { if (!pinned) setActive({ kind, id }); };
  const leave = () => { if (!pinned) setActive(null); };
  const tap = (kind, id) => {
    const same = active?.kind === kind && active?.id === id && pinned;
    setPinned(!same);
    setActive(same ? null : { kind, id });
  };

  const activeProject = active?.kind === "project" ? PROJECTS.find(p => p.no === active.id) : null;
  const caption = !active ? "Point at anything"
    : active.kind === "tool" ? `${active.id} → ${projects.length ? `${projects.length} build${projects.length > 1 ? "s" : ""}` : "in the toolbox, not yet in a public build"}`
    : `${activeProject.title} ← ${tools.length} tools`;
  const totalTools = STACK.reduce((n, s) => n + s.items.length, 0);

  return (
    <section id="stack" className="relative py-28 sm:py-40">
      <div className="wrap">
        <Head num={num} label="Stack" aside="Wired to the work" a="What runs" b="underneath" />

        <Reveal delay={0.1} className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <p className="max-w-xl text-lg text-[var(--muted)]">Every tool, wired to the builds that actually use it. Bigger means used in more of them. Point at a tool or a project, or tap to pin it.</p>
          <div className="flex gap-8 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            <span><span className="font-display block text-3xl tracking-[-0.04em] text-[var(--ink)] normal-case">{totalTools}</span>tools</span>
            <span><span className="font-display block text-3xl tracking-[-0.04em] text-[var(--ink)] normal-case">{PROJECTS.length}</span>builds</span>
            <span><span className="font-display block text-3xl tracking-[-0.04em] text-[var(--accent)] normal-case">{busiest[0]}</span>most wired</span>
          </div>
        </Reveal>

        <div ref={box} className="relative mt-14 grid gap-12 border-t border-[var(--border)] pt-10 lg:grid-cols-[1fr_320px] lg:gap-28">
          <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 hidden h-full w-full overflow-visible lg:block">
            {wires.map(w => (
              <g key={w.key} style={{ color: w.color }}>
                <path d={w.d} fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1" className="wire-draw" pathLength="1" />
                <path d={w.d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" pathLength="1" className="wire-pulse" />
                <circle cx={w.x1} cy={w.y1} r="2.5" fill="currentColor" />
                <circle cx={w.x2} cy={w.y2} r="3.5" fill="currentColor" />
              </g>
            ))}
          </svg>

          <div className="space-y-9" onMouseLeave={leave}>
            {orderStack(STACK).map((s, i) => (
              <div key={s.cat}>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-2)]">
                  <span style={{ color: accent(s.accent) }}>{String(i + 1).padStart(2, "0")}</span> / {s.cat}
                </div>
                <div className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-1.5">
                  {s.items.map(it => {
                    const n = projectsOf[it]?.length || 0;
                    const lit = litTools.has(it);
                    return (
                      <button
                        key={it}
                        ref={el => { toolEls.current[it] = el; }}
                        type="button"
                        onMouseEnter={() => hover("tool", it)}
                        onFocus={() => hover("tool", it)}
                        onClick={() => tap("tool", it)}
                        aria-pressed={lit && pinned}
                        className={`font-display relative leading-[1.15] font-medium tracking-[-0.035em] transition-[color,opacity] duration-300 ${sizeFor(n)} ${active && !lit ? (active.auto ? "opacity-55" : "opacity-30") : "opacity-100"} ${lit ? "!text-[var(--accent)]" : ""} ${isHighlighted(it) ? "underline decoration-[var(--accent)] decoration-2 underline-offset-[0.18em]" : ""}`}
                      >
                        {it}
                        {n > 0 && <sup className="ml-0.5 font-mono text-[0.42em] tracking-normal text-[var(--muted)]">{n}</sup>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="flex min-h-[1.5em] items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-[var(--accent)]" : "bg-[var(--muted-2)]"}`} />
              <Decode key={caption} text={caption} speed={2} />
            </div>
            <ul className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-1" onMouseLeave={leave}>
              {PROJECTS.map(p => {
                const lit = litProjects.has(p.no);
                return (
                  <li key={p.no}>
                    <button
                      ref={el => { socketEls.current[p.no] = el; }}
                      type="button"
                      onMouseEnter={() => hover("project", p.no)}
                      onFocus={() => hover("project", p.no)}
                      onClick={() => tap("project", p.no)}
                      aria-pressed={lit && pinned}
                      style={{ "--c": accent(p.accent) }}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-300 ${lit ? "border-[var(--c)] bg-[var(--surface-hi)]" : `border-[var(--border)] ${active ? "opacity-40" : ""}`}`}
                    >
                      <span className={`h-2 w-2 shrink-0 rounded-full transition-all duration-300 ${lit ? "scale-125 bg-[var(--c)] shadow-[0_0_12px_var(--c)]" : "bg-[var(--muted-2)]"}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[var(--ink)]">{lit ? <Decode text={p.title} speed={3} /> : p.title}</span>
                        <span className="block font-mono text-[10px] text-[var(--muted-2)]">{p.no} · {toolsOf[p.no].size} tools</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {pinned && (
              <button type="button" onClick={() => { setPinned(false); setActive(null); }} className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)] hover:text-[var(--ink)]">
                Unpin ×
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

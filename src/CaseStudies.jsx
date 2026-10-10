import { useEffect, useRef, useState } from "react";

/* All figures below are taken from the MORPH, TRACE and LedgerGuard READMEs. */

const MORPH_PIPELINE = [
  { k: "Discover", t: "Two OpenAPI contracts → system model", d: "Each system's contract is parsed into a system model, with embeddings stored in pgvector for semantic matching." },
  { k: "Map", t: "Model proposals, deterministic validation", d: "The model proposes field mappings between mismatched schemas; plain code validates them and assigns confidence." },
  { k: "Review", t: "Human review gate", d: "If a required, writable target field isn't approved, the run is BLOCKED_PENDING_REVIEW — no model call, no code." },
  { k: "Generate", t: "Integration code + its own tests", d: "From approved mappings it writes the integration module and a generated test suite to go with it." },
  { k: "Gate", t: "Guards G1–G5 · AST · ruff · mypy strict", d: "Gates never loosen. The model can only change its own file — edited base tests, suppression comments, or extra type escapes are rejected." },
  { k: "Sandbox", t: "Locked-down Docker execution", d: "Read-only root, internal network with only the mocks, no capabilities, 256 MB, 0.5 CPU, 64 processes, 60 s." },
  { k: "Repair", t: "Bounded LangGraph repair loop", d: "Structured feedback drives at most 3 repairs. Every run ends READY or HUMAN_REVIEW_REQUIRED — never silently." },
  { k: "Expose", t: "Capabilities as MCP tools", d: "MORPH's capabilities are exposed over the Model Context Protocol, with a policy layer that gates every tool call before it runs." },
];

const MORPH_STATS = [["≤3", "bounded repairs"], ["5", "guards that never loosen"], ["413", "hidden oracle checks"], ["60s", "sandbox time limit"]];

const MORPH_FINDINGS = [
  ["READY is not correct", "One run passed every gate and test MORPH controls and still failed 14 oracle checks — a pipeline grading itself would have counted it."],
  ["Negative results stay in", "Conditions that reached READY on 0 of 3 are reported as results, in every denominator."],
  ["The oracle never feeds repair", "A source-level test forbids the repair package from importing oracle or answer-key code."],
];

const TRACE_PIPELINE = [
  { k: "Ingest", t: "Payment failure event", d: "Idempotency check first — a duplicate event logs and returns the existing case instead of opening a new one." },
  { k: "Classify", t: "Failure classification", d: "A deterministic code map, with an LLM/keyword fallback for free-text messages. It never guesses." },
  { k: "Decide", t: "Agent decision · HEURISTIC / LLM / ROUTED", d: "Is recovery worth pursuing, and what's the single best next action? ROUTED runs the free heuristic on every case and escalates to the LLM only on four uncertainty triggers." },
  { k: "Control", t: "Policy & control layer", d: "9 rules, 100% deterministic, zero dependency on the agent. Every proposal is APPROVED, BLOCKED, or FLAGGED_FOR_REVIEW before anything runs." },
  { k: "Execute", t: "Execution", d: "Email and logging are real. Payment completion is simulated — and clearly labelled as simulated everywhere." },
  { k: "Adapt", t: "Outcome → bounded reassessment", d: "Observe the outcome, reassess, and end in RECOVERED, STOPPED, ESCALATED, or EXPIRED." },
  { k: "Audit", t: "Immutable audit trail", d: "Every step is permanently recorded and fully explainable after the fact." },
];

const TRACE_TRIGGERS = [
  "Uncertain failure classification",
  "Top-two candidate actions too close to call",
  "High-value transaction with a failed prior attempt",
  "Case history the heuristic's fit table can't represent",
];

const TRACE_HEADLINE = [["+42%", "more revenue recovered"], ["+23%", "higher relative recovery rate"]];

const TRACE_BENCH = [
  { label: "Cases correctly never pursued", trace: 98, base: 43, fmt: v => v, note: "declined up front because expected return didn't justify the cost" },
  { label: "Recovery value per intervention", trace: 873.42, base: 766.2, fmt: v => `₹${v.toFixed(2)}`, note: "effort goes where it's worth it" },
  { label: "Total recovery actions taken", trace: 310, base: 249, fmt: v => v, note: "it doesn't win by trying less" },
];

const TRACE_ACTIONS = [
  ["RETRY_PAYMENT", true], ["SEND_RECOVERY_LINK", true], ["SUGGEST_ALTERNATIVE_METHOD", true],
  ["WAIT_AND_REASSESS", false], ["ESCALATE_FOR_REVIEW", false], ["STOP_RECOVERY", false],
];

const LG_PHASES = [
  ["Ledger Core", "v0.1", "Double-entry accounts and immutable postings; balances derived from the ledger."],
  ["Transaction Safety", "v0.2", "Full & partial refunds, single-use reversals, proven all-or-nothing writes."],
  ["Idempotency", "v0.3", "Required keys, byte-identical replay, exactly-one effect under concurrent duplicates."],
  ["Kafka Outbox", "v0.4", "Events written in the ledger transaction, published after commit, deduped by consumers."],
  ["Reconciliation", "v0.5", "Independent settlement source, six discrepancy classes, evidence-linked incidents."],
  ["Verification", "v0.6", "38 jqwik properties over randomized payments — one real defect found and fixed."],
  ["ChaosLab", "v0.7", "15 deterministic fault injections at the JDBC, broker, and clock seams."],
  ["Statistical Detection", "v0.8", "Five anomaly signals over robust statistics and exact discrete tails."],
  ["Isolation Forest", "v0.9", "Hand-rolled forest over an 11-feature vector — never blended with the composite."],
  ["Explanation Layer", "v0.10", "Signal contributions that sum to the composite; layer disagreement made legible."],
  ["LLM Explanation", "v0.11", "Groq narratives validated name-by-name and number-by-number before serving."],
  ["Validation", "v0.12", "Dispute-feed labels + blind review queue exposed a structural ceiling."],
  ["Ceiling Fix", "v0.13", "Weighted power mean of degree three — no weight or threshold tuned."],
  ["Ops Console", "v0.14", "Read-only React/TS console that can't imply more confidence than the backend."],
];

const LG_STATS = [["14", "locked, tagged phases"], ["38", "jqwik properties"], ["15", "chaos scenarios"], ["11", "forest features"]];

const tint = (color, pct) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;

function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function Panel({ children, className = "" }) {
  return <div className={`rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7 ${className}`}>{children}</div>;
}

function Label({ color = "var(--lime)", children }) {
  return <div className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color }}>{children}</div>;
}

function Pipeline({ stages, color, label, tagline, triggers, triggerAt }) {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setStep(s => (s + 1) % stages.length), 2200);
    return () => clearInterval(id);
  }, [paused, stages.length]);

  const cur = stages[step];

  return (
    <Panel className="h-full">
      <div className="flex items-center justify-between">
        <Label color={color}>{label}</Label>
        <span className="font-mono text-[10px] text-[var(--muted-2)]">{paused ? "paused" : "auto-playing"}</span>
      </div>
      <p className="mt-2 text-sm text-[var(--muted)]"><b className="font-medium text-[var(--ink)]">{tagline}</b> Hover or tap a stage to inspect it.</p>

      <div className="relative mt-6" onMouseLeave={() => setPaused(false)}>
        <ol className="space-y-1">
          {stages.map((s, i) => {
            const on = i === step, done = i < step;
            return (
              <li key={s.k} className="relative">
                {i < stages.length - 1 && (
                  <span className="absolute left-[15px] top-[41px] bottom-[-14px] w-px bg-[var(--border-hi)]">
                    <span className={`absolute inset-0 origin-top transition-transform duration-700 ease-out ${done ? "scale-y-100" : "scale-y-0"}`} style={{ background: color }} />
                  </span>
                )}
                <button
                  type="button"
                  onMouseEnter={() => { setPaused(true); setStep(i); }}
                  onFocus={() => { setPaused(true); setStep(i); }}
                  onClick={() => { setPaused(true); setStep(i); }}
                  className="relative flex w-full gap-4 rounded-xl py-2 pr-3 text-left transition-colors"
                  style={on ? { background: tint(color, 8) } : undefined}
                >
                  <span
                    className={`relative z-10 mt-0.5 flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full border font-mono text-[10px] transition-all duration-500 ${on ? "scale-110 text-black" : done ? "bg-[#141416]" : "border-[var(--border-hi)] bg-[#0f0f11] text-[var(--muted-2)]"}`}
                    style={on ? { background: color, borderColor: color, boxShadow: `0 0 24px ${tint(color, 55)}` } : done ? { borderColor: tint(color, 50), color } : undefined}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex min-w-0 items-baseline gap-2 pt-1.5">
                    <span className="w-16 shrink-0 font-mono text-[10px] uppercase tracking-wider" style={{ color: on ? color : "var(--muted-2)" }}>{s.k}</span>
                    <span className={`text-sm font-semibold transition-colors ${on ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}>{s.t}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div key={step} className="animate-fade-up mt-5 min-h-[11rem] rounded-2xl border p-5" style={{ borderColor: tint(color, 25), background: tint(color, 5) }}>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color }}>Stage {String(step + 1).padStart(2, "0")} · {cur.k}</div>
        <div className="mt-1.5 font-semibold text-[var(--ink)]">{cur.t}</div>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">{cur.d}</p>
        {triggers && cur.k === triggerAt && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {triggers.map(tr => <span key={tr} className="rounded-full border px-2 py-0.5 font-mono text-[10px]" style={{ color, borderColor: tint(color, 30), background: tint(color, 10) }}>{tr}</span>)}
          </div>
        )}
      </div>
    </Panel>
  );
}

function TraceBenchmark() {
  const [ref, inView] = useInView(0.3);
  return (
    <Panel>
      <div ref={ref}>
        <Label color="var(--rose)">Benchmark · 300 synthetic failed payments</Label>
        <p className="mt-2 text-sm text-[var(--muted)]">Same data, run through TRACE and through a static “retry → wait → remind → stop” baseline.</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {TRACE_HEADLINE.map(([n, l]) => (
            <div key={l} className="rounded-2xl border p-4" style={{ borderColor: tint("var(--rose)", 25), background: tint("var(--rose)", 6) }}>
              <div className="font-display text-4xl font-medium tracking-[-0.05em] text-[var(--ink)]">{n}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[var(--rose)]">{l}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-6">
          {TRACE_BENCH.map((m, mi) => {
            const max = Math.max(m.trace, m.base);
            return (
              <div key={m.label}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold text-[var(--ink)]">{m.label}</span>
                  <span className="text-right font-mono text-[10px] text-[var(--muted-2)]">{m.note}</span>
                </div>
                {[["TRACE", m.trace, "from-[var(--rose)] to-[#f9a8d4]", "text-[var(--ink)]"], ["Baseline", m.base, "from-[#46464d] to-[#5d5d66]", "text-[var(--muted)]"]].map(([name, v, grad, txt], bi) => (
                  <div key={name} className="mt-2 flex items-center gap-3">
                    <span className="w-16 shrink-0 font-mono text-[10px] uppercase tracking-wider text-[var(--muted-2)]">{name}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${grad} transition-[width] duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)]`}
                        style={{ width: inView ? `${(v / max) * 100}%` : "0%", transitionDelay: `${mi * 180 + bi * 90}ms` }}
                      />
                    </div>
                    <span className={`w-16 shrink-0 text-right font-mono text-xs ${txt}`}>{m.fmt(v)}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

function TraceActions() {
  return (
    <Panel>
      <Label color="var(--rose)">Bounded action space — nothing else exists</Label>
      <p className="mt-2 text-sm text-[var(--muted)]">It can't invent an action, change an amount, or move real money. The worst case is bounded by construction.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {TRACE_ACTIONS.map(([a, direct]) => (
          <div key={a} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-black/20 px-3 py-2">
            <span className="truncate font-mono text-[10.5px] text-[var(--ink)]">{a}</span>
            <span className={`shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[9px] ${direct ? "bg-[var(--emerald)]/15 text-[var(--emerald)]" : "bg-white/5 text-[var(--muted-2)]"}`}>{direct ? "recovers" : "holds"}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MorphFindings() {
  return (
    <Panel>
      <Label color="var(--lime)">Honest findings</Label>
      <p className="mt-2 text-sm text-[var(--muted)]">Correctness is judged by a hand-written oracle the pipeline never sees.</p>
      <div className="mt-5 space-y-3">
        {MORPH_FINDINGS.map(([h, d]) => (
          <div key={h} className="rounded-xl border border-[var(--border)] bg-black/20 p-4">
            <div className="text-sm font-semibold text-[var(--ink)]">{h}</div>
            <div className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">{d}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function StatGrid({ stats, from, to }) {
  return (
    <div className="grid grid-cols-2 gap-5">
      {stats.map(([n, l]) => (
        <Panel key={l} className="flex flex-col justify-end">
          <div className="font-display bg-clip-text text-5xl font-medium tracking-[-0.05em] text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}>{n}</div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">{l}</div>
        </Panel>
      ))}
    </div>
  );
}

function LedgerInvariant() {
  return (
    <Panel className="relative overflow-hidden">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[var(--emerald)]/10 blur-3xl" />
      <Label color="var(--emerald)">The invariant</Label>
      <blockquote className="relative mt-4 font-serif text-2xl leading-snug text-[var(--ink)] italic sm:text-3xl">
        “For every transaction, and for every currency within it, the sum of debits must equal the sum of credits.”
      </blockquote>
      <p className="relative mt-3 text-sm text-[var(--muted)]">An unbalanced transaction is never persisted — not partially, not at all. The check runs before a single INSERT, inside the same transaction boundary.</p>

      <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--emerald)]/30 bg-[var(--emerald)]/[0.06] p-4 font-mono text-[11px]">
          <div className="flex justify-between text-[var(--muted)]"><span>DEBIT</span><span>1000 USD</span></div>
          <div className="flex justify-between text-[var(--muted)]"><span>CREDIT</span><span>1000 USD</span></div>
          <div className="mt-2 flex justify-between border-t border-[var(--emerald)]/20 pt-2 text-[var(--emerald)]"><span>net USD = 0</span><span>✓ commit</span></div>
        </div>
        <div className="rounded-xl border border-[var(--amber)]/30 bg-[var(--amber)]/[0.06] p-4 font-mono text-[11px]">
          <div className="flex justify-between text-[var(--muted)]"><span>DEBIT</span><span>1000 USD</span></div>
          <div className="flex justify-between text-[var(--muted)]"><span>CREDIT</span><span>1000 EUR</span></div>
          <div className="mt-2 flex justify-between border-t border-[var(--amber)]/20 pt-2 text-[var(--amber)]"><span>per-currency ≠ 0</span><span>422 reject</span></div>
        </div>
      </div>
    </Panel>
  );
}

function LedgerPhases() {
  const [ref, inView] = useInView(0.15);
  return (
    <Panel>
      <div ref={ref} className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Label color="var(--emerald)">Built in locked phases</Label>
          <p className="mt-2 text-sm text-[var(--muted)]">Each phase is a git tag. Nothing beyond these fourteen is claimed.</p>
        </div>
        <span className="font-mono text-xs text-[var(--emerald)]">v0.1 → v0.14</span>
      </div>
      <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/[0.05]">
        <div className="h-full rounded-full bg-gradient-to-r from-[var(--emerald)] to-[var(--cyan)] transition-[width] duration-[1600ms] ease-[cubic-bezier(.22,1,.36,1)]" style={{ width: inView ? "100%" : "0%" }} />
      </div>
      <ol className="mt-5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {LG_PHASES.map(([name, tag, desc], i) => (
          <li
            key={tag}
            className={`group rounded-xl border border-[var(--border)] bg-black/20 p-3.5 transition-all duration-500 hover:-translate-y-0.5 hover:border-[var(--emerald)]/40 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
            style={{ transitionDelay: inView ? `${i * 45}ms` : "0ms" }}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[var(--muted-2)]">PHASE {String(i + 1).padStart(2, "0")}</span>
              <span className="rounded-full bg-[var(--emerald)]/10 px-2 py-0.5 font-mono text-[9px] text-[var(--emerald)]">{tag}</span>
            </div>
            <div className="mt-1.5 text-sm font-semibold text-[var(--ink)]">{name}</div>
            <div className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{desc}</div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

const TABS = [
  { id: "morph", name: "MORPH", sub: "Autonomous AI integration engineer", color: "var(--lime)", gh: "https://github.com/vahinichilukamarri/MORPH-Autonomous-AI-Integration-Engineer" },
  { id: "trace", name: "TRACE", sub: "AI revenue-recovery agent", color: "var(--rose)", gh: "https://github.com/vahinichilukamarri/TRACE", live: "https://trace-xi-nine.vercel.app" },
  { id: "ledger", name: "LedgerGuard", sub: "Payment integrity platform", color: "var(--emerald)", gh: "https://github.com/vahinichilukamarri/LedgerGuard" },
];

export default function CaseStudies({ num, Head }) {
  const [tab, setTab] = useState("morph");
  const current = TABS.find(t => t.id === tab);
  const idx = TABS.indexOf(current);

  return (
    <section id="deepdive" className="relative py-28 sm:py-40">
      <div className="wrap">
        <Head num={num} label="Deep Dive" aside="Numbers from the repos' own reports" a="Open" b="the hood" />
        <div className="mt-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <p className="max-w-2xl text-lg text-[var(--muted)]">The three flagship systems, taken apart. Every number here comes from the repositories' own benchmark and test reports.</p>
          <div role="tablist" aria-label="Case study" className="relative grid grid-cols-3 self-start rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 backdrop-blur-xl lg:self-auto">
            <span
              className="absolute top-1 bottom-1 rounded-full transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
              style={{ left: `calc(4px + ${idx} * (100% - 8px) / 3)`, width: "calc((100% - 8px) / 3)", background: tint(current.color, 18), boxShadow: `inset 0 0 0 1px ${tint(current.color, 45)}` }}
            />
            {TABS.map(t => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className="relative z-10 w-[6.6rem] rounded-full px-3 py-2.5 text-center font-mono text-[11px] uppercase tracking-wider transition-colors sm:w-40 sm:text-xs"
                style={{ color: tab === t.id ? t.color : "var(--muted)" }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div key={tab} className="animate-fade-up mt-10">
          <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="font-mono text-xs" style={{ color: current.color }}>{current.sub}</span>
            <a href={current.gh} target="_blank" rel="noreferrer" className="font-mono text-xs text-[var(--muted)] transition-colors hover:text-[var(--ink)]">Source ↗</a>
            {current.live && <a href={current.live} target="_blank" rel="noreferrer" className="font-mono text-xs text-[var(--muted)] transition-colors hover:text-[var(--ink)]">Live app ↗</a>}
          </div>

          {tab === "morph" && (
            <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
              <Pipeline stages={MORPH_PIPELINE} color="var(--lime)" label="Discover → generate → verify → repair" tagline="The model proposes. Deterministic code decides." />
              <div className="grid content-start gap-5">
                <StatGrid stats={MORPH_STATS} from="var(--lime)" to="var(--cyan)" />
                <MorphFindings />
              </div>
            </div>
          )}
          {tab === "trace" && (
            <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
              <Pipeline stages={TRACE_PIPELINE} color="var(--rose)" label="Orchestration loop" tagline="The agent decides. The policy controls." triggers={TRACE_TRIGGERS} triggerAt="Decide" />
              <div className="grid gap-5">
                <TraceBenchmark />
                <TraceActions />
              </div>
            </div>
          )}
          {tab === "ledger" && (
            <div className="grid gap-5">
              <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                <LedgerInvariant />
                <StatGrid stats={LG_STATS} from="var(--emerald)" to="var(--cyan)" />
              </div>
              <LedgerPhases />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

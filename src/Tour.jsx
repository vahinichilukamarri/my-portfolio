import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE, scrollToY } from "./smooth";

/* The 60-second recruiter tour: the page drives itself through the
   highlights while a caption bar narrates. Any manual scroll pauses it;
   arrows step, space pauses, Esc exits. */

const STEP_MS = 6500;

const STEPS = [
  { target: "hero", label: "Hello", caption: "Vahini — final-year CSE at KMIT (CGPA 9.12), building AI systems that are verified, not trusted." },
  { target: "hero-frame", label: "At a glance", caption: "TRACE recovered 42% more revenue than a rules baseline, there's an accepted research paper, and nine shipped builds." },
  { target: "experience", label: "Experience", caption: "Salesforce Mentorship: a microservice health orchestrator — dependency graphs from OpenTelemetry, root-cause ranking, blast radius. Plus co-author of AgentShield AI, to appear Jan 2027." },
  { target: "flagships", nth: 0, label: "MORPH", caption: "An agent that writes API integrations and ships its own test suites. Failures get at most three bounded repairs, then a human." },
  { target: "flagships", nth: 1, label: "TRACE", caption: "A payment-recovery agent behind a deterministic 9-rule policy layer — 42% more revenue than a rules baseline on 300 cases." },
  { target: "flagships", nth: 2, label: "LedgerGuard", caption: "A Java double-entry ledger proven with 38 property-based tests and 15 deterministic fault injections." },
  { target: "live-trace", label: "Live", caption: "And TRACE is running in production — embedded right here. Click the screen to try it." },
  { target: "recognition", label: "Recognition", caption: "Winner of Centific Premier Hackathon 2.0, which came with an AI Engineer internship offer." },
  { target: "contact", label: "Say hi", caption: "Open to SWE and AI internships. Email, LinkedIn, or the resume — it's all here." },
];

function targetY(step) {
  const el = document.getElementById(step.target);
  if (!el) return null;
  const top = el.getBoundingClientRect().top + window.scrollY;
  if (step.nth == null) return Math.max(0, top - (step.target === "hero" ? 0 : 72));
  const child = el.children[step.nth];
  if (!child) return top;
  // Flagships are sticky on desktop: card n is in view one viewport further down.
  return getComputedStyle(child).position === "sticky" ? top + step.nth * window.innerHeight : top + child.offsetTop - 72;
}

// Mounted only while running (App wraps it in AnimatePresence), so every
// start begins from step one with fresh state.
export default function Tour({ onClose }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const elapsed = useRef(0);

  const go = useCallback(n => {
    const next = Math.max(0, Math.min(STEPS.length - 1, n));
    elapsed.current = 0;
    setProgress(0);
    setI(next);
  }, []);

  // Scroll to each step.
  useEffect(() => {
    const y = targetY(STEPS[i]);
    if (y != null) scrollToY(y, 1.5);
  }, [i]);

  // Step timer.
  useEffect(() => {
    if (!playing) return;
    let raf, last = performance.now();
    const tick = now => {
      elapsed.current += now - last;
      last = now;
      const p = Math.min(elapsed.current / STEP_MS, 1);
      setProgress(p);
      if (p >= 1) {
        if (i >= STEPS.length - 1) { setPlaying(false); return; }
        go(i + 1);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, i, go]);

  // Manual scrolling pauses; keyboard controls.
  useEffect(() => {
    const pause = () => setPlaying(false);
    const onKey = e => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
      else if (e.key === " " && !/input|textarea/i.test(e.target.tagName)) { e.preventDefault(); setPlaying(p => !p); }
    };
    window.addEventListener("wheel", pause, { passive: true });
    window.addEventListener("touchmove", pause, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", pause);
      window.removeEventListener("touchmove", pause);
      window.removeEventListener("keydown", onKey);
    };
  }, [i, go, onClose]);

  const step = STEPS[i];
  const last = i === STEPS.length - 1;
  const done = last && progress >= 1;

  return (
        <motion.div
          role="dialog"
          aria-label="Guided tour"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="fixed inset-x-3 bottom-3 z-[88] mx-auto max-w-2xl overflow-hidden rounded-3xl border border-[var(--border-hi)] bg-[#111113]/92 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.95)] backdrop-blur-2xl sm:bottom-6"
        >
          <div className="flex gap-1 px-5 pt-4">
            {STEPS.map((s, n) => (
              <button key={n} onClick={() => go(n)} aria-label={`Step ${n + 1}: ${s.label}`} className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full origin-left bg-[var(--accent)]" style={{ transform: `scaleX(${n < i ? 1 : n === i ? progress : 0})` }} />
              </button>
            ))}
          </div>

          <div className="flex items-start gap-4 p-5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                <span className="text-[var(--accent)]">{String(i + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}</span>
                <span>{step.label}</span>
                {!playing && !done && <span className="text-[var(--amber)]">Paused</span>}
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="mt-2 text-[15px] leading-relaxed text-[var(--ink)] sm:text-base"
                >
                  {step.caption}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous step" className="hidden h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] transition-colors hover:text-[var(--ink)] disabled:opacity-30 sm:flex">←</button>
              {done ? (
                <button onClick={onClose} className="h-9 rounded-full bg-[var(--accent)] px-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--bg)]">Done</button>
              ) : (
                <button onClick={() => setPlaying(p => !p)} aria-label={playing ? "Pause tour" : "Resume tour"} className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--bg)]">
                  {playing ? (
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                  )}
                </button>
              )}
              <button onClick={() => go(i + 1)} disabled={last} aria-label="Next step" className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] transition-colors hover:text-[var(--ink)] disabled:opacity-30">→</button>
              <button onClick={onClose} aria-label="Exit tour" className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:text-[var(--ink)]">✕</button>
            </div>
          </div>
        </motion.div>
  );
}

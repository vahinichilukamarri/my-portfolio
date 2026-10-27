import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE, scrollToId } from "./smooth";
import { ask } from "./ask-client";

/* "Ask my portfolio" — a recruiter can ask anything about Vahini and get a
   short answer grounded in this site, with numbered sources that jump to the
   section they came from. If the model is unreachable it falls back to plain
   keyword retrieval over the same sources. Open it from anywhere with
   window.dispatchEvent(new CustomEvent("ask:open", { detail: { question } })). */

const SUGGESTIONS = [
  "What's her strongest AI project?",
  "Has she worked with Kafka or distributed systems?",
  "Is any of her work live?",
  "What is she looking for, and how do I reach her?",
];

function Spark({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2c.4 4.6 2.4 7.6 8 10-5.6 2.4-7.6 5.4-8 10-.4-4.6-2.4-7.6-8-10 5.6-2.4 7.6-5.4 8-10Z" />
    </svg>
  );
}

/* Renders "…sentence [1][2]." with clickable citation marks. When an answer
   cites anything, sentences that cite nothing are dimmed — they're unverified. */
export function AnswerText({ text, sources, onSource }) {
  const sentences = text.match(/[^.!?]+[.!?]+(?:\[\d+\])*|[^.!?]+$/g) || [text];
  const anyCited = sources.length > 0;
  return (
    <p className="text-[14.5px] leading-relaxed">
      {sentences.map((s, i) => {
        const cited = /\[\d+\]/.test(s);
        const parts = s.split(/(\[\d+\])/g);
        return (
          <span key={i} className={anyCited && !cited ? "text-[var(--muted-2)]" : "text-[var(--ink)]"} title={anyCited && !cited ? "No source cited — treat as unverified" : undefined}>
            {parts.map((p, j) => {
              const m = p.match(/^\[(\d+)\]$/);
              if (!m) return <Fragment key={j}>{p}</Fragment>;
              const src = sources[Number(m[1]) - 1];
              return (
                <button key={j} type="button" onClick={() => src && onSource(src)} className="mx-[1px] inline-flex h-4 min-w-4 -translate-y-1 items-center justify-center rounded bg-[var(--accent)]/15 px-1 align-baseline font-mono text-[9.5px] text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--bg)]" aria-label={src ? `Source: ${src.label}` : undefined}>
                  {m[1]}
                </button>
              );
            })}
          </span>
        );
      })}
    </p>
  );
}

export function SourceChips({ sources, onSource }) {
  if (!sources.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {sources.map((s, i) => (
        <button key={s.id} type="button" onClick={() => onSource(s)} className="group flex items-center gap-1.5 rounded-full border border-[var(--border-hi)] py-1 pr-2.5 pl-1 font-mono text-[10px] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)]">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[9px] text-[var(--accent)]">{i + 1}</span>
          {s.label}
          <span className="transition-transform duration-300 group-hover:translate-x-0.5">↗</span>
        </button>
      ))}
    </div>
  );
}

export default function AskAgent({ hidden = false }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const busyRef = useRef(false);

  const submit = async q => {
    const question = q.trim();
    if (!question || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setInput("");
    setMsgs(m => [...m, { role: "user", text: question }]);
    const out = await ask(question);
    setMsgs(m => [...m, { role: "bot", ...out }]);
    busyRef.current = false;
    setBusy(false);
    inputRef.current?.focus({ preventScroll: true });
  };
  const submitRef = useRef(submit);
  useEffect(() => { submitRef.current = submit; });

  useEffect(() => {
    const onOpen = e => {
      setOpen(true);
      const q = e.detail?.question;
      if (q) submitRef.current(q);
    };
    window.addEventListener("ask:open", onOpen);
    return () => window.removeEventListener("ask:open", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 350);
    const onKey = e => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  const goSource = s => {
    if (window.innerWidth < 768) setOpen(false);
    scrollToId(s.section);
  };

  return (
    <>
      <AnimatePresence>
        {!open && !hidden && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.5, ease: EASE }}
            onClick={() => setOpen(true)}
            className="group fixed bottom-5 left-5 z-[85] flex items-center gap-2.5 rounded-full border border-[var(--border-hi)] bg-[#111113]/85 py-2 pr-4 pl-2 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-colors hover:border-[var(--accent)]/60 sm:bottom-6 sm:left-6"
            aria-label="Ask my portfolio — AI assistant"
          >
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--bg)]">
              <Spark className="h-4 w-4 transition-transform duration-500 group-hover:rotate-90" />
              <span className="pulse-dot absolute inset-0 rounded-full" />
            </span>
            <span className="text-left leading-tight">
              <span className="block text-[13px] font-medium text-[var(--ink)]">Ask about me</span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted)]">AI · answers with sources</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Ask my portfolio"
            initial={{ opacity: 0, y: 30, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 30, scale: 0.96, filter: "blur(8px)" }}
            transition={{ duration: 0.45, ease: EASE }}
            style={{ transformOrigin: "0% 100%" }}
            className="fixed bottom-3 left-3 z-[90] flex h-[min(620px,calc(100dvh-1.5rem))] w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-3xl border border-[var(--border-hi)] bg-[#111113]/95 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95)] backdrop-blur-2xl sm:bottom-6 sm:left-6 sm:w-[420px]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--bg)]"><Spark className="h-4 w-4" /></span>
                <div>
                  <div className="font-display text-[17px] font-medium tracking-[-0.02em]">Ask my portfolio</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">Answers only from this site · cited</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] transition-colors hover:text-[var(--ink)]">✕</button>
            </div>

            <div ref={listRef} data-lenis-prevent className="flex-1 space-y-5 overflow-y-auto p-5">
              {msgs.length === 0 && (
                <div>
                  <p className="font-serif text-[22px] leading-snug italic">Hi — ask me anything about Vahini’s work.</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">I only answer from what’s on this site, and every claim links to its source. If something isn’t here, I’ll say so.</p>
                  <div className="mt-5 space-y-2">
                    {SUGGESTIONS.map((s, i) => (
                      <motion.button
                        key={s}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: EASE }}
                        onClick={() => submit(s)}
                        className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--border)] px-4 py-3 text-left text-sm text-[var(--muted)] transition-colors hover:border-[var(--border-hi)] hover:bg-[var(--surface-hi)] hover:text-[var(--ink)]"
                      >
                        {s}
                        <span className="text-[var(--accent)] transition-transform duration-300 group-hover:translate-x-1">→</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {msgs.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
                  {m.role === "user" ? (
                    <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-[var(--ink)] px-4 py-2.5 text-[14px] text-[var(--bg)]">{m.text}</div>
                  ) : (
                    <div className="max-w-[95%]">
                      {m.kind === "fallback" && <div className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--amber)]">Offline mode · keyword match</div>}
                      {m.kind === "answer"
                        ? <AnswerText text={m.answer} sources={m.sources} onSource={goSource} />
                        : <p className="text-[14.5px] leading-relaxed text-[var(--ink)]">{m.answer}</p>}
                      <SourceChips sources={m.sources} onSource={goSource} />
                      {m.kind === "answer" && !m.grounded && <div className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--muted-2)]">No sources cited</div>}
                    </div>
                  )}
                </motion.div>
              ))}

              {busy && (
                <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--muted)]">
                  <span className="flex gap-1">
                    {[0, 1, 2].map(d => (
                      <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }} />
                    ))}
                  </span>
                  Checking the sources…
                </div>
              )}
            </div>

            <form onSubmit={e => { e.preventDefault(); submit(input); }} className="flex items-center gap-2 border-t border-[var(--border)] p-3">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                maxLength={400}
                placeholder="Ask about projects, skills, experience…"
                aria-label="Your question"
                className="min-w-0 flex-1 rounded-full bg-white/[0.04] px-4 py-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted-2)] focus:bg-white/[0.06]"
              />
              <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--bg)] transition-opacity disabled:opacity-30">↑</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

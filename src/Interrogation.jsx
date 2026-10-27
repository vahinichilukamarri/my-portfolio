import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { EASE, scrollToId } from "./smooth";
import { AnswerText, SourceChips } from "./AskAgent";
import { ask } from "./ask-client";
import { Decode } from "./motion";

/* (07) Interrogation — a pinned, full-screen scene. An eye drawn entirely in
   ASCII glyphs assembles out of noise as you scroll in, follows the cursor,
   and once it's fully open you can ask it anything. Answers come from the
   same cited "Ask my portfolio" backend as the floating assistant. */

const RAMP = " .,:;-=+*#%@";
const NOISE = "!<>-_\\/[]{}=+*^?#01";
const LINES = [
  "You've scrolled a long way.",
  "Past the agents, the ledgers, the paper.",
  "Something is still unanswered.",
];
const PROMPTS = ["What's her strongest AI project?", "Is any of her work live?", "Why should we hire her?", "How do I reach her?"];
const STAGES = [0.06, 0.2, 0.34, 0.5];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
const noiseChar = () => NOISE[(Math.random() * NOISE.length) | 0];
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* The ASCII eye. Draws to a canvas only while the section is on screen,
   capped at ~30fps; reduced motion gets a single still, fully open frame. */
function GlyphEye({ progress, busy, topRef, fitRef }) {
  const ref = useRef(null);
  const busyRef = useRef(busy);
  useEffect(() => { busyRef.current = busy; }, [busy]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const still = reducedMotion();
    const css = getComputedStyle(document.documentElement);
    const INK = css.getPropertyValue("--ink").trim() || "#f0ede6";
    const LIME = css.getPropertyValue("--lime").trim() || "#d4ff3f";
    let W = 0, H = 0, cw = 0, ch = 0, cols = 0, rows = 0, mobile = false;
    let raf = 0, visible = false, last = 0, pointer = false;
    let blinkAt = 2.5, dil = 0, fitR = 0, fitCy = 0, floor = 0;
    const gaze = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height; mobile = W < 640;
      canvas.width = W * dpr; canvas.height = H * dpr;
      const fs = mobile ? 9 : 12;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${fs}px "Geist Mono", ui-monospace, monospace`;
      ctx.textBaseline = "top";
      cw = ctx.measureText("M").width; ch = fs * 1.18;
      cols = Math.ceil(W / cw); rows = Math.ceil(H / ch);
      if (still) draw(0);
    };

    const draw = now => {
      const s = now / 1000;
      const p = still ? 1 : progress.get();
      const assemble = still ? 1 : ease(0, 0.3, p);
      let open = still ? 1 : ease(0.16, 0.48, p);

      if (!still) {
        if (s > blinkAt + 0.2) blinkAt = s + 2.8 + Math.random() * 4;
        if (s > blinkAt) open *= 1 - Math.sin(clamp((s - blinkAt) / 0.2) * Math.PI);
        if (!pointer) { gaze.tx = Math.sin(s * 0.45) * 0.7; gaze.ty = Math.sin(s * 0.31) * 0.5; }
        gaze.x += (gaze.tx - gaze.x) * 0.08;
        gaze.y += (gaze.ty - gaze.y) * 0.08;
        dil += ((busyRef.current ? 1 : 0) - dil) * 0.06;
      }

      // Fit the eye into the free band between the header and the text block,
      // re-measured every frame so it never overlaps the copy as that grows.
      const box = canvas.getBoundingClientRect();
      const top = (topRef.current?.getBoundingClientRect().bottom ?? box.top + 100) - box.top + 16;
      floor = (fitRef.current?.getBoundingClientRect().top ?? box.bottom) - box.top - 20;
      const band = Math.max(40, floor - top);
      const tR = Math.min(W * (mobile ? 0.48 : 0.44), band / 2 / 0.72); // 0.72R = lid + crease half-height
      const tCy = top + band / 2;
      const k = still || !fitR ? 1 : 0.18;
      fitR += (tR - fitR) * k;
      fitCy += (tCy - fitCy) * k;
      const cx = W / 2, cy = fitCy, R = fitR;
      const ix = gaze.x * 0.36, iy = gaze.y * 0.16;
      const irisR = 0.3, pupilR = 0.12 + 0.1 * dil;
      const spin = s * (0.35 + dil * 5);
      const buckets = [[], [], [], [], []]; // ink lo / mid / hi, lime, noise

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const th = hash(c, r);
          if (th > assemble) {
            if (assemble > 0 && th - assemble < 0.06) buckets[4].push(c, r, noiseChar());
            continue;
          }
          const u = (c * cw + cw / 2 - cx) / R;
          const v = (r * ch + ch / 2 - cy) / R;
          const lid = Math.max(0, 1 - u * u);
          const hgt = 0.54 * lid * open;
          const d = Math.abs(v) - hgt;
          let b = 0, lime = false;

          if (lid > 0 && d < 0) {
            const di = Math.hypot(u - ix, (v - iy) * 1.05);
            if (Math.hypot(u - ix + 0.11, v - iy + 0.11) < 0.05) b = 1;
            else if (di < pupilR) b = busyRef.current ? (hash(c + s, r) > 0.8 ? 0.4 : 0) : 0;
            else if (di < irisR) {
              const a = Math.atan2(v - iy, u - ix);
              lime = true;
              b = di > irisR - 0.035 || di < pupilR + 0.03 ? 1 : 0.45 + 0.35 * Math.sin(a * 16 + spin + di * 10);
            } else b = 0.14 + 0.22 * clamp(-d / (hgt + 0.001));
          } else if (lid > 0 && Math.abs(d) < 0.028) {
            b = 0.95;
          } else if (lid > 0 && v < 0 && Math.abs(-v - hgt - 0.13 * lid) < 0.02) {
            b = 0.4; // upper crease
          } else {
            const dist = Math.hypot(u, v * 1.4);
            const wave = Math.sin(dist * 10 - s * 1.6) * Math.sin(Math.atan2(v, u) * 3 + s * 0.3);
            b = Math.max(0, wave) * 0.32 / (1 + dist * 1.5) * clamp((floor - r * ch) / 80); // fade out above the copy
          }

          const k = Math.round(clamp(b) * (RAMP.length - 1));
          if (!k) continue;
          const bucket = lime ? 3 : b > 0.7 ? 2 : b > 0.3 ? 1 : 0;
          buckets[bucket].push(c, r, RAMP[k]);
        }
      }

      ctx.clearRect(0, 0, W, H);
      const styles = [[INK, 0.22], [INK, 0.5], [INK, 0.95], [LIME, 0.95], [LIME, 0.45]];
      buckets.forEach((cells, i) => {
        ctx.fillStyle = styles[i][0];
        ctx.globalAlpha = styles[i][1];
        for (let j = 0; j < cells.length; j += 3) ctx.fillText(cells[j + 2], cells[j] * cw, cells[j + 1] * ch);
      });
      ctx.globalAlpha = 1;
    };

    const loop = now => {
      raf = requestAnimationFrame(loop);
      if (now - last < 33) return;
      last = now;
      draw(now);
    };

    const onMove = e => {
      if (e.pointerType === "touch") return;
      pointer = true;
      const r = canvas.getBoundingClientRect();
      gaze.tx = clamp((e.clientX - r.left - r.width / 2) / (r.width / 2), -1, 1);
      gaze.ty = clamp((e.clientY - r.top - fitCy) / (r.height / 2), -1, 1);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !still) raf = requestAnimationFrame(loop);
    });
    const ro = new ResizeObserver(resize);
    io.observe(canvas);
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove);
    document.fonts?.ready.then(resize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [progress, topRef, fitRef]);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}

function Answer({ ex, onSource }) {
  const [decoded, setDecoded] = useState(false);
  const plain = ex.answer?.replace(/\s*\[\d+\]/g, "") ?? "";
  return (
    <div>
      <div className="font-mono text-[11px] text-[var(--muted)]"><span className="text-[var(--accent)]">&gt;</span> {ex.question}</div>
      <div className="mt-3">
        {ex.answer == null ? (
          <div className="font-mono text-[12px] text-[var(--accent)]"><Decode text="checking sources" speed={0.6} /> <span className="animate-caret">▍</span></div>
        ) : decoded ? (
          <>
            <AnswerText text={ex.answer} sources={ex.sources} onSource={onSource} />
            <SourceChips sources={ex.sources} onSource={onSource} />
          </>
        ) : (
          <p className="text-[14.5px] leading-relaxed text-[var(--ink)]"><Decode text={plain} speed={2.4} onDone={() => setDecoded(true)} /></p>
        )}
      </div>
    </div>
  );
}

export default function Interrogation({ num = "07" }) {
  const ref = useRef(null);
  const inputRef = useRef(null);
  const headRef = useRef(null);
  const copyRef = useRef(null);
  const busyRef = useRef(false);
  const [stage, setStage] = useState(0);
  const [ex, setEx] = useState(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", p => setStage(STAGES.filter(t => p >= t).length));
  const ready = stage >= STAGES.length;

  const submit = async q => {
    const question = q.trim();
    if (!question || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setInput("");
    setEx({ id: Date.now(), question, answer: null, sources: [] });
    const out = await ask(question);
    setEx(e => ({ ...e, answer: out.answer, sources: out.sources || [] }));
    busyRef.current = false;
    setBusy(false);
  };

  const onSource = s => s.section && scrollToId(s.section);
  const status = busy ? "Thinking" : ready ? "Listening" : "Waking up";

  return (
    <section id="ask" ref={ref} className="relative h-[340vh]" aria-label="Ask my portfolio">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <GlyphEye progress={scrollYProgress} busy={busy} topRef={headRef} fitRef={copyRef} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_44%,transparent_30%,var(--bg)_100%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/80 to-transparent" />

        <div className="wrap relative flex h-full flex-col pt-24 pb-24">
          <div ref={headRef} className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
            <span className="shrink-0"><span className="text-[var(--accent)]">({num})</span> Interrogation</span>
            <span className="h-px flex-1 bg-[var(--border-hi)]" />
            <span className="flex shrink-0 items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${busy ? "animate-pulse bg-[var(--accent)]" : ready ? "pulse-dot bg-[var(--emerald)]" : "bg-[var(--muted-2)]"}`} />
              {status}
            </span>
          </div>

          <div ref={copyRef} className="mt-auto grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-12">
            <div>
              {!ex && !ready && (
                <ul className="space-y-1.5 font-mono text-[12px] text-[var(--muted)] sm:text-[13px]">
                  {LINES.map((l, i) => (
                    <li key={l} className="min-h-[1.5em]">{stage > i && <><span className="text-[var(--accent)]">//</span> <Decode text={l} /></>}</li>
                  ))}
                </ul>
              )}
              <AnimatePresence>
                {ready && (
                  <motion.h2
                    initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 20, filter: "blur(12px)" }}
                    transition={{ duration: 0.9, ease: EASE }}
                    className="font-display mt-5 text-[clamp(2.6rem,7.5vw,7rem)] leading-[0.9] font-medium tracking-[-0.055em]"
                  >
                    So — ask me <em className="font-serif font-normal tracking-[-0.02em] text-[var(--accent)] italic">anything.</em>
                  </motion.h2>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              {ex && ready && (
                <motion.div
                  key={ex.id}
                  data-lenis-prevent
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="max-h-[32svh] overflow-y-auto rounded-2xl border border-[var(--border-hi)] bg-[var(--bg)]/70 p-5 backdrop-blur-xl lg:max-h-[42svh]"
                >
                  <Answer ex={ex} onSource={onSource} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            inert={!ready}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.7, ease: EASE, delay: ready ? 0.25 : 0 }}
            className={`mt-6 ${ready ? "" : "hidden"}`}
          >
            <form onSubmit={e => { e.preventDefault(); submit(input); }} className="group flex items-center gap-3 border-b border-[var(--border-hi)] pb-3 transition-colors focus-within:border-[var(--accent)]">
              <span className="font-mono text-lg text-[var(--accent)]">&gt;</span>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                maxLength={400}
                autoComplete="off"
                spellCheck={false}
                aria-label="Ask a question about Vahini"
                placeholder="Type a question and press enter"
                className="font-display min-w-0 flex-1 bg-transparent text-[clamp(1.1rem,2.4vw,1.8rem)] tracking-[-0.02em] text-[var(--ink)] outline-none placeholder:text-[var(--muted-2)]"
              />
              <button type="submit" disabled={busy || !input.trim()} data-cursor="Ask" className="flex h-11 shrink-0 items-center rounded-full bg-[var(--accent)] px-5 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--bg)] transition-opacity disabled:opacity-30">
                {busy ? "…" : "Ask ↵"}
              </button>
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {PROMPTS.map(q => (
                <button key={q} type="button" disabled={busy} onClick={() => submit(q)} className="rounded-full border border-[var(--border)] bg-[var(--bg)]/50 px-3 py-1.5 font-mono text-[11px] text-[var(--muted)] backdrop-blur transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)] disabled:opacity-40">
                  {q}
                </button>
              ))}
              <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("ask:open"))} className="ml-auto hidden font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)] transition-colors hover:text-[var(--ink)] sm:block">
                Open full chat ↗
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

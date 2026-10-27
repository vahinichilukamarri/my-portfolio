import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useIsPresent, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import "./App.css";
import ContactWallet from "./Contactwallet";
import Cursor from "./Cursor";
import HandOfCards from "./HandOfCards";
import NeuralField from "./NeuralField";
import CommandPalette from "./CommandPalette";
import CaseStudies from "./CaseStudies";
import Recognition from "./Recognition";
import AskAgent from "./AskAgent";
import Tour from "./Tour";
import Interrogation from "./Interrogation";
import { PROFILE, PROFILES, isHighlighted, orderProjects, orderStack, tailoredUrl } from "./profiles";
import { BlurText, Counter, FillButton, LineMask, Magnetic, Reveal, ScrubText } from "./motion";
import { EASE, scrollToId, useSmoothScroll } from "./smooth";
import { EDUCATION, EXPERIENCE, HIGHLIGHTS, LINKS, NAV, PROJECTS, PUBLICATION, STACK, TICKER } from "./data";
import { LINKEDIN_POSTS } from "./posts";

const accent = a => `var(--${a})`;

/* ══════════════════════════════════════════════════════════
   SMALL HELPERS
   ══════════════════════════════════════════════════════════ */
const fmtClock = () => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date());

function useClock() {
  const [t, setT] = useState(fmtClock);
  useEffect(() => {
    const id = setInterval(() => setT(fmtClock()), 10000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function useIsDesktop() {
  const q = "(min-width: 1024px)";
  const [is, setIs] = useState(() => typeof window !== "undefined" && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setIs(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return is;
}

function Title({ a, b, c, className = "" }) {
  return (
    <h2 className={`font-display text-[clamp(2.6rem,7.2vw,6.8rem)] leading-[0.94] font-medium tracking-[-0.05em] ${className}`}>
      {a && <BlurText text={a} />}{" "}
      {b && <em className="font-serif font-normal italic tracking-[-0.02em] text-[var(--accent)]"><BlurText text={b} delay={0.12} /></em>}{" "}
      {c && <BlurText text={c} delay={0.2} />}
    </h2>
  );
}

function SectionHead({ num, label, aside, ...title }) {
  return (
    <div>
      <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
        <span className="shrink-0"><span className="text-[var(--accent)]">({num})</span> {label}</span>
        <motion.span
          className="h-px flex-1 origin-left bg-[var(--border-hi)]"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: EASE }}
        />
        {aside && <span className="hidden shrink-0 sm:inline">{aside}</span>}
      </div>
      <Title className="mt-8" {...title} />
    </div>
  );
}

function Arrow({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-[1em] w-[1em] ${className}`} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

function LivePill({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-[var(--emerald)]/40 bg-[var(--emerald)]/10 px-2 py-0.5 font-mono text-[9px] tracking-[0.14em] text-[var(--emerald)] uppercase ${className}`}>
      <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[var(--emerald)]" />Live
    </span>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return <motion.div aria-hidden="true" style={{ scaleX }} className="fixed top-0 left-0 z-[60] h-[2px] w-full origin-left bg-[var(--accent)]" />;
}

/* ══════════════════════════════════════════════════════════
   INTRO — word flipper + counter, then a staggered column shutter.
   Once per session; any key or click skips it.
   ══════════════════════════════════════════════════════════ */
const IntroOrb = lazy(() => import("./IntroOrb"));
const INTRO_WORDS = ["agents", "evals", "ledgers", "pipelines"];
const INTRO_COLS = 6;
const SHUTTER = [0.76, 0, 0.24, 1];

function Intro({ onDone }) {
  const [n, setN] = useState(0);
  const [w, setW] = useState(0);
  const final = w >= INTRO_WORDS.length;
  const present = useIsPresent();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const c = animate(0, 100, { duration: 2.2, ease: [0.65, 0, 0.35, 1], onUpdate: v => setN(Math.round(v)) });
    const iv = setInterval(() => setW(i => Math.min(i + 1, INTRO_WORDS.length)), 360);
    const t = setTimeout(onDone, 2750);
    const skip = () => onDone();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      c.stop(); clearInterval(iv); clearTimeout(t);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      document.body.style.overflow = prev;
    };
  }, [onDone]);

  return (
    <motion.div className="fixed inset-0 z-[100]" exit={{ opacity: 1 }} transition={{ duration: 1.5 }} aria-hidden="true">
      <div className="absolute inset-0 flex">
        {Array.from({ length: INTRO_COLS }).map((_, i) => (
          <motion.div
            key={i}
            className="relative h-full flex-1 bg-[#121211] shadow-[inset_-1px_0_0_rgba(255,255,255,0.035)]"
            exit={{ y: "-104%" }}
            transition={{ duration: 1, delay: 0.12 + i * 0.07, ease: SHUTTER }}
          >
            <motion.span initial={{ opacity: 0 }} exit={{ opacity: 1 }} transition={{ duration: 0.2 }} className="absolute inset-x-0 bottom-0 h-[3px] bg-[var(--accent)]" />
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }} className="absolute inset-0">
        <Suspense fallback={null}><IntroOrb leaving={!present} /></Suspense>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, y: -24, filter: "blur(10px)" }}
        transition={{ duration: 0.45, ease: EASE }}
        className="relative flex h-full flex-col justify-between p-[var(--gutter)]"
      >
        <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
          <span>Venkata Vahini Chilukamarri</span>
          <span className="hidden sm:inline">Portfolio — 2026</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="font-display flex flex-col items-center text-center text-[clamp(2.4rem,8vw,7.5rem)] leading-none font-medium tracking-[-0.05em]">
            <span className="text-[var(--muted-2)]">Building</span>
            <span className="relative flex h-[1.15em] w-full justify-center overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={final ? "final" : w}
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-105%" }}
                  transition={{ duration: 0.38, ease: SHUTTER }}
                  className={`block whitespace-nowrap ${final ? "font-serif font-normal tracking-[-0.02em] text-[var(--accent)] italic" : "text-[var(--ink)]"}`}
                >
                  {final ? "verified systems." : INTRO_WORDS[w]}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>
          <div className="mt-10 h-px w-[min(26rem,70vw)] overflow-hidden bg-white/10">
            <div className="h-full origin-left bg-[var(--accent)]" style={{ transform: `scaleX(${n / 100})` }} />
          </div>
        </div>

        <div className="flex items-end justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
          <span>Hyderabad, IN<br /><span className="text-[var(--muted-2)]">SWE · AI Engineer</span></span>
          <span className="font-display text-[clamp(3rem,9vw,7rem)] leading-[0.8] font-medium tracking-[-0.06em] text-[var(--ink)] tabular-nums normal-case">{String(n).padStart(3, "0")}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   NAV
   ══════════════════════════════════════════════════════════ */
const NAV_PRIMARY = ["about", "experience", "work", "deepdive", "stack", "contact"];

function Nav({ onOpenPalette }) {
  const [active, setActive] = useState("hero");
  const [menu, setMenu] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const clock = useClock();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", y => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 400 && !menu);
    setScrolled(y > 30);
    const probe = y + window.innerHeight * 0.35;
    let cur = "hero";
    NAV.forEach(n => { const el = document.getElementById(n.id); if (el && el.offsetTop <= probe) cur = n.id; });
    setActive(cur);
  });

  useEffect(() => {
    if (!menu) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = e => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [menu]);

  const goTo = id => { setMenu(false); setTimeout(() => scrollToId(id), menu ? 350 : 0); };

  return (
    <>
      <motion.header
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.5, ease: EASE }}
        className={`fixed top-0 z-[80] w-full transition-[background-color,border-color] duration-500 ${scrolled && !menu ? "border-b border-[var(--border)] bg-[var(--bg)]/70 backdrop-blur-xl" : "border-b border-transparent"}`}
      >
        <div className="wrap flex items-center justify-between py-4">
          <button onClick={() => goTo("hero")} className="group flex items-center gap-3 text-left" aria-label="Back to top">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-hi)] font-serif text-lg italic transition-colors group-hover:bg-[var(--ink)] group-hover:text-[var(--bg)]">v</span>
            <span className="hidden font-mono text-[11px] uppercase leading-tight tracking-[0.14em] sm:block">
              Vahini C.<br /><span className="text-[var(--muted-2)]">SWE · AI Engineer</span>
            </span>
          </button>

          <nav className="hidden items-center gap-7 xl:flex" aria-label="Primary">
            {NAV.filter(n => NAV_PRIMARY.includes(n.id)).map(n => (
              <button key={n.id} onClick={() => goTo(n.id)} className="group relative flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em]">
                <span className={`h-1.5 w-1.5 rounded-full bg-[var(--accent)] transition-all duration-500 ${active === n.id ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} />
                <span className="relative block overflow-hidden">
                  <span className={`block transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-full ${active === n.id ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}>{n.label}</span>
                  <span className="absolute inset-0 block translate-y-full text-[var(--ink)] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-y-0" aria-hidden="true">{n.label}</span>
                </span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="mr-2 hidden font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)] lg:inline">HYD {clock} IST</span>
            <button onClick={onOpenPalette} aria-label="Open command palette" className="hidden h-10 items-center rounded-full border border-[var(--border)] px-3.5 font-mono text-[11px] text-[var(--muted)] transition-colors hover:border-[var(--border-hi)] hover:text-[var(--ink)] md:flex">⌘K</button>
            <div className="hidden md:block">
              <FillButton href={LINKS.resume} className="!py-3">Resume <Arrow /></FillButton>
            </div>
            <button onClick={() => setMenu(m => !m)} aria-expanded={menu} aria-label="Menu" className="flex h-10 items-center gap-2.5 rounded-full border border-[var(--border-hi)] bg-[var(--bg)]/40 px-4 font-mono text-[11px] uppercase tracking-[0.14em] backdrop-blur">
              <span className="relative h-2 w-4">
                <span className={`absolute left-0 h-px w-4 bg-[var(--ink)] transition-all duration-500 ${menu ? "top-1 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-px w-4 bg-[var(--ink)] transition-all duration-500 ${menu ? "top-1 -rotate-45" : "top-2"}`} />
              </span>
              {menu ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div
            data-lenis-prevent
            initial={{ clipPath: "circle(0% at 95% 4%)" }}
            animate={{ clipPath: "circle(150% at 95% 4%)" }}
            exit={{ clipPath: "circle(0% at 95% 4%)" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[75] overflow-y-auto bg-[var(--bg-2)]"
          >
            <div className="wrap grid min-h-full gap-12 pt-28 pb-10 lg:grid-cols-[1.6fr_1fr]">
              <ul>
                {NAV.map((n, i) => (
                  <motion.li key={n.id} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.04, duration: 0.7, ease: EASE }} className="border-b border-[var(--border)]">
                    <button onClick={() => goTo(n.id)} className="group flex w-full items-baseline gap-5 py-2.5 text-left">
                      <span className="w-8 font-mono text-[11px] text-[var(--muted-2)]">{n.num}</span>
                      <span className={`font-display text-[clamp(2rem,5vw,3.6rem)] leading-none font-medium tracking-[-0.04em] transition-all duration-500 group-hover:translate-x-3 group-hover:text-[var(--accent)] ${active === n.id ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}>{n.label}</span>
                    </button>
                  </motion.li>
                ))}
              </ul>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-col justify-end gap-8 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
                <div className="space-y-2">
                  <div className="text-[var(--muted-2)]">Elsewhere</div>
                  {[["GitHub", LINKS.github], ["LinkedIn", LINKS.linkedin], ["Resume", LINKS.resume]].map(([l, h]) => (
                    <a key={l} href={h} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[var(--ink)] hover:text-[var(--accent)]">{l} <Arrow /></a>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="text-[var(--muted-2)]">Say hi</div>
                  <a href={`mailto:${LINKS.email}`} className="block normal-case text-[var(--ink)] hover:text-[var(--accent)]">{LINKS.email}</a>
                </div>
                <button onClick={() => { setMenu(false); onOpenPalette(); }} className="self-start rounded-full border border-[var(--border-hi)] px-4 py-2 text-[var(--ink)]">⌘K — jump anywhere</button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   HERO
   ══════════════════════════════════════════════════════════ */
function Ticker() {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = TICKER[i];
    const speed = deleting ? 22 : 34;
    const t = setTimeout(() => {
      if (!deleting) {
        setText(full.slice(0, text.length + 1));
        if (text.length + 1 === full.length) setTimeout(() => setDeleting(true), 1400);
      } else {
        setText(full.slice(0, text.length - 1));
        if (text.length === 0) { setDeleting(false); setI(v => (v + 1) % TICKER.length); }
      }
    }, speed);
    return () => clearTimeout(t);
  }, [text, deleting, i]);

  return (
    <span className="font-mono text-[11px] text-[var(--muted)]">
      <span className="text-[var(--accent)]">$</span> {text}<span className="animate-caret text-[var(--accent)]">▍</span>
    </span>
  );
}

const ROLES = PROFILE?.roles ?? ["Software Engineer", "AI Engineer", "LLM Agents & Evals", "Research Co-author"];

/* Italicises the "verified, not trusted" phrase wherever an intro uses it. */
function IntroLine({ text }) {
  const [a, b] = text.split("verified, not trusted");
  if (b === undefined) return text;
  return <>{a}<em className="font-serif text-[1.15em] text-[var(--ink)] italic">verified, not trusted</em>{b}</>;
}

const startTour = () => window.dispatchEvent(new Event("tour:start"));

function Hero({ ready }) {
  const fade = d => ({ initial: { opacity: 0, y: 16 }, animate: ready ? { opacity: 1, y: 0 } : {}, transition: { duration: 0.9, delay: d, ease: EASE } });
  return (
    <section id="hero" className="relative pt-28 sm:pt-32">
      <div className="wrap">
        <motion.div {...fade(0.1)} className="grid gap-3 border-b border-[var(--border)] pb-5 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)] sm:grid-cols-3">
          <span>Portfolio — ©2026</span>
          <span className="sm:text-center">Hyderabad, IN · 17.38°N 78.48°E</span>
          <span className="flex items-center gap-2 sm:justify-end">
            <span className="pulse-dot h-2 w-2 rounded-full bg-[var(--emerald)]" /> Open to SWE & AI internships
          </span>
        </motion.div>

        {PROFILE && (
          <motion.div {...fade(0.2)} className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em]">
            <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-[var(--bg)]">Tailored view · {PROFILE.label}</span>
            <a href="/" className="text-[var(--muted)] underline-offset-4 transition-colors hover:text-[var(--ink)] hover:underline">See the full portfolio</a>
          </motion.div>
        )}

        <h1 className="font-display mt-10 text-[clamp(3.4rem,13.2vw,14rem)] leading-[0.86] font-medium tracking-[-0.06em] sm:mt-14">
          <span className="flex items-start gap-[0.12em]">
            <em className="mt-[0.18em] font-serif text-[0.28em] font-normal leading-none tracking-normal text-[var(--muted)] italic">
              <BlurText text="Venkata" by="char" play={ready} delay={0.2} />
            </em>
            <BlurText text="Vahini" by="char" play={ready} delay={0.25} stagger={0.05} />
          </span>
          <span className="block">
            <BlurText text="Chilukamarri" by="char" play={ready} delay={0.45} stagger={0.04} />
          </span>
        </h1>

        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[1.25fr_1fr] lg:items-end">
          <motion.div {...fade(0.9)}>
            <p className="max-w-xl text-lg leading-relaxed text-[var(--muted)] sm:text-xl">
              <IntroLine text={PROFILE?.intro ?? "Final-year CSE at KMIT building AI systems that are verified, not trusted — agents that ship their own test suites, payment agents fenced by deterministic policy, and ledgers proven with property-based tests."} />
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Magnetic><FillButton onClick={() => scrollToId("work")}>See the work <span aria-hidden="true">↓</span></FillButton></Magnetic>
              <Magnetic><FillButton variant="ghost" onClick={() => scrollToId("contact")}>Get in touch</FillButton></Magnetic>
              <button onClick={startTour} className="group ml-1 inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)] transition-colors hover:text-[var(--ink)]">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-hi)] transition-colors group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-[var(--bg)]">
                  <svg viewBox="0 0 24 24" className="h-3 w-3 translate-x-[1px]" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                </span>
                60-sec tour
              </button>
            </div>
            <div className="mt-6"><Ticker /></div>
          </motion.div>
          <ul className="font-display text-right text-[clamp(1.2rem,2.2vw,1.9rem)] leading-[1.15] font-medium tracking-[-0.03em] uppercase">
            {ROLES.map((r, i) => (
              <li key={r} className="overflow-hidden">
                <motion.span className="block" initial={{ y: "110%" }} animate={ready ? { y: 0 } : {}} transition={{ duration: 1, delay: 0.85 + i * 0.08, ease: EASE }}>
                  {r}
                </motion.span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <HeroFrame />
    </section>
  );
}

/* The tilted panel that flattens and widens as you scroll into it. */
function HeroFrame() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.12"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.84, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [26, 0]);
  const radius = useTransform(scrollYProgress, [0, 1], [48, 24]);
  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);

  return (
    <div ref={ref} id="hero-frame" className="wrap mt-16 sm:mt-24" style={{ perspective: 1400 }}>
      <motion.div
        style={{ scale, rotateX, borderRadius: radius, y, transformOrigin: "50% 100%" }}
        className="aurora relative flex min-h-[78vh] flex-col justify-between overflow-hidden border border-[var(--border-hi)] p-5 sm:p-8 lg:p-10"
      >
        <NeuralField className="opacity-70" />
        <div className="relative flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink)]/80">
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[var(--ink)]" /> Live index</span>
          <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1 backdrop-blur">Now building — MORPH v0.6 · MCP policy layer</span>
        </div>

        <div className="relative my-12 text-center">
          <div className="font-serif text-[clamp(2.4rem,7vw,6.5rem)] leading-[0.95] italic">
            <BlurText text="Verified," /> <span className="text-[var(--ink)]/50"><BlurText text="not trusted." delay={0.2} /></span>
          </div>
          <Reveal delay={0.3} className="mx-auto mt-5 max-w-md text-sm text-[var(--ink)]/70">
            Every agent I build proposes; deterministic code decides. The numbers below come straight from the repos and the resume.
          </Reveal>
        </div>

        <div className="relative grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:grid-cols-4">
          {HIGHLIGHTS.map(h => (
            <div key={h.label} className="bg-[#0d0d12]/80 p-4 backdrop-blur-xl sm:p-6">
              <Counter to={h.n} dec={h.dec} prefix={h.prefix} suffix={h.suffix} className="font-display block text-[clamp(2rem,4.4vw,3.8rem)] leading-none font-medium tracking-[-0.05em] tabular-nums" />
              <div className="mt-3 text-sm text-[var(--ink)]">{h.label}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">{h.sub}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function StackMarquee() {
  const rows = [
    STACK.slice(0, 3).flatMap(s => s.items),
    STACK.slice(3).flatMap(s => s.items),
  ];
  return (
    <div className="marquee-mask relative mt-24 space-y-4 overflow-hidden py-2" aria-label="Tech stack">
      {rows.map((items, r) => (
        <div key={r} className={`flex w-max gap-10 ${r === 0 ? "animate-marquee" : "animate-marquee-reverse"}`}>
          {[...items, ...items].map((it, i) => (
            <span key={i} aria-hidden={i >= items.length} className={`font-display flex items-center gap-10 text-[clamp(1.6rem,3.4vw,3rem)] font-medium whitespace-nowrap tracking-[-0.04em] ${r === 0 ? "text-[var(--ink)]" : "text-outline"}`}>
              {it}
              <span className="font-serif text-[0.7em] text-[var(--accent)]">✦</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ABOUT
   ══════════════════════════════════════════════════════════ */
function About() {
  return (
    <section id="about" className="relative py-28 sm:py-40">
      <div className="wrap">
        <SectionHead num="01" label="About" aside="The person behind the commits" a="The person" b="behind" c="the commits" />

        <ScrubText
          className="font-display mt-16 max-w-6xl text-[clamp(1.6rem,3.6vw,3.3rem)] leading-[1.12] font-medium tracking-[-0.035em]"
          accentWords={["verified", "trusted", "proven"]}
          text="I build AI systems that are verified, not trusted — an agent that writes integration code and ships its own test suites, a payment-recovery agent fenced by a deterministic policy layer, and a Java ledger proven with property-based tests and fault injection."
        />

        <div className="mt-20 grid gap-10 lg:grid-cols-[1.25fr_1fr]">
          <Reveal className="space-y-5 text-lg leading-relaxed text-[var(--muted)]">
            <p>I'm a <b className="font-medium text-[var(--ink)]">final-year Computer Science student at KMIT, Hyderabad</b> (CGPA 9.12), mentored through the <b className="font-medium text-[var(--ink)]">Salesforce Mentorship Program</b> on a microservice health and API performance orchestrator.</p>
            <p>Most of what I build sits at the intersection of <b className="font-medium text-[var(--ink)]">LLM agents, testing, and distributed systems</b> — dependency graphs discovered from trace spans, evaluation pipelines that judge other models, and the guardrails that keep agents honest.</p>
            <p>I'm a <b className="font-medium text-[var(--ink)]">co-author of AgentShield AI</b>, an accepted paper on multi-agent LLMs for cloud infrastructure security, and I contribute remotely to <b className="font-medium text-[var(--ink)]">Rewriting the Code</b>, a nonprofit supporting women in tech.</p>
            <div className="flex flex-wrap gap-2 pt-3">
              {["KMIT · CGPA 9.12", "Hyderabad, India", "Graduating 2027", "Salesforce Mentee", "Published co-author"].map(t => (
                <span key={t} className="rounded-full border border-[var(--border)] px-3 py-1.5 font-mono text-[11px] text-[var(--muted)]">{t}</span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ink)] font-serif text-2xl text-[var(--bg)] italic">v</div>
                <span className="flex items-center gap-2 rounded-full border border-[var(--emerald)]/30 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--emerald)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--emerald)]" />Verified</span>
              </div>
              {[["Subject", "Venkata Vahini Chilukamarri"], ["Role", "Software & AI Engineer"], ["Base", "Hyderabad, India"], ["Institution", "KMIT · B.Tech CSE"], ["Focus", "LLM Agents · Testing · Distributed Systems"], ["Research", "AgentShield AI — accepted"], ["Status", "Open to internships"]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-3.5 font-mono text-xs last:border-0">
                  <span className="shrink-0 tracking-wider text-[var(--muted-2)] uppercase">{k}</span>
                  <span className="text-right text-[var(--ink)]">{v}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Education */}
        <div className="mt-24">
          <Reveal className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">Education</Reveal>
          <div className="mt-6 border-t border-[var(--border)]">
            {EDUCATION.map((e, i) => (
              <Reveal key={e.school} delay={i * 0.08} className="grid gap-3 border-b border-[var(--border)] py-7 md:grid-cols-[160px_1.4fr_1fr] md:items-baseline">
                <span className="font-mono text-xs text-[var(--muted)]">{e.when}</span>
                <div>
                  <div className="font-display text-2xl font-medium tracking-[-0.03em] sm:text-3xl">{e.school}</div>
                  <div className="mt-1 text-[var(--muted)]">{e.degree} · {e.where}</div>
                </div>
                <div className="font-serif text-2xl text-[var(--accent)] italic md:text-right">{e.score}</div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            { tag: "Resume", h: "Read the full file", d: "Education, experience, research, and every project — updated with the latest work.", go: "Open PDF", href: LINKS.resume },
            { tag: "GitHub", h: "vahinichilukamarri", d: "Every repo referenced on this page lives here, plus ongoing DSA practice.", go: "Visit profile", href: LINKS.github },
            { tag: "Portfolio", h: "vahini-dev.vercel.app", d: "This site, live — always reflects the current build.", go: "Open site", href: LINKS.portfolio },
          ].map((f, i) => (
            <Reveal key={f.tag} delay={i * 0.08}>
              <a href={f.href} target="_blank" rel="noreferrer" data-cursor="Open" className="group flex h-full flex-col rounded-3xl border border-[var(--border)] p-6 transition-colors duration-500 hover:border-[var(--border-hi)] hover:bg-[var(--surface-hi)]">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                  {f.tag}
                  <Arrow className="text-base transition-transform duration-500 group-hover:rotate-45" />
                </div>
                <div className="font-display mt-10 text-xl font-medium tracking-[-0.02em]">{f.h}</div>
                <div className="mt-2 text-sm text-[var(--muted)]">{f.d}</div>
                <div className="mt-auto pt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--accent)]">{f.go}</div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   EXPERIENCE & RESEARCH
   ══════════════════════════════════════════════════════════ */
const TIMELINE = [
  { when: EXPERIENCE.when, tag: "Experience", color: "lime", title: EXPERIENCE.org, role: EXPERIENCE.role, where: EXPERIENCE.where, points: EXPERIENCE.points, stack: EXPERIENCE.stack, href: EXPERIENCE.gh, cta: "View source" },
  { when: "To appear Jan 2027", tag: "Publication", color: "amber", title: PUBLICATION.title, role: `${PUBLICATION.kind} — multi-agent LLMs for cloud infrastructure security`, where: PUBLICATION.status, points: PUBLICATION.points, stack: PUBLICATION.stack, href: PUBLICATION.gh, cta: "Read paper" },
  { when: "2026", tag: "Award", color: "rose", title: "Centific Hackathon 2.0 — Winner", role: "Awarded an AI Engineer internship offer", where: "Hackathon", points: ["Built an AI recruiter avatar platform in 2 weeks, winning the hackathon and an AI Engineer internship offer."], stack: [] },
  { when: "June 2026 – Present", tag: "Community", color: "emerald", title: "Rewriting the Code", role: "Contributor — nonprofit supporting women in tech", where: "Remote", points: [], stack: [] },
];

function Experience() {
  return (
    <section id="experience" className="relative py-28 sm:py-40">
      <div className="wrap">
        <SectionHead num="02" label="Experience" aside="Mentored · published · awarded" a="Mentored," b="published," c="shipped" />
        <div className="mt-16 border-t border-[var(--border)]">
          {TIMELINE.map((t, i) => (
            <Reveal key={t.title} delay={i * 0.05}>
              <article className="group relative grid gap-6 border-b border-[var(--border)] py-10 lg:grid-cols-[230px_1fr_170px]" style={{ "--accent-c": accent(t.color) }}>
                <span className="absolute top-[-1px] left-0 h-px w-0 bg-[var(--accent-c)] transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:w-full" />
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: accent(t.color), borderColor: `color-mix(in srgb, ${accent(t.color)} 35%, transparent)` }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent(t.color) }} />{t.tag}
                  </span>
                  <div className="font-mono text-xs text-[var(--muted)]">{t.when}</div>
                </div>
                <div>
                  <h3 className="font-display text-[clamp(1.7rem,3.2vw,2.8rem)] leading-[1.02] font-medium tracking-[-0.04em]">{t.title}</h3>
                  <div className="mt-2 text-[var(--muted)]">{t.role} <span className="text-[var(--muted-2)]">· {t.where}</span></div>
                  {t.points.length > 0 && (
                    <ul className="mt-6 max-w-3xl space-y-3">
                      {t.points.map(p => (
                        <li key={p} className="flex gap-4 text-[15px] leading-relaxed text-[var(--muted)]">
                          <span className="mt-[0.7em] h-px w-4 shrink-0" style={{ background: accent(t.color) }} />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {t.stack.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {t.stack.map(s => <span key={s} className="rounded-full border border-[var(--border)] px-2.5 py-1 font-mono text-[10px] text-[var(--muted)]">{s}</span>)}
                    </div>
                  )}
                </div>
                <div className="lg:text-right">
                  {t.href ? (
                    <a href={t.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink)] transition-colors hover:text-[var(--accent-c)]">{t.cta} <Arrow /></a>
                  ) : t.tag === "Publication" ? (
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-2)]">{t.where}</span>
                  ) : null}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   WORK — sticky stacking flagships + full index
   ══════════════════════════════════════════════════════════ */
function ProjectLinks({ p }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {p.gh ? <FillButton href={p.gh} data-cursor="Code">Source <Arrow /></FillButton> : <span className="rounded-full border border-[var(--border)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">Link coming soon</span>}
      {p.live && <FillButton variant="ghost" href={p.live} data-cursor="Live">Live demo <Arrow /></FillButton>}
    </div>
  );
}

function FlagshipCard({ p, i, n, progress, desktop }) {
  const target = 1 - (n - 1 - i) * 0.045;
  const scale = useTransform(progress, [i / n, 1], [1, target]);
  const dim = useTransform(progress, [i / n, 1], [0, (n - 1 - i) * 0.28]);
  const c = accent(p.accent);
  const ref = useRef(null);
  const onMove = e => {
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", `${e.clientX - r.left}px`);
    ref.current.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div className={desktop ? "sticky top-0 flex h-screen items-center" : "py-3"}>
      <motion.article
        ref={ref}
        onMouseMove={onMove}
        style={desktop ? { scale, top: `${i * 26}px`, "--accent-c": c } : { "--accent-c": c }}
        className="group relative w-full origin-top overflow-hidden rounded-[2rem] border border-[var(--border-hi)] bg-[#0f0f11] lg:h-[min(80vh,720px)]"
      >
        <div className="spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="relative grid h-full lg:grid-cols-[1.15fr_1fr]">
          <div className="flex flex-col p-6 sm:p-10">
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              <span style={{ color: c }}>{p.no}</span>
              <span className="h-px w-8 bg-[var(--border-hi)]" />
              Flagship · {p.year}
              {p.isNew && <span className="rounded-full px-2 py-0.5 text-[9px] text-[var(--bg)]" style={{ background: c }}>New</span>}
              {p.live && <LivePill />}
            </div>
            <h3 className="font-display mt-6 text-[clamp(2.8rem,6vw,5.6rem)] leading-[0.9] font-medium tracking-[-0.055em]">{p.title}</h3>
            <p className="mt-3 font-serif text-xl italic" style={{ color: c }}>{p.sub}</p>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">{p.desc}</p>
            <ul className="mt-6 space-y-2.5">
              {p.points.slice(0, 3).map(pt => (
                <li key={pt} className="flex gap-3 text-sm leading-relaxed text-[var(--muted)]">
                  <span className="mt-[0.65em] h-px w-3 shrink-0" style={{ background: c }} />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 lg:mt-auto lg:pt-8"><ProjectLinks p={p} /></div>
          </div>

          <div className="relative flex min-h-[320px] flex-col justify-between overflow-hidden border-t border-[var(--border)] p-6 sm:p-10 lg:border-t-0 lg:border-l">
            <div className="absolute inset-0 opacity-90" style={{ background: `radial-gradient(80% 70% at 70% 30%, color-mix(in srgb, ${c} 32%, transparent), transparent 65%), radial-gradient(60% 60% at 10% 100%, color-mix(in srgb, ${c} 16%, transparent), transparent 70%)` }} />
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(var(--ink) 1px, transparent 1px), linear-gradient(90deg, var(--ink) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
            <div className="relative font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink)]/70">Key result</div>
            <div className="relative">
              <div className="font-display text-[clamp(3.6rem,8vw,7.5rem)] leading-[0.85] font-medium tracking-[-0.06em]">{p.metric.n}</div>
              <div className="mt-3 max-w-[16rem] font-serif text-xl text-[var(--ink)]/80 italic">{p.metric.l}</div>
            </div>
            <div className="relative flex flex-wrap gap-1.5">
              {p.stack.map(s => <span key={s} className="rounded-full border border-white/15 bg-black/25 px-2.5 py-1 font-mono text-[10px] text-[var(--ink)]/85 backdrop-blur">{s}</span>)}
            </div>
          </div>
        </div>
        {desktop && <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-black" />}
      </motion.article>
    </div>
  );
}

function FlagshipStack() {
  const flagships = orderProjects(PROJECTS.filter(p => p.featured));
  const ref = useRef(null);
  const desktop = useIsDesktop();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <div ref={ref} id="flagships" className="relative mt-10">
      {flagships.map((p, i) => <FlagshipCard key={p.no} p={p} i={i} n={flagships.length} progress={scrollYProgress} desktop={desktop} />)}
    </div>
  );
}

function IndexRow({ p, open, onToggle, onHover }) {
  const c = accent(p.accent);
  return (
    <li className="border-b border-[var(--border)]" style={{ "--accent-c": c }}>
      <button
        onClick={onToggle}
        onMouseEnter={() => onHover(p)}
        onMouseLeave={() => onHover(null)}
        aria-expanded={open}
        data-cursor={open ? "Close" : "Open"}
        className="group relative grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-4 overflow-hidden py-6 text-left sm:grid-cols-[3.5rem_1fr_auto_auto] sm:py-8"
      >
        <span className="absolute inset-0 origin-bottom scale-y-0 bg-[var(--surface-hi)] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-y-100" />
        <span className="relative font-mono text-xs text-[var(--muted-2)]">{p.no}.</span>
        <span className="relative min-w-0">
          <span className="font-display flex items-center gap-3 text-[clamp(1.6rem,4.2vw,3.6rem)] leading-none font-medium tracking-[-0.045em] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-3">
            <span className="truncate">{p.title}</span>
            {p.isNew && <span className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] tracking-[0.14em] text-[var(--bg)] uppercase" style={{ background: c }}>New</span>}
            {p.live && <LivePill className="shrink-0" />}
          </span>
          <span className="mt-2 block truncate text-sm text-[var(--muted)] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-3">{p.sub}</span>
        </span>
        <span className="relative hidden font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)] sm:block">{p.stack.slice(0, 2).join(" · ")} — {p.year}</span>
        <span className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-hi)] text-lg transition-all duration-500 ${open ? "rotate-45 bg-[var(--ink)] text-[var(--bg)]" : "group-hover:bg-[var(--accent-c)] group-hover:text-[var(--bg)]"}`}>+</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.6, ease: EASE }} className="overflow-hidden">
            <div className="grid gap-8 pb-10 sm:pl-[4.5rem] lg:grid-cols-[1.3fr_1fr]">
              <div>
                <p className="max-w-2xl leading-relaxed text-[var(--muted)]">{p.desc}</p>
                <ul className="mt-5 space-y-2.5">
                  {p.points.map(pt => (
                    <li key={pt} className="flex gap-3 text-sm leading-relaxed text-[var(--muted)]">
                      <span className="mt-[0.65em] h-px w-3 shrink-0" style={{ background: c }} />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap gap-1.5">
                  {p.stack.map(s => <span key={s} className="rounded-full border border-[var(--border)] px-2.5 py-1 font-mono text-[10px] text-[var(--muted)]">{s}</span>)}
                </div>
                <ProjectLinks p={p} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

/* Floating preview that trails the cursor while hovering the index. */
function IndexPreview({ project, x, y }) {
  return (
    <motion.div style={{ x, y }} className="pointer-events-none fixed top-0 left-0 z-[65] hidden lg:block">
      <AnimatePresence>
        {project && (
          <motion.div
            key={project.no}
            initial={{ opacity: 0, scale: 0.6, rotate: -6, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.6, rotate: 6, filter: "blur(10px)" }}
            transition={{ duration: 0.45, ease: EASE }}
            className="relative -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/15 p-5"
            style={{ width: 300, height: 200, background: `radial-gradient(90% 90% at 80% 10%, color-mix(in srgb, ${accent(project.accent)} 55%, #0d0d12), #0d0d12 75%)` }}
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/70">{project.no} — {project.year}</div>
            <div className="font-display mt-10 text-4xl font-medium tracking-[-0.05em] text-white">{project.title}</div>
            <div className="mt-2 truncate font-serif text-white/75 italic">{project.metric ? project.metric.l : project.stack.slice(0, 3).join(" · ")}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ProjectIndex() {
  const [open, setOpen] = useState(null);
  const [hover, setHover] = useState(null);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 26 });
  const y = useSpring(my, { stiffness: 220, damping: 26 });
  const onMove = e => { mx.set(e.clientX + 170); my.set(e.clientY); };

  return (
    <div className="mt-32" onMouseMove={onMove}>
      <div className="flex items-end justify-between gap-6">
        <h3 className="font-display text-[clamp(2rem,4.5vw,3.8rem)] leading-none font-medium tracking-[-0.045em]">
          The full <em className="font-serif font-normal text-[var(--accent)] italic">index</em>
        </h3>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">({String(PROJECTS.length).padStart(2, "0")}) builds · tap to expand</span>
      </div>
      <ul className="mt-8 border-t border-[var(--border)]">
        {orderProjects(PROJECTS).map(p => (
          <IndexRow key={p.no} p={p} open={open === p.no} onToggle={() => setOpen(o => (o === p.no ? null : p.no))} onHover={v => setHover(open === p.no ? null : v)} />
        ))}
      </ul>
      <IndexPreview project={hover} x={x} y={y} />
    </div>
  );
}

/* The deployed TRACE app, embedded in a browser frame. The iframe renders
   at a fixed desktop size and is scaled to fit, loads only when near the
   viewport, and stays non-interactive until clicked so page scroll isn't hijacked. */
const LIVE_W = 1440, LIVE_H = 900;

function LiveShowcase() {
  const p = PROJECTS.find(x => x.live);
  const ref = useRef(null);
  const screenRef = useRef(null);
  const near = useInView(ref, { once: true, margin: "400px 0px" });
  const [scale, setScale] = useState(0.5);
  const [loaded, setLoaded] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [nonce, setNonce] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.15"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const sc = useTransform(scrollYProgress, [0, 1], [0.9, 1]);

  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / LIVE_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const host = p.live.replace(/^https?:\/\//, "");

  return (
    <div ref={ref} id="live-trace" className="mt-32">
      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
        <div>
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
            <span className="pulse-dot h-2 w-2 rounded-full bg-[var(--emerald)]" /> Live in production
          </div>
          <h3 className="font-display mt-5 text-[clamp(2.2rem,5vw,4.4rem)] leading-[0.95] font-medium tracking-[-0.05em]">
            {p.title}, running <em className="font-serif font-normal text-[var(--accent)] italic">right now.</em>
          </h3>
        </div>
        <div>
          <p className="max-w-md text-[var(--muted)]">Not a screenshot — this is the deployed app, embedded live. Click the screen to use it here, or open it full-size.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <FillButton href={p.live} data-cursor="Visit">Open live app <Arrow /></FillButton>
            <FillButton variant="ghost" href={p.gh}>Source <Arrow /></FillButton>
          </div>
        </div>
      </div>

      <div className="mt-12" style={{ perspective: 1600 }}>
        <motion.div style={{ rotateX, scale: sc, transformOrigin: "50% 100%" }} className="overflow-hidden rounded-[1.25rem] border border-[var(--border-hi)] bg-[#141413] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
            </div>
            <div className="mx-auto flex min-w-0 max-w-md flex-1 items-center justify-center gap-2 rounded-full bg-white/[0.05] px-4 py-1.5 font-mono text-[11px] text-[var(--muted)]">
              <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="currentColor" aria-hidden="true"><path d="M17 9h-1V7a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2h-4V7Z" /></svg>
              <span className="truncate">{host}</span>
            </div>
            <button onClick={() => { setLoaded(false); setNonce(k => k + 1); }} aria-label="Reload live preview" className="hidden h-7 w-7 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-white/5 hover:text-[var(--ink)] sm:flex">↻</button>
            <a href={p.live} target="_blank" rel="noreferrer" aria-label="Open in new tab" className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-white/5 hover:text-[var(--ink)]"><Arrow /></a>
          </div>

          <div ref={screenRef} className="relative w-full overflow-hidden bg-[#0e0e0d]" style={{ aspectRatio: `${LIVE_W} / ${LIVE_H}` }} onMouseLeave={() => setInteractive(false)}>
            {near && (
              <iframe
                key={nonce}
                src={p.live}
                title={`${p.title} — live application`}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onLoad={() => setLoaded(true)}
                className={`absolute top-0 left-0 origin-top-left border-0 transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
                style={{ width: LIVE_W, height: LIVE_H, transform: `scale(${scale})`, pointerEvents: interactive ? "auto" : "none" }}
              />
            )}
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-2)]">
                <span className="animate-pulse">Connecting to {host}…</span>
              </div>
            )}
            <AnimatePresence>
              {!interactive && loaded && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => setInteractive(true)}
                  data-cursor="Try it"
                  className="group absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent pb-6"
                  aria-label="Interact with the live preview"
                >
                  <span className="rounded-full border border-white/20 bg-black/50 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white backdrop-blur transition-transform duration-500 group-hover:-translate-y-1">Click to interact</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Work() {
  return (
    <section id="work" className="relative py-28 sm:py-40">
      <div className="wrap">
        <SectionHead num="03" label="Work" aside={`${PROJECTS.length} builds, open for review`} a="Selected" b="work," c="open for review" />
        <FlagshipStack />
        <LiveShowcase />
        <ProjectIndex />
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   STACK / SKILLS
   ══════════════════════════════════════════════════════════ */
function Stack() {
  return (
    <section id="stack" className="relative py-28 sm:py-40">
      <div className="wrap">
        <SectionHead num="05" label="Stack" aside="Tools I reach for" a="What runs" b="underneath" />
        <div className="mt-16 border-t border-[var(--border)]">
          {orderStack(STACK).map((s, i) => (
            <Reveal key={s.cat} delay={i * 0.04} className="grid gap-5 border-b border-[var(--border)] py-8 lg:grid-cols-[300px_1fr]">
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-xs" style={{ color: accent(s.accent) }}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="font-display text-xl font-medium tracking-[-0.02em]">{s.cat}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-2)]">{s.items.length} tools</div>
                </div>
              </div>
              <div className="font-display flex flex-wrap gap-x-2 gap-y-1 text-[clamp(1.25rem,2.3vw,2rem)] leading-snug font-medium tracking-[-0.035em]" style={{ "--accent-c": accent(s.accent) }}>
                {s.items.map((it, j) => (
                  <span key={it} className={`transition-colors duration-300 hover:text-[var(--accent-c)] ${isHighlighted(it) ? "text-[var(--ink)] underline decoration-[var(--accent)] decoration-2 underline-offset-[0.18em]" : "text-[var(--muted)]"}`}>
                    {it}{j < s.items.length - 1 && <span className="text-[var(--muted-2)]">,</span>}
                  </span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   NETWORK — the hand of cards, mimicking a real LinkedIn post
   ══════════════════════════════════════════════════════════ */
function Network() {
  return (
    <section id="network" className="relative overflow-hidden py-28 sm:py-40">
      <div className="wrap">
        <SectionHead num="06" label="Network" aside="As posted on LinkedIn" a="A hand" b="from" c="LinkedIn" />
        <Reveal delay={0.1}><p className="mt-6 max-w-2xl text-lg text-[var(--muted)]">Hackathons, launches, and certifications, as I posted them. Pick a card to read it.</p></Reveal>
        <div className="mt-16">
          <HandOfCards posts={LINKEDIN_POSTS} profileUrl={LINKS.linkedin} />
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   CONTACT
   ══════════════════════════════════════════════════════════ */
function Contact() {
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [copied, setCopied] = useState(false);

  const handleForm = e => {
    e.preventDefault();
    const n = e.target.fn.value.trim(), em = e.target.fe.value.trim(), m = e.target.fm.value.trim();
    if (!n || !em || !m) { setMsg({ text: "Please fill in all fields.", type: "err" }); return; }
    const subject = encodeURIComponent(`Portfolio contact — ${n}`);
    const body = encodeURIComponent(`${m}\n\n—\n${n}\n${em}`);
    window.location.href = `mailto:${LINKS.email}?subject=${subject}&body=${body}`;
    setMsg({ text: "✓ Opening your mail client — send when ready.", type: "ok" });
    setTimeout(() => setMsg({ text: "", type: "" }), 5000);
  };

  const copy = () => {
    navigator.clipboard?.writeText(LINKS.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const field = "mt-2 w-full border-b border-[var(--border-hi)] bg-transparent py-3 text-base outline-none transition-colors placeholder:text-[var(--muted-2)] focus:border-[var(--accent)]";

  return (
    <section id="contact" className="relative py-28 sm:py-40">
      <div className="wrap">
        <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
          <span><span className="text-[var(--accent)]">(09)</span> Contact</span>
          <span className="h-px flex-1 bg-[var(--border-hi)]" />
          <span className="flex items-center gap-2"><span className="pulse-dot h-2 w-2 rounded-full bg-[var(--emerald)]" /> Available</span>
        </div>

        <h2 className="font-display mt-12 text-[clamp(3.4rem,12vw,12.5rem)] leading-[0.86] font-medium tracking-[-0.065em]">
          <LineMask>Let's build</LineMask>
          <LineMask delay={0.1}><em className="font-serif font-normal tracking-[-0.03em] text-[var(--accent)] italic">something</em> real.</LineMask>
        </h2>

        <div className="mt-14 flex flex-wrap items-center gap-4">
          <Magnetic strength={0.15}>
            <a href={`mailto:${LINKS.email}`} data-cursor="Write" className="group font-display relative inline-block text-[clamp(1.4rem,4vw,3.2rem)] font-medium tracking-[-0.04em]">
              {LINKS.email}
              <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-right scale-x-0 bg-[var(--accent)] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:origin-left group-hover:scale-x-100" />
            </a>
          </Magnetic>
          <button onClick={copy} className="rounded-full border border-[var(--border-hi)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)] transition-colors hover:text-[var(--ink)]">
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>

        <div className="mt-20 grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <Reveal className="flex flex-col items-center gap-10 md:flex-row md:justify-start lg:gap-14">
            <p className="max-w-xs text-center text-lg text-[var(--muted)] md:text-left">Currently looking for Software Engineering or AI/ML internship opportunities. If you'd like to work together, or just say hi — reach out.</p>
            <ContactWallet />
          </Reveal>
          <Reveal delay={0.12}>
            <form onSubmit={handleForm} className="space-y-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 sm:p-9">
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                  Name
                  <input name="fn" placeholder="Your name" className={`${field} font-sans normal-case tracking-normal`} />
                </label>
                <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                  Email
                  <input name="fe" type="email" placeholder="your@email.com" className={`${field} font-sans normal-case tracking-normal`} />
                </label>
              </div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                Message
                <textarea name="fm" rows="4" placeholder="Tell me about your project or opportunity..." className={`${field} resize-none font-sans normal-case tracking-normal`} />
              </label>
              {msg.text && <div className={`font-mono text-xs ${msg.type === "ok" ? "text-[var(--emerald)]" : "text-[var(--amber)]"}`}>{msg.text}</div>}
              <button type="submit" className="group relative w-full overflow-hidden rounded-full bg-[var(--ink)] py-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--bg)]">
                <span className="absolute inset-0 translate-y-[101%] rounded-full bg-[var(--accent)] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-y-0" />
                <span className="relative">Send via mail →</span>
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const clock = useClock();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["40%", "0%"]);
  return (
    <footer ref={ref} className="relative overflow-hidden border-t border-[var(--border)] pt-14">
      <div className="wrap grid gap-8 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)] sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-[var(--muted-2)]">Local time</div>
          <div className="mt-2 text-[var(--ink)]">Hyderabad · {clock} IST</div>
        </div>
        <div>
          <div className="text-[var(--muted-2)]">Socials</div>
          <div className="mt-2 flex gap-5">
            <a href={LINKS.github} target="_blank" rel="noreferrer" className="text-[var(--ink)] hover:text-[var(--accent)]">GitHub</a>
            <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className="text-[var(--ink)] hover:text-[var(--accent)]">LinkedIn</a>
            <a href={`mailto:${LINKS.email}`} className="text-[var(--ink)] hover:text-[var(--accent)]">Email</a>
          </div>
        </div>
        <div>
          <div className="text-[var(--muted-2)]">Colophon</div>
          <div className="mt-2 text-[var(--ink)]">Geist & Instrument Serif · React · Motion</div>
        </div>
        <div className="lg:text-right">
          <button onClick={() => scrollToId("hero")} className="group inline-flex items-center gap-2 text-[var(--ink)] hover:text-[var(--accent)]">
            Back to top <span className="transition-transform duration-500 group-hover:-translate-y-1">↑</span>
          </button>
        </div>
      </div>
      <motion.div style={{ y }} aria-hidden="true" className="font-display mt-10 text-center text-[24vw] leading-[0.78] font-medium tracking-[-0.07em] text-[var(--ink)] select-none">
        Vahini<span className="text-[var(--accent)]">.</span>
      </motion.div>
      <div className="wrap flex justify-between pt-4 pb-6 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-2)]">
        <span>© 2026 Venkata Vahini Chilukamarri</span>
        <span>Built with intent</span>
      </div>
    </footer>
  );
}

function usePaletteItems() {
  return useMemo(() => {
    const open = url => window.open(url, "_blank", "noopener");
    return [
      ...NAV.map(n => ({ group: "Jump to", label: n.label, hint: n.num, icon: "§", action: () => scrollToId(n.id) })),
      ...PROJECTS.filter(p => p.gh).map(p => ({ group: "Projects", label: `${p.title} — source`, hint: "github", icon: "{}", keywords: p.stack.join(" "), action: () => open(p.gh) })),
      ...PROJECTS.filter(p => p.live).map(p => ({ group: "Projects", label: `${p.title} — live app`, hint: "vercel", icon: "▶", action: () => open(p.live) })),
      { group: "Explore", label: "Ask my portfolio (AI)", hint: "cited answers", icon: "✦", keywords: "chat question assistant agent", action: () => window.dispatchEvent(new CustomEvent("ask:open")) },
      { group: "Explore", label: "Start the 60-second tour", hint: "auto-play", icon: "▶", keywords: "walkthrough guide recruiter", action: startTour },
      ...Object.values(PROFILES).map(pr => ({ group: "Tailored links", label: `Copy link — ${pr.label}`, hint: `?for=${pr.key}`, icon: "⧉", keywords: "share recruiter role tailored", action: () => navigator.clipboard?.writeText(tailoredUrl(pr.key)) })),
      { group: "Links", label: "Resume", hint: "pdf", icon: "↗", action: () => open(LINKS.resume) },
      { group: "Links", label: "LinkedIn", hint: "profile", icon: "in", action: () => open(LINKS.linkedin) },
      { group: "Links", label: "GitHub", hint: "profile", icon: "gh", action: () => open(LINKS.github) },
      { group: "Links", label: "Copy email address", hint: LINKS.email, icon: "@", keywords: "mail contact", action: () => navigator.clipboard?.writeText(LINKS.email) },
      { group: "Links", label: "Send an email", hint: "mailto", icon: "✉", keywords: "mail contact", action: () => { window.location.href = `mailto:${LINKS.email}`; } },
    ];
  }, []);
}

function shouldPlayIntro() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try { return !sessionStorage.getItem("vc-intro"); } catch { return true; }
}

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [intro, setIntro] = useState(shouldPlayIntro);
  const [touring, setTouring] = useState(false);
  const paletteItems = usePaletteItems();
  useSmoothScroll();

  const endIntro = useCallback(() => {
    try { sessionStorage.setItem("vc-intro", "1"); } catch { /* storage unavailable — intro just replays */ }
    setIntro(false);
  }, []);

  useEffect(() => {
    const onKey = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen(o => !o); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onTour = () => { setPaletteOpen(false); setTouring(true); };
    window.addEventListener("tour:start", onTour);
    return () => window.removeEventListener("tour:start", onTour);
  }, []);

  const openPalette = () => setPaletteOpen(true);
  const endTour = useCallback(() => setTouring(false), []);

  return (
    <div className="relative min-h-screen">
      <AnimatePresence>{intro && <Intro onDone={endIntro} />}</AnimatePresence>
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <ScrollProgress />
      <Nav onOpenPalette={openPalette} />
      <main>
        <Hero ready={!intro} />
        <StackMarquee />
        <About />
        <Experience />
        <Work />
        <CaseStudies num="04" Head={SectionHead} />
        <Stack />
        <Network />
        <Interrogation num="07" />
        <Recognition num="08" Head={SectionHead} Arrow={Arrow} />
        <Contact />
      </main>
      <Footer />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={paletteItems} />
      <AnimatePresence>{touring && <Tour key="tour" onClose={endTour} />}</AnimatePresence>
      {!intro && <AskAgent hidden={touring} />}
    </div>
  );
}


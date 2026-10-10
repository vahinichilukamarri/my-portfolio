import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { Counter, Reveal } from "./motion";
import { EASE } from "./smooth";
import { ACHIEVEMENTS, CERTS, PUBLICATION } from "./data";
import { LINKEDIN_POSTS } from "./posts";
import offerImg from "./assets/offer_img.jpeg";

const STATS = [
  { n: 1, label: "Hackathon win", sub: "Centific Premier 2.0" },
  { n: 1, label: "Accepted paper", sub: "AgentShield AI · Jan 2027" },
  { n: CERTS.length, label: "Certifications", sub: "SQL · GenAI" },
  { n: 40, suffix: "+", label: "Volunteer hours", sub: "NSS · since 2023" },
];

/* Card that leans towards the pointer in 3D. */
function TiltCard({ children, className = "", style }) {
  const ref = useRef(null);
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 18 });
  const sry = useSpring(ry, { stiffness: 150, damping: 18 });
  const onMove = e => {
    const r = ref.current.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 8);
    rx.set((0.5 - (e.clientY - r.top) / r.height) * 8);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };
  return (
    <div style={{ perspective: 1200 }} className="h-full">
      <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ rotateX: srx, rotateY: sry, ...style }} className={`h-full ${className}`}>
        {children}
      </motion.div>
    </div>
  );
}

function Star({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 1.5l2.6 7.1 7.6.3-6 4.7 2.1 7.3L12 16.6l-6.3 4.3 2.1-7.3-6-4.7 7.6-.3z" />
    </svg>
  );
}

function WinnerCard({ Arrow }) {
  return (
    <TiltCard className="group relative min-h-[540px] overflow-hidden rounded-[2rem] border border-[var(--border-hi)] bg-[#0f0f11]">
      <img
        src={offerImg}
        alt="Receiving the internship offer on stage at Centific Premier Hackathon 2.0"
        loading="lazy"
        className="absolute inset-0 h-full w-full scale-[1.02] object-cover object-[50%_42%] opacity-55 contrast-110 grayscale transition-all duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06] group-hover:opacity-75 group-hover:grayscale-0"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/70 to-[#0a0a0b]/10" />

      <div className="relative flex h-full min-h-[540px] flex-col justify-between p-6 sm:p-9">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink)]/70">01 — Award</span>
          <span className="flex items-center gap-2 rounded-full bg-[var(--accent)] py-1.5 pr-3.5 pl-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--bg)]">
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="flex">
              <Star className="h-4 w-4" />
            </motion.span>
            Winner
          </span>
        </div>

        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--accent)]">Centific Premier Hackathon 2.0</div>
          <h3 className="font-display mt-4 text-[clamp(2rem,3.6vw,3.4rem)] leading-[0.95] font-medium tracking-[-0.05em]">
            Won an AI Engineer internship offer.
          </h3>
          <p className="mt-3 max-w-md font-serif text-xl text-[var(--ink)]/80 italic">for an AI recruiter avatar platform, built in two weeks.</p>
          <div className="mt-7 flex flex-wrap items-end justify-between gap-6 border-t border-white/10 pt-6">
            <div className="flex gap-8">
              {[["2 wks", "Build time"], ["Offer", "AI Engineer intern"]].map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-3xl font-medium tracking-[-0.04em]">{n}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">{l}</div>
                </div>
              ))}
            </div>
            <a href={LINKEDIN_POSTS[0].url} target="_blank" rel="noreferrer" data-cursor="Read" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink)] transition-colors hover:text-[var(--accent)]">
              The LinkedIn post <Arrow />
            </a>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

function PaperCard({ Arrow }) {
  return (
    <TiltCard className="relative min-h-[540px] overflow-hidden rounded-[2rem] bg-[#efece4] text-[#141412] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
      {/* ruled paper + folded corner */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.5]" style={{ backgroundImage: "repeating-linear-gradient(transparent 0 31px, rgba(20,20,18,0.06) 31px 32px)" }} />
      <div className="pointer-events-none absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-[#0a0a0b] from-50% to-[#d8d4c9] to-50%" />

      <div className="relative flex h-full min-h-[540px] flex-col p-6 sm:p-9">
        <div className="flex items-center justify-between border-b border-[#141412]/15 pb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[#141412]/60">
          <span>02 — Publication</span>
          <span className="mr-12">Co-author</span>
        </div>

        <h3 className="mt-8 font-serif text-[clamp(2.4rem,4.4vw,4rem)] leading-[0.92]">{PUBLICATION.title}</h3>
        <p className="mt-2 font-serif text-xl text-[#141412]/70 italic">Multi-agent LLMs for cloud infrastructure security</p>

        <div className="mt-7 font-mono text-[10px] uppercase tracking-[0.18em] text-[#141412]/50">Abstract</div>
        <div className="mt-2 max-w-lg space-y-2.5 text-[14px] leading-relaxed text-[#141412]/80">
          {PUBLICATION.points.map(p => <p key={p}>{p}</p>)}
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-6 pt-8">
          <div className="flex max-w-xs flex-wrap gap-1.5">
            {PUBLICATION.stack.slice(0, 6).map(s => (
              <span key={s} className="rounded-full border border-[#141412]/20 px-2.5 py-1 font-mono text-[10px] text-[#141412]/70">{s}</span>
            ))}
          </div>
          {PUBLICATION.gh ? (
            <a href={PUBLICATION.gh} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] hover:underline">Read paper <Arrow /></a>
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#141412]/45">Preprint link soon</span>
          )}
        </div>

        {/* the stamp lands when scrolled into view */}
        <motion.div
          initial={{ opacity: 0, scale: 2.4, rotate: -24 }}
          whileInView={{ opacity: 1, scale: 1, rotate: -9 }}
          viewport={{ once: true, margin: "0px 0px -20% 0px" }}
          transition={{ type: "spring", stiffness: 260, damping: 17, delay: 0.35 }}
          className="absolute top-24 right-6 rounded-lg border-[3px] border-[#3d5a00] px-4 py-2 text-center text-[#3d5a00] mix-blend-multiply sm:right-10"
        >
          <div className="font-display text-2xl leading-none font-semibold tracking-[0.08em]">ACCEPTED</div>
          <div className="mt-1 font-mono text-[9px] tracking-[0.18em]">TO APPEAR · JAN 2027</div>
        </motion.div>
      </div>
    </TiltCard>
  );
}

function useSpread() {
  const get = () => (typeof window === "undefined" ? 140 : Math.min(180, window.innerWidth * 0.22));
  const [s, setS] = useState(get);
  useEffect(() => {
    const on = () => setS(get());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return s;
}

/* Certificates as a small stack of paper cards — hover (or tap) fans them out,
   clicking one brings it to the front. */
function CertStack() {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState(CERTS.length - 1);
  const spread = useSpread();
  const mid = (CERTS.length - 1) / 2;

  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Certifications</div>
      <div
        className="relative mt-6 h-[300px]"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(true)}
      >
        {CERTS.map((c, i) => {
          const off = i - mid;
          return (
            <motion.button
              key={c.t}
              type="button"
              onClick={e => { e.stopPropagation(); setOpen(true); setFront(i); }}
              aria-label={`${c.t} — ${c.o}`}
              animate={open
                ? { x: off * spread, rotate: off * 8, y: i === front ? -18 : Math.abs(off) * 12 }
                : { x: off * 12, rotate: off * 3.5, y: (CERTS.length - 1 - i) * 7 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              style={{ zIndex: i === front ? 20 : i }}
              className="absolute inset-x-0 top-6 mx-auto block h-[200px] w-[min(250px,60vw)] rounded-xl bg-[#f3f0e8] p-2 text-left text-[#141412] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.85)]"
            >
              <div className="flex h-full flex-col rounded-lg border border-[#141412]/15 p-4">
                <div className="flex items-center justify-between font-mono text-[8.5px] uppercase tracking-[0.18em] text-[#141412]/55">
                  <span>Certificate</span>
                  <span>№ {String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="mt-3 font-serif text-[1.45rem] leading-[1.05] italic">{c.t}</div>
                <div className="mt-auto flex items-end justify-between">
                  <div className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[#141412]/65">{c.o}</div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-[#141412] shadow-[inset_0_0_0_3px_rgba(20,20,18,0.12)]"><Star className="h-4 w-4" /></span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
      <div className="text-center font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-2)]">Hover to fan · click to bring forward</div>
    </div>
  );
}

/* The rest, as a timeline whose line draws as you scroll. */
function Timeline() {
  const items = ACHIEVEMENTS.filter(a => !a.star);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.6"] });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Activities & milestones</div>
      <ol ref={ref} className="relative mt-6 pl-8">
        <span className="absolute top-2 bottom-2 left-[5px] w-px bg-[var(--border-hi)]" />
        <motion.span style={{ scaleY }} className="absolute top-2 bottom-2 left-[5px] w-px origin-top bg-[var(--accent)]" />
        {items.map((a, i) => (
          <Reveal key={a.t} as="li" delay={i * 0.04} y={16} className="group relative pb-7 last:pb-0">
            <span className="absolute top-[7px] -left-8 h-[11px] w-[11px] rounded-full border border-[var(--border-hi)] bg-[var(--bg)] transition-colors duration-500 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)]" />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-display text-lg font-medium tracking-[-0.02em] transition-transform duration-500 group-hover:translate-x-1">{a.t}</span>
              <span className="rounded-full border border-[var(--border)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted)]">{a.kind}</span>
              {a.when && <span className="font-mono text-[10px] text-[var(--muted-2)]">{a.when}</span>}
            </div>
            <div className="mt-1 text-sm text-[var(--muted)]">{a.d}</div>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

export default function Recognition({ num, Head, Arrow }) {
  return (
    <section id="recognition" className="relative py-28 sm:py-40">
      <div className="wrap">
        <Head num={num} label="Recognition" aside="Certified, and on record" a="Certified," b="and" c="on record" />

        <Reveal className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] lg:grid-cols-4">
          {STATS.map(s => (
            <div key={s.label} className="bg-[var(--bg)] p-5 sm:p-7">
              <Counter to={s.n} suffix={s.suffix} className="font-display block text-[clamp(2.2rem,4.5vw,3.8rem)] leading-none font-medium tracking-[-0.05em] tabular-nums" />
              <div className="mt-3 text-sm text-[var(--ink)]">{s.label}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">{s.sub}</div>
            </div>
          ))}
        </Reveal>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -10% 0px" }} transition={{ duration: 1, ease: EASE }}>
            <WinnerCard Arrow={Arrow} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -10% 0px" }} transition={{ duration: 1, delay: 0.12, ease: EASE }}>
            <PaperCard Arrow={Arrow} />
          </motion.div>
        </div>

        <div className="mt-24 grid gap-16 lg:grid-cols-[1fr_1.25fr]">
          <CertStack />
          <Timeline />
        </div>
      </div>
    </section>
  );
}

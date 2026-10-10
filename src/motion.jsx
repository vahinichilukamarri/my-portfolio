import { useEffect, useRef, useState } from "react";
import { EASE } from "./smooth";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

/* ══════════════════════════════════════════════════════════
   REVEALS
   ══════════════════════════════════════════════════════════ */
export function Reveal({ children, delay = 0, className = "", y = 28, as = "div" }) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </M>
  );
}

/* Blur-in, word by word (or letter by letter) — the animos headline move. */
export function BlurText({ text, className = "", by = "word", delay = 0, stagger, once = true, play }) {
  const reduce = useReducedMotion();
  const units = by === "char" ? Array.from(text) : text.split(" ");
  const step = stagger ?? (by === "char" ? 0.035 : 0.07);
  // `play` given → driven externally (e.g. after the intro); otherwise on scroll-in.
  const trigger = play !== undefined ? { animate: play ? "show" : "hide" } : { whileInView: "show", viewport: { once, margin: "0px 0px -8% 0px" } };
  return (
    <motion.span className={`inline ${className}`} initial={reduce ? false : "hide"} {...trigger} aria-label={text}>
      {units.map((u, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="inline-block will-change-[transform,filter,opacity]"
          variants={{
            hide: { opacity: 0, filter: "blur(14px)", y: "0.35em" },
            show: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.9, delay: delay + i * step, ease: EASE } },
          }}
        >
          {u === " " ? " " : u}
          {by === "word" && i < units.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* Masked line slide-up, for big editorial type. */
export function LineMask({ children, delay = 0, className = "" }) {
  return (
    <span className={`block overflow-hidden pb-[0.08em] ${className}`}>
      <motion.span
        className="block"
        initial={{ y: "105%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/* Scroll-scrubbed reading highlight: words light up as you scroll past. */
function ScrubWord({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const blur = useTransform(progress, range, ["blur(3px)", "blur(0px)"]);
  return <motion.span style={{ opacity, filter: blur }} className="inline-block">{children}&nbsp;</motion.span>;
}

export function ScrubText({ text, className = "", accentWords = [] }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">
        {words.map((w, i) => {
          const start = i / words.length;
          const isAccent = accentWords.includes(w.replace(/[^\w-]/g, "").toLowerCase());
          return (
            <ScrubWord key={i} progress={scrollYProgress} range={[start, start + 1 / words.length]}>
              {isAccent ? <em className="font-serif italic text-[var(--accent)]">{w}</em> : w}
            </ScrubWord>
          );
        })}
      </span>
    </p>
  );
}

/* Counts up when scrolled into view. */
export function Counter({ to, dec = 0, prefix = "", suffix = "", className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.8, ease: EASE, onUpdate: v => setVal(v) });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref} className={className}>{prefix}{val.toFixed(dec)}{suffix}</span>;
}

/* Magnetic pull towards the cursor, spring-damped. */
export function Magnetic({ children, strength = 0.3, className = "" }) {
  const ref = useRef(null);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 14, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 180, damping: 14, mass: 0.4 });
  const onMove = e => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => { x.set(0); y.set(0); };
  return (
    <motion.span ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ x: sx, y: sy }} className={`inline-block ${className}`}>
      {children}
    </motion.span>
  );
}

/* Pill button whose fill wipes up from below on hover. */
export function FillButton({ children, href, onClick, variant = "solid", className = "", ...rest }) {
  const base = `group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-500 ${className}`;
  const look = variant === "solid"
    ? "bg-[var(--ink)] text-[var(--bg)]"
    : "border border-[var(--border-hi)] text-[var(--ink)] hover:text-[var(--bg)]";
  const fill = variant === "solid" ? "bg-[var(--accent)]" : "bg-[var(--ink)]";
  const inner = (
    <>
      <span className={`absolute inset-0 translate-y-[101%] rounded-full ${fill} transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-y-0`} />
      <span className="relative flex items-center gap-2">{children}</span>
    </>
  );
  if (href) return <a href={href} target="_blank" rel="noreferrer" className={`${base} ${look}`} {...rest}>{inner}</a>;
  return <button type="button" onClick={onClick} className={`${base} ${look}`} {...rest}>{inner}</button>;
}

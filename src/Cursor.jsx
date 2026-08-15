import { useEffect, useRef, useState } from "react";
import "./Cursor.css";

/* Tiny procedural sound engine — no audio files needed. A soft sine-wave
   blip on hover, a slightly lower one on click. Off by default; only
   plays once the person turns it on (also satisfies browser autoplay
   rules, which require a real click before audio can start). */
let audioCtx = null;
function getCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  return audioCtx;
}
function playTone(freq, duration, peakGain) {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(peakGain, ctx.currentTime + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration + 0.02);
}

const INTERACTIVE_SELECTOR = "a, button, input, textarea, select, [role='button'], .cw-cursor-hover";

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const lastHoverEl = useRef(null);
  const soundOnRef = useRef(false);

  const [active, setActive] = useState(false);
  const [hover, setHover] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // skip touch devices entirely

    setActive(true);
    document.documentElement.classList.add("cw-cursor-active");

    const move = e => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    };
    window.addEventListener("mousemove", move);

    let raf;
    const loop = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.2;
      ring.current.y += (pos.current.y - ring.current.y) * 0.2;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onOver = e => {
      const el = e.target.closest ? e.target.closest(INTERACTIVE_SELECTOR) : null;
      if (el && el !== lastHoverEl.current) {
        lastHoverEl.current = el;
        setHover(true);
        if (soundOnRef.current) playTone(620 + Math.random() * 60, 0.08, 0.05);
      } else if (!el) {
        lastHoverEl.current = null;
        setHover(false);
      }
    };
    document.addEventListener("mouseover", onOver);

    const onDown = () => {
      if (soundOnRef.current) playTone(300, 0.07, 0.06);
    };
    window.addEventListener("mousedown", onDown);

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("cw-cursor-active");
    };
  }, []);

  const toggleSound = () => {
    setSoundOn(v => {
      const next = !v;
      if (next) {
        const ctx = getCtx();
        if (ctx && ctx.state === "suspended") ctx.resume();
        playTone(700, 0.09, 0.06);
      }
      return next;
    });
  };

  if (!active) return null; // touch device — no custom cursor, no toggle

  return (
    <>
      <div ref={dotRef} className={`cw-cursor-dot ${hover ? "cw-cursor-dot--hover" : ""}`} />
      <div ref={ringRef} className={`cw-cursor-ring ${hover ? "cw-cursor-ring--hover" : ""}`} />
      <button
        onClick={toggleSound}
        aria-label={soundOn ? "Mute interface sound" : "Enable interface sound"}
        title={soundOn ? "Sound on" : "Sound off"}
        className="cw-sound-toggle"
      >
        {soundOn ? "🔊" : "🔇"}
      </button>
    </>
  );
}
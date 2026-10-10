import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export const EASE = [0.22, 1, 0.36, 1];

/* ══════════════════════════════════════════════════════════
   SMOOTH SCROLL — Lenis, paused whenever a modal locks the body
   ══════════════════════════════════════════════════════════ */
let lenis = null;

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: id === "hero" ? 0 : -24, duration: 1.4 });
  else el.scrollIntoView({ behavior: "smooth" });
}

export function scrollToY(y, duration = 1.4) {
  if (lenis) lenis.scrollTo(y, { duration });
  else window.scrollTo({ top: y, behavior: "smooth" });
}

export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    lenis = new Lenis({ autoRaf: true, lerp: 0.09, wheelMultiplier: 1 });
    const mo = new MutationObserver(() => {
      if (document.body.style.overflow === "hidden") lenis.stop();
      else lenis.start();
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    return () => { mo.disconnect(); lenis.destroy(); lenis = null; };
  }, []);
}

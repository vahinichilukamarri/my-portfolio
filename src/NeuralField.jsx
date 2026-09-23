import { useEffect, useRef } from "react";

const LINK_DIST = 140;
const MOUSE_RADIUS = 190;

export default function NeuralField({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999 };
    let w = 0, h = 0, nodes = [], raf = 0, running = false;

    const seed = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(95, Math.max(28, (w * h) / 13000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.3 + 0.7,
      }));
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        const dx = n.x - mouse.x, dy = n.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < MOUSE_RADIUS && d > 0.1) {
          const push = (1 - d / MOUSE_RADIUS) * 0.9;
          n.x += (dx / d) * push; n.y += (dy / d) * push;
        }
        n.glow = d < MOUSE_RADIUS ? 1 - d / MOUSE_RADIUS : 0;
      }

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > LINK_DIST) continue;
          const glow = Math.max(a.glow, b.glow);
          const alpha = (1 - d / LINK_DIST) * (0.22 + glow * 0.55);
          ctx.strokeStyle = glow > 0.05 ? `rgba(34, 211, 238, ${alpha})` : `rgba(147, 132, 248, ${alpha})`;
          ctx.lineWidth = 0.7 + glow * 0.6;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }

      for (const n of nodes) {
        if (n.glow > 0.05) {
          ctx.strokeStyle = `rgba(34, 211, 238, ${n.glow * 0.35})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        ctx.fillStyle = n.glow > 0.05 ? `rgba(165, 243, 252, ${0.6 + n.glow * 0.4})` : "rgba(196, 190, 255, 0.55)";
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + n.glow * 1.6, 0, Math.PI * 2); ctx.fill();
      }

      if (running) raf = requestAnimationFrame(frame);
    };

    const start = () => { if (!running && !reduceMotion) { running = true; raf = requestAnimationFrame(frame); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    const onMove = e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    seed();
    if (reduceMotion) frame();

    const ro = new ResizeObserver(() => { seed(); if (reduceMotion) frame(); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(canvas);
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}

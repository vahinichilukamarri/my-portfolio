import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const LINKEDIN_ICON = (
  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
);

const TIERS = {
  sm: { w: 180, h: 260, tx: 42, ty: 10, rot: 6, spread: 18, lift: 26 },
  md: { w: 230, h: 330, tx: 88, ty: 14, rot: 6, spread: 40, lift: 36 },
  lg: { w: 262, h: 372, tx: 124, ty: 18, rot: 7, spread: 72, lift: 46 },
};

function useTier() {
  const get = () => (window.innerWidth < 640 ? "sm" : window.innerWidth < 1024 ? "md" : "lg");
  const [tier, setTier] = useState(() => (typeof window === "undefined" ? "lg" : get()));
  useEffect(() => {
    const onResize = () => setTier(get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return tier;
}

function PostHeader({ compact }) {
  return (
    <div className={`flex items-center gap-2 ${compact ? "px-3 pt-3 pb-2" : "px-5 pt-5 pb-3"}`}>
      <div className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--violet)] to-[var(--indigo)] font-display font-bold text-white ${compact ? "h-8 w-8 text-[11px]" : "h-10 w-10 text-sm"}`}>VC</div>
      <div className="min-w-0 text-left leading-tight">
        <div className={`truncate font-semibold text-[var(--ink)] ${compact ? "text-xs" : "text-sm"}`}>Vahini Chilukamarri</div>
        <div className={`font-mono text-[var(--muted-2)] ${compact ? "text-[9px]" : "text-[11px]"}`}>AI/ML Engineer · LinkedIn</div>
      </div>
      <svg viewBox="0 0 24 24" className={`ml-auto shrink-0 fill-[#0A66C2] ${compact ? "h-4 w-4" : "h-5 w-5"}`}>{LINKEDIN_ICON}</svg>
    </div>
  );
}

function Lightbox({ posts, index, onClose, onNav, profileUrl }) {
  const post = posts[index];

  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onNav(1);
      else if (e.key === "ArrowLeft") onNav(-1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onNav]);

  return createPortal(
    <div className="animate-backdrop-in fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" onClick={onClose} role="dialog" aria-modal="true" aria-label="LinkedIn post preview">
      <div key={index} className="animate-pop-in relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--border-hi)] bg-[#0d0e14] shadow-2xl shadow-black/60" onClick={e => e.stopPropagation()}>
        <div className="flex items-center border-b border-[var(--border)]">
          <div className="flex-1"><PostHeader /></div>
          <span className="px-2 font-mono text-[11px] text-[var(--muted-2)]">{index + 1} / {posts.length}</span>
          <button onClick={onClose} aria-label="Close preview" className="mr-4 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] transition-colors hover:border-[var(--violet)]/50 hover:text-[var(--ink)]">✕</button>
        </div>
        <div className="flex flex-wrap gap-2 px-5 py-3 font-mono text-xs text-[var(--cyan)]">
          {post.tags.map(t => <span key={t}>#{t}</span>)}
        </div>
        <div className="relative min-h-0 flex-1 bg-black">
          <img src={post.img} alt={`LinkedIn post: ${post.tags.map(t => "#" + t).join(" ")}`} className="mx-auto max-h-[62vh] w-full object-contain" />
          {posts.length > 1 && (
            <>
              <button onClick={() => onNav(-1)} aria-label="Previous post" className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur transition-transform hover:scale-110">←</button>
              <button onClick={() => onNav(1)} aria-label="Next post" className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur transition-transform hover:scale-110">→</button>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-5 py-4">
          <a href={profileUrl} target="_blank" rel="noreferrer" className="font-mono text-[11px] uppercase tracking-wider text-[var(--muted)] transition-colors hover:text-[var(--ink)]">Full profile ↗</a>
          <a href={post.url} target="_blank" rel="noreferrer" className="rounded-full bg-[#0A66C2] px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider text-white shadow-lg shadow-[#0A66C2]/30 transition-transform hover:scale-105">
            Read the post on LinkedIn ↗
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function HandOfCards({ posts, profileUrl }) {
  const cards = [...posts, { seeMore: true }];
  const mid = (cards.length - 1) / 2;
  const t = TIERS[useTier()];
  const [active, setActive] = useState(null);
  const [dealt, setDealt] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [preview, setPreview] = useState(null);
  const stageRef = useRef(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setDealt(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const closePreview = useCallback(() => setPreview(null), []);
  const navPreview = useCallback(dir => setPreview(p => (p + dir + posts.length) % posts.length), [posts.length]);

  const hover = i => { setActive(i); setInteracted(true); };

  return (
    <>
      <div
        ref={stageRef}
        className="relative mx-auto flex items-center justify-center"
        style={{ height: t.h + t.lift + 60 }}
        onMouseLeave={() => setActive(null)}
      >
        {cards.map((c, i) => {
          const offset = i - mid;
          let tx = offset * t.tx;
          let ty = Math.abs(offset) * t.ty + t.lift / 2;
          let rot = offset * t.rot;
          if (!dealt) { tx = 0; ty = t.lift + 30; rot = 0; }
          const isActive = active === i;
          if (dealt && active !== null && !isActive) {
            const dir = Math.sign(i - active);
            tx += dir * t.spread;
            rot += dir * 2;
          }
          const slotStyle = {
            width: t.w,
            height: t.h,
            transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg)`,
            zIndex: isActive ? 50 : c.seeMore ? 9 : 10 + i,
            transitionDelay: interacted ? "0ms" : `${i * 90}ms`,
          };
          const cardStyle = {
            transform: isActive ? `translateY(-${t.lift}px) rotate(${-rot}deg) scale(1.07)` : "none",
          };
          const common = {
            onMouseEnter: () => hover(i),
            onFocus: () => hover(i),
            style: slotStyle,
            className: "absolute block rounded-2xl outline-none transition-transform duration-[650ms] ease-[cubic-bezier(.22,1,.36,1)] focus-visible:ring-2 focus-visible:ring-[var(--cyan)]",
          };
          const face = (
            <div
              style={cardStyle}
              className={`flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-[#101119] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${isActive ? "border-[var(--violet)]/60 shadow-[0_30px_80px_-20px_rgba(147,132,248,0.55)]" : "border-[var(--border-hi)] shadow-2xl shadow-black/60"}`}
            >
              {c.seeMore ? (
                <div className="relative flex h-full flex-col items-center justify-center gap-3 overflow-hidden text-center">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(10,102,194,0.35),transparent_65%)]" />
                  <svg viewBox="0 0 24 24" className="relative h-12 w-12 fill-[#0A66C2]">{LINKEDIN_ICON}</svg>
                  <div className="relative font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">More on</div>
                  <div className="font-display relative text-xl font-bold text-[var(--ink)]">LinkedIn ↗</div>
                  <div className="relative px-6 text-xs text-[var(--muted-2)]">Hackathons, builds, and what I'm learning</div>
                </div>
              ) : (
                <>
                  <PostHeader compact />
                  <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 px-3 pb-2 font-mono text-[9px] text-[var(--cyan)]">
                    {c.tags.map(tag => <span key={tag}>#{tag}</span>)}
                  </div>
                  <div className="relative flex-1 overflow-hidden bg-black">
                    <img src={c.img} alt="" draggable="false" className={`h-full w-full object-cover object-top transition-transform duration-700 ${isActive ? "scale-105" : "scale-100"}`} />
                    <div className={`absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/85 to-transparent pb-3 pt-10 transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0"}`}>
                      <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white backdrop-blur">Click to preview</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
          return c.seeMore ? (
            <a key="more" href={profileUrl} target="_blank" rel="noreferrer" aria-label="See more on LinkedIn" {...common}>{face}</a>
          ) : (
            <button key={c.url} type="button" onClick={() => setPreview(i)} aria-label={`Preview LinkedIn post ${c.tags.map(tag => "#" + tag).join(" ")}`} {...common}>{face}</button>
          );
        })}
      </div>

      <p className="mt-6 text-center font-mono text-[11px] text-[var(--muted-2)]">
        <span className="hidden sm:inline">Hover to fan the hand · click a card to read the post</span>
        <span className="sm:hidden">Tap a card to read the post</span>
      </p>

      {preview !== null && <Lightbox posts={posts} index={preview} onClose={closePreview} onNav={navPreview} profileUrl={profileUrl} />}
    </>
  );
}

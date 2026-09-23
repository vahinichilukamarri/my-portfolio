import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function CommandPalette({ open, onClose, items }) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(it => `${it.group} ${it.label} ${it.keywords || ""}`.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  if (!open) return null;

  const run = it => { onClose(); setQuery(""); setCursor(0); it.action(); };
  const close = () => { onClose(); setQuery(""); setCursor(0); };

  const onKeyDown = e => {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => Math.min(results.length - 1, c + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCursor(c => Math.max(0, c - 1)); }
    else if (e.key === "Enter" && results[cursor]) { e.preventDefault(); run(results[cursor]); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
  };

  return createPortal(
    <div className="animate-backdrop-in fixed inset-0 z-[95] flex items-start justify-center bg-black/65 px-4 pt-[14vh] backdrop-blur-sm" onClick={close}>
      <div className="animate-pop-in w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border-hi)] bg-[#0d0e14]/95 shadow-2xl shadow-black/70" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-5">
          <span className="font-mono text-[var(--violet)]">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setCursor(0); }}
            onKeyDown={onKeyDown}
            placeholder="Jump to a section, open a repo, copy my email…"
            aria-label="Search commands"
            className="w-full bg-transparent py-4 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted-2)]"
          />
          <kbd className="rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted-2)]">ESC</kbd>
        </div>
        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 && <div className="px-3 py-8 text-center font-mono text-xs text-[var(--muted-2)]">no match for "{query}"</div>}
          {results.map((it, i) => {
            const header = i === 0 || results[i - 1].group !== it.group ? it.group : null;
            return (
              <div key={`${it.group}-${it.label}`}>
                {header && <div className="px-3 pt-3 pb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted-2)]">{header}</div>}
                <button
                  data-idx={i}
                  onMouseMove={() => setCursor(i)}
                  onClick={() => run(it)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${i === cursor ? "bg-[var(--violet)]/15 text-[var(--ink)]" : "text-[var(--muted)]"}`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-md border font-mono text-[10px] ${i === cursor ? "border-[var(--violet)]/50 text-[var(--violet)]" : "border-[var(--border)] text-[var(--muted-2)]"}`}>{it.icon}</span>
                    {it.label}
                  </span>
                  {it.hint && <span className="font-mono text-[10px] text-[var(--muted-2)]">{it.hint}</span>}
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 border-t border-[var(--border)] px-5 py-2.5 font-mono text-[10px] text-[var(--muted-2)]">
          <span>↑↓ navigate</span><span>↵ select</span><span>esc close</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

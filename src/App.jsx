import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import ContactWallet from "./Contactwallet";
import Cursor from "./Cursor";
import HandOfCards from "./HandOfCards";
import NeuralField from "./NeuralField";
import CommandPalette from "./CommandPalette";
import CaseStudies from "./CaseStudies";

// Swap these paths for your actual filenames if different.
import linkedinPost1 from "./assets/offer_img.jpeg";
import linkedinPost2 from "./assets/askbi.png";
import linkedinPost3 from "./assets/PScertificate.png";

/* ══════════════════════════════════════════════════════════
   DATA — sourced from resume, edit freely
   ══════════════════════════════════════════════════════════ */
const LINKS = {
  github: "https://github.com/vahinichilukamarri",
  linkedin: "https://www.linkedin.com/in/venkata-vahini-chilukamarri-2b5064314/",
  portfolio: "https://vahini-dev.vercel.app/",
  email: "vahinivenkatac@gmail.com",
  phone: "+91 8790261823",
  resume: "https://drive.google.com/file/d/1hvl7eQHsGslxknRLoo8KhHc6KwRSmLvY/view?usp=sharing",
};

const NAV = [
  { id: "hero", label: "Home", num: "00" },
  { id: "about", label: "About", num: "01" },
  { id: "experience", label: "Experience", num: "02" },
  { id: "work", label: "Work", num: "03" },
  { id: "deepdive", label: "Deep Dive", num: "04" },
  { id: "stack", label: "Stack", num: "05" },
  { id: "network", label: "Network", num: "06" },
  { id: "terminal", label: "Terminal", num: "07" },
  { id: "recognition", label: "Recognition", num: "08" },
  { id: "contact", label: "Contact", num: "09" },
];

const TICKER = [
  "whoami → venkata vahini chilukamarri",
  "role → ai/ml engineer, full-stack developer",
  "status → open to internships",
  "cgpa → 9.12 / 10.0 · kmit",
  "building → distributed systems, llm evaluation, rag pipelines",
  "shipped → trace, ledgerguard — deployed, benchmarked, documented",
];

const EXPERIENCE = {
  org: "Salesforce Mentorship Program",
  role: "Software Engineering Mentee — Microservice Health & API Performance Orchestrator",
  where: "GitHub · Remote",
  when: "June 2026 – August 2026",
  gh: "https://github.com/Harshitha-Macha/Automated-Microservice-Health-API-Performance-Orchestrator-v2",
  points: [
    "Designed a dependency-graph engine that auto-discovers service dependencies from OpenTelemetry trace spans, using Tarjan's SCC to detect and collapse circular dependencies before analysis.",
    "Built a root-cause analysis engine combining topological root-finding with time-correlation ranking, plus cycle-safe BFS/DFS blast-radius computation to predict cascading failure impact.",
    "Built a deduplicated Slack/Discord alerting pipeline with flap suppression and retry/fallback logging, backed by a SQLite incident store and a live Cytoscape.js dependency dashboard.",
  ],
  stack: ["FastAPI", "OpenTelemetry", "SQLite", "Cytoscape.js", "Slack API", "Graph Algorithms"],
};

const PROJECTS = [
  {
    no: "01", title: "TRACE", sub: "Bounded AI agent for failed-payment recovery · Razorpay AI Buildathon",
    accent: "rose", featured: true,
    desc: "A failed payment isn't a lost customer. TRACE evaluates whether recovering it is worth the effort, picks the single best next action, executes it, adapts to the outcome, and knows when to stop — with a deterministic policy layer that can veto it before anything runs.",
    points: [
      "Dual-engine design: a free deterministic heuristic scores every case; an LLM (Groq) is escalated to only when one of four uncertainty signals fires",
      "A 9-rule, 100% deterministic policy layer overrides the agent before execution — auditable independently of the AI",
      "Benchmarked against a static baseline on 300 synthetic cases: 98 cases correctly never pursued (vs. 43) at ₹873 recovered per intervention (vs. ₹766)",
    ],
    stack: ["React", "FastAPI", "SQLAlchemy", "Groq LLM", "PostgreSQL", "Vercel", "Render"],
    gh: "https://github.com/vahinichilukamarri/TRACE",
    live: "https://trace-xi-nine.vercel.app",
  },
  {
    no: "02", title: "LedgerGuard", sub: "Payment integrity platform · deterministic ledger guarantees",
    accent: "emerald", featured: true,
    desc: "A payment-integrity platform built in 14 locked, tagged phases — enforcing that debits equal credits for every transaction before it's ever persisted, then independently verifying, stress-testing, and explaining anything that looks wrong.",
    points: [
      "Double-entry invariant enforced inside the same transaction boundary as the write — no half-committed unbalanced state is ever visible",
      "Two independent anomaly detectors — a statistical composite and a hand-rolled Isolation Forest — scored in parallel and never blended into one number",
      "38 property-based tests (jqwik) plus 15 deterministic chaos-engineering fault injections at the JDBC, broker, and clock seams",
    ],
    stack: ["Java", "Spring Boot", "PostgreSQL", "Kafka", "Flyway", "React", "TypeScript"],
    gh: "https://github.com/vahinichilukamarri/LedgerGuard",
  },
  {
    no: "03", title: "Microservice Health Orchestrator", sub: "Observability platform · root-cause & blast-radius analysis",
    accent: "violet",
    desc: "The applied output of the Salesforce mentorship — a self-hosted platform that watches a microservice fleet, finds the root cause of an incident, and estimates blast radius before it spreads.",
    points: ["Dependency graph auto-discovered from OTel spans; cycles resolved with Tarjan's SCC", "Root-cause via topological root-finding + time-correlation ranking", "Cycle-safe BFS/DFS blast-radius detection feeding a live Cytoscape.js dashboard"],
    stack: ["React", "FastAPI", "OpenTelemetry", "SQLite"],
    gh: EXPERIENCE.gh,
  },
  {
    no: "04", title: "EvalEngine", sub: "LLM evaluation & improvement engine",
    accent: "cyan",
    desc: "A judge for other models. Generates, scores, and ranks multiple AI responses through structured multi-metric analysis, mimicking RLHF-style iterative refinement.",
    points: ["LLM-as-judge scoring across relevance, correctness, completeness, and bias", "Feedback-driven refinement loop with an interactive Streamlit dashboard", "Currently extending with hallucination detection and RAG for factual grounding"],
    stack: ["Python", "Streamlit", "LLM APIs", "Pandas", "Scikit-learn"],
    gh: "https://github.com/vahinichilukamarri/llm-evaluation-engine.git",
  },
  {
    no: "05", title: "AskBI", sub: "Plain-English business intelligence",
    accent: "amber",
    desc: "Ask a structured dataset a question in plain English and get back SQL, a result set, and a chart — built so non-technical teams can query and visualize data directly.",
    points: ["Natural-language-to-SQL via an LLM-based query generation pipeline", "FastAPI + Pandas backend for execution against real datasets", "React dashboard for real-time result visualization"],
    stack: ["React", "FastAPI", "Pandas", "LLM APIs", "SQL"],
    gh: "https://github.com/vahinichilukamarri/AskBI",
  },
  {
    no: "06", title: "MoodAngels", sub: "AI-based psychiatric diagnostic support",
    accent: "violet",
    desc: "A multi-agent NLP system that analyzes behavioral and textual patient data to assist diagnostic reasoning, evaluated on a synthetic dataset of 500+ case records.",
    points: ["Multi-agent architecture splitting behavioral vs. textual signal analysis", "NLP pipeline for pattern extraction across patient case records", "Evaluated on 500+ synthetic diagnostic cases for reasoning consistency"],
    stack: ["Python", "NLP", "MERN Stack"],
    gh: "https://github.com/AnishaPaturi/Mood-Angles",
  },
  {
    no: "07", title: "SafeStreet", sub: "Vision-Transformer road damage detection",
    accent: "cyan",
    desc: "A Vision Transformer trained to classify road damage, served through a Node.js REST API with a React Native field app and a React.js geolocation dashboard for end-to-end reporting.",
    points: ["ViT model trained for multi-class road damage classification", "Node.js REST API serving predictions to mobile and web clients", "React Native capture app + React.js geolocation dashboard"],
    stack: ["Vision Transformer", "React Native", "React", "Node.js"],
    gh: LINKS.github,
  },
];

const STACK = [
  { cat: "Languages", accent: "violet", items: ["Python", "JavaScript", "TypeScript", "Java", "C / C++", "SQL", "HTML / CSS"] },
  { cat: "Full-Stack & Frameworks", accent: "cyan", items: ["React", "React Router", "Node.js", "Express", "FastAPI", "Spring Boot", "REST APIs", "MERN Stack", "React Native", "Streamlit"] },
  { cat: "AI / ML & Deep Learning", accent: "amber", items: ["TensorFlow", "PyTorch", "Keras", "Hugging Face", "Vision Transformers", "NLP", "RAG", "Prompt Engineering", "Fine-tuning", "LLM APIs (Groq)"] },
  { cat: "Data & Tooling", accent: "violet", items: ["PostgreSQL", "MySQL", "MongoDB", "SQLite", "Kafka", "Flyway", "Git / GitHub", "Jira", "Docker", "Jupyter", "Pandas", "NumPy", "Scikit-learn"] },
  { cat: "Core Concepts", accent: "cyan", items: ["Data Structures & Algorithms", "OOP", "Distributed Systems & Observability", "Property-Based Testing", "Chaos Engineering", "CI/CD", "SDLC"] },
];

// Real LinkedIn posts — tags pulled from each post's own hashtags, links go straight to the post.
const LINKEDIN_POSTS = [
  { img: linkedinPost1, tags: ["Centific", "Hackathon", "ArtificialIntelligence"], url: "https://www.linkedin.com/posts/venkata-vahini-chilukamarri-2b5064314_centific-hackathon-artificialintelligence-activity-7458464588808863745-sTxB" },
  { img: linkedinPost2, tags: ["AI", "MachineLearning", "DataScience"], url: "https://www.linkedin.com/posts/venkata-vahini-chilukamarri-2b5064314_ai-machinelearning-datascience-activity-7448384011443433472-7ekJ" },
  { img: linkedinPost3, tags: ["ReactNative", "AI", "ComputerVision"], url: "https://www.linkedin.com/posts/venkata-vahini-chilukamarri-2b5064314_reactnative-ai-computervision-activity-7380108463823056896-DkQd" },
];

const CERTS = [
  { t: "SQL (Intermediate)", o: "HackerRank" },
  { t: "Generative AI for Beginners", o: "GreatLearning" },
  { t: "Generative AI Workshop", o: "Skilligence Edtech × IIT Hyderabad" },
];

const ACHIEVEMENTS = [
  { t: "DBMS Workshop Facilitator", d: "Co-taught a peer workshop on database systems at KMIT" },
  { t: "PRAKALP Hackathon", d: "Bluetooth Talking Vehicle prototype, team build" },
  { t: "GeeksforGeeks Hackathon", d: "End-to-end system design, working prototype" },
  { t: "Contributor, Rewriting the Code", d: "Durham, NC nonprofit — remote, since June 2026" },
  { t: "Graphic Designer Intern", d: "PR Team, Student Council, KMIT — 20+ assets, 2,000+ reach" },
  { t: "NSS Volunteer", d: "5+ community drives, 40+ volunteer hours since Aug 2023" },
  { t: "Top 3% Statewide, Intermediate", d: "97.0% in MPC, Narayana Junior College" },
];

const ACCENT = {
  violet: { text: "text-[var(--violet)]", ring: "ring-[var(--violet)]/30", bg: "bg-[var(--violet)]/10", border: "border-[var(--violet)]/30", dot: "bg-[var(--violet)]" },
  cyan: { text: "text-[var(--cyan)]", ring: "ring-[var(--cyan)]/30", bg: "bg-[var(--cyan)]/10", border: "border-[var(--cyan)]/30", dot: "bg-[var(--cyan)]" },
  amber: { text: "text-[var(--amber)]", ring: "ring-[var(--amber)]/30", bg: "bg-[var(--amber)]/10", border: "border-[var(--amber)]/30", dot: "bg-[var(--amber)]" },
  emerald: { text: "text-[var(--emerald)]", ring: "ring-[var(--emerald)]/30", bg: "bg-[var(--emerald)]/10", border: "border-[var(--emerald)]/30", dot: "bg-[var(--emerald)]" },
  rose: { text: "text-[var(--rose)]", ring: "ring-[var(--rose)]/30", bg: "bg-[var(--rose)]/10", border: "border-[var(--rose)]/30", dot: "bg-[var(--rose)]" },
};

/* ══════════════════════════════════════════════════════════
   TERMINAL COMMANDS — driven entirely by this page's own data
   ══════════════════════════════════════════════════════════ */
function useTerminalCommands() {
  const repos = PROJECTS.map(p => ({ slug: p.title.toLowerCase().replace(/\s+/g, "-"), ...p }));

  const findRepo = q => {
    if (!q) return null;
    const n = parseInt(q, 10);
    if (!Number.isNaN(n) && repos[n - 1]) return repos[n - 1];
    return repos.find(r => r.slug.includes(q.toLowerCase())) || null;
  };

  const run = raw => {
    const parts = raw.trim().split(/\s+/);
    const cmd = (parts[0] || "").toLowerCase();
    const arg = parts.slice(1).join(" ");

    switch (cmd) {
      case "":
        return [];
      case "help":
        return [
          "available commands:",
          "  help              show this list",
          "  ls / repos        list repositories",
          "  whoami            about vahini",
          "  stack             tech stack",
          "  cat resume        resume link",
          "  cat <repo>        repo description",
          "  open <repo|#>     open repo on github",
          "  experience        salesforce mentorship",
          "  achievements      awards & activities",
          "  certs             certifications",
          "  contact           how to reach me",
          "  clear             clear the terminal",
        ];
      case "ls":
      case "repos":
        return repos.map((r, i) => `${i + 1}. ${r.slug.padEnd(34)} ${r.sub}`);
      case "whoami":
      case "about":
        return [
          "vahini chilukamarri",
          "4th-year cs @ kmit, hyderabad · cgpa 9.12",
          "ai/ml engineer · full-stack developer",
          "status: open to internships",
        ];
      case "stack":
        return STACK.flatMap(s => [`${s.cat}:`, `  ${s.items.join(", ")}`]);
      case "cat":
        if (!arg) return ["usage: cat <resume|repo-name>"];
        if (/resume/i.test(arg)) return [`resume → ${LINKS.resume}`];
        {
          const r = findRepo(arg);
          if (r) return [r.title, r.desc, `stack: ${r.stack.join(", ")}`, `source: ${r.gh}`];
        }
        return [`cat: ${arg}: no such file`];
      case "open":
        if (/linkedin/i.test(arg)) { window.open(LINKS.linkedin, "_blank"); return ["opening linkedin ↗"]; }
        if (/portfolio/i.test(arg)) { window.open(LINKS.portfolio, "_blank"); return ["opening portfolio ↗"]; }
        {
          const r = findRepo(arg);
          if (r) { window.open(r.gh, "_blank"); return [`opening ${r.slug} ↗`]; }
        }
        return [`open: ${arg || "?"} — not found, try 'ls'`];
      case "experience":
        return [`${EXPERIENCE.org} — ${EXPERIENCE.when}`, EXPERIENCE.role, ...EXPERIENCE.points.map(p => `  - ${p}`)];
      case "achievements":
        return ACHIEVEMENTS.map(a => `- ${a.t}: ${a.d}`);
      case "certs":
        return CERTS.map(c => `- ${c.t} (${c.o})`);
      case "contact":
        return [`email  → ${LINKS.email}`, `github → ${LINKS.github}`, `phone  → ${LINKS.phone}`];
      case "sudo":
        return ["permission denied: vahini is not in the sudoers file. this incident will be reported. (jk — try 'help')"];
      case "clear":
        return null;
      default:
        return [`command not found: ${cmd} — type 'help'`];
    }
  };

  return { run, repos };
}

/* ══════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════ */
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); o.disconnect(); } }, { threshold: 0.12 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${visible ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}s` }}>{children}</div>;
}

const SCRAMBLE_CHARS = "!<>-_\\/[]{}=+*^?#01ABCDEFXYZ";

function Scramble({ text, offset = 0 }) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, last = 0;
    const t0 = performance.now();
    const settleAt = i => 260 + offset + i * 55;
    const total = settleAt(text.length);
    const tick = now => {
      const elapsed = now - t0;
      if (elapsed >= total) { setOut(text); return; }
      if (now - last > 45) {
        last = now;
        setOut(text.split("").map((ch, i) => (elapsed >= settleAt(i) ? ch : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)])).join(""));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, offset]);
  return <span aria-label={text}><span aria-hidden="true">{out}</span></span>;
}

function Magnetic({ children, strength = 0.28 }) {
  const ref = useRef(null);
  const onMove = e => {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const onLeave = () => { ref.current.style.transform = "translate(0, 0)"; };
  return (
    <span ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className="inline-block transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]">
      {children}
    </span>
  );
}

function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (ref.current) ref.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} aria-hidden="true" className="fixed top-0 left-0 z-[60] h-[2px] w-full origin-left bg-gradient-to-r from-[var(--violet)] via-[var(--indigo)] to-[var(--cyan)]" style={{ transform: "scaleX(0)" }} />;
}

function StackMarquee() {
  const rows = [
    STACK.slice(0, 3).flatMap(s => s.items),
    STACK.slice(3).flatMap(s => s.items),
  ];
  return (
    <div className="relative space-y-3 overflow-hidden border-y border-[var(--border)] bg-[var(--surface)] py-5 marquee-mask" aria-label="Tech stack">
      {rows.map((items, r) => (
        <div key={r} className={`flex w-max gap-3 ${r === 0 ? "animate-marquee" : "animate-marquee-reverse"}`}>
          {[...items, ...items].map((it, i) => (
            <span key={i} aria-hidden={i >= items.length} className="flex items-center gap-3 whitespace-nowrap rounded-full border border-[var(--border)] bg-black/20 px-4 py-1.5 font-mono text-xs text-[var(--muted)]">
              <span className={`h-1.5 w-1.5 rounded-full ${["bg-[var(--violet)]", "bg-[var(--cyan)]", "bg-[var(--amber)]", "bg-[var(--emerald)]", "bg-[var(--rose)]"][i % 5]}`} />
              {it}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function Eyebrow({ num, children }) {
  return (
    <div className="flex items-center gap-3 font-mono text-xs tracking-[0.25em] text-[var(--muted)] uppercase">
      <span className="text-[var(--violet)]">{num}</span>
      <span className="h-px w-8 bg-[var(--border-hi)]" />
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   BACKDROP — animated gradient mesh + drifting grid
   ══════════════════════════════════════════════════════════ */
function Backdrop() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[var(--bg)]">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="animate-blob absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-[var(--indigo)]/25 blur-[120px]" />
      <div className="animate-blob-slow absolute top-1/3 -right-40 h-[30rem] w-[30rem] rounded-full bg-[var(--cyan)]/15 blur-[120px]" />
      <div className="animate-blob absolute bottom-0 left-1/4 h-[26rem] w-[26rem] rounded-full bg-[var(--amber)]/10 blur-[130px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg)]" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   NAV
   ══════════════════════════════════════════════════════════ */
function Nav({ onOpenPalette }) {
  const [active, setActive] = useState("hero");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const y = window.scrollY + window.innerHeight * 0.35;
      let cur = "hero";
      NAV.forEach(n => { const el = document.getElementById(n.id); if (el && el.offsetTop <= y) cur = n.id; });
      setActive(cur);
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = id => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setOpen(false); };

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)]" : "bg-transparent"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <button onClick={() => goTo("hero")} className="font-display text-lg font-bold tracking-tight">
          VC<span className="text-[var(--violet)]">.</span>
        </button>
        <nav className="hidden xl:flex items-center gap-0.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-1.5 py-1.5 backdrop-blur-xl">
          {NAV.filter(n => n.id !== "hero").map(n => (
            <button
              key={n.id}
              onClick={() => goTo(n.id)}
              className={`rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all ${active === n.id ? "bg-white text-black" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}
            >
              {n.label}
            </button>
          ))}
        </nav>
        <div className="hidden xl:flex items-center gap-2">
          <button onClick={onOpenPalette} aria-label="Open command palette" className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-mono text-[11px] text-[var(--muted)] backdrop-blur-xl transition-colors hover:border-[var(--violet)]/50 hover:text-[var(--ink)]">
            <kbd className="font-mono">⌘K</kbd>
          </button>
          <Magnetic>
            <a href={LINKS.resume} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--violet)] to-[var(--indigo)] px-5 py-2 font-mono text-[11px] uppercase tracking-wider text-white shadow-lg shadow-[var(--indigo)]/25">
              Resume ↗
            </a>
          </Magnetic>
        </div>
        <button onClick={() => setOpen(o => !o)} className="xl:hidden flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-[var(--border)]" aria-label="Menu">
          <span className={`h-px w-5 bg-[var(--ink)] transition-transform ${open ? "translate-y-[3px] rotate-45" : ""}`} />
          <span className={`h-px w-5 bg-[var(--ink)] transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`h-px w-5 bg-[var(--ink)] transition-transform ${open ? "-translate-y-[3px] -rotate-45" : ""}`} />
        </button>
      </div>
      {open && (
        <div className="xl:hidden max-h-[calc(100vh-72px)] overflow-y-auto border-t border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-xl px-6 py-4">
          {NAV.map(n => (
            <button key={n.id} onClick={() => goTo(n.id)} className={`flex w-full items-center justify-between border-b border-[var(--border)] py-3 font-mono text-sm uppercase tracking-wider last:border-0 ${active === n.id ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}>
              {n.label}<span className="text-[var(--violet)]">{n.num}</span>
            </button>
          ))}
          <a href={LINKS.resume} target="_blank" rel="noreferrer" className="mt-4 flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[var(--violet)] to-[var(--indigo)] py-3 font-mono text-xs uppercase tracking-wider text-white">
            Resume ↗
          </a>
        </div>
      )}
    </header>
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
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 backdrop-blur-xl">
      <span className="h-2 w-2 rounded-full bg-[var(--cyan)] shadow-[0_0_10px_var(--cyan)]" />
      <span className="font-mono text-xs text-[var(--muted)]">
        <span className="text-[var(--ink)]">$</span> {text}<span className="animate-caret text-[var(--cyan)]">▍</span>
      </span>
    </div>
  );
}

function Hero({ onOpenPalette }) {
  const goTo = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <section id="hero" className="relative flex min-h-screen items-center px-6 pt-28 pb-16">
      <NeuralField className="[mask-image:linear-gradient(to_bottom,black_55%,transparent)]" />
      <div className="relative mx-auto w-full max-w-7xl">
        <Reveal>
          <Ticker />
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="font-display mt-8 text-[15vw] leading-[0.92] font-bold tracking-tight sm:text-[9vw] lg:text-[6.4rem]">
            <Scramble text="Vahini" /><br />
            <span className="bg-gradient-to-r from-[var(--violet)] via-[var(--indigo)] to-[var(--cyan)] bg-clip-text text-transparent">
              <Scramble text="Chilukamarri" offset={180} />
            </span>
          </h1>
        </Reveal>
        <Reveal delay={0.16} className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <div className="flex flex-wrap gap-2 font-mono text-xs uppercase tracking-wider text-[var(--muted)]">
              <span className="rounded-full border border-[var(--border)] px-3 py-1">AI / ML Engineer</span>
              <span className="rounded-full border border-[var(--border)] px-3 py-1">Full-Stack Developer</span>
              <span className="rounded-full border border-[var(--violet)]/30 bg-[var(--violet)]/10 px-3 py-1 text-[var(--violet)]">Open to Internships</span>
            </div>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
              4th-year CS student at KMIT building the parts of AI systems that have to actually work in production —
              evaluation pipelines, retrieval backends, distributed observability, and the full-stack scaffolding around them.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Magnetic>
                <button onClick={() => goTo("work")} className="rounded-full bg-gradient-to-r from-[var(--violet)] to-[var(--indigo)] px-6 py-3 font-mono text-xs uppercase tracking-wider text-white shadow-lg shadow-[var(--indigo)]/25">
                  See the Work →
                </button>
              </Magnetic>
              <Magnetic>
                <button onClick={() => goTo("contact")} className="rounded-full border border-[var(--border-hi)] bg-[var(--bg)]/40 px-6 py-3 font-mono text-xs uppercase tracking-wider text-[var(--ink)] backdrop-blur transition-colors hover:border-[var(--violet)]/50 hover:text-[var(--violet)]">
                  Get in Touch
                </button>
              </Magnetic>
              <button onClick={onOpenPalette} className="hidden items-center gap-2 px-2 font-mono text-[11px] text-[var(--muted-2)] transition-colors hover:text-[var(--muted)] md:inline-flex">
                or press <kbd className="rounded border border-[var(--border-hi)] px-1.5 py-0.5 text-[var(--muted)]">⌘K</kbd> to jump anywhere
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[["9.12", "CGPA"], ["7", "Shipped Builds"], ["2027", "Graduating"], ["1", "Mentorship, Salesforce"]].map(([n, l]) => (
              <div key={l} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 backdrop-blur-xl">
                <div className="font-display text-2xl font-bold text-[var(--ink)]">{n}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">{l}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   ABOUT
   ══════════════════════════════════════════════════════════ */
function About() {
  return (
    <section id="about" className="relative px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal><Eyebrow num="01">About</Eyebrow></Reveal>
        <Reveal delay={0.06}><h2 className="font-display mt-4 text-4xl font-bold sm:text-5xl">The person behind the commits</h2></Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <Reveal delay={0.1} className="space-y-5 text-lg leading-relaxed text-[var(--muted)]">
            <p>I'm a <b className="text-[var(--ink)]">4th-year Computer Science student at KMIT, Hyderabad</b> (CGPA 9.12), currently mentored through the <b className="text-[var(--ink)]">Salesforce Mentorship Program</b> on a microservice health and API performance orchestrator.</p>
            <p>Most of what I build sits at the intersection of <b className="text-[var(--ink)]">LLM systems, distributed observability, and full-stack engineering</b> — dependency graphs discovered from trace spans, evaluation pipelines that judge other models, and the dashboards that make all of it usable.</p>
            <p>Outside of coursework, I'm on a structured prep track across DSA, system design, and AI engineering depth — and I contribute remotely to <b className="text-[var(--ink)]">Rewriting the Code</b>, a nonprofit supporting women in tech.</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {["KMIT · CGPA 9.12", "Hyderabad, India", "Expected 2027", "Salesforce Mentee"].map(t => (
                <span key={t} className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 font-mono text-[11px] text-[var(--muted)]">{t}</span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[var(--violet)] to-[var(--indigo)] font-display font-bold text-white">VC</div>
                <span className="rounded-full bg-[var(--cyan)]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--cyan)]">Verified</span>
              </div>
              {[["Subject", "Vahini Chilukamarri"], ["Role", "AI / ML Engineer"], ["Base", "Hyderabad, India"], ["Institution", "KMIT"], ["Focus", "LLM Systems · Distributed Systems"], ["Status", "Open to internships"]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-b border-[var(--border)] py-3 font-mono text-xs last:border-0">
                  <span className="text-[var(--muted-2)] uppercase tracking-wider">{k}</span>
                  <span className="text-[var(--ink)]">{v}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2} className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { tag: "Resume", h: "Read the full file", d: "Education, experience, and every project — updated with the latest work.", go: "Open PDF ↗", href: LINKS.resume },
            { tag: "GitHub", h: "vahinichilukamarri", d: "Every repo referenced on this page lives here, plus ongoing DSA practice.", go: "Visit profile ↗", href: LINKS.github },
            { tag: "Portfolio", h: "vahini-dev.vercel.app", d: "This site, live — always reflects the current build.", go: "Open site ↗", href: LINKS.portfolio },
          ].map(f => (
            <a key={f.tag} href={f.href} target="_blank" rel="noreferrer" className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-xl transition-all hover:border-[var(--violet)]/40 hover:bg-[var(--surface-hi)]">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--violet)]">{f.tag}</div>
              <div className="font-display mt-2 text-lg font-bold">{f.h}</div>
              <div className="mt-2 text-sm text-[var(--muted)]">{f.d}</div>
              <div className="mt-4 font-mono text-xs text-[var(--cyan)] transition-transform group-hover:translate-x-1">{f.go}</div>
            </a>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   EXPERIENCE
   ══════════════════════════════════════════════════════════ */
function Experience() {
  return (
    <section id="experience" className="relative px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal><Eyebrow num="02">Experience</Eyebrow></Reveal>
        <Reveal delay={0.06}><h2 className="font-display mt-4 text-4xl font-bold sm:text-5xl">Mentored, shipped, live</h2></Reveal>

        <Reveal delay={0.12} className="mt-12 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] p-8 sm:flex-row sm:items-center">
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-[var(--violet)]">{EXPERIENCE.when} · {EXPERIENCE.where}</div>
              <div className="font-display mt-2 text-2xl font-bold">{EXPERIENCE.org}</div>
              <div className="mt-1 text-[var(--muted)]">{EXPERIENCE.role}</div>
            </div>
            <a href={EXPERIENCE.gh} target="_blank" rel="noreferrer" className="shrink-0 rounded-full border border-[var(--border-hi)] px-5 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors hover:border-[var(--violet)]/50 hover:text-[var(--violet)]">
              View Source ↗
            </a>
          </div>
          <div className="grid gap-6 p-8 lg:grid-cols-[1.5fr_1fr]">
            <ul className="space-y-4">
              {EXPERIENCE.points.map(p => (
                <li key={p} className="flex gap-3 text-[var(--muted)]">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--violet)]" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap content-start gap-2">
              {EXPERIENCE.stack.map(s => (
                <span key={s} className="rounded-full border border-[var(--violet)]/30 bg-[var(--violet)]/10 px-3 py-1.5 font-mono text-[11px] text-[var(--violet)]">{s}</span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   WORK / PROJECTS
   ══════════════════════════════════════════════════════════ */
function ProjectCard({ p, i }) {
  const a = ACCENT[p.accent];
  const ref = useRef(null);
  const onMove = e => {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    el.style.transform = `perspective(1100px) rotateX(${(0.5 - y / r.height) * 5}deg) rotateY(${(x / r.width - 0.5) * 5}deg) translateY(-4px)`;
  };
  const onLeave = () => { ref.current.style.transform = ""; };
  return (
    <Reveal delay={(i % 3) * 0.06} className="h-full">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ "--accent": `var(--${p.accent})` }}
        className={`group relative h-full overflow-hidden rounded-3xl border ${a.border} bg-[var(--surface)] p-8 backdrop-blur-xl transition-[transform,background-color,box-shadow] duration-300 ease-out hover:bg-[var(--surface-hi)] hover:shadow-2xl hover:shadow-black/40 ${p.featured ? `ring-1 ${a.ring} shadow-lg shadow-black/20` : ""}`}
      >
        <div className="spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className={`absolute -right-16 -top-16 h-40 w-40 rounded-full ${a.bg} blur-3xl`} />
        <div className="relative flex items-start justify-between">
          <span className={`font-mono text-xs ${a.text}`}>{p.no}</span>
          <div className="flex items-center gap-2">
            {p.featured && (
              <span className={`rounded-full border ${a.border} ${a.bg} px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${a.text}`}>Flagship</span>
            )}
            <span className={`h-2 w-2 rounded-full ${a.dot}`} />
          </div>
        </div>
        <h3 className="font-display relative mt-4 text-2xl font-bold">{p.title}</h3>
        <p className={`relative mt-1 font-mono text-xs ${a.text}`}>{p.sub}</p>
        <p className="relative mt-4 text-sm leading-relaxed text-[var(--muted)]">{p.desc}</p>
        <ul className="relative mt-4 space-y-2">
          {p.points.map(pt => (
            <li key={pt} className="flex gap-2 text-sm text-[var(--muted)]">
              <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${a.dot}`} />
              <span>{pt}</span>
            </li>
          ))}
        </ul>
        <div className="relative mt-6 flex flex-wrap gap-2 border-t border-[var(--border)] pt-5">
          {p.stack.map(s => <span key={s} className="rounded-full border border-[var(--border)] px-2.5 py-1 font-mono text-[10px] text-[var(--muted)]">{s}</span>)}
        </div>
        <div className="relative mt-5 flex items-center gap-5">
          <a href={p.gh} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1 font-mono text-xs ${a.text} transition-transform hover:translate-x-1`}>
            View source ↗
          </a>
          {p.live && (
            <a href={p.live} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-xs text-[var(--muted)] transition-transform hover:translate-x-1 hover:text-[var(--ink)]">
              Live demo ↗
            </a>
          )}
        </div>
      </div>
    </Reveal>
  );
}

function Work() {
  return (
    <section id="work" className="relative px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal><Eyebrow num="03">Work</Eyebrow></Reveal>
        <Reveal delay={0.06}><h2 className="font-display mt-4 text-4xl font-bold sm:text-5xl">Seven builds, open for review</h2></Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p, i) => <ProjectCard key={p.no} p={p} i={i} />)}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   STACK / SKILLS
   ══════════════════════════════════════════════════════════ */
function Stack() {
  return (
    <section id="stack" className="relative px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal><Eyebrow num="05">Stack</Eyebrow></Reveal>
        <Reveal delay={0.06}><h2 className="font-display mt-4 text-4xl font-bold sm:text-5xl">What runs underneath</h2></Reveal>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {STACK.map((s, i) => {
            const a = ACCENT[s.accent];
            return (
              <Reveal key={s.cat} delay={i * 0.05}>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-xl">
                  <div className={`font-mono text-xs uppercase tracking-wider ${a.text}`}>{s.cat}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {s.items.map(it => (
                      <span key={it} className={`rounded-full border ${a.border} ${a.bg} px-3 py-1.5 text-sm ${a.text}`}>{it}</span>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
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
    <section id="network" className="relative overflow-hidden px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal><Eyebrow num="06">Network</Eyebrow></Reveal>
        <Reveal delay={0.06}><h2 className="font-display mt-4 text-4xl font-bold sm:text-5xl">A hand from LinkedIn</h2></Reveal>
        <Reveal delay={0.1}><p className="mt-4 max-w-2xl text-[var(--muted)]">Hackathons, launches, and certifications, as I posted them. Pick a card to read it.</p></Reveal>
        <div className="mt-14">
          <HandOfCards posts={LINKEDIN_POSTS} profileUrl={LINKS.linkedin} />
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   TERMINAL — interactive, driven entirely by this page's own data
   (this replaces the old static "GitHub" repo-list section)
   ══════════════════════════════════════════════════════════ */
function Terminal() {
  const { run, repos } = useTerminalCommands();
  const [lines, setLines] = useState([
    { t: "sys", v: "welcome to vahini@terminal — type 'help' or tap a command on the right" },
  ]);
  const [input, setInput] = useState("");
  const [hist, setHist] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const exec = raw => {
    const cmd = raw.trim();
    if (!cmd) return;
    setLines(l => [...l, { t: "cmd", v: cmd }]);
    if (cmd.toLowerCase() === "clear") { setLines([]); setHist(h => [...h, cmd]); setHistIdx(-1); return; }
    const out = run(cmd);
    if (out && out.length) setLines(l => [...l, ...out.map(v => ({ t: "out", v }))]);
    setHist(h => [...h, cmd]);
    setHistIdx(-1);
  };

  const onSubmit = e => {
    e.preventDefault();
    exec(input);
    setInput("");
  };

  const onKeyDown = e => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!hist.length) return;
      const idx = histIdx === -1 ? hist.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(idx); setInput(hist[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx === -1) return;
      const idx = histIdx + 1;
      if (idx >= hist.length) { setHistIdx(-1); setInput(""); }
      else { setHistIdx(idx); setInput(hist[idx]); }
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  const CHEATS = [
    ["help", "list all commands"],
    ["ls", "list repositories"],
    ["whoami", "about vahini"],
    ["stack", "tech stack"],
    ["cat resume", "resume link"],
    [`open ${repos[1]?.slug || "eval-engine"}`, "open a repo"],
    ["experience", "salesforce mentorship"],
    ["contact", "get in touch"],
  ];

  return (
    <section id="terminal" className="relative px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal><Eyebrow num="07">Terminal</Eyebrow></Reveal>
        <Reveal delay={0.06}><h2 className="font-display mt-4 text-4xl font-bold sm:text-5xl">Skip the scrolling — just ask</h2></Reveal>
        <Reveal delay={0.1}><p className="mt-4 max-w-2xl text-[var(--muted)]">A live terminal — type a command yourself, or tap one from the cheat sheet. Everything it answers with comes straight from this page's own data, nothing fetched externally.</p></Reveal>

        <Reveal delay={0.14} className="mt-12 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div
            className="overflow-hidden rounded-2xl border border-[var(--border-hi)] bg-[#0a0a0f] shadow-2xl shadow-black/40"
            onClick={() => inputRef.current?.focus()}
          >
            <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
              <span className="ml-3 font-mono text-[11px] text-[var(--muted-2)]">vahini@terminal:~</span>
            </div>
            <div ref={scrollRef} className="h-[360px] overflow-y-auto p-6 font-mono text-[13px] leading-relaxed sm:p-8">
              {lines.map((l, i) => (
                <div key={i} className={l.t === "cmd" ? "text-[var(--ink)]" : l.t === "sys" ? "text-[var(--muted-2)]" : "whitespace-pre-wrap text-[var(--muted)]"}>
                  {l.t === "cmd" ? <><span className="text-[var(--cyan)]">$</span> {l.v}</> : l.v}
                </div>
              ))}
              <form onSubmit={onSubmit} className="mt-1 flex items-center gap-2">
                <span className="text-[var(--cyan)]">$</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Terminal command input"
                  className="flex-1 bg-transparent text-[var(--ink)] outline-none"
                  placeholder="type a command…"
                />
                <span className="animate-caret text-[var(--cyan)]">▍</span>
              </form>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-xl">
            <div className="font-mono text-xs uppercase tracking-wider text-[var(--violet)]">Cheat sheet</div>
            <div className="mt-4 space-y-2">
              {CHEATS.map(([c, d]) => (
                <button
                  key={c}
                  onClick={() => { exec(c); inputRef.current?.focus(); }}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2 text-left transition-colors hover:border-[var(--border)] hover:bg-[var(--surface-hi)]"
                >
                  <span className="font-mono text-xs text-[var(--cyan)]">{c}</span>
                  <span className="text-right text-[11px] text-[var(--muted-2)]">{d}</span>
                </button>
              ))}
            </div>
            <a href={LINKS.github} target="_blank" rel="noreferrer" className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4 font-mono text-[11px] text-[var(--muted-2)] transition-colors hover:text-[var(--violet)]">
              open real github profile ↗
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   RECOGNITION — certs + achievements
   ══════════════════════════════════════════════════════════ */
function Recognition() {
  return (
    <section id="recognition" className="relative px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal><Eyebrow num="08">Recognition</Eyebrow></Reveal>
        <Reveal delay={0.06}><h2 className="font-display mt-4 text-4xl font-bold sm:text-5xl">Certified, and on record</h2></Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <Reveal delay={0.1}>
            <div className="font-mono text-xs uppercase tracking-wider text-[var(--violet)]">Certifications</div>
            <div className="mt-4 space-y-3">
              {CERTS.map((c, i) => (
                <div key={c.t} className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 backdrop-blur-xl">
                  <div className="font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--violet)]/10 text-xs font-bold text-[var(--violet)]">{String(i + 1).padStart(2, "0")}</div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--ink)]">{c.t}</div>
                    <div className="text-xs text-[var(--muted)]">{c.o}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="font-mono text-xs uppercase tracking-wider text-[var(--cyan)]">Achievements</div>
            <div className="mt-4 space-y-3">
              {ACHIEVEMENTS.map((a, i) => (
                <div key={a.t} className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 backdrop-blur-xl">
                  <div className="font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--cyan)]/10 text-xs font-bold text-[var(--cyan)]">{String(i + 1).padStart(2, "0")}</div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--ink)]">{a.t}</div>
                    <div className="text-xs text-[var(--muted)]">{a.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
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

  return (
    <section id="contact" className="relative px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal><Eyebrow num="09">Contact</Eyebrow></Reveal>
        <Reveal delay={0.06}><h2 className="font-display mt-4 text-4xl font-bold sm:text-5xl">Let's build something</h2></Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-center">
          <Reveal delay={0.1} className="flex flex-col items-center gap-10 md:flex-row md:items-center md:justify-center lg:justify-start lg:gap-14">
            <p className="max-w-xs text-lg text-[var(--muted)] text-center md:text-left">Currently looking for Software Engineering or AI/ML internship opportunities. If you'd like to work together, or just say hi — reach out.</p>
            <ContactWallet />
          </Reveal>
          <Reveal delay={0.16}>
            <form onSubmit={handleForm} className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 backdrop-blur-xl">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted-2)]">Name</label>
                  <input name="fn" placeholder="Your name" className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--violet)]/50" />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted-2)]">Email</label>
                  <input name="fe" type="email" placeholder="your@email.com" className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--violet)]/50" />
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted-2)]">Message</label>
                <textarea name="fm" rows="5" placeholder="Tell me about your project or opportunity..." className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--violet)]/50" />
              </div>
              {msg.text && <div className={`font-mono text-xs ${msg.type === "ok" ? "text-[var(--cyan)]" : "text-[var(--amber)]"}`}>{msg.text}</div>}
              <button type="submit" className="w-full rounded-full bg-gradient-to-r from-[var(--violet)] to-[var(--indigo)] py-3.5 font-mono text-xs uppercase tracking-wider text-white shadow-lg shadow-[var(--indigo)]/25 transition-transform hover:scale-[1.02]">
                Send via Mail →
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--border)] px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="font-mono text-[11px] text-[var(--muted-2)]">© 2026 Vahini Chilukamarri · built with intent</div>
        <div className="flex gap-6 font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]">
          <a href={LINKS.github} target="_blank" rel="noreferrer" className="transition-colors hover:text-[var(--violet)]">GitHub</a>
          <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className="transition-colors hover:text-[var(--violet)]">LinkedIn</a>
          <a href={`mailto:${LINKS.email}`} className="transition-colors hover:text-[var(--violet)]">Email</a>
        </div>
      </div>
    </footer>
  );
}

function usePaletteItems() {
  return useMemo(() => {
    const goTo = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    const open = url => window.open(url, "_blank", "noopener");
    return [
      ...NAV.map(n => ({ group: "Jump to", label: n.label, hint: n.num, icon: "§", action: () => goTo(n.id) })),
      ...PROJECTS.map(p => ({ group: "Projects", label: `${p.title} — source`, hint: "github", icon: "{}", keywords: p.stack.join(" "), action: () => open(p.gh) })),
      ...PROJECTS.filter(p => p.live).map(p => ({ group: "Projects", label: `${p.title} — live app`, hint: "vercel", icon: "▶", action: () => open(p.live) })),
      { group: "Links", label: "Resume", hint: "pdf", icon: "↗", action: () => open(LINKS.resume) },
      { group: "Links", label: "LinkedIn", hint: "profile", icon: "in", action: () => open(LINKS.linkedin) },
      { group: "Links", label: "GitHub", hint: "profile", icon: "gh", action: () => open(LINKS.github) },
      { group: "Links", label: "Copy email address", hint: LINKS.email, icon: "@", keywords: "mail contact", action: () => navigator.clipboard?.writeText(LINKS.email) },
      { group: "Links", label: "Send an email", hint: "mailto", icon: "✉", keywords: "mail contact", action: () => { window.location.href = `mailto:${LINKS.email}`; } },
    ];
  }, []);
}

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const paletteItems = usePaletteItems();

  useEffect(() => {
    const onKey = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen(o => !o); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openPalette = () => setPaletteOpen(true);

  return (
    <div className="relative min-h-screen">
      <Cursor />
      <ScrollProgress />
      <Backdrop />
      <Nav onOpenPalette={openPalette} />
      <Hero onOpenPalette={openPalette} />
      <StackMarquee />
      <About />
      <Experience />
      <Work />
      <CaseStudies eyebrow={<Reveal><Eyebrow num="04">Deep Dive</Eyebrow></Reveal>} />
      <Stack />
      <Network />
      <Terminal />
      <Recognition />
      <Contact />
      <Footer />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={paletteItems} />
    </div>
  );
}
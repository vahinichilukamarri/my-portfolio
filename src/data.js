/* ══════════════════════════════════════════════════════════
   DATA — sourced from resume, edit freely
   ══════════════════════════════════════════════════════════ */
import linkedinPost1 from "./assets/offer_img.jpeg";
import linkedinPost2 from "./assets/askbi.png";
import linkedinPost3 from "./assets/PScertificate.png";

export const LINKS = {
  github: "https://github.com/vahinichilukamarri",
  linkedin: "https://www.linkedin.com/in/venkata-vahini-chilukamarri-2b5064314/",
  portfolio: "https://vahini-dev.vercel.app/",
  email: "vahinivenkatac@gmail.com",
  phone: "+91 8790261823",
  resume: "https://drive.google.com/file/d/1hvl7eQHsGslxknRLoo8KhHc6KwRSmLvY/view?usp=sharing",
};

export const NAV = [
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

export const TICKER = [
  "whoami → venkata vahini chilukamarri",
  "role → software engineer, ai engineer",
  "status → open to internships",
  "cgpa → 9.12 / 10.0 · kmit",
  "research → agentshield ai — accepted, to appear jan 2027",
  "building → morph, an agent that ships its own test suites",
  "shipped → trace, ledgerguard — deployed, benchmarked, documented",
];

export const HIGHLIGHTS = [
  { n: 9.12, dec: 2, suffix: "", label: "CGPA at KMIT", sub: "B.Tech CSE · 2023 – 2027" },
  { n: 42, dec: 0, prefix: "+", suffix: "%", label: "More revenue recovered", sub: "TRACE vs. rules baseline, 300 cases" },
  { n: 1, dec: 0, suffix: "", label: "Accepted research paper", sub: "AgentShield AI · to appear Jan 2027" },
  { n: 9, dec: 0, suffix: "", label: "Shipped builds", sub: "Agents, ledgers, evals, vision" },
];

export const EXPERIENCE = {
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

export const PUBLICATION = {
  title: "AgentShield AI",
  kind: "Research Paper · Co-author",
  status: "Accepted — to appear Jan 2027",
  gh: null, // add the repository / paper URL here when it's public
  points: [
    "Extends LLM-based IaC vulnerability remediation from AWS-only to Azure and GCP across Terraform, Kubernetes, and Helm, using an 8-agent LangGraph pipeline over Checkov, tfsec, and KICS scans with RAG retrieval.",
    "Patches are validated in a LocalStack sandbox; Claude/GPT-4o ensemble voting routes low-confidence fixes to human review.",
  ],
  stack: ["Python", "LangGraph", "RAG", "FastAPI", "Checkov", "tfsec", "KICS", "LocalStack"],
};

export const EDUCATION = [
  { school: "Keshav Memorial Institute of Technology", degree: "B.Tech in Computer Science & Engineering", score: "CGPA 9.12", when: "2023 – 2027", where: "Hyderabad, India" },
  { school: "Narayana Junior College", degree: "Intermediate — MPC", score: "97.0% · Top 3% of statewide cohort", when: "2021 – 2023", where: "Hyderabad, India" },
];

export const PROJECTS = [
  {
    no: "01", title: "MORPH", sub: "Autonomous AI integration engineer · agent-written code, verified not trusted",
    accent: "violet", featured: true, isNew: true, year: "2026",
    metric: { n: "≤3", l: "bounded repairs, then a human" },
    desc: "Given two independently built systems' API contracts, MORPH discovers their schemas, proposes how the data maps, writes the integration — and pairs every generated module with a generated test suite, run inside a locked-down sandbox.",
    points: [
      "Discovers third-party API schemas, semantically maps them to a target, and writes the integration code",
      "Every generated module ships with a generated test suite, so AI-written code is verified rather than trusted",
      "The model only proposes — deterministic code validates, gates, and executes; failures feed a bounded LangGraph repair loop that ends READY or HUMAN_REVIEW_REQUIRED",
      "Runs on free infrastructure: Groq-hosted models with automatic fallback to local Ollama, state persisted in PostgreSQL",
    ],
    stack: ["Python", "FastAPI", "LangGraph", "PostgreSQL", "pgvector", "Docker", "Groq", "Ollama"],
    gh: "https://github.com/vahinichilukamarri/MORPH-Autonomous-AI-Integration-Engineer",
  },
  {
    no: "02", title: "TRACE", sub: "Transaction recovery agent with contextual evaluation · Razorpay AI Buildathon",
    accent: "rose", featured: true, year: "2026",
    metric: { n: "+42%", l: "more revenue than a rules baseline" },
    desc: "A failed payment isn't a lost customer. TRACE evaluates whether recovering it is worth the effort, picks the single best next action, executes it, adapts to the outcome, and knows when to stop — with a deterministic policy layer that can veto it before anything runs.",
    points: [
      "Benchmarked against a fixed-rules baseline on 300 synthetic failed transactions: 42% more revenue recovered at a 23% higher relative recovery rate on identical data",
      "Dual-engine design: a free deterministic heuristic scores every case; an LLM (Groq) is escalated to only when one of four uncertainty signals fires",
      "A 9-rule, 100% deterministic policy layer approves, blocks, or flags every recommendation before execution — LLM timeouts fall back to a safe flagged state",
      "98 cases correctly never pursued (vs. 43) at ₹873 recovered per intervention (vs. ₹766)",
    ],
    stack: ["React", "FastAPI", "SQLAlchemy", "Groq LLM", "PostgreSQL", "Vercel", "Render"],
    gh: "https://github.com/vahinichilukamarri/TRACE",
    live: "https://trace-xi-nine.vercel.app",
  },
  {
    no: "03", title: "LedgerGuard", sub: "Payment integrity platform · deterministic ledger guarantees",
    accent: "emerald", featured: true, year: "2026",
    metric: { n: "38 / 15", l: "property tests / fault injections" },
    desc: "A payment-integrity platform built in 14 locked, tagged phases — enforcing that debits equal credits for every transaction before it's ever persisted, then independently verifying, stress-testing, and explaining anything that looks wrong.",
    points: [
      "Double-entry invariant validated per currency inside the same transaction boundary as the write — no half-committed unbalanced state is ever visible",
      "Idempotency keys with byte-identical replay under concurrent duplicates; events published to Kafka via a transactional outbox",
      "38 property-based tests (jqwik) plus 15 deterministic fault injections at the JDBC, broker, and clock seams",
      "Isolation-Forest anomaly detection with grounded LLM explanations, scored by a precision/recall harness",
    ],
    stack: ["Java", "Spring Boot", "PostgreSQL", "Kafka", "Flyway", "jqwik", "React", "TypeScript"],
    gh: "https://github.com/vahinichilukamarri/LedgerGuard",
  },
  {
    no: "04", title: "AgentShield AI", sub: "Multi-agent LLMs for cloud infrastructure security · accepted paper",
    accent: "amber", isNew: true, year: "2026",
    desc: "Research co-authored on extending LLM-based infrastructure-as-code remediation beyond AWS — eight cooperating agents that read scanner findings, retrieve context, and propose patches that are sandbox-validated before anyone trusts them.",
    points: PUBLICATION.points,
    stack: PUBLICATION.stack,
    gh: PUBLICATION.gh,
  },
  {
    no: "05", title: "Microservice Health Orchestrator", sub: "Observability platform · root-cause & blast-radius analysis",
    accent: "violet", year: "2026",
    desc: "The applied output of the Salesforce mentorship — a self-hosted platform that watches a microservice fleet, finds the root cause of an incident, and estimates blast radius before it spreads.",
    points: ["Dependency graph auto-discovered from OTel spans; cycles resolved with Tarjan's SCC", "Root-cause via topological root-finding + time-correlation ranking", "Cycle-safe BFS/DFS blast-radius detection feeding a live Cytoscape.js dashboard"],
    stack: ["React", "FastAPI", "OpenTelemetry", "SQLite"],
    gh: EXPERIENCE.gh,
  },
  {
    no: "06", title: "EvalEngine", sub: "LLM evaluation & improvement engine",
    accent: "cyan", year: "2025",
    desc: "A judge for other models. An LLM-as-a-judge pipeline that generates, scores, and ranks multiple AI responses through structured multi-metric analysis, mimicking RLHF-style iterative refinement.",
    points: ["LLM-as-judge scoring across relevance, correctness, completeness, and bias", "Feedback-driven refinement loop with an interactive Streamlit dashboard", "Currently extending with hallucination detection and RAG for factual grounding"],
    stack: ["Python", "Streamlit", "LLM APIs", "Pandas", "Scikit-learn"],
    gh: "https://github.com/vahinichilukamarri/llm-evaluation-engine.git",
  },
  {
    no: "07", title: "AskBI", sub: "Plain-English business intelligence",
    accent: "amber", year: "2025",
    desc: "Ask a structured dataset a question in plain English and get back SQL, a result set, and a chart — built so non-technical teams can query and visualize data directly.",
    points: ["Natural-language-to-SQL via an LLM-based query generation pipeline", "FastAPI + Pandas backend for execution against real datasets", "React dashboard for real-time result visualization"],
    stack: ["React", "FastAPI", "Pandas", "LLM APIs", "SQL"],
    gh: "https://github.com/vahinichilukamarri/AskBI",
  },
  {
    no: "08", title: "MoodAngels", sub: "AI-based psychiatric diagnostic support",
    accent: "violet", year: "2025",
    desc: "A multi-agent NLP system that analyzes behavioral and textual patient data to assist diagnostic reasoning, evaluated on a synthetic dataset of 500+ case records.",
    points: ["Multi-agent architecture splitting behavioral vs. textual signal analysis", "NLP pipeline for pattern extraction across patient case records", "Evaluated on 500+ synthetic diagnostic cases for reasoning consistency"],
    stack: ["Python", "NLP", "MERN Stack"],
    gh: "https://github.com/AnishaPaturi/Mood-Angles",
  },
  {
    no: "09", title: "SafeStreet", sub: "Vision-Transformer road damage detection",
    accent: "cyan", year: "2025",
    desc: "A Vision Transformer trained to classify road damage, served through a Node.js REST API with a React Native field app and a React.js geolocation dashboard for end-to-end reporting.",
    points: ["ViT model trained for multi-class road damage classification", "Node.js REST API serving predictions to mobile and web clients", "React Native capture app + React.js geolocation dashboard"],
    stack: ["Vision Transformer", "React Native", "React", "Node.js"],
    gh: LINKS.github,
  },
];

export const STACK = [
  { cat: "Languages", accent: "violet", items: ["Python", "Java", "JavaScript", "TypeScript", "SQL", "C / C++", "HTML / CSS"] },
  { cat: "AI & LLMs", accent: "amber", items: ["LLM Agents", "LangGraph", "LangChain", "AI-Assisted Test Generation", "LLM-as-a-Judge Evaluation", "RAG", "Prompt Engineering", "Vision Transformers", "Groq", "Ollama", "PyTorch", "TensorFlow", "Keras", "Hugging Face", "scikit-learn", "NLP", "Fine-tuning"] },
  { cat: "Testing & Automation", accent: "emerald", items: ["JUnit", "jqwik", "Testcontainers", "Property-Based Testing", "API & Integration Tests", "Fault Injection", "Chaos Engineering", "CI/CD"] },
  { cat: "Backend & Web", accent: "cyan", items: ["FastAPI", "Spring Boot", "Spring Data JPA", "Node.js", "Express.js", "React", "React Router", "React Native", "REST APIs", "Kafka", "MERN Stack", "Streamlit"] },
  { cat: "Data & Tools", accent: "rose", items: ["PostgreSQL", "MySQL", "MongoDB", "SQLite", "Docker", "OpenTelemetry", "Flyway", "Git / GitHub", "Jira", "Jupyter", "Pandas", "NumPy"] },
  { cat: "Core Concepts", accent: "violet", items: ["Object-Oriented Programming", "Data Structures & Algorithms", "Distributed Systems & Observability", "Idempotency", "SDLC"] },
];

// Real LinkedIn posts — tags pulled from each post's own hashtags, links go straight to the post.
export const LINKEDIN_POSTS = [
  { img: linkedinPost1, tags: ["Centific", "Hackathon", "ArtificialIntelligence"], url: "https://www.linkedin.com/posts/venkata-vahini-chilukamarri-2b5064314_centific-hackathon-artificialintelligence-activity-7458464588808863745-sTxB" },
  { img: linkedinPost2, tags: ["AI", "MachineLearning", "DataScience"], url: "https://www.linkedin.com/posts/venkata-vahini-chilukamarri-2b5064314_ai-machinelearning-datascience-activity-7448384011443433472-7ekJ" },
  { img: linkedinPost3, tags: ["ReactNative", "AI", "ComputerVision"], url: "https://www.linkedin.com/posts/venkata-vahini-chilukamarri-2b5064314_reactnative-ai-computervision-activity-7380108463823056896-DkQd" },
];

export const CERTS = [
  { t: "SQL (Intermediate)", o: "HackerRank" },
  { t: "Generative AI for Beginners", o: "GreatLearning" },
  { t: "Generative AI Workshop", o: "Skilligence Edtech × IIT Hyderabad" },
];

export const ACHIEVEMENTS = [
  { t: "Winner, Centific Hackathon 2.0", d: "Awarded an AI Engineer internship offer for an AI recruiter avatar platform built in 2 weeks", star: true },
  { t: "Co-author, AgentShield AI", d: "Multi-agent LLMs for cloud infrastructure security — accepted, to appear Jan 2027", star: true },
  { t: "DBMS Workshop Facilitator", d: "Led a peer technical workshop on database management systems at KMIT" },
  { t: "PRAKALP Hackathon", d: "Bluetooth Talking Vehicle prototype, team build" },
  { t: "GeeksforGeeks Hackathon", d: "End-to-end system design, working prototype" },
  { t: "Contributor, Rewriting the Code", d: "Nonprofit supporting women in tech — remote, since June 2026" },
  { t: "Graphic Designer Intern", d: "PR Team, Student Council, KMIT — 20+ assets, 2,000+ reach" },
  { t: "NSS Volunteer", d: "Coordinated 5+ service drives, 40+ volunteer hours since Aug 2023" },
  { t: "Top 3% Statewide, Intermediate", d: "97.0% in MPC, Narayana Junior College" },
];


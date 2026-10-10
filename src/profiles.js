/* Tailored views: share vahini-dev.vercel.app/?for=ai (or backend, fullstack,
   research) and the page leads with what that role cares about — hero line,
   role list, project order and highlighted skills. Nothing is hidden; only
   the emphasis changes. */

export const PROFILES = {
  ai: {
    key: "ai",
    label: "AI Engineering",
    roles: ["AI Engineer", "LLM Agents & Evals", "Software Engineer", "Research Co-author"],
    intro: "Final-year CSE at KMIT building LLM agents that are verified, not trusted — MORPH writes integrations and ships its own test suites, TRACE recovered 42% more revenue than a rules baseline, and AgentShield AI is an accepted paper on multi-agent cloud security.",
    order: ["MORPH", "TRACE", "AgentShield AI", "EvalEngine", "AskBI", "LedgerGuard", "MoodAngels", "SafeStreet", "Microservice Health Orchestrator"],
    stack: ["AI & LLMs", "Languages", "Backend & Web", "Testing & Automation", "Data & Tools", "Core Concepts"],
    highlight: ["LLM Agents", "MCP (Model Context Protocol)", "LangGraph", "LangChain", "RAG", "LLM-as-a-Judge Evaluation", "AI-Assisted Test Generation", "Prompt Engineering", "Groq", "Ollama", "PyTorch", "Python", "FastAPI"],
  },
  backend: {
    key: "backend",
    label: "Backend & Distributed Systems",
    roles: ["Software Engineer", "Backend & Distributed Systems", "Testing & Reliability", "AI Engineer"],
    intro: "Final-year CSE at KMIT building backend systems that are verified, not trusted — a Java double-entry ledger with idempotent writes and a Kafka outbox, proven by property-based tests and fault injection, and a Salesforce-mentored service-health orchestrator built on OpenTelemetry.",
    order: ["LedgerGuard", "Microservice Health Orchestrator", "TRACE", "MORPH", "AskBI", "EvalEngine", "AgentShield AI", "SafeStreet", "MoodAngels"],
    stack: ["Backend & Web", "Testing & Automation", "Data & Tools", "Languages", "Core Concepts", "AI & LLMs"],
    highlight: ["Java", "Spring Boot", "Spring Data JPA", "Kafka", "PostgreSQL", "Docker", "OpenTelemetry", "JUnit", "jqwik", "Testcontainers", "Property-Based Testing", "Fault Injection", "Idempotency", "Distributed Systems & Observability", "REST APIs", "FastAPI"],
  },
  fullstack: {
    key: "fullstack",
    label: "Full-Stack Engineering",
    roles: ["Full-Stack Engineer", "Software Engineer", "AI Engineer", "Research Co-author"],
    intro: "Final-year CSE at KMIT shipping full-stack products that are verified, not trusted — TRACE is a live React + FastAPI payment-recovery agent, AskBI turns plain English into SQL and charts, and LedgerGuard pairs a Spring Boot ledger with a React/TypeScript console.",
    order: ["TRACE", "AskBI", "MORPH", "LedgerGuard", "SafeStreet", "Microservice Health Orchestrator", "EvalEngine", "MoodAngels", "AgentShield AI"],
    stack: ["Backend & Web", "Languages", "Data & Tools", "Testing & Automation", "AI & LLMs", "Core Concepts"],
    highlight: ["React", "TypeScript", "JavaScript", "Node.js", "Express.js", "FastAPI", "Spring Boot", "REST APIs", "React Native", "PostgreSQL", "MongoDB", "Docker"],
  },
  research: {
    key: "research",
    label: "Research",
    roles: ["Research Co-author", "AI Engineer", "LLM Agents & Evals", "Software Engineer"],
    intro: "Final-year CSE at KMIT and co-author of AgentShield AI, an accepted paper on multi-agent LLMs for cloud infrastructure security — with agent systems that are verified, not trusted, and evaluations that report negative results as results.",
    order: ["AgentShield AI", "MORPH", "EvalEngine", "TRACE", "MoodAngels", "SafeStreet", "LedgerGuard", "AskBI", "Microservice Health Orchestrator"],
    stack: ["AI & LLMs", "Languages", "Testing & Automation", "Core Concepts", "Backend & Web", "Data & Tools"],
    highlight: ["LLM Agents", "MCP (Model Context Protocol)", "LangGraph", "RAG", "LLM-as-a-Judge Evaluation", "PyTorch", "TensorFlow", "Vision Transformers", "NLP", "scikit-learn", "Hugging Face", "Python"],
  },
};

const ALIASES = { ml: "ai", llm: "ai", agents: "ai", swe: "backend", sde: "backend", systems: "backend", web: "fullstack", frontend: "fullstack", "full-stack": "fullstack" };

function readProfile() {
  if (typeof window === "undefined") return null;
  const raw = (new URLSearchParams(window.location.search).get("for") || "").toLowerCase().trim();
  return PROFILES[ALIASES[raw] || raw] || null;
}

// The query string doesn't change without a reload, so read it once.
export const PROFILE = readProfile();

const rank = (list, key) => {
  const i = list.indexOf(key);
  return i === -1 ? list.length : i;
};

export const orderProjects = projects =>
  PROFILE ? [...projects].sort((a, b) => rank(PROFILE.order, a.title) - rank(PROFILE.order, b.title)) : projects;

export const orderStack = stack =>
  PROFILE ? [...stack].sort((a, b) => rank(PROFILE.stack, a.cat) - rank(PROFILE.stack, b.cat)) : stack;

export const isHighlighted = item => !!PROFILE && PROFILE.highlight.includes(item);

export const tailoredUrl = key => `https://vahini-dev.vercel.app/?for=${key}`;

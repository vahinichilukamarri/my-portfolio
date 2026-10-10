/* The "Ask my portfolio" knowledge base: every fact the assistant may use,
   as citable sources built from data.js. Shared by the /api/ask function
   (model grounding) and the browser (offline fallback + source chips). */
import { ACHIEVEMENTS, CERTS, EDUCATION, EXPERIENCE, LINKS, PROJECTS, PUBLICATION, STACK } from "./data.js";

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const SOURCES = [
  {
    id: "about",
    label: "About",
    section: "about",
    text: "Venkata Vahini Chilukamarri (goes by Vahini) is a final-year B.Tech Computer Science & Engineering student at Keshav Memorial Institute of Technology (KMIT), Hyderabad, India, with a CGPA of 9.12, graduating in 2027. She is open to Software Engineering and AI/ML internships. Her work focuses on LLM agents, testing and verification, and distributed systems — building AI systems that are verified, not trusted. She is a co-author of an accepted research paper (AgentShield AI) and contributes to Rewriting the Code, a nonprofit supporting women in tech.",
  },
  {
    id: "education",
    label: "Education",
    section: "about",
    text: EDUCATION.map(e => `${e.school} — ${e.degree}, ${e.score}, ${e.when}, ${e.where}.`).join(" "),
  },
  {
    id: "experience-salesforce",
    label: "Salesforce Mentorship",
    section: "experience",
    text: `${EXPERIENCE.org}, ${EXPERIENCE.when} (${EXPERIENCE.where}). Role: ${EXPERIENCE.role}. ${EXPERIENCE.points.join(" ")} Stack: ${EXPERIENCE.stack.join(", ")}.`,
  },
  {
    id: "publication-agentshield",
    label: "AgentShield AI paper",
    section: "experience",
    text: `${PUBLICATION.title} — ${PUBLICATION.kind}. Status: ${PUBLICATION.status}. ${PUBLICATION.points.join(" ")} Stack: ${PUBLICATION.stack.join(", ")}.`,
  },
  ...PROJECTS.filter(p => p.title !== PUBLICATION.title).map(p => ({
    id: `project-${slug(p.title)}`,
    label: p.title,
    section: "work",
    text: [
      `${p.title} (${p.year}) — ${p.sub}.`,
      p.desc,
      p.points.join(" "),
      `Stack: ${p.stack.join(", ")}.`,
      p.live ? `It is deployed and live at ${p.live}.` : "",
      p.gh ? `Source code: ${p.gh}.` : "Source code is not public yet.",
    ].filter(Boolean).join(" "),
  })),
  {
    id: "skills",
    label: "Tech stack",
    section: "stack",
    text: STACK.map(s => `${s.cat}: ${s.items.join(", ")}.`).join(" "),
  },
  {
    id: "recognition",
    label: "Recognition",
    section: "recognition",
    text: ACHIEVEMENTS.map(a => `${a.t} — ${a.d}${a.when ? ` (${a.when})` : ""}.`).join(" "),
  },
  {
    id: "certifications",
    label: "Certifications",
    section: "recognition",
    text: CERTS.map(c => `${c.t} from ${c.o}.`).join(" "),
  },
  {
    id: "contact",
    label: "Contact",
    section: "contact",
    text: `Email: ${LINKS.email}. LinkedIn: ${LINKS.linkedin}. GitHub: ${LINKS.github}. Resume: ${LINKS.resume}. She is currently looking for Software Engineering or AI/ML internship opportunities.`,
  },
];

export const SOURCE_BY_ID = Object.fromEntries(SOURCES.map(s => [s.id, s]));

/* Keyword retrieval — used when the model is unreachable, so the visitor
   still gets the relevant parts of the page instead of an error. */
const STOP = new Set("a an the is are was were be been of to in on for and or with what which who whom how does do did has have had her she vahini about tell me any can could you your this that it its as at by from worked work used use using".split(" "));
const words = s => s.toLowerCase().match(/[a-z0-9+#.]+/g)?.filter(w => w.length > 1 && !STOP.has(w)) ?? [];
const TOKENS = SOURCES.map(s => new Set(words(`${s.label} ${s.text}`)));
const LABELS = SOURCES.map(s => new Set(words(s.label)));
// whole-word match, plus prefix match for longer words ("test" ~ "tests", "testing")
const has = (set, w) => set.has(w) || (w.length >= 4 && [...set].some(t => t.startsWith(w)));

export function retrieve(question, k = 3) {
  const q = [...new Set(words(question))];
  if (!q.length) return [];
  // rare terms ("kafka") outweigh common ones ("systems")
  const idf = Object.fromEntries(q.map(w => [w, Math.log((SOURCES.length + 1) / (TOKENS.filter(t => has(t, w)).length + 0.5))]));
  return SOURCES
    .map((s, i) => ({ s, score: q.reduce((n, w) => n + (has(TOKENS[i], w) ? idf[w] * (has(LABELS[i], w) ? 3 : 1) : 0), 0) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(x => x.s);
}

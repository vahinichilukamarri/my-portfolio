import { retrieve } from "./knowledge";
import { LINKS } from "./data";

/* Browser side of "Ask my portfolio", shared by the floating assistant and the
   Interrogation section. Calls /api/ask; if the model is unreachable it falls
   back to plain keyword retrieval over the same sources. */
export async function ask(question) {
  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.answer) return { kind: "answer", ...data };
    if (res.status === 429) return { kind: "error", answer: data.error || "Too many questions right now — try again in a minute.", sources: [] };
  } catch { /* network failure — fall through to retrieval */ }

  // Model unreachable: show the most relevant parts of the page instead.
  const hits = retrieve(question);
  return hits.length
    ? { kind: "fallback", answer: "The AI model isn't reachable right now, so here are the parts of the portfolio that best match your question.", sources: hits.map(h => ({ id: h.id, label: h.label, section: h.section })) }
    : { kind: "fallback", answer: `The AI model isn't reachable right now and nothing on the page matched that. You can email Vahini directly at ${LINKS.email}.`, sources: [] };
}

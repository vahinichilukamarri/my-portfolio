/* Vercel serverless function: POST /api/ask { question } → { answer, sources, grounded }.
   Needs GROQ_API_KEY in the Vercel project's environment variables
   (optionally GROQ_MODEL). */
import { AskError, DEFAULT_MODEL, answerQuestion } from "../src/ask-core.js";

// Best-effort per-instance rate limit: 8 questions per minute per IP.
const WINDOW_MS = 60_000, MAX_HITS = 8;
const hits = new Map();

function limited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_HITS;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon";
  if (limited(ip)) return res.status(429).json({ error: "Too many questions right now — try again in a minute." });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const out = await answerQuestion(body.question, {
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || DEFAULT_MODEL,
    });
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(out);
  } catch (e) {
    const status = e instanceof AskError ? e.status : 500;
    return res.status(status).json({ error: e instanceof AskError ? e.message : "Something went wrong." });
  }
}

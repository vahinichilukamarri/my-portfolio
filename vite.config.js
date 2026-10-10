import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/* Serves POST /api/ask during `npm run dev` with the same core as the Vercel
   function, reading GROQ_API_KEY / GROQ_MODEL from .env.local. */
function askApiDev(env) {
  return {
    name: "ask-api-dev",
    configureServer(server) {
      server.middlewares.use("/api/ask", async (req, res) => {
        const send = (status, body) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(body));
        };
        if (req.method !== "POST") return send(405, { error: "Method not allowed" });
        let raw = "";
        for await (const chunk of req) raw += chunk;
        try {
          const { answerQuestion, AskError, DEFAULT_MODEL } = await server.ssrLoadModule("/src/ask-core.js");
          try {
            const { question } = JSON.parse(raw || "{}");
            send(200, await answerQuestion(question, { apiKey: env.GROQ_API_KEY, model: env.GROQ_MODEL || DEFAULT_MODEL }));
          } catch (e) {
            send(e instanceof AskError ? e.status : 500, { error: e instanceof AskError ? e.message : "Something went wrong." });
          }
        } catch {
          send(500, { error: "Something went wrong." });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss(), askApiDev(env)],
  };
});

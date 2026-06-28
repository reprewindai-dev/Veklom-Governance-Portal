import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Setup Gemini client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API endpoint to generate Agent Operational Profiles using Gemini 3.5 Flash
  app.post("/api/gemini/generate-profile", async (req, res) => {
    try {
      const { name, category, framework, ownerId } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Agent name is required" });
      }

      const prompt = `You are an expert AI Governance Compliance Auditor.
Generate a professional, serious, and highly technical "Agent Operational Profile" for an autonomous AI agent in a unified governance registry.
The agent details are:
- Name: ${name}
- Category/Security Ring: ${category}
- Core Framework: ${framework}
- Owner ID/Unit: ${ownerId || "owner-unknown"}

Please output your response as a valid JSON object matching this structure EXACTLY:
{
  "bio": "A concise, professional 2-3 sentence overview bio of this agent's primary operational role, purpose, and authorized domain of action in the system.",
  "technicalSummary": "A concise, highly professional technical summary (3-4 sentences) detailing its deployment architecture, capabilities limit compliance, risk classification, and standard communication patterns."
}
Make the tone extremely professional, security-focused, and corporate. Avoid generic platitudes; make it sound like a highly specific enterprise compliance record. Ensure it does not expose or mention any API keys or secrets. Only return valid raw JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const responseText = response.text || "";
      let profile;
      try {
        profile = JSON.parse(responseText.trim());
      } catch (parseErr) {
        // Fallback parse if there's markdown code block backticks
        const cleanJson = responseText.replace(/```json|```/g, "").trim();
        profile = JSON.parse(cleanJson);
      }

      res.json(profile);
    } catch (err: any) {
      console.error("Gemini API error:", err);
      res.status(500).json({ error: err.message || "Failed to generate agent operational profile." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

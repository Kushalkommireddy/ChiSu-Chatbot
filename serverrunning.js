// --------------------------
// SportsBot Backend with Google Gemini (Vertex AI)
// --------------------------

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { VertexAI } from "@google-cloud/vertexai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// --------------------------
// Setup Vertex AI Gemini Client
// --------------------------
const vertex_ai = new VertexAI({
  project: "chatbot-475817", // 👈 Replace this with your Google Cloud project ID
  location: "asia-south1", // or "asia-south1" if you’re in India
  keyFilename: path.join(__dirname, "vertex-key.json"), // 👈 Make sure this file exists
});

const model = "gemini-1.5-flash"; // You can switch to "gemini-1.5-pro" for better responses

// --------------------------
// API Route for Chat
// --------------------------
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const generativeModel = vertex_ai.getGenerativeModel({ model });

    const response = await generativeModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are SportyBot, a friendly sports expert.
              Only answer sports-related questions.
              If asked anything else, reply: "Sorry, I can only discuss sports-related topics."

              User: ${userMessage}`,
            },
          ],
        },
      ],
    });

    const botReply =
      response.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn’t generate a reply.";

    res.json({ reply: botReply });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ reply: "Error connecting to Gemini API." });
  }
});

// --------------------------
// Start Server
// --------------------------
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

// 1. Load Environment Variables (API Key)
dotenv.config();

const app = express();
// Use the environment variable PORT provided by hosting platforms (like Vercel), 
// or default to 3000 for local testing.
const port = process.env.PORT || 3000; 

// --- Configuration ---
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("Error: GEMINI_API_KEY is not set in environment variables.");
    process.exit(1);
}

// Initialize the Gemini SDK with the secure API key
const ai = new GoogleGenAI({ apiKey: apiKey });
const model = "gemini-2.5-flash-preview-09-2025";


// 2. Configure Middleware
app.use(bodyParser.json());

// Serve static files (index.html, CSS, JS) from the current directory
app.use(express.static(__dirname));

// CORS Configuration 
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


// 3. FIX: Route to serve index.html for the root path (/)
// This is the line that fixes the "Cannot GET /" error on Vercel.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 4. The Secure Chat Endpoint (/api/chat)
app.post('/api/chat', async (req, res) => {
    try {
        const { contents } = req.body;

        if (!contents || contents.length === 0) {
            return res.status(400).json({ error: "Missing conversation history." });
        }

        // Call the Gemini API via the proxy server using the GoogleGenAI library
        const response = await ai.models.generateContent({
            model: model,
            contents: contents 
        });

        // Send the successful response data back to the frontend
        res.json(response);

    } catch (error) {
        console.error("Gemini API Error:", error.message);
        res.status(500).json({ error: "Failed to communicate with the AI model." });
    }
});

// 5. Start the Server
app.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(`✅ SERVER RUNNING: http://localhost:${port}`);
    console.log(`======================================================\n`);
});
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables (GEMINI_API_KEY) from .env file
dotenv.config();

const app = express();
// Use the Vercel-provided PORT environment variable, defaulting to 3000 for local testing
const port = process.env.PORT || 3000; 

// --- Configuration ---
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_ID = "gemini-2.5-flash-preview-09-2025";

if (!API_KEY) {
    // This check is important for debugging deployment issues
    console.error("Error: GEMINI_API_KEY is not set in environment variables.");
    process.exit(1);
}

// 2. Configure Middleware
app.use(bodyParser.json());
// Serve static files (like index.html) from the directory root
app.use(express.static(__dirname));

// CORS Configuration (Allows your frontend to talk to this server)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// 3. FIX: Route to serve index.html for the root path (/)
// This is what fixes the "Cannot GET /" error.
app.get('/', (req, res) => {
    // __dirname is the current directory where server.cjs is located
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 4. The Secure Chat Endpoint (/api/chat)
app.post('/api/chat', async (req, res) => {
    const { contents } = req.body;
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${API_KEY}`;

    if (!contents || contents.length === 0) {
        return res.status(400).json({ error: "Missing conversation history." });
    }

    try {
        // Use native global fetch for the REST API call (most stable for Vercel)
        const geminiResponse = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: contents })
        });

        const data = await geminiResponse.json();

        if (!geminiResponse.ok) {
            console.error("Gemini API Error:", data);
            // Return specific API error to aid debugging if needed
            return res.status(geminiResponse.status).json({ error: data.error?.message || "Error communicating with the Gemini API." });
        }

        // Send the successful response back to the frontend
        res.status(200).json(data);

    } catch (error) {
        // Catches network errors, connection errors, etc.
        console.error("Server Fetch Error (Possible Network/Auth issue):", error.message);
        res.status(500).json({ error: "Internal server error during API communication." });
    }
});

// 5. Start the Server
app.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(`✅ SERVER RUNNING: http://localhost:${port}`);
    console.log(`======================================================\n`);
});
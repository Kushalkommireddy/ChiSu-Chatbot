// 1. Load Environment Variables (Your Secret Key)
// Use the 'dotenv' package to load secrets from the .env file
require('dotenv').config();
const API_KEY = process.env.GEMINI_API_KEY;

// 2. Setup Server and Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // NOTE: node-fetch is needed for fetch() in older Node versions
const app = express();
const PORT = 3000;

// 3. Configure Middleware
// Allows the frontend to send JSON data
app.use(bodyParser.json()); 

// Serve the frontend files from the current directory
// The '__dirname' variable is available in CommonJS scope
app.use(express.static(__dirname)); 

// --- CORS Configuration (Essential for Local Testing) ---
app.use((req, res, next) => {
    // This allows the client (e.g., index.html) to talk to the server (localhost:3000)
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// 4. The Secure Chat Endpoint
app.post('/api/chat', async (req, res) => {
    // Retrieve the full conversation history sent from the frontend
    const { contents } = req.body; 

    // Validation
    if (!API_KEY) {
        return res.status(500).json({ error: "Server Error: API key is missing in the .env file. Please check." });
    }
    if (!contents || contents.length === 0) {
        return res.status(400).json({ error: "Missing conversation history in request body." });
    }

    // This is the direct call to the Gemini API, hidden from the client
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;
    
    try {
        const geminiResponse = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: contents })
        });

        // Forward the API response (or error) back to the client
        const data = await geminiResponse.json();

        if (!geminiResponse.ok) {
            console.error("Gemini API Error:", data);
            // Return specific Gemini error message if available
            return res.status(geminiResponse.status).json({ error: data.error?.message || "Error communicating with the Gemini API." });
        }

        // Send the successful response data back to the frontend
        res.status(200).json(data);

    } catch (error) {
        console.error("Server Fetch Error:", error.message);
        res.status(500).json({ error: "Internal server error during API communication." });
    }
});

// 5. Start the Server
app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`✅ SERVER RUNNING: http://localhost:${PORT}`);
    console.log(`   Frontend running on: http://localhost:${PORT}/index.html`);
    console.log(`   API Key is secured!`);
    console.log(`======================================================\n`);
});

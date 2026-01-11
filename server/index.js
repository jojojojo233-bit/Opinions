#!/usr/bin/env node
// Simple Express proxy to call Gemini/OpenAI-like API server-side.
// Usage: set GEMINI_API_KEY and GEMINI_API_URL (full URL to model endpoint), then `node server/index.js`

const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8787;

app.use(cors());
app.use(express.json());

app.post('/api/generate-context', async (req, res) => {
  try {
    const { question, category, options } = req.body || {};
    if (!question) return res.status(400).json({ error: 'question is required' });

    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = process.env.GEMINI_API_URL;
    if (!apiKey || !apiUrl) {
      return res.status(500).json({ error: 'GEMINI_API_KEY and GEMINI_API_URL must be set in environment' });
    }

    const prompt = `Write a concise 1-3 sentence neutral context paragraph that explains and gives quick background for this poll.\nQuestion: "${question}"\nCategory: "${category || 'general'}"\nOptions: ${Array.isArray(options) ? options.join(', ') : String(options)}`;

    // Basic POST to the configured Gemini/OpenAI-like endpoint. Adapt the payload to your provider.
    const fetch = global.fetch || require('node-fetch');

    const body = {
      // Replace or extend keys based on your API's expected shape
      model: process.env.GEMINI_MODEL || 'gemini-lite',
      prompt,
      max_tokens: 120,
      temperature: 0.6,
    };

    const r = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ error: txt });
    }

    const data = await r.json();

    // Try common response shapes
    const context = (data?.choices && data.choices[0]?.text) || data?.output_text || data?.result || data?.text || '';

    res.json({ context: String(context).trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

app.listen(port, () => {
  console.log(`AI proxy running on http://localhost:${port}`);
});

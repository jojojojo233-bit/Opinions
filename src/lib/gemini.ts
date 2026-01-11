/// <reference types="vite/client" />

export async function generatePollContext(title: string): Promise<string> {
  let apiKey = '';

  // 1. Try Vite (Static Replacement)
  try {
     // Vite replaces this string at build time. 
     // We access it directly to ensure the replacer works.
     apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  } catch (e) { 
    // This might fail in non-Vite environments (like tests), which is fine.
  }

  // 2. Fallback to process.env for Node/Tests
  if (!apiKey && typeof process !== 'undefined' && process.env) {
      apiKey = process.env.VITE_GEMINI_API_KEY || '';
  }

  if (!apiKey) {
    console.warn("Gemini Context: VITE_GEMINI_API_KEY is missing. Context generation disabled.");
    // Return a specific message so we know why it failed
    return "No context (API Key missing).";
  }

  const prompt = `Provide a brief context (max 2 sentences) regarding real world issues related to this poll question: "${title}". If you don't understand it or can't provide context, reply exactly with "No context."`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini API Failed (${response.status}):`, errText);
      return "No context (API Error).";
    }

    const data: any = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) return "No context.";

    return text.trim();
  } catch (error) {
    console.error("Gemini Generation Exception:", error);
    return "No context (Network Error).";
  }
}


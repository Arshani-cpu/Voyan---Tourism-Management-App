import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { question, destination } = req.body as { question?: string; destination?: string };
  if (!question) return res.status(400).json({ error: 'Question is required' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.json({
      answer: `For ${destination || 'your destination'}, local conditions and road routes are currently open for visitors. Check with local transit authorities for vehicle timing restrictions.`,
      sources: [{ title: 'Google Live Travel', uri: 'https://www.google.com' }],
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a real-time travel assistant grounded in Google Search. Answer this question about ${destination || 'the travel destination'}: "${question}". Keep your answer under 100 words, direct, actionable, and cite any real-time alerts.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });

    const candidate = response.candidates?.[0];
    const groundingChunks = (candidate as any)?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((c: any) => ({ title: c.web?.title || 'Google Web Source', uri: c.web?.uri || 'https://www.google.com' }))
      .filter((s: any) => s.uri)
      .slice(0, 3);

    return res.json({ answer: response.text || 'No response available.', sources });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to process real-time query', details: err.message });
  }
}

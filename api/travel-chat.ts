import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, destination, trip, history } = req.body as {
    message?: string;
    destination?: string;
    trip?: Record<string, unknown>;
    history?: Array<{ role: string; text: string }>;
  };

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'A message is required' });
  }
  if (message.length > 2000) {
    return res.status(400).json({ error: 'Messages must be 2,000 characters or fewer' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'Gemini is not configured. Add GEMINI_API_KEY to Vercel environment variables.',
      code: 'MISSING_API_KEY',
    });
  }

  const recentHistory = Array.isArray(history)
    ? history
        .filter((e) => (e?.role === 'user' || e?.role === 'assistant') && typeof e.text === 'string')
        .slice(-8)
    : [];

  const conversationContext = recentHistory
    .map((e) => `${e.role === 'assistant' ? 'Voyan' : 'Traveler'}: ${e.text.slice(0, 2000)}`)
    .join('\n');

  const tripContext =
    trip && typeof trip === 'object'
      ? {
          title: trip.title,
          destination: trip.destination,
          durationDays: trip.durationDays,
          budgetPerPerson: trip.budgetPerPerson,
          travellersCount: trip.travellersCount,
          days: trip.days,
        }
      : { destination };

  const prompt = `You are Voyan, a practical travel-planning assistant. Use Google Search for questions about current conditions, opening hours, advisories, prices, and local recommendations. Be clear when information is uncertain, keep answers concise, and never claim to have changed the itinerary. Use the itinerary context when relevant.\n\nCurrent trip context: ${JSON.stringify(tripContext)}\n\nRecent conversation:\n${conversationContext || '(This is the first message.)'}\n\nTraveler: ${message.trim()}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });

    const groundingChunks =
      (response.candidates?.[0] as any)?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((c: any) => ({ title: c.web?.title || 'Google Search result', uri: c.web?.uri }))
      .filter((s: any) => typeof s.uri === 'string')
      .slice(0, 4);

    return res.json({
      answer: response.text || 'I could not generate a response. Please try again.',
      sources,
    });
  } catch (err: any) {
    console.error('Travel assistant error:', err);
    const status = typeof err?.status === 'number' ? err.status : 500;

    if (status === 429) {
      return res.status(429).json({
        error: 'Gemini API quota exhausted. Check your Google AI Studio usage and billing.',
        code: 'AI_QUOTA_EXCEEDED',
      });
    }
    if (status === 401 || status === 403) {
      return res.status(502).json({
        error: 'Gemini rejected the API key. Check the GEMINI_API_KEY in Vercel environment variables.',
        code: 'AI_AUTH_ERROR',
      });
    }
    return res.status(500).json({ error: 'The travel assistant could not answer right now. Please try again.' });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, modelType = 'clip', destination } = req.body as {
    prompt?: string; modelType?: string; destination?: string;
  };

  if (!prompt) return res.status(400).json({ error: 'Prompt is required for music generation' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({
      error: 'GEMINI_API_KEY is not configured. Please add it to Vercel environment variables.',
      code: 'MISSING_API_KEY',
    });
  }

  const selectedModel = modelType === 'pro' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';

  try {
    const ai = new GoogleGenAI({ apiKey });
    const detailedPrompt = destination
      ? `${prompt}. Destination mood: ${destination}. High-fidelity travel soundscape.`
      : prompt;

    const responseStream = await ai.models.generateContentStream({
      model: selectedModel,
      contents: detailedPrompt,
    });

    let audioBase64 = '';
    let lyrics = '';
    let mimeType = 'audio/wav';

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if ((part as any).inlineData?.data) {
          if (!audioBase64 && (part as any).inlineData.mimeType) {
            mimeType = (part as any).inlineData.mimeType;
          }
          audioBase64 += (part as any).inlineData.data;
        }
        if ((part as any).text && !lyrics) lyrics = (part as any).text;
      }
    }

    if (!audioBase64) {
      return res.status(500).json({
        error: 'No audio returned by Lyria model. Check model permissions or prompt format.',
        code: 'EMPTY_AUDIO_RESPONSE',
      });
    }

    return res.json({
      audioBase64,
      mimeType,
      lyrics,
      model: selectedModel,
      duration: modelType === 'pro' ? 'Full-length track' : '30s clip',
    });
  } catch (err: any) {
    console.error('Error generating music with Lyria:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate music with Lyria model',
      code: err.status || 'LYRIA_API_ERROR',
      details: String(err),
    });
  }
}

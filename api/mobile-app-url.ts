import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = req.headers.host || '';
  return res.json({ url: `${proto}://${host}` });
}

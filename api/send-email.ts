import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, tripTitle, destination, shareUrl } = req.body as {
    to: string; tripTitle?: string; destination?: string; shareUrl?: string;
  };

  if (typeof to !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return res.status(400).json({ error: 'A valid email address is required' });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const mailFrom = process.env.MAIL_FROM;

  if (!smtpHost || !smtpUser || !smtpPass || !mailFrom) {
    return res.status(500).json({ error: 'SMTP is not configured', code: 'MISSING_SMTP_CONFIG' });
  }

  const escapeHtml = (value: unknown) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const safeTripTitle = String(tripTitle ?? 'Your trip').replace(/[\r\n]/g, ' ');

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: mailFrom,
      to,
      subject: `Your Voyan itinerary: ${safeTripTitle}`,
      text: `Your Voyan itinerary: ${safeTripTitle}\nDestination: ${destination ?? ''}\n\nView your itinerary: ${shareUrl ?? ''}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#292524">
        <h1 style="font-size:22px;color:#115e59">Your Voyan itinerary</h1>
        <h2 style="font-size:18px">${escapeHtml(tripTitle ?? 'Your trip')}</h2>
        <p style="color:#57534e">Destination: ${escapeHtml(destination ?? '')}</p>
        <p><a href="${escapeHtml(shareUrl ?? '')}" style="display:inline-block;padding:12px 18px;background:#115e59;color:#fff;text-decoration:none;border-radius:8px">View itinerary</a></p>
        <p style="font-size:12px;color:#78716c">${escapeHtml(shareUrl ?? '')}</p>
      </div>`,
    });

    return res.json({ ok: true });
  } catch (err: unknown) {
    console.error('Error sending itinerary email:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}

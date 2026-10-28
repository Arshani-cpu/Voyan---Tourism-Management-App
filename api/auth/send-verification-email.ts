import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

// Firebase Admin — loaded lazily to avoid cold-start issues
async function getAdminAuth(serviceAccountJson: string) {
  const { cert, getApps, initializeApp } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');

  const parsed = JSON.parse(serviceAccountJson) as {
    project_id: string; client_email: string; private_key: string;
  };

  const adminApp =
    getApps().find((a) => a.name === 'voyan-email-verification') ??
    initializeApp(
      {
        credential: cert({
          projectId: parsed.project_id,
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key.replace(/\\n/g, '\n'),
        }),
      },
      'voyan-email-verification'
    );

  return getAuth(adminApp);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authorization = req.headers.authorization as string | undefined;
  const idToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!idToken) return res.status(401).json({ error: 'A Firebase sign-in token is required' });

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const mailFrom = process.env.MAIL_FROM;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!smtpHost || !smtpUser || !smtpPass || !mailFrom) {
    return res.status(503).json({ error: 'SMTP is not configured' });
  }
  if (!serviceAccountJson) {
    return res.status(503).json({ error: 'Firebase Admin service account is not configured' });
  }

  try {
    const adminAuth = await getAdminAuth(serviceAccountJson);
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const user = await adminAuth.getUser(decodedToken.uid);

    if (!user.email) return res.status(400).json({ error: 'The signed-in account has no email address' });
    if (user.emailVerified) return res.json({ sent: false, verified: true });

    const verificationLink = await adminAuth.generateEmailVerificationLink(user.email);

    const escapeHtml = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: mailFrom,
      to: user.email,
      subject: 'Verify your Voyan email address',
      text: `Verify your email address to secure your Voyan account:\n\n${verificationLink}\n\nIf you did not sign in to Voyan, you can ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#292524">
        <h1 style="font-size:22px;color:#115e59">Verify your email</h1>
        <p>Confirm <strong>${escapeHtml(user.email)}</strong> to secure your Voyan account.</p>
        <p><a href="${escapeHtml(verificationLink)}" style="display:inline-block;padding:12px 18px;background:#115e59;color:#fff;text-decoration:none;border-radius:8px">Verify email address</a></p>
        <p style="font-size:12px;color:#78716c">If you did not sign in to Voyan, you can ignore this email.</p>
      </div>`,
    });

    return res.json({ sent: true, verified: false });
  } catch (error) {
    console.error('Error sending Firebase verification email:', error);
    return res.status(500).json({
      error: 'Could not send the verification email. Check Firebase Admin and SMTP configuration.',
    });
  }
}

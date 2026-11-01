# 🚀 Voyan Deployment Guide
## Frontend → Netlify | Backend → Render

---

## 📁 Files Created for Deployment

| File | Purpose |
|---|---|
| `netlify.toml` | Netlify build + SPA redirect config |
| `public/_redirects` | Fallback SPA redirect |
| `.env.production` | Frontend env — points to Render backend URL |
| `render.yaml` | Render backend service definition |
| `.gitignore` | Updated to allow `.env.production` |

---

## STEP 1 — Push to GitHub

Open terminal in your project folder:
```bash
git init
git add .
git commit -m "deploy: add Netlify + Render config"
```
Create a new repo on [github.com](https://github.com), then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/voyan-travel.git
git branch -M main
git push -u origin main
```

---

## STEP 2 — Deploy Backend on Render

### 2a. Create the service
1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo and fill in:

| Field | Value |
|---|---|
| **Name** | `voyan-backend` |
| **Root Directory** | `java-backend` |
| **Runtime** | `Java` |
| **Build Command** | `./mvnw package -DskipTests -q` |
| **Start Command** | `java -jar target/voyan-java-backend-0.1.0.jar` |
| **Region** | Singapore |
| **Plan** | Free |

### 2b. Environment Variables (in Render Dashboard → Environment tab)

| Key | Value |
|---|---|
| `PORT` | `10000` |
| `SQLITE_PATH` | `/opt/render/project/src/java-backend/.sqlite-data/voyan.sqlite` |
| `VOYAN_ALLOWED_ORIGINS` | `https://*.netlify.app,https://*.onrender.com` |

### 2c. Get your backend URL
After deploy (~5 min), your URL will be:
`https://voyan-backend.onrender.com`

Test: `https://voyan-backend.onrender.com/api/places/meta/states`

> ⚠️ Free tier sleeps after 15 min idle. First request after sleep takes ~30s.

---

## STEP 3 — Update Frontend with Render URL

Edit `.env.production`:
```env
VITE_JAVA_API_URL=https://voyan-backend.onrender.com
```
Commit and push:
```bash
git add .env.production
git commit -m "config: set Render backend URL"
git push
```

---

## STEP 4 — Deploy Frontend on Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**
2. Connect your GitHub repo and set:

| Field | Value |
|---|---|
| **Base directory** | *(leave blank)* |
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |

3. **Site settings → Environment variables → Add:**

| Key | Value |
|---|---|
| `VITE_JAVA_API_URL` | `https://voyan-backend.onrender.com` |

4. Click **Deploy site** (~3 min)
5. Your app: `https://YOUR-SITE.netlify.app`

---

## STEP 5 — Update CORS on Render

In Render Dashboard → Environment, update `VOYAN_ALLOWED_ORIGINS`:
```
https://your-site.netlify.app,https://*.netlify.app,https://*.onrender.com
```
Render will auto-redeploy.

---

## ✅ Deployment Checklist

- [ ] GitHub repo created and code pushed
- [ ] Render backend deployed — URL noted
- [ ] `.env.production` updated with Render URL and pushed
- [ ] Netlify site deployed
- [ ] `VITE_JAVA_API_URL` set in Netlify env vars
- [ ] `VOYAN_ALLOWED_ORIGINS` in Render includes Netlify URL
- [ ] App tested at Netlify URL

---

## 🔄 Keep Render Warm (Free Tier)

Use [UptimeRobot](https://uptimerobot.com) (free) to ping every 14 minutes:
- Monitor URL: `https://voyan-backend.onrender.com/api/places/meta/states`
- Interval: 14 minutes

---

## 📊 Architecture

```
User Browser
     │
     ▼
[Netlify CDN]  ← static React/Vite build
     │  VITE_JAVA_API_URL
     ▼
[Render Web Service]  ← Spring Boot JAR
     │
     ▼
[SQLite DB]  ← auto-seeded from bundled JSON on startup
   875 places · 50 malls · 111 entry passes
```

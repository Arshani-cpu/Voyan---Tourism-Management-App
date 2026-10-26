 <div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/097724d6-03a4-47bd-b508-2e637c61787c

## Run Locally

**Prerequisites:** Node.js 20+ and JDK 17+


1. Install dependencies:
   `npm install`
2. Set `GEMINI_API_KEY`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, and `VITE_FIREBASE_APP_ID` in the root `.env` using values from the same Firebase project. Set SMTP values and `FIREBASE_SERVICE_ACCOUNT_JSON` for mail features.
3. Start the Spring Boot API in one terminal:
   `npm run backend:dev` (the included Maven Wrapper downloads Maven if needed)
4. Start the frontend in another terminal:
   `npm run dev`

Enable the required sign-in providers in Firebase Authentication and add the local/deployed hostnames to its authorized domains. The Firebase Web API key is used in the browser; keep server-only keys (such as `GEMINI_API_KEY`) out of `VITE_` variables.

Unverified users are allowed to sign in, and the Spring Boot API emails them a Firebase-generated verification link through SMTP. Keep `FIREBASE_SERVICE_ACCOUNT_JSON` private and never add a `VITE_` prefix. Verification emails are limited to one per account per minute. The Vite development server listens on `http://localhost:3000` and proxies `/api/**` to Spring Boot at `http://localhost:8081`.

## Spring Boot Backend

The Spring Boot service owns the application's API, Firebase token checks, SMTP email, Gemini integrations, SOS live-location sessions, and authenticated trip data/file storage. It stores records in `.sqlite-data/voyan.sqlite` and uploaded files in `.file-data/`.

The Destinations directory also includes the place data supplied in `D:\java project json files` (district JSON datasets inside ZIP files, the India places spreadsheets, and the place/hill-station CSV files). The normalized, deployable copy is `public/data/places-directory.json`, so the website does not need access to the D: drive after deployment. It currently contains 1,484 place entries across 20 states and union territories, including 106 Tamil Nadu entries. These are reference suggestions from the supplied files, not live opening hours, availability, or verified ratings; the Map links open Google Maps searches for current details.

```sh
npm run backend:dev
```

### Deploy the frontend to Vercel

Vercel serves the Vite frontend as a static site; it does not run this Spring Boot service from this project configuration. Deploy the Java backend separately to a Java-capable host with persistent storage, and configure the Vercel project:

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variable:** `VITE_JAVA_API_URL=https://your-public-spring-api.example.com` (the public origin only, no trailing slash)
- **Environment variable:** `VITE_GOOGLE_MAPS_API_KEY` set to a browser key restricted to your deployed domains

Set these in Vercel for Production and Preview as appropriate, then redeploy because `VITE_` variables are embedded at build time. `vercel.json` provides the SPA fallback for direct navigation and shared `/sos/live/...` links.

The PWA install experience requires the deployed HTTPS origin. On Android, open the site in a supported browser (for example, Chrome) and choose **Install app** or **Add to Home screen**. On iPhone/iPad, open it in Safari, tap **Share**, then **Add to Home Screen**. App icons and a service worker are included; browser installation availability is determined by the device/browser.

On the backend host, configure `VOYAN_ALLOWED_ORIGINS` to include your exact Vercel production origin and any trusted preview origins, and set `PUBLIC_APP_URL` to the production Vercel URL so shared links point to the frontend. Configure `GEMINI_API_KEY`, SMTP values, Firebase settings, and persistent SQLite/file storage on that backend host; do not put server secrets in Vercel `VITE_` variables. Ephemeral server disks can lose the SQLite database and uploaded files, so use persistent storage or managed databases/object storage for production.

For a native Capacitor build or a separately hosted frontend, set `VITE_JAVA_API_URL` to the public Spring API URL before building. Configure `VOYAN_ALLOWED_ORIGINS` to the exact frontend origin patterns in production and `PUBLIC_BASE_URL` to the public frontend URL for shareable links. Do not expose server credentials in `VITE_` variables.

Authenticated data endpoints require a signed-in Firebase user and scope JSON records and uploaded files to that user. The frontend helper is `src/lib/sqliteStore.ts`.

# Nilesh Studio — Fine Art & Luxury Photoshoot Platform

A dual-platform photography booking and business management architecture:
1. **Customer Mobile Application (Android APK / PWA):** Exclusively for clients to browse fine art categories, view authentic galleries, select live slots, make advance UPI payments with instant 20% discount, and track booking statuses.
2. **Studio Owner Business Portal (`/business`):** Dedicated, secure web dashboard for the studio owner to manage bookings, verify UPI payments, lock/unlock daily schedule slots, and manage portfolio galleries in real time.
3. **Shared Cloud Backend & Database:** Node.js Express API, SQLite database, and Supabase Cloud Storage synchronizing both platforms.

---

## 📸 Photography Portfolio Categories

* **Indoor Studio:** Controlled lighting & luxury backdrops
  * 🎈 Birthday Shoots
  * 🤰 Maternity Photography
  * 🪔 Festive Photography
  * 👶 Newborn & Infant Photography
* **Outdoor Shoots:** Golden hour & natural landscapes
  * 🎈 Birthday Shoots
  * 🤰 Maternity Photography
  * 🪔 Festive Photography
  * 👶 Newborn & Infant Photography
* **Wedding Photography:** Grand royal ceremonies & candid moments
* **Pre-Wedding Shoots:** Cinematic destination sessions

---

## 🛠 Project Structure

```text
NileshStudio_App/
├── .github/workflows/        # Automated CI/CD GitHub Actions for APK builds
│   └── build_android.yml
├── android/                  # Native Android project (Capacitor 8)
├── business-portal/          # Standalone Studio Owner Website (/business)
│   └── index.html
├── data/                     # SQLite database & automated schema migrations
│   └── nilesh_studio.sqlite
├── public/                   # Static media, logo, and PWA manifest
├── server/                   # Express REST API & Supabase Cloud Storage
│   ├── index.js              # REST endpoints & security middleware
│   ├── db.js                 # SQLite data layer
│   └── storage.js            # Supabase Cloud Storage integration
├── src/                      # Customer React / Vite / TypeScript App
│   ├── api.ts                # API client with fallback & offline support
│   ├── data/                 # Bundled fallback catalog
│   ├── components/           # UI components
│   └── App.tsx
├── render.yaml               # Cloud deployment configuration for Render
└── package.json
```

---

## 🚀 Cloud Photo Storage (Supabase)

To enable cloud photo storage for portfolio galleries:
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Create a public storage bucket named: `nilesh-studio-photos`.
3. Set the following environment variables in `.env` (or cloud host):
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
4. The studio owner can upload, replace, and delete photos directly through the Business Portal without recompiling the mobile app.

---

## 🤖 Automated APK Generation (GitHub Actions)

When code is committed and pushed to GitHub:
1. The GitHub Action in `.github/workflows/build_android.yml` automatically triggers.
2. It sets up Node.js 20, Java 21 LTS, and the Android SDK.
3. It compiles the Android APK and publishes it as a downloadable artifact (`nilesh-studio-apk`) under the Actions run summary.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start API server & Business Portal
npm start
# -> Customer App: http://localhost:5000
# -> Business Portal: http://localhost:5000/business
```

### Studio Owner Default Credentials:
* **Username:** `admin`
* **Password:** `nilesh@2026`

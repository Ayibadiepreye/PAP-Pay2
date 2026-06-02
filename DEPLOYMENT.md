# Deployment Guide

## Prerequisites
- Node.js 20+
- pnpm
- Neon Database URL
- Cloud storage account (optional, for persistent uploads: Cloudinary, S3, etc.)

---

## Option 1: Full Stack Deployment on Railway (Easiest!)

This deploys both the frontend and backend as a single Express server on Railway!

### Step 1: Set Up Railway
1. Create a Railway account (https://railway.app)
2. Install the Railway CLI (optional but recommended)
3. Connect your GitHub repo to Railway

### Step 2: Add Environment Variables in Railway
In your Railway service's "Variables" section:
- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `NODE_ENV`: production
- No need to set API_PORT/PORT — Railway will handle it automatically!

### Step 3: Deploy!
Railway will auto-detect `railway.toml` and deploy!

---

## Railway Troubleshooting

If your build fails:
- Make sure you're pushing all necessary files to GitHub!
- The `railway.toml` we created will handle installing pnpm, dependencies, and building!
- Check the Railway deployment logs for specific errors!

---

## What the Build Does on Railway
1. **Setup**: Install pnpm
2. **Install**: Run `pnpm install --no-frozen-lockfile`
3. **Build**: Run `pnpm build` (this builds all packages, including frontend and backend)
4. **Start**: Runs `cd artifacts/api-server && node dist/index.mjs`

---

## Option 2: Full Stack Deployment (Render / Fly.io)

This deploys both the frontend and backend as a single Express server.

### Step 1: Prepare Environment Variables
Set the following environment variables on your hosting platform:
- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `API_PORT`: 3000 (or your chosen port)

### Step 2: Build Command
```bash
pnpm build
```

### Step 3: Start Command
```bash
cd artifacts/api-server && node dist/index.mjs
```

---

## Option 3: Split Deployment (Frontend on Netlify, Backend on Render/Railway)

### Frontend (Netlify)
1. Connect your GitHub repo to Netlify
2. Set build command to `pnpm build`
3. Set publish directory to `artifacts/pap-pay/dist/public`
4. Add a redirect rule in `netlify.toml` (already created):
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```
5. **Important**: If using split deployment, update `lib/api-client-react/src/custom-fetch.ts` to use your backend's URL (e.g., `https://your-backend.up.railway.app`) instead of relative paths!

### Backend (Render or Railway)
1. Create a new "Web Service" on your platform
2. Connect your repo
3. Set build command to `pnpm build`
4. Set start command to `cd artifacts/api-server && node dist/index.mjs`
5. Add the `DATABASE_URL` environment variable

---

## What You Asked About File Uploads
Okay, to answer your question:
Yes! Currently, when a user uploads their payment proof:
1. The app collects the image from their device (camera or gallery/files)
2. It stores that image **temporarily on the backend server's local disk** (in the `uploads/` folder)
3. Then it saves the `/api/uploads/filename` URL in the database

**Why this is bad for production on Railway/Render/etc.**:
- Cloud hosting platforms like Railway have ephemeral storage — if you re-deploy, restart the server, or scale to multiple instances, **all uploaded photos get DELETED!**
- That's why we strongly recommend replacing local storage with a cloud service like Cloudinary or AWS S3!

---

## Production Considerations
1. **File Uploads**: Currently, the app uses local file storage. For production, replace this with a cloud storage service like Cloudinary or AWS S3!
2. **Security**: Add proper CORS configuration, authentication for admin routes, and use HTTPS!
3. **Database**: Ensure your Neon DB allows connections from your hosting platform's IP addresses!

---

## Database Setup
To seed the database with attendees:
```bash
cd lib/db
pnpm seed
```

To push schema changes:
```bash
cd lib/db
pnpm push
```

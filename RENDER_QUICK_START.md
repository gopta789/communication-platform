# Render Deployment - Quick Start (5 Steps)

## Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Video platform ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/video-platform.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username and create the repo at https://github.com/new first.

## Step 2: Deploy Backend
1. Go to https://render.com → Sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Select your **video-platform** repo
4. Fill in:
   - **Name:** `video-platform-backend`
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Click **"Create Web Service"**
6. Wait 2-3 minutes for deployment
7. **Copy your backend URL** (looks like: `https://video-platform-backend.onrender.com`)

## Step 3: Get Backend URL
After backend deploys, go to its dashboard and note the URL.

Your backend is at: `https://your-service-name.onrender.com`

## Step 4: Deploy Frontend
1. Back in Render → Click **"New +"** → **"Static Site"**
2. Select same **video-platform** repo
3. Fill in:
   - **Name:** `video-platform-frontend`
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
4. Add **Environment Variables:**
   - `REACT_APP_SERVER_URL` = `https://your-service-name.onrender.com` (from step 3)
5. Click **"Create Static Site"**
6. Wait 3-5 minutes
7. **Copy your frontend URL** (looks like: `https://video-platform-frontend.onrender.com`)

## Step 5: Update Backend CORS & Redeploy
1. Edit `server/index.js` line 13-19:
```javascript
const allowedOrigins = [
  'https://video-platform-frontend.onrender.com', // Your frontend URL from step 4
  'http://localhost:3000' // Keep for local dev
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

2. Commit and push:
```bash
git add server/index.js
git commit -m "Update CORS for production"
git push
```

3. Render auto-deploys! (Wait 2-3 minutes)

## Done! 🎉
- **Frontend:** https://your-service-name.onrender.com (static site URL)
- **Backend:** https://video-platform-backend.onrender.com

Test it by opening frontend URL in two browsers/devices with same room ID!

---

## Troubleshooting

### "Room not found" error
- Check backend logs: Render Dashboard → Backend Service → Logs
- Verify CORS allowedOrigins matches your frontend URL exactly

### Video not connecting
- Check browser console (F12 → Console)
- Backend must be running (check Render dashboard status)
- CORS might be blocking requests

### Frontend shows blank page
- Check if `REACT_APP_SERVER_URL` is set in Render environment variables
- Run frontend build locally: `cd client && npm run build`
- Check browser network tab (F12 → Network)

---

## Want to add a custom domain?
1. Buy domain from Namecheap/GoDaddy (~$10/year)
2. In Render Dashboard:
   - Frontend service → Settings → Custom Domain → Add `yourdomain.com`
   - Backend service → Settings → Custom Domain → Add `api.yourdomain.com`
3. Copy CNAME records to your domain registrar
4. Wait 24-48 hours for DNS

---

## Costs
- **Free tier:** $0/month (both services free)
- **With custom domain:** +$10-15/year
- **With TURN server:** +$0.04/min per user (optional, only if needed)

Auto-deploys on every `git push`!

# Video Communication Platform - Render Deployment Guide

## Step 1: Prepare Your Code

### Create a .gitignore file (if not exists)
```
node_modules/
.env
.env.local
.env.*.local
build/
dist/
.DS_Store
```

### Update server/package.json
- Added Node.js engine specification (18.x)
- Already has all required dependencies

## Step 2: Push to GitHub

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Ready for Render deployment"

# Create repo on GitHub (https://github.com/new)
# Then:
git remote add origin https://github.com/YOUR_USERNAME/video-platform.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy Backend on Render

1. **Go to https://render.com**
2. **Sign up** with GitHub account
3. **Click "New +"** → **"Web Service"**
4. **Connect GitHub repo** → Select your `video-platform` repo
5. **Fill in details:**
   - **Name:** `video-platform-backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Root Directory:** `server` (IMPORTANT!)
   - **Plan:** Free (or Starter $7/month for better performance)

6. **Add Environment Variables:**
   - Click "Advanced" → "Add Environment Variable"
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `CLIENT_URL` = (Leave blank for now, update after frontend deployment)

7. **Click "Create Web Service"**
8. **Wait for deployment** (~2-3 minutes)
9. **Copy your backend URL:** `https://your-service-name.onrender.com`

## Step 4: Update Frontend for Backend URL

Once backend is deployed, update the client:

1. **Open client/.env.production:**
```
REACT_APP_SERVER_URL=https://your-service-name.onrender.com
```

2. **Also update client/src/components/VideoRoom.js if needed:**
```javascript
const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
```

3. **Commit and push:**
```bash
git add .
git commit -m "Update backend URL for production"
git push
```

## Step 5: Deploy Frontend on Render

1. **In Render Dashboard** → Click "New +" → **"Static Site"**
2. **Connect same GitHub repo**
3. **Fill in details:**
   - **Name:** `video-platform-frontend`
   - **Root Directory:** `client` (IMPORTANT!)
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`

4. **Add Environment Variables:**
   - `REACT_APP_SERVER_URL` = `https://your-service-name.onrender.com`

5. **Click "Create Static Site"**
6. **Wait for build and deployment** (~3-5 minutes)
7. **Get your frontend URL:** `https://your-frontend-name.onrender.com`

## Step 6: Update Backend CORS

Now that you know both URLs, update backend CORS:

1. **Edit server/index.js:**
```javascript
const allowedOrigins = [
  'https://your-frontend-name.onrender.com',
  'http://localhost:3000' // for local development
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

2. **Update environment variable in Render dashboard:**
   - Go to backend service settings
   - Set `CLIENT_URL` = `https://your-frontend-name.onrender.com`

3. **Commit and push:**
```bash
git add .
git commit -m "Update CORS for production"
git push
```

4. **Redeploy backend:** In Render dashboard → Click "Deploys" → "Trigger Deploy"

## Step 7: Test Your Deployment

1. **Open frontend URL** in browser: `https://your-frontend-name.onrender.com`
2. **Create a room** and get room ID
3. **Open in another browser/device** with same room ID
4. **Verify:**
   - Both users appear in the room
   - Video/audio works
   - Contact form submits successfully

## Step 8: Custom Domain (Optional)

1. **Buy domain** from Namecheap, GoDaddy, or Google Domains
2. **In Render dashboard:**
   - Backend service → Settings → Custom Domain
   - Add `api.yourdomain.com`
   - Copy the CNAME value shown
   - Add CNAME record in domain registrar
   - Wait 24-48 hours for DNS propagation

3. **Frontend domain:**
   - Frontend service → Settings → Custom Domain
   - Add `yourdomain.com`
   - Copy CNAME value
   - Add to domain registrar

## Step 9: Troubleshooting

### Backend won't start
```bash
# Check logs in Render dashboard
# Make sure root directory is set to "server"
# Verify package.json has "start" script
```

### Frontend shows blank/errors
```bash
# Check browser console (F12)
# Verify REACT_APP_SERVER_URL environment variable
# Check that backend URL is accessible
```

### "Failed to connect to server"
```bash
# Verify backend is running (check service logs)
# Confirm CORS allows frontend origin
# Check CLIENT_URL matches frontend URL exactly
```

### Video doesn't work but connection works
```bash
# Add TURN server to ICE candidates (see below)
# Some corporate networks block WebRTC
```

## Step 10: Add TURN Server (Important for NAT/Firewall)

Edit client/src/components/VideoRoom.js to add TURN configuration:

```javascript
const peerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ]
});
```

## Cost Breakdown

| Service | Plan | Cost/Month |
|---------|------|-----------|
| Backend (Render) | Free | $0 |
| Frontend (Render) | Free | $0 |
| Domain (optional) | .com | $10-15 |
| TURN Server (optional) | Twilio | $0.04/min (pay-as-you-go) |

**Total for MVP:** $0/month (Free tier)

## Auto-Redeploy on Push

Render automatically redeploys when you push to GitHub!

```bash
# Just push your changes
git push origin main

# Both frontend and backend will automatically rebuild and deploy
# Check Render dashboard for deployment status
```

## Final URLs

- **Frontend:** https://your-frontend-name.onrender.com
- **Backend:** https://your-service-name.onrender.com
- **API Health:** https://your-service-name.onrender.com/api/health

## Deployment Complete! 🎉

Your video communication platform is now live on the internet!

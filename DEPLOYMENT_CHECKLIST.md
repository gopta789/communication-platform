# Pre-Deployment Checklist

## ✅ Code Preparation

### Backend (server/)
- [ ] `package.json` has `"start"` script: `"node index.js"`
- [ ] `.env.example` created with template variables
- [ ] `index.js` uses `process.env.PORT` (default 5000)
- [ ] CORS configured for `process.env.CLIENT_URL`
- [ ] No hardcoded localhost URLs
- [ ] All dependencies in `package.json` (not node_modules)

### Frontend (client/)
- [ ] `package.json` has build script: `"react-scripts build"`
- [ ] `.env.production` created with `REACT_APP_SERVER_URL`
- [ ] `VideoRoom.js` uses `process.env.REACT_APP_SERVER_URL`
- [ ] No hardcoded backend URLs
- [ ] Build completes without errors: `npm run build`

### Repository
- [ ] `.gitignore` includes:
  - [ ] `node_modules/`
  - [ ] `.env`
  - [ ] `build/`
  - [ ] `.DS_Store`
- [ ] Git initialized: `git init`
- [ ] GitHub remote added: `git remote add origin ...`
- [ ] Initial commit made: `git commit -m "..."`

## ✅ Before Pushing to GitHub

```bash
# Test backend locally
cd server
npm install
npm start
# Should see: "Server running on port 5000"

# Test frontend locally
cd ../client
npm install
npm start
# Should see: React app at http://localhost:3000

# Verify build
npm run build
# Check `build/` folder was created

# Go back to root
cd ..
```

## ✅ GitHub Preparation

- [ ] GitHub account created: https://github.com/
- [ ] New repository created: https://github.com/new
- [ ] Repository is PUBLIC (Render requirement)
- [ ] Repository initialized locally:
  ```bash
  git add .
  git commit -m "Video platform ready for Render deployment"
  git branch -M main
  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
  git push -u origin main
  ```

## ✅ Render Account Setup

- [ ] Render account created: https://render.com/
- [ ] Connected with GitHub account
- [ ] GitHub account has access to repository

## ✅ Backend Deployment

### Create Web Service on Render
- [ ] Service name: `video-platform-backend`
- [ ] GitHub repo selected: `YOUR_REPO`
- [ ] Root directory: `server`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Plan: `Free`
- [ ] Region: Closest to users

### Environment Variables (Backend)
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `5000`
  - [ ] `CLIENT_URL` = `https://communication-platform-1.onrender.com` (update after frontend deploys)

### After Backend Deploys
- [ ] Status shows "Live" or "Running"
- [ ] Logs show no errors
- [ ] Note the URL: `https://communication-platform.onrender.com`
- [ ] Test health endpoint: https://communication-platform.onrender.com/api/health
- [ ] Should return: `{"status":"ok","message":"Server is running"}`

## ✅ Frontend Deployment

### Create Static Site on Render
- [ ] Site name: `video-platform-frontend`
- [ ] GitHub repo selected: `YOUR_REPO`
- [ ] Root directory: `client`
- [ ] Build command: `npm install && npm run build`
- [ ] Publish directory: `build`
- [ ] Plan: `Free`

### Environment Variables (Frontend)
-- [ ] `REACT_APP_SERVER_URL` = `https://communication-platform.onrender.com` (from backend deployment)

### After Frontend Deploys
- [ ] Status shows "Live"
- [ ] Build log shows no errors
- [ ] Site accessible at URL shown in dashboard
  - [ ] Note the URL: `https://communication-platform-1.onrender.com`
- [ ] Page loads without blank screen

## ✅ Backend Update & Redeploy

### Update CORS
1. [ ] Edit `server/index.js` (lines 13-19)
2. [ ] Update `allowedOrigins`:
```javascript
const allowedOrigins = [
  'https://communication-platform-1.onrender.com',
  'http://localhost:3000'
];
```
3. [ ] Save file

### Update Backend Environment Variable
1. [ ] Go to Render backend service dashboard
2. [ ] Go to "Environment"
3. [ ] Update `CLIENT_URL` = `https://communication-platform-1.onrender.com`

### Redeploy Backend
1. [ ] Push changes to GitHub:
```bash
git add server/index.js
git commit -m "Update CORS for production"
git push origin main
```
2. [ ] Render auto-redeploys (2-3 minutes)
3. [ ] Verify deployment completed in Render dashboard

## ✅ Testing

### Basic Connectivity
- [ ] Open frontend URL in browser
- [ ] Page loads without errors
- [ ] Open browser console (F12)
- [ ] No red errors in console
- [ ] Network tab shows connection to backend

### Room Creation & Joining
- [ ] Open two browser windows/tabs
- [ ] Browser 1: Create new room, copy Room ID
- [ ] Browser 2: Paste Room ID, enter name, join
- [ ] Both browsers show connected status
- [ ] No "room not found" errors

### Video/Audio
- [ ] Both browsers request camera/microphone permission
- [ ] Grant permissions
- [ ] Local video shows in local video element
- [ ] Remote video appears in remote video element
- [ ] Audio transmits (speak and hear each other)

### Contact Form (Homepage)
- [ ] Fill in Name, Email, Message
- [ ] Click "Send Message"
- [ ] Get success message
- [ ] Check `server/data/messages.json` (backend logs should show save)

### Media Cleanup
- [ ] In video room, camera light is on
- [ ] Click "Leave Room"
- [ ] Return to homepage
- [ ] Camera light turns off
- [ ] No errors in browser console

## ✅ Production Readiness

### Security
- [ ] [ ] No hardcoded credentials in code
- [ ] [ ] `.env` file is in `.gitignore`
- [ ] [ ] Production URLs use HTTPS
- [ ] [ ] CORS only allows known origins
- [ ] [ ] Input validation on server side

### Performance
- [ ] Frontend loads in < 3 seconds
- [ ] Video connection established in < 5 seconds
- [ ] No console warnings or errors
- [ ] Network requests complete successfully

### Monitoring (Optional but Recommended)
- [ ] [ ] Set up Render notifications for deploy failures
- [ ] [ ] Monitor backend uptime
- [ ] [ ] Check error logs regularly

## ✅ Custom Domain (Optional)

### Domain Registration
- [ ] Purchase domain from registrar (Namecheap, GoDaddy, etc.)
- [ ] Domain registered and active

### Backend Domain Setup
- [ ] In Render backend service → Settings → Custom Domain
- [ ] Add: `api.yourdomain.com`
- [ ] Copy the CNAME record shown
- [ ] Add CNAME to domain registrar DNS
- [ ] Wait 24-48 hours for DNS propagation

### Frontend Domain Setup
- [ ] In Render frontend service → Settings → Custom Domain
- [ ] Add: `yourdomain.com`
- [ ] Copy the CNAME record shown
- [ ] Add CNAME to domain registrar DNS
- [ ] Wait 24-48 hours for DNS propagation

### Verify Custom Domains
- [ ] `yourdomain.com` loads frontend
- [ ] `api.yourdomain.com/api/health` returns JSON
- [ ] Update CORS if using custom domains
- [ ] Redeploy backend

## 🎉 Deployment Complete!

Your app is now live on the internet!

- **Frontend:** https://yourdomain.com (or Render URL)
- **Backend:** https://api.yourdomain.com (or Render URL)
- **Share with friends:** Send them the frontend URL

## Post-Deployment

- [ ] Monitor error logs in Render dashboard
- [ ] Test with real users
- [ ] Gather feedback
- [ ] Plan improvements
- [ ] Scale if needed (upgrade Render plans)

---

**Congratulations! Your Video Communication Platform is live! 🚀**

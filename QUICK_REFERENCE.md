# 🚀 Render Deployment - Quick Reference Card

## TL;DR - Just Tell Me What To Do

### Phase 1: GitHub (5 minutes)
```bash
git init
git add .
git commit -m "Ready for Render"
git remote add origin https://github.com/YOUR_USERNAME/video-platform.git
git branch -M main
git push -u origin main
```

### Phase 2: Backend Deployment (5 minutes)
1. Go to https://render.com → Sign in with GitHub
2. "New +" → "Web Service"
3. Select `video-platform` repo
4. **Root Directory:** `server`
5. **Build:** `npm install`
6. **Start:** `npm start`
7. Click "Create Web Service"
8. Wait for deployment, copy URL

### Phase 3: Frontend Deployment (5 minutes)
1. "New +" → "Static Site"
2. Select `video-platform` repo
3. **Root Directory:** `client`
4. **Build:** `npm install && npm run build`
5. **Publish:** `build`
6. **Env var:** `REACT_APP_SERVER_URL` = [backend URL from phase 2]
7. Click "Create Static Site"
8. Wait for deployment, copy URL

### Phase 4: Backend Update (5 minutes)
1. Edit `server/index.js` line ~14
2. Update `allowedOrigins` with frontend URL
3. Commit and push: `git commit -am "Update CORS" && git push`
4. Render auto-redeploys

**Total time: ~20 minutes**

---

## Error Solutions

| Error | Solution |
|-------|----------|
| "Root directory not found" | Set to `server` (not `.` or `/server/`) |
| "REACT_APP_SERVER_URL undefined" | Add to Frontend env vars in Render |
| "Can't connect to backend" | Check CORS in `server/index.js` |
| "Room not found" | Wait for backend to redeploy after CORS update |
| "Build failed" | Check client/package.json has `build` script |
| "Port already in use" | Render manages ports, ignore this |

---

## Verification Steps

```
✅ Backend deployed:
   curl https://your-backend-url.onrender.com/api/health
   
✅ Frontend deployed:
   Open https://your-frontend-url.onrender.com in browser
   
✅ Connected:
   Create room, join from different browser
   Should see both videos
```

---

## Environment Variables

### Backend
| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `CLIENT_URL` | `https://your-frontend.onrender.com` |

### Frontend
| Key | Value |
|-----|-------|
| `REACT_APP_SERVER_URL` | `https://your-backend.onrender.com` |

---

## File Structure (What Matters)

```
✅ Must have these:
├── server/
│   ├── package.json (with "start" script)
│   └── index.js
├── client/
│   ├── package.json (with "build" script)
│   ├── .env.production
│   └── src/

❌ Don't push these:
├── node_modules/
├── build/
├── .env (use .env.production)
└── .DS_Store
```

---

## URLs After Deployment

```
Frontend: https://[your-service-name]-frontend.onrender.com
Backend:  https://[your-service-name]-backend.onrender.com

Test endpoint:
https://[your-service-name]-backend.onrender.com/api/health

Should return:
{ "status": "ok", "message": "Server is running" }
```

---

## If Something Breaks

1. Check Render dashboard → Logs
2. Check browser console (F12)
3. Read RENDER_DEPLOYMENT.md troubleshooting section
4. Most common: CORS not updated or env vars missing

---

## Files I Created for You

| File | Purpose |
|------|---------|
| RENDER_QUICK_START.md | 5-step deployment |
| RENDER_DEPLOYMENT.md | Detailed guide |
| RENDER_VISUAL_GUIDE.md | Diagrams & visuals |
| DEPLOYMENT_CHECKLIST.md | Before/after checks |
| README_RENDER_DEPLOYMENT.md | Overview |
| DOCUMENTATION_INDEX.md | This index |
| render.yaml | Render config |
| deploy-render.bat | Windows helper |
| deploy-render.sh | Linux/Mac helper |

---

## Need Help?

1. **Overview:** README_RENDER_DEPLOYMENT.md
2. **Step-by-step:** RENDER_QUICK_START.md
3. **Troubleshooting:** RENDER_DEPLOYMENT.md
4. **Visual guide:** RENDER_VISUAL_GUIDE.md
5. **Checklist:** DEPLOYMENT_CHECKLIST.md

---

## Costs

| Item | Cost |
|------|------|
| Backend | $0 (free tier) |
| Frontend | $0 (free tier) |
| Total | **$0/month** |

Optional:
- Custom domain: $10-15/year
- Premium tiers: $7-50+/month

---

## Pro Commands

```bash
# Auto-redeploy on every push
git push origin main

# Monitor backend
curl https://your-backend.onrender.com/api/health

# Force redeploy (if needed)
# Use Render dashboard → Deploys → "Trigger Deploy"

# Check status
# Use Render dashboard → Services → Status
```

---

## Success Checklist

- [ ] GitHub repo created and code pushed
- [ ] Backend deployed and running
- [ ] Frontend deployed and running
- [ ] CORS updated in backend
- [ ] Backend redeployed
- [ ] Can create room in browser 1
- [ ] Can join same room in browser 2
- [ ] Both see each other's video
- [ ] Contact form works
- [ ] No errors in console (F12)

Once ALL checked → You're live! 🎉

---

## Next Steps (After Going Live)

1. Share frontend URL with friends
2. Monitor for errors (check Render logs)
3. Gather feedback
4. Consider:
   - Custom domain setup
   - Upgrade to paid tier if needed
   - Add authentication
   - Switch to database

---

## Important Notes

⚠️ **Remember:**
- Backend URL must be in frontend env vars
- Frontend URL must be in backend CORS
- Both must use HTTPS (Render provides this)
- Never push `.env` file
- Always run `npm install` on server

---

## One More Time - The 4 Phases

```
1. GitHub:     git push (2 min)
2. Backend:    Create Web Service on Render (5 min)
3. Frontend:   Create Static Site on Render (5 min)
4. Update:     Edit CORS, git push, auto-redeploy (5 min)

Total: ~20 minutes to live on internet! ✨
```

---

## The 3 Most Important URLs

1. **Your app:** `https://your-frontend.onrender.com`
2. **Your backend API:** `https://your-backend.onrender.com`
3. **Backend health:** `https://your-backend.onrender.com/api/health`

Test #3 to verify everything works!

---

**You're ready! Start with Step 1: Push to GitHub 🚀**

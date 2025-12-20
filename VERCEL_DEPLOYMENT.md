# Vercel Deployment Guide

## ✅ Flutter Web Build Complete
Your Flutter app has been built successfully in `frontend/build/web`

## 🚀 Deployment Methods

### Method 1: Vercel Web Interface (RECOMMENDED - Easiest)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/new
   - Sign in with GitHub (use your `4ryanwalia` account)

2. **Import Your Repository**
   - Click "Import Git Repository"
   - Select: `4ryanwalia/Leave-Productivity-Analyzer`
   - Click "Import"

3. **Configure Project Settings**
   - **Root Directory**: `frontend` (click "Edit" and set to `frontend`)
   - **Framework Preset**: `Other` (or leave as default)
   - **Build Command**: `flutter build web --release`
   - **Output Directory**: `build/web`
   - **Install Command**: `flutter pub get` (optional, Vercel will auto-detect)

4. **Environment Variables** (Optional for now)
   - You can add these later if needed

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (takes 2-5 minutes)
   - Your app will be live at: `https://your-app-name.vercel.app`

### Method 2: Vercel CLI

If you're already authenticated in the CLI (check the terminal), run:

```bash
cd frontend
vercel --prod --yes
```

If not authenticated:
1. The CLI should have opened a browser for login
2. Or run: `vercel login`
3. Then: `vercel --prod --yes`

## 📝 Important Notes

### After Deployment:

1. **Update Backend URL in Frontend**
   - Once your backend is deployed to Render, update:
   - File: `frontend/lib/services/api_service.dart`
   - Change `baseUrl` to your Render backend URL
   - Rebuild and redeploy frontend

2. **CORS Configuration**
   - Make sure your Render backend has CORS enabled for your Vercel domain
   - Update `FRONTEND_URL` in Render environment variables

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Your Repository**: https://github.com/4ryanwalia/Leave-Productivity-Analyzer
- **Vercel Docs**: https://vercel.com/docs

## ✅ Current Status

- ✅ Flutter Web build completed
- ✅ `vercel.json` configured
- ✅ Ready for deployment
- ⏳ Waiting for deployment



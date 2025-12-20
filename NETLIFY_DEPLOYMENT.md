# Netlify Deployment Guide

## ✅ Setup Complete
- ✅ Flutter Web build completed (`build/web`)
- ✅ Netlify CLI installed
- ✅ `netlify.toml` configured
- ✅ Logged into Netlify

## 🚀 Deployment Methods

### Method 1: Netlify Web Interface (RECOMMENDED - Easiest)

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com/start
   - Sign in with GitHub (use your `4ryanwalia` account)

2. **Import Your Repository**
   - Click "Add new site" → "Import an existing project"
   - Click "Deploy with GitHub"
   - Authorize Netlify to access your GitHub
   - Select: `4ryanwalia/Leave-Productivity-Analyzer`

3. **Configure Build Settings**
   - **Base directory**: `frontend`
   - **Build command**: `flutter build web --release`
   - **Publish directory**: `frontend/build/web`
   - **Branch to deploy**: `main`

4. **Environment Variables** (Optional)
   - You can add these later if needed

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete (takes 3-5 minutes)
   - Your app will be live at: `https://your-site-name.netlify.app`

### Method 2: Netlify CLI (Interactive)

Since the CLI requires interactive input, run these commands manually:

```bash
cd frontend
netlify init
```

Then follow the prompts:
1. Select "Create & configure a new project"
2. Enter a site name (or leave blank for auto-generated)
3. Confirm build command: `flutter build web --release`
4. Confirm publish directory: `build/web`

After initialization:
```bash
netlify deploy --prod
```

### Method 3: Netlify CLI (Quick Deploy)

If you want to deploy the already-built files:

```bash
cd frontend
netlify deploy --dir=build/web --prod
```

Then follow prompts to create a new site.

## 📝 Configuration Files

### `netlify.toml` (Already Created)
```toml
[build]
  command = "flutter build web --release"
  publish = "build/web"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This ensures:
- SPA routing works correctly
- All routes redirect to `index.html`
- Build command is set automatically

## 🔧 After Deployment

### 1. Update Backend URL
Once your backend is deployed to Render:
- File: `frontend/lib/services/api_service.dart`
- Change `baseUrl` to your Render backend URL
- Rebuild and redeploy

### 2. Custom Domain (Optional)
- Go to Site settings → Domain management
- Add your custom domain

### 3. Environment Variables (If Needed)
- Go to Site settings → Environment variables
- Add any required variables

## 🔗 Quick Links

- **Netlify Dashboard**: https://app.netlify.com
- **Your Repository**: https://github.com/4ryanwalia/Leave-Productivity-Analyzer
- **Netlify Docs**: https://docs.netlify.com

## ✅ Current Status

- ✅ Flutter Web build completed
- ✅ `netlify.toml` configured
- ✅ Netlify CLI installed and logged in
- ⏳ Ready for deployment (use web interface for easiest method)

## 💡 Tips

- **Web Interface**: Easiest method, no CLI interaction needed
- **Auto Deploy**: Netlify will auto-deploy on every push to `main` branch
- **Build Logs**: Check build logs in Netlify dashboard if deployment fails
- **Flutter Requirements**: Netlify supports Flutter Web builds, but build time may be longer


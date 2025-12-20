# Flutter Frontend

This is the Flutter Web frontend for the Leave & Productivity Analyzer application.

## Setup

1. Install Flutter SDK (if not already installed)
   - Download from https://flutter.dev/docs/get-started/install
   - Ensure Flutter is in your PATH

2. Install dependencies:
   ```bash
   flutter pub get
   ```

3. Update API URL:
   - Open `lib/services/api_service.dart`
   - Update the `baseUrl` constant with your backend URL
   - For local development: `http://localhost:3000/api`
   - For production: your deployed backend URL

4. Run the app:
   ```bash
   flutter run -d chrome
   ```

## Build for Production

To build for web deployment:

```bash
flutter build web
```

The output will be in `build/web/` directory, which can be deployed to Netlify or Vercel.

## Deployment

### Netlify
1. Build the Flutter web app: `flutter build web`
2. Deploy the `build/web` folder to Netlify
3. Configure redirects: Create `netlify.toml` with:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### Vercel
1. Build the Flutter web app: `flutter build web`
2. Deploy the `build/web` folder to Vercel
3. Configure `vercel.json`:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```



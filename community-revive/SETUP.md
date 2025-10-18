# Community Revive - Setup Guide

## Quick Start

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Add Google Maps API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Enable the Maps JavaScript API
   - Create an API key
   - Create a `.env.local` file in the project root:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

3. **Start the application**:
   ```bash
   npm start
   ```
   The app will open at http://localhost:3000

## Features

- ✅ Interactive Google Maps with property markers
- ✅ Property filtering and search
- ✅ Mobile-responsive design
- ✅ Property details with impact analysis
- ✅ Community value scoring system

## Troubleshooting

If you see "Google Maps API key not found":
- Make sure you've created `.env.local` with your API key
- Restart the development server after adding the key

## Build for Production

```bash
npm run build
```

The built files will be in the `build` folder.

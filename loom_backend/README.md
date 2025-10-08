# Loom Backend - WebSocket Server

Real-time collaborative code editor backend using Yjs and WebSockets.

## Features

- 🔄 Real-time synchronization using Yjs CRDT
- 🏠 Room-based collaboration
- 👥 User awareness (cursors, selections)
- 🎨 Language synchronization across users

## Deployment on Railway

### Quick Deploy

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

2. **Deploy on Railway:**
   - Go to [Railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `loom_backend` repository
   - Railway will auto-detect and deploy! 🚀

3. **Get Your WebSocket URL:**
   - After deployment, Railway will give you a URL like: `loom-backend-production.up.railway.app`
   - Your WebSocket URL will be: `wss://loom-backend-production.up.railway.app`

4. **Update Frontend:**
   - Update your frontend to use: `wss://your-railway-url.railway.app`
   - Change from `ws://localhost:1234` to your Railway WebSocket URL

### Environment Variables (Optional)

Railway automatically sets `PORT` - no configuration needed!

## Local Development

```bash
npm install
npm start
```

Server runs on `ws://localhost:1234`

## Tech Stack

- **Node.js** - Runtime
- **ws** - WebSocket server
- **Yjs** - CRDT for synchronization
- **y-protocols** - Yjs protocol implementation
- **lib0** - Encoding/decoding utilities

## License

MIT

# Backend Server

## Environment Variables

- `PORT` - Server port (default: 3001, auto-set by Railway/Render)
- `FRONTEND_URL` - Your Vercel frontend URL (for CORS)

## Deploy to Railway

1. Push code to GitHub
2. Go to railway.app
3. New Project → Deploy from GitHub
4. Set root directory to `server`
5. Add environment variable: `FRONTEND_URL=https://your-app.vercel.app`
6. Deploy!

## Local Development

```bash
npm install
npm start
# Server runs on http://localhost:3001
```


# Dos Ticket Estimator - Polling App

A lightweight web-based polling application for story estimation, built with React and Node.js, deployed on Vercel with MongoDB.

## Features

- ✅ Create polls
- ✅ Real-time voting with avatars
- ✅ Timer functionality (30s or 1min)
- ✅ Results visualization with charts and statistics
- ✅ Persistent storage with MongoDB
- ✅ Full Vercel deployment (frontend + backend)

## Quick Start

### Local Development

1. **Install dependencies:**

   ```bash
   npm install
   cd client && npm install
   ```

2. **Set up MongoDB:**

   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Get your connection string
   - Create `.env.local` in the root:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/polling-app?retryWrites=true&w=majority
     MONGODB_DB=polling-app
     ```

3. **Run development servers:**

   ```bash
   # Option 1: Use old Express server (for local dev)
   cd server && npm start  # Terminal 1
   cd client && npm run dev # Terminal 2

   # Option 2: Use Vercel dev (for testing API routes)
   vercel dev              # Terminal 1
   cd client && npm run dev # Terminal 2
   ```

4. **Open:** http://localhost:3000

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. **Set up MongoDB Atlas** (see DEPLOYMENT.md)
2. **Deploy:**
   ```bash
   vercel
   vercel env add MONGODB_URI
   vercel env add MONGODB_DB
   vercel --prod
   ```

## Project Structure

```
polling-app/
├── api/              # Vercel serverless functions
│   └── poll/
├── client/           # React frontend
│   └── src/
├── lib/              # Shared utilities
│   └── db.js        # MongoDB connection
├── server/           # Express server (for local dev)
└── vercel.json       # Vercel configuration
```

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Vercel Serverless Functions
- **Database:** MongoDB Atlas
- **Deployment:** Vercel

## License

MIT

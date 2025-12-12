# Deployment Guide - Vercel with MongoDB

## 🚀 Full Vercel Deployment (Frontend + Backend + Database)

This guide will help you deploy everything to Vercel with MongoDB Atlas.

---

## Step 1: Set Up MongoDB Atlas (Free)

1. **Create MongoDB Atlas Account:**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free (M0 cluster)

2. **Create a Cluster:**
   - Choose "Free" tier (M0)
   - Select a cloud provider and region (closest to you)
   - Click "Create Cluster" (takes 3-5 minutes)

3. **Set Up Database Access:**
   - Go to "Database Access" → "Add New Database User"
   - Username: `polling-app` (or your choice)
   - Password: Generate a secure password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Set Up Network Access:**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add Vercel's IP ranges if you prefer

5. **Get Connection String:**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
   - Replace `<password>` with your actual password
   - Add database name at the end: `?retryWrites=true&w=majority&appName=polling-app`

**Example:**
```
mongodb+srv://polling-app:yourpassword@cluster0.xxxxx.mongodb.net/polling-app?retryWrites=true&w=majority
```

---

## Step 2: Prepare Your Code

The code is already set up! Here's what's been done:

✅ Converted Express routes to Vercel serverless functions  
✅ Added MongoDB connection utility  
✅ Updated all endpoints to use MongoDB  
✅ Created Vercel configuration files  

---

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd polling-app
   vercel
   ```
   - Follow prompts
   - When asked "Link to existing project?" → No
   - Project name: `polling-app` (or your choice)
   - Directory: `.` (current directory)

4. **Set Environment Variables:**
   ```bash
   vercel env add MONGODB_URI
   # Paste your MongoDB connection string
   
   vercel env add MONGODB_DB
   # Enter: polling-app
   ```

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

### Option B: Deploy via GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/polling-app.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Root Directory: Leave as `.` (root)

3. **Configure Build Settings:**
   - Framework Preset: "Other"
   - Build Command: `cd client && npm run build`
   - Output Directory: `client/dist`
   - Install Command: `npm install && cd client && npm install`

4. **Add Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add:
     - `MONGODB_URI` = Your MongoDB connection string
     - `MONGODB_DB` = `polling-app`

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete

---

## Step 4: Update Vercel Configuration

The `vercel.json` file needs to be updated to properly route API requests. However, Vercel automatically detects the `api/` folder structure, so the current setup should work!

If you encounter routing issues, update `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ]
}
```

---

## Step 5: Test Your Deployment

1. Visit your Vercel URL (e.g., `https://polling-app.vercel.app`)
2. Create a poll
3. Vote on the poll
4. Close the poll
5. Check results

---

## Environment Variables Summary

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB connection string |
| `MONGODB_DB` | `polling-app` | Database name |

---

## Troubleshooting

### API Routes Not Working

- Check that `api/` folder is in the root directory
- Verify environment variables are set
- Check Vercel function logs: Project → Functions → View Logs

### MongoDB Connection Errors

- Verify connection string is correct
- Check that IP is whitelisted in MongoDB Atlas
- Ensure database user has read/write permissions

### Build Errors

- Make sure `package.json` in root has `mongodb` dependency
- Check that `client/package.json` has all React dependencies
- Review build logs in Vercel dashboard

---

## Local Development

To test locally with MongoDB:

1. **Create `.env.local` in root:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/polling-app?retryWrites=true&w=majority
   MONGODB_DB=polling-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd client && npm install
   ```

3. **Run development server:**
   ```bash
   # Terminal 1: Run Vercel dev (handles API routes)
   vercel dev
   
   # Terminal 2: Run frontend dev server
   cd client && npm run dev
   ```

   Or use the old server for local dev:
   ```bash
   cd server && npm start
   cd client && npm run dev
   ```

---

## Project Structure

```
polling-app/
├── api/                    # Vercel serverless functions
│   └── poll/
│       ├── create/
│       ├── vote/
│       ├── close/
│       ├── timer/
│       └── index.js
├── client/                 # React frontend
│   ├── src/
│   └── package.json
├── lib/                    # Shared utilities
│   └── db.js              # MongoDB connection
├── server/                 # Old Express server (for local dev)
├── vercel.json            # Vercel configuration
└── package.json           # Root dependencies
```

---

## Cost

- **Vercel**: Free tier (Hobby plan)
- **MongoDB Atlas**: Free tier (M0 cluster - 512MB storage)
- **Total**: $0/month 🎉

---

## Next Steps

1. Set up MongoDB Atlas
2. Deploy to Vercel
3. Test your app
4. Share with your team!

Need help? Check Vercel logs or MongoDB Atlas logs for errors.

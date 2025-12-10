# Story Estimation Poll - Lightweight Polling App

A simple, lightweight web-based tool for story estimation polls with timer functionality. No database required - everything runs in memory.

## Features

- ✅ Create estimation polls with custom questions and options
- ✅ Team members vote with their names
- ✅ Only one poll active at a time
- ✅ Timer with 30s/60s options (creator only)
- ✅ Visual countdown with audio beeps
- ✅ Results with bar chart and statistics
- ✅ Color-coded voters
- ✅ No database - pure in-memory storage

## Setup

### Backend Setup

```bash
cd server
npm install
npm start
# Server runs on http://localhost:3001
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
# Client runs on http://localhost:3000
```

## Adding Background Music (Optional)

To add background music during the timer:

1. Open `client/src/Timer.jsx`
2. Find this line near the top:
   ```javascript
   const TIMER_MUSIC_URL = "";
   ```
3. Add your music URL:
   ```javascript
   const TIMER_MUSIC_URL = "https://example.com/your-music.mp3";
   ```

### Where to get music URLs:

- **Direct MP3 links** from your server
- **SoundCloud** (use download link)
- **Google Drive** or **Dropbox** (public share links)
- **YouTube to MP3** converters (for public domain music)
- Host your own MP3 file on a CDN

**Note**: Make sure you have the rights to use any music you add.

## Usage

1. **Create Poll**: Enter question, your name, and select estimation options
2. **Start Timer**: Creator clicks "Start 30s Timer" or "Start 1min Timer"
3. **Vote**: Team members vote with their names while timer is running
4. **Close Poll**: Anyone can close to reveal results
5. **View Results**: See bar chart, stats, and individual votes with colors
6. **New Poll**: Create a new poll (automatically clears the old one)

## Features

- Timer with countdown beeps at 10, 5, 4, 3, 2, 1 seconds
- Visual countdown display with color changes
- Voting disabled until timer starts
- Names saved in browser for convenience
- Color-coded results for each voter
- Bar chart visualization
- Min/Max/Average statistics

## API Endpoints

- `POST /poll/create` - Create a new poll
- `POST /poll/vote` - Submit a vote
- `POST /poll/close` - Close the poll
- `POST /poll/timer/start` - Start the timer (creator only)
- `GET /poll` - Get current poll
- `GET /poll/timer` - Get timer status
- `GET /poll/results` - Get results (only when closed)

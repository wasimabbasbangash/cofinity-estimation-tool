import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - allow Vercel and localhost
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || !process.env.FRONTEND_URL) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(express.json());

// In-memory storage - room-based polls
// Structure: { roomCode: { id, question, options, createdBy, votes[], status, closedBy, timerActive, timerEndTime } }
let pollsByRoom = {};

// Helper function to generate room code
function generateRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Helper function to get poll by room code
function getPollByRoom(roomCode) {
  if (!roomCode) {
    // Legacy support: get first available poll
    const roomCodes = Object.keys(pollsByRoom);
    if (roomCodes.length === 0) return null;
    return pollsByRoom[roomCodes[0]];
  }
  return pollsByRoom[roomCode] || null;
}

// Ticket 3: Create Poll API
app.post("/poll/create", (req, res) => {
  const { question, options, createdBy, roomCode } = req.body;

  if (!question || !options || !createdBy) {
    return res
      .status(400)
      .json({ error: "Missing required fields: question, options, createdBy" });
  }

  if (!Array.isArray(options) || options.length === 0) {
    return res.status(400).json({ error: "Options must be a non-empty array" });
  }

  // Use provided room code or generate new one
  let finalRoomCode = roomCode || generateRoomCode();

  // Create new poll for this room
  const newPoll = {
    id: Date.now().toString(),
    roomCode: finalRoomCode,
    question,
    options,
    createdBy,
    votes: [],
    status: "open",
    closedBy: null,
    timerActive: false,
    timerEndTime: null,
  };

  pollsByRoom[finalRoomCode] = newPoll;

  res.json({ success: true, poll: newPoll, roomCode: finalRoomCode });
});

// Ticket 4: Vote on Poll API
app.post("/poll/vote", (req, res) => {
  const { name, value, avatar, roomCode } = req.body;

  if (!name || value === undefined) {
    return res
      .status(400)
      .json({ error: "Missing required fields: name, value" });
  }

  const activePoll = getPollByRoom(roomCode);

  if (!activePoll) {
    return res.status(404).json({ error: "No active poll found" });
  }

  if (activePoll.status !== "open") {
    return res
      .status(400)
      .json({ error: "Poll is closed. Voting is not allowed." });
  }

  // Check if timer is required and active
  if (activePoll.timerEndTime && !activePoll.timerActive) {
    return res.status(400).json({
      error: "Timer has not been started yet. Voting is not allowed.",
    });
  }

  // Check if timer has expired
  if (
    activePoll.timerActive &&
    activePoll.timerEndTime &&
    Date.now() > activePoll.timerEndTime
  ) {
    return res
      .status(400)
      .json({ error: "Timer has expired. Voting is no longer allowed." });
  }

  if (!activePoll.options.includes(value)) {
    return res.status(400).json({ error: "Invalid option value" });
  }

  // Find existing vote by name and update, or add new vote
  const existingVoteIndex = activePoll.votes.findIndex((v) => v.name === name);

  if (existingVoteIndex >= 0) {
    // Overwrite existing vote
    activePoll.votes[existingVoteIndex].value = value;
    activePoll.votes[existingVoteIndex].avatar =
      avatar || activePoll.votes[existingVoteIndex].avatar;
  } else {
    // Add new vote
    activePoll.votes.push({ name, value, avatar: avatar || null });
  }

  res.json({ success: true, poll: activePoll });
});

// Ticket 5: Close Poll API
app.post("/poll/close", (req, res) => {
  const { userName, roomCode } = req.body;

  const activePoll = getPollByRoom(roomCode);

  if (!activePoll) {
    return res.status(404).json({ error: "No active poll found" });
  }

  if (activePoll.status === "closed") {
    return res.status(400).json({ error: "Poll is already closed" });
  }

  if (!userName || !userName.trim()) {
    return res
      .status(400)
      .json({ error: "User name is required to close the poll" });
  }

  // Allow anyone to close the poll, store who closed it
  activePoll.status = "closed";
  activePoll.closedBy = userName.trim();
  res.json({ success: true, poll: activePoll });
});

// Ticket 6: Get Poll + Results API
app.get("/poll", (req, res) => {
  const roomCode = req.query.roomCode || null;
  const activePoll = getPollByRoom(roomCode);

  if (!activePoll) {
    return res.status(404).json({ error: "No active poll found" });
  }

  // If poll is open, return poll with voter names only (for close button check)
  if (activePoll.status === "open") {
    const { votes, ...pollWithoutVotes } = activePoll;
    // Include voter names only (without values) so frontend can check if user has voted
    const voterNames = activePoll.votes.map((vote) => ({ name: vote.name }));
    return res.json({
      ...pollWithoutVotes,
      voterNames: voterNames,
    });
  }

  // If poll is closed, return full poll with votes
  res.json(activePoll);
});

app.get("/poll/results", (req, res) => {
  const roomCode = req.query.roomCode || null;
  const activePoll = getPollByRoom(roomCode);

  if (!activePoll) {
    return res.status(404).json({ error: "No active poll found" });
  }

  if (activePoll.status !== "closed") {
    return res.status(400).json({
      error: "Poll is still open. Results available only when closed.",
    });
  }

  res.json({ votes: activePoll.votes });
});

// Endpoint to check if room exists (for validation)
app.get("/poll/validate-room", (req, res) => {
  const roomCode = req.query.roomCode || null;

  if (!roomCode) {
    return res.status(400).json({ error: "Room code is required" });
  }

  const activePoll = getPollByRoom(roomCode);

  if (!activePoll) {
    return res.status(404).json({ exists: false, error: "Room not found" });
  }

  res.json({ exists: true, roomCode });
});

// Timer routes
app.post("/poll/timer/start", (req, res) => {
  const { duration, createdBy, roomCode } = req.body; // duration in seconds

  const activePoll = getPollByRoom(roomCode);

  if (!activePoll) {
    return res.status(404).json({ error: "No active poll found" });
  }

  if (activePoll.status !== "open") {
    return res
      .status(400)
      .json({ error: "Cannot start timer on a closed poll" });
  }

  if (activePoll.createdBy !== createdBy) {
    return res
      .status(403)
      .json({ error: "Only the creator can start the timer" });
  }

  // Check if timer is currently active and not expired
  const now = Date.now();
  if (
    activePoll.timerActive &&
    activePoll.timerEndTime &&
    now < activePoll.timerEndTime
  ) {
    return res.status(400).json({ error: "Timer is already running" });
  }

  const endTime = Date.now() + duration * 1000;
  activePoll.timerActive = true;
  activePoll.timerEndTime = endTime;

  res.json({
    success: true,
    timerEndTime: endTime,
    timerActive: true,
  });
});

app.get("/poll/timer", (req, res) => {
  const roomCode = req.query.roomCode || null;
  const activePoll = getPollByRoom(roomCode);

  if (!activePoll) {
    return res.status(404).json({ error: "No active poll found" });
  }

  const now = Date.now();
  const timeRemaining = activePoll.timerEndTime
    ? Math.max(0, activePoll.timerEndTime - now)
    : null;

  // Auto-disable timer on server if expired
  if (activePoll.timerActive && timeRemaining === 0) {
    activePoll.timerActive = false;
  }

  res.json({
    timerActive: activePoll.timerActive,
    timerEndTime: activePoll.timerEndTime,
    timeRemaining: timeRemaining ? Math.ceil(timeRemaining / 1000) : null,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

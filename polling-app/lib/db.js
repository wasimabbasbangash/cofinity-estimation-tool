import { MongoClient } from "mongodb";

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB = process.env.MONGODB_DB || "polling-app";

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI environment variable is not set. Please add it in Vercel Settings → Environment Variables."
    );
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    const db = client.db(MONGODB_DB);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  }
}

export async function getActivePoll(db, roomCode = null) {
  try {
    const polls = db.collection("polls");

    if (!roomCode) {
      // Legacy support: get the most recent open poll, or most recent closed if no open
      let activePoll = await polls.findOne(
        { status: "open" },
        { sort: { createdAt: -1 } }
      );

      if (!activePoll) {
        activePoll = await polls.findOne({}, { sort: { createdAt: -1 } });
      }

      return activePoll;
    }

    // Room-based: get poll by room code
    // Get the most recent open poll for this room, or most recent closed if no open
    let activePoll = await polls.findOne(
      { roomCode: roomCode },
      { sort: { createdAt: -1 } }
    );

    // If no poll found with roomCode, return null (don't fallback to any poll)
    return activePoll || null;
  } catch (error) {
    console.error("Error in getActivePoll:", error);
    console.error("roomCode:", roomCode);
    throw error;
  }
}

export function generateRoomCode() {
  // Generate a 6-character alphanumeric room code
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

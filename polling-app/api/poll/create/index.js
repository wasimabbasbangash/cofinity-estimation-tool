import {
  connectToDatabase,
  getActivePoll,
  generateRoomCode,
} from "../../../lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question, options, createdBy, roomCode } = req.body;

  if (!question || !options || !createdBy) {
    return res
      .status(400)
      .json({ error: "Missing required fields: question, options, createdBy" });
  }

  if (!Array.isArray(options) || options.length === 0) {
    return res.status(400).json({ error: "Options must be a non-empty array" });
  }

  try {
    const { db } = await connectToDatabase();
    const polls = db.collection("polls");

    // Use provided room code or generate new one
    let finalRoomCode = roomCode;
    if (!finalRoomCode) {
      finalRoomCode = generateRoomCode();
    }

    // Delete existing polls in this room (only one poll per room at a time)
    await polls.deleteMany({ roomCode: finalRoomCode });

    // Create new poll
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
      createdAt: new Date(),
    };

    await polls.insertOne(newPoll);

    res.json({ success: true, poll: newPoll, roomCode: finalRoomCode });
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).json({ error: "Failed to create poll" });
  }
}

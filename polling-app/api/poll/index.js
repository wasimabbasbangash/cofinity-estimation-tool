import { connectToDatabase, getActivePoll } from "../../../lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { db } = await connectToDatabase();
    const roomCode = req.query.roomCode
      ? String(req.query.roomCode).trim()
      : null;

    if (!roomCode || roomCode.length === 0) {
      return res.status(400).json({ error: "roomCode is required" });
    }

    console.log("Fetching poll for roomCode:", roomCode);
    const activePoll = await getActivePoll(db, roomCode);
    console.log("Active poll found:", activePoll ? "yes" : "no");

    if (!activePoll) {
      return res.status(404).json({ error: "No active poll found" });
    }

    // Ensure activePoll is a valid object
    if (typeof activePoll !== "object" || activePoll === null) {
      console.error("Invalid poll object:", activePoll);
      return res.status(500).json({ error: "Invalid poll data structure" });
    }

    // If poll is open, return poll with voter names only (for close button check)
    if (activePoll.status === "open") {
      // Safely extract votes and create poll without votes
      const votes = Array.isArray(activePoll.votes) ? activePoll.votes : [];
      const { votes: _, ...pollWithoutVotes } = activePoll;

      // Include voter names only (without values) so frontend can check if user has voted
      const voterNames = votes
        .filter((vote) => vote && typeof vote === "object" && vote.name)
        .map((vote) => ({
          name: vote.name,
        }));

      return res.json({
        ...pollWithoutVotes,
        voterNames: voterNames,
      });
    }

    // If poll is closed, return full poll with votes
    // Ensure votes is always an array
    const pollToReturn = {
      ...activePoll,
      votes: Array.isArray(activePoll.votes) ? activePoll.votes : [],
    };
    res.json(pollToReturn);
  } catch (error) {
    console.error("Error fetching poll:", error);
    console.error("Error stack:", error.stack);
    console.error("Request query:", req.query);
    res.status(500).json({
      error: "Failed to fetch poll",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

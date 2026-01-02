import { connectToDatabase, getActivePoll } from "../../../lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { db } = await connectToDatabase();
    const roomCode = req.query.roomCode || null;
    const activePoll = await getActivePoll(db, roomCode);

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
  } catch (error) {
    console.error("Error fetching poll:", error);
    res.status(500).json({ error: "Failed to fetch poll" });
  }
}

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

    if (activePoll.status !== "closed") {
      return res.status(400).json({
        error: "Poll is still open. Results available only when closed.",
      });
    }

    res.json({ votes: activePoll.votes });
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ error: "Failed to fetch results" });
  }
}

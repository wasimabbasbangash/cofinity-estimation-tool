import { connectToDatabase, getActivePoll } from "../../../../lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { duration, createdBy, roomCode } = req.body; // duration in seconds

  try {
    const { db } = await connectToDatabase();
    const activePoll = await getActivePoll(db, roomCode);

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
    const polls = db.collection("polls");

    // Update poll with timer
    await polls.updateOne(
      { id: activePoll.id },
      { $set: { timerActive: true, timerEndTime: endTime } }
    );

    res.json({
      success: true,
      timerEndTime: endTime,
      timerActive: true,
    });
  } catch (error) {
    console.error("Error starting timer:", error);
    res.status(500).json({ error: "Failed to start timer" });
  }
}

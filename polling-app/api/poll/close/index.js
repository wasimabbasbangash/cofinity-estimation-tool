import { connectToDatabase, getActivePoll } from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userName } = req.body;

  try {
    const { db } = await connectToDatabase();
    const activePoll = await getActivePoll(db);

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

    const polls = db.collection('polls');

    // Update poll status
    await polls.updateOne(
      { id: activePoll.id },
      { $set: { status: "closed", closedBy: userName.trim() } }
    );

    const updatedPoll = { ...activePoll, status: "closed", closedBy: userName.trim() };

    res.json({ success: true, poll: updatedPoll });
  } catch (error) {
    console.error('Error closing poll:', error);
    res.status(500).json({ error: 'Failed to close poll' });
  }
}


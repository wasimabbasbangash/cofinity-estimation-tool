import { connectToDatabase, getActivePoll } from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const activePoll = await getActivePoll(db);

    if (!activePoll) {
      return res.status(404).json({ error: "No active poll found" });
    }

    const now = Date.now();
    let timeRemaining = activePoll.timerEndTime
      ? Math.max(0, activePoll.timerEndTime - now)
      : null;

    // Auto-disable timer on server if expired
    if (activePoll.timerActive && timeRemaining === 0) {
      const polls = db.collection('polls');
      await polls.updateOne(
        { id: activePoll.id },
        { $set: { timerActive: false } }
      );
    }

    res.json({
      timerActive: activePoll.timerActive && timeRemaining > 0,
      timerEndTime: activePoll.timerEndTime,
      timeRemaining: timeRemaining ? Math.ceil(timeRemaining / 1000) : null,
    });
  } catch (error) {
    console.error('Error fetching timer:', error);
    res.status(500).json({ error: 'Failed to fetch timer' });
  }
}


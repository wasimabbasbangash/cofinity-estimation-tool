import { connectToDatabase, getActivePoll } from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, value, avatar } = req.body;

  if (!name || value === undefined) {
    return res
      .status(400)
      .json({ error: "Missing required fields: name, value" });
  }

  try {
    const { db } = await connectToDatabase();
    const activePoll = await getActivePoll(db);
    const polls = db.collection('polls');

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
    const now = Date.now();
    if (
      activePoll.timerActive &&
      activePoll.timerEndTime &&
      now > activePoll.timerEndTime
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

    let updatedVotes;
    if (existingVoteIndex >= 0) {
      // Overwrite existing vote
      updatedVotes = [...activePoll.votes];
      updatedVotes[existingVoteIndex] = {
        name,
        value,
        avatar: avatar || updatedVotes[existingVoteIndex].avatar,
      };
    } else {
      // Add new vote
      updatedVotes = [...activePoll.votes, { name, value, avatar: avatar || null }];
    }

    // Update poll in database
    await polls.updateOne(
      { id: activePoll.id },
      { $set: { votes: updatedVotes } }
    );

    const updatedPoll = { ...activePoll, votes: updatedVotes };

    res.json({ success: true, poll: updatedPoll });
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
}


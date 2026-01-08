import { connectToDatabase, getActivePoll } from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, options, createdBy } = req.body;

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
    const polls = db.collection('polls');

    // Delete all existing polls (only one poll at a time)
    await polls.deleteMany({});

    // Create new poll
    const newPoll = {
      id: Date.now().toString(),
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

    res.json({ success: true, poll: newPoll });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
}


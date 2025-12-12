import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'polling-app';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI);

  const db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function getActivePoll(db) {
  const polls = db.collection('polls');
  // Only one active poll at a time - get the most recent open poll, or most recent closed if no open
  let activePoll = await polls.findOne(
    { status: 'open' },
    { sort: { createdAt: -1 } }
  );
  
  if (!activePoll) {
    activePoll = await polls.findOne(
      {},
      { sort: { createdAt: -1 } }
    );
  }
  
  return activePoll;
}


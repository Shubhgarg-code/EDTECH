import mongoose from 'mongoose';
import { ENV } from './env.js';

let mongodInstance = null;

export const connectDB = async () => {
  const isProduction = ENV.NODE_ENV === 'production';

  // 1. Production Mode: MONGODB_URI is strictly required
  if (isProduction) {
    if (!ENV.MONGODB_URI || ENV.MONGODB_URI.trim() === '') {
      throw new Error(
        'FATAL PRODUCTION CONFIGURATION ERROR: MONGODB_URI is required in production mode. ' +
        'In-memory MongoDB is strictly disabled in production to guarantee data persistence. ' +
        'Please set MONGODB_URI in your production environment variables (e.g. Render Dashboard).'
      );
    }

    console.log('Connecting to production MongoDB instance...');
    await mongoose.connect(ENV.MONGODB_URI);
    console.log('✅ Connected to production MongoDB successfully.');
    return;
  }

  // 2. Development Mode: Use URI if provided, otherwise fallback to in-memory MongoDB
  try {
    if (ENV.MONGODB_URI && ENV.MONGODB_URI.trim() !== '') {
      console.log(`Connecting to specified MongoDB URI: ${ENV.MONGODB_URI}`);
      await mongoose.connect(ENV.MONGODB_URI);
      console.log('MongoDB connected successfully via URI.');
      return;
    }

    console.log('No external MONGODB_URI found. Initializing portable in-memory MongoDB engine for development...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create();
    const uri = mongodInstance.getUri();
    console.log(`In-memory MongoDB started at: ${uri}`);

    await mongoose.connect(uri);
    console.log('Connected to portable MongoDB successfully.');
  } catch (error) {
    console.error('Initial MongoDB connection error:', error.message);
    try {
      console.log('Attempting fallback to local MongoMemoryServer...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const uri = mongodInstance.getUri();
      await mongoose.connect(uri);
      console.log(`Fallback in-memory MongoDB connected at: ${uri}`);
    } catch (fallbackErr) {
      console.error('Critical database connection failure:', fallbackErr.message);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (err) {
    console.error('Error during DB shutdown:', err);
  }
};


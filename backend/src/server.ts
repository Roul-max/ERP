import app from './app';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import * as dns from 'node:dns';
import logger from './config/logger';
import User from './models/User';

dotenv.config();

const PORT = process.env.PORT || 5000;
if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

const DEFAULT_DB_NAME = (process.env.MONGO_DB_NAME || 'university_db').trim();
const ensureDbInMongoUri = (uri: string, dbName: string) => {
  const trimmed = uri.trim();
  if (!trimmed.startsWith('mongodb://') && !trimmed.startsWith('mongodb+srv://')) {
    return trimmed;
  }

  // Already has an explicit path like /mydb
  if (/^mongodb(\+srv)?:\/\/[^/]+\/[^?]+/.test(trimmed)) return trimmed;

  // Insert DB name before query string or at end
  const withSlashQuery = trimmed.replace(
    /^(mongodb(\+srv)?:\/\/[^/]+)\/\?/,
    `$1/${dbName}?`
  );
  if (withSlashQuery !== trimmed) return withSlashQuery;

  const withQuery = trimmed.replace(
    /^(mongodb(\+srv)?:\/\/[^/]+)\?/,
    `$1/${dbName}?`
  );
  if (withQuery !== trimmed) return withQuery;

  return `${trimmed}/${dbName}`;
};

const MONGO_URI = ensureDbInMongoUri(process.env.MONGO_URI, DEFAULT_DB_NAME);
const DNS_SERVERS = (process.env.DNS_SERVERS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (DNS_SERVERS.length > 0) {
  dns.setServers(DNS_SERVERS);
  logger.info(`DNS servers set for this process: ${DNS_SERVERS.join(', ')}`);
}

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB');
    logger.info(
      `MongoDB DB: ${mongoose.connection.host}/${mongoose.connection.name}`
    );

    // Seed Admin User if not exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@university.com',
        password: 'admin123', // Will be hashed by pre-save hook
        role: 'admin',
        isActive: true
      });
      logger.info('Admin user seeded: admin@university.com / admin123');
    }

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);

    if (
      message.includes('ECONNREFUSED') &&
      (message.includes('127.0.0.1:27017') || message.includes('localhost:27017'))
    ) {
      logger.error(
        'MongoDB connection refused on 127.0.0.1:27017. Start MongoDB locally (Docker or service) or set MONGO_URI to your Atlas connection string.'
      );
    }
    if (
      message.toLowerCase().includes('authentication failed') ||
      message.toLowerCase().includes('bad auth')
    ) {
      logger.error(
        'MongoDB authentication failed. Verify the username/password in MONGO_URI, ensure the Atlas DB user exists with proper roles, and if the password has special characters, URL-encode it and wrap MONGO_URI in quotes in your .env.'
      );
    }
    logger.error('Failed to start server:', error);
    (process as any).exit(1);
  }
};

startServer();

import { config } from 'dotenv';

// Initializing dotenv based on NODE_ENV
const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : process.env.NODE_ENV === 'test'
      ? '.env.test'
      : '.env';

config({ path: envFile });

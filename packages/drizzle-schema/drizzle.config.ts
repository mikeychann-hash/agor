/**
 * Drizzle Kit Configuration
 *
 * Configuration for Drizzle Kit CLI tools (migrations, studio, etc.)
 */

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  // Schema files
  schema: './src/schema.ts',

  // Output directory for generated migrations
  out: './migrations',

  // Database driver
  dialect: 'sqlite',

  // Driver configuration
  driver: 'turso',

  // Database URL (can be overridden via env var)
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'file:~/.agor/sessions.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  },

  // Generate verbose output
  verbose: true,

  // Strict mode (error on schema mismatches)
  strict: true,
});

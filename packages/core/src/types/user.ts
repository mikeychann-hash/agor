import type { UserID } from './id';

/**
 * User type - Authentication and authorization
 */
export interface User {
  user_id: UserID;
  email: string;
  name?: string;
  emoji?: string; // User emoji for visual identity (like boards)
  role: 'owner' | 'admin' | 'member' | 'viewer';
  avatar?: string;
  preferences?: Record<string, unknown>;
  created_at: Date;
  updated_at?: Date;
}

/**
 * Create user input (password required, not stored in User type)
 */
export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
  emoji?: string;
  role?: 'owner' | 'admin' | 'member' | 'viewer';
}

/**
 * Update user input
 */
export interface UpdateUserInput {
  email?: string;
  password?: string;
  name?: string;
  emoji?: string;
  role?: 'owner' | 'admin' | 'member' | 'viewer';
  avatar?: string;
  preferences?: Record<string, unknown>;
}

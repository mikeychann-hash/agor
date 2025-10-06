/**
 * Message Type
 *
 * Represents a single message in a conversation between user and agent.
 * Messages are stored in a normalized table and referenced by tasks via message_range.
 */

import type { MessageID, SessionID, TaskID } from './id';

export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Message type (from Claude transcript)
 * Distinguishes conversation messages from meta/snapshot messages
 */
export type MessageType = 'user' | 'assistant' | 'system' | 'file-history-snapshot';

/**
 * Content block (for multi-modal messages)
 */
export interface ContentBlock {
  type: 'text' | 'image' | 'tool_use' | 'tool_result';
  [key: string]: unknown; // Additional type-specific fields
}

/**
 * Tool use in a message
 */
export interface ToolUse {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

/**
 * Message
 *
 * Represents a single turn in the conversation.
 */
export interface Message {
  /** Unique message identifier (UUIDv7) */
  message_id: MessageID;

  /** Session this message belongs to */
  session_id: SessionID;

  /** Task this message belongs to (optional - messages may exist before task assignment) */
  task_id?: TaskID;

  /** Message type (from transcript) */
  type: MessageType;

  /** Message role */
  role: MessageRole;

  /** Index in conversation (0-based, used for message_range queries) */
  index: number;

  /** When message was created */
  timestamp: string;

  /** Content preview (first 200 chars for list views) */
  content_preview: string;

  /** Full message content */
  content: string | ContentBlock[];

  /** Tool uses in this message (for assistant messages) */
  tool_uses?: ToolUse[];

  /** Agent-specific metadata */
  metadata?: {
    /** Model used for this message */
    model?: string;

    /** Token counts */
    tokens?: {
      input: number;
      output: number;
    };

    /** Original agent message ID (e.g., Claude's UUID) */
    original_id?: string;

    /** Parent message ID in agent's system */
    parent_id?: string;

    /** Whether this is a meta/synthetic message */
    is_meta?: boolean;

    /** Additional agent-specific fields */
    [key: string]: unknown;
  };
}

/**
 * Message creation input (without generated fields)
 */
export type MessageCreate = Omit<Message, 'message_id'> & {
  message_id?: MessageID;
};

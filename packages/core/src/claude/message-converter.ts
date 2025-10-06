/**
 * Convert Claude transcript messages to Agor Message format
 */

import { generateId } from '@agor/core/db';
import type { Message, MessageID, SessionID } from '@agor/core/types';
import type { TranscriptMessage } from './transcript-parser';

/**
 * Convert a transcript message to an Agor Message
 */
export function transcriptToMessage(
  transcript: TranscriptMessage,
  sessionId: SessionID,
  index: number
): Message {
  // Extract content from message
  const content = transcript.message?.content || '';

  // Generate content preview (first 200 chars)
  const contentPreview =
    typeof content === 'string'
      ? content.substring(0, 200)
      : JSON.stringify(content).substring(0, 200);

  // Determine role (fallback to type if no message.role)
  const role = (transcript.message?.role || transcript.type) as Message['role'];

  return {
    message_id: generateId() as MessageID,
    session_id: sessionId,
    type: transcript.type,
    role,
    index,
    timestamp: transcript.timestamp || new Date().toISOString(),
    content_preview: contentPreview,
    content: content as Message['content'],
    metadata: {
      original_id: transcript.uuid,
      parent_id: transcript.parentUuid || undefined,
      is_meta: transcript.isMeta,
    },
  };
}

/**
 * Convert array of transcript messages to Agor Messages
 */
export function transcriptsToMessages(
  transcripts: TranscriptMessage[],
  sessionId: SessionID
): Message[] {
  return transcripts.map((transcript, index) => transcriptToMessage(transcript, sessionId, index));
}

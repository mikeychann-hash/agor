#!/usr/bin/env tsx
/**
 * Test script: Load Claude Code session and parse transcript
 *
 * Usage: tsx scripts/test-load-session.ts <session-id>
 */

import { filterConversationMessages, loadClaudeSession } from '../packages/core/src/claude/index';

async function testLoadSession(sessionId: string): Promise<void> {
  console.log(`\n🔄 Loading Claude Code session: ${sessionId}\n`);

  try {
    const session = await loadClaudeSession(sessionId);

    console.log(`✅ Loaded session successfully!\n`);
    console.log(`Session ID: ${session.sessionId}`);
    console.log(`Transcript: ${session.transcriptPath}`);
    console.log(`CWD: ${session.cwd}`);
    console.log(`Total messages: ${session.messages.length}\n`);

    // Filter to just conversation messages
    const conversation = filterConversationMessages(session.messages);
    console.log(`Conversation messages: ${conversation.length}`);

    // Count message types
    const typeCounts = conversation.reduce(
      (acc, msg) => {
        acc[msg.type] = (acc[msg.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log('\nMessage type breakdown:');
    console.log(typeCounts);

    // Show first 3 conversation messages
    console.log('\nFirst 3 conversation messages:');
    for (const msg of conversation.slice(0, 3)) {
      console.log(`\n[${msg.type}] ${msg.uuid}`);
      if (msg.message?.content) {
        const content =
          typeof msg.message.content === 'string'
            ? msg.message.content
            : JSON.stringify(msg.message.content).substring(0, 100);
        console.log(`  ${content.substring(0, 80)}...`);
      }
    }

    console.log(`\n✅ Test passed!`);
  } catch (error) {
    console.error('\n❌ Error loading session:');
    console.error(error);
    process.exit(1);
  }
}

// Get session ID from command line
const sessionId = process.argv[2];

if (!sessionId) {
  console.error('Usage: tsx scripts/test-load-session.ts <session-id>');
  process.exit(1);
}

testLoadSession(sessionId).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

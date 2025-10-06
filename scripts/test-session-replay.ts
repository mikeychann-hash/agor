#!/usr/bin/env tsx
/**
 * Test script: Verify Claude Agent SDK can replay session history
 *
 * Usage: tsx scripts/test-session-replay.ts <session-id>
 */

import { query, type SDKMessage } from '@anthropic-ai/claude-agent-sdk';

async function replaySession(sessionId: string): Promise<void> {
  console.log(`\n🔄 Replaying session: ${sessionId}\n`);

  const messages: SDKMessage[] = [];

  try {
    // Resume session with empty prompt and maxTurns=0 to just replay history
    const sessionQuery = query({
      prompt: '', // Empty prompt - we just want to replay
      options: {
        resume: sessionId,
        maxTurns: 0, // Don't execute new turns, just replay
      },
    });

    let messageCount = 0;

    // Iterate through all messages (including historical replays)
    for await (const message of sessionQuery) {
      messageCount++;
      messages.push(message);

      // Log message type and basic info
      console.log(`[${messageCount}] Type: ${message.type}`);

      if (message.type === 'system' && message.subtype === 'init') {
        console.log(`  ↳ Model: ${message.model}`);
        console.log(`  ↳ CWD: ${message.cwd}`);
        console.log(`  ↳ Tools: ${message.tools.length}`);
      } else if (message.type === 'user') {
        const content = message.message.content;
        const text = Array.isArray(content)
          ? content.find((c) => c.type === 'text')?.text
          : typeof content === 'string'
            ? content
            : '';
        console.log(`  ↳ User: ${text?.substring(0, 80)}...`);
        console.log(`  ↳ isReplay: ${'isReplay' in message ? message.isReplay : 'N/A'}`);
      } else if (message.type === 'assistant') {
        const content = message.message.content;
        const textBlocks = content.filter((c) => c.type === 'text');
        const toolUses = content.filter((c) => c.type === 'tool_use');
        console.log(`  ↳ Text blocks: ${textBlocks.length}`);
        console.log(`  ↳ Tool uses: ${toolUses.length}`);
      } else if (message.type === 'result') {
        console.log(`  ↳ Subtype: ${message.subtype}`);
        if (message.subtype === 'success') {
          console.log(`  ↳ Result: ${message.result?.substring(0, 80)}...`);
        }
        console.log(`  ↳ Turns: ${message.num_turns}`);
        console.log(`  ↳ Duration: ${message.duration_ms}ms`);
      }

      console.log('');

      // Stop when we hit the result message (end of session)
      if (message.type === 'result') {
        break;
      }
    }

    console.log(`\n✅ Successfully replayed ${messageCount} messages\n`);
    console.log('Message type summary:');
    const summary = messages.reduce(
      (acc, msg) => {
        acc[msg.type] = (acc[msg.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    console.log(summary);
  } catch (error) {
    console.error('\n❌ Error replaying session:');
    console.error(error);
    process.exit(1);
  }
}

// Get session ID from command line
const sessionId = process.argv[2];

if (!sessionId) {
  console.error('Usage: tsx scripts/test-session-replay.ts <session-id>');
  process.exit(1);
}

replaySession(sessionId).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

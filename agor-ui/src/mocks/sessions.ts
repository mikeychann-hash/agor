// src/mocks/sessions.ts
import { Session } from '../types';

export const mockSessionA: Session = {
  session_id: 'abc123',
  agent: 'claude-code',
  agent_version: '1.2.3',
  status: 'running',
  description: 'Build authentication system',
  created_at: '2025-10-01T10:00:00Z',
  last_updated: '2025-10-01T10:30:00Z',
  git_state: {
    ref: 'feature/auth',
    base_sha: 'a4f2e91',
    current_sha: 'b3e4d12-dirty',
  },
  worktree: {
    path: '../my-project-auth',
    managed_by_agor: true,
  },
  concepts: ['auth', 'security', 'api-design'],
  genealogy: {
    children: ['def456', 'ghi789'],
  },
  tasks: ['task-001', 'task-002', 'task-005'],
  message_count: 37,
  tool_use_count: 145,
};

// Fork example
export const mockSessionB: Session = {
  session_id: 'def456',
  agent: 'claude-code',
  agent_version: '1.2.3',
  status: 'idle',
  description: 'Try OAuth 2.0 instead',
  created_at: '2025-10-01T10:20:00Z',
  last_updated: '2025-10-01T10:35:00Z',
  git_state: {
    ref: 'feature/oauth',
    base_sha: 'a4f2e91',
    current_sha: 'c5f6e23',
  },
  worktree: {
    path: '../my-project-oauth',
    managed_by_agor: true,
  },
  concepts: ['auth', 'security', 'api-design'],
  genealogy: {
    forked_from_session_id: 'abc123',
    fork_point_task_id: 'task-001',
    children: [],
  },
  tasks: ['task-003'],
  message_count: 15,
  tool_use_count: 56,
};

// Spawn example
export const mockSessionC: Session = {
  session_id: 'ghi789',
  agent: 'gemini',
  agent_version: '2.0',
  status: 'completed',
  description: 'Design user database schema',
  created_at: '2025-10-01T10:18:00Z',
  last_updated: '2025-10-01T10:28:00Z',
  git_state: {
    ref: 'feature/auth',
    base_sha: 'b3e4d12',
    current_sha: 'd7g8h34',
  },
  concepts: ['database', 'security'],
  genealogy: {
    parent_session_id: 'abc123',
    spawn_point_task_id: 'task-002',
    children: [],
  },
  tasks: ['task-004'],
  message_count: 10,
  tool_use_count: 42,
};

// Full session tree
export const mockSessionTree: Session[] = [
  mockSessionA,
  mockSessionB,
  mockSessionC,
];

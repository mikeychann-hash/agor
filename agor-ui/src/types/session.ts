// src/types/session.ts
export type SessionStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface Session {
  session_id: string;
  agent: 'claude-code' | 'cursor' | 'codex' | 'gemini';
  agent_version?: string;
  status: SessionStatus;
  created_at: string;
  last_updated: string;

  // Git state
  git_state: {
    ref: string;
    base_sha: string;
    current_sha: string;
  };

  // Worktree (optional)
  worktree?: {
    path: string;
    managed_by_agor: boolean;
  };

  // Context
  concepts: string[];

  // Genealogy
  genealogy: {
    forked_from_session_id?: string;
    fork_point_task_id?: string;
    parent_session_id?: string;
    spawn_point_task_id?: string;
    children: string[];
  };

  // Tasks
  tasks: string[];
  message_count: number;
  tool_use_count: number;

  // UI metadata
  description?: string;
}

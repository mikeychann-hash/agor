// src/types/task.ts
export type TaskStatus = 'created' | 'running' | 'completed' | 'failed';

export interface Task {
  task_id: string;
  session_id: string;
  full_prompt: string; // Original user prompt (can be multi-line)
  description?: string; // Optional: LLM-generated short summary
  status: TaskStatus;

  // Message range
  message_range: {
    start_index: number;
    end_index: number;
    start_timestamp: string;
    end_timestamp?: string;
  };

  // Tool usage
  tool_use_count: number;

  // Git state
  git_state: {
    sha_at_start: string;
    sha_at_end?: string;
    commit_message?: string;
  };

  // Model
  model: string;

  // Report
  report?: {
    template: string;
    path: string;
    generated_at: string;
  };

  created_at: string;
  completed_at?: string;
}

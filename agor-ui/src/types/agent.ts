// src/types/agent.ts
export type AgentName = 'claude-code' | 'cursor' | 'codex' | 'gemini';

export interface Agent {
  id: string;
  name: AgentName;
  icon: string;
  installed: boolean;
  version?: string;
  description?: string;
  installable: boolean;
}

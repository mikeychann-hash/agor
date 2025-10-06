import type { Meta, StoryObj } from '@storybook/react';
import { ConfigProvider, Space, theme } from 'antd';
import { mockAgentClaudecode, mockAgentCodex, mockAgentCursor, mockAgentGemini } from '../../mocks';
import { AgentSelectionCard } from './AgentSelectionCard';

const meta = {
  title: 'Components/AgentSelectionCard',
  component: AgentSelectionCard,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        <div style={{ maxWidth: 500 }}>
          <Story />
        </div>
      </ConfigProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof AgentSelectionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ClaudeCodeInstalled: Story = {
  args: {
    agent: mockAgentClaudecode,
    onClick: () => console.log('Selected Claude Code'),
  },
};

export const ClaudeCodeSelected: Story = {
  args: {
    agent: mockAgentClaudecode,
    selected: true,
    onClick: () => console.log('Selected Claude Code'),
  },
};

export const CodexInstalled: Story = {
  args: {
    agent: mockAgentCodex,
    onClick: () => console.log('Selected Codex'),
  },
};

export const CursorNotInstalled: Story = {
  args: {
    agent: mockAgentCursor,
    onClick: () => console.log('Selected Cursor'),
    onInstall: () => alert('Installing Cursor...'),
  },
};

export const CursorNotInstalledSelected: Story = {
  args: {
    agent: mockAgentCursor,
    selected: true,
    onClick: () => console.log('Selected Cursor'),
    onInstall: () => alert('Installing Cursor...'),
  },
};

export const GeminiNotInstalled: Story = {
  args: {
    agent: mockAgentGemini,
    onClick: () => console.log('Selected Gemini'),
    onInstall: () => alert('Installing Gemini...'),
  },
};

export const AllAgents: Story = {
  decorators: [
    (_Story) => (
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        <Space direction="vertical" style={{ width: '100%', maxWidth: 500 }} size="middle">
          <AgentSelectionCard
            agent={mockAgentClaudecode}
            selected={true}
            onClick={() => console.log('Selected Claude Code')}
          />
          <AgentSelectionCard
            agent={mockAgentCodex}
            onClick={() => console.log('Selected Codex')}
          />
          <AgentSelectionCard
            agent={mockAgentCursor}
            onClick={() => console.log('Selected Cursor')}
            onInstall={() => alert('Installing Cursor...')}
          />
          <AgentSelectionCard
            agent={mockAgentGemini}
            onClick={() => console.log('Selected Gemini')}
            onInstall={() => alert('Installing Gemini...')}
          />
        </Space>
      </ConfigProvider>
    ),
  ],
  args: {},
};

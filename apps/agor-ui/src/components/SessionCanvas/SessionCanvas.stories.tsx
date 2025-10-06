import type { Meta, StoryObj } from '@storybook/react';
import { theme } from 'antd';
import { mockSessionTree } from '../../mocks/sessions';
import { mockTasksBySession } from '../../mocks/tasks';
import SessionCanvas from './SessionCanvas';

// Wrapper with background color to make cards pop
const CanvasWrapper = ({ children }: { children: React.ReactNode }) => {
  const { token } = theme.useToken();
  return (
    <div
      style={{
        backgroundColor: token.colorBgLayout,
        width: '100%',
        height: '100vh',
      }}
    >
      {children}
    </div>
  );
};

const meta = {
  title: 'Components/SessionCanvas',
  component: SessionCanvas,
  decorators: [
    (Story) => (
      <CanvasWrapper>
        <Story />
      </CanvasWrapper>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SessionCanvas>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicTree: Story = {
  args: {
    sessions: mockSessionTree,
    tasks: mockTasksBySession,
  },
};

export const SingleSession: Story = {
  args: {
    sessions: [mockSessionTree[0]],
    tasks: mockTasksBySession,
  },
};

export const Interactive: Story = {
  args: {
    sessions: mockSessionTree,
    tasks: mockTasksBySession,
    onSessionSelect: (sessionId: string) => console.log('Session selected:', sessionId),
    onTaskSelect: (taskId: string) => console.log('Task selected:', taskId),
  },
};

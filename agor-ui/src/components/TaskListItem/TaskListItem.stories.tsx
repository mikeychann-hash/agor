import type { Meta, StoryObj } from '@storybook/react';
import TaskListItem from './TaskListItem';
import { mockTask001, mockTask002, mockTask004, mockTask005, mockTaskLongPrompt, mockTaskWithSummary001 } from '../../mocks/tasks';

const meta = {
  title: 'Components/TaskListItem',
  component: TaskListItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TaskListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Completed: Story = {
  args: {
    task: mockTask001,
  },
};

export const Running: Story = {
  args: {
    task: mockTask002,
  },
};

export const Pending: Story = {
  args: {
    task: mockTask005,
  },
};

export const WithReport: Story = {
  args: {
    task: mockTask004,
  },
};

export const Compact: Story = {
  args: {
    task: mockTask001,
    compact: true,
  },
};

export const Interactive: Story = {
  args: {
    task: mockTask001,
    onClick: () => alert('Task clicked!'),
  },
};

export const LongPrompt: Story = {
  args: {
    task: mockTaskLongPrompt,
  },
};

export const LongPromptCompact: Story = {
  args: {
    task: mockTaskLongPrompt,
    compact: true,
  },
};

export const WithAISummary: Story = {
  args: {
    task: mockTaskWithSummary001,
  },
};

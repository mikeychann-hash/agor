import type { Meta, StoryObj } from '@storybook/react';
import { AppHeader } from './AppHeader';
import { ConfigProvider, theme } from 'antd';

const meta = {
  title: 'Components/AppHeader',
  component: AppHeader,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        <Story />
      </ConfigProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onMenuClick: () => console.log('Menu clicked'),
    onSettingsClick: () => console.log('Settings clicked'),
  },
};

export const WithActions: Story = {
  args: {
    onMenuClick: () => alert('Menu clicked'),
    onSettingsClick: () => alert('Settings clicked'),
  },
};

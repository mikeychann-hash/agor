import { Card, Typography, Space, Button, Badge, Tag } from 'antd';
import { DownloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Agent } from '../../types';

const { Text } = Typography;

export interface AgentSelectionCardProps {
  agent: Agent;
  selected?: boolean;
  onClick?: () => void;
  onInstall?: () => void;
}

export const AgentSelectionCard: React.FC<AgentSelectionCardProps> = ({
  agent,
  selected = false,
  onClick,
  onInstall,
}) => {
  return (
    <Card
      hoverable
      onClick={onClick}
      style={{
        borderColor: selected ? '#1890ff' : undefined,
        borderWidth: selected ? 2 : 1,
        cursor: 'pointer',
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Text style={{ fontSize: '20px' }}>{agent.icon}</Text>
            <Text strong>{agent.name}</Text>
            {agent.installed && (
              <Tag icon={<CheckCircleOutlined />} color="success">
                Installed
              </Tag>
            )}
          </Space>
          {!agent.installed && agent.installable && (
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onInstall?.();
              }}
            >
              Install
            </Button>
          )}
        </Space>

        {agent.version && (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Version: {agent.version}
          </Text>
        )}

        {agent.description && (
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {agent.description}
          </Text>
        )}
      </Space>
    </Card>
  );
};

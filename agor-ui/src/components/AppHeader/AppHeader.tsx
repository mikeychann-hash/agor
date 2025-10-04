import { Layout, Typography, Space, Button } from 'antd';
import { MenuOutlined, SettingOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

export interface AppHeaderProps {
  onMenuClick?: () => void;
  onSettingsClick?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onMenuClick, onSettingsClick }) => {
  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#001529',
      }}
    >
      <Space>
        <Title level={3} style={{ margin: 0, color: '#fff' }}>
          Agor
        </Title>
      </Space>

      <Space>
        <Button type="text" icon={<MenuOutlined />} onClick={onMenuClick} style={{ color: '#fff' }} />
        <Button
          type="text"
          icon={<SettingOutlined />}
          onClick={onSettingsClick}
          style={{ color: '#fff' }}
        />
      </Space>
    </Header>
  );
};

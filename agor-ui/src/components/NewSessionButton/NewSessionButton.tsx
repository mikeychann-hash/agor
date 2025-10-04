import { FloatButton } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export interface NewSessionButtonProps {
  onClick?: () => void;
}

export const NewSessionButton: React.FC<NewSessionButtonProps> = ({ onClick }) => {
  return (
    <FloatButton
      icon={<PlusOutlined />}
      type="primary"
      onClick={onClick}
      tooltip="Create new session"
      style={{ right: 24, top: 80 }}
    />
  );
};

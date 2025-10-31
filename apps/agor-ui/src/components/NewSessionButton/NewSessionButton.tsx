import { PlusOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';

export interface NewSessionButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

export const NewSessionButton: React.FC<NewSessionButtonProps> = ({ onClick, disabled }) => {
  const tooltip = disabled ? 'Create a repository first' : 'Create new worktree';

  return (
    <FloatButton
      icon={<PlusOutlined />}
      type="primary"
      onClick={onClick}
      disabled={disabled}
      tooltip={tooltip}
      style={{ right: 24, top: 80 }}
    />
  );
};

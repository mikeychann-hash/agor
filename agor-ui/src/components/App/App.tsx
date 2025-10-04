import { useState } from 'react';
import { Layout } from 'antd';
import { AppHeader } from '../AppHeader';
import { SessionCanvas } from '../SessionCanvas';
import { NewSessionButton } from '../NewSessionButton';
import { NewSessionModal, NewSessionConfig } from '../NewSessionModal';
import SessionDrawer from '../SessionDrawer';
import { Session, Task, Agent } from '../../types';

const { Content } = Layout;

export interface AppProps {
  sessions: Session[];
  tasks: Record<string, Task[]>;
  availableAgents: Agent[];
  onCreateSession?: (config: NewSessionConfig) => void;
  onMenuClick?: () => void;
  onSettingsClick?: () => void;
}

export const App: React.FC<AppProps> = ({
  sessions,
  tasks,
  availableAgents,
  onCreateSession,
  onMenuClick,
  onSettingsClick,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const handleCreateSession = (config: NewSessionConfig) => {
    console.log('Creating session with config:', config);
    onCreateSession?.(config);
    setModalOpen(false);
  };

  const handleSessionClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const selectedSession = sessions.find((s) => s.session_id === selectedSessionId) || null;
  const selectedSessionTasks = selectedSessionId ? tasks[selectedSessionId] || [] : [];

  return (
    <Layout style={{ height: '100vh' }}>
      <AppHeader onMenuClick={onMenuClick} onSettingsClick={onSettingsClick} />
      <Content style={{ position: 'relative', overflow: 'hidden' }}>
        <SessionCanvas
          sessions={sessions}
          tasks={tasks}
          onSessionClick={handleSessionClick}
        />
        <NewSessionButton onClick={() => setModalOpen(true)} />
      </Content>
      <NewSessionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateSession}
        availableAgents={availableAgents}
      />
      <SessionDrawer
        session={selectedSession}
        tasks={selectedSessionTasks}
        open={!!selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
      />
    </Layout>
  );
};

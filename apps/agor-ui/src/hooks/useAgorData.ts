/**
 * React hook for fetching and subscribing to Agor data
 *
 * Manages sessions, tasks, boards with real-time WebSocket updates
 */

import type { AgorClient } from '@agor/core/api';
import type { Board, Session, Task } from '@agor/core/types';
import { useCallback, useEffect, useState } from 'react';

interface UseAgorDataResult {
  sessions: Session[];
  tasks: Record<string, Task[]>;
  boards: Board[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Fetch and subscribe to Agor data from daemon
 *
 * @param client - Agor client instance
 * @returns Sessions, tasks (grouped by session), boards, loading state, and refetch function
 */
export function useAgorData(client: AgorClient | null): UseAgorDataResult {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!client) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch sessions, tasks, boards in parallel
      const [sessionsResult, tasksResult, boardsResult] = await Promise.all([
        client.service('sessions').find(),
        client.service('tasks').find(),
        client.service('boards').find(),
      ]);

      // Handle paginated vs array results
      const sessionsList = Array.isArray(sessionsResult) ? sessionsResult : sessionsResult.data;
      const tasksList = Array.isArray(tasksResult) ? tasksResult : tasksResult.data;
      const boardsList = Array.isArray(boardsResult) ? boardsResult : boardsResult.data;

      setSessions(sessionsList);

      // Group tasks by session_id
      const tasksMap: Record<string, Task[]> = {};
      for (const task of tasksList) {
        if (!tasksMap[task.session_id]) {
          tasksMap[task.session_id] = [];
        }
        tasksMap[task.session_id].push(task);
      }
      setTasks(tasksMap);

      setBoards(boardsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [client]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!client) return;

    // Initial fetch
    fetchData();

    // Subscribe to session events
    const sessionsService = client.service('sessions');
    const handleSessionCreated = (session: Session) => {
      setSessions((prev) => [...prev, session]);
    };
    const handleSessionPatched = (session: Session) => {
      setSessions((prev) => prev.map((s) => (s.session_id === session.session_id ? session : s)));
    };
    const handleSessionRemoved = (session: Session) => {
      setSessions((prev) => prev.filter((s) => s.session_id !== session.session_id));
    };

    sessionsService.on('created', handleSessionCreated);
    sessionsService.on('patched', handleSessionPatched);
    sessionsService.on('updated', handleSessionPatched);
    sessionsService.on('removed', handleSessionRemoved);

    // Subscribe to task events
    const tasksService = client.service('tasks');
    const handleTaskCreated = (task: Task) => {
      setTasks((prev) => ({
        ...prev,
        [task.session_id]: [...(prev[task.session_id] || []), task],
      }));
    };
    const handleTaskPatched = (task: Task) => {
      setTasks((prev) => ({
        ...prev,
        [task.session_id]: (prev[task.session_id] || []).map((t) =>
          t.task_id === task.task_id ? task : t
        ),
      }));
    };
    const handleTaskRemoved = (task: Task) => {
      setTasks((prev) => ({
        ...prev,
        [task.session_id]: (prev[task.session_id] || []).filter((t) => t.task_id !== task.task_id),
      }));
    };

    tasksService.on('created', handleTaskCreated);
    tasksService.on('patched', handleTaskPatched);
    tasksService.on('updated', handleTaskPatched);
    tasksService.on('removed', handleTaskRemoved);

    // Subscribe to board events
    const boardsService = client.service('boards');
    const handleBoardCreated = (board: Board) => {
      setBoards((prev) => [...prev, board]);
    };
    const handleBoardPatched = (board: Board) => {
      setBoards((prev) => prev.map((b) => (b.board_id === board.board_id ? board : b)));
    };
    const handleBoardRemoved = (board: Board) => {
      setBoards((prev) => prev.filter((b) => b.board_id !== board.board_id));
    };

    boardsService.on('created', handleBoardCreated);
    boardsService.on('patched', handleBoardPatched);
    boardsService.on('updated', handleBoardPatched);
    boardsService.on('removed', handleBoardRemoved);

    // Cleanup listeners on unmount
    return () => {
      sessionsService.removeListener('created', handleSessionCreated);
      sessionsService.removeListener('patched', handleSessionPatched);
      sessionsService.removeListener('updated', handleSessionPatched);
      sessionsService.removeListener('removed', handleSessionRemoved);

      tasksService.removeListener('created', handleTaskCreated);
      tasksService.removeListener('patched', handleTaskPatched);
      tasksService.removeListener('updated', handleTaskPatched);
      tasksService.removeListener('removed', handleTaskRemoved);

      boardsService.removeListener('created', handleBoardCreated);
      boardsService.removeListener('patched', handleBoardPatched);
      boardsService.removeListener('updated', handleBoardPatched);
      boardsService.removeListener('removed', handleBoardRemoved);
    };
  }, [client, fetchData]);

  return {
    sessions,
    tasks,
    boards,
    loading,
    error,
    refetch: fetchData,
  };
}

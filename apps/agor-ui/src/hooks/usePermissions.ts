/**
 * usePermissions Hook
 *
 * Listens for permission requests from the daemon via WebSocket
 * and provides a method to send permission decisions back.
 */

import type { AgorClient } from '@agor/core/api';
import type { PermissionDecision, PermissionRequest } from '@agor/core/permissions';
import { PermissionScope } from '@agor/core/types';
import { useEffect, useState } from 'react';
import { getDaemonUrl } from '../config/daemon';

export function usePermissions(client: AgorClient | null) {
  const [pendingRequest, setPendingRequest] = useState<PermissionRequest | null>(null);

  useEffect(() => {
    if (!client) return;

    const handleRequest = (request: PermissionRequest) => {
      console.log('🛡️ Permission request received:', request);
      setPendingRequest(request);
    };

    // Listen for permission requests on sessions service
    // biome-ignore lint/suspicious/noExplicitAny: Socket event listener type mismatch
    (client.service('sessions') as any).on('permission:request', handleRequest);

    return () => {
      // biome-ignore lint/suspicious/noExplicitAny: Socket event listener type mismatch
      (client.service('sessions') as any).off('permission:request', handleRequest);
    };
  }, [client]);

  const sendDecision = async (allow: boolean, remember: boolean, scope: PermissionScope) => {
    if (!pendingRequest || !client) return;

    const decision: PermissionDecision = {
      requestId: pendingRequest.requestId,
      taskId: pendingRequest.taskId,
      decidedBy: 'user',
      allow,
      remember,
      scope,
      reason: allow ? undefined : 'User denied permission',
    };

    console.log('🛡️ Sending permission decision:', decision);

    // Send decision via custom endpoint
    // Note: We can't use the standard service methods here since this is a custom route
    await fetch(`${getDaemonUrl()}/sessions/${pendingRequest.sessionId}/permission-decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(decision),
    });

    setPendingRequest(null);
  };

  const cancelRequest = () => {
    if (pendingRequest) {
      sendDecision(false, false, PermissionScope.ONCE);
    }
  };

  return { pendingRequest, sendDecision, cancelRequest };
}

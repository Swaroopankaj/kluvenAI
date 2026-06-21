import { useCallback, useState } from 'react';

export type FlowConnectionState = 'idle' | 'connecting' | 'connected' | 'error' | 'completed';

interface FlowConnectionInfo {
  state: FlowConnectionState;
  abortController: AbortController | null;
  error?: string;
}

const connections = new Map<string, FlowConnectionInfo>();

export const flowConnectionManager = {
  getConnection: (flowId: string) => connections.get(flowId) || { state: 'idle' as const, abortController: null },
  setConnection: (flowId: string, info: Partial<FlowConnectionInfo>) => {
    connections.set(flowId, { ...flowConnectionManager.getConnection(flowId), ...info });
  },
  removeConnection: (flowId: string) => connections.delete(flowId),
  cleanupCompleted: () => {
    for (const [flowId, info] of connections) {
      if (info.state === 'completed') connections.delete(flowId);
    }
  },
};

export function useFlowConnectionState(flowId: string): { state: FlowConnectionState } {
  const info = flowConnectionManager.getConnection(flowId);
  return { state: info.state };
}

export function useFlowConnection(_flowId: string | null) {
  const [connection] = useState<FlowConnectionInfo>({ state: 'idle', abortController: null });

  const runFlow = useCallback(async (_params: any) => {}, []);
  const runBacktest = useCallback(async (_params: any) => {}, []);
  const stopFlow = useCallback(() => {}, []);
  const recoverFlowState = useCallback(async () => {}, []);

  return {
    isConnecting: connection.state === 'connecting',
    isConnected: connection.state === 'connected',
    isProcessing: connection.state === 'connecting' || connection.state === 'connected',
    canRun: connection.state === 'idle' || connection.state === 'completed',
    hasError: connection.state === 'error',
    error: connection.error,
    runFlow,
    runBacktest,
    stopFlow,
    recoverFlowState,
  };
}

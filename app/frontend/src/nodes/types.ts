import type { BuiltInNode, Node } from '@xyflow/react';

export type AppNode = BuiltInNode;

export type AdminTaskNode = Node<{
  name: string;
  description: string;
  status: string;
  taskType: 'sambosplit' | 'vablogger' | 'commuter';
}>;

export type VabAgentNode = Node<{
  name: string;
  description: string;
  status: string;
  taskType: 'vabagent';
}>;

export type LlmAgentNode = Node<{
  name: string;
  description: string;
  status: string;
  taskType: 'llmagent';
}>;

export type ExportNode = Node<{
  name: string;
  description: string;
  status: string;
  taskType: string;
  exportType?: 'fk' | 'hr' | 'school';
}>;

export type AdminTaskTypes = AdminTaskNode | VabAgentNode | LlmAgentNode | ExportNode;

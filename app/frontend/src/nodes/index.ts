import { Edge, type Node, type NodeTypes } from '@xyflow/react';
import { AdminTaskComponent } from './components/admin-task-component';
import { VabStartNode } from './components/vab-start-node';
import { VabAgentNode } from './components/vab-agent-node';
import { LlmAgentNode } from './components/llm-agent-node';
import { ExportNode } from './components/export-node';

const generateId = () => Math.random().toString(36).substring(2, 8);

type AdminTaskNode = Node<{
  name: string;
  description: string;
  status: string;
  taskType: 'sambosplit' | 'vablogger' | 'commuter';
}, 'admin-task'>;

export const initialNodes: AdminTaskNode[] = [
  {
    id: `sambosplit_${generateId()}`,
    type: 'admin-task',
    position: { x: 50, y: 100 },
    data: {
      name: 'SamboSplit',
      description: 'Split household bills 50/50 with Swish',
      status: 'Idle',
      taskType: 'sambosplit',
    },
  },
];

export const initialEdges: Edge[] = [];

export const nodeTypes = {
  'admin-task': AdminTaskComponent,
  'vab-start': VabStartNode,
  'vab-agent': VabAgentNode,
  'llm-agent': LlmAgentNode,
  'export-node': ExportNode,
} satisfies NodeTypes;

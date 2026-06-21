import { Node } from '@xyflow/react';

const generateId = () => Math.random().toString(36).substring(2, 8);

type TaskType = 'sambosplit' | 'vablogger' | 'commuter';
type AgentType = 'vabagent' | 'llmagent';
type NodeType = 'admin-task' | 'vab-start' | 'vab-agent' | 'llm-agent' | 'export-node';

interface NodeConfig {
  nodeType: NodeType;
  taskType: TaskType | AgentType;
  name: string;
  description: string;
}

const taskNodeConfigs: Record<string, NodeConfig> = {
  "Upload VAB Doc": {
    nodeType: 'vab-start',
    taskType: 'vablogger',
    name: 'VAB Upload',
    description: 'Upload sick child documentation for processing',
  },
  "SamboSplit": {
    nodeType: 'admin-task',
    taskType: 'sambosplit',
    name: 'SamboSplit',
    description: 'Split household bills 50/50 with Swish',
  },
  "VAB Logger": {
    nodeType: 'admin-task',
    taskType: 'vablogger',
    name: 'VAB Logger',
    description: 'Log sick child leave to HR & Försäkringskassan',
  },
  "Commuter": {
    nodeType: 'admin-task',
    taskType: 'commuter',
    name: 'Commuter',
    description: 'Extract transit receipts for work reimbursement',
  },
  "Monthly Bills": {
    nodeType: 'admin-task',
    taskType: 'sambosplit',
    name: 'Monthly Bills',
    description: 'Process monthly household bills',
  },
  "Sick Leave": {
    nodeType: 'admin-task',
    taskType: 'vablogger',
    name: 'Sick Leave',
    description: 'Log sick leave for your child',
  },
  "Export CSV": {
    nodeType: 'admin-task',
    taskType: 'commuter',
    name: 'Export CSV',
    description: 'Export processed data as CSV',
  },
  "VAB Agent": {
    nodeType: 'vab-agent',
    taskType: 'vabagent',
    name: 'VAB Agent',
    description: 'AI-powered VAB processing agent',
  },
  "LLM Agent": {
    nodeType: 'llm-agent',
    taskType: 'llmagent',
    name: 'LLM Agent',
    description: 'General-purpose LLM agent',
  },
  "FK Export": {
    nodeType: 'export-node',
    taskType: 'vablogger',
    name: 'FK Export',
    description: 'Copy formatted text for Försäkringskassan',
  },
  "HR Export": {
    nodeType: 'export-node',
    taskType: 'vablogger',
    name: 'HR Export',
    description: 'Download employer CSV for HR portal',
  },
  "School Export": {
    nodeType: 'export-node',
    taskType: 'vablogger',
    name: 'School Export',
    description: 'Copy notification for school/daycare',
  },
};

export async function getNodeTypeDefinition(componentName: string): Promise<{ createNode: (pos: { x: number; y: number }) => Node } | null> {
  const cfg = taskNodeConfigs[componentName];
  if (!cfg) return null;

  return {
    createNode: (position) => ({
      id: `${cfg.taskType}_${generateId()}`,
      type: cfg.nodeType,
      position,
      data: {
        name: cfg.name,
        description: cfg.description,
        status: 'Idle',
        taskType: cfg.taskType,
      },
    }) as unknown as Node,
  };
}

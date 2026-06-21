import { Flow } from '@/types/flow';

const STORAGE_KEY = 'kluven_flows';

function loadFlows(): Flow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFlows(flows: Flow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flows));
}

let nextId = (() => {
  const flows = loadFlows();
  return Math.max(0, ...flows.map(f => Number(f.id) || 0)) + 1;
})();

function genId(): number {
  return nextId++;
}

function now(): string {
  return new Date().toISOString();
}

function sanitize(v: any): Flow {
  return {
    id: v.id,
    name: v.name || 'Untitled',
    description: v.description || '',
    nodes: v.nodes ?? [],
    edges: v.edges ?? [],
    viewport: v.viewport ?? { x: 0, y: 0, zoom: 1 },
    data: v.data ?? null,
    is_template: !!v.is_template,
    tags: v.tags ?? [],
    created_at: v.created_at || now(),
    updated_at: v.updated_at || now(),
  };
}

export const flowService = {
  async getFlows(): Promise<Flow[]> {
    return loadFlows();
  },

  async getFlow(id: number): Promise<Flow | null> {
    const flows = loadFlows();
    return flows.find(f => f.id === id) || null;
  },

  async createFlow(data: Partial<Flow> & { name: string }): Promise<Flow> {
    const flows = loadFlows();
    const flow = sanitize({ id: genId(), ...data, created_at: now(), updated_at: now() });
    flows.push(flow);
    saveFlows(flows);
    return flow;
  },

  async updateFlow(id: number, data: Partial<Flow>): Promise<Flow> {
    const flows = loadFlows();
    const idx = flows.findIndex(f => f.id === id);
    if (idx < 0) throw new Error(`Flow ${id} not found`);
    flows[idx] = { ...flows[idx], ...data, id, updated_at: now() };
    saveFlows(flows);
    return flows[idx];
  },

  async deleteFlow(id: number): Promise<void> {
    const flows = loadFlows();
    saveFlows(flows.filter(f => f.id !== id));
  },

  async createDefaultFlow(nodes: any[], edges: any[], viewport: any): Promise<Flow> {
    const flow = sanitize({
      id: genId(),
      name: 'My First Flow',
      description: 'Default flow',
      nodes,
      edges,
      viewport,
    });
    const flows = loadFlows();
    flows.push(flow);
    saveFlows(flows);
    return flow;
  },

  async searchFlows(name: string): Promise<Flow[]> {
    const flows = loadFlows();
    return flows.filter(f => f.name.toLowerCase().includes(name.toLowerCase()));
  },

  async duplicateFlow(id: number): Promise<Flow | null> {
    const flows = loadFlows();
    const source = flows.find(f => f.id === id);
    if (!source) return null;
    const copy = sanitize({ ...source, id: genId(), name: `${source.name} (copy)`, created_at: now(), updated_at: now() });
    flows.push(copy);
    saveFlows(flows);
    return copy;
  },
};

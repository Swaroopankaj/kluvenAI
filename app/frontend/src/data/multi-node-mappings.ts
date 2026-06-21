export interface MultiNodeDefinition {
  name: string;
  nodes: {
    componentName: string;
    offsetX: number;
    offsetY: number;
  }[];
  edges: {
    source: string;
    target: string;
  }[];
}

const multiNodeDefinitions: Record<string, MultiNodeDefinition> = {
  "Sick Leave": {
    name: "Sick Leave",
    nodes: [
      { componentName: "Upload VAB Doc", offsetX: 0, offsetY: 0 },
      { componentName: "VAB Agent", offsetX: 400, offsetY: 0 },
      { componentName: "HR Export", offsetX: 800, offsetY: -150 },
      { componentName: "FK Export", offsetX: 800, offsetY: 0 },
      { componentName: "School Export", offsetX: 800, offsetY: 150 },
    ],
    edges: [
      { source: "Upload VAB Doc", target: "VAB Agent" },
      { source: "VAB Agent", target: "HR Export" },
      { source: "VAB Agent", target: "FK Export" },
      { source: "VAB Agent", target: "School Export" },
    ],
  },
};

export function getMultiNodeDefinition(name: string): MultiNodeDefinition | null {
  return multiNodeDefinitions[name] || null;
}

export function isMultiNodeComponent(componentName: string): boolean {
  return componentName in multiNodeDefinitions;
}

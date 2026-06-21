import { LucideIcon, Play, Bot, Network, Brain, Receipt, Download, Sparkles, Cpu, Baby } from 'lucide-react';

export interface ComponentItem {
  name: string;
  icon: LucideIcon;
}

export interface ComponentGroup {
  name: string;
  icon: LucideIcon;
  iconColor: string;
  items: ComponentItem[];
}

export const getComponentGroups = async (): Promise<ComponentGroup[]> => {
  return [
    {
      name: "Start Nodes",
      icon: Play,
      iconColor: "text-blue-500",
      items: [
        { name: "Upload VAB Doc", icon: Receipt },
      ]
    },
    {
      name: "Agents",
      icon: Sparkles,
      iconColor: "text-purple-500",
      items: [
        { name: "VAB Agent", icon: Baby },
        { name: "LLM Agent", icon: Cpu },
      ]
    },
    {
      name: "Swarms",
      icon: Network,
      iconColor: "text-yellow-500",
      items: [
        { name: "Sick Leave", icon: Bot },
      ]
    },
    {
      name: "End Nodes",
      icon: Brain,
      iconColor: "text-green-500",
      items: [
        { name: "Export CSV", icon: Download },
      ]
    },
  ];
};

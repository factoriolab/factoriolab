import { Recipe } from './data';
import { Theme } from './enum/theme';

export enum NodeType {
  Input = 'input', // Use secondary button styles
  Recipe = 'recipe', // Use primary button styles
  Surplus = 'surplus', // Use warning button styles
  Output = 'output', // Use success button styles
}

export interface NodeStyle {
  color: string;
  background: string;
}

export interface FlowStyle {
  node: Record<NodeType, NodeStyle>;
  edge: string; // Text color
}

const darkTheme: FlowStyle = {
  node: {
    [NodeType.Input]: { color: '#1C2127', background: '#CBD5E1' },
    [NodeType.Recipe]: { color: '#1C2127', background: '#93C5FD' },
    [NodeType.Surplus]: { color: '#1C2127', background: '#FCD34D' },
    [NodeType.Output]: { color: '#1C2127', background: '#86EFAC' },
  },
  edge: 'rgba(255, 255, 255, 0.87)',
};

const lightTheme: FlowStyle = {
  node: {
    [NodeType.Input]: { color: '#FFFFFF', background: '#64748B' },
    [NodeType.Recipe]: { color: '#FFFFFF', background: '#3B82F6' },
    [NodeType.Surplus]: { color: '#FFFFFF', background: '#F59E0B' },
    [NodeType.Output]: { color: '#FFFFFF', background: '#22C55E' },
  },
  edge: '#495057',
};

export const themeMap: Record<Theme.Light | Theme.Dark, FlowStyle> = {
  [Theme.Light]: lightTheme,
  [Theme.Dark]: darkTheme,
};

export interface FlowData {
  theme: FlowStyle;
  nodes: Node[];
  links: Link[];
}

export interface FlowBase {
  name: string;
  text: string;
}

export interface Node extends FlowBase {
  id: string;
  color: string;
  background: string;
  recipe?: Recipe;
  factories?: string;
  factoryId?: string;
}

export interface Link extends FlowBase {
  source: string;
  target: string;
}

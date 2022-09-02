import { Recipe } from './data';
import { Theme } from './enum/theme';

export enum NodeType {
  Input = 'input', // Use info/secondary button styles
  Recipe = 'recipe', // Use primary button styles
  Surplus = 'surplus', // Use warning/danger button styles
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
    [NodeType.Input]: { color: '#121212', background: '#81D4FA' },
    [NodeType.Recipe]: { color: '#212529', background: '#FFD54F' },
    [NodeType.Surplus]: { color: '#121212', background: '#F48FB1' },
    [NodeType.Output]: { color: '#121212', background: '#C5E1A5' },
  },
  edge: 'rgba(255, 255, 255, 0.87)',
};

const lightTheme: FlowStyle = {
  node: {
    [NodeType.Input]: { color: '#FFFFFF', background: '#78909C' },
    [NodeType.Recipe]: { color: '#FFFFFF', background: '#2196F3' },
    [NodeType.Surplus]: { color: '#FFFFFF', background: '#D32F2F' },
    [NodeType.Output]: { color: '#FFFFFF', background: '#689F38' },
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
  type: NodeType;
  recipe?: Recipe;
  factories?: string;
  factoryId?: string;
}

export interface Link extends FlowBase {
  source: string;
  target: string;
}

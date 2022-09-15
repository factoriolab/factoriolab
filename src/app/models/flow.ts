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
    [NodeType.Input]: { color: '#044868', background: '#B3E5FC' },
    [NodeType.Recipe]: { color: '#212529', background: '#FFBE4D' },
    [NodeType.Surplus]: { color: '#73000c', background: '#FFCDD2' },
    [NodeType.Output]: { color: '#224a23', background: '#C8E6C9' },
  },
  edge: 'rgba(255, 255, 255, 0.87)',
};

const lightTheme: FlowStyle = {
  node: {
    [NodeType.Input]: { color: '#044868', background: '#B3E5FC' },
    [NodeType.Recipe]: { color: '#FFFFFF', background: '#BD7800' },
    [NodeType.Surplus]: { color: '#73000c', background: '#FFCDD2' },
    [NodeType.Output]: { color: '#224a23', background: '#C8E6C9' },
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

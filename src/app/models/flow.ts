import { Recipe } from './data/recipe';

export interface FlowData {
  nodes: Node[];
  links: Link[];
}

export interface FlowBase {
  name: string;
  text: string;
  color: string;
}

export interface Node extends FlowBase {
  id: string;
  recipe?: Recipe;
  machines?: string;
  machineId?: string;

  stepId: string;
  posX: string;
  posY: string;
  viewBox: string;
  href: string;
}

export interface Link extends FlowBase {
  source: string;
  target: string;
  value: number;
}

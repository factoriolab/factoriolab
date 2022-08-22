import { Recipe } from './data';

export interface FlowData {
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
  recipe?: Recipe;
  factories?: string;
  factoryId?: string;
}

export interface Link extends FlowBase {
  source: string;
  target: string;
}

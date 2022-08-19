import { Recipe } from './data';

export interface SankeyData {
  nodes: Node[];
  links: Link[];
}

export interface SankeyBase {
  name: string;
  color: string;
}

export interface Node extends SankeyBase {
  id: string;
  stepId: string;
  viewBox: string;
  href: string | undefined;
  subtext: string;
  recipe?: Recipe;
  factories?: string;
  factoryId?: string;
}

export interface Link extends SankeyBase {
  source: string;
  target: string;
  value: number;
  text: string;
}

export interface SankeyData {
  nodes: Node[];
  links: Link[];
}

export interface Node {
  id: string;
  name: string;
  color: string;
}

export interface Link {
  source: string;
  target: string;
  value: number;
}

import { SelectItem } from 'primeng/api';

export enum FlowDiagram {
  Sankey = 0,
  BoxLine = 1,
}

export const flowDiagramOptions: SelectItem<FlowDiagram>[] = [
  { value: FlowDiagram.Sankey, label: 'Sankey' },
  { value: FlowDiagram.BoxLine, label: 'Box-line' },
];

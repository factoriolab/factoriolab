import { Option } from '~/models/option';

export enum FlowDiagram {
  Sankey = 0,
  BoxLine = 1,
}

export const flowDiagramOptions: Option<FlowDiagram>[] = [
  { value: FlowDiagram.Sankey, label: 'options.flowDiagram.sankey' },
  { value: FlowDiagram.BoxLine, label: 'options.flowDiagram.boxLine' },
];

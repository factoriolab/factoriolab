import { FlowDiagram, LinkValue, SankeyAlign } from '../enum';

export interface FlowSettings {
  diagram: FlowDiagram;
  linkSize: LinkValue;
  linkText: LinkValue;
  sankeyAlign: SankeyAlign;
  hideExcluded: boolean;
}

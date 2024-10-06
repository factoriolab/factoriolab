import { FlowDiagram } from '../enum/flow-diagram';
import { LinkValue } from '../enum/link-value';
import { SankeyAlign } from '../enum/sankey-align';

export interface FlowSettings {
  diagram: FlowDiagram;
  linkSize: LinkValue;
  linkText: LinkValue;
  sankeyAlign: SankeyAlign;
  hideExcluded: boolean;
}

import { FlowDiagram } from './flow-diagram';
import { LinkValue } from './link-value';
import { SankeyAlign } from './sankey-align';

export interface FlowSettingsState {
  diagram: FlowDiagram;
  linkSize: LinkValue;
  linkText: LinkValue;
  sankeyAlign: SankeyAlign;
  hideExcluded: boolean;
}

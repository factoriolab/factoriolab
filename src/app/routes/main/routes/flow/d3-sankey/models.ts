import { SankeyExtraProperties } from 'd3-sankey';

export interface SankeyNodeExtraProperties extends SankeyExtraProperties {
  layer?: number;
}

export interface SankeyLinkExtraProperties extends SankeyExtraProperties {
  direction?: 'self' | 'forward' | 'backward';
}

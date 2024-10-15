import { min } from 'd3';

import { coalesce } from '~/helpers';

import {
  SankeyLink,
  SankeyLinkExtraProperties,
  SankeyNode,
  SankeyNodeExtraProperties,
} from './models';

function targetDepth<
  N extends SankeyNodeExtraProperties = object,
  L extends SankeyLinkExtraProperties = object,
>(d: SankeyLink<N, L>): number | undefined {
  return (d.target as SankeyNode<N, L>).depth;
}

/**
 * Compute the horizontal node position of a node in a Sankey layout with left alignment.
 * Returns (node.depth) to indicate the desired horizontal position of the node in the generated Sankey diagram.
 *
 * @param node Sankey node for which to calculate the horizontal node position.
 */
export function sankeyLeft<
  N extends SankeyNodeExtraProperties = object,
  L extends SankeyLinkExtraProperties = object,
>(node: SankeyNode<N, L>): number {
  return coalesce(node.depth, 0);
}

/**
 * Compute the horizontal node position of a node in a Sankey layout with right alignment.
 * Returns (n - 1 - node.height) to indicate the desired horizontal position of the node in the generated Sankey diagram.
 *
 * @param node Sankey node for which to calculate the horizontal node position.
 * @param n Total depth n of the graph  (one plus the maximum node.depth)
 */
export function sankeyRight<
  N extends SankeyNodeExtraProperties = object,
  L extends SankeyLinkExtraProperties = object,
>(node: SankeyNode<N, L>, n: number): number {
  return n - 1 - coalesce(node.height, 0);
}

/**
 * Compute the horizontal node position of a node in a Sankey layout with justified alignment.
 * Like d3.sankeyLeft, except that nodes without any outgoing links are moved to the far right.
 * Returns an integer between 0 and n - 1 that indicates the desired horizontal position of the node in the generated Sankey diagram.
 *
 * @param node Sankey node for which to calculate the horizontal node position.
 * @param n Total depth n of the graph  (one plus the maximum node.depth)
 */
export function sankeyJustify<
  N extends SankeyNodeExtraProperties = object,
  L extends SankeyLinkExtraProperties = object,
>(node: SankeyNode<N, L>, n: number): number {
  return node.sourceLinks?.length ? coalesce(node.depth, 0) : n - 1;
}

/**
 * Compute the horizontal node position of a node in a Sankey layout with center alignment.
 * Like d3.sankeyLeft, except that nodes without any incoming links are moved as right as possible.
 * Returns an integer between 0 and n - 1 that indicates the desired horizontal position of the node in the generated Sankey diagram.
 *
 * @param node Sankey node for which to calculate the horizontal node position.
 */
export function sankeyCenter<
  N extends SankeyNodeExtraProperties = object,
  L extends SankeyLinkExtraProperties = object,
>(node: SankeyNode<N, L>): number {
  return node.targetLinks?.length
    ? coalesce(node.depth, 0)
    : node.sourceLinks?.length
      ? coalesce(min(node.sourceLinks, targetDepth), 0) - 1
      : 0;
}

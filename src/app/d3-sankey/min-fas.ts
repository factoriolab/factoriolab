import { coalesce } from '~/helpers';

import {
  SankeyGraph,
  SankeyLinkExtraProperties,
  SankeyNode,
  SankeyNodeExtraProperties,
} from './models';

/**
 * Determine a set of links which need to be reversed to render the graph acyclic.
 *
 * https://github.com/KirkMcDonald/kirkmcdonald.github.io/blob/master/d3-sankey/cycle.js
 * https://pdfs.semanticscholar.org/c7ed/d9acce96ca357876540e19664eb9d976637f.pdf
 * https://en.wikipedia.org/wiki/Feedback_arc_set
 * @param graph
 */
export function minFAS<
  N extends SankeyNodeExtraProperties = object,
  L extends SankeyLinkExtraProperties = object,
>(graph: SankeyGraph<N, L>): void {
  const nodes = new Set<SankeyNode<N, L>>();
  const indegrees = new Map<SankeyNode<N, L>, number>();
  const outdegrees = new Map<SankeyNode<N, L>, number>();

  for (const node of graph.nodes) {
    nodes.add(node);
    let incount = 0;
    let outcount = 0;
    for (const link of coalesce(node.targetLinks, [])) {
      if (link.source !== node) incount++;
    }

    for (const link of coalesce(node.sourceLinks, [])) {
      if (link.target !== node) outcount++;
    }

    indegrees.set(node, incount);
    outdegrees.set(node, outcount);
  }

  function remove(node: SankeyNode<N, L>): void {
    nodes.delete(node);
    for (const link of coalesce(node.targetLinks, [])) {
      const source = link.source as SankeyNode<N, L>;
      if (nodes.has(source)) {
        const subdegree = coalesce(outdegrees.get(source), 0);
        outdegrees.set(source, subdegree - 1);
      }
    }

    for (const link of coalesce(node.sourceLinks, [])) {
      const target = link.target as SankeyNode<N, L>;
      if (nodes.has(target)) {
        const subdegree = coalesce(indegrees.get(target), 0);
        indegrees.set(target, subdegree - 1);
      }
    }
  }

  const s1 = [];
  const s2 = [];
  while (nodes.size > 0) {
    // Remove sink nodes until none are found.
    for (;;) {
      let found = false;
      for (const node of nodes) {
        const outdegree = outdegrees.get(node);
        if (outdegree === 0) {
          found = true;
          s2.push(node);
          remove(node);
        }
      }

      if (!found) break;
    }

    // Remove source nodes until none are found.
    for (;;) {
      let found = false;
      for (const node of nodes) {
        const indegree = indegrees.get(node);
        // istanbul ignore if: Unclear how to test this block
        if (indegree === 0) {
          found = true;
          s1.push(node);
          remove(node);
        }
      }

      if (!found) break;
    }

    if (nodes.size === 0) break;

    let maxDelta = null;
    let maxNode = null;
    for (const node of nodes) {
      const delta =
        coalesce(outdegrees.get(node), 0) - coalesce(indegrees.get(node), 0);
      if (maxDelta === null || delta > maxDelta) {
        maxDelta = delta;
        maxNode = node;
      }
    }

    if (maxNode != null) {
      s1.push(maxNode);
      remove(maxNode);
    }
  }

  s2.reverse();
  const order = s1.concat(s2);
  const orderMap = new Map<SankeyNode<N, L>, number>();
  for (const [i, node] of order.entries()) {
    orderMap.set(node, i);
  }

  for (const link of graph.links) {
    const i = coalesce(orderMap.get(link.source as SankeyNode<N, L>), 0);
    const j = coalesce(orderMap.get(link.target as SankeyNode<N, L>), 0);
    if (i === j) {
      link.direction = 'self';
    } else if (i < j) {
      link.direction = 'forward';
    } else {
      link.direction = 'backward';
    }
  }
}

import { max, min, sum } from 'd3';

import { coalesce } from '../helpers';
import { sankeyJustify } from './align';
import { constant } from './constant';
import { minFAS } from './min-fas';
import {
  SankeyGraph,
  SankeyGraphMinimal,
  SankeyLayout,
  SankeyLink,
  SankeyLinkExtraProperties,
  SankeyNode,
  SankeyNodeExtraProperties,
} from './models';

export function ascendingSourceBreadth<
  N extends SankeyNodeExtraProperties = object,
  L extends SankeyLinkExtraProperties = object,
>(a: SankeyLink<N, L>, b: SankeyLink<N, L>): number {
  return (
    ascendingBreadth(
      a.source as SankeyNode<N, L>,
      b.source as SankeyNode<N, L>,
    ) || a.index - b.index
  );
}

function ascendingTargetBreadth<
  N extends SankeyNodeExtraProperties = object,
  L extends SankeyLinkExtraProperties = object,
>(a: SankeyLink<N, L>, b: SankeyLink<N, L>): number {
  return (
    ascendingBreadth(
      a.target as SankeyNode<N, L>,
      b.target as SankeyNode<N, L>,
    ) || a.index - b.index
  );
}

function ascendingBreadth<
  N extends SankeyNodeExtraProperties = object,
  L extends SankeyLinkExtraProperties = object,
>(a: SankeyNode<N, L>, b: SankeyNode<N, L>): number {
  return a.y0 - b.y0;
}

function value<
  N extends SankeyNodeExtraProperties = object,
  L extends SankeyLinkExtraProperties = object,
>(d: SankeyNode<N, L> | SankeyLink<N, L>): number {
  return d.value;
}

export function defaultId<
  N extends SankeyNodeExtraProperties = object,
  L extends SankeyLinkExtraProperties = object,
>(d: SankeyNode<N, L>): number | string {
  return d.index;
}

export function defaultNodes<
  N extends SankeyNodeExtraProperties = object,
  L extends SankeyLinkExtraProperties = object,
>(graph: SankeyGraph<N, L>): SankeyNode<N, L>[] {
  return graph.nodes;
}

export function defaultLinks<
  N extends SankeyNodeExtraProperties = object,
  L extends SankeyLinkExtraProperties = object,
>(graph: SankeyGraph<N, L>): SankeyLink<N, L>[] {
  return graph.links;
}

export function find<
  N extends SankeyNodeExtraProperties = object,
  L extends SankeyLinkExtraProperties = object,
>(
  nodeById: Map<string | number, SankeyNode<N, L>>,
  id: string | number,
): SankeyNode<N, L> {
  const node = nodeById.get(id);
  if (!node) throw new Error('missing: ' + id.toString());
  return node;
}

function computeLinkBreadths<
  N extends SankeyNodeExtraProperties = object,
  L extends SankeyLinkExtraProperties = object,
>({ nodes }: { nodes: SankeyNode<N, L>[] }): void {
  for (const node of nodes) {
    let y0 = node.y0;
    let y1 = y0;
    for (const link of node.sourceLinks) {
      link.y0 = y0 + link.width / 2;
      y0 += link.width;
    }

    for (const link of node.targetLinks) {
      link.y1 = y1 + link.width / 2;
      y1 += link.width;
    }
  }
}

function num(n: number | undefined): number {
  return coalesce(n, 0);
}

export function sankey<
  N extends SankeyNodeExtraProperties,
  L extends SankeyLinkExtraProperties,
>(): SankeyLayout<SankeyGraphMinimal<N, L>, N, L> {
  let x0 = 0,
    y0 = 0,
    x1 = 1,
    y1 = 1; // extent
  let _nodeWidth = 24;
  let _nodePadding = 8;
  let _nodeId = defaultId<N, L>;
  let _nodeAlign = sankeyJustify<N, L>;
  let _nodeSort:
    | ((a: SankeyNode<N, L>, b: SankeyNode<N, L>) => number)
    | undefined;
  let _linkSort:
    | ((a: SankeyLink<N, L>, b: SankeyLink<N, L>) => number)
    | undefined;
  let _nodes = defaultNodes<N, L>;
  let _links = defaultLinks<N, L>;
  let _iterations = 6;

  function sankeyFn(data: SankeyGraph<N, L>): SankeyGraph<N, L> {
    const graph: SankeyGraph<N, L> = {
      nodes: [...data.nodes],
      links: [...data.links],
    };
    computeNodeLinks(graph);
    computeNodeValues(graph);
    computeReversedLinks(graph);
    computeNodeDepths(graph);
    computeNodeHeights(graph);
    computeNodeBreadths(graph);
    computeLinkBreadths(graph);
    return graph;
  }

  type Layout = SankeyLayout<SankeyGraphMinimal<N, L>, N, L>;
  const sankey = sankeyFn as unknown as Layout;

  sankey.update = function (graph: SankeyGraph<N, L>): SankeyGraph<N, L> {
    computeLinkBreadths(graph);
    return graph;
  };

  function nodeId(): (node: SankeyNode<N, L>) => string | number;
  function nodeId(nodeId: (node: SankeyNode<N, L>) => string | number): Layout;
  function nodeId(
    _?: (node: SankeyNode<N, L>) => string | number,
  ): ((node: SankeyNode<N, L>) => string | number) | Layout {
    if (_ == null) return _nodeId;
    _nodeId = _;
    return sankey;
  }
  sankey.nodeId = nodeId;

  function nodeAlign(): (node: SankeyNode<N, L>, n: number) => number;
  function nodeAlign(
    nodeAlign: (node: SankeyNode<N, L>, n: number) => number,
  ): Layout;
  function nodeAlign(
    _?: (node: SankeyNode<N, L>, n: number) => number,
  ): ((node: SankeyNode<N, L>, n: number) => number) | Layout {
    if (_ == null) return _nodeAlign;
    _nodeAlign = _;
    return sankey;
  }
  sankey.nodeAlign = nodeAlign;

  function nodeSort():
    | ((a: SankeyNode<N, L>, b: SankeyNode<N, L>) => number)
    | undefined;
  function nodeSort(
    compare: (a: SankeyNode<N, L>, b: SankeyNode<N, L>) => number,
  ): Layout;
  function nodeSort(
    _?: (a: SankeyNode<N, L>, b: SankeyNode<N, L>) => number,
  ):
    | (((a: SankeyNode<N, L>, b: SankeyNode<N, L>) => number) | undefined)
    | Layout {
    if (_ == null) return _nodeSort;
    _nodeSort = _;
    return sankey;
  }
  sankey.nodeSort = nodeSort;

  function nodeWidth(): number;
  function nodeWidth(width: number): Layout;
  function nodeWidth(_?: number): number | Layout {
    if (_ == null) return _nodeWidth;
    _nodeWidth = _;
    return sankey;
  }
  sankey.nodeWidth = nodeWidth;

  function nodePadding(): number;
  function nodePadding(padding: number): Layout;
  function nodePadding(_?: number): number | Layout {
    if (_ == null) return _nodePadding;
    _nodePadding = _;
    return sankey;
  }
  sankey.nodePadding = nodePadding;

  function nodes(): (data: SankeyGraphMinimal<N, L>) => SankeyNode<N, L>[];
  function nodes(nodes: SankeyNode<N, L>[]): Layout;
  function nodes(
    nodes: (data: SankeyGraph<N, L>) => SankeyNode<N, L>[],
  ): Layout;
  function nodes(
    _?: SankeyNode<N, L>[] | ((data: SankeyGraph<N, L>) => SankeyNode<N, L>[]),
  ): ((data: SankeyGraph<N, L>) => SankeyNode<N, L>[]) | Layout {
    if (_ == null) return _nodes;
    _nodes = typeof _ === 'function' ? _ : constant(_);
    return sankey;
  }
  sankey.nodes = nodes;

  function links(): (data: SankeyGraphMinimal<N, L>) => SankeyLink<N, L>[];
  function links(links: SankeyLink<N, L>[]): Layout;
  function links(
    links: (data: SankeyGraph<N, L>) => SankeyLink<N, L>[],
  ): Layout;
  function links(
    _?: SankeyLink<N, L>[] | ((data: SankeyGraph<N, L>) => SankeyLink<N, L>[]),
  ): ((data: SankeyGraph<N, L>) => SankeyLink<N, L>[]) | Layout {
    if (_ == null) return _links;
    _links = typeof _ === 'function' ? _ : constant(_);
    return sankey;
  }
  sankey.links = links;

  function linkSort():
    | ((a: SankeyLink<N, L>, b: SankeyLink<N, L>) => number)
    | undefined;
  function linkSort(
    compare: (a: SankeyLink<N, L>, b: SankeyLink<N, L>) => number,
  ): Layout;
  function linkSort(
    _?: (a: SankeyLink<N, L>, b: SankeyLink<N, L>) => number,
  ):
    | (((a: SankeyLink<N, L>, b: SankeyLink<N, L>) => number) | undefined)
    | Layout {
    if (_ == null) return _linkSort;
    _linkSort = _;
    return sankey;
  }
  sankey.linkSort = linkSort;

  function size(): [number, number];
  function size(size: [number, number]): Layout;
  function size(_?: [number, number]): [number, number] | Layout {
    if (_ == null) return [x1 - x0, y1 - y0];
    x0 = y0 = 0;
    [x1, y1] = _;
    return sankey;
  }
  sankey.size = size;

  function extent(): [[number, number], [number, number]];
  function extent(extent: [[number, number], [number, number]]): Layout;
  function extent(
    _?: [[number, number], [number, number]],
  ): [[number, number], [number, number]] | Layout {
    if (_ == null)
      return [
        [x0, y0],
        [x1, y1],
      ];
    [[x0, y0], [x1, y1]] = _;
    return sankey;
  }
  sankey.extent = extent;

  function iterations(): number;
  function iterations(iterations: number): Layout;
  function iterations(_?: number): number | Layout {
    if (_ == null) return _iterations;
    _iterations = _;
    return sankey;
  }
  sankey.iterations = iterations;

  function computeNodeLinks({ nodes, links }: SankeyGraph<N, L>): void {
    for (const [i, node] of nodes.entries()) {
      node.index = i;
      node.sourceLinks = [];
      node.targetLinks = [];
    }
    const nodeById = new Map(nodes.map((d) => [_nodeId(d), d]));
    for (const [i, link] of links.entries()) {
      link.index = i;
      let { source, target } = link;
      if (typeof source !== 'object')
        source = link.source = find(nodeById, source);
      if (typeof target !== 'object')
        target = link.target = find(nodeById, target);
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    }
  }

  function computeNodeValues({ nodes }: SankeyGraph<N, L>): void {
    for (const node of nodes) {
      node.value = Math.max(
        sum(node.sourceLinks, value),
        sum(node.targetLinks, value),
      );
    }
  }

  function computeReversedLinks(graph: SankeyGraph<N, L>): void {
    minFAS(graph);
  }

  function computeNodeDepths({ nodes }: SankeyGraph<N, L>): void {
    const n = nodes.length;
    let current = new Set(nodes);
    let next = new Set<SankeyNode<N, L>>();
    let x = 0;
    while (current.size) {
      for (const node of current) {
        node.depth = x;
        for (const { target, direction } of node.sourceLinks) {
          if (direction === 'forward') {
            next.add(target as SankeyNode<N, L>);
          }
        }
      }

      /**
       * This should be impossible to hit since circular links are ignored in
       * this computation, but leaving the condition in case minFAS fails
       */
      // istanbul ignore next
      if (++x > n) throw new Error('circular link');
      current = next;
      next = new Set();
    }
  }

  function computeNodeHeights({ nodes }: SankeyGraph<N, L>): void {
    const n = nodes.length;
    let current = new Set(nodes);
    let next = new Set<SankeyNode<N, L>>();
    let x = 0;
    while (current.size) {
      for (const node of current) {
        node.height = x;
        for (const { source, direction } of node.targetLinks) {
          if (direction === 'forward') {
            next.add(source as SankeyNode<N, L>);
          }
        }
      }

      /**
       * This should be impossible to hit since circular links are ignored in
       * this computation, but leaving the condition in case minFAS fails
       */
      // istanbul ignore next
      if (++x > n) throw new Error('circular link');
      current = next;
      next = new Set();
    }
  }

  function computeNodeLayers({
    nodes,
  }: SankeyGraph<N, L>): SankeyNode<N, L>[][] {
    const x = num(max(nodes, (d) => d.depth)) + 1;
    const kx = (x1 - x0 - _nodeWidth) / (x - 1);
    const columns = new Array<SankeyNode<N, L>[]>(x);
    for (const node of nodes) {
      const i = Math.max(
        0,
        Math.min(x - 1, Math.floor(_nodeAlign.call(null, node, x))),
      );
      node.layer = i;
      node.x0 = x0 + i * kx;
      node.x1 = node.x0 + _nodeWidth;
      if (columns[i]) columns[i].push(node);
      else columns[i] = [node];
    }

    if (_nodeSort) {
      for (const column of columns) {
        column.sort(_nodeSort);
      }
    }

    return columns;
  }

  function initializeNodeBreadths(columns: SankeyNode<N, L>[][]): number {
    let ky = min(
      columns,
      (c) => (y1 - y0 - (c.length - 1) * _nodePadding) / sum(c, value),
    );
    ky = coalesce(ky, 0);
    for (const nodes of columns) {
      let y = y0;
      for (const node of nodes) {
        node.y0 = y;
        node.y1 = y + node.value * ky;
        y = node.y1 + _nodePadding;
        for (const link of node.sourceLinks) {
          link.width = link.value * ky;
        }
      }

      y = (y1 - y + _nodePadding) / (nodes.length + 1);
      for (let i = 0; i < nodes.length; ++i) {
        const node = nodes[i];
        node.y0 += y * (i + 1);
        node.y1 += y * (i + 1);
      }
      reorderLinks(nodes);
    }
    return y1;
  }

  function computeNodeBreadths(graph: SankeyGraph<N, L>): void {
    const columns = computeNodeLayers(graph);
    const y1 = initializeNodeBreadths(columns);
    for (let i = 0; i < _iterations; ++i) {
      const alpha = Math.pow(0.99, i);
      const beta = Math.max(1 - alpha, (i + 1) / _iterations);
      relaxRightToLeft(columns, alpha, beta, y1);
      relaxLeftToRight(columns, alpha, beta, y1);
    }
  }

  // Reposition each node based on its incoming (target) links.
  function relaxLeftToRight(
    columns: SankeyNode<N, L>[][],
    alpha: number,
    beta: number,
    y1: number,
  ): void {
    for (let i = 1, n = columns.length; i < n; ++i) {
      const column = columns[i];
      for (const target of column) {
        let y = 0;
        let w = 0;
        for (const { source, value } of target.targetLinks) {
          const v =
            value *
            (num(target.layer) - num((source as SankeyNode<N, L>).layer));
          y += targetTop(source as SankeyNode<N, L>, target) * v;
          w += v;
        }

        // istanbul ignore if: Unclear how to test this condition
        if (!(w > 0)) continue;
        const dy = (y / w - target.y0) * alpha;
        target.y0 += dy;
        target.y1 += dy;
        reorderNodeLinks(target);
      }
      if (_nodeSort === undefined) column.sort(ascendingBreadth);
      resolveCollisions(column, beta, y1);
    }
  }

  // Reposition each node based on its outgoing (source) links.
  function relaxRightToLeft(
    columns: SankeyNode<N, L>[][],
    alpha: number,
    beta: number,
    y1: number,
  ): void {
    for (let n = columns.length, i = n - 2; i >= 0; --i) {
      const column = columns[i];
      for (const source of column) {
        let y = 0;
        let w = 0;
        for (const { target, value } of source.sourceLinks) {
          const v =
            value *
            (num((target as SankeyNode<N, L>).layer) - num(source.layer));
          y += sourceTop(source, target as SankeyNode<N, L>) * v;
          w += v;
        }
        if (!(w > 0)) continue;
        const dy = (y / w - source.y0) * alpha;
        source.y0 += dy;
        source.y1 += dy;
        reorderNodeLinks(source);
      }
      if (_nodeSort === undefined) column.sort(ascendingBreadth);
      resolveCollisions(column, beta, y1);
    }
  }

  function resolveCollisions(
    nodes: SankeyNode<N, L>[],
    alpha: number,
    y1: number,
  ): void {
    const i = nodes.length >> 1;
    const subject = nodes[i];
    resolveCollisionsBottomToTop(
      nodes,
      subject.y0 - _nodePadding,
      i - 1,
      alpha,
    );
    resolveCollisionsTopToBottom(
      nodes,
      subject.y1 + _nodePadding,
      i + 1,
      alpha,
    );
    resolveCollisionsBottomToTop(nodes, y1, nodes.length - 1, alpha);
    resolveCollisionsTopToBottom(nodes, y0, 0, alpha);
  }

  // Push any overlapping nodes down.
  function resolveCollisionsTopToBottom(
    nodes: SankeyNode<N, L>[],
    y: number,
    i: number,
    alpha: number,
  ): void {
    for (; i < nodes.length; ++i) {
      const node = nodes[i];
      const dy = (y - node.y0) * alpha;
      if (dy > 1e-6) {
        node.y0 += dy;
        node.y1 += dy;
      }
      y = node.y1 + _nodePadding;
    }
  }

  // Push any overlapping nodes up.
  function resolveCollisionsBottomToTop(
    nodes: SankeyNode<N, L>[],
    y: number,
    i: number,
    alpha: number,
  ): void {
    for (; i >= 0; --i) {
      const node = nodes[i];
      const dy = (node.y1 - y) * alpha;
      if (dy > 1e-6) {
        node.y0 -= dy;
        node.y1 -= dy;
      }
      y = node.y0 - _nodePadding;
    }
  }

  function reorderNodeLinks({
    sourceLinks,
    targetLinks,
  }: SankeyNode<N, L>): void {
    if (_linkSort === undefined) {
      for (const link of targetLinks) {
        (link.source as SankeyNode<N, L>).sourceLinks.sort(
          ascendingTargetBreadth,
        );
      }

      for (const link of sourceLinks) {
        (link.target as SankeyNode<N, L>).targetLinks.sort(
          ascendingSourceBreadth,
        );
      }
    }
  }

  function reorderLinks(nodes: SankeyNode<N, L>[]): void {
    if (_linkSort === undefined) {
      for (const { sourceLinks, targetLinks } of nodes) {
        sourceLinks.sort(ascendingTargetBreadth);
        targetLinks.sort(ascendingSourceBreadth);
      }
    }
  }

  // Returns the target.y0 that would produce an ideal link from source to target.
  function targetTop(
    source: SankeyNode<N, L>,
    target: SankeyNode<N, L>,
  ): number {
    let y = source.y0 - ((source.sourceLinks.length - 1) * _nodePadding) / 2;
    for (const { target: node, width } of source.sourceLinks) {
      if (node === target) break;
      y += width + _nodePadding;
    }
    for (const { source: node, width } of target.targetLinks) {
      if (node === source) break;
      y -= width;
    }
    return y;
  }

  // Returns the source.y0 that would produce an ideal link from source to target.
  function sourceTop(
    source: SankeyNode<N, L>,
    target: SankeyNode<N, L>,
  ): number {
    let y = target.y0 - ((target.targetLinks.length - 1) * _nodePadding) / 2;
    for (const { source: node, width } of target.targetLinks) {
      if (node === source) break;
      y += width + _nodePadding;
    }

    for (const { target: node, width } of source.sourceLinks) {
      if (node === target) break;
      y -= width;
    }

    return y;
  }

  return sankey;
}

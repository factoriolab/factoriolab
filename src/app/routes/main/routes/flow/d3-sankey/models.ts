// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SankeyNodeExtraProperties extends Record<string, any> {
  layer?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SankeyLinkExtraProperties extends Record<string, any> {
  direction?: 'self' | 'forward' | 'backward';
}

export interface SankeyNodeMinimal<N extends object, L extends object> {
  sourceLinks?: Array<SankeyLink<N, L>> | undefined;
  targetLinks?: Array<SankeyLink<N, L>> | undefined;
  value?: number | undefined;
  fixedValue?: number | undefined;
  index?: number | undefined;
  depth?: number | undefined;
  height?: number | undefined;
  x0?: number | undefined;
  x1?: number | undefined;
  y0?: number | undefined;
  y1?: number | undefined;
}

export type SankeyNode<N extends object, L extends object> = N &
  SankeyNodeMinimal<N, L>;

export interface SankeyLinkMinimal<N extends object, L extends object> {
  source: number | string | SankeyNode<N, L>;
  target: number | string | SankeyNode<N, L>;
  value: number;
  y0?: number | undefined;
  y1?: number | undefined;
  width?: number | undefined;
  index?: number | undefined;
}

export type SankeyLink<N extends object, L extends object> = L &
  SankeyLinkMinimal<N, L>;

export interface SankeyGraph<N extends object, L extends object> {
  nodes: Array<SankeyNode<N, L>>;
  links: Array<SankeyLink<N, L>>;
}

export interface SankeyLayout<Data, N extends object, L extends object> {
  (data: Data, ...args: unknown[]): SankeyGraph<N, L>;
  update(graph: SankeyGraph<N, L>): SankeyGraph<N, L>;
  nodes(): (data: Data, ...args: unknown[]) => Array<SankeyNode<N, L>>;
  nodes(nodes: Array<SankeyNode<N, L>>): this;
  nodes(
    nodes: (data: Data, ...args: unknown[]) => Array<SankeyNode<N, L>>,
  ): this;
  links(): (data: Data, ...args: unknown[]) => Array<SankeyLink<N, L>>;
  links(links: Array<SankeyLink<N, L>>): this;
  links(
    links: (data: Data, ...args: unknown[]) => Array<SankeyLink<N, L>>,
  ): this;
  nodeId(): (node: SankeyNode<N, L>) => string | number;
  nodeId(nodeId: (node: SankeyNode<N, L>) => string | number): this;
  nodeAlign(): (node: SankeyNode<N, L>, n: number) => number;
  nodeAlign(nodeAlign: (node: SankeyNode<N, L>, n: number) => number): this;
  nodeWidth(): number;
  nodeWidth(width: number): this;
  nodePadding(): number;
  nodePadding(padding: number): this;
  extent(): [[number, number], [number, number]];
  extent(extent: [[number, number], [number, number]]): this;
  size(): [number, number];
  size(size: [number, number]): this;
  iterations(): number;
  iterations(iterations: number): this;
  nodeSort():
    | ((a: SankeyNode<N, L>, b: SankeyNode<N, L>) => number)
    | undefined;
  nodeSort(
    compare: (
      a: SankeyNode<N, L>,
      b: SankeyNode<N, L>,
    ) => number | undefined | null,
  ): this;
  linkSort():
    | ((a: SankeyLink<N, L>, b: SankeyLink<N, L>) => number)
    | undefined;
  linkSort(
    compare: (
      a: SankeyLink<N, L>,
      b: SankeyLink<N, L>,
    ) => number | undefined | null,
  ): this;
}

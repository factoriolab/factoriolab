// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SankeyNodeExtraProperties extends Record<string, any> {
  layer?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SankeyLinkExtraProperties extends Record<string, any> {
  direction?: 'self' | 'forward' | 'backward';
}

export interface SankeyNodeMinimal<N extends object, L extends object> {
  sourceLinks?: SankeyLink<N, L>[];
  targetLinks?: SankeyLink<N, L>[];
  value?: number;
  fixedValue?: number;
  index?: number;
  depth?: number;
  height?: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
}

type SankeyNodeMaximal<N extends object, L extends object> = Required<
  Omit<SankeyNodeMinimal<N, L>, 'sourceLinks' | 'targetLinks'>
> & {
  sourceLinks: SankeyLink<N, L>[];
  targetLinks: SankeyLink<N, L>[];
};

export type SankeyNode<N extends object, L extends object> = N &
  SankeyNodeMaximal<N, L>;

export interface SankeyLinkMinimal<N extends object, L extends object> {
  source: number | string | SankeyNode<N, L>;
  target: number | string | SankeyNode<N, L>;
  value: number;
  y0?: number;
  y1?: number;
  width?: number;
  index?: number;
}

type SankeyLinkMaximal<N extends object, L extends object> = Required<
  SankeyLinkMinimal<N, L>
>;

export type SankeyLink<N extends object, L extends object> = L &
  SankeyLinkMaximal<N, L>;

export interface SankeyGraphMinimal<N extends object, L extends object> {
  nodes: (N & SankeyNodeMinimal<N, L>)[];
  links: (L & SankeyLinkMinimal<N, L>)[];
}

export interface SankeyGraph<N extends object, L extends object> {
  nodes: SankeyNode<N, L>[];
  links: SankeyLink<N, L>[];
}

export interface SankeyLayout<Data, N extends object, L extends object> {
  (data: Data, ...args: unknown[]): SankeyGraph<N, L>;
  update(graph: SankeyGraph<N, L>): SankeyGraph<N, L>;
  nodes(): (data: Data, ...args: unknown[]) => SankeyNode<N, L>[];
  nodes(
    nodes:
      | SankeyNode<N, L>[]
      | ((data: Data, ...args: unknown[]) => SankeyNode<N, L>[]),
  ): this;
  links(): (data: Data, ...args: unknown[]) => SankeyLink<N, L>[];
  links(
    links:
      | SankeyLink<N, L>[]
      | ((data: Data, ...args: unknown[]) => SankeyLink<N, L>[]),
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

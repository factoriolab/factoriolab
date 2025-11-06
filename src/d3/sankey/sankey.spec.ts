import { Link, Node } from '~/models/flow';
import { Mocks } from '~/tests';

import { sankeyJustify } from './align';
import { SankeyLink, SankeyNode } from './models';
import {
  ascendingSourceBreadth,
  defaultId,
  defaultLinks,
  defaultNodes,
  find,
  sankey,
} from './sankey';

describe('ascendingSourceBreadth', () => {
  it('should fall back to difference in index values', () => {
    expect(
      ascendingSourceBreadth(
        { source: { y0: 1 }, target: {}, value: 1, index: 2 } as any,
        { source: { y0: 1 }, target: {}, value: 1, index: 3 },
      ),
    ).toEqual(-1);
  });
});

describe('defaultId', () => {
  it('should default to index value', () => {
    expect(defaultId({ index: 1 } as any)).toEqual(1);
  });
});

describe('defaultNodes', () => {
  it('should default to graph nodes', () => {
    expect(defaultNodes({ nodes: [], links: [] })).toEqual([]);
  });
});

describe('defaultLinks', () => {
  it('should default to graph links', () => {
    expect(defaultLinks({ nodes: [], links: [] })).toEqual([]);
  });
});

describe('find', () => {
  it('should throw on failing to find a node', () => {
    expect(() =>
      find(new Map<string, SankeyNode<object, object>>(), 'id'),
    ).toThrowError('missing: id');
  });
});

describe('sankey', () => {
  let fn = sankey();

  beforeEach(() => {
    fn = sankey();
  });

  it('should create', () => {
    expect(fn).toBeTruthy();
  });

  describe('nodeId', () => {
    it('should return existing nodeId function', () => {
      expect(fn.nodeId()).toEqual(defaultId);
    });
  });

  describe('nodeAlign', () => {
    it('should return existing nodeAlign function', () => {
      expect(fn.nodeAlign()).toEqual(sankeyJustify);
    });
  });

  describe('nodeSort', () => {
    it('should return existing nodeSort function', () => {
      const sort = (
        _a: SankeyNode<object, object>,
        _b: SankeyNode<object, object>,
      ): number => 1;
      expect(fn.nodeSort(sort)).toEqual(fn);
      expect(fn.nodeSort()).toEqual(sort);
    });
  });

  describe('nodeWidth', () => {
    it('should return existing node width', () => {
      expect(fn.nodeWidth()).toEqual(24);
    });
  });

  describe('nodePadding', () => {
    it('should return existing node padding', () => {
      expect(fn.nodePadding(12)).toEqual(fn);
      expect(fn.nodePadding()).toEqual(12);
    });
  });

  describe('nodes', () => {
    it('should return existing nodes', () => {
      expect(fn.nodes(() => [])).toEqual(fn);
      expect(fn.nodes([])).toEqual(fn);
      expect(fn.nodes()({ nodes: [], links: [] })).toEqual([]);
    });
  });

  describe('links', () => {
    it('should return existing links', () => {
      expect(fn.links(() => [])).toEqual(fn);
      expect(fn.links([])).toEqual(fn);
      expect(fn.links()({ nodes: [], links: [] })).toEqual([]);
    });
  });

  describe('linkSort', () => {
    it('should return existing linkSort function', () => {
      const sort = (
        _a: SankeyLink<object, object>,
        _b: SankeyLink<object, object>,
      ): number => 1;
      expect(fn.linkSort(sort)).toEqual(fn);
      expect(fn.linkSort()).toEqual(sort);
    });
  });

  describe('size', () => {
    it('should return existing size', () => {
      expect(fn.size([5, 5])).toEqual(fn);
      expect(fn.size()).toEqual([5, 5]);
    });
  });

  describe('extent', () => {
    it('should return existing extent', () => {
      expect(
        fn.extent([
          [0, 1],
          [2, 3],
        ]),
      ).toEqual(fn);
      expect(fn.extent()).toEqual([
        [0, 1],
        [2, 3],
      ]);
    });
  });

  describe('iterations', () => {
    it('should return existing iterations', () => {
      expect(fn.iterations(1)).toEqual(fn);
      expect(fn.iterations()).toEqual(1);
    });
  });

  describe('computeNodeLayers', () => {
    it('should use node sort function', () => {
      let i = 0;
      const sort = (
        _a: SankeyNode<object, object>,
        _b: SankeyNode<object, object>,
      ): number => {
        i++;
        return i;
      };

      fn.nodeId((d) => (d as SankeyNode<Node, Link>).id).nodeSort(sort);
      fn(Mocks.getFlow());
      expect(i).toBeGreaterThan(0);
    });
  });
});

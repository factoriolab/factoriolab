import { boxEdgeLine, getIntersect, getOffset } from './box-line-edge';

describe('boxEdgeLine', () => {
  it('should handle forceLtr', () => {
    expect(
      boxEdgeLine(
        0,
        true,
      )({
        width: 10,
        sourceNode: { id: 'source', x: 2 },
        targetNode: { id: 'target', x: 1 },
      } as any),
    ).toEqual('M0,0L3,0');
  });
});

describe('getOffset', () => {
  it('should return the intersect if m === 0', () => {
    expect(getOffset([0, 0], [0, 0], 0)).toEqual([0, 0]);
  });
});

describe('getIntersect', () => {
  it('should handle vx === 0', () => {
    expect(getIntersect([0, 0], [0, 0], {} as any)).toEqual([0, 1]);
  });

  it('should tx > ty', () => {
    expect(getIntersect([0, 0], [5, 1], {} as any)).toEqual([10, 2]);
  });
});

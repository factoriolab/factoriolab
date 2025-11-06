import { sankeyCenter, sankeyJustify, sankeyLeft, sankeyRight } from './align';

describe('sankeyLeft', () => {
  it('should return the node depth', () => {
    expect(sankeyLeft({ depth: 1 } as any)).toEqual(1);
  });
});

describe('sankeyRight', () => {
  it('should subtract from passed maximum value', () => {
    expect(sankeyRight({ height: 1 } as any, 5)).toEqual(3);
  });
});

describe('sankeyJustify', () => {
  it('should compute justified column', () => {
    expect(sankeyJustify({} as any, 5)).toEqual(4);
    expect(
      sankeyJustify(
        {
          depth: 1,
          sourceLinks: [{ source: 'a', target: 'b', value: 1 }],
        } as any,
        5,
      ),
    ).toEqual(1);
  });
});

describe('sankeyCenter', () => {
  it('should compute the centered column', () => {
    expect(
      sankeyCenter({
        depth: 1,
        targetLinks: [{ source: { depth: 2 }, target: { depth: 3 }, value: 1 }],
      } as any),
    ).toEqual(1);
    expect(
      sankeyCenter({
        depth: 1,
        sourceLinks: [{ source: { depth: 2 }, target: { depth: 3 }, value: 1 }],
      } as any),
    ).toEqual(2);
    expect(sankeyCenter({ depth: 1 } as any)).toEqual(0);
  });
});

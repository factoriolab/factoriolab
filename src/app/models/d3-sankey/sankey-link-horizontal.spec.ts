import { BumpSankeyLoop } from './sankey-link-horizontal';

describe('BumpSankeyLoop', () => {
  it('should create', () => {
    const result = new BumpSankeyLoop({} as any, true, 0, 0, 0, 0);
    expect(result).toBeTruthy();
  });
});

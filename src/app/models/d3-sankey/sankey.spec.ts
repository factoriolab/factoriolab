import { sankey } from './sankey';

describe('sankey', () => {
  it('should build a sankey function', () => {
    const result = sankey();
    expect(result).toBeTruthy();
  });
});

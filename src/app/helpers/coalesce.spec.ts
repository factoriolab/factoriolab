import { coalesce } from './coalesce';

describe('coalesce', () => {
  it('should fall back when nullish', () => {
    expect(coalesce(1, 0)).toEqual(1);
    expect(coalesce(null, 0)).toEqual(0);
  });
});

import { Quality, qualityId } from './quality';

describe('qualityId', () => {
  it('should return unaltered id for standard quality', () => {
    expect(qualityId('id', Quality.Normal)).toEqual('id');
  });

  it('should include the quality value in parens', () => {
    expect(qualityId('id', Quality.Legendary)).toEqual('id(5)');
  });
});

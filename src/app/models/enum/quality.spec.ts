import { baseId, Quality, qualityId } from './quality';

describe('baseId', () => {
  it('should convert an id to its base id without quality', () => {
    expect(baseId('id')).toEqual('id');
    expect(baseId('id(5)')).toEqual('id');
  });
});

describe('qualityId', () => {
  it('should return unaltered id for standard quality', () => {
    expect(qualityId('id', Quality.Normal)).toEqual('id');
  });

  it('should include the quality value in parens', () => {
    expect(qualityId('id', Quality.Legendary)).toEqual('id(5)');
  });
});

import { Quality, qualityId } from './quality';

describe('qualityId', () => {
  it('should include the quality value in parens', () => {
    expect(qualityId('id', Quality.Legendary)).toEqual('id(5)');
  });
});

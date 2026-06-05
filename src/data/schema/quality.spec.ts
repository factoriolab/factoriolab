import {
  mockNormalQualityJson,
  mockUncommonQualityJson,
} from '~/tests/mocks/quality';

import { qualityId } from './quality';

describe('qualityId', () => {
  it('should return unaltered id for standard quality', () => {
    expect(qualityId('id', mockNormalQualityJson)).toEqual('id');
  });

  it('should include the quality value in parens', () => {
    expect(qualityId('id', mockUncommonQualityJson)).toEqual('id(1)');
  });
});

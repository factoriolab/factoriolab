import { asString } from './coercion';

describe('asString', () => {
  it('should handle various types', () => {
    expect(asString(undefined)).toEqual('');
    expect(asString('string')).toEqual('string');
    expect(asString(['string'])).toEqual('string');
  });
});

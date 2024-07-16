import { contains } from './contains';

describe('contains', () => {
  it('should determine whether an entities object contains a specific object value', () => {
    expect(contains({ a: 0 }, 0)).toBeTrue();
    expect(contains({ a: 0 }, 1)).toBeFalse();
  });
});

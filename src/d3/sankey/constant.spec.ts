import { constant } from './constant';

describe('constant', () => {
  it('should return a function that returns the constant value', () => {
    const fn = constant(1);
    expect(fn()).toEqual(1);
  });
});

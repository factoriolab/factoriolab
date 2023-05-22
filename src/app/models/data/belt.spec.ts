import { Rational } from '../rational';
import { RationalBelt } from './belt';

describe('RationalBelt', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new RationalBelt({ speed: 2 });
      expect(result.speed).toEqual(Rational.two);
    });
  });
});

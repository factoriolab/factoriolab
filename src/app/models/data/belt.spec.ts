import { Rational } from '../rational';
import { BeltRational } from './belt';

describe('BeltRational', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new BeltRational({ speed: 2 });
      expect(result.speed).toEqual(Rational.two);
    });
  });
});

import { Rational } from '../rational';
import { BeltRtl } from './belt';

describe('BeltRtl', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new BeltRtl({ speed: 2 });
      expect(result.speed).toEqual(Rational.two);
    });
  });
});

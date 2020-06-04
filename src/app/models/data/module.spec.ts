import { Rational } from '../rational';
import { RationalModule } from './module';

describe('RationalModule', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new RationalModule({
        speed: 1,
        productivity: 2,
        energy: 3,
      });
      expect(result.speed).toEqual(Rational.one);
      expect(result.productivity).toEqual(Rational.two);
      expect(result.energy).toEqual(new Rational(BigInt(3)));
    });
  });
});

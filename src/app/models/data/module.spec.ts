import { Rational } from '../rational';
import { RationalModule } from './module';

describe('RationalModule', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new RationalModule({
        speed: 1,
        productivity: 2,
        consumption: 3,
        pollution: 4,
        limitation: 'productivity-module',
      });
      expect(result.speed).toEqual(Rational.one);
      expect(result.productivity).toEqual(Rational.two);
      expect(result.consumption).toEqual(new Rational(BigInt(3)));
      expect(result.pollution).toEqual(new Rational(BigInt(4)));
      expect(result.limitation).toEqual('productivity-module');
    });

    it('should ignore undefined fields', () => {
      const result = new RationalModule({});
      expect(result.speed).toBeUndefined();
      expect(result.productivity).toBeUndefined();
      expect(result.consumption).toBeUndefined();
      expect(result.pollution).toBeUndefined();
      expect(result.limitation).toBeUndefined();
    });
  });
});

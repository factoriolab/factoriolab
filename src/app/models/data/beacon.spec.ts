import { EnergyType } from '../enum';
import { Rational } from '../rational';
import { BeaconRational } from './beacon';

describe('BeaconRational', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new BeaconRational({
        effectivity: 0.5,
        modules: 2,
        range: 3,
        type: EnergyType.Electric,
        usage: 1,
        disallowedEffects: ['productivity'],
      });
      expect(result.effectivity).toEqual(new Rational(BigInt(1), BigInt(2)));
      expect(result.modules).toEqual(2);
      expect(result.range).toEqual(3);
      expect(result.type).toEqual(EnergyType.Electric);
      expect(result.usage).toEqual(Rational.one);
      expect(result.disallowedEffects).toEqual(['productivity']);
    });

    it('should ignore undefined fields', () => {
      const result = new BeaconRational({
        effectivity: 0.5,
        modules: 2,
        range: 3,
        type: EnergyType.Electric as EnergyType.Electric,
        usage: 1,
      });
      expect(result.effectivity).toEqual(new Rational(BigInt(1), BigInt(2)));
      expect(result.modules).toEqual(2);
      expect(result.range).toEqual(3);
      expect(result.type).toEqual(EnergyType.Electric);
      expect(result.usage).toEqual(Rational.one);
      expect(result.disallowedEffects).toBeUndefined();
    });
  });
});

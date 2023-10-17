import { ItemId } from 'src/tests';
import { EnergyType, FuelType } from '../enum';
import { Rational } from '../rational';
import { MachineRational } from './machine';

describe('MachineRational', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new MachineRational({
        speed: 1,
        modules: 2,
        type: EnergyType.Burner,
        fuelCategories: [FuelType.Chemical],
        usage: 3,
        drain: 5,
        pollution: 4,
        // mining: true,
        // research: true,
        consumption: {
          [ItemId.Coal]: 1,
        },
        disallowedEffects: ['productivity'],
        size: [3, 3],
      });
      expect(result.speed).toEqual(Rational.one);
      expect(result.modules).toEqual(2);
      expect(result.type).toEqual(EnergyType.Burner);
      expect(result.fuelCategories).toEqual([FuelType.Chemical]);
      expect(result.usage).toEqual(Rational.from(3));
      expect(result.drain).toEqual(Rational.from(5));
      expect(result.pollution).toEqual(Rational.from(4));
      expect(result.consumption).toEqual({ [ItemId.Coal]: Rational.one });
      expect(result.disallowedEffects).toEqual(['productivity']);
      expect(result.size).toEqual([3, 3]);
    });

    it('should handle string for drain', () => {
      const result = new MachineRational({
        speed: 1,
        modules: 2,
        type: EnergyType.Electric,
        drain: '60/30',
      });
      expect(result.drain).toEqual(Rational.two);
    });

    it('should ignore undefined fields', () => {
      const result = new MachineRational({
        speed: 1,
        modules: 2,
      });
      expect(result.speed).toEqual(Rational.one);
      expect(result.modules).toEqual(2);
      expect(result.type).toBeUndefined();
      expect(result.fuelCategories).toBeUndefined();
      expect(result.usage).toBeUndefined();
      expect(result.drain).toBeUndefined();
      expect(result.pollution).toBeUndefined();
      expect(result.consumption).toBeUndefined();
      expect(result.size).toBeUndefined();
    });
  });
});

import { ItemId } from 'src/tests';
import { Rational } from '../rational';
import { RationalRecipeSettings } from './recipe-settings';

describe('RationalRecipeSettings', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new RationalRecipeSettings({
        factory: ItemId.AssemblingMachine1,
        factoryModules: [],
        beaconCount: '2',
        beacon: ItemId.Beacon,
        beaconModules: [],
        beaconTotal: '8',
        overclock: 200,
        cost: '100',
      });
      expect(result.factory).toEqual(ItemId.AssemblingMachine1);
      expect(result.factoryModules).toEqual([]);
      expect(result.beaconCount).toEqual(Rational.from(2));
      expect(result.beacon).toEqual(ItemId.Beacon);
      expect(result.beaconModules).toEqual([]);
      expect(result.beaconTotal).toEqual(Rational.from(8));
      expect(result.overclock).toEqual(Rational.from(200));
      expect(result.cost).toEqual(Rational.hundred);
    });

    it('should ignore undefined fields', () => {
      const result = new RationalRecipeSettings({});
      expect(result.factory).toBeUndefined();
      expect(result.factoryModules).toBeUndefined();
      expect(result.beaconCount).toBeUndefined();
      expect(result.beacon).toBeUndefined();
      expect(result.beaconModules).toBeUndefined();
      expect(result.beaconTotal).toBeUndefined();
      expect(result.overclock).toBeUndefined();
      expect(result.cost).toBeUndefined();
    });
  });
});

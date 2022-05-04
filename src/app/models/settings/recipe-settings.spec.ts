import { ItemId } from 'src/tests';
import { Rational } from '../rational';
import { RationalRecipeSettings } from './recipe-settings';

describe('RationalRecipeSettings', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new RationalRecipeSettings({
        factoryId: ItemId.AssemblingMachine1,
        factoryModuleIds: [],
        beaconCount: '2',
        beaconId: ItemId.Beacon,
        beaconModuleIds: [],
        beaconTotal: '8',
        overclock: 200,
        cost: '100',
      });
      expect(result.factoryId).toEqual(ItemId.AssemblingMachine1);
      expect(result.factoryModuleIds).toEqual([]);
      expect(result.beaconCount).toEqual(Rational.from(2));
      expect(result.beaconId).toEqual(ItemId.Beacon);
      expect(result.beaconModuleIds).toEqual([]);
      expect(result.beaconTotal).toEqual(Rational.from(8));
      expect(result.overclock).toEqual(Rational.from(200));
      expect(result.cost).toEqual(Rational.hundred);
    });

    it('should ignore undefined fields', () => {
      const result = new RationalRecipeSettings({});
      expect(result.factoryId).toBeUndefined();
      expect(result.factoryModuleIds).toBeUndefined();
      expect(result.beaconCount).toBeUndefined();
      expect(result.beaconId).toBeUndefined();
      expect(result.beaconModuleIds).toBeUndefined();
      expect(result.beaconTotal).toBeUndefined();
      expect(result.overclock).toBeUndefined();
      expect(result.cost).toBeUndefined();
    });
  });
});

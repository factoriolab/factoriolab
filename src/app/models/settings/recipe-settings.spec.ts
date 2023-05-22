import { ItemId } from 'src/tests';
import { Rational } from '../rational';
import { RationalRecipeSettings } from './recipe-settings';

describe('RationalRecipeSettings', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new RationalRecipeSettings({
        factoryId: ItemId.AssemblingMachine1,
        factoryModuleIds: [],
        beacons: [],
        overclock: 200,
        cost: '100',
        checked: true,
      });
      expect(result.factoryId).toEqual(ItemId.AssemblingMachine1);
      expect(result.factoryModuleIds).toEqual([]);
      expect(result.beacons).toEqual([]);
      expect(result.overclock).toEqual(Rational.from(200));
      expect(result.cost).toEqual(Rational.hundred);
      expect(result.checked).toBeTrue();
    });

    it('should ignore undefined fields', () => {
      const result = new RationalRecipeSettings({});
      expect(result.factoryId).toBeUndefined();
      expect(result.factoryModuleIds).toBeUndefined();
      expect(result.beacons).toBeUndefined();
      expect(result.overclock).toBeUndefined();
      expect(result.cost).toBeUndefined();
    });
  });
});

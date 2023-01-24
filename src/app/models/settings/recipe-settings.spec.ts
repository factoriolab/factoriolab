import { ItemId } from 'src/tests';
import { Rational } from '../rational';
import { RationalRecipeSettings } from './recipe-settings';

describe('RationalRecipeSettings', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new RationalRecipeSettings({
        factoryId: ItemId.AssemblingMachine1,
        factoryModuleIds: [],
        beacons: [{ count: '2', id: ItemId.Beacon, moduleIds: [], total: '8' }],
        overclock: 200,
        cost: '100',
      });
      expect(result.factoryId).toEqual(ItemId.AssemblingMachine1);
      expect(result.factoryModuleIds).toEqual([]);
      expect(result.beacons).toEqual([
        {
          count: Rational.from(2),
          id: ItemId.Beacon,
          moduleIds: [],
          total: Rational.from(8),
        },
      ]);
      expect(result.overclock).toEqual(Rational.from(200));
      expect(result.cost).toEqual(Rational.hundred);
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

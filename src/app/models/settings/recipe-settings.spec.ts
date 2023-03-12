import { ItemId } from 'src/tests';
import { Rational } from '../rational';
import { RecipeSettingsRational } from './recipe-settings';

describe('RecipeRationalSettings', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new RecipeSettingsRational({
        machineId: ItemId.AssemblingMachine1,
        machineModuleIds: [],
        beacons: [],
        overclock: 200,
        cost: '100',
        checked: true,
      });
      expect(result.machineId).toEqual(ItemId.AssemblingMachine1);
      expect(result.machineModuleIds).toEqual([]);
      expect(result.beacons).toEqual([]);
      expect(result.overclock).toEqual(Rational.from(200));
      expect(result.cost).toEqual(Rational.hundred);
      expect(result.checked).toBeTrue();
    });

    it('should ignore undefined fields', () => {
      const result = new RecipeSettingsRational({});
      expect(result.machineId).toBeUndefined();
      expect(result.machineModuleIds).toBeUndefined();
      expect(result.beacons).toBeUndefined();
      expect(result.overclock).toBeUndefined();
      expect(result.cost).toBeUndefined();
    });
  });
});

import { ItemId, Mocks, RecipeId } from 'src/tests';
import { RationalProducer } from './producer';
import { Rational } from './rational';

describe('RationalProducer', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new RationalProducer(
        {
          id: '1',
          recipeId: RecipeId.IronPlate,
          count: '2',
          factoryId: ItemId.AssemblingMachine1,
          factoryModuleIds: [],
          factoryModuleOptions: [],
          beaconCount: '2',
          beaconId: ItemId.Beacon,
          beaconModuleIds: [],
          beaconModuleOptions: [],
          overclock: 200,
        },
        Mocks.Dataset.recipeR[RecipeId.IronPlate]
      );
      expect(result.id).toEqual('1');
      expect(result.recipeId).toEqual(RecipeId.IronPlate);
      expect(result.count).toEqual(Rational.two);
      expect(result.factoryId).toEqual(ItemId.AssemblingMachine1);
      expect(result.factoryModuleIds).toEqual([]);
      expect(result.factoryModuleOptions).toEqual([]);
      expect(result.beaconCount).toEqual(Rational.two);
      expect(result.beaconId).toEqual(ItemId.Beacon);
      expect(result.beaconModuleIds).toEqual([]);
      expect(result.beaconModuleOptions).toEqual([]);
      expect(result.overclock).toEqual(Rational.from(200));
    });

    it('should ignore undefined fields', () => {
      const result = new RationalProducer(
        {
          id: '1',
          recipeId: RecipeId.IronPlate,
          count: '2',
        },
        Mocks.Dataset.recipeR[RecipeId.IronPlate]
      );
      expect(result.id).toEqual('1');
      expect(result.recipeId).toEqual(RecipeId.IronPlate);
      expect(result.count).toEqual(Rational.two);
      expect(result.factoryId).toBeUndefined();
      expect(result.factoryModuleIds).toBeUndefined();
      expect(result.factoryModuleOptions).toBeUndefined();
      expect(result.beaconCount).toBeUndefined();
      expect(result.beaconId).toBeUndefined();
      expect(result.beaconModuleIds).toBeUndefined();
      expect(result.beaconModuleOptions).toBeUndefined();
      expect(result.overclock).toBeUndefined();
    });
  });
});

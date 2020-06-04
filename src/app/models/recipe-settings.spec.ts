import { ItemId } from './data/item';
import { Rational } from './rational';
import { RationalRecipeSettings } from './recipe-settings';

describe('RationalRecipeSettings', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new RationalRecipeSettings({
        ignore: true,
        belt: ItemId.TransportBelt,
        factory: ItemId.AssemblingMachine1,
        modules: [],
        beaconModule: ItemId.SpeedModule,
        beaconCount: 2,
      });
      expect(result.ignore).toEqual(true);
      expect(result.belt).toEqual(ItemId.TransportBelt);
      expect(result.factory).toEqual(ItemId.AssemblingMachine1);
      expect(result.modules).toEqual([]);
      expect(result.beaconModule).toEqual(ItemId.SpeedModule);
      expect(result.beaconCount).toEqual(new Rational(BigInt(2)));
    });

    it('should ignore undefined fields', () => {
      const result = new RationalRecipeSettings({});
      expect(result.ignore).toBeUndefined();
      expect(result.belt).toBeUndefined();
      expect(result.factory).toBeUndefined();
      expect(result.modules).toBeUndefined();
      expect(result.beaconModule).toBeUndefined();
      expect(result.beaconCount).toBeUndefined();
    });
  });
});

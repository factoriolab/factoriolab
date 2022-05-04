import { ItemId, RecipeId } from 'src/tests';
import { RateType } from './enum/rate-type';
import { RationalProduct } from './product';
import { Rational } from './rational';

describe('RationalProduct', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new RationalProduct({
        id: '1',
        itemId: ItemId.ArtilleryShellRange,
        rate: '2',
        rateType: RateType.Belts,
        viaId: RecipeId.AdvancedOilProcessing,
        viaSetting: ItemId.ArtilleryShellRange,
        viaFactoryModuleIds: [ItemId.ProductivityModule],
        viaBeaconCount: '1',
        viaBeaconId: ItemId.Beacon,
        viaBeaconModuleIds: [ItemId.SpeedModule],
        viaOverclock: 200,
      });
      expect(result.id).toEqual('1');
      expect(result.itemId).toEqual(ItemId.ArtilleryShellRange);
      expect(result.rate).toEqual(Rational.two);
      expect(result.rateType).toEqual(RateType.Belts);
      expect(result.viaId).toEqual(RecipeId.AdvancedOilProcessing);
      expect(result.viaSetting).toEqual(ItemId.ArtilleryShellRange);
      expect(result.viaFactoryModuleIds).toEqual([ItemId.ProductivityModule]);
      expect(result.viaBeaconCount).toEqual(Rational.one);
      expect(result.viaBeaconId).toEqual(ItemId.Beacon);
      expect(result.viaBeaconModuleIds).toEqual([ItemId.SpeedModule]);
      expect(result.viaOverclock).toEqual(Rational.from(200));
    });

    it('should ignore undefined fields', () => {
      const result = new RationalProduct({
        id: '1',
        itemId: ItemId.ArtilleryShellRange,
        rate: '2',
        rateType: RateType.Belts,
      });
      expect(result.id).toEqual('1');
      expect(result.itemId).toEqual(ItemId.ArtilleryShellRange);
      expect(result.rate).toEqual(Rational.two);
      expect(result.rateType).toEqual(RateType.Belts);
      expect(result.viaId).toBeUndefined();
      expect(result.viaSetting).toBeUndefined();
      expect(result.viaFactoryModuleIds).toBeUndefined();
      expect(result.viaBeaconCount).toBeUndefined();
      expect(result.viaBeaconId).toBeUndefined();
      expect(result.viaBeaconModuleIds).toBeUndefined();
      expect(result.viaOverclock).toBeUndefined();
    });
  });
});

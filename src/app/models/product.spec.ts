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
        rate: 2,
        rateType: RateType.Belts,
        viaId: RecipeId.AdvancedOilProcessing,
      });
      expect(result.id).toEqual('1');
      expect(result.itemId).toEqual(ItemId.ArtilleryShellRange);
      expect(result.rate).toEqual(Rational.two);
      expect(result.rateType).toEqual(RateType.Belts);
      expect(result.viaId).toEqual(RecipeId.AdvancedOilProcessing);
    });

    it('should ignore undefined fields', () => {
      const result = new RationalProduct({
        id: '1',
        itemId: ItemId.ArtilleryShellRange,
        rate: 2,
        rateType: RateType.Belts,
      });
      expect(result.id).toEqual('1');
      expect(result.itemId).toEqual(ItemId.ArtilleryShellRange);
      expect(result.rate).toEqual(Rational.two);
      expect(result.rateType).toEqual(RateType.Belts);
      expect(result.viaId).toBeUndefined();
    });
  });
});

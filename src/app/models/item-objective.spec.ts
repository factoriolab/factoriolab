import { ItemId } from 'src/tests';
import { ItemRtlObj } from './item-objective';
import { Rational } from './rational';

describe('ItemRtlObj', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new ItemRtlObj({
        id: '1',
        itemId: ItemId.ArtilleryShellRange,
        rate: '2',
        rateType: 'belts',
      });
      expect(result.id).toEqual('1');
      expect(result.itemId).toEqual(ItemId.ArtilleryShellRange);
      expect(result.rate).toEqual(Rational.two);
      expect(result.rateType).toEqual('belts');
    });
  });
});

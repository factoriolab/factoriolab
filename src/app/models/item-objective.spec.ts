import { ItemId } from 'src/tests';
import { RationalItemObjective } from './item-objective';
import { Rational } from './rational';

describe('RationalItemObjective', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new RationalItemObjective({
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

import { ItemId } from 'src/tests';
import { ObjectiveType, RateUnit } from './enum';
import { ItemObjectiveRational } from './item-objective';
import { Rational } from './rational';

describe('ItemObjectiveRational', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new ItemObjectiveRational({
        id: '1',
        itemId: ItemId.ArtilleryShellRange,
        rate: '2',
        rateUnit: RateUnit.Belts,
        type: ObjectiveType.Output,
      });
      expect(result.id).toEqual('1');
      expect(result.itemId).toEqual(ItemId.ArtilleryShellRange);
      expect(result.rate).toEqual(Rational.two);
      expect(result.rateUnit).toEqual(RateUnit.Belts);
      expect(result.type).toEqual(ObjectiveType.Output);
    });
  });
});

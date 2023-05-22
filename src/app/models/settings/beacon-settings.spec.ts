import { ItemId } from 'src/tests';
import { Rational } from '../rational';
import { BeaconRationalSettings } from './beacon-settings';

describe('BeaconRationalSettings', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new BeaconRationalSettings({
        count: '2',
        id: ItemId.Beacon,
        moduleIds: [ItemId.SpeedModule, ItemId.SpeedModule],
        moduleOptions: [],
        total: '8',
      });
      expect(result.count).toEqual(Rational.two);
      expect(result.id).toEqual(ItemId.Beacon);
      expect(result.moduleIds).toEqual([
        ItemId.SpeedModule,
        ItemId.SpeedModule,
      ]);
      expect(result.moduleOptions).toEqual([]);
      expect(result.total).toEqual(Rational.from(8));
    });

    it('should ignore undefined fields', () => {
      const result = new BeaconRationalSettings({});
      expect(result.count).toBeUndefined();
      expect(result.id).toBeUndefined();
      expect(result.moduleIds).toBeUndefined();
      expect(result.moduleOptions).toBeUndefined();
      expect(result.total).toBeUndefined();
    });
  });
});

import { ItemId } from 'src/tests';
import { Rational } from '../rational';
import { BeaconSettingsRational } from './beacon-settings';

describe('BeaconRationalSettings', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new BeaconSettingsRational({
        count: '2',
        id: ItemId.Beacon,
        modules: [ItemId.SpeedModule, ItemId.SpeedModule],
        moduleOptions: [],
        total: '8',
      });
      expect(result.count).toEqual(Rational.two);
      expect(result.id).toEqual(ItemId.Beacon);
      expect(result.modules).toEqual([ItemId.SpeedModule, ItemId.SpeedModule]);
      expect(result.moduleOptions).toEqual([]);
      expect(result.total).toEqual(Rational.from(8));
    });

    it('should ignore undefined fields', () => {
      const result = new BeaconSettingsRational({});
      expect(result.count).toBeUndefined();
      expect(result.id).toBeUndefined();
      expect(result.modules).toBeUndefined();
      expect(result.moduleOptions).toBeUndefined();
      expect(result.total).toBeUndefined();
    });
  });
});

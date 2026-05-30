import { ItemId } from '~/tests/item-id';
import { mockModData } from '~/tests/mocks/data';
import { spread } from '~/utils/object';

import { parseBeacon } from './beacon';

describe('parseBeacon', () => {
  it('should handle a beacon without a profile', () => {
    const item = mockModData.items.find((i) => i.id === ItemId.Beacon)!;
    const beacon = spread(item.beacon!, { profile: undefined });
    const result = parseBeacon(beacon);
    expect(result.profile).toBeUndefined();
  });
});

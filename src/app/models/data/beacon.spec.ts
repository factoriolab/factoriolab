import { spread } from '~/helpers';
import { ItemId, Mocks } from '~/tests';

import { rational } from '../rational';
import { parseBeacon } from './beacon';

describe('parseBeacon', () => {
  it('should parse beacon profile', () => {
    const item = Mocks.mod.items.find((i) => i.id === ItemId.Beacon)!;
    const beacon = spread(item.beacon!, { profile: [0.5] });
    const result = parseBeacon(beacon);
    expect(result.profile).toEqual([rational(1n, 2n)]);
  });
});

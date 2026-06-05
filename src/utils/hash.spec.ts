import { mockModData } from '~/tests/mocks/data';

import {
  addIfMissing,
  emptyModHash,
  emptyModHashSet,
  updateHash,
} from './hash';

describe('addIfMissing', () => {
  it('should fill in null gaps', () => {
    const hash = emptyModHash();
    hash.items.push('a', null, 'c');
    addIfMissing(hash, emptyModHashSet(), 'items', 'b');
    expect(hash.items).toEqual(['a', 'b', 'c']);
  });
});

describe('updateHash', () => {
  it('should update hash including quality items', () => {
    const data = {
      ...mockModData,
      qualities: [
        { id: 'normal', name: 'Normal', level: 0 },
        { id: 'uncommon', name: 'Uncommon', level: 1 },
      ],
    };
    const hash = emptyModHash();
    hash.items.push('nonsense');
    updateHash(data, hash);
    expect(hash.items.length).toBeGreaterThan(data.items.length);
    expect(hash.recipes.length).toBeGreaterThan(data.recipes.length);
    expect(hash.items[0]).toBeNull();
  });
});

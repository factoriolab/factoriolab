import { rational } from '~/rational/rational';

import { parseTechnology } from './technology';

describe('parseTechnology', () => {
  it('should handle a technology with a recipe productivity bonus', () => {
    const result = parseTechnology({
      recipeProductivity: [{ id: 'id', value: 1 }],
    });
    expect(result.recipeProductivity).toEqual([
      { id: 'id', value: rational.one },
    ]);
  });
});

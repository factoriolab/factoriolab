import { Mocks } from 'src/tests';
import * as Selectors from './datasets.selectors';

describe('Dataset Selectors', () => {
  describe('getMods', () => {
    it('should handle null/empty values', () => {
      const result = Selectors.getMods.projector([], {});
      expect(result).toEqual([]);
    });

    it('should map ids to entities', () => {
      const result = Selectors.getMods.projector(['a'], { a: Mocks.Base });
      expect(result).toEqual([Mocks.Base]);
    });
  });
});

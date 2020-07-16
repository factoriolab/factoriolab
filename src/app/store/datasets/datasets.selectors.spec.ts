import { Mocks } from 'src/tests';
import * as Selectors from './datasets.selectors';

describe('Dataset Selectors', () => {
  describe('getMods', () => {
    it('should handle null/empty values', () => {
      const result = Selectors.getMods.projector([], {});
      expect(result).toEqual([]);
    });

    it('should map ids to entities', () => {
      const mod = Mocks.DataState.modEntities[Mocks.DataState.modIds[0]];
      const result = Selectors.getMods.projector(['a'], { a: mod });
      expect(result).toEqual([mod]);
    });
  });
});

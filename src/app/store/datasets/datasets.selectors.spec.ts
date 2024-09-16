import { Mocks } from '~/tests';

import { initialDatasetsState } from './datasets.reducer';
import {
  selectDataEntities,
  selectHashEntities,
  selectI18nEntities,
  selectModEntities,
} from './datasets.selectors';

describe('Datasets Selectors', () => {
  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(selectDataEntities.projector(initialDatasetsState)).toEqual(
        initialDatasetsState.data,
      );
      expect(selectI18nEntities.projector(initialDatasetsState)).toEqual(
        initialDatasetsState.i18n,
      );
      expect(selectHashEntities.projector(initialDatasetsState)).toEqual(
        initialDatasetsState.hash,
      );
    });
  });

  describe('selectModEntities', () => {
    it('should convert mod list to entities', () => {
      const result = selectModEntities.projector({
        [Mocks.mod.id]: Mocks.modData,
      });
      expect(result[Mocks.mod.id]).toEqual(Mocks.mod);
    });
  });
});

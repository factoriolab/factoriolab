import { data } from 'src/data';
import { Mocks } from 'src/tests';
import { initialDatasetsState } from './datasets.reducer';
import * as Selectors from './datasets.selectors';

describe('Datasets Selectors', () => {
  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(Selectors.getAppData.projector(initialDatasetsState)).toEqual(
        initialDatasetsState.app
      );
      expect(Selectors.getDataEntities.projector(initialDatasetsState)).toEqual(
        initialDatasetsState.dataEntities
      );
      expect(Selectors.getI18nEntities.projector(initialDatasetsState)).toEqual(
        initialDatasetsState.i18nEntities
      );
      expect(Selectors.getHashEntities.projector(initialDatasetsState)).toEqual(
        initialDatasetsState.hashEntities
      );
    });
  });

  describe('getModEntities', () => {
    it('should convert mod list to entities', () => {
      const result = Selectors.getModEntities.projector(data.mods, {
        [Mocks.Mod.id]: Mocks.Data,
      });
      expect(result[Mocks.Mod.id]).toEqual(Mocks.Mod);
    });
  });
});

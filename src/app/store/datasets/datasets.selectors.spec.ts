import { data } from 'src/data';
import { Mocks } from 'src/tests';
import { initialDatasetsState } from './datasets.reducer';
import * as Selectors from './datasets.selectors';

describe('Datasets Selectors', () => {
  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(Selectors.getDataRecord.projector(initialDatasetsState)).toEqual(
        initialDatasetsState.dataRecord,
      );
      expect(Selectors.getI18nRecord.projector(initialDatasetsState)).toEqual(
        initialDatasetsState.i18nRecord,
      );
      expect(Selectors.getHashRecord.projector(initialDatasetsState)).toEqual(
        initialDatasetsState.hashRecord,
      );
    });
  });

  describe('getModEntities', () => {
    it('should convert mod list to entities', () => {
      const result = Selectors.getModRecord.projector(data.mods, {
        [Mocks.Mod.id]: Mocks.Data,
      });
      expect(result[Mocks.Mod.id]).toEqual(Mocks.Mod);
    });
  });
});

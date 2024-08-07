import { Mocks } from 'src/tests';
import { initialState } from './datasets.reducer';
import * as Selectors from './datasets.selectors';

describe('Datasets Selectors', () => {
  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(Selectors.selectData.projector(initialState)).toEqual(
        initialState.data,
      );
      expect(Selectors.selectI18n.projector(initialState)).toEqual(
        initialState.i18n,
      );
      expect(Selectors.selectHash.projector(initialState)).toEqual(
        initialState.hash,
      );
    });
  });

  describe('selectModEntities', () => {
    it('should convert mod list to entities', () => {
      const result = Selectors.selectModEntities.projector({
        [Mocks.Mod.id]: Mocks.Data,
      });
      expect(result[Mocks.Mod.id]).toEqual(Mocks.Mod);
    });
  });
});

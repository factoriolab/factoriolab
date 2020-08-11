import { data } from 'src/data';
import { Mocks } from 'src/tests';
import * as Selectors from './datasets.selectors';

describe('Dataset Selectors', () => {
  describe('getBaseEntities', () => {
    it('should convert base list to entities', () => {
      const result = Selectors.getBaseEntities.projector(data.base, {
        [Mocks.Base.id]: Mocks.BaseData,
      });
      expect(result[Mocks.Base.id]).toEqual(Mocks.Base);
    });

    it('should use null for data that is not loaded', () => {
      const result = Selectors.getBaseEntities.projector(data.base, {});
      expect(result[Mocks.Base.id]).toBeNull();
    });
  });

  describe('getModEntities', () => {
    it('should convert mod list to entities', () => {
      const result = Selectors.getModEntities.projector(data.base, {
        [Mocks.Base.id]: Mocks.BaseData,
      });
      expect(result[Mocks.Base.id]).toEqual(Mocks.Base);
    });

    it('should use null for data that is not loaded', () => {
      const result = Selectors.getModEntities.projector(data.base, {});
      expect(result[Mocks.Base.id]).toBeNull();
    });
  });
});

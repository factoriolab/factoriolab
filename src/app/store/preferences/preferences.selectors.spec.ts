import { Mocks } from 'src/tests';
import * as Selectors from './preferences.selectors';

describe('Preferences Selectors', () => {
  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(Selectors.getStates.projector(Mocks.PreferencesState)).toEqual(
        Mocks.PreferencesState.states
      );
    });

    it('should get bypass landing value', () => {
      expect(
        Selectors.getBypassLanding.projector(Mocks.PreferencesState)
      ).toEqual(false);
    });
  });

  describe('getSavedStates', () => {
    it('should map saved states to an array of id-only options', () => {
      const result = Selectors.getSavedStates.projector({ ['id']: 'url' });
      expect(result).toEqual([{ label: 'id', value: 'id' }]);
    });
  });
});

import { Mocks } from 'src/tests';
import * as Selectors from './preferences.selectors';

describe('Preferences Selectors', () => {
  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(Selectors.getStates.projector(Mocks.PreferencesState)).toEqual(
        Mocks.PreferencesState.states,
      );
      expect(Selectors.getLanguage.projector(Mocks.PreferencesState)).toEqual(
        'en',
      );
      expect(
        Selectors.getBypassLanding.projector(Mocks.PreferencesState),
      ).toEqual(false);
    });
  });
});

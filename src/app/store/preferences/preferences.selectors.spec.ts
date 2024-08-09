import { Mocks } from 'src/tests';
import * as Selectors from './preferences.selectors';

describe('Preferences Selectors', () => {
  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(Selectors.selectStates.projector(Mocks.PreferencesState)).toEqual(
        Mocks.PreferencesState.states,
      );
      expect(
        Selectors.selectLanguage.projector(Mocks.PreferencesState),
      ).toEqual('en');
      expect(
        Selectors.selectBypassLanding.projector(Mocks.PreferencesState),
      ).toEqual(false);
    });
  });
});

import { Mocks } from '~/tests';

import {
  selectBypassLanding,
  selectLanguage,
  selectStates,
} from './preferences.selectors';

describe('Preferences Selectors', () => {
  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(selectStates.projector(Mocks.preferencesState)).toEqual(
        Mocks.preferencesState.states,
      );
      expect(selectLanguage.projector(Mocks.preferencesState)).toEqual('en');
      expect(selectBypassLanding.projector(Mocks.preferencesState)).toEqual(
        false,
      );
    });
  });
});
